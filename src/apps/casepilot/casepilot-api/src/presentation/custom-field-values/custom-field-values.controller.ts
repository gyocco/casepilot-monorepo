import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateCustomFieldValueHandler } from '../../application/custom-field-values/create-custom-field-value.handler.js';
import { GetCustomFieldValueHandler } from '../../application/custom-field-values/get-custom-field-value.handler.js';
import { UpdateCustomFieldValueHandler } from '../../application/custom-field-values/update-custom-field-value.handler.js';
import { DeleteCustomFieldValueHandler } from '../../application/custom-field-values/delete-custom-field-value.handler.js';
import { ListCustomFieldValuesHandler } from '../../application/custom-field-values/list-custom-field-values.handler.js';
import { CreateCustomFieldValueRequest, GetCustomFieldValueRequest, UpdateCustomFieldValueRequest, DeleteCustomFieldValueRequest, ListCustomFieldValuesRequest } from '../../application/custom-field-values/custom-field-value.models.js';
import { readBody, numberValue, numberQuery, textQuery, stringValue, optionalString, nullableString, nullableBoolean, nullableJson, PageMetadataHttpResponse } from '../shared/crud-http.js';
import { CustomFieldValueItemHttpResponse, CustomFieldValuesPageHttpResponse, DeleteCustomFieldValueHttpResponse, toCustomFieldValueHttpResponse } from './custom-field-value-http.response.js';

@Controller('business-accounts/:businessAccountId/custom-field-values')
export class CustomFieldValuesController {
  constructor(
    @Inject(CreateCustomFieldValueHandler) private readonly createHandler: CreateCustomFieldValueHandler,
    @Inject(GetCustomFieldValueHandler) private readonly getHandler: GetCustomFieldValueHandler,
    @Inject(UpdateCustomFieldValueHandler) private readonly updateHandler: UpdateCustomFieldValueHandler,
    @Inject(DeleteCustomFieldValueHandler) private readonly deleteHandler: DeleteCustomFieldValueHandler,
    @Inject(ListCustomFieldValuesHandler) private readonly listHandler: ListCustomFieldValuesHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<CustomFieldValueItemHttpResponse> {
    const body = readBody(input, ['customFieldDefinitionId', 'entityType', 'entityId', 'valueText', 'valueNumber', 'valueDate', 'valueBoolean', 'valueJson']);
    const response = await this.createHandler.execute(new CreateCustomFieldValueRequest(businessAccountId, {
      customFieldDefinitionId: stringValue(body, 'customFieldDefinitionId'),
      entityType: stringValue(body, 'entityType'),
      entityId: stringValue(body, 'entityId'),
      valueText: nullableString(body, 'valueText'),
      valueNumber: nullableString(body, 'valueNumber'),
      valueDate: nullableString(body, 'valueDate'),
      valueBoolean: nullableBoolean(body, 'valueBoolean'),
      valueJson: nullableJson(body, 'valueJson'),
    }));
    return new CustomFieldValueItemHttpResponse(toCustomFieldValueHttpResponse(response.item));
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(
    @Param('businessAccountId') businessAccountId: string,
    @Query('pageNumber') pageNumber: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortDirection') sortDirection: string | undefined,
  ): Promise<CustomFieldValuesPageHttpResponse> {
    const response = await this.listHandler.execute(new ListCustomFieldValuesRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc')));
    return new CustomFieldValuesPageHttpResponse(response.items.map(toCustomFieldValueHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<CustomFieldValueItemHttpResponse> {
    const response = await this.getHandler.execute(new GetCustomFieldValueRequest(businessAccountId, id));
    return new CustomFieldValueItemHttpResponse(toCustomFieldValueHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<CustomFieldValueItemHttpResponse> {
    const body = readBody(input, ['version', 'customFieldDefinitionId', 'entityType', 'entityId', 'valueText', 'valueNumber', 'valueDate', 'valueBoolean', 'valueJson']);
    const response = await this.updateHandler.execute(new UpdateCustomFieldValueRequest(businessAccountId, id, numberValue(body, 'version'), {
      customFieldDefinitionId: optionalString(body, 'customFieldDefinitionId'),
      entityType: optionalString(body, 'entityType'),
      entityId: optionalString(body, 'entityId'),
      valueText: nullableString(body, 'valueText'),
      valueNumber: nullableString(body, 'valueNumber'),
      valueDate: nullableString(body, 'valueDate'),
      valueBoolean: nullableBoolean(body, 'valueBoolean'),
      valueJson: nullableJson(body, 'valueJson'),
    }));
    return new CustomFieldValueItemHttpResponse(toCustomFieldValueHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteCustomFieldValueHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteCustomFieldValueRequest(businessAccountId, id, numberQuery(version)));
    return new DeleteCustomFieldValueHttpResponse(response.id, response.deleted);
  }
}
