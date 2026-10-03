import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { CustomFieldDefinition } from '../entities/custom-field-definition.js';
export interface CustomFieldDefinitionRepository extends DataRepository<CustomFieldDefinition> {
  readonly entityType?: CustomFieldDefinition;
}
