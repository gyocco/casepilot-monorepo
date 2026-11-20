import path from 'node:path';

const normalize = value => value.replaceAll('\\', '/');
const integrations = /\/(?:core\/[^/]+\/|features\/[^/]+\/data-access\/)/;
const authAdapter = /\/core\/auth\//;
const platformAdapter = /\/(?:core\/platform\/|theme\/pilot-theme-host\.ts$)/;

const boundaries = {
  meta: { type: 'problem', schema: [], messages: {
    integration: 'FRT-007: provider/HTTP imports belong to core adapters or feature data-access.',
    material: 'FRT-012: consume Material through pilot-ui-kit components.',
    browser: 'FRT-007: browser capabilities belong to a platform adapter.',
    publicEntry: 'FRT-001: consume the UI kit only through its public package entry.',
    unsafe: 'FRT-008: never bypass Angular sanitization or import administrative/persistence SDKs.',
  } },
  create(context) {
    const file = normalize(path.resolve(context.filename));
    const isSource = file.includes('/src/') && !file.includes('/test/');
    if (!isSource) return {};
    function checkImport(node, specifier) {
      if (typeof specifier !== 'string') return;
      if (/^(?:firebase-admin|@neondatabase\/|pg(?:\/|$)|typeorm(?:\/|$)|@nestjs\/)/.test(specifier)) {
        context.report({ node, messageId: 'unsafe' });
      }
      if (specifier.startsWith('@angular/material') && !file.includes('/pilot-ui-kit/src/components/')) {
        context.report({ node, messageId: 'material' });
      }
      if (/^(?:firebase(?:\/|$)|@angular\/fire(?:\/|$))/.test(specifier) && !authAdapter.test(file)) {
        context.report({ node, messageId: 'integration' });
      }
      if (/^@angular\/common\/http(?:\/|$)/.test(specifier) && !integrations.test(file)) {
        context.report({ node, messageId: 'integration' });
      }
      if (file.includes('/casepilot-web/src/') && (
        specifier.startsWith('@casepilot/pilot-ui-kit/') || /libs\/frontend\/pilot-ui-kit/.test(specifier)
      )) context.report({ node, messageId: 'publicEntry' });
    }
    return {
      ImportDeclaration: node => checkImport(node, node.source.value),
      ExportNamedDeclaration: node => checkImport(node, node.source?.value),
      ExportAllDeclaration: node => checkImport(node, node.source.value),
      ImportExpression: node => checkImport(node, node.source.value),
      CallExpression(node) {
        if (node.callee.type === 'MemberExpression') {
          const property = node.callee.computed ? node.callee.property.value : node.callee.property.name;
          if (typeof property === 'string' && property.startsWith('bypassSecurityTrust')) context.report({ node, messageId: 'unsafe' });
        }
      },
      'Program:exit'() {
        const visitScope = scope => {
          for (const reference of scope.references) {
            if (reference.resolved) continue;
            const name = reference.identifier.name;
            if (['window', 'document', 'navigator', 'localStorage', 'sessionStorage', 'matchMedia'].includes(name) && !platformAdapter.test(file)) {
              context.report({ node: reference.identifier, messageId: 'browser' });
            }
            if (['fetch', 'XMLHttpRequest'].includes(name) && !integrations.test(file)) context.report({ node: reference.identifier, messageId: 'integration' });
          }
          scope.childScopes.forEach(visitScope);
        };
        visitScope(context.sourceCode.scopeManager.globalScope);
      },
    };
  },
};

export const frontendPlugin = { rules: { boundaries } };
