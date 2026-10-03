import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, PageResponse } from '@casepilot/abstractions';
import type { WorkflowStep } from '../../domain/entities/workflow-step.js';
import { ListWorkflowStepsResponse, toWorkflowStepResponse, type ListWorkflowStepsRequest } from './workflow-step.models.js';
import { type CrudScope } from '../shared/crud-models.js';
import { PageMetadataResponse } from '@casepilot/cqrs';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validatePage } from '../shared/crud-pagination.js';
import { workflow_stepSortFields } from './workflow-step.rules.js';

export class ListWorkflowStepsHandler implements Handler<ListWorkflowStepsRequest, ListWorkflowStepsResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<WorkflowStep>>) {}

  async execute(request: ListWorkflowStepsRequest): Promise<ListWorkflowStepsResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      const page = validatePage(request.pageNumber, request.pageSize, request.sortBy, request.sortDirection, workflow_stepSortFields);
      const items = await scope.resource.getPage(page, request.businessAccountId);
      const total = await scope.resource.count(request.businessAccountId);
      const result = new PageResponse(page, items, total);
      return new ListWorkflowStepsResponse(items.map(toWorkflowStepResponse), new PageMetadataResponse(result.pageNumber, result.pageSize, result.totalCount, result.totalPages, result.hasNextPage, result.hasPreviousPage));
    }, 'REPEATABLE READ'));
  }
}
