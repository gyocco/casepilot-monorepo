import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';
import type { Activity } from '../../domain/entities/activity.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '@casepilot/abstractions/typeorm';
import { TypeOrmActivityRepository } from '../../infrastructure/persistence/repositories/typeorm-activity.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { systemCrudRuntime } from '@casepilot/abstractions/node';
import { CreateActivityHandler } from '../../application/activities/create-activity.handler.js';
import { GetActivityHandler } from '../../application/activities/get-activity.handler.js';
import { UpdateActivityHandler } from '../../application/activities/update-activity.handler.js';
import { DeleteActivityHandler } from '../../application/activities/delete-activity.handler.js';
import { ListActivitiesHandler } from '../../application/activities/list-activities.handler.js';
import { ActivitiesController } from './activities.controller.js';
const WORK = Symbol('Activities_WORK');
@Module({
  controllers: [ActivitiesController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<Activity>> =>
        new TypeOrmUnitOfWork<CrudScope<Activity>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmActivityRepository(manager), references: new TypeOrmReferenceRepository(manager),
        })),
    },
    {
      provide: CreateActivityHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Activity>>): CreateActivityHandler => new CreateActivityHandler(work, systemCrudRuntime),
    },
    {
      provide: GetActivityHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Activity>>): GetActivityHandler => new GetActivityHandler(work),
    },
    {
      provide: UpdateActivityHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Activity>>): UpdateActivityHandler => new UpdateActivityHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteActivityHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Activity>>): DeleteActivityHandler => new DeleteActivityHandler(work),
    },
    {
      provide: ListActivitiesHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Activity>>): ListActivitiesHandler => new ListActivitiesHandler(work),
    },
  ],
})
export class ActivitiesModule {}
