import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import type { VerifiedIdentity } from '@casepilot/auth';
import { CurrentIdentity } from '@casepilot/auth/nestjs';
import { CreateTaskHandler } from '../../application/tasks/create-task/create-task.handler.js';
import { GetTaskHandler } from '../../application/tasks/get-task/get-task.handler.js';
import { UpdateTaskHandler } from '../../application/tasks/update-task/update-task.handler.js';
import { DeleteTaskHandler } from '../../application/tasks/delete-task/delete-task.handler.js';
import { ListTasksHandler } from '../../application/tasks/list-tasks/list-tasks.handler.js';
import { CreateTaskRequest } from '../../application/tasks/create-task/create-task.request.js';
import { GetTaskRequest } from '../../application/tasks/get-task/get-task.request.js';
import { UpdateTaskRequest } from '../../application/tasks/update-task/update-task.request.js';
import { DeleteTaskRequest } from '../../application/tasks/delete-task/delete-task.request.js';
import { ListTasksRequest } from '../../application/tasks/list-tasks/list-tasks.request.js';
import { readBody, numberValue, numberQuery, textQuery, nullableString, stringValue, optionalString, PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import { TaskItemHttpResponse, TasksPageHttpResponse, DeleteTaskHttpResponse, toTaskHttpResponse } from './task-http.response.js';

@Controller('business-accounts/:businessAccountId/tasks')
export class TasksController {
  constructor(
    @Inject(CreateTaskHandler) private readonly createHandler: CreateTaskHandler,
    @Inject(GetTaskHandler) private readonly getHandler: GetTaskHandler,
    @Inject(UpdateTaskHandler) private readonly updateHandler: UpdateTaskHandler,
    @Inject(DeleteTaskHandler) private readonly deleteHandler: DeleteTaskHandler,
    @Inject(ListTasksHandler) private readonly listHandler: ListTasksHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<TaskItemHttpResponse> {
    const body = readBody(input, ['caseId', 'title', 'description', 'status', 'priority', 'assignedMemberId', 'createdByMemberId', 'dueAt', 'completedAt']);
    const response = await this.createHandler.execute(new CreateTaskRequest(businessAccountId, {
      caseId: nullableString(body, 'caseId'),
      title: stringValue(body, 'title'),
      description: nullableString(body, 'description'),
      status: stringValue(body, 'status'),
      priority: nullableString(body, 'priority'),
      assignedMemberId: nullableString(body, 'assignedMemberId'),
      createdByMemberId: stringValue(body, 'createdByMemberId'),
      dueAt: nullableString(body, 'dueAt'),
      completedAt: nullableString(body, 'completedAt'),
    }, actor));
    return new TaskItemHttpResponse(toTaskHttpResponse(response.item));
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(
    @CurrentIdentity() actor: VerifiedIdentity,
    @Param('businessAccountId') businessAccountId: string,
    @Query('pageNumber') pageNumber: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortDirection') sortDirection: string | undefined,
  ): Promise<TasksPageHttpResponse> {
    const response = await this.listHandler.execute(new ListTasksRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc'), actor));
    return new TasksPageHttpResponse(response.items.map(toTaskHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<TaskItemHttpResponse> {
    const response = await this.getHandler.execute(new GetTaskRequest(businessAccountId, id, actor));
    return new TaskItemHttpResponse(toTaskHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<TaskItemHttpResponse> {
    const body = readBody(input, ['version', 'caseId', 'title', 'description', 'status', 'priority', 'assignedMemberId', 'createdByMemberId', 'dueAt', 'completedAt']);
    const response = await this.updateHandler.execute(new UpdateTaskRequest(businessAccountId, id, numberValue(body, 'version'), {
      caseId: nullableString(body, 'caseId'),
      title: optionalString(body, 'title'),
      description: nullableString(body, 'description'),
      status: optionalString(body, 'status'),
      priority: nullableString(body, 'priority'),
      assignedMemberId: nullableString(body, 'assignedMemberId'),
      createdByMemberId: optionalString(body, 'createdByMemberId'),
      dueAt: nullableString(body, 'dueAt'),
      completedAt: nullableString(body, 'completedAt'),
    }, actor));
    return new TaskItemHttpResponse(toTaskHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteTaskHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteTaskRequest(businessAccountId, id, numberQuery(version), actor));
    return new DeleteTaskHttpResponse(response.id, response.deleted);
  }
}
