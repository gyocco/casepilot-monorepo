import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import type { VerifiedIdentity } from '@casepilot/auth';
import { CurrentIdentity } from '@casepilot/auth/nestjs';
import { CreateCaseExternalPartyHandler } from '../../application/case-external-parties/create-case-external-party/create-case-external-party.handler.js';
import { GetCaseExternalPartyHandler } from '../../application/case-external-parties/get-case-external-party/get-case-external-party.handler.js';
import { UpdateCaseExternalPartyHandler } from '../../application/case-external-parties/update-case-external-party/update-case-external-party.handler.js';
import { DeleteCaseExternalPartyHandler } from '../../application/case-external-parties/delete-case-external-party/delete-case-external-party.handler.js';
import { ListCaseExternalPartiesHandler } from '../../application/case-external-parties/list-case-external-parties/list-case-external-parties.handler.js';
import { CreateCaseExternalPartyRequest } from '../../application/case-external-parties/create-case-external-party/create-case-external-party.request.js';
import { GetCaseExternalPartyRequest } from '../../application/case-external-parties/get-case-external-party/get-case-external-party.request.js';
import { UpdateCaseExternalPartyRequest } from '../../application/case-external-parties/update-case-external-party/update-case-external-party.request.js';
import { DeleteCaseExternalPartyRequest } from '../../application/case-external-parties/delete-case-external-party/delete-case-external-party.request.js';
import { ListCaseExternalPartiesRequest } from '../../application/case-external-parties/list-case-external-parties/list-case-external-parties.request.js';
import { readBody, numberValue, numberQuery, textQuery, stringValue, optionalString, booleanValue, optionalBoolean, nullableString, PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import { CaseExternalPartyItemHttpResponse, CaseExternalPartiesPageHttpResponse, DeleteCaseExternalPartyHttpResponse, toCaseExternalPartyHttpResponse } from './case-external-party-http.response.js';

@Controller('business-accounts/:businessAccountId/case-external-parties')
export class CaseExternalPartiesController {
  constructor(
    @Inject(CreateCaseExternalPartyHandler) private readonly createHandler: CreateCaseExternalPartyHandler,
    @Inject(GetCaseExternalPartyHandler) private readonly getHandler: GetCaseExternalPartyHandler,
    @Inject(UpdateCaseExternalPartyHandler) private readonly updateHandler: UpdateCaseExternalPartyHandler,
    @Inject(DeleteCaseExternalPartyHandler) private readonly deleteHandler: DeleteCaseExternalPartyHandler,
    @Inject(ListCaseExternalPartiesHandler) private readonly listHandler: ListCaseExternalPartiesHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<CaseExternalPartyItemHttpResponse> {
    const body = readBody(input, ['caseId', 'externalPartyId', 'role', 'isPrimary', 'notes']);
    const response = await this.createHandler.execute(new CreateCaseExternalPartyRequest(businessAccountId, {
      caseId: stringValue(body, 'caseId'),
      externalPartyId: stringValue(body, 'externalPartyId'),
      role: stringValue(body, 'role'),
      isPrimary: booleanValue(body, 'isPrimary'),
      notes: nullableString(body, 'notes'),
    }, actor));
    return new CaseExternalPartyItemHttpResponse(toCaseExternalPartyHttpResponse(response.item));
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
  ): Promise<CaseExternalPartiesPageHttpResponse> {
    const response = await this.listHandler.execute(new ListCaseExternalPartiesRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc'), actor));
    return new CaseExternalPartiesPageHttpResponse(response.items.map(toCaseExternalPartyHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<CaseExternalPartyItemHttpResponse> {
    const response = await this.getHandler.execute(new GetCaseExternalPartyRequest(businessAccountId, id, actor));
    return new CaseExternalPartyItemHttpResponse(toCaseExternalPartyHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<CaseExternalPartyItemHttpResponse> {
    const body = readBody(input, ['version', 'caseId', 'externalPartyId', 'role', 'isPrimary', 'notes']);
    const response = await this.updateHandler.execute(new UpdateCaseExternalPartyRequest(businessAccountId, id, numberValue(body, 'version'), {
      caseId: optionalString(body, 'caseId'),
      externalPartyId: optionalString(body, 'externalPartyId'),
      role: optionalString(body, 'role'),
      isPrimary: optionalBoolean(body, 'isPrimary'),
      notes: nullableString(body, 'notes'),
    }, actor));
    return new CaseExternalPartyItemHttpResponse(toCaseExternalPartyHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteCaseExternalPartyHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteCaseExternalPartyRequest(businessAccountId, id, numberQuery(version), actor));
    return new DeleteCaseExternalPartyHttpResponse(response.id, response.deleted);
  }
}
