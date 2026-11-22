import type { EntityManager } from 'typeorm';
import type { TimeEntry } from '../../../domain/entities/time-entry.js';
import type { TimeEntryRepository } from '../../../domain/repositories/time-entry.repository.js';
import { time_entryTable } from '../schemas/time-entry.schema.js';
import { TypeOrmDataRepository } from '@casepilot/persistence/typeorm';
export class TypeOrmTimeEntryRepository extends TypeOrmDataRepository<TimeEntry> implements TimeEntryRepository {
  constructor(manager: EntityManager) { super(manager, time_entryTable); }
}
