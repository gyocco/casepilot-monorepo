import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import type { VerifiedIdentity } from '@casepilot/auth';
import { CurrentIdentity } from '@casepilot/auth/nestjs';
import { CreateTimeEntryHandler } from '../../application/time-entries/create-time-entry/create-time-entry.handler.js';
import { GetTimeEntryHandler } from '../../application/time-entries/get-time-entry/get-time-entry.handler.js';
import { UpdateTimeEntryHandler } from '../../application/time-entries/update-time-entry/update-time-entry.handler.js';
import { DeleteTimeEntryHandler } from '../../application/time-entries/delete-time-entry/delete-time-entry.handler.js';
import { ListTimeEntriesHandler } from '../../application/time-entries/list-time-entries/list-time-entries.handler.js';
import { CreateTimeEntryRequest } from '../../application/time-entries/create-time-entry/create-time-entry.request.js';
import { GetTimeEntryRequest } from '../../application/time-entries/get-time-entry/get-time-entry.request.js';
import { UpdateTimeEntryRequest } from '../../application/time-entries/update-time-entry/update-time-entry.request.js';
import { DeleteTimeEntryRequest } from '../../application/time-entries/delete-time-entry/delete-time-entry.request.js';
import { ListTimeEntriesRequest } from '../../application/time-entries/list-time-entries/list-time-entries.request.js';
import { readBody, numberValue, numberQuery, textQuery, stringValue, optionalString, nullableString, optionalNumber, booleanValue, optionalBoolean, PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import { TimeEntryItemHttpResponse, TimeEntriesPageHttpResponse, DeleteTimeEntryHttpResponse, toTimeEntryHttpResponse } from './time-entry-http.response.js';

@Controller('business-accounts/:businessAccountId/time-entries')
export class TimeEntriesController {
  constructor(
    @Inject(CreateTimeEntryHandler) private readonly createHandler: CreateTimeEntryHandler,
    @Inject(GetTimeEntryHandler) private readonly getHandler: GetTimeEntryHandler,
    @Inject(UpdateTimeEntryHandler) private readonly updateHandler: UpdateTimeEntryHandler,
    @Inject(DeleteTimeEntryHandler) private readonly deleteHandler: DeleteTimeEntryHandler,
    @Inject(ListTimeEntriesHandler) private readonly listHandler: ListTimeEntriesHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<TimeEntryItemHttpResponse> {
    const body = readBody(input, ['caseId', 'memberId', 'taskId', 'description', 'startedAt', 'endedAt', 'durationMinutes', 'billable', 'hourlyRate', 'currency', 'invoiceLineId']);
    const response = await this.createHandler.execute(new CreateTimeEntryRequest(businessAccountId, {
      caseId: stringValue(body, 'caseId'),
      memberId: stringValue(body, 'memberId'),
      taskId: nullableString(body, 'taskId'),
      description: nullableString(body, 'description'),
      startedAt: nullableString(body, 'startedAt'),
      endedAt: nullableString(body, 'endedAt'),
      durationMinutes: numberValue(body, 'durationMinutes'),
      billable: booleanValue(body, 'billable'),
      hourlyRate: nullableString(body, 'hourlyRate'),
      currency: nullableString(body, 'currency'),
      invoiceLineId: nullableString(body, 'invoiceLineId'),
    }, actor));
    return new TimeEntryItemHttpResponse(toTimeEntryHttpResponse(response.item));
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
  ): Promise<TimeEntriesPageHttpResponse> {
    const response = await this.listHandler.execute(new ListTimeEntriesRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc'), actor));
    return new TimeEntriesPageHttpResponse(response.items.map(toTimeEntryHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<TimeEntryItemHttpResponse> {
    const response = await this.getHandler.execute(new GetTimeEntryRequest(businessAccountId, id, actor));
    return new TimeEntryItemHttpResponse(toTimeEntryHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<TimeEntryItemHttpResponse> {
    const body = readBody(input, ['version', 'caseId', 'memberId', 'taskId', 'description', 'startedAt', 'endedAt', 'durationMinutes', 'billable', 'hourlyRate', 'currency', 'invoiceLineId']);
    const response = await this.updateHandler.execute(new UpdateTimeEntryRequest(businessAccountId, id, numberValue(body, 'version'), {
      caseId: optionalString(body, 'caseId'),
      memberId: optionalString(body, 'memberId'),
      taskId: nullableString(body, 'taskId'),
      description: nullableString(body, 'description'),
      startedAt: nullableString(body, 'startedAt'),
      endedAt: nullableString(body, 'endedAt'),
      durationMinutes: optionalNumber(body, 'durationMinutes'),
      billable: optionalBoolean(body, 'billable'),
      hourlyRate: nullableString(body, 'hourlyRate'),
      currency: nullableString(body, 'currency'),
      invoiceLineId: nullableString(body, 'invoiceLineId'),
    }, actor));
    return new TimeEntryItemHttpResponse(toTimeEntryHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteTimeEntryHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteTimeEntryRequest(businessAccountId, id, numberQuery(version), actor));
    return new DeleteTimeEntryHttpResponse(response.id, response.deleted);
  }
}
