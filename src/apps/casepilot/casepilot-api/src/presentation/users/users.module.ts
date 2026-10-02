import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';
import type { User } from '../../domain/entities/user.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '../../infrastructure/database/database-connection.js';
import { TypeOrmUserRepository } from '../../infrastructure/persistence/repositories/typeorm-user.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { systemCrudRuntime } from '../../infrastructure/system-crud-runtime.js';
import { CreateUserHandler } from '../../application/users/create-user.handler.js';
import { GetUserHandler } from '../../application/users/get-user.handler.js';
import { UpdateUserHandler } from '../../application/users/update-user.handler.js';
import { DeleteUserHandler } from '../../application/users/delete-user.handler.js';
import { ListUsersHandler } from '../../application/users/list-users.handler.js';
import { UsersController } from './users.controller.js';
const WORK = Symbol('Users_WORK');
@Module({
  controllers: [UsersController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<User>> =>
        new TypeOrmUnitOfWork<CrudScope<User>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmUserRepository(manager), references: new TypeOrmReferenceRepository(manager),
        })),
    },
    {
      provide: CreateUserHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<User>>): CreateUserHandler => new CreateUserHandler(work, systemCrudRuntime),
    },
    {
      provide: GetUserHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<User>>): GetUserHandler => new GetUserHandler(work),
    },
    {
      provide: UpdateUserHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<User>>): UpdateUserHandler => new UpdateUserHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteUserHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<User>>): DeleteUserHandler => new DeleteUserHandler(work),
    },
    {
      provide: ListUsersHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<User>>): ListUsersHandler => new ListUsersHandler(work),
    },
  ],
})
export class UsersModule {}
