import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { PilotAssetComponent } from '@casepilot/pilot-ui-kit';
import { APP_ASSET } from '../../theme/asset-names';

@Component({
  selector: 'cp-app-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet, PilotAssetComponent],
  template: `
    <a class="skip-link" [routerLink]="[]" fragment="main-content">Ir al contenido</a>
    <div class="flex min-h-dvh flex-col">
      <header class="flex items-center gap-3 border-b border-outline px-4 py-3 sm:px-6">
        <pilot-asset [name]="assets.brandLogo" alt="" [decorative]="true" class="h-8 w-8" />
        <span class="font-semibold">CasePilot</span>
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
  readonly assets = APP_ASSET;
}
