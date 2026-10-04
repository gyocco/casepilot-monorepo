import { dirname, resolve } from 'node:path';
import { ts } from 'ts-morph';

export function checkCompilerConfiguration(file) {
  const result = ts.readConfigFile(file, ts.sys.readFile);
  if (result.error) return [`${file}: FRT-010: compiler configuration cannot be loaded.`];
  const parsed = ts.parseJsonConfigFileContent(result.config, ts.sys, dirname(file), undefined, file);
  const errors = [];
  if (!parsed.fileNames.length) errors.push(`${file}: FRT-010: compilation source scope is empty.`);
  if (parsed.options.strict !== true || parsed.options.noUncheckedIndexedAccess !== true ||
    ['noImplicitAny', 'strictNullChecks', 'strictPropertyInitialization', 'strictFunctionTypes'].some(key => parsed.options[key] === false)) {
    errors.push(`${file}: FRT-003: strict options and noUncheckedIndexedAccess must remain enabled.`);
  }
  let angular = {};
  function readAngular(target) {
    const config = ts.readConfigFile(target, ts.sys.readFile).config;
    if (config.extends) readAngular(resolve(dirname(target), config.extends));
    angular = { ...angular, ...config.angularCompilerOptions };
  }
  readAngular(file);
  for (const key of ['strictTemplates', 'strictInjectionParameters', 'strictInputAccessModifiers']) {
    if (angular[key] !== true) errors.push(`${file}: FRT-003: ${key} must remain enabled.`);
  }
  return errors;
}
