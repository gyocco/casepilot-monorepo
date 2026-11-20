import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import type { VerifiedIdentity } from '@casepilot/auth';
import { CurrentIdentity } from '@casepilot/auth/nestjs';
import { CreateCaseTypeHandler } from '../../application/case-types/create-case-type/create-case-type.handler.js';
import { GetCaseTypeHandler } from '../../application/case-types/get-case-type/get-case-type.handler.js';
import { UpdateCaseTypeHandler } from '../../application/case-types/update-case-type/update-case-type.handler.js';
import { DeleteCaseTypeHandler } from '../../application/case-types/delete-case-type/delete-case-type.handler.js';
import { ListCaseTypesHandler } from '../../application/case-types/list-case-types/list-case-types.handler.js';
import { CreateCaseTypeRequest } from '../../application/case-types/create-case-type/create-case-type.request.js';
import { GetCaseTypeRequest } from '../../application/case-types/get-case-type/get-case-type.request.js';
import { UpdateCaseTypeRequest } from '../../application/case-types/update-case-type/update-case-type.request.js';
import { DeleteCaseTypeRequest } from '../../application/case-types/delete-case-type/delete-case-type.request.js';
import { ListCaseTypesRequest } from '../../application/case-types/list-case-types/list-case-types.request.js';
import { readBody, numberValue, numberQuery, textQuery, stringValue, optionalString, nullableString, booleanValue, optionalBoolean, PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import { CaseTypeItemHttpResponse, CaseTypesPageHttpResponse, DeleteCaseTypeHttpResponse, toCaseTypeHttpResponse } from './case-type-http.response.js';

@Controller('business-accounts/:businessAccountId/case-types')
export class CaseTypesController {
  constructor(
    @Inject(CreateCaseTypeHandler) private readonly createHandler: CreateCaseTypeHandler,
    @Inject(GetCaseTypeHandler) private readonly getHandler: GetCaseTypeHandler,
    @Inject(UpdateCaseTypeHandler) private readonly updateHandler: UpdateCaseTypeHandler,
    @Inject(DeleteCaseTypeHandler) private readonly deleteHandler: DeleteCaseTypeHandler,
    @Inject(ListCaseTypesHandler) private readonly listHandler: ListCaseTypesHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<CaseTypeItemHttpResponse> {
    const body = readBody(input, ['name', 'description', 'code', 'isActive', 'defaultWorkflowId']);
    const response = await this.createHandler.execute(new CreateCaseTypeRequest(businessAccountId, {
      name: stringValue(body, 'name'),
      description: nullableString(body, 'description'),
      code: nullableString(body, 'code'),
      isActive: booleanValue(body, 'isActive'),
      defaultWorkflowId: nullableString(body, 'defaultWorkflowId'),
    }, actor));
    return new CaseTypeItemHttpResponse(toCaseTypeHttpResponse(response.item));
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
  ): Promise<CaseTypesPageHttpResponse> {
    const response = await this.listHandler.execute(new ListCaseTypesRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc'), actor));
    return new CaseTypesPageHttpResponse(response.items.map(toCaseTypeHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<CaseTypeItemHttpResponse> {
    const response = await this.getHandler.execute(new GetCaseTypeRequest(businessAccountId, id, actor));
    return new CaseTypeItemHttpResponse(toCaseTypeHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<CaseTypeItemHttpResponse> {
    const body = readBody(input, ['version', 'name', 'description', 'code', 'isActive', 'defaultWorkflowId']);
    const response = await this.updateHandler.execute(new UpdateCaseTypeRequest(businessAccountId, id, numberValue(body, 'version'), {
      name: optionalString(body, 'name'),
      description: nullableString(body, 'description'),
      code: nullableString(body, 'code'),
      isActive: optionalBoolean(body, 'isActive'),
      defaultWorkflowId: nullableString(body, 'defaultWorkflowId'),
    }, actor));
    return new CaseTypeItemHttpResponse(toCaseTypeHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteCaseTypeHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteCaseTypeRequest(businessAccountId, id, numberQuery(version), actor));
    return new DeleteCaseTypeHttpResponse(response.id, response.deleted);
  }
}
