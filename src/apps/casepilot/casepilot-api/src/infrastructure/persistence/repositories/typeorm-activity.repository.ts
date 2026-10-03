import type { EntityManager } from 'typeorm';
import type { Activity } from '../../../domain/entities/activity.js';
import type { ActivityRepository } from '../../../domain/repositories/activity.repository.js';
import { activityTable } from '../schemas/activity.schema.js';
import { TypeOrmDataRepository } from '@casepilot/abstractions/typeorm';
export class TypeOrmActivityRepository extends TypeOrmDataRepository<Activity> implements ActivityRepository {
  constructor(manager: EntityManager) { super(manager, activityTable); }
}
