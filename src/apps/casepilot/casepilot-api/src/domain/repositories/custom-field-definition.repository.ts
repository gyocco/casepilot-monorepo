import type { DataRepository } from './data.repository.js';
import type { CustomFieldDefinition } from '../entities/custom-field-definition.js';
export interface CustomFieldDefinitionRepository extends DataRepository<CustomFieldDefinition> {
  readonly entityType?: CustomFieldDefinition;
}
