import { randomUUID } from 'node:crypto';
import type { CrudRuntime } from '../application/shared/crud-models.js';
export const systemCrudRuntime: CrudRuntime = {
  newId: () => randomUUID(),
  now: () => new Date().toISOString(),
};
