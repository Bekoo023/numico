<?php

namespace Tests\Feature;

use App\Models\AdministrationMessage;
use App\Models\Receipt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdministrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
        Http::preventStrayRequests();
        config(['services.openai.key' => 'test-only-not-a-real-key']);
    }

    private function account(string $email = 'one@example.test'): User
    {
        return User::create(['voornaam' => 'Test', 'achternaam' => 'Account', 'email' => $email, 'password' => 'test-password']);
    }

    private function receipt(User $user, array $attributes = []): Receipt
    {
        $receipt = new Receipt(array_merge([
            'original_name' => 'receipt.pdf', 'path' => 'receipts/test.pdf', 'mime' => 'application/pdf',
            'sha256' => hash('sha256', uniqid('', true)), 'status' => 'confirmed', 'vendor' => 'Office',
            'receipt_date' => '2026-10-01', 'currency' => 'EUR', 'total_cents' => 12100, 'vat_cents' => 2100,
            'category' => 'Kantoor',
        ], $attributes));
        $receipt->user_id = $user->id;
        $receipt->save();
        Storage::disk('local')->put($receipt->path, '%PDF-1.4 test');

        return $receipt;
    }

    private function aiReply(string $text, array $annotations = []): array
    {
        return ['status' => 'completed', 'output' => [['type' => 'message', 'content' => [['type' => 'output_text', 'text' => $text, 'annotations' => $annotations]]]]];
    }

    public function test_routes_require_authentication(): void
    {
        $this->getJson('/api/receipts')->assertUnauthorized();
        $this->getJson('/api/receipts/export')->assertUnauthorized();
        $this->postJson('/api/receipts')->assertUnauthorized();
        $this->getJson('/api/administration/chat')->assertUnauthorized();
        $this->postJson('/api/administration/chat', ['message' => 'Hallo'])->assertUnauthorized();
    }

    public function test_export_contains_only_owned_confirmed_receipts_in_period(): void
    {
        $user = $this->account();
        Sanctum::actingAs($user);
        $mine = $this->receipt($user, ['vendor' => '=HYPERLINK("example")', 'total_cents' => -1210, 'vat_cents' => -210, 'notes' => "Line one\nLine two; quoted"]);
        $this->receipt($user, ['status' => 'review']);
        $this->receipt($user, ['receipt_date' => '2025-01-01']);
        $this->receipt($this->account('other@example.test'));
        $response = $this->getJson('/api/receipts/export?from=2026-10-01&to=2026-10-31')->assertOk();
        $path = $response->baseResponse->getFile()->getPathname();
        $zip = new \ZipArchive;
        try {
            $this->assertTrue($zip->open($path));
            $this->assertSame(2, $zip->numFiles);
            $this->assertSame('%PDF-1.4 test', $zip->getFromName('bonnen/bon-'.$mine->id.'.pdf'));
            $csv = $zip->getFromName('bonnetjes.csv');
            $this->assertStringStartsWith("\xEF\xBB\xBF", $csv);
            $stream = fopen('php://temp', 'w+');
            fwrite($stream, substr($csv, 3)); rewind($stream);
            fgetcsv($stream, 0, ';', '"', '');
            $row = fgetcsv($stream, 0, ';', '"', '');
            $this->assertSame("'=HYPERLINK(\"example\")", $row[2]);
            $this->assertSame('-12,10', $row[5]);
            $this->assertSame('-2,10', $row[6]);
            $this->assertSame("Line one\nLine two; quoted", $row[7]);
            $this->assertFalse(fgetcsv($stream, 0, ';', '"', ''));
            fclose($stream);
        } finally {
            $zip->close();
            @unlink($path);
        }
        Http::assertNothingSent();
    }

    public function test_export_validates_period_empty_selection_and_missing_files(): void
    {
        $user = $this->account();
        Sanctum::actingAs($user);
        $this->getJson('/api/receipts/export')->assertUnprocessable();
        $this->getJson('/api/receipts/export?from=2026-12-01&to=2026-01-01')->assertUnprocessable();
        $receipt = $this->receipt($user);
        Storage::disk('local')->delete($receipt->path);
        $this->getJson('/api/receipts/export')->assertStatus(409);
    }

    public function test_upload_is_private_deduplicated_and_rejects_unsupported_files(): void
    {
        Sanctum::actingAs($this->account());
        $makeFile = fn () => UploadedFile::fake()->createWithContent('bon.pdf', "%PDF-1.4\nexact same document");
        $first = $this->postJson('/api/receipts', ['file' => $makeFile()])->assertCreated()->assertJsonPath('duplicate', false)->assertJsonMissingPath('receipt.path');
        $id = $first->json('receipt.id');
        $this->postJson('/api/receipts', ['file' => $makeFile()])->assertOk()->assertJsonPath('duplicate', true)->assertJsonPath('receipt.id', $id);
        $this->assertDatabaseCount('receipts', 1);
        Storage::disk('local')->assertExists(Receipt::find($id)->path);
        $this->postJson('/api/receipts', ['file' => UploadedFile::fake()->createWithContent('bad.svg', '<svg/>')])->assertUnprocessable();
        $this->postJson('/api/receipts', ['file' => UploadedFile::fake()->create('large.pdf', 10241, 'application/pdf')])->assertUnprocessable();
        $this->getJson('/api/receipts/'.$id.'/file')->assertOk();
        Http::assertNothingSent();
    }

    public function test_other_accounts_cannot_read_edit_extract_or_download_receipts(): void
    {
        $owner = $this->account();
        $receipt = $this->receipt($owner);
        Sanctum::actingAs($this->account('other@example.test'));
        $this->getJson('/api/receipts')->assertOk()->assertJsonPath('summary.count', 0);
        $this->getJson('/api/receipts/'.$receipt->id.'/file')->assertNotFound();
        $this->patchJson('/api/receipts/'.$receipt->id, [])->assertNotFound();
        $this->postJson('/api/receipts/'.$receipt->id.'/extract')->assertNotFound();
        Http::assertNothingSent();
    }

    public function test_extraction_stays_unconfirmed_and_handles_nulls_and_empty_warnings(): void
    {
        $user = $this->account();
        Sanctum::actingAs($user);
        $receipt = $this->receipt($user, ['status' => 'uploaded']);
        $fields = ['vendor' => 'Winkel', 'receipt_date' => '2026-10-21', 'currency' => 'EUR', 'total_cents' => 1210, 'vat_cents' => null, 'category' => 'Kantoor', 'notes' => null, 'warnings' => []];
        Http::fake(['api.openai.com/*' => Http::response($this->aiReply(json_encode($fields)))]);
        $this->postJson('/api/receipts/'.$receipt->id.'/extract')->assertOk()->assertJsonPath('receipt.status', 'review')->assertJsonPath('receipt.vat_cents', null);
        $this->getJson('/api/receipts')->assertJsonPath('summary.confirmed', 0)->assertJsonCount(0, 'summary.currencies');
        Http::assertSent(fn ($request) => $request['store'] === false && $request['text']['format']['strict'] === true && $request['input'][0]['content'][1]['type'] === 'input_file');
    }

    public function test_provider_failure_preserves_file_and_allows_retry_without_leaking_details(): void
    {
        $user = $this->account();
        Sanctum::actingAs($user);
        $receipt = $this->receipt($user, ['status' => 'uploaded']);
        Http::fake(['api.openai.com/*' => Http::response(['error' => ['code' => 'credit_balance_exhausted', 'type' => 'insufficient_quota', 'message' => 'sensitive-provider-error']], 429)]);
        $this->postJson('/api/receipts/'.$receipt->id.'/extract')->assertStatus(503)->assertJsonPath('receipt.status', 'failed')->assertDontSee('sensitive-provider-error');
        Storage::disk('local')->assertExists($receipt->path);
        $this->assertSame('failed', $receipt->fresh()->status);
    }

    public function test_confirmation_checks_amounts_and_keeps_credit_notes_signed(): void
    {
        $user = $this->account();
        Sanctum::actingAs($user);
        $receipt = $this->receipt($user, ['status' => 'review']);
        $fields = ['vendor' => 'Winkel', 'receipt_date' => '2026-10-21', 'currency' => 'EUR', 'total_cents' => -1210, 'vat_cents' => 210, 'category' => 'Kantoor', 'notes' => null];
        $this->patchJson('/api/receipts/'.$receipt->id, $fields)->assertUnprocessable()->assertJsonValidationErrors('vat_cents');
        $fields['vat_cents'] = -210;
        $this->patchJson('/api/receipts/'.$receipt->id, $fields)->assertOk()->assertJsonPath('receipt.status', 'confirmed')->assertJsonPath('receipt.total_cents', -1210);
        $this->getJson('/api/receipts')->assertJsonPath('summary.currencies.0.total_cents', -1210);
        $this->postJson('/api/receipts/'.$receipt->id.'/extract')->assertUnprocessable();
        Http::assertNothingSent();
    }

    public function test_totals_ignore_unconfirmed_and_other_users_and_keep_currencies_separate(): void
    {
        $user = $this->account();
        Sanctum::actingAs($user);
        $this->receipt($user);
        $this->receipt($user, ['total_cents' => -1210, 'vat_cents' => -210]);
        $this->receipt($user, ['currency' => 'USD']);
        $this->receipt($user, ['status' => 'review']);
        $this->receipt($user, ['receipt_date' => '2025-01-01']);
        $this->receipt($this->account('other@example.test'));
        $response = $this->getJson('/api/receipts?from=2026-10-01&to=2026-10-31&search=nomatch')->assertOk()->assertJsonPath('summary.confirmed', 3)->assertJsonPath('summary.pending', 1)->assertJsonPath('receipts.total', 0);
        $currencies = collect($response->json('summary.currencies'))->keyBy('currency');
        $this->assertEquals(10890, $currencies['EUR']['total_cents']);
        $this->assertEquals(1890, $currencies['EUR']['vat_cents']);
        $this->assertEquals(12100, $currencies['USD']['total_cents']);
        $this->getJson('/api/receipts?from=2026-12-01&to=2026-01-01')->assertUnprocessable();
    }

    public function test_chat_uses_owned_current_records_and_persists_sources_without_other_users_history(): void
    {
        $user = $this->account();
        Sanctum::actingAs($user);
        $mine = $this->receipt($user, ['vendor' => 'MyVendor']);
        $other = $this->account('other@example.test');
        $this->receipt($other, ['vendor' => 'SECRET_OTHER_VENDOR']);
        AdministrationMessage::create(['user_id' => $other->id, 'role' => 'user', 'content' => 'SECRET_OTHER_MESSAGE']);
        Http::fake(['api.openai.com/*' => Http::response($this->aiReply('Je hebt 121 euro uitgegeven.', [['type' => 'url_citation', 'url' => 'https://www.belastingdienst.nl/', 'title' => 'Belastingdienst']]))]);
        $this->postJson('/api/administration/chat', ['message' => 'Hoeveel heb ik uitgegeven?'])->assertCreated()->assertJsonPath('messages.1.sources.0.title', 'Belastingdienst');
        $this->getJson('/api/administration/chat')->assertOk()->assertJsonCount(2, 'messages')->assertDontSee('SECRET_OTHER');
        Http::assertSent(fn ($request) => str_contains($request['instructions'], 'MyVendor') && ! str_contains(json_encode($request->data()), 'SECRET_OTHER') && $request['tools'][0]['type'] === 'web_search');
        $mine->update(['total_cents' => 24200]);
        $this->postJson('/api/administration/chat', ['message' => 'En nu?'])->assertCreated();
        Http::assertSent(fn ($request) => str_contains($request['instructions'], '24200') && count($request['input']) === 3);
    }

    public function test_failed_chat_does_not_save_fake_answers_or_duplicate_user_messages(): void
    {
        Sanctum::actingAs($this->account());
        Http::fake(['api.openai.com/*' => Http::response(['error' => ['code' => 'bad_request']], 500)]);
        $this->postJson('/api/administration/chat', ['message' => 'Help'])->assertStatus(503);
        $this->assertDatabaseCount('administration_messages', 0);
        $this->postJson('/api/administration/chat', ['message' => str_repeat('a', 4001)])->assertUnprocessable();
    }

    public function test_date_filters_work_with_only_one_boundary(): void
    {
        $user = $this->account();
        Sanctum::actingAs($user);
        $this->receipt($user);
        $this->getJson('/api/receipts?to=2026-12-31')->assertOk()->assertJsonPath('summary.confirmed', 1);
        $this->getJson('/api/receipts?from=2026-01-01')->assertOk()->assertJsonPath('summary.confirmed', 1);
    }

    public function test_fiscal_question_requires_search_and_does_not_return_unsupported_claims(): void
    {
        Sanctum::actingAs($this->account());
        Http::fake(['api.openai.com/*' => Http::response($this->aiReply('UNVERIFIED_FISCAL_CLAIM'))]);
        $this->postJson('/api/administration/chat', ['message' => 'Mag ik btw aftrekken?'])->assertCreated()->assertDontSee('UNVERIFIED_FISCAL_CLAIM');
        Http::assertSent(fn ($request) => $request['tool_choice'] === 'required');
    }

    public function test_invalid_ai_output_cannot_become_confirmed_data(): void
    {
        $user = $this->account();
        Sanctum::actingAs($user);
        $receipt = $this->receipt($user, ['status' => 'uploaded']);
        Http::fake(['api.openai.com/*' => Http::response($this->aiReply('{"total_cents": "not money"}'))]);
        $this->postJson('/api/receipts/'.$receipt->id.'/extract')->assertStatus(503)->assertJsonPath('receipt.status', 'failed');
        $this->getJson('/api/receipts')->assertJsonPath('summary.confirmed', 0);
    }

    public function test_update_cannot_race_an_active_extraction(): void
    {
        $user = $this->account();
        Sanctum::actingAs($user);
        $receipt = $this->receipt($user, ['status' => 'processing']);
        $lock = \Illuminate\Support\Facades\Cache::lock('receipt:'.$receipt->id, 130);
        $lock->get();
        try {
            $this->patchJson('/api/receipts/'.$receipt->id, ['vendor' => 'Winkel', 'receipt_date' => '2026-10-21', 'currency' => 'EUR', 'total_cents' => 0, 'vat_cents' => 0, 'category' => 'Overig'])->assertStatus(409);
            $this->postJson('/api/receipts/'.$receipt->id.'/extract')->assertStatus(409);
        } finally {
            $lock->release();
        }
        Http::assertNothingSent();
    }
}
