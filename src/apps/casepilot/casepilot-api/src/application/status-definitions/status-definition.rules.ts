import type { StatusDefinition } from '../../domain/entities/status-definition.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { FieldRule } from '@casepilot/validation';

import { validateReference } from '../shared/crud-relations.js';
export const status_definitionFields: readonly FieldRule[] = [
  { name: 'entityType', kind: 'string', nullable: false },
  { name: 'caseTypeId', kind: 'uuid', nullable: true },
  { name: 'name', kind: 'string', nullable: false },
  { name: 'code', kind: 'string', nullable: false },
  { name: 'category', kind: 'string', nullable: true },
  { name: 'sortOrder', kind: 'integer', nullable: false },
  { name: 'isInitial', kind: 'boolean', nullable: false },
  { name: 'isTerminal', kind: 'boolean', nullable: false },
  { name: 'isActive', kind: 'boolean', nullable: false },
];
export const status_definitionSortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'entityType', 'caseTypeId', 'name', 'code', 'category', 'sortOrder', 'isInitial', 'isTerminal', 'isActive'];
export async function validateStatusDefinitionRelations(entity: StatusDefinition, references: ReferenceRepository): Promise<void> {
  await validateReference(references, 'case_types', entity.caseTypeId, entity.businessAccountId);
}
