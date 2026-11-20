import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthFacade } from '../../../core/auth/auth.facade';
import { normalizeHttpError } from '../../../core/http/problem-details';
import { ProfileApi } from '../data-access/profile.api';
import type { AuthorizationCheckResult, UserProfile } from '../models/profile.models';

const FOREIGN_ACCOUNT_PROBE_ID = '00000000-0000-4000-8000-000000000999';

@Injectable()
export class ProfileFacade {
  private readonly api = inject(ProfileApi);
  private readonly auth = inject(AuthFacade);
  private readonly router = inject(Router);

  readonly profile = signal<UserProfile | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly checkingAuthz = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly authzResult = signal<AuthorizationCheckResult | null>(null);

  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly displayName = signal('');
  readonly timezone = signal('');

  async load(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      const response = await firstValueFrom(this.api.bootstrapCurrentUser());
      this.applyProfile(response.profile);
    } catch (error: unknown) {
      const normalized = normalizeHttpError(error);
      this.errorMessage.set(normalized.message);
    } finally {
      this.loading.set(false);
    }
  }

  async reload(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    try {
      const response = await firstValueFrom(this.api.getCurrentUserProfile());
      this.applyProfile(response.profile);
    } catch (error: unknown) {
      this.errorMessage.set(normalizeHttpError(error).message);
    } finally {
      this.loading.set(false);
    }
  }

  async save(): Promise<void> {
    const current = this.profile();
    if (!current) return;
    const first = this.firstName().trim();
    const last = this.lastName().trim();
    if (!first || !last) {
      this.errorMessage.set('Nombre y apellido son obligatorios.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    try {
      const display = this.displayName().trim();
      const tz = this.timezone().trim();
      const response = await firstValueFrom(this.api.updateCurrentUserProfile({
        version: current.version,
        firstName: first,
        lastName: last,
        displayName: display.length > 0 ? display : null,
        timezone: tz.length > 0 ? tz : null,
      }));
      this.applyProfile(response.profile);
      this.successMessage.set(`Perfil actualizado (versión ${response.profile.version}).`);
    } catch (error: unknown) {
      this.errorMessage.set(normalizeHttpError(error).message);
    } finally {
      this.saving.set(false);
    }
  }

  async verifyAuthorizedAccount(accountId: string): Promise<void> {
    this.checkingAuthz.set(true);
    this.authzResult.set(null);
    try {
      const response = await firstValueFrom(this.api.getBusinessAccount(accountId));
      this.authzResult.set({
        allowed: true,
        status: 200,
        message: `Acceso autorizado (200 OK): ${response.item.name} (${response.item.status}, ${response.item.currency}).`,
      });
    } catch (error: unknown) {
      const normalized = normalizeHttpError(error);
      this.authzResult.set({
        allowed: false,
        status: normalized.status,
        message: `Acceso denegado (${normalized.status} ${normalized.code}): ${normalized.message}`,
      });
    } finally {
      this.checkingAuthz.set(false);
    }
  }

  async verifyForbiddenAccount(): Promise<void> {
    await this.verifyAuthorizedAccount(FOREIGN_ACCOUNT_PROBE_ID);
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigateByUrl('/auth/login');
  }

  private applyProfile(profile: UserProfile): void {
    this.profile.set(profile);
    this.firstName.set(profile.firstName);
    this.lastName.set(profile.lastName);
    this.displayName.set(profile.displayName ?? '');
    this.timezone.set(profile.timezone ?? '');
  }
}
