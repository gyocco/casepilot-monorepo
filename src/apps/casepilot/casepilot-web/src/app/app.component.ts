import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PilotThemeService } from '@casepilot/pilot-ui-kit';

@Component({
  selector: 'cp-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly theme = inject(PilotThemeService);
}
