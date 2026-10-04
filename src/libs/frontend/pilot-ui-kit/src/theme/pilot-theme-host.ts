import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DestroyRef, InjectionToken, PLATFORM_ID, inject, signal, type Signal } from '@angular/core';
import { PILOT_COLOR_VARIABLE } from './color-tokens';
import type { PilotTheme } from './pilot-theme';

export interface PilotThemeHost {
  readonly reducedMotion: Signal<boolean>;
  applyTheme(theme: PilotTheme): void;
}

export const PILOT_THEME_HOST = new InjectionToken<PilotThemeHost>('PILOT_THEME_HOST', {
  providedIn: 'root',
  factory: () => {
    const document = inject(DOCUMENT);
    const destroyRef = inject(DestroyRef);
    const browser = isPlatformBrowser(inject(PLATFORM_ID));
    const motionQuery = browser ? document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)') : undefined;
    const reducedMotion = signal(motionQuery?.matches ?? false);
    const onMotionChange = (event: MediaQueryListEvent): void => reducedMotion.set(event.matches);
    motionQuery?.addEventListener('change', onMotionChange);
    destroyRef.onDestroy(() => motionQuery?.removeEventListener('change', onMotionChange));

    return {
      reducedMotion: reducedMotion.asReadonly(),
      applyTheme(theme: PilotTheme): void {
        if (!browser) return;
        const css = document.defaultView?.CSS;
        if (css && Object.values(theme.colors).some(value => !css.supports('color', value))) {
          throw new Error('FRT-006: theme contains an unsupported CSS color.');
        }
        for (const [role, variable] of Object.entries(PILOT_COLOR_VARIABLE)) {
          document.documentElement.style.setProperty(variable, theme.colors[role as keyof typeof PILOT_COLOR_VARIABLE]);
        }
        document.documentElement.dataset['pilotTheme'] = theme.id;
        document.documentElement.style.colorScheme = theme.colorScheme;
      },
    };
  },
});
