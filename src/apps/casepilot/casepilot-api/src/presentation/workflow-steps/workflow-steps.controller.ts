import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateWorkflowStepHandler } from '../../application/workflow-steps/create-workflow-step/create-workflow-step.handler.js';
import { GetWorkflowStepHandler } from '../../application/workflow-steps/get-workflow-step/get-workflow-step.handler.js';
import { UpdateWorkflowStepHandler } from '../../application/workflow-steps/update-workflow-step/update-workflow-step.handler.js';
import { DeleteWorkflowStepHandler } from '../../application/workflow-steps/delete-workflow-step/delete-workflow-step.handler.js';
import { ListWorkflowStepsHandler } from '../../application/workflow-steps/list-workflow-steps/list-workflow-steps.handler.js';
import { CreateWorkflowStepRequest } from '../../application/workflow-steps/create-workflow-step/create-workflow-step.request.js';
import { GetWorkflowStepRequest } from '../../application/workflow-steps/get-workflow-step/get-workflow-step.request.js';
import { UpdateWorkflowStepRequest } from '../../application/workflow-steps/update-workflow-step/update-workflow-step.request.js';
import { DeleteWorkflowStepRequest } from '../../application/workflow-steps/delete-workflow-step/delete-workflow-step.request.js';
import { ListWorkflowStepsRequest } from '../../application/workflow-steps/list-workflow-steps/list-workflow-steps.request.js';
import { readBody, numberValue, numberQuery, textQuery, stringValue, optionalString, nullableString, optionalNumber, booleanValue, optionalBoolean, PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import { WorkflowStepItemHttpResponse, WorkflowStepsPageHttpResponse, DeleteWorkflowStepHttpResponse, toWorkflowStepHttpResponse } from './workflow-step-http.response.js';

@Controller('business-accounts/:businessAccountId/workflow-steps')
export class WorkflowStepsController {
  constructor(
    @Inject(CreateWorkflowStepHandler) private readonly createHandler: CreateWorkflowStepHandler,
    @Inject(GetWorkflowStepHandler) private readonly getHandler: GetWorkflowStepHandler,
    @Inject(UpdateWorkflowStepHandler) private readonly updateHandler: UpdateWorkflowStepHandler,
    @Inject(DeleteWorkflowStepHandler) private readonly deleteHandler: DeleteWorkflowStepHandler,
    @Inject(ListWorkflowStepsHandler) private readonly listHandler: ListWorkflowStepsHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<WorkflowStepItemHttpResponse> {
    const body = readBody(input, ['workflowId', 'statusDefinitionId', 'name', 'description', 'sortOrder', 'isInitial', 'isTerminal']);
    const response = await this.createHandler.execute(new CreateWorkflowStepRequest(businessAccountId, {
      workflowId: stringValue(body, 'workflowId'),
      statusDefinitionId: nullableString(body, 'statusDefinitionId'),
      name: stringValue(body, 'name'),
      description: nullableString(body, 'description'),
      sortOrder: numberValue(body, 'sortOrder'),
      isInitial: booleanValue(body, 'isInitial'),
      isTerminal: booleanValue(body, 'isTerminal'),
    }));
    return new WorkflowStepItemHttpResponse(toWorkflowStepHttpResponse(response.item));
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(
    @Param('businessAccountId') businessAccountId: string,
    @Query('pageNumber') pageNumber: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortDirection') sortDirection: string | undefined,
  ): Promise<WorkflowStepsPageHttpResponse> {
    const response = await this.listHandler.execute(new ListWorkflowStepsRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc')));
    return new WorkflowStepsPageHttpResponse(response.items.map(toWorkflowStepHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<WorkflowStepItemHttpResponse> {
    const response = await this.getHandler.execute(new GetWorkflowStepRequest(businessAccountId, id));
    return new WorkflowStepItemHttpResponse(toWorkflowStepHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<WorkflowStepItemHttpResponse> {
    const body = readBody(input, ['version', 'workflowId', 'statusDefinitionId', 'name', 'description', 'sortOrder', 'isInitial', 'isTerminal']);
    const response = await this.updateHandler.execute(new UpdateWorkflowStepRequest(businessAccountId, id, numberValue(body, 'version'), {
      workflowId: optionalString(body, 'workflowId'),
      statusDefinitionId: nullableString(body, 'statusDefinitionId'),
      name: optionalString(body, 'name'),
      description: nullableString(body, 'description'),
      sortOrder: optionalNumber(body, 'sortOrder'),
      isInitial: optionalBoolean(body, 'isInitial'),
      isTerminal: optionalBoolean(body, 'isTerminal'),
    }));
    return new WorkflowStepItemHttpResponse(toWorkflowStepHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteWorkflowStepHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteWorkflowStepRequest(businessAccountId, id, numberQuery(version)));
    return new DeleteWorkflowStepHttpResponse(response.id, response.deleted);
  }
}
