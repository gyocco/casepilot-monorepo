import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';
import type { Communication } from '../../domain/entities/communication.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '@casepilot/abstractions/typeorm';
import { TypeOrmCommunicationRepository } from '../../infrastructure/persistence/repositories/typeorm-communication.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { systemCrudRuntime } from '@casepilot/abstractions/node';
import { CreateCommunicationHandler } from '../../application/communications/create-communication/create-communication.handler.js';
import { GetCommunicationHandler } from '../../application/communications/get-communication/get-communication.handler.js';
import { UpdateCommunicationHandler } from '../../application/communications/update-communication/update-communication.handler.js';
import { DeleteCommunicationHandler } from '../../application/communications/delete-communication/delete-communication.handler.js';
import { ListCommunicationsHandler } from '../../application/communications/list-communications/list-communications.handler.js';
import { CommunicationsController } from './communications.controller.js';
const WORK = Symbol('Communications_WORK');
@Module({
  controllers: [CommunicationsController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<Communication>> =>
        new TypeOrmUnitOfWork<CrudScope<Communication>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmCommunicationRepository(manager), references: new TypeOrmReferenceRepository(manager),
        })),
    },
    {
      provide: CreateCommunicationHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Communication>>): CreateCommunicationHandler => new CreateCommunicationHandler(work, systemCrudRuntime),
    },
    {
      provide: GetCommunicationHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Communication>>): GetCommunicationHandler => new GetCommunicationHandler(work),
    },
    {
      provide: UpdateCommunicationHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Communication>>): UpdateCommunicationHandler => new UpdateCommunicationHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteCommunicationHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Communication>>): DeleteCommunicationHandler => new DeleteCommunicationHandler(work),
    },
    {
      provide: ListCommunicationsHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Communication>>): ListCommunicationsHandler => new ListCommunicationsHandler(work),
    },
  ],
})
export class CommunicationsModule {}
