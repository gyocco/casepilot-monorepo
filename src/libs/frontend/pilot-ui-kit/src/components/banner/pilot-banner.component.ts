import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type PilotBannerTone = 'info' | 'error' | 'success';

@Component({
  selector: 'pilot-banner',
  standalone: true,
  template: `
    <div
      class="pilot-banner"
      [class.pilot-banner--error]="tone() === 'error'"
      [class.pilot-banner--success]="tone() === 'success'"
      [attr.role]="tone() === 'error' ? 'alert' : 'status'"
      [attr.aria-live]="tone() === 'error' ? 'assertive' : 'polite'"
    >
      <ng-content />
    </div>
  `,
  styles: `
    :host { display: block; }
    .pilot-banner {
      border-radius: 0.75rem;
      border: 1px solid var(--pilot-color-outline-variant);
      background: var(--pilot-color-secondary-container);
      color: var(--pilot-color-on-secondary-container);
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      line-height: 1.4;
    }
    .pilot-banner--error {
      border-color: var(--pilot-color-error);
      background: var(--pilot-color-error-container);
      color: var(--pilot-color-on-error-container);
    }
    .pilot-banner--success {
      border-color: var(--pilot-color-primary);
      background: var(--pilot-color-primary-container);
      color: var(--pilot-color-on-primary-container);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PilotBannerComponent {
  readonly tone = input<PilotBannerTone>('info');
}
