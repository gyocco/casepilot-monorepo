import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'pilot-badge',
  standalone: true,
  template: '<span class="pilot-badge"><ng-content /></span>',
  styles: `
    :host { display: inline-block; }
    .pilot-badge {
      display: inline-flex;
      align-items: center;
      border-radius: 9999px;
      border: 1px solid var(--pilot-color-outline-variant);
      background: var(--pilot-color-secondary-container);
      color: var(--pilot-color-on-secondary-container);
      padding: 0.125rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PilotBadgeComponent {}
