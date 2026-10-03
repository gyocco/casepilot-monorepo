import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { Case } from '../entities/case.js';
export interface CaseRepository extends DataRepository<Case> {
  readonly entityType?: Case;
}
