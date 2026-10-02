import type { DataRepository } from './data.repository.js';
import type { CaseType } from '../entities/case-type.js';
export interface CaseTypeRepository extends DataRepository<CaseType> {
  readonly entityType?: CaseType;
}
