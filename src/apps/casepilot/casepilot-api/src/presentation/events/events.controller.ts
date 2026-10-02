import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateEventHandler } from '../../application/events/create-event.handler.js';
import { GetEventHandler } from '../../application/events/get-event.handler.js';
import { UpdateEventHandler } from '../../application/events/update-event.handler.js';
import { DeleteEventHandler } from '../../application/events/delete-event.handler.js';
import { ListEventsHandler } from '../../application/events/list-events.handler.js';
import { CreateEventRequest, GetEventRequest, UpdateEventRequest, DeleteEventRequest, ListEventsRequest } from '../../application/events/event.models.js';
import { readBody, numberValue, numberQuery, textQuery, nullableString, stringValue, optionalString, booleanValue, optionalBoolean, PageMetadataHttpResponse } from '../shared/crud-http.js';
import { EventItemHttpResponse, EventsPageHttpResponse, DeleteEventHttpResponse, toEventHttpResponse } from './event-http.response.js';

@Controller('business-accounts/:businessAccountId/events')
export class EventsController {
  constructor(
    @Inject(CreateEventHandler) private readonly createHandler: CreateEventHandler,
    @Inject(GetEventHandler) private readonly getHandler: GetEventHandler,
    @Inject(UpdateEventHandler) private readonly updateHandler: UpdateEventHandler,
    @Inject(DeleteEventHandler) private readonly deleteHandler: DeleteEventHandler,
    @Inject(ListEventsHandler) private readonly listHandler: ListEventsHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<EventItemHttpResponse> {
    const body = readBody(input, ['caseId', 'title', 'description', 'eventType', 'startsAt', 'endsAt', 'allDay', 'location', 'createdByMemberId']);
    const response = await this.createHandler.execute(new CreateEventRequest(businessAccountId, {
      caseId: nullableString(body, 'caseId'),
      title: stringValue(body, 'title'),
      description: nullableString(body, 'description'),
      eventType: nullableString(body, 'eventType'),
      startsAt: stringValue(body, 'startsAt'),
      endsAt: nullableString(body, 'endsAt'),
      allDay: booleanValue(body, 'allDay'),
      location: nullableString(body, 'location'),
      createdByMemberId: stringValue(body, 'createdByMemberId'),
    }));
    return new EventItemHttpResponse(toEventHttpResponse(response.item));
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(
    @Param('businessAccountId') businessAccountId: string,
    @Query('pageNumber') pageNumber: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortDirection') sortDirection: string | undefined,
  ): Promise<EventsPageHttpResponse> {
    const response = await this.listHandler.execute(new ListEventsRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc')));
    return new EventsPageHttpResponse(response.items.map(toEventHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<EventItemHttpResponse> {
    const response = await this.getHandler.execute(new GetEventRequest(businessAccountId, id));
    return new EventItemHttpResponse(toEventHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<EventItemHttpResponse> {
    const body = readBody(input, ['version', 'caseId', 'title', 'description', 'eventType', 'startsAt', 'endsAt', 'allDay', 'location', 'createdByMemberId']);
    const response = await this.updateHandler.execute(new UpdateEventRequest(businessAccountId, id, numberValue(body, 'version'), {
      caseId: nullableString(body, 'caseId'),
      title: optionalString(body, 'title'),
      description: nullableString(body, 'description'),
      eventType: nullableString(body, 'eventType'),
      startsAt: optionalString(body, 'startsAt'),
      endsAt: nullableString(body, 'endsAt'),
      allDay: optionalBoolean(body, 'allDay'),
      location: nullableString(body, 'location'),
      createdByMemberId: optionalString(body, 'createdByMemberId'),
    }));
    return new EventItemHttpResponse(toEventHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteEventHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteEventRequest(businessAccountId, id, numberQuery(version)));
    return new DeleteEventHttpResponse(response.id, response.deleted);
  }
}
