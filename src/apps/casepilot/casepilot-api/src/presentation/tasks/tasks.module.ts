import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';
import type { Task } from '../../domain/entities/task.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '@casepilot/abstractions/typeorm';
import { TypeOrmTaskRepository } from '../../infrastructure/persistence/repositories/typeorm-task.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { TypeOrmUserRepository } from '../../infrastructure/persistence/repositories/typeorm-user.repository.js';
import { TypeOrmUserIdentityRepository } from '../../infrastructure/persistence/repositories/typeorm-user-identity.repository.js';
import { TypeOrmMemberRepository } from '../../infrastructure/persistence/repositories/typeorm-member.repository.js';
import { systemCrudRuntime } from '@casepilot/abstractions/node';
import { CreateTaskHandler } from '../../application/tasks/create-task/create-task.handler.js';
import { GetTaskHandler } from '../../application/tasks/get-task/get-task.handler.js';
import { UpdateTaskHandler } from '../../application/tasks/update-task/update-task.handler.js';
import { DeleteTaskHandler } from '../../application/tasks/delete-task/delete-task.handler.js';
import { ListTasksHandler } from '../../application/tasks/list-tasks/list-tasks.handler.js';
import { TasksController } from './tasks.controller.js';
const WORK = Symbol('Tasks_WORK');
@Module({
  controllers: [TasksController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<Task>> =>
        new TypeOrmUnitOfWork<CrudScope<Task>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmTaskRepository(manager), references: new TypeOrmReferenceRepository(manager), users: new TypeOrmUserRepository(manager), userIdentities: new TypeOrmUserIdentityRepository(manager), members: new TypeOrmMemberRepository(manager),
        })),
    },
    {
      provide: CreateTaskHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Task>>): CreateTaskHandler => new CreateTaskHandler(work, systemCrudRuntime),
    },
    {
      provide: GetTaskHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Task>>): GetTaskHandler => new GetTaskHandler(work),
    },
    {
      provide: UpdateTaskHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Task>>): UpdateTaskHandler => new UpdateTaskHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteTaskHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Task>>): DeleteTaskHandler => new DeleteTaskHandler(work),
    },
    {
      provide: ListTasksHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Task>>): ListTasksHandler => new ListTasksHandler(work),
    },
  ],
})
export class TasksModule {}
