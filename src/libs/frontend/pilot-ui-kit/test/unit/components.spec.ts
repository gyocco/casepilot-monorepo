import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  PilotBadgeComponent,
  PilotBannerComponent,
  PilotButtonComponent,
  PilotTextFieldComponent,
} from '@casepilot/pilot-ui-kit';

describe('pilot-ui-kit reusable controls', () => {
  it('emits valueChange on input in PilotTextFieldComponent and renders label and error', async () => {
    const fixture = TestBed.createComponent(PilotTextFieldComponent);
    const changes: string[] = [];
    fixture.componentInstance.valueChange.subscribe(value => changes.push(value));
    fixture.componentRef.setInput('fieldId', 'email');
    fixture.componentRef.setInput('label', 'Correo');
    fixture.componentRef.setInput('type', 'email');
    fixture.componentRef.setInput('value', '');
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const input = root.querySelector('input#email') as HTMLInputElement;
    expect(input).not.toBeNull();
    input.value = 'ada@casepilot.test';
    input.dispatchEvent(new Event('input'));
    expect(changes).toEqual(['ada@casepilot.test']);
  });

  it('emits pressed from PilotButtonComponent unless disabled or loading', async () => {
    const fixture = TestBed.createComponent(PilotButtonComponent);
    let count = 0;
    fixture.componentInstance.pressed.subscribe(() => { count++; });
    await fixture.whenStable();

    const button = (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement;
    button.click();
    expect(count).toBe(1);

    fixture.componentRef.setInput('loading', true);
    await fixture.whenStable();
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
  });

  it('renders accessible role alert/status in PilotBannerComponent and badge container', async () => {
    const bannerFixture = TestBed.createComponent(PilotBannerComponent);
    bannerFixture.componentRef.setInput('tone', 'error');
    await bannerFixture.whenStable();
    expect((bannerFixture.nativeElement as HTMLElement).querySelector('[role="alert"]')).not.toBeNull();

    const infoFixture = TestBed.createComponent(PilotBannerComponent);
    infoFixture.componentRef.setInput('tone', 'info');
    await infoFixture.whenStable();
    expect((infoFixture.nativeElement as HTMLElement).querySelector('[role="status"]')).not.toBeNull();

    const badgeFixture = TestBed.createComponent(PilotBadgeComponent);
    await badgeFixture.whenStable();
    expect((badgeFixture.nativeElement as HTMLElement).querySelector('.pilot-badge')).not.toBeNull();
  });
});
