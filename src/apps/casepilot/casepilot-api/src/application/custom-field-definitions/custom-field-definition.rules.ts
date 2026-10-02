import type { CustomFieldDefinition } from '../../domain/entities/custom-field-definition.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { FieldRule } from '../shared/crud-validation.js';

import { validateReference } from '../shared/crud-relations.js';
export const custom_field_definitionFields: readonly FieldRule[] = [
  { name: 'entityType', kind: 'string', nullable: false },
  { name: 'caseTypeId', kind: 'uuid', nullable: true },
  { name: 'name', kind: 'string', nullable: false },
  { name: 'key', kind: 'string', nullable: false },
  { name: 'dataType', kind: 'string', nullable: false },
  { name: 'required', kind: 'boolean', nullable: false },
  { name: 'configuration', kind: 'json', nullable: true },
  { name: 'sortOrder', kind: 'integer', nullable: false },
  { name: 'isActive', kind: 'boolean', nullable: false },
];
export const custom_field_definitionSortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'entityType', 'caseTypeId', 'name', 'key', 'dataType', 'required', 'sortOrder', 'isActive'];
export async function validateCustomFieldDefinitionRelations(entity: CustomFieldDefinition, references: ReferenceRepository): Promise<void> {
  await validateReference(references, 'case_types', entity.caseTypeId, entity.businessAccountId);
}
