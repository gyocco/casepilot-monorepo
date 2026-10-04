import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkSources } from '../../../tools/frontend-architecture/source-rules.mjs';
import { WEB_SOURCE, KIT_SOURCE } from '../../../tools/frontend-architecture/dependency-rules.mjs';

const tokens = `${KIT_SOURCE}/theme/color-tokens.ts`;
const page = `${WEB_SOURCE}/features/auth/pages/login/login.page.ts`;
const defaults = {
  [tokens]: "export const PILOT_COLOR_VARIABLE = { primary: '--pilot-color-primary' } as const;",
  [`${WEB_SOURCE}/main.ts`]: 'export const initialized = true;',
};
const component = (extra = '', template = '<h1>Placeholder</h1>') => `
import { Component as View, ChangeDetectionStrategy as Detection } from '@angular/core';
@View({selector: 'cp-sample', standalone: true, changeDetection: Detection.OnPush, template: \`${template}\`, ${extra}})
export class Sample {}
`;
const check = files => checkSources({ ...defaults, ...files });

test('FRT-003 checks aliased Angular decorators and OnPush without banning valid components', () => {
  assert.deepEqual(check({ [page]: component() }), []);
  for (const bad of [component().replace('standalone: true', 'standalone: false'), component().replace('Detection.OnPush', 'Detection.Default')]) {
    assert.ok(check({ [page]: bad }).some(error => error.includes('FRT-003')));
  }
});

test('FRT-003 and FRT-004 also inspect namespace imports instead of skipping their metadata', () => {
  const namespaced = component()
    .replace("import { Component as View, ChangeDetectionStrategy as Detection }", 'import * as angular')
    .replace('@View', '@angular.Component')
    .replace('Detection.OnPush', 'angular.ChangeDetectionStrategy.OnPush');
  assert.deepEqual(check({ [page]: namespaced }), []);
  assert.ok(check({ [page]: namespaced.replace('standalone: true', 'standalone: false') }).some(error => error.includes('FRT-003')));
  assert.ok(check({ [page]: namespaced.replace('Placeholder', '<span style="color: red">Bad</span>') }).some(error => error.includes('FRT-004')));
});

test('FRT-004 permits central palettes, registered CSS roles and semantic utilities', () => {
  assert.deepEqual(check({
    [`${KIT_SOURCE}/theme/default-colors.ts`]: "export const palette = { primary: '#abc' };",
    [`${WEB_SOURCE}/theme/christmas.theme.ts`]: "export const colors = { primary: '#123456' };",
    [page]: component("styles: ':host { color: var(--pilot-color-primary); }'", '<h1 class="text-primary p-4">Hello</h1>'),
  }), []);
});

test('FRT-004 rejects raw colors, unknown variables, Tailwind palettes and literal computed classes', () => {
  for (const styles of ['color: #abc', 'background: rgb(0 0 0)', 'color: red', 'color: var(--pilot-color-unknown)']) {
    assert.ok(check({ [page]: component(`styles: ':host { ${styles}; }'`) }).some(error => error.includes('FRT-004')), styles);
  }
  for (const template of ['<p class="bg-red-500">Bad</p>', '<p class="hover:bg-[#abcdef]">Bad</p>', '<p class="bg-[red]">Bad</p>', '<p [class]="active ? \'text-red-500\' : \'text-primary\'">Bad</p>', '<p [ngClass]="{\'bg-red-500\': active}">Bad</p>', '<p [style.color]="\'red\'">Bad</p>']) {
    assert.ok(check({ [page]: component('', template) }).some(error => error.includes('FRT-004')), template);
  }
  assert.ok(check({ [page]: "export const color = '#abcdef';" }).some(error => error.includes('FRT-004')));
  assert.ok(check({ [page]: 'export class Color { readonly foregroundColor = "red"; }' }).some(error => error.includes('FRT-004')));
  assert.ok(check({ [page]: component("styles: ':host { --pilot-color-primary: inherit; }'") }).some(error => error.includes('FRT-004')));
  assert.ok(check({ [page]: "export const token = '--pilot-color-primary';" }).some(error => error.includes('FRT-004')));
});

test('FRT-001 rejects miscellaneous root folders while allowing feature and core owners', () => {
  for (const folder of ['features/auth/state', 'core/notifications', 'shared/messages', 'shell/app-layout']) {
    assert.deepEqual(check({ [`${WEB_SOURCE}/${folder}/sample.ts`]: 'export const enabled = true;' }), []);
  }
  assert.ok(check({ [`${WEB_SOURCE}/utils/sample.ts`]: 'export const enabled = true;' }).some(error => error.includes('FRT-001')));
});

test('FRT-005 allows theme manifests and named renderers but rejects resource paths in UI', () => {
  assert.deepEqual(check({ [`${WEB_SOURCE}/theme/app.theme.ts`]: "export const assets = { logo: 'themes/default/logo.svg' };", [page]: component('', '<pilot-asset [name]="assets.logo" alt="Logo" />') }), []);
  for (const template of ['<img src="logo.svg" alt="Logo">', '<span style="background-image: url(logo.svg)">Bad</span>', '<pilot-asset [src]="\'logo.svg\'" />', '<svg><path fill="#abc" /></svg>']) {
    assert.ok(check({ [page]: component('', template) }).some(error => error.includes('FRT-005') || error.includes('FRT-004')), template);
  }
  assert.ok(check({ [page]: "export const source = 'themes/default/logo.svg';" }).some(error => error.includes('FRT-005')));
});

test('FRT-010 scans external templates, SCSS, SVG and refuses missing/empty scopes', () => {
  assert.ok(check({ [`${WEB_SOURCE}/features/auth/pages/login/login.html`]: '<p style="color: red">Bad</p>' }).some(error => error.includes('FRT-004')));
  assert.ok(check({ [`${WEB_SOURCE}/src.scss`]: '$color: #abc; .x { color: $color; }' }).some(error => error.includes('FRT-004')));
  assert.ok(check({ 'src/apps/casepilot/casepilot-web/public/themes/base/logo.svg': '<svg><path fill="red" /></svg>' }).some(error => error.includes('FRT-004')));
  assert.ok(checkSources({}).some(error => error.includes('Source scope must not be empty')));
  assert.ok(checkSources({ [page]: component() }).some(error => error.includes('Color token definitions')));
});

test('FRT-009 rejects eager root imports of features and eager imports of feature pages', () => {
  assert.deepEqual(check({ [`${WEB_SOURCE}/app/app.routes.ts`]: "export const routes = [{ loadChildren: () => import('../features/auth/auth.routes') }];" }), []);
  assert.ok(check({ [`${WEB_SOURCE}/app/app.routes.ts`]: "import { Routes } from '../features/auth/auth.routes'; export { Routes };" }).some(error => error.includes('FRT-009')));
  assert.ok(check({ [`${WEB_SOURCE}/features/auth/auth.routes.ts`]: "import { Login } from './pages/login/login.page'; export { Login };" }).some(error => error.includes('FRT-009')));
});
