import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthFacade } from '../../../core/auth/auth.facade';

export type LoginMode = 'signin' | 'signup';

@Injectable()
export class LoginFacade {
  private readonly auth = inject(AuthFacade);
  private readonly router = inject(Router);

  readonly mode = signal<LoginMode>('signin');
  readonly email = signal('');
  readonly password = signal('');
  readonly displayName = signal('');
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  toggleMode(): void {
    this.errorMessage.set(null);
    this.mode.set(this.mode() === 'signin' ? 'signup' : 'signin');
  }

  async submit(): Promise<void> {
    const email = this.email().trim();
    const password = this.password();
    const displayName = this.displayName().trim();

    if (!email || !email.includes('@')) {
      this.errorMessage.set('Ingresa un correo electrónico válido.');
      return;
    }
    if (password.length < 6) {
      this.errorMessage.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      if (this.mode() === 'signin') {
        await this.auth.signInWithEmail(email, password);
      } else {
        await this.auth.signUpWithEmail(email, password, displayName);
      }
      await this.router.navigateByUrl('/profile');
    } catch (error: unknown) {
      this.errorMessage.set(error instanceof Error ? error.message : 'No se pudo iniciar sesión.');
    } finally {
      this.loading.set(false);
    }
  }
}
