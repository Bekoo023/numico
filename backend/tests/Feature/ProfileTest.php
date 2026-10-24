<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    private function account(string $email): User
    {
        return User::create(['voornaam' => 'Test', 'achternaam' => 'Account', 'email' => $email, 'password' => 'test-password']);
    }

    public function test_profile_requires_authentication(): void
    {
        $this->patchJson('/api/user', ['voornaam' => 'Nieuw'])->assertUnauthorized();
    }

    public function test_profile_changes_persist_only_for_authenticated_user(): void
    {
        $user = $this->account('one@example.test');
        $other = $this->account('other@example.test');
        Sanctum::actingAs($user);

        $this->patchJson('/api/user', [
            'id' => $other->id, 'voornaam' => 'Nieuw', 'email' => 'NEW@EXAMPLE.TEST',
            'bedrijfsnaam' => 'Mijn bedrijf', 'aantal_werknemers' => 0, 'kvk_nummer' => '01234567',
            'password' => 'ignored-password',
        ])->assertOk()->assertJsonPath('user.email', 'new@example.test')
            ->assertJsonPath('user.aantal_werknemers', 0)->assertJsonMissingPath('user.password');

        $this->assertDatabaseHas('gebruikers', ['id' => $user->id, 'voornaam' => 'Nieuw', 'kvk_nummer' => '01234567']);
        $this->assertSame('Test', $other->fresh()->voornaam);
        $this->assertTrue(password_verify('test-password', $user->fresh()->password));
        $this->getJson('/api/user')->assertOk()->assertJsonPath('user.voornaam', 'Nieuw');
    }

    public function test_profile_validates_unique_email_and_company_fields(): void
    {
        $user = $this->account('one@example.test');
        $this->account('other@example.test');
        Sanctum::actingAs($user);
        $this->patchJson('/api/user', ['email' => 'OTHER@EXAMPLE.TEST', 'voornaam' => '', 'aantal_werknemers' => -1, 'kvk_nummer' => '123'])
            ->assertUnprocessable()->assertJsonValidationErrors(['email', 'voornaam', 'aantal_werknemers', 'kvk_nummer']);
        $this->assertSame('one@example.test', $user->fresh()->email);
        $this->patchJson('/api/user', ['email' => 'one@example.test', 'bedrijfsnaam' => null, 'aantal_werknemers' => null, 'kvk_nummer' => null])
            ->assertOk()->assertJsonPath('user.aantal_werknemers', null);
    }
}
