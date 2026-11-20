import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('login form, keyboard navigation, responsive layout and zero axe violations', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveURL(/\/auth\/login$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Inicio de sesión' })).toBeVisible();
  await expect(page.locator('form')).toHaveCount(1);
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Ir al contenido' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();

  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Inicio de sesión' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('login.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('a theme updates global Material colors and the existing logo without changing components', async ({ page }) => {
  await page.goto('/auth/login');
  const logo = page.locator('pilot-asset img');
  await expect(logo).toHaveAttribute('src', 'themes/default/logo.svg');
  const before = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--mat-sys-primary').trim());
  await page.evaluate(() => {
    const browser = window as unknown as { ng: { getComponent(element: Element): { theme: { setTheme(id: string): void } } } };
    const root = document.querySelector('cp-root');
    if (!root) throw new Error('Root component missing.');
    browser.ng.getComponent(root).theme.setTheme('christmas');
  });
  await expect(logo).toHaveAttribute('src', 'themes/christmas/logo.svg');
  await expect(page.locator('html')).toHaveAttribute('data-pilot-theme', 'christmas');
  const after = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--mat-sys-primary').trim());
  expect(after).not.toBe(before);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('login validation displays an accessible error banner without horizontal overflow', async ({ page }) => {
  await page.goto('/auth/login');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByRole('alert')).toContainText('correo electrónico válido');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
