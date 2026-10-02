import type { EntityManager } from 'typeorm';
import type { StatusDefinition } from '../../../domain/entities/status-definition.js';
import type { StatusDefinitionRepository } from '../../../domain/repositories/status-definition.repository.js';
import { status_definitionTable } from '../schemas/status-definition.schema.js';
import { TypeOrmDataRepository } from './typeorm-data.repository.js';
export class TypeOrmStatusDefinitionRepository extends TypeOrmDataRepository<StatusDefinition> implements StatusDefinitionRepository {
  constructor(manager: EntityManager) { super(manager, status_definitionTable); }
}
