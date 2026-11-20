import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';
import type { Workflow } from '../../domain/entities/workflow.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '@casepilot/abstractions/typeorm';
import { TypeOrmWorkflowRepository } from '../../infrastructure/persistence/repositories/typeorm-workflow.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { TypeOrmUserRepository } from '../../infrastructure/persistence/repositories/typeorm-user.repository.js';
import { TypeOrmUserIdentityRepository } from '../../infrastructure/persistence/repositories/typeorm-user-identity.repository.js';
import { TypeOrmMemberRepository } from '../../infrastructure/persistence/repositories/typeorm-member.repository.js';
import { systemCrudRuntime } from '@casepilot/abstractions/node';
import { CreateWorkflowHandler } from '../../application/workflows/create-workflow/create-workflow.handler.js';
import { GetWorkflowHandler } from '../../application/workflows/get-workflow/get-workflow.handler.js';
import { UpdateWorkflowHandler } from '../../application/workflows/update-workflow/update-workflow.handler.js';
import { DeleteWorkflowHandler } from '../../application/workflows/delete-workflow/delete-workflow.handler.js';
import { ListWorkflowsHandler } from '../../application/workflows/list-workflows/list-workflows.handler.js';
import { WorkflowsController } from './workflows.controller.js';
const WORK = Symbol('Workflows_WORK');
@Module({
  controllers: [WorkflowsController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<Workflow>> =>
        new TypeOrmUnitOfWork<CrudScope<Workflow>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmWorkflowRepository(manager), references: new TypeOrmReferenceRepository(manager), users: new TypeOrmUserRepository(manager), userIdentities: new TypeOrmUserIdentityRepository(manager), members: new TypeOrmMemberRepository(manager),
        })),
    },
    {
      provide: CreateWorkflowHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Workflow>>): CreateWorkflowHandler => new CreateWorkflowHandler(work, systemCrudRuntime),
    },
    {
      provide: GetWorkflowHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Workflow>>): GetWorkflowHandler => new GetWorkflowHandler(work),
    },
    {
      provide: UpdateWorkflowHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Workflow>>): UpdateWorkflowHandler => new UpdateWorkflowHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteWorkflowHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Workflow>>): DeleteWorkflowHandler => new DeleteWorkflowHandler(work),
    },
    {
      provide: ListWorkflowsHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Workflow>>): ListWorkflowsHandler => new ListWorkflowsHandler(work),
    },
  ],
})
export class WorkflowsModule {}
