import type { DataRepository } from './data.repository.js';
import type { TimeEntry } from '../entities/time-entry.js';
export interface TimeEntryRepository extends DataRepository<TimeEntry> {
  readonly entityType?: TimeEntry;
}
