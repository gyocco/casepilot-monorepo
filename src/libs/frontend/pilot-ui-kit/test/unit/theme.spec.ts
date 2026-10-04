import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DEFAULT_PILOT_COLORS, PILOT_COLOR, PILOT_COLOR_VARIABLE, PILOT_THEME_HOST, PilotAssetComponent, PilotThemeRegistry, PilotThemeService, providePilotThemes, type PilotTheme } from '@casepilot/pilot-ui-kit';

const themes: readonly PilotTheme[] = [
  { id: 'default', colorScheme: 'light', colors: DEFAULT_PILOT_COLORS, assets: {
    'brand.logo': { kind: 'image', src: 'themes/base/logo.svg' },
    'status.empty': { kind: 'icon', src: 'themes/base/empty.svg' },
    'status.loading': { kind: 'animation', src: 'themes/base/loading.gif', reducedMotionSrc: 'themes/base/loading.svg' },
    'welcome.video': { kind: 'video', src: 'themes/base/welcome.mp4', poster: 'themes/base/poster.webp' },
  } },
  { id: 'christmas', colorScheme: 'dark', colors: { ...DEFAULT_PILOT_COLORS, primary: DEFAULT_PILOT_COLORS.secondary }, assets: {
    'brand.logo': { kind: 'image', src: 'themes/christmas/logo.svg' },
  } },
];

function setup(): { service: PilotThemeService; applied: PilotTheme[]; motion: ReturnType<typeof signal<boolean>> } {
  const applied: PilotTheme[] = [];
  const motion = signal(false);
  TestBed.configureTestingModule({ providers: [
    providePilotThemes({ themes, initialTheme: 'default' }),
    { provide: PILOT_THEME_HOST, useValue: { reducedMotion: motion, applyTheme: (theme: PilotTheme): void => { applied.push(theme); } } },
  ] });
  return { service: TestBed.inject(PilotThemeService), applied, motion };
}

describe('semantic themes', () => {
  it('changes colors and named resources together and falls back to initial assets', () => {
    const { service, applied } = setup();
    expect(service.asset('brand.logo').src).toBe('themes/base/logo.svg');
    service.setTheme('christmas');
    expect(service.themeId()).toBe('christmas');
    expect(applied.at(-1)?.colors.primary).toBe(DEFAULT_PILOT_COLORS.secondary);
    expect(service.asset('brand.logo').src).toBe('themes/christmas/logo.svg');
    expect(service.asset('status.empty').src).toBe('themes/base/empty.svg');
    service.setTheme('default');
    expect(service.asset('brand.logo').src).toBe('themes/base/logo.svg');
  });

  it('rejects unknown IDs/resources without changing the active theme', () => {
    const { service, applied } = setup();
    expect(() => service.setTheme('missing')).toThrow('FRT-006');
    expect(service.themeId()).toBe('default');
    expect(applied).toHaveLength(1);
    expect(() => service.asset('missing')).toThrow('FRT-005');
  });

  it('rejects missing palettes, duplicate IDs and unsafe URLs before applying a theme', () => {
    const base = themes[0];
    if (!base) throw new Error('Test theme missing.');
    const { primary: _removed, ...colors } = base.colors;
    expect(() => new PilotThemeRegistry({ initialTheme: 'default', themes: [{ ...base, colors } as PilotTheme] })).toThrow('FRT-006');
    expect(() => new PilotThemeRegistry({ initialTheme: 'default', themes: [base, base] })).toThrow('FRT-006');
    for (const src of ['javascript:alert(1)', 'data:image/svg+xml,test', '//example.com/logo.svg', 'https://user:password@example.com/logo.svg']) {
      expect(() => new PilotThemeRegistry({ initialTheme: 'default', themes: [{ ...base, assets: { logo: { kind: 'image', src } } }] })).toThrow('FRT-008');
    }
    expect(() => new PilotThemeRegistry({ initialTheme: 'default', themes: [{ ...base, assets: { loading: { kind: 'image', src: 'loading.gif' } } }] })).toThrow('FRT-006');
  });

  it('keeps registered palettes/resources immutable and exposes CSS references for every role', () => {
    const registry = new PilotThemeRegistry({ themes, initialTheme: 'default' });
    expect(Object.isFrozen(registry.initialTheme.colors)).toBe(true);
    expect(Object.isFrozen(registry.initialTheme.assets['brand.logo'])).toBe(true);
    expect(Object.isFrozen(PILOT_COLOR_VARIABLE)).toBe(true);
    expect(Object.isFrozen(PILOT_COLOR)).toBe(true);
    for (const role of Object.keys(PILOT_COLOR_VARIABLE) as (keyof typeof PILOT_COLOR_VARIABLE)[]) {
      expect(PILOT_COLOR[role]).toBe(`var(${PILOT_COLOR_VARIABLE[role]})`);
    }
  });
});

describe('resource rendering', () => {
  it('updates an existing resource component when a theme changes', async () => {
    const { service } = setup();
    const fixture = TestBed.createComponent(PilotAssetComponent);
    fixture.componentRef.setInput('name', 'brand.logo');
    fixture.componentRef.setInput('alt', 'Brand');
    await fixture.whenStable();
    const image = (fixture.nativeElement as HTMLElement).querySelector('img');
    expect(image?.getAttribute('src')).toBe('themes/base/logo.svg');
    service.setTheme('christmas');
    await fixture.whenStable();
    expect(image?.getAttribute('src')).toBe('themes/christmas/logo.svg');
    expect(image?.getAttribute('alt')).toBe('Brand');
  });

  it('replaces an animation with its static resource when reduced motion changes', async () => {
    const { motion } = setup();
    const fixture = TestBed.createComponent(PilotAssetComponent);
    fixture.componentRef.setInput('name', 'status.loading');
    fixture.componentRef.setInput('alt', 'Loading');
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('img')?.getAttribute('src')).toBe('themes/base/loading.gif');
    motion.set(true);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('img')?.getAttribute('src')).toBe('themes/base/loading.svg');
  });

  it('renders videos with controls and without autoplay', async () => {
    setup();
    const fixture = TestBed.createComponent(PilotAssetComponent);
    fixture.componentRef.setInput('name', 'welcome.video');
    fixture.componentRef.setInput('alt', 'Welcome');
    await fixture.whenStable();
    const video = (fixture.nativeElement as HTMLElement).querySelector('video');
    expect(video?.controls).toBe(true);
    expect(video?.autoplay).toBe(false);
    expect(video?.getAttribute('poster')).toBe('themes/base/poster.webp');
  });
});
