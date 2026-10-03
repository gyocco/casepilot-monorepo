import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { TimeEntry } from '../entities/time-entry.js';
export interface TimeEntryRepository extends DataRepository<TimeEntry> {
  readonly entityType?: TimeEntry;
}
