import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateTaskHandler } from '../../application/tasks/create-task.handler.js';
import { GetTaskHandler } from '../../application/tasks/get-task.handler.js';
import { UpdateTaskHandler } from '../../application/tasks/update-task.handler.js';
import { DeleteTaskHandler } from '../../application/tasks/delete-task.handler.js';
import { ListTasksHandler } from '../../application/tasks/list-tasks.handler.js';
import { CreateTaskRequest, GetTaskRequest, UpdateTaskRequest, DeleteTaskRequest, ListTasksRequest } from '../../application/tasks/task.models.js';
import { readBody, numberValue, numberQuery, textQuery, nullableString, stringValue, optionalString, PageMetadataHttpResponse } from '../shared/crud-http.js';
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
  async create(@Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<TaskItemHttpResponse> {
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
    }));
    return new TaskItemHttpResponse(toTaskHttpResponse(response.item));
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(
    @Param('businessAccountId') businessAccountId: string,
    @Query('pageNumber') pageNumber: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortDirection') sortDirection: string | undefined,
  ): Promise<TasksPageHttpResponse> {
    const response = await this.listHandler.execute(new ListTasksRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc')));
    return new TasksPageHttpResponse(response.items.map(toTaskHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<TaskItemHttpResponse> {
    const response = await this.getHandler.execute(new GetTaskRequest(businessAccountId, id));
    return new TaskItemHttpResponse(toTaskHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<TaskItemHttpResponse> {
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
    }));
    return new TaskItemHttpResponse(toTaskHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteTaskHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteTaskRequest(businessAccountId, id, numberQuery(version)));
    return new DeleteTaskHttpResponse(response.id, response.deleted);
  }
}
