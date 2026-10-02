import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';
import type { WorkflowStep } from '../../domain/entities/workflow-step.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '../../infrastructure/database/database-connection.js';
import { TypeOrmWorkflowStepRepository } from '../../infrastructure/persistence/repositories/typeorm-workflow-step.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { systemCrudRuntime } from '../../infrastructure/system-crud-runtime.js';
import { CreateWorkflowStepHandler } from '../../application/workflow-steps/create-workflow-step.handler.js';
import { GetWorkflowStepHandler } from '../../application/workflow-steps/get-workflow-step.handler.js';
import { UpdateWorkflowStepHandler } from '../../application/workflow-steps/update-workflow-step.handler.js';
import { DeleteWorkflowStepHandler } from '../../application/workflow-steps/delete-workflow-step.handler.js';
import { ListWorkflowStepsHandler } from '../../application/workflow-steps/list-workflow-steps.handler.js';
import { WorkflowStepsController } from './workflow-steps.controller.js';
const WORK = Symbol('WorkflowSteps_WORK');
@Module({
  controllers: [WorkflowStepsController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<WorkflowStep>> =>
        new TypeOrmUnitOfWork<CrudScope<WorkflowStep>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmWorkflowStepRepository(manager), references: new TypeOrmReferenceRepository(manager),
        })),
    },
    {
      provide: CreateWorkflowStepHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<WorkflowStep>>): CreateWorkflowStepHandler => new CreateWorkflowStepHandler(work, systemCrudRuntime),
    },
    {
      provide: GetWorkflowStepHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<WorkflowStep>>): GetWorkflowStepHandler => new GetWorkflowStepHandler(work),
    },
    {
      provide: UpdateWorkflowStepHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<WorkflowStep>>): UpdateWorkflowStepHandler => new UpdateWorkflowStepHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteWorkflowStepHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<WorkflowStep>>): DeleteWorkflowStepHandler => new DeleteWorkflowStepHandler(work),
    },
    {
      provide: ListWorkflowStepsHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<WorkflowStep>>): ListWorkflowStepsHandler => new ListWorkflowStepsHandler(work),
    },
  ],
})
export class WorkflowStepsModule {}
