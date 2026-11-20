import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

export type PilotButtonVariant = 'filled' | 'outlined' | 'text';

@Component({
  selector: 'pilot-button',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <button
      [matButton]="variant()"
      [attr.type]="type()"
      [disabled]="disabled() || loading()"
      [attr.aria-busy]="loading() ? 'true' : null"
      [attr.aria-label]="ariaLabel()"
      class="pilot-btn"
      (click)="onClick()"
    ><ng-content /></button>
  `,
  styles: `
    :host { display: inline-block; }
    .pilot-btn { min-height: 2.75rem; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PilotButtonComponent {
  readonly variant = input<PilotButtonVariant>('filled');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly ariaLabel = input<string | null>(null);
  readonly pressed = output<void>();

  protected onClick(): void {
    if (!this.disabled() && !this.loading()) {
      this.pressed.emit();
    }
  }
}
