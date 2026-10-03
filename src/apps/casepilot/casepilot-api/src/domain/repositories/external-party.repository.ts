import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { ExternalParty } from '../entities/external-party.js';
export interface ExternalPartyRepository extends DataRepository<ExternalParty> {
  readonly entityType?: ExternalParty;
}
