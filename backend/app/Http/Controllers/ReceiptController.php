<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use App\Services\AdministrationAi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class ReceiptController extends Controller
{
    public static function owned(Request $request)
    {
        return Receipt::where('user_id', $request->user()->id);
    }

    public function index(Request $request)
    {
        $filters = $request->validate([
            'search' => 'nullable|string|max:255', 'status' => 'nullable|in:uploaded,processing,review,confirmed,failed',
            'from' => 'nullable|date_format:Y-m-d', 'to' => 'nullable|date_format:Y-m-d|after_or_equal:from',
            'page' => 'nullable|integer|min:1',
        ]);
        $base = self::owned($request)
            ->when($filters['from'] ?? null, fn ($q, $v) => $q->whereDate('receipt_date', '>=', $v))
            ->when($filters['to'] ?? null, fn ($q, $v) => $q->whereDate('receipt_date', '<=', $v));
        $confirmed = (clone $base)->where('status', 'confirmed');
        $summary = [
            'count' => (clone $base)->count(),
            'pending' => (clone $base)->where('status', '!=', 'confirmed')->count(),
            'confirmed' => (clone $confirmed)->count(),
            'currencies' => (clone $confirmed)->selectRaw('currency, SUM(total_cents) AS total_cents, SUM(vat_cents) AS vat_cents, COUNT(*) AS count')->groupBy('currency')->get(),
            'categories' => (clone $confirmed)->where('currency', 'EUR')->selectRaw('category, SUM(total_cents) AS total_cents')->groupBy('category')->get(),
            'undated' => self::owned($request)->whereNull('receipt_date')->count(),
        ];
        $receipts = $base
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($filters['search'] ?? null, fn ($q, $v) => $q->where(function ($q) use ($v) {
                $q->where('vendor', 'like', '%'.$v.'%')->orWhere('original_name', 'like', '%'.$v.'%');
            }))->orderByDesc('id')->paginate(12);
        $upload_max_bytes = min(10 * 1024 * 1024, ini_parse_quantity(ini_get('upload_max_filesize')), max(0, ini_parse_quantity(ini_get('post_max_size')) - 65536));

        return response()->json(compact('receipts', 'summary', 'upload_max_bytes'));
    }

    public function store(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:jpg,jpeg,png,webp,pdf|max:10240']);
        $file = $request->file('file');
        $hash = hash_file('sha256', $file->getRealPath());
        $existing = self::owned($request)->where('sha256', $hash)->first();
        if ($existing) {
            return response()->json(['receipt' => $existing, 'duplicate' => true]);
        }
        $path = $file->store('receipts/'.$request->user()->id, 'local');
        if (! $path) {
            return response()->json(['message' => 'Het bestand kon niet worden opgeslagen.'], 503);
        }
        try {
            $receipt = new Receipt([
                'original_name' => mb_substr(basename($file->getClientOriginalName()), 0, 255),
                'path' => $path, 'mime' => $file->getMimeType(), 'sha256' => $hash, 'status' => 'uploaded',
            ]);
            $receipt->user_id = $request->user()->id;
            $receipt->save();
        } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
            Storage::disk('local')->delete($path);

            return response()->json(['receipt' => self::owned($request)->where('sha256', $hash)->firstOrFail(), 'duplicate' => true]);
        } catch (\Throwable $e) {
            Storage::disk('local')->delete($path);
            throw $e;
        }

        return response()->json(['receipt' => $receipt, 'duplicate' => false], 201);
    }

    public function extract(Request $request, int $receipt, AdministrationAi $ai)
    {
        set_time_limit(120);
        $record = self::owned($request)->findOrFail($receipt);
        $lock = Cache::lock('receipt:'.$record->id, 130);
        if (! $lock->get()) {
            return response()->json(['message' => 'Deze bon wordt al verwerkt. Probeer het straks opnieuw.'], 409);
        }
        try {
            if ($record->fresh()->status === 'confirmed') {
                return response()->json(['message' => 'Deze bon is al gecontroleerd. Je kunt de gegevens bewerken.'], 422);
            }
            $record->update(['status' => 'processing', 'error' => null]);
            try {
                $data = $ai->extract($record);
                $record->fill(collect($data)->except('warnings')->all());
                $record->fill(['status' => 'review', 'extraction' => $data, 'error' => null])->save();
            } catch (RuntimeException $e) {
                $record->update(['status' => 'failed', 'error' => $e->getMessage()]);

                return response()->json(['message' => $e->getMessage(), 'receipt' => $record->fresh()], 503);
            }

            return response()->json(['receipt' => $record->fresh()]);
        } finally {
            $lock->release();
        }
    }

    public function update(Request $request, int $receipt)
    {
        $record = self::owned($request)->findOrFail($receipt);
        $data = $request->validate([
            'vendor' => 'required|string|max:255', 'receipt_date' => 'required|date_format:Y-m-d|after_or_equal:1900-01-01|before_or_equal:2100-12-31',
            'currency' => 'required|regex:/^[A-Z]{3}$/', 'total_cents' => 'required|integer|between:-99999999999,99999999999',
            'vat_cents' => 'required|integer|between:-99999999999,99999999999',
            'category' => 'required|string|max:255', 'notes' => 'nullable|string|max:4000',
        ]);
        if (abs($data['vat_cents']) > abs($data['total_cents']) || ($data['total_cents'] < 0 && $data['vat_cents'] > 0) || ($data['total_cents'] >= 0 && $data['vat_cents'] < 0)) {
            throw ValidationException::withMessages(['vat_cents' => 'Controleer de btw: deze moet bij het totaalbedrag passen.']);
        }
        $lock = Cache::lock('receipt:'.$record->id, 130);
        if (! $lock->get()) {
            return response()->json(['message' => 'Wacht totdat het uitlezen klaar is.'], 409);
        }
        try {
            $record->fill($data)->fill(['status' => 'confirmed', 'confirmed_at' => now(), 'error' => null])->save();
        } finally {
            $lock->release();
        }

        return response()->json(['receipt' => $record->fresh()]);
    }

    public function file(Request $request, int $receipt)
    {
        $record = self::owned($request)->findOrFail($receipt);
        abort_unless(Storage::disk('local')->exists($record->path), 404);

        return Storage::disk('local')->download($record->path, $record->original_name, ['Content-Type' => $record->mime, 'X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'private, no-store']);
    }
}
