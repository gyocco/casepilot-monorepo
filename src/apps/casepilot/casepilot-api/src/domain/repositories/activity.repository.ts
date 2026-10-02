import type { DataRepository } from './data.repository.js';
import type { Activity } from '../entities/activity.js';
export interface ActivityRepository extends DataRepository<Activity> {
  readonly entityType?: Activity;
}
