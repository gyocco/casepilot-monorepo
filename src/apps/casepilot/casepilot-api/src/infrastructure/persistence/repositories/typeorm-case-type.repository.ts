import type { EntityManager } from 'typeorm';
import type { CaseType } from '../../../domain/entities/case-type.js';
import type { CaseTypeRepository } from '../../../domain/repositories/case-type.repository.js';
import { case_typeTable } from '../schemas/case-type.schema.js';
import { TypeOrmDataRepository } from './typeorm-data.repository.js';
export class TypeOrmCaseTypeRepository extends TypeOrmDataRepository<CaseType> implements CaseTypeRepository {
  constructor(manager: EntityManager) { super(manager, case_typeTable); }
}
