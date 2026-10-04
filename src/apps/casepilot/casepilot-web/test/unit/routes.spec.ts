import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { providePilotThemes } from '@casepilot/pilot-ui-kit';
import { describe, expect, it } from 'vitest';
import { APP_ROUTES } from '../../src/app/app.routes';
import { CASEPILOT_THEMES } from '../../src/theme/casepilot.theme';

describe('initial routes', () => {
  it.each(['/', '/auth', '/unknown'])('resolves %s to the login placeholder through lazy routes', async (url: string) => {
    TestBed.configureTestingModule({ providers: [provideRouter(APP_ROUTES), providePilotThemes({ themes: CASEPILOT_THEMES, initialTheme: 'default' })] });
    const harness = await RouterTestingHarness.create(url);
    expect(TestBed.inject(Router).url).toBe('/auth/login');
    expect(harness.routeNativeElement?.textContent).toContain('Página pendiente de implementación.');
    expect(harness.routeNativeElement?.querySelector('form')).toBeNull();
  });
});
