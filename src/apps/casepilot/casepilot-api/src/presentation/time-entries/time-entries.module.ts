import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/persistence/typeorm';
import type { TimeEntry } from '../../domain/entities/time-entry.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '@casepilot/persistence/typeorm';
import { TypeOrmTimeEntryRepository } from '../../infrastructure/persistence/repositories/typeorm-time-entry.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { TypeOrmUserRepository } from '../../infrastructure/persistence/repositories/typeorm-user.repository.js';
import { TypeOrmUserIdentityRepository } from '../../infrastructure/persistence/repositories/typeorm-user-identity.repository.js';
import { TypeOrmMemberRepository } from '../../infrastructure/persistence/repositories/typeorm-member.repository.js';
import { systemCrudRuntime } from '@casepilot/abstractions/node';
import { CreateTimeEntryHandler } from '../../application/time-entries/create-time-entry/create-time-entry.handler.js';
import { GetTimeEntryHandler } from '../../application/time-entries/get-time-entry/get-time-entry.handler.js';
import { UpdateTimeEntryHandler } from '../../application/time-entries/update-time-entry/update-time-entry.handler.js';
import { DeleteTimeEntryHandler } from '../../application/time-entries/delete-time-entry/delete-time-entry.handler.js';
import { ListTimeEntriesHandler } from '../../application/time-entries/list-time-entries/list-time-entries.handler.js';
import { TimeEntriesController } from './time-entries.controller.js';
const WORK = Symbol('TimeEntries_WORK');
@Module({
  controllers: [TimeEntriesController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<TimeEntry>> =>
        new TypeOrmUnitOfWork<CrudScope<TimeEntry>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmTimeEntryRepository(manager), references: new TypeOrmReferenceRepository(manager), users: new TypeOrmUserRepository(manager), userIdentities: new TypeOrmUserIdentityRepository(manager), members: new TypeOrmMemberRepository(manager),
        })),
    },
    {
      provide: CreateTimeEntryHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<TimeEntry>>): CreateTimeEntryHandler => new CreateTimeEntryHandler(work, systemCrudRuntime),
    },
    {
      provide: GetTimeEntryHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<TimeEntry>>): GetTimeEntryHandler => new GetTimeEntryHandler(work),
    },
    {
      provide: UpdateTimeEntryHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<TimeEntry>>): UpdateTimeEntryHandler => new UpdateTimeEntryHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteTimeEntryHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<TimeEntry>>): DeleteTimeEntryHandler => new DeleteTimeEntryHandler(work),
    },
    {
      provide: ListTimeEntriesHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<TimeEntry>>): ListTimeEntriesHandler => new ListTimeEntriesHandler(work),
    },
  ],
})
export class TimeEntriesModule {}
