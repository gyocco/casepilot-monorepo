import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import type { VerifiedIdentity } from '@casepilot/auth';
import { CurrentIdentity } from '@casepilot/auth/nestjs';
import { CreateCaseHandler } from '../../application/cases/create-case/create-case.handler.js';
import { GetCaseHandler } from '../../application/cases/get-case/get-case.handler.js';
import { UpdateCaseHandler } from '../../application/cases/update-case/update-case.handler.js';
import { DeleteCaseHandler } from '../../application/cases/delete-case/delete-case.handler.js';
import { ListCasesHandler } from '../../application/cases/list-cases/list-cases.handler.js';
import { CreateCaseRequest } from '../../application/cases/create-case/create-case.request.js';
import { GetCaseRequest } from '../../application/cases/get-case/get-case.request.js';
import { UpdateCaseRequest } from '../../application/cases/update-case/update-case.request.js';
import { DeleteCaseRequest } from '../../application/cases/delete-case/delete-case.request.js';
import { ListCasesRequest } from '../../application/cases/list-cases/list-cases.request.js';
import { readBody, numberValue, numberQuery, textQuery, nullableString, stringValue, optionalString, nullableChoice, PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import { CaseItemHttpResponse, CasesPageHttpResponse, DeleteCaseHttpResponse, toCaseHttpResponse } from './case-http.response.js';

@Controller('business-accounts/:businessAccountId/cases')
export class CasesController {
  constructor(
    @Inject(CreateCaseHandler) private readonly createHandler: CreateCaseHandler,
    @Inject(GetCaseHandler) private readonly getHandler: GetCaseHandler,
    @Inject(UpdateCaseHandler) private readonly updateHandler: UpdateCaseHandler,
    @Inject(DeleteCaseHandler) private readonly deleteHandler: DeleteCaseHandler,
    @Inject(ListCasesHandler) private readonly listHandler: ListCasesHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<CaseItemHttpResponse> {
    const body = readBody(input, ['caseTypeId', 'number', 'externalReference', 'title', 'description', 'status', 'priority', 'openedAt', 'closedAt', 'responsibleMemberId', 'billingType', 'hourlyRate', 'currency', 'createdByMemberId']);
    const response = await this.createHandler.execute(new CreateCaseRequest(businessAccountId, {
      caseTypeId: nullableString(body, 'caseTypeId'),
      number: nullableString(body, 'number'),
      externalReference: nullableString(body, 'externalReference'),
      title: stringValue(body, 'title'),
      description: nullableString(body, 'description'),
      status: stringValue(body, 'status'),
      priority: nullableChoice(body, 'priority', ['LOW', 'NORMAL', 'HIGH', 'URGENT']),
      openedAt: nullableString(body, 'openedAt'),
      closedAt: nullableString(body, 'closedAt'),
      responsibleMemberId: nullableString(body, 'responsibleMemberId'),
      billingType: nullableChoice(body, 'billingType', ['HOURLY', 'FIXED', 'RETAINER', 'NON_BILLABLE']),
      hourlyRate: nullableString(body, 'hourlyRate'),
      currency: nullableString(body, 'currency'),
      createdByMemberId: stringValue(body, 'createdByMemberId'),
    }, actor));
    return new CaseItemHttpResponse(toCaseHttpResponse(response.item));
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
  ): Promise<CasesPageHttpResponse> {
    const response = await this.listHandler.execute(new ListCasesRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc'), actor));
    return new CasesPageHttpResponse(response.items.map(toCaseHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<CaseItemHttpResponse> {
    const response = await this.getHandler.execute(new GetCaseRequest(businessAccountId, id, actor));
    return new CaseItemHttpResponse(toCaseHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<CaseItemHttpResponse> {
    const body = readBody(input, ['version', 'caseTypeId', 'number', 'externalReference', 'title', 'description', 'status', 'priority', 'openedAt', 'closedAt', 'responsibleMemberId', 'billingType', 'hourlyRate', 'currency', 'createdByMemberId']);
    const response = await this.updateHandler.execute(new UpdateCaseRequest(businessAccountId, id, numberValue(body, 'version'), {
      caseTypeId: nullableString(body, 'caseTypeId'),
      number: nullableString(body, 'number'),
      externalReference: nullableString(body, 'externalReference'),
      title: optionalString(body, 'title'),
      description: nullableString(body, 'description'),
      status: optionalString(body, 'status'),
      priority: nullableChoice(body, 'priority', ['LOW', 'NORMAL', 'HIGH', 'URGENT']),
      openedAt: nullableString(body, 'openedAt'),
      closedAt: nullableString(body, 'closedAt'),
      responsibleMemberId: nullableString(body, 'responsibleMemberId'),
      billingType: nullableChoice(body, 'billingType', ['HOURLY', 'FIXED', 'RETAINER', 'NON_BILLABLE']),
      hourlyRate: nullableString(body, 'hourlyRate'),
      currency: nullableString(body, 'currency'),
      createdByMemberId: optionalString(body, 'createdByMemberId'),
    }, actor));
    return new CaseItemHttpResponse(toCaseHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteCaseHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteCaseRequest(businessAccountId, id, numberQuery(version), actor));
    return new DeleteCaseHttpResponse(response.id, response.deleted);
  }
}
