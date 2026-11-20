import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import {
  PilotBadgeComponent,
  PilotBannerComponent,
  PilotButtonComponent,
  PilotSurfaceComponent,
  PilotTextFieldComponent,
} from '@casepilot/pilot-ui-kit';
import { ProfileFacade } from '../../state/profile.facade';

@Component({
  selector: 'cp-profile-page',
  standalone: true,
  imports: [
    PilotSurfaceComponent,
    PilotTextFieldComponent,
    PilotButtonComponent,
    PilotBannerComponent,
    PilotBadgeComponent,
  ],
  providers: [ProfileFacade],
  template: `
    <div class="flex flex-col gap-4">
      <pilot-surface labelledBy="profile-title">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 id="profile-title" class="text-xl font-semibold">Perfil y autorización</h1>
            @if (facade.profile(); as current) {
              <p class="mt-1 text-sm text-on-surface-variant">
                {{ current.email }} · Versión {{ current.version }}
              </p>
            }
          </div>
          <div class="flex flex-wrap gap-2">
            <pilot-button variant="outlined" [disabled]="facade.loading()" (pressed)="facade.reload()">
              Recargar
            </pilot-button>
            <pilot-button variant="outlined" (pressed)="facade.signOut()">
              Cerrar sesión
            </pilot-button>
          </div>
        </div>

        @if (facade.loading()) {
          <pilot-banner tone="info" class="mt-4">Cargando perfil autenticado desde la API...</pilot-banner>
        }

        @if (facade.errorMessage(); as error) {
          <pilot-banner tone="error" class="mt-4">{{ error }}</pilot-banner>
        }

        @if (facade.successMessage(); as success) {
          <pilot-banner tone="success" class="mt-4">{{ success }}</pilot-banner>
        }

        @if (facade.profile(); as current) {
          <div class="mt-4 flex flex-wrap items-center gap-2">
            <pilot-badge>{{ current.status }}</pilot-badge>
            @if (current.emailVerifiedAt) {
              <pilot-badge>EMAIL VERIFICADO</pilot-badge>
            }
          </div>

          <form class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2" (submit)="onSubmit($event)" novalidate>
            <pilot-text-field
              fieldId="profile-first-name"
              name="firstName"
              label="Nombre"
              [required]="true"
              [value]="facade.firstName()"
              [disabled]="facade.saving()"
              (valueChange)="facade.firstName.set($event)"
            />
            <pilot-text-field
              fieldId="profile-last-name"
              name="lastName"
              label="Apellido"
              [required]="true"
              [value]="facade.lastName()"
              [disabled]="facade.saving()"
              (valueChange)="facade.lastName.set($event)"
            />
            <pilot-text-field
              fieldId="profile-display-name"
              name="displayName"
              label="Nombre visible"
              [value]="facade.displayName()"
              [disabled]="facade.saving()"
              (valueChange)="facade.displayName.set($event)"
            />
            <pilot-text-field
              fieldId="profile-timezone"
              name="timezone"
              label="Zona horaria"
              placeholder="UTC"
              [value]="facade.timezone()"
              [disabled]="facade.saving()"
              (valueChange)="facade.timezone.set($event)"
            />
            <div class="sm:col-span-2">
              <pilot-button type="submit" [loading]="facade.saving()">
                @if (facade.saving()) {
                  Guardando...
                } @else {
                  Guardar perfil
                }
              </pilot-button>
            </div>
          </form>
        }
      </pilot-surface>

      @if (facade.profile(); as current) {
        <pilot-surface labelledBy="memberships-title">
          <h2 id="memberships-title" class="text-lg font-semibold">Cuentas y prueba de autorización</h2>
          <p class="mt-1 text-sm text-on-surface-variant">
            Verifica en tiempo real las reglas de autorización de Application sobre cuentas propias y ajenas.
          </p>

          @if (current.memberships.length === 0) {
            <pilot-banner tone="info" class="mt-4">No tienes membresías activas asignadas.</pilot-banner>
          } @else {
            <ul class="mt-4 flex flex-col gap-3">
              @for (membership of current.memberships; track membership.memberId) {
                <li class="flex flex-col gap-2 rounded-lg border border-outline-variant p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p class="font-medium">{{ membership.accountName }}</p>
                    <div class="mt-1 flex flex-wrap gap-2">
                      <pilot-badge>{{ membership.role }}</pilot-badge>
                      <pilot-badge>{{ membership.memberStatus }}</pilot-badge>
                    </div>
                  </div>
                  <pilot-button
                    variant="outlined"
                    [disabled]="facade.checkingAuthz()"
                    (pressed)="facade.verifyAuthorizedAccount(membership.businessAccountId)"
                  >
                    Verificar acceso (200)
                  </pilot-button>
                </li>
              }
            </ul>
          }

          <div class="mt-4">
            <pilot-button
              variant="outlined"
              [disabled]="facade.checkingAuthz()"
              (pressed)="facade.verifyForbiddenAccount()"
            >
              Probar cuenta ajena (403)
            </pilot-button>
          </div>

          @if (facade.authzResult(); as result) {
            <pilot-banner [tone]="result.allowed ? 'success' : 'error'" class="mt-4">
              {{ result.message }}
            </pilot-banner>
          }
        </pilot-surface>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage implements OnInit {
  protected readonly facade = inject(ProfileFacade);

  ngOnInit(): void {
    void this.facade.load();
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    void this.facade.save();
  }
}
