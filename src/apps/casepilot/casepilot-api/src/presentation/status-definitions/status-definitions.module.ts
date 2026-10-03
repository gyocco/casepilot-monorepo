import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';
import type { StatusDefinition } from '../../domain/entities/status-definition.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '@casepilot/abstractions/typeorm';
import { TypeOrmStatusDefinitionRepository } from '../../infrastructure/persistence/repositories/typeorm-status-definition.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { systemCrudRuntime } from '@casepilot/abstractions/node';
import { CreateStatusDefinitionHandler } from '../../application/status-definitions/create-status-definition.handler.js';
import { GetStatusDefinitionHandler } from '../../application/status-definitions/get-status-definition.handler.js';
import { UpdateStatusDefinitionHandler } from '../../application/status-definitions/update-status-definition.handler.js';
import { DeleteStatusDefinitionHandler } from '../../application/status-definitions/delete-status-definition.handler.js';
import { ListStatusDefinitionsHandler } from '../../application/status-definitions/list-status-definitions.handler.js';
import { StatusDefinitionsController } from './status-definitions.controller.js';
const WORK = Symbol('StatusDefinitions_WORK');
@Module({
  controllers: [StatusDefinitionsController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<StatusDefinition>> =>
        new TypeOrmUnitOfWork<CrudScope<StatusDefinition>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmStatusDefinitionRepository(manager), references: new TypeOrmReferenceRepository(manager),
        })),
    },
    {
      provide: CreateStatusDefinitionHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<StatusDefinition>>): CreateStatusDefinitionHandler => new CreateStatusDefinitionHandler(work, systemCrudRuntime),
    },
    {
      provide: GetStatusDefinitionHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<StatusDefinition>>): GetStatusDefinitionHandler => new GetStatusDefinitionHandler(work),
    },
    {
      provide: UpdateStatusDefinitionHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<StatusDefinition>>): UpdateStatusDefinitionHandler => new UpdateStatusDefinitionHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteStatusDefinitionHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<StatusDefinition>>): DeleteStatusDefinitionHandler => new DeleteStatusDefinitionHandler(work),
    },
    {
      provide: ListStatusDefinitionsHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<StatusDefinition>>): ListStatusDefinitionsHandler => new ListStatusDefinitionsHandler(work),
    },
  ],
})
export class StatusDefinitionsModule {}
