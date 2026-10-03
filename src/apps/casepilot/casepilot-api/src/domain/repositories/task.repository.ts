import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { Task } from '../entities/task.js';
export interface TaskRepository extends DataRepository<Task> {
  readonly entityType?: Task;
}
