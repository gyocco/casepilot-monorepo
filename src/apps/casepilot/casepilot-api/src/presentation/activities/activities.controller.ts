import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateActivityHandler } from '../../application/activities/create-activity.handler.js';
import { GetActivityHandler } from '../../application/activities/get-activity.handler.js';
import { UpdateActivityHandler } from '../../application/activities/update-activity.handler.js';
import { DeleteActivityHandler } from '../../application/activities/delete-activity.handler.js';
import { ListActivitiesHandler } from '../../application/activities/list-activities.handler.js';
import { CreateActivityRequest, GetActivityRequest, UpdateActivityRequest, DeleteActivityRequest, ListActivitiesRequest } from '../../application/activities/activity.models.js';
import { readBody, numberValue, numberQuery, textQuery, nullableString, stringValue, optionalString, nullableJson, PageMetadataHttpResponse } from '../shared/crud-http.js';
import { ActivityItemHttpResponse, ActivitiesPageHttpResponse, DeleteActivityHttpResponse, toActivityHttpResponse } from './activity-http.response.js';

@Controller('business-accounts/:businessAccountId/activities')
export class ActivitiesController {
  constructor(
    @Inject(CreateActivityHandler) private readonly createHandler: CreateActivityHandler,
    @Inject(GetActivityHandler) private readonly getHandler: GetActivityHandler,
    @Inject(UpdateActivityHandler) private readonly updateHandler: UpdateActivityHandler,
    @Inject(DeleteActivityHandler) private readonly deleteHandler: DeleteActivityHandler,
    @Inject(ListActivitiesHandler) private readonly listHandler: ListActivitiesHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<ActivityItemHttpResponse> {
    const body = readBody(input, ['actorMemberId', 'action', 'entityType', 'entityId', 'caseId', 'metadata', 'occurredAt']);
    const response = await this.createHandler.execute(new CreateActivityRequest(businessAccountId, {
      actorMemberId: nullableString(body, 'actorMemberId'),
      action: stringValue(body, 'action'),
      entityType: stringValue(body, 'entityType'),
      entityId: stringValue(body, 'entityId'),
      caseId: nullableString(body, 'caseId'),
      metadata: nullableJson(body, 'metadata'),
      occurredAt: stringValue(body, 'occurredAt'),
    }));
    return new ActivityItemHttpResponse(toActivityHttpResponse(response.item));
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(
    @Param('businessAccountId') businessAccountId: string,
    @Query('pageNumber') pageNumber: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortDirection') sortDirection: string | undefined,
  ): Promise<ActivitiesPageHttpResponse> {
    const response = await this.listHandler.execute(new ListActivitiesRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc')));
    return new ActivitiesPageHttpResponse(response.items.map(toActivityHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<ActivityItemHttpResponse> {
    const response = await this.getHandler.execute(new GetActivityRequest(businessAccountId, id));
    return new ActivityItemHttpResponse(toActivityHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<ActivityItemHttpResponse> {
    const body = readBody(input, ['version', 'actorMemberId', 'action', 'entityType', 'entityId', 'caseId', 'metadata', 'occurredAt']);
    const response = await this.updateHandler.execute(new UpdateActivityRequest(businessAccountId, id, numberValue(body, 'version'), {
      actorMemberId: nullableString(body, 'actorMemberId'),
      action: optionalString(body, 'action'),
      entityType: optionalString(body, 'entityType'),
      entityId: optionalString(body, 'entityId'),
      caseId: nullableString(body, 'caseId'),
      metadata: nullableJson(body, 'metadata'),
      occurredAt: optionalString(body, 'occurredAt'),
    }));
    return new ActivityItemHttpResponse(toActivityHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteActivityHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteActivityRequest(businessAccountId, id, numberQuery(version)));
    return new DeleteActivityHttpResponse(response.id, response.deleted);
  }
}
