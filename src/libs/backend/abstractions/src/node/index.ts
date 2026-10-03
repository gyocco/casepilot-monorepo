import { randomUUID } from 'node:crypto';
import type { CrudRuntime } from '../crud-runtime.js';

export const systemCrudRuntime: CrudRuntime = Object.freeze({
  newId: (): string => randomUUID(),
  now: (): string => new Date().toISOString(),
});
