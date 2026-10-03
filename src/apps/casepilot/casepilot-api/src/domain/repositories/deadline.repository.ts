import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { Deadline } from '../entities/deadline.js';
export interface DeadlineRepository extends DataRepository<Deadline> {
  readonly entityType?: Deadline;
}
