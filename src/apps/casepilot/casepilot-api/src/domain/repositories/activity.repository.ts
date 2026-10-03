import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { Activity } from '../entities/activity.js';
export interface ActivityRepository extends DataRepository<Activity> {
  readonly entityType?: Activity;
}
