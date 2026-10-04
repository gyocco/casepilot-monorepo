import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateBusinessAccountHandler } from '../../application/business-accounts/create-business-account/create-business-account.handler.js';
import { GetBusinessAccountHandler } from '../../application/business-accounts/get-business-account/get-business-account.handler.js';
import { UpdateBusinessAccountHandler } from '../../application/business-accounts/update-business-account/update-business-account.handler.js';
import { DeleteBusinessAccountHandler } from '../../application/business-accounts/delete-business-account/delete-business-account.handler.js';
import { ListBusinessAccountsHandler } from '../../application/business-accounts/list-business-accounts/list-business-accounts.handler.js';
import { CreateBusinessAccountRequest } from '../../application/business-accounts/create-business-account/create-business-account.request.js';
import { GetBusinessAccountRequest } from '../../application/business-accounts/get-business-account/get-business-account.request.js';
import { UpdateBusinessAccountRequest } from '../../application/business-accounts/update-business-account/update-business-account.request.js';
import { DeleteBusinessAccountRequest } from '../../application/business-accounts/delete-business-account/delete-business-account.request.js';
import { ListBusinessAccountsRequest } from '../../application/business-accounts/list-business-accounts/list-business-accounts.request.js';
import { readBody, numberValue, numberQuery, textQuery, stringValue, optionalString, nullableString, choiceValue, optionalChoice, nullableJson, PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import { BusinessAccountItemHttpResponse, BusinessAccountsPageHttpResponse, DeleteBusinessAccountHttpResponse, toBusinessAccountHttpResponse } from './business-account-http.response.js';

@Controller('business-accounts')
export class BusinessAccountsController {
  constructor(
    @Inject(CreateBusinessAccountHandler) private readonly createHandler: CreateBusinessAccountHandler,
    @Inject(GetBusinessAccountHandler) private readonly getHandler: GetBusinessAccountHandler,
    @Inject(UpdateBusinessAccountHandler) private readonly updateHandler: UpdateBusinessAccountHandler,
    @Inject(DeleteBusinessAccountHandler) private readonly deleteHandler: DeleteBusinessAccountHandler,
    @Inject(ListBusinessAccountsHandler) private readonly listHandler: ListBusinessAccountsHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@Body() input: unknown): Promise<BusinessAccountItemHttpResponse> {
    const body = readBody(input, ['name', 'legalName', 'slug', 'type', 'taxId', 'email', 'phone', 'website', 'timezone', 'locale', 'currency', 'countryCode', 'status', 'settings']);
    const response = await this.createHandler.execute(new CreateBusinessAccountRequest(null, {
      name: stringValue(body, 'name'),
      legalName: nullableString(body, 'legalName'),
      slug: nullableString(body, 'slug'),
      type: nullableString(body, 'type'),
      taxId: nullableString(body, 'taxId'),
      email: nullableString(body, 'email'),
      phone: nullableString(body, 'phone'),
      website: nullableString(body, 'website'),
      timezone: stringValue(body, 'timezone'),
      locale: stringValue(body, 'locale'),
      currency: stringValue(body, 'currency'),
      countryCode: stringValue(body, 'countryCode'),
      status: choiceValue(body, 'status', ['ACTIVE', 'SUSPENDED', 'CLOSED']),
      settings: nullableJson(body, 'settings'),
    }));
    return new BusinessAccountItemHttpResponse(toBusinessAccountHttpResponse(response.item));
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(
    @Query('pageNumber') pageNumber: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortDirection') sortDirection: string | undefined,
  ): Promise<BusinessAccountsPageHttpResponse> {
    const response = await this.listHandler.execute(new ListBusinessAccountsRequest(null, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc')));
    return new BusinessAccountsPageHttpResponse(response.items.map(toBusinessAccountHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@Param('id') id: string): Promise<BusinessAccountItemHttpResponse> {
    const response = await this.getHandler.execute(new GetBusinessAccountRequest(null, id));
    return new BusinessAccountItemHttpResponse(toBusinessAccountHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@Param('id') id: string, @Body() input: unknown): Promise<BusinessAccountItemHttpResponse> {
    const body = readBody(input, ['version', 'name', 'legalName', 'slug', 'type', 'taxId', 'email', 'phone', 'website', 'timezone', 'locale', 'currency', 'countryCode', 'status', 'settings']);
    const response = await this.updateHandler.execute(new UpdateBusinessAccountRequest(null, id, numberValue(body, 'version'), {
      name: optionalString(body, 'name'),
      legalName: nullableString(body, 'legalName'),
      slug: nullableString(body, 'slug'),
      type: nullableString(body, 'type'),
      taxId: nullableString(body, 'taxId'),
      email: nullableString(body, 'email'),
      phone: nullableString(body, 'phone'),
      website: nullableString(body, 'website'),
      timezone: optionalString(body, 'timezone'),
      locale: optionalString(body, 'locale'),
      currency: optionalString(body, 'currency'),
      countryCode: optionalString(body, 'countryCode'),
      status: optionalChoice(body, 'status', ['ACTIVE', 'SUSPENDED', 'CLOSED']),
      settings: nullableJson(body, 'settings'),
    }));
    return new BusinessAccountItemHttpResponse(toBusinessAccountHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteBusinessAccountHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteBusinessAccountRequest(null, id, numberQuery(version)));
    return new DeleteBusinessAccountHttpResponse(response.id, response.deleted);
  }
}
