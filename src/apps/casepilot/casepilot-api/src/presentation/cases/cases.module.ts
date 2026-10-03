import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';
import type { Case } from '../../domain/entities/case.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '@casepilot/abstractions/typeorm';
import { TypeOrmCaseRepository } from '../../infrastructure/persistence/repositories/typeorm-case.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { systemCrudRuntime } from '@casepilot/abstractions/node';
import { CreateCaseHandler } from '../../application/cases/create-case.handler.js';
import { GetCaseHandler } from '../../application/cases/get-case.handler.js';
import { UpdateCaseHandler } from '../../application/cases/update-case.handler.js';
import { DeleteCaseHandler } from '../../application/cases/delete-case.handler.js';
import { ListCasesHandler } from '../../application/cases/list-cases.handler.js';
import { CasesController } from './cases.controller.js';
const WORK = Symbol('Cases_WORK');
@Module({
  controllers: [CasesController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<Case>> =>
        new TypeOrmUnitOfWork<CrudScope<Case>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmCaseRepository(manager), references: new TypeOrmReferenceRepository(manager),
        })),
    },
    {
      provide: CreateCaseHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Case>>): CreateCaseHandler => new CreateCaseHandler(work, systemCrudRuntime),
    },
    {
      provide: GetCaseHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Case>>): GetCaseHandler => new GetCaseHandler(work),
    },
    {
      provide: UpdateCaseHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Case>>): UpdateCaseHandler => new UpdateCaseHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteCaseHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Case>>): DeleteCaseHandler => new DeleteCaseHandler(work),
    },
    {
      provide: ListCasesHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Case>>): ListCasesHandler => new ListCasesHandler(work),
    },
  ],
})
export class CasesModule {}
