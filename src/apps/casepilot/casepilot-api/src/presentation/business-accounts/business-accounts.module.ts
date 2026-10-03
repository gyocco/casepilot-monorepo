import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';
import type { BusinessAccount } from '../../domain/entities/business-account.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '@casepilot/abstractions/typeorm';
import { TypeOrmBusinessAccountRepository } from '../../infrastructure/persistence/repositories/typeorm-business-account.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { systemCrudRuntime } from '@casepilot/abstractions/node';
import { CreateBusinessAccountHandler } from '../../application/business-accounts/create-business-account.handler.js';
import { GetBusinessAccountHandler } from '../../application/business-accounts/get-business-account.handler.js';
import { UpdateBusinessAccountHandler } from '../../application/business-accounts/update-business-account.handler.js';
import { DeleteBusinessAccountHandler } from '../../application/business-accounts/delete-business-account.handler.js';
import { ListBusinessAccountsHandler } from '../../application/business-accounts/list-business-accounts.handler.js';
import { BusinessAccountsController } from './business-accounts.controller.js';
const WORK = Symbol('BusinessAccounts_WORK');
@Module({
  controllers: [BusinessAccountsController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<BusinessAccount>> =>
        new TypeOrmUnitOfWork<CrudScope<BusinessAccount>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmBusinessAccountRepository(manager), references: new TypeOrmReferenceRepository(manager),
        })),
    },
    {
      provide: CreateBusinessAccountHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<BusinessAccount>>): CreateBusinessAccountHandler => new CreateBusinessAccountHandler(work, systemCrudRuntime),
    },
    {
      provide: GetBusinessAccountHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<BusinessAccount>>): GetBusinessAccountHandler => new GetBusinessAccountHandler(work),
    },
    {
      provide: UpdateBusinessAccountHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<BusinessAccount>>): UpdateBusinessAccountHandler => new UpdateBusinessAccountHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteBusinessAccountHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<BusinessAccount>>): DeleteBusinessAccountHandler => new DeleteBusinessAccountHandler(work),
    },
    {
      provide: ListBusinessAccountsHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<BusinessAccount>>): ListBusinessAccountsHandler => new ListBusinessAccountsHandler(work),
    },
  ],
})
export class BusinessAccountsModule {}
