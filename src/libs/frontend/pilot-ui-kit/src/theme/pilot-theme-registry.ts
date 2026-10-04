import { PILOT_COLOR_VARIABLE } from './color-tokens';
import type { PilotAsset, PilotTheme, PilotThemeOptions } from './pilot-theme';

export class PilotThemeRegistry {
  private readonly themes = new Map<string, PilotTheme>();
  readonly initialTheme: PilotTheme;

  constructor(options: PilotThemeOptions) {
    for (const theme of options.themes) {
      if (!/^[a-z][a-z0-9-]*$/.test(theme.id) || this.themes.has(theme.id)) {
        throw new Error(`FRT-006: invalid or duplicate theme ID: ${theme.id}`);
      }
      if (theme.colorScheme !== 'light' && theme.colorScheme !== 'dark') {
        throw new Error('FRT-006: colorScheme must be light or dark.');
      }
      const roles = Object.keys(PILOT_COLOR_VARIABLE);
      if (Object.keys(theme.colors).length !== roles.length) throw new Error('FRT-006: provide exactly all color roles.');
      for (const role of roles) {
        const color = Reflect.get(theme.colors, role) as unknown;
        if (typeof color !== 'string' || !color.trim() || /[;{}!]/.test(color)) {
          throw new Error(`FRT-006: invalid or missing color role: ${role}`);
        }
      }
      const assets: Record<string, PilotAsset> = {};
      for (const [name, asset] of Object.entries(theme.assets)) {
        if (!/^[a-z][a-z0-9.-]*$/.test(name)) throw new Error(`FRT-006: invalid asset name: ${name}`);
        if (!['image', 'icon', 'animation', 'video'].includes(asset.kind)) throw new Error('FRT-006: unsupported asset kind.');
        validateAssetUrl(asset.src);
        if (asset.kind === 'animation') validateAssetUrl(asset.reducedMotionSrc);
        if (asset.kind === 'video' && asset.poster !== undefined) validateAssetUrl(asset.poster);
        if (/\.gif(?:[?#]|$)/i.test(asset.src) && asset.kind !== 'animation') {
          throw new Error('FRT-006: GIFs must declare animation kind and a reduced-motion resource.');
        }
        assets[name] = Object.freeze({ ...asset });
      }
      this.themes.set(theme.id, Object.freeze({ ...theme, colors: Object.freeze({ ...theme.colors }), assets: Object.freeze(assets) }));
    }
    this.initialTheme = this.get(options.initialTheme);
  }

  get(id: string): PilotTheme {
    const theme = this.themes.get(id);
    if (!theme) throw new Error(`FRT-006: theme not registered: ${id}`);
    return theme;
  }

  resolveAsset(theme: PilotTheme, name: string): PilotAsset {
    const asset = theme.assets[name] ?? this.initialTheme.assets[name];
    if (!asset) throw new Error(`FRT-005: asset not registered: ${name}`);
    return asset;
  }
}

function validateAssetUrl(src: string): void {
  if (typeof src !== 'string' || !src.trim() || src !== src.trim() || src.includes('\\') || src.startsWith('//')) {
    throw new Error('FRT-008: assets require a relative path or HTTPS URL.');
  }
  const url = new URL(src, 'https://pilot.invalid/');
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error('FRT-008: unsafe asset URL.');
  }
}
