import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { StatusDefinition } from '../entities/status-definition.js';
export interface StatusDefinitionRepository extends DataRepository<StatusDefinition> {
  readonly entityType?: StatusDefinition;
}
