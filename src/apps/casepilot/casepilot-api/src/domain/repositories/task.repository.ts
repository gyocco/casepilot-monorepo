import type { DataRepository } from './data.repository.js';
import type { Task } from '../entities/task.js';
export interface TaskRepository extends DataRepository<Task> {
  readonly entityType?: Task;
}
