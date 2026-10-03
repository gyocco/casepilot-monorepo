import type { EntityManager } from 'typeorm';
import type { Event } from '../../../domain/entities/event.js';
import type { EventRepository } from '../../../domain/repositories/event.repository.js';
import { eventTable } from '../schemas/event.schema.js';
import { TypeOrmDataRepository } from '@casepilot/abstractions/typeorm';
export class TypeOrmEventRepository extends TypeOrmDataRepository<Event> implements EventRepository {
  constructor(manager: EntityManager) { super(manager, eventTable); }
}
