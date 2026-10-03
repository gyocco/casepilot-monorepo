import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { Event } from '../entities/event.js';
export interface EventRepository extends DataRepository<Event> {
  readonly entityType?: Event;
}
