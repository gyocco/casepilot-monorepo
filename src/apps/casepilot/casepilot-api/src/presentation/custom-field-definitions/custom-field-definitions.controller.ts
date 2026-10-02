import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateCustomFieldDefinitionHandler } from '../../application/custom-field-definitions/create-custom-field-definition.handler.js';
import { GetCustomFieldDefinitionHandler } from '../../application/custom-field-definitions/get-custom-field-definition.handler.js';
import { UpdateCustomFieldDefinitionHandler } from '../../application/custom-field-definitions/update-custom-field-definition.handler.js';
import { DeleteCustomFieldDefinitionHandler } from '../../application/custom-field-definitions/delete-custom-field-definition.handler.js';
import { ListCustomFieldDefinitionsHandler } from '../../application/custom-field-definitions/list-custom-field-definitions.handler.js';
import { CreateCustomFieldDefinitionRequest, GetCustomFieldDefinitionRequest, UpdateCustomFieldDefinitionRequest, DeleteCustomFieldDefinitionRequest, ListCustomFieldDefinitionsRequest } from '../../application/custom-field-definitions/custom-field-definition.models.js';
import { readBody, numberValue, numberQuery, textQuery, stringValue, optionalString, nullableString, booleanValue, optionalBoolean, nullableJson, optionalNumber, PageMetadataHttpResponse } from '../shared/crud-http.js';
import { CustomFieldDefinitionItemHttpResponse, CustomFieldDefinitionsPageHttpResponse, DeleteCustomFieldDefinitionHttpResponse, toCustomFieldDefinitionHttpResponse } from './custom-field-definition-http.response.js';

@Controller('business-accounts/:businessAccountId/custom-field-definitions')
export class CustomFieldDefinitionsController {
  constructor(
    @Inject(CreateCustomFieldDefinitionHandler) private readonly createHandler: CreateCustomFieldDefinitionHandler,
    @Inject(GetCustomFieldDefinitionHandler) private readonly getHandler: GetCustomFieldDefinitionHandler,
    @Inject(UpdateCustomFieldDefinitionHandler) private readonly updateHandler: UpdateCustomFieldDefinitionHandler,
    @Inject(DeleteCustomFieldDefinitionHandler) private readonly deleteHandler: DeleteCustomFieldDefinitionHandler,
    @Inject(ListCustomFieldDefinitionsHandler) private readonly listHandler: ListCustomFieldDefinitionsHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<CustomFieldDefinitionItemHttpResponse> {
    const body = readBody(input, ['entityType', 'caseTypeId', 'name', 'key', 'dataType', 'required', 'configuration', 'sortOrder', 'isActive']);
    const response = await this.createHandler.execute(new CreateCustomFieldDefinitionRequest(businessAccountId, {
      entityType: stringValue(body, 'entityType'),
      caseTypeId: nullableString(body, 'caseTypeId'),
      name: stringValue(body, 'name'),
      key: stringValue(body, 'key'),
      dataType: stringValue(body, 'dataType'),
      required: booleanValue(body, 'required'),
      configuration: nullableJson(body, 'configuration'),
      sortOrder: numberValue(body, 'sortOrder'),
      isActive: booleanValue(body, 'isActive'),
    }));
    return new CustomFieldDefinitionItemHttpResponse(toCustomFieldDefinitionHttpResponse(response.item));
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(
    @Param('businessAccountId') businessAccountId: string,
    @Query('pageNumber') pageNumber: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortDirection') sortDirection: string | undefined,
  ): Promise<CustomFieldDefinitionsPageHttpResponse> {
    const response = await this.listHandler.execute(new ListCustomFieldDefinitionsRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc')));
    return new CustomFieldDefinitionsPageHttpResponse(response.items.map(toCustomFieldDefinitionHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<CustomFieldDefinitionItemHttpResponse> {
    const response = await this.getHandler.execute(new GetCustomFieldDefinitionRequest(businessAccountId, id));
    return new CustomFieldDefinitionItemHttpResponse(toCustomFieldDefinitionHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<CustomFieldDefinitionItemHttpResponse> {
    const body = readBody(input, ['version', 'entityType', 'caseTypeId', 'name', 'key', 'dataType', 'required', 'configuration', 'sortOrder', 'isActive']);
    const response = await this.updateHandler.execute(new UpdateCustomFieldDefinitionRequest(businessAccountId, id, numberValue(body, 'version'), {
      entityType: optionalString(body, 'entityType'),
      caseTypeId: nullableString(body, 'caseTypeId'),
      name: optionalString(body, 'name'),
      key: optionalString(body, 'key'),
      dataType: optionalString(body, 'dataType'),
      required: optionalBoolean(body, 'required'),
      configuration: nullableJson(body, 'configuration'),
      sortOrder: optionalNumber(body, 'sortOrder'),
      isActive: optionalBoolean(body, 'isActive'),
    }));
    return new CustomFieldDefinitionItemHttpResponse(toCustomFieldDefinitionHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteCustomFieldDefinitionHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteCustomFieldDefinitionRequest(businessAccountId, id, numberQuery(version)));
    return new DeleteCustomFieldDefinitionHttpResponse(response.id, response.deleted);
  }
}
