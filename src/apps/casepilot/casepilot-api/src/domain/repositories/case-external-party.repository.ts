import type { DataRepository } from './data.repository.js';
import type { CaseExternalParty } from '../entities/case-external-party.js';
export interface CaseExternalPartyRepository extends DataRepository<CaseExternalParty> {
  readonly entityType?: CaseExternalParty;
}
