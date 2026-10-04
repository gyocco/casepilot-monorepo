import { fileURLToPath } from 'node:url';

export const DEPENDENCY_CRUISER_CLI = fileURLToPath(new URL('../../bin/dependency-cruiser.mjs', import.meta.resolve('dependency-cruiser')));
export const WEB_SOURCE = 'src/apps/casepilot/casepilot-web/src';
export const KIT_SOURCE = 'src/libs/frontend/pilot-ui-kit/src';

export function dependencyConfiguration(features = []) {
  const web = `^${WEB_SOURCE}/`;
  const kit = '^src/libs/frontend/';
  return {
    forbidden: [
      { name: 'FRT-010-no-cycles', severity: 'error', from: {}, to: { circular: true } },
      { name: 'FRT-010-resolvable-imports', severity: 'error', from: {}, to: { couldNotResolve: true } },
      { name: 'FRT-001-no-node', severity: 'error', from: {}, to: { dependencyTypes: ['core'] } },
      { name: 'FRT-001-no-backend', severity: 'error', from: {}, to: {
        path: '(^|/)libs/backend/|(^|/)apps/casepilot/casepilot-api/|(^|/)(?:pg|typeorm|firebase-admin|@neondatabase|@nestjs)(?:/|$)',
      } },
      { name: 'FRT-001-libraries-no-apps', severity: 'error', from: { path: kit }, to: { path: '^src/apps/', reachable: true } },
      { name: 'FRT-001-no-tools-or-tests', severity: 'error', from: {}, to: { path: '^(?:tools/|tests/)|/(?:test|tests)/', reachable: true } },
      { name: 'FRT-001-kit-public-entry', severity: 'error', from: { path: web }, to: {
        path: '^src/libs/frontend/pilot-ui-kit/(?:src|dist)/',
        pathNot: ['/(?:src/public-api[.]ts|dist/(?:types/casepilot-pilot-ui-kit[.]d[.]ts|fesm2022/casepilot-pilot-ui-kit[.]mjs))$'],
      } },
      { name: 'FRT-002-shared-no-features-or-composition', severity: 'error', from: { path: `${web}(?:core|shared|shell)/` },
        to: { path: `${web}(?:features|app)/`, reachable: true } },
      { name: 'FRT-002-ui-no-direct-data-access', severity: 'error', from: { path: `${web}features/[^/]+/(?:pages|components)/` },
        to: { path: `${web}features/[^/]+/data-access/` } },
      { name: 'FRT-007-kit-no-http-or-provider', severity: 'error', from: { path: kit }, to: {
        path: '(^|/)(?:firebase|@angular/fire)(?:/|$)|@angular/common/http', reachable: true,
      } },
      ...features.map(feature => ({
        name: `FRT-002-${feature}-no-other-features`, severity: 'error',
        from: { path: `${web}features/${feature}/` }, to: { path: `${web}features/(?!${feature}/)[^/]+/`, reachable: true },
      })),
    ],
    options: {
      doNotFollow: { path: 'node_modules|/dist/' },
      tsPreCompilationDeps: true,
      enhancedResolveOptions: { exportsFields: ['exports'], conditionNames: ['types', 'import', 'default'], mainFields: ['types', 'module', 'main'] },
    },
  };
}
