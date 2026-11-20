import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';
import type { ExternalParty } from '../../domain/entities/external-party.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '@casepilot/abstractions/typeorm';
import { TypeOrmExternalPartyRepository } from '../../infrastructure/persistence/repositories/typeorm-external-party.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { TypeOrmUserRepository } from '../../infrastructure/persistence/repositories/typeorm-user.repository.js';
import { TypeOrmUserIdentityRepository } from '../../infrastructure/persistence/repositories/typeorm-user-identity.repository.js';
import { TypeOrmMemberRepository } from '../../infrastructure/persistence/repositories/typeorm-member.repository.js';
import { systemCrudRuntime } from '@casepilot/abstractions/node';
import { CreateExternalPartyHandler } from '../../application/external-parties/create-external-party/create-external-party.handler.js';
import { GetExternalPartyHandler } from '../../application/external-parties/get-external-party/get-external-party.handler.js';
import { UpdateExternalPartyHandler } from '../../application/external-parties/update-external-party/update-external-party.handler.js';
import { DeleteExternalPartyHandler } from '../../application/external-parties/delete-external-party/delete-external-party.handler.js';
import { ListExternalPartiesHandler } from '../../application/external-parties/list-external-parties/list-external-parties.handler.js';
import { ExternalPartiesController } from './external-parties.controller.js';
const WORK = Symbol('ExternalParties_WORK');
@Module({
  controllers: [ExternalPartiesController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<ExternalParty>> =>
        new TypeOrmUnitOfWork<CrudScope<ExternalParty>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmExternalPartyRepository(manager), references: new TypeOrmReferenceRepository(manager), users: new TypeOrmUserRepository(manager), userIdentities: new TypeOrmUserIdentityRepository(manager), members: new TypeOrmMemberRepository(manager),
        })),
    },
    {
      provide: CreateExternalPartyHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<ExternalParty>>): CreateExternalPartyHandler => new CreateExternalPartyHandler(work, systemCrudRuntime),
    },
    {
      provide: GetExternalPartyHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<ExternalParty>>): GetExternalPartyHandler => new GetExternalPartyHandler(work),
    },
    {
      provide: UpdateExternalPartyHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<ExternalParty>>): UpdateExternalPartyHandler => new UpdateExternalPartyHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteExternalPartyHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<ExternalParty>>): DeleteExternalPartyHandler => new DeleteExternalPartyHandler(work),
    },
    {
      provide: ListExternalPartiesHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<ExternalParty>>): ListExternalPartiesHandler => new ListExternalPartiesHandler(work),
    },
  ],
})
export class ExternalPartiesModule {}
