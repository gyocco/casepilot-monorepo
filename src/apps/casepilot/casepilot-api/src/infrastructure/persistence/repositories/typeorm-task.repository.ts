import type { EntityManager } from 'typeorm';
import type { Task } from '../../../domain/entities/task.js';
import type { TaskRepository } from '../../../domain/repositories/task.repository.js';
import { taskTable } from '../schemas/task.schema.js';
import { TypeOrmDataRepository } from '@casepilot/abstractions/typeorm';
export class TypeOrmTaskRepository extends TypeOrmDataRepository<Task> implements TaskRepository {
  constructor(manager: EntityManager) { super(manager, taskTable); }
}
