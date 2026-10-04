import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateWorkflowHandler } from '../../application/workflows/create-workflow/create-workflow.handler.js';
import { GetWorkflowHandler } from '../../application/workflows/get-workflow/get-workflow.handler.js';
import { UpdateWorkflowHandler } from '../../application/workflows/update-workflow/update-workflow.handler.js';
import { DeleteWorkflowHandler } from '../../application/workflows/delete-workflow/delete-workflow.handler.js';
import { ListWorkflowsHandler } from '../../application/workflows/list-workflows/list-workflows.handler.js';
import { CreateWorkflowRequest } from '../../application/workflows/create-workflow/create-workflow.request.js';
import { GetWorkflowRequest } from '../../application/workflows/get-workflow/get-workflow.request.js';
import { UpdateWorkflowRequest } from '../../application/workflows/update-workflow/update-workflow.request.js';
import { DeleteWorkflowRequest } from '../../application/workflows/delete-workflow/delete-workflow.request.js';
import { ListWorkflowsRequest } from '../../application/workflows/list-workflows/list-workflows.request.js';
import { readBody, numberValue, numberQuery, textQuery, stringValue, optionalString, nullableString, booleanValue, optionalBoolean, PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import { WorkflowItemHttpResponse, WorkflowsPageHttpResponse, DeleteWorkflowHttpResponse, toWorkflowHttpResponse } from './workflow-http.response.js';

@Controller('business-accounts/:businessAccountId/workflows')
export class WorkflowsController {
  constructor(
    @Inject(CreateWorkflowHandler) private readonly createHandler: CreateWorkflowHandler,
    @Inject(GetWorkflowHandler) private readonly getHandler: GetWorkflowHandler,
    @Inject(UpdateWorkflowHandler) private readonly updateHandler: UpdateWorkflowHandler,
    @Inject(DeleteWorkflowHandler) private readonly deleteHandler: DeleteWorkflowHandler,
    @Inject(ListWorkflowsHandler) private readonly listHandler: ListWorkflowsHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<WorkflowItemHttpResponse> {
    const body = readBody(input, ['name', 'description', 'isActive']);
    const response = await this.createHandler.execute(new CreateWorkflowRequest(businessAccountId, {
      name: stringValue(body, 'name'),
      description: nullableString(body, 'description'),
      isActive: booleanValue(body, 'isActive'),
    }));
    return new WorkflowItemHttpResponse(toWorkflowHttpResponse(response.item));
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(
    @Param('businessAccountId') businessAccountId: string,
    @Query('pageNumber') pageNumber: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortDirection') sortDirection: string | undefined,
  ): Promise<WorkflowsPageHttpResponse> {
    const response = await this.listHandler.execute(new ListWorkflowsRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc')));
    return new WorkflowsPageHttpResponse(response.items.map(toWorkflowHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<WorkflowItemHttpResponse> {
    const response = await this.getHandler.execute(new GetWorkflowRequest(businessAccountId, id));
    return new WorkflowItemHttpResponse(toWorkflowHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<WorkflowItemHttpResponse> {
    const body = readBody(input, ['version', 'name', 'description', 'isActive']);
    const response = await this.updateHandler.execute(new UpdateWorkflowRequest(businessAccountId, id, numberValue(body, 'version'), {
      name: optionalString(body, 'name'),
      description: nullableString(body, 'description'),
      isActive: optionalBoolean(body, 'isActive'),
    }));
    return new WorkflowItemHttpResponse(toWorkflowHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteWorkflowHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteWorkflowRequest(businessAccountId, id, numberQuery(version)));
    return new DeleteWorkflowHttpResponse(response.id, response.deleted);
  }
}
