import type { EntityManager } from 'typeorm';
import type { CustomFieldValue } from '../../../domain/entities/custom-field-value.js';
import type { CustomFieldValueRepository } from '../../../domain/repositories/custom-field-value.repository.js';
import { custom_field_valueTable } from '../schemas/custom-field-value.schema.js';
import { TypeOrmDataRepository } from '@casepilot/persistence/typeorm';
export class TypeOrmCustomFieldValueRepository extends TypeOrmDataRepository<CustomFieldValue> implements CustomFieldValueRepository {
  constructor(manager: EntityManager) { super(manager, custom_field_valueTable); }
}
