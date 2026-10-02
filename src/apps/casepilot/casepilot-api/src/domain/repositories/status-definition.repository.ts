import type { DataRepository } from './data.repository.js';
import type { StatusDefinition } from '../entities/status-definition.js';
export interface StatusDefinitionRepository extends DataRepository<StatusDefinition> {
  readonly entityType?: StatusDefinition;
}
