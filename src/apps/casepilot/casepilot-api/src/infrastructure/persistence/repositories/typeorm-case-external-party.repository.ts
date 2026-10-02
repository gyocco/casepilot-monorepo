import type { EntityManager } from 'typeorm';
import type { CaseExternalParty } from '../../../domain/entities/case-external-party.js';
import type { CaseExternalPartyRepository } from '../../../domain/repositories/case-external-party.repository.js';
import { case_external_partyTable } from '../schemas/case-external-party.schema.js';
import { TypeOrmDataRepository } from './typeorm-data.repository.js';
export class TypeOrmCaseExternalPartyRepository extends TypeOrmDataRepository<CaseExternalParty> implements CaseExternalPartyRepository {
  constructor(manager: EntityManager) { super(manager, case_external_partyTable); }
}
