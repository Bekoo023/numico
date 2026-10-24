<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class ReceiptExportController extends Controller
{
    public function __invoke(Request $request)
    {
        $filters = $request->validate([
            'from' => 'nullable|date_format:Y-m-d',
            'to' => 'nullable|date_format:Y-m-d|after_or_equal:from',
        ]);
        $receipts = ReceiptController::owned($request)->where('status', 'confirmed')
            ->when($filters['from'] ?? null, fn ($q, $v) => $q->whereDate('receipt_date', '>=', $v))
            ->when($filters['to'] ?? null, fn ($q, $v) => $q->whereDate('receipt_date', '<=', $v))
            ->orderBy('receipt_date')->orderBy('id')->limit(1001)->get();
        abort_if($receipts->isEmpty(), 422, 'Geen gecontroleerde bonnen in deze periode.');
        abort_if($receipts->count() > 1000, 422, 'Kies een kleinere periode: maximaal 1000 bonnen per export.');
        abort_unless(class_exists(ZipArchive::class), 503, 'ZIP-export is niet beschikbaar op deze server.');

        $disk = Storage::disk('local');
        $bytes = 0;
        foreach ($receipts as $receipt) {
            abort_unless($disk->exists($receipt->path), 409, 'Een origineel bestand ontbreekt. De export is niet gemaakt.');
            $bytes += $disk->size($receipt->path);
        }
        abort_if($bytes > 200 * 1024 * 1024, 422, 'De bestanden zijn samen groter dan 200 MB. Kies een kleinere periode.');

        $path = tempnam(sys_get_temp_dir(), 'numico-export-');
        abort_if($path === false, 503, 'De export kon niet worden gemaakt.');
        $zip = new ZipArchive;
        $opened = false;
        $csv = fopen('php://temp', 'w+');
        try {
            if ($zip->open($path, ZipArchive::OVERWRITE) !== true) {
                throw new \RuntimeException('Cannot create export archive');
            }
            $opened = true;
            fwrite($csv, "\xEF\xBB\xBF");
            fputcsv($csv, ['Bonnummer', 'Datum', 'Leverancier', 'Categorie', 'Valuta', 'Totaal inclusief btw', 'Btw op bon', 'Notities', 'Origineel bestand'], ';', '"', '');
            foreach ($receipts as $receipt) {
                $extension = match ($receipt->mime) {
                    'application/pdf' => 'pdf', 'image/png' => 'png', 'image/webp' => 'webp', default => 'jpg',
                };
                $filename = 'bonnen/bon-'.$receipt->id.'.'.$extension;
                if (! $zip->addFile($disk->path($receipt->path), $filename)) {
                    throw new \RuntimeException('Cannot add receipt to export');
                }
                fputcsv($csv, [
                    $receipt->id, $receipt->receipt_date?->format('Y-m-d'),
                    self::text($receipt->vendor), self::text($receipt->category), self::text($receipt->currency),
                    number_format($receipt->total_cents / 100, 2, ',', ''),
                    number_format($receipt->vat_cents / 100, 2, ',', ''),
                    self::text($receipt->notes), $filename,
                ], ';', '"', '');
            }
            rewind($csv);
            if (! $zip->addFromString('bonnetjes.csv', stream_get_contents($csv))) {
                throw new \RuntimeException('Cannot finish export');
            }
            $closed = $zip->close();
            $opened = false;
            if (! $closed) {
                throw new \RuntimeException('Cannot finish export');
            }
        } catch (\Throwable $error) {
            if ($opened) {
                $zip->close();
            }
            @unlink($path);
            throw $error;
        } finally {
            fclose($csv);
        }

        return response()->download($path, 'numico-bonnen-'.now()->format('Y-m-d').'.zip', [
            'Content-Type' => 'application/zip', 'Cache-Control' => 'private, no-store',
        ])->deleteFileAfterSend(true);
    }

    private static function text(?string $value): string
    {
        $value ??= '';
        // Keep spreadsheet applications from treating user-entered text as a formula.
        return preg_match('/^[\s\x{FEFF}]*[=+@-]/u', $value) || preg_match('/^[\t\r\n]/', $value) ? "'".$value : $value;
    }
}
