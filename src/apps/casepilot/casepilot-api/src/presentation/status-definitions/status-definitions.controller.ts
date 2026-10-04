import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateStatusDefinitionHandler } from '../../application/status-definitions/create-status-definition/create-status-definition.handler.js';
import { GetStatusDefinitionHandler } from '../../application/status-definitions/get-status-definition/get-status-definition.handler.js';
import { UpdateStatusDefinitionHandler } from '../../application/status-definitions/update-status-definition/update-status-definition.handler.js';
import { DeleteStatusDefinitionHandler } from '../../application/status-definitions/delete-status-definition/delete-status-definition.handler.js';
import { ListStatusDefinitionsHandler } from '../../application/status-definitions/list-status-definitions/list-status-definitions.handler.js';
import { CreateStatusDefinitionRequest } from '../../application/status-definitions/create-status-definition/create-status-definition.request.js';
import { GetStatusDefinitionRequest } from '../../application/status-definitions/get-status-definition/get-status-definition.request.js';
import { UpdateStatusDefinitionRequest } from '../../application/status-definitions/update-status-definition/update-status-definition.request.js';
import { DeleteStatusDefinitionRequest } from '../../application/status-definitions/delete-status-definition/delete-status-definition.request.js';
import { ListStatusDefinitionsRequest } from '../../application/status-definitions/list-status-definitions/list-status-definitions.request.js';
import { readBody, numberValue, numberQuery, textQuery, stringValue, optionalString, nullableString, optionalNumber, booleanValue, optionalBoolean, PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import { StatusDefinitionItemHttpResponse, StatusDefinitionsPageHttpResponse, DeleteStatusDefinitionHttpResponse, toStatusDefinitionHttpResponse } from './status-definition-http.response.js';

@Controller('business-accounts/:businessAccountId/status-definitions')
export class StatusDefinitionsController {
  constructor(
    @Inject(CreateStatusDefinitionHandler) private readonly createHandler: CreateStatusDefinitionHandler,
    @Inject(GetStatusDefinitionHandler) private readonly getHandler: GetStatusDefinitionHandler,
    @Inject(UpdateStatusDefinitionHandler) private readonly updateHandler: UpdateStatusDefinitionHandler,
    @Inject(DeleteStatusDefinitionHandler) private readonly deleteHandler: DeleteStatusDefinitionHandler,
    @Inject(ListStatusDefinitionsHandler) private readonly listHandler: ListStatusDefinitionsHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<StatusDefinitionItemHttpResponse> {
    const body = readBody(input, ['entityType', 'caseTypeId', 'name', 'code', 'category', 'sortOrder', 'isInitial', 'isTerminal', 'isActive']);
    const response = await this.createHandler.execute(new CreateStatusDefinitionRequest(businessAccountId, {
      entityType: stringValue(body, 'entityType'),
      caseTypeId: nullableString(body, 'caseTypeId'),
      name: stringValue(body, 'name'),
      code: stringValue(body, 'code'),
      category: nullableString(body, 'category'),
      sortOrder: numberValue(body, 'sortOrder'),
      isInitial: booleanValue(body, 'isInitial'),
      isTerminal: booleanValue(body, 'isTerminal'),
      isActive: booleanValue(body, 'isActive'),
    }));
    return new StatusDefinitionItemHttpResponse(toStatusDefinitionHttpResponse(response.item));
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(
    @Param('businessAccountId') businessAccountId: string,
    @Query('pageNumber') pageNumber: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortDirection') sortDirection: string | undefined,
  ): Promise<StatusDefinitionsPageHttpResponse> {
    const response = await this.listHandler.execute(new ListStatusDefinitionsRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc')));
    return new StatusDefinitionsPageHttpResponse(response.items.map(toStatusDefinitionHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<StatusDefinitionItemHttpResponse> {
    const response = await this.getHandler.execute(new GetStatusDefinitionRequest(businessAccountId, id));
    return new StatusDefinitionItemHttpResponse(toStatusDefinitionHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<StatusDefinitionItemHttpResponse> {
    const body = readBody(input, ['version', 'entityType', 'caseTypeId', 'name', 'code', 'category', 'sortOrder', 'isInitial', 'isTerminal', 'isActive']);
    const response = await this.updateHandler.execute(new UpdateStatusDefinitionRequest(businessAccountId, id, numberValue(body, 'version'), {
      entityType: optionalString(body, 'entityType'),
      caseTypeId: nullableString(body, 'caseTypeId'),
      name: optionalString(body, 'name'),
      code: optionalString(body, 'code'),
      category: nullableString(body, 'category'),
      sortOrder: optionalNumber(body, 'sortOrder'),
      isInitial: optionalBoolean(body, 'isInitial'),
      isTerminal: optionalBoolean(body, 'isTerminal'),
      isActive: optionalBoolean(body, 'isActive'),
    }));
    return new StatusDefinitionItemHttpResponse(toStatusDefinitionHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteStatusDefinitionHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteStatusDefinitionRequest(businessAccountId, id, numberQuery(version)));
    return new DeleteStatusDefinitionHttpResponse(response.id, response.deleted);
  }
}
