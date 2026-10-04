import { Injectable, InjectionToken, computed, inject, makeEnvironmentProviders, provideAppInitializer, signal, type EnvironmentProviders } from '@angular/core';
import { PILOT_THEME_HOST } from './pilot-theme-host';
import { PilotThemeRegistry } from './pilot-theme-registry';
import type { PilotAsset, PilotThemeOptions } from './pilot-theme';

const THEME_REGISTRY = new InjectionToken<PilotThemeRegistry>('PILOT_THEME_REGISTRY');

@Injectable({ providedIn: 'root' })
export class PilotThemeService {
  private readonly registry = inject(THEME_REGISTRY);
  private readonly host = inject(PILOT_THEME_HOST);
  private readonly active = signal(this.registry.initialTheme);
  readonly currentTheme = this.active.asReadonly();
  readonly themeId = computed(() => this.currentTheme().id);
  readonly reducedMotion = this.host.reducedMotion;

  setTheme(id: string): void {
    const theme = this.registry.get(id);
    this.host.applyTheme(theme);
    this.active.set(theme);
  }

  asset(name: string): PilotAsset {
    return this.registry.resolveAsset(this.currentTheme(), name);
  }
}

export function providePilotThemes(options: PilotThemeOptions): EnvironmentProviders {
  const registry = new PilotThemeRegistry(options);
  return makeEnvironmentProviders([
    { provide: THEME_REGISTRY, useValue: registry },
    provideAppInitializer(() => inject(PilotThemeService).setTheme(registry.initialTheme.id)),
  ]);
}
