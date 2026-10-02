import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';
import type { Event } from '../../domain/entities/event.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '../../infrastructure/database/database-connection.js';
import { TypeOrmEventRepository } from '../../infrastructure/persistence/repositories/typeorm-event.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { systemCrudRuntime } from '../../infrastructure/system-crud-runtime.js';
import { CreateEventHandler } from '../../application/events/create-event.handler.js';
import { GetEventHandler } from '../../application/events/get-event.handler.js';
import { UpdateEventHandler } from '../../application/events/update-event.handler.js';
import { DeleteEventHandler } from '../../application/events/delete-event.handler.js';
import { ListEventsHandler } from '../../application/events/list-events.handler.js';
import { EventsController } from './events.controller.js';
const WORK = Symbol('Events_WORK');
@Module({
  controllers: [EventsController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<Event>> =>
        new TypeOrmUnitOfWork<CrudScope<Event>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmEventRepository(manager), references: new TypeOrmReferenceRepository(manager),
        })),
    },
    {
      provide: CreateEventHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Event>>): CreateEventHandler => new CreateEventHandler(work, systemCrudRuntime),
    },
    {
      provide: GetEventHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Event>>): GetEventHandler => new GetEventHandler(work),
    },
    {
      provide: UpdateEventHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Event>>): UpdateEventHandler => new UpdateEventHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteEventHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Event>>): DeleteEventHandler => new DeleteEventHandler(work),
    },
    {
      provide: ListEventsHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Event>>): ListEventsHandler => new ListEventsHandler(work),
    },
  ],
})
export class EventsModule {}
