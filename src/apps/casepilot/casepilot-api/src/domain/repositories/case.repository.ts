import type { DataRepository } from './data.repository.js';
import type { Case } from '../entities/case.js';
export interface CaseRepository extends DataRepository<Case> {
  readonly entityType?: Case;
}
