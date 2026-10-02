import type { DataRepository } from './data.repository.js';
import type { Event } from '../entities/event.js';
export interface EventRepository extends DataRepository<Event> {
  readonly entityType?: Event;
}
