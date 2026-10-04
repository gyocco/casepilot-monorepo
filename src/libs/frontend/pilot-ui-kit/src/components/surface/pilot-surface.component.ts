import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'pilot-surface',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card appearance="outlined" role="region" [attr.aria-labelledby]="labelledBy()">
      <mat-card-content><ng-content /></mat-card-content>
    </mat-card>
  `,
  styles: ':host { display: block; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PilotSurfaceComponent {
  readonly labelledBy = input.required<string>();
}
