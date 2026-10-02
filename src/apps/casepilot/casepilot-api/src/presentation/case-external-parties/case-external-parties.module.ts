import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';
import type { CaseExternalParty } from '../../domain/entities/case-external-party.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '../../infrastructure/database/database-connection.js';
import { TypeOrmCaseExternalPartyRepository } from '../../infrastructure/persistence/repositories/typeorm-case-external-party.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { systemCrudRuntime } from '../../infrastructure/system-crud-runtime.js';
import { CreateCaseExternalPartyHandler } from '../../application/case-external-parties/create-case-external-party.handler.js';
import { GetCaseExternalPartyHandler } from '../../application/case-external-parties/get-case-external-party.handler.js';
import { UpdateCaseExternalPartyHandler } from '../../application/case-external-parties/update-case-external-party.handler.js';
import { DeleteCaseExternalPartyHandler } from '../../application/case-external-parties/delete-case-external-party.handler.js';
import { ListCaseExternalPartiesHandler } from '../../application/case-external-parties/list-case-external-parties.handler.js';
import { CaseExternalPartiesController } from './case-external-parties.controller.js';
const WORK = Symbol('CaseExternalParties_WORK');
@Module({
  controllers: [CaseExternalPartiesController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<CaseExternalParty>> =>
        new TypeOrmUnitOfWork<CrudScope<CaseExternalParty>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmCaseExternalPartyRepository(manager), references: new TypeOrmReferenceRepository(manager),
        })),
    },
    {
      provide: CreateCaseExternalPartyHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CaseExternalParty>>): CreateCaseExternalPartyHandler => new CreateCaseExternalPartyHandler(work, systemCrudRuntime),
    },
    {
      provide: GetCaseExternalPartyHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CaseExternalParty>>): GetCaseExternalPartyHandler => new GetCaseExternalPartyHandler(work),
    },
    {
      provide: UpdateCaseExternalPartyHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CaseExternalParty>>): UpdateCaseExternalPartyHandler => new UpdateCaseExternalPartyHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteCaseExternalPartyHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CaseExternalParty>>): DeleteCaseExternalPartyHandler => new DeleteCaseExternalPartyHandler(work),
    },
    {
      provide: ListCaseExternalPartiesHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CaseExternalParty>>): ListCaseExternalPartiesHandler => new ListCaseExternalPartiesHandler(work),
    },
  ],
})
export class CaseExternalPartiesModule {}
