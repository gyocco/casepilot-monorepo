import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'pilot-text-field',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field appearance="outline" class="w-full">
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        [id]="fieldId()"
        [attr.name]="name()"
        [type]="type()"
        [value]="value()"
        [placeholder]="placeholder()"
        [attr.autocomplete]="autocomplete()"
        [required]="required()"
        [disabled]="disabled()"
        [attr.aria-invalid]="errorMessage() ? 'true' : null"
        (input)="onInput($event)"
      />
      @if (hint()) {
        <mat-hint>{{ hint() }}</mat-hint>
      }
      @if (errorMessage()) {
        <mat-error>{{ errorMessage() }}</mat-error>
      }
    </mat-form-field>
  `,
  styles: ':host { display: block; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PilotTextFieldComponent {
  readonly fieldId = input.required<string>();
  readonly label = input.required<string>();
  readonly name = input<string | null>(null);
  readonly type = input<'text' | 'email' | 'password'>('text');
  readonly value = input<string>('');
  readonly placeholder = input<string>('');
  readonly autocomplete = input<string | null>(null);
  readonly required = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly hint = input<string | null>(null);
  readonly errorMessage = input<string | null>(null);
  readonly valueChange = output<string>();

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (target) this.valueChange.emit(target.value);
  }
}
