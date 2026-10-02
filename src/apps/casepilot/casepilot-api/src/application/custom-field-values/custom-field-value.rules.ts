import type { CustomFieldValue } from '../../domain/entities/custom-field-value.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { FieldRule } from '../shared/crud-validation.js';

import { validateReference, validateTarget } from '../shared/crud-relations.js';
export const custom_field_valueFields: readonly FieldRule[] = [
  { name: 'customFieldDefinitionId', kind: 'uuid', nullable: false },
  { name: 'entityType', kind: 'string', nullable: false },
  { name: 'entityId', kind: 'uuid', nullable: false },
  { name: 'valueText', kind: 'text', nullable: true },
  { name: 'valueNumber', kind: 'decimal', nullable: true },
  { name: 'valueDate', kind: 'timestamp', nullable: true },
  { name: 'valueBoolean', kind: 'boolean', nullable: true },
  { name: 'valueJson', kind: 'json', nullable: true },
];
export const custom_field_valueSortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'customFieldDefinitionId', 'entityType', 'entityId', 'valueNumber', 'valueDate', 'valueBoolean'];
export async function validateCustomFieldValueRelations(entity: CustomFieldValue, references: ReferenceRepository): Promise<void> {
  await validateReference(references, 'custom_field_definitions', entity.customFieldDefinitionId, entity.businessAccountId);
  await validateTarget(references, entity.entityType, entity.entityId, entity.businessAccountId);
}
