import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { PilotThemeService } from '../../theme/pilot-theme.service';

@Component({
  selector: 'pilot-asset',
  standalone: true,
  template: `
    @if (asset().kind === 'video') {
      <video [src]="asset().src" [poster]="poster()" controls preload="metadata" [attr.aria-label]="accessibleName()">
        {{ accessibleName() }}
      </video>
    } @else {
      <img [src]="imageSource()" [alt]="accessibleName()" [attr.aria-hidden]="decorative() ? 'true' : null" />
    }
  `,
  styles: ':host { display: inline-block; } img, video { display: block; width: 100%; height: 100%; object-fit: contain; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PilotAssetComponent {
  private readonly themes = inject(PilotThemeService);
  readonly name = input.required<string>();
  readonly alt = input('');
  readonly decorative = input(false);
  readonly asset = computed(() => this.themes.asset(this.name()));
  readonly accessibleName = computed(() => {
    if (this.decorative() && this.asset().kind !== 'video') return '';
    const alt = this.alt().trim();
    if (!alt) throw new Error('FRT-011: a meaningful resource needs an accessible name.');
    return alt;
  });
  readonly imageSource = computed(() => {
    const asset = this.asset();
    return asset.kind === 'animation' && this.themes.reducedMotion() ? asset.reducedMotionSrc : asset.src;
  });
  readonly poster = computed(() => {
    const asset = this.asset();
    return asset.kind === 'video' ? asset.poster : undefined;
  });
}
