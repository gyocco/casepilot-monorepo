import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';
import type { Deadline } from '../../domain/entities/deadline.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '@casepilot/abstractions/typeorm';
import { TypeOrmDeadlineRepository } from '../../infrastructure/persistence/repositories/typeorm-deadline.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { systemCrudRuntime } from '@casepilot/abstractions/node';
import { CreateDeadlineHandler } from '../../application/deadlines/create-deadline.handler.js';
import { GetDeadlineHandler } from '../../application/deadlines/get-deadline.handler.js';
import { UpdateDeadlineHandler } from '../../application/deadlines/update-deadline.handler.js';
import { DeleteDeadlineHandler } from '../../application/deadlines/delete-deadline.handler.js';
import { ListDeadlinesHandler } from '../../application/deadlines/list-deadlines.handler.js';
import { DeadlinesController } from './deadlines.controller.js';
const WORK = Symbol('Deadlines_WORK');
@Module({
  controllers: [DeadlinesController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<Deadline>> =>
        new TypeOrmUnitOfWork<CrudScope<Deadline>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmDeadlineRepository(manager), references: new TypeOrmReferenceRepository(manager),
        })),
    },
    {
      provide: CreateDeadlineHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Deadline>>): CreateDeadlineHandler => new CreateDeadlineHandler(work, systemCrudRuntime),
    },
    {
      provide: GetDeadlineHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Deadline>>): GetDeadlineHandler => new GetDeadlineHandler(work),
    },
    {
      provide: UpdateDeadlineHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Deadline>>): UpdateDeadlineHandler => new UpdateDeadlineHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteDeadlineHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Deadline>>): DeleteDeadlineHandler => new DeleteDeadlineHandler(work),
    },
    {
      provide: ListDeadlinesHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Deadline>>): ListDeadlinesHandler => new ListDeadlinesHandler(work),
    },
  ],
})
export class DeadlinesModule {}
