import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import type { VerifiedIdentity } from '@casepilot/auth';
import { CurrentIdentity } from '@casepilot/auth/nestjs';
import { CreateDeadlineHandler } from '../../application/deadlines/create-deadline/create-deadline.handler.js';
import { GetDeadlineHandler } from '../../application/deadlines/get-deadline/get-deadline.handler.js';
import { UpdateDeadlineHandler } from '../../application/deadlines/update-deadline/update-deadline.handler.js';
import { DeleteDeadlineHandler } from '../../application/deadlines/delete-deadline/delete-deadline.handler.js';
import { ListDeadlinesHandler } from '../../application/deadlines/list-deadlines/list-deadlines.handler.js';
import { CreateDeadlineRequest } from '../../application/deadlines/create-deadline/create-deadline.request.js';
import { GetDeadlineRequest } from '../../application/deadlines/get-deadline/get-deadline.request.js';
import { UpdateDeadlineRequest } from '../../application/deadlines/update-deadline/update-deadline.request.js';
import { DeleteDeadlineRequest } from '../../application/deadlines/delete-deadline/delete-deadline.request.js';
import { ListDeadlinesRequest } from '../../application/deadlines/list-deadlines/list-deadlines.request.js';
import { readBody, numberValue, numberQuery, textQuery, stringValue, optionalString, choiceValue, optionalChoice, nullableString, PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import { DeadlineItemHttpResponse, DeadlinesPageHttpResponse, DeleteDeadlineHttpResponse, toDeadlineHttpResponse } from './deadline-http.response.js';

@Controller('business-accounts/:businessAccountId/deadlines')
export class DeadlinesController {
  constructor(
    @Inject(CreateDeadlineHandler) private readonly createHandler: CreateDeadlineHandler,
    @Inject(GetDeadlineHandler) private readonly getHandler: GetDeadlineHandler,
    @Inject(UpdateDeadlineHandler) private readonly updateHandler: UpdateDeadlineHandler,
    @Inject(DeleteDeadlineHandler) private readonly deleteHandler: DeleteDeadlineHandler,
    @Inject(ListDeadlinesHandler) private readonly listHandler: ListDeadlinesHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<DeadlineItemHttpResponse> {
    const body = readBody(input, ['caseId', 'title', 'dueAt', 'status', 'responsibleMemberId', 'completedAt', 'notes']);
    const response = await this.createHandler.execute(new CreateDeadlineRequest(businessAccountId, {
      caseId: stringValue(body, 'caseId'),
      title: stringValue(body, 'title'),
      dueAt: stringValue(body, 'dueAt'),
      status: choiceValue(body, 'status', ['PENDING', 'COMPLETED', 'MISSED', 'CANCELLED']),
      responsibleMemberId: nullableString(body, 'responsibleMemberId'),
      completedAt: nullableString(body, 'completedAt'),
      notes: nullableString(body, 'notes'),
    }, actor));
    return new DeadlineItemHttpResponse(toDeadlineHttpResponse(response.item));
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
  ): Promise<DeadlinesPageHttpResponse> {
    const response = await this.listHandler.execute(new ListDeadlinesRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc'), actor));
    return new DeadlinesPageHttpResponse(response.items.map(toDeadlineHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<DeadlineItemHttpResponse> {
    const response = await this.getHandler.execute(new GetDeadlineRequest(businessAccountId, id, actor));
    return new DeadlineItemHttpResponse(toDeadlineHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<DeadlineItemHttpResponse> {
    const body = readBody(input, ['version', 'caseId', 'title', 'dueAt', 'status', 'responsibleMemberId', 'completedAt', 'notes']);
    const response = await this.updateHandler.execute(new UpdateDeadlineRequest(businessAccountId, id, numberValue(body, 'version'), {
      caseId: optionalString(body, 'caseId'),
      title: optionalString(body, 'title'),
      dueAt: optionalString(body, 'dueAt'),
      status: optionalChoice(body, 'status', ['PENDING', 'COMPLETED', 'MISSED', 'CANCELLED']),
      responsibleMemberId: nullableString(body, 'responsibleMemberId'),
      completedAt: nullableString(body, 'completedAt'),
      notes: nullableString(body, 'notes'),
    }, actor));
    return new DeadlineItemHttpResponse(toDeadlineHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteDeadlineHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteDeadlineRequest(businessAccountId, id, numberQuery(version), actor));
    return new DeleteDeadlineHttpResponse(response.id, response.deleted);
  }
}
