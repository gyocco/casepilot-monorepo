import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { CaseExternalParty } from '../entities/case-external-party.js';
export interface CaseExternalPartyRepository extends DataRepository<CaseExternalParty> {
  readonly entityType?: CaseExternalParty;
}
