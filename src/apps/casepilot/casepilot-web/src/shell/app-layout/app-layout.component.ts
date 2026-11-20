import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { PilotAssetComponent } from '@casepilot/pilot-ui-kit';
import { AuthFacade } from '../../core/auth/auth.facade';
import { APP_ASSET } from '../../theme/asset-names';

@Component({
  selector: 'cp-app-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet, PilotAssetComponent],
  template: `
    <a class="skip-link" [routerLink]="[]" fragment="main-content">Ir al contenido</a>
    <div class="flex min-h-dvh flex-col">
      <header class="flex items-center justify-between gap-3 border-b border-outline px-4 py-3 sm:px-6">
        <div class="flex items-center gap-3">
          <pilot-asset [name]="assets.brandLogo" alt="" [decorative]="true" class="h-8 w-8" />
          <span class="font-semibold">CasePilot</span>
        </div>
        @if (auth.isAuthenticated()) {
          <nav aria-label="Navegación principal" class="flex items-center gap-4 text-sm">
            <a routerLink="/profile" class="font-medium text-primary underline-offset-4 hover:underline">Perfil</a>
          </nav>
        }
      </header>
      <main id="main-content" tabindex="-1" class="mx-auto w-full max-w-5xl flex-1 p-4 sm:p-6">
        <router-outlet />
      </main>
    </div>
  `,
  styles: `
    :host { display: block; }
    .skip-link { position: absolute; inset-inline-start: 1rem; inset-block-start: -5rem; padding: .75rem; z-index: 10;
      background: var(--pilot-color-surface); color: var(--pilot-color-primary); }
    .skip-link:focus { inset-block-start: .5rem; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLayoutComponent {
  protected readonly assets = APP_ASSET;
  protected readonly auth = inject(AuthFacade);
}
