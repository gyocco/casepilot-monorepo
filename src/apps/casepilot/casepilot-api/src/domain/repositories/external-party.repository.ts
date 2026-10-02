import type { DataRepository } from './data.repository.js';
import type { ExternalParty } from '../entities/external-party.js';
export interface ExternalPartyRepository extends DataRepository<ExternalParty> {
  readonly entityType?: ExternalParty;
}
