import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { CaseType } from '../entities/case-type.js';
export interface CaseTypeRepository extends DataRepository<CaseType> {
  readonly entityType?: CaseType;
}
