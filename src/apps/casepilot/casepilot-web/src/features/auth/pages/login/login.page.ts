import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  PilotBannerComponent,
  PilotButtonComponent,
  PilotSurfaceComponent,
  PilotTextFieldComponent,
} from '@casepilot/pilot-ui-kit';
import { LoginFacade } from '../../state/login.facade';

@Component({
  selector: 'cp-login-page',
  standalone: true,
  imports: [
    PilotSurfaceComponent,
    PilotTextFieldComponent,
    PilotButtonComponent,
    PilotBannerComponent,
  ],
  providers: [LoginFacade],
  template: `
    <div class="mx-auto w-full max-w-md">
      <pilot-surface labelledBy="login-title">
        <h1 id="login-title" class="text-xl font-semibold">
          @if (facade.mode() === 'signin') {
            Inicio de sesión
          } @else {
            Crear cuenta
          }
        </h1>
        <p class="mt-2 text-sm text-on-surface-variant">
          @if (facade.mode() === 'signin') {
            Ingresa con tus credenciales de Firebase Authentication para acceder a CasePilot.
          } @else {
            Registra un usuario para probar autenticación y autorización con la API.
          }
        </p>

        @if (facade.errorMessage(); as error) {
          <pilot-banner tone="error" class="mt-4">{{ error }}</pilot-banner>
        }

        <form class="mt-4 flex flex-col gap-3" (submit)="onSubmit($event)" novalidate>
          @if (facade.mode() === 'signup') {
            <pilot-text-field
              fieldId="login-display-name"
              name="displayName"
              label="Nombre visible"
              autocomplete="name"
              [value]="facade.displayName()"
              [disabled]="facade.loading()"
              (valueChange)="facade.displayName.set($event)"
            />
          }

          <pilot-text-field
            fieldId="login-email"
            name="email"
            label="Correo electrónico"
            type="email"
            autocomplete="email"
            [required]="true"
            [value]="facade.email()"
            [disabled]="facade.loading()"
            (valueChange)="facade.email.set($event)"
          />

          <pilot-text-field
            fieldId="login-password"
            name="password"
            label="Contraseña"
            type="password"
            [autocomplete]="facade.mode() === 'signin' ? 'current-password' : 'new-password'"
            [required]="true"
            [value]="facade.password()"
            [disabled]="facade.loading()"
            (valueChange)="facade.password.set($event)"
          />

          <div class="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <pilot-button type="submit" [loading]="facade.loading()">
              @if (facade.loading()) {
                Procesando...
              } @else if (facade.mode() === 'signin') {
                Ingresar
              } @else {
                Registrarme
              }
            </pilot-button>

            <pilot-button
              variant="text"
              [disabled]="facade.loading()"
              (pressed)="facade.toggleMode()"
            >
              @if (facade.mode() === 'signin') {
                Crear cuenta nueva
              } @else {
                Ya tengo cuenta
              }
            </pilot-button>
          </div>
        </form>
      </pilot-surface>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  protected readonly facade = inject(LoginFacade);

  protected onSubmit(event: Event): void {
    event.preventDefault();
    void this.facade.submit();
  }
}
