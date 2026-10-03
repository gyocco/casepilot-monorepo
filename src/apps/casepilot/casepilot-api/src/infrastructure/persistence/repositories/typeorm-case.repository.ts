import type { EntityManager } from 'typeorm';
import type { Case } from '../../../domain/entities/case.js';
import type { CaseRepository } from '../../../domain/repositories/case.repository.js';
import { caseTable } from '../schemas/case.schema.js';
import { TypeOrmDataRepository } from '@casepilot/abstractions/typeorm';
export class TypeOrmCaseRepository extends TypeOrmDataRepository<Case> implements CaseRepository {
  constructor(manager: EntityManager) { super(manager, caseTable); }
}
