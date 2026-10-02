import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateCommunicationHandler } from '../../application/communications/create-communication.handler.js';
import { GetCommunicationHandler } from '../../application/communications/get-communication.handler.js';
import { UpdateCommunicationHandler } from '../../application/communications/update-communication.handler.js';
import { DeleteCommunicationHandler } from '../../application/communications/delete-communication.handler.js';
import { ListCommunicationsHandler } from '../../application/communications/list-communications.handler.js';
import { CreateCommunicationRequest, GetCommunicationRequest, UpdateCommunicationRequest, DeleteCommunicationRequest, ListCommunicationsRequest } from '../../application/communications/communication.models.js';
import { readBody, numberValue, numberQuery, textQuery, nullableString, choiceValue, optionalChoice, nullableChoice, stringValue, optionalString, PageMetadataHttpResponse } from '../shared/crud-http.js';
import { CommunicationItemHttpResponse, CommunicationsPageHttpResponse, DeleteCommunicationHttpResponse, toCommunicationHttpResponse } from './communication-http.response.js';

@Controller('business-accounts/:businessAccountId/communications')
export class CommunicationsController {
  constructor(
    @Inject(CreateCommunicationHandler) private readonly createHandler: CreateCommunicationHandler,
    @Inject(GetCommunicationHandler) private readonly getHandler: GetCommunicationHandler,
    @Inject(UpdateCommunicationHandler) private readonly updateHandler: UpdateCommunicationHandler,
    @Inject(DeleteCommunicationHandler) private readonly deleteHandler: DeleteCommunicationHandler,
    @Inject(ListCommunicationsHandler) private readonly listHandler: ListCommunicationsHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<CommunicationItemHttpResponse> {
    const body = readBody(input, ['caseId', 'externalPartyId', 'memberId', 'type', 'direction', 'subject', 'body', 'occurredAt', 'externalReference']);
    const response = await this.createHandler.execute(new CreateCommunicationRequest(businessAccountId, {
      caseId: nullableString(body, 'caseId'),
      externalPartyId: nullableString(body, 'externalPartyId'),
      memberId: nullableString(body, 'memberId'),
      type: choiceValue(body, 'type', ['EMAIL', 'PHONE', 'MEETING', 'MESSAGE', 'LETTER']),
      direction: nullableChoice(body, 'direction', ['INBOUND', 'OUTBOUND']),
      subject: nullableString(body, 'subject'),
      body: nullableString(body, 'body'),
      occurredAt: stringValue(body, 'occurredAt'),
      externalReference: nullableString(body, 'externalReference'),
    }));
    return new CommunicationItemHttpResponse(toCommunicationHttpResponse(response.item));
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(
    @Param('businessAccountId') businessAccountId: string,
    @Query('pageNumber') pageNumber: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortDirection') sortDirection: string | undefined,
  ): Promise<CommunicationsPageHttpResponse> {
    const response = await this.listHandler.execute(new ListCommunicationsRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc')));
    return new CommunicationsPageHttpResponse(response.items.map(toCommunicationHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<CommunicationItemHttpResponse> {
    const response = await this.getHandler.execute(new GetCommunicationRequest(businessAccountId, id));
    return new CommunicationItemHttpResponse(toCommunicationHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<CommunicationItemHttpResponse> {
    const body = readBody(input, ['version', 'caseId', 'externalPartyId', 'memberId', 'type', 'direction', 'subject', 'body', 'occurredAt', 'externalReference']);
    const response = await this.updateHandler.execute(new UpdateCommunicationRequest(businessAccountId, id, numberValue(body, 'version'), {
      caseId: nullableString(body, 'caseId'),
      externalPartyId: nullableString(body, 'externalPartyId'),
      memberId: nullableString(body, 'memberId'),
      type: optionalChoice(body, 'type', ['EMAIL', 'PHONE', 'MEETING', 'MESSAGE', 'LETTER']),
      direction: nullableChoice(body, 'direction', ['INBOUND', 'OUTBOUND']),
      subject: nullableString(body, 'subject'),
      body: nullableString(body, 'body'),
      occurredAt: optionalString(body, 'occurredAt'),
      externalReference: nullableString(body, 'externalReference'),
    }));
    return new CommunicationItemHttpResponse(toCommunicationHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteCommunicationHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteCommunicationRequest(businessAccountId, id, numberQuery(version)));
    return new DeleteCommunicationHttpResponse(response.id, response.deleted);
  }
}
