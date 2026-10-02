import type { EntityManager } from 'typeorm';
import type { Deadline } from '../../../domain/entities/deadline.js';
import type { DeadlineRepository } from '../../../domain/repositories/deadline.repository.js';
import { deadlineTable } from '../schemas/deadline.schema.js';
import { TypeOrmDataRepository } from './typeorm-data.repository.js';
export class TypeOrmDeadlineRepository extends TypeOrmDataRepository<Deadline> implements DeadlineRepository {
  constructor(manager: EntityManager) { super(manager, deadlineTable); }
}
