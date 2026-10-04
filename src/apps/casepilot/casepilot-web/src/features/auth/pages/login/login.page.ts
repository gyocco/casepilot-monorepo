import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PilotSurfaceComponent } from '@casepilot/pilot-ui-kit';

@Component({
  selector: 'cp-login-page',
  standalone: true,
  imports: [PilotSurfaceComponent],
  template: `
    <pilot-surface labelledBy="login-title">
      <h1 id="login-title" class="text-xl font-semibold">Inicio de sesión</h1>
      <p class="mt-2 text-on-surface-variant">Página pendiente de implementación.</p>
    </pilot-surface>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {}
