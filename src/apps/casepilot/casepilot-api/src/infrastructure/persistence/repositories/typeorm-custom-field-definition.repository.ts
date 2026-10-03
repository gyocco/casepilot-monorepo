import type { EntityManager } from 'typeorm';
import type { CustomFieldDefinition } from '../../../domain/entities/custom-field-definition.js';
import type { CustomFieldDefinitionRepository } from '../../../domain/repositories/custom-field-definition.repository.js';
import { custom_field_definitionTable } from '../schemas/custom-field-definition.schema.js';
import { TypeOrmDataRepository } from '@casepilot/abstractions/typeorm';
export class TypeOrmCustomFieldDefinitionRepository extends TypeOrmDataRepository<CustomFieldDefinition> implements CustomFieldDefinitionRepository {
  constructor(manager: EntityManager) { super(manager, custom_field_definitionTable); }
}
