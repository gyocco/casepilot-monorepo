import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateExternalPartyHandler } from '../../application/external-parties/create-external-party.handler.js';
import { GetExternalPartyHandler } from '../../application/external-parties/get-external-party.handler.js';
import { UpdateExternalPartyHandler } from '../../application/external-parties/update-external-party.handler.js';
import { DeleteExternalPartyHandler } from '../../application/external-parties/delete-external-party.handler.js';
import { ListExternalPartiesHandler } from '../../application/external-parties/list-external-parties.handler.js';
import { CreateExternalPartyRequest, GetExternalPartyRequest, UpdateExternalPartyRequest, DeleteExternalPartyRequest, ListExternalPartiesRequest } from '../../application/external-parties/external-party.models.js';
import { readBody, numberValue, numberQuery, textQuery, choiceValue, optionalChoice, stringValue, optionalString, nullableString, nullableChoice, PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import { ExternalPartyItemHttpResponse, ExternalPartiesPageHttpResponse, DeleteExternalPartyHttpResponse, toExternalPartyHttpResponse } from './external-party-http.response.js';

@Controller('business-accounts/:businessAccountId/external-parties')
export class ExternalPartiesController {
  constructor(
    @Inject(CreateExternalPartyHandler) private readonly createHandler: CreateExternalPartyHandler,
    @Inject(GetExternalPartyHandler) private readonly getHandler: GetExternalPartyHandler,
    @Inject(UpdateExternalPartyHandler) private readonly updateHandler: UpdateExternalPartyHandler,
    @Inject(DeleteExternalPartyHandler) private readonly deleteHandler: DeleteExternalPartyHandler,
    @Inject(ListExternalPartiesHandler) private readonly listHandler: ListExternalPartiesHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<ExternalPartyItemHttpResponse> {
    const body = readBody(input, ['type', 'displayName', 'firstName', 'lastName', 'legalName', 'taxId', 'email', 'phone', 'website', 'addressLine_1', 'addressLine_2', 'city', 'region', 'postalCode', 'countryCode', 'notes', 'status']);
    const response = await this.createHandler.execute(new CreateExternalPartyRequest(businessAccountId, {
      type: choiceValue(body, 'type', ['PERSON', 'ORGANIZATION']),
      displayName: stringValue(body, 'displayName'),
      firstName: nullableString(body, 'firstName'),
      lastName: nullableString(body, 'lastName'),
      legalName: nullableString(body, 'legalName'),
      taxId: nullableString(body, 'taxId'),
      email: nullableString(body, 'email'),
      phone: nullableString(body, 'phone'),
      website: nullableString(body, 'website'),
      addressLine_1: nullableString(body, 'addressLine_1'),
      addressLine_2: nullableString(body, 'addressLine_2'),
      city: nullableString(body, 'city'),
      region: nullableString(body, 'region'),
      postalCode: nullableString(body, 'postalCode'),
      countryCode: nullableString(body, 'countryCode'),
      notes: nullableString(body, 'notes'),
      status: nullableChoice(body, 'status', ['ACTIVE', 'INACTIVE', 'ARCHIVED']),
    }));
    return new ExternalPartyItemHttpResponse(toExternalPartyHttpResponse(response.item));
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(
    @Param('businessAccountId') businessAccountId: string,
    @Query('pageNumber') pageNumber: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortDirection') sortDirection: string | undefined,
  ): Promise<ExternalPartiesPageHttpResponse> {
    const response = await this.listHandler.execute(new ListExternalPartiesRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc')));
    return new ExternalPartiesPageHttpResponse(response.items.map(toExternalPartyHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<ExternalPartyItemHttpResponse> {
    const response = await this.getHandler.execute(new GetExternalPartyRequest(businessAccountId, id));
    return new ExternalPartyItemHttpResponse(toExternalPartyHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<ExternalPartyItemHttpResponse> {
    const body = readBody(input, ['version', 'type', 'displayName', 'firstName', 'lastName', 'legalName', 'taxId', 'email', 'phone', 'website', 'addressLine_1', 'addressLine_2', 'city', 'region', 'postalCode', 'countryCode', 'notes', 'status']);
    const response = await this.updateHandler.execute(new UpdateExternalPartyRequest(businessAccountId, id, numberValue(body, 'version'), {
      type: optionalChoice(body, 'type', ['PERSON', 'ORGANIZATION']),
      displayName: optionalString(body, 'displayName'),
      firstName: nullableString(body, 'firstName'),
      lastName: nullableString(body, 'lastName'),
      legalName: nullableString(body, 'legalName'),
      taxId: nullableString(body, 'taxId'),
      email: nullableString(body, 'email'),
      phone: nullableString(body, 'phone'),
      website: nullableString(body, 'website'),
      addressLine_1: nullableString(body, 'addressLine_1'),
      addressLine_2: nullableString(body, 'addressLine_2'),
      city: nullableString(body, 'city'),
      region: nullableString(body, 'region'),
      postalCode: nullableString(body, 'postalCode'),
      countryCode: nullableString(body, 'countryCode'),
      notes: nullableString(body, 'notes'),
      status: nullableChoice(body, 'status', ['ACTIVE', 'INACTIVE', 'ARCHIVED']),
    }));
    return new ExternalPartyItemHttpResponse(toExternalPartyHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteExternalPartyHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteExternalPartyRequest(businessAccountId, id, numberQuery(version)));
    return new DeleteExternalPartyHttpResponse(response.id, response.deleted);
  }
}
