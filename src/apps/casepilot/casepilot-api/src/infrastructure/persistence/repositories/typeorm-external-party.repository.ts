import type { EntityManager } from 'typeorm';
import type { ExternalParty } from '../../../domain/entities/external-party.js';
import type { ExternalPartyRepository } from '../../../domain/repositories/external-party.repository.js';
import { external_partyTable } from '../schemas/external-party.schema.js';
import { TypeOrmDataRepository } from '@casepilot/persistence/typeorm';
export class TypeOrmExternalPartyRepository extends TypeOrmDataRepository<ExternalParty> implements ExternalPartyRepository {
  constructor(manager: EntityManager) { super(manager, external_partyTable); }
}
