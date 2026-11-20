import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import type { VerifiedIdentity } from '@casepilot/auth';
import { CurrentIdentity } from '@casepilot/auth/nestjs';
import { CreateCaseMemberHandler } from '../../application/case-members/create-case-member/create-case-member.handler.js';
import { GetCaseMemberHandler } from '../../application/case-members/get-case-member/get-case-member.handler.js';
import { UpdateCaseMemberHandler } from '../../application/case-members/update-case-member/update-case-member.handler.js';
import { DeleteCaseMemberHandler } from '../../application/case-members/delete-case-member/delete-case-member.handler.js';
import { ListCaseMembersHandler } from '../../application/case-members/list-case-members/list-case-members.handler.js';
import { CreateCaseMemberRequest } from '../../application/case-members/create-case-member/create-case-member.request.js';
import { GetCaseMemberRequest } from '../../application/case-members/get-case-member/get-case-member.request.js';
import { UpdateCaseMemberRequest } from '../../application/case-members/update-case-member/update-case-member.request.js';
import { DeleteCaseMemberRequest } from '../../application/case-members/delete-case-member/delete-case-member.request.js';
import { ListCaseMembersRequest } from '../../application/case-members/list-case-members/list-case-members.request.js';
import { readBody, numberValue, numberQuery, textQuery, stringValue, optionalString, nullableString, booleanValue, optionalBoolean, PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import { CaseMemberItemHttpResponse, CaseMembersPageHttpResponse, DeleteCaseMemberHttpResponse, toCaseMemberHttpResponse } from './case-member-http.response.js';

@Controller('business-accounts/:businessAccountId/case-members')
export class CaseMembersController {
  constructor(
    @Inject(CreateCaseMemberHandler) private readonly createHandler: CreateCaseMemberHandler,
    @Inject(GetCaseMemberHandler) private readonly getHandler: GetCaseMemberHandler,
    @Inject(UpdateCaseMemberHandler) private readonly updateHandler: UpdateCaseMemberHandler,
    @Inject(DeleteCaseMemberHandler) private readonly deleteHandler: DeleteCaseMemberHandler,
    @Inject(ListCaseMembersHandler) private readonly listHandler: ListCaseMembersHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<CaseMemberItemHttpResponse> {
    const body = readBody(input, ['caseId', 'memberId', 'role', 'isPrimary', 'assignedAt', 'removedAt']);
    const response = await this.createHandler.execute(new CreateCaseMemberRequest(businessAccountId, {
      caseId: stringValue(body, 'caseId'),
      memberId: stringValue(body, 'memberId'),
      role: nullableString(body, 'role'),
      isPrimary: booleanValue(body, 'isPrimary'),
      assignedAt: stringValue(body, 'assignedAt'),
      removedAt: nullableString(body, 'removedAt'),
    }, actor));
    return new CaseMemberItemHttpResponse(toCaseMemberHttpResponse(response.item));
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
  ): Promise<CaseMembersPageHttpResponse> {
    const response = await this.listHandler.execute(new ListCaseMembersRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc'), actor));
    return new CaseMembersPageHttpResponse(response.items.map(toCaseMemberHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<CaseMemberItemHttpResponse> {
    const response = await this.getHandler.execute(new GetCaseMemberRequest(businessAccountId, id, actor));
    return new CaseMemberItemHttpResponse(toCaseMemberHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<CaseMemberItemHttpResponse> {
    const body = readBody(input, ['version', 'caseId', 'memberId', 'role', 'isPrimary', 'assignedAt', 'removedAt']);
    const response = await this.updateHandler.execute(new UpdateCaseMemberRequest(businessAccountId, id, numberValue(body, 'version'), {
      caseId: optionalString(body, 'caseId'),
      memberId: optionalString(body, 'memberId'),
      role: nullableString(body, 'role'),
      isPrimary: optionalBoolean(body, 'isPrimary'),
      assignedAt: optionalString(body, 'assignedAt'),
      removedAt: nullableString(body, 'removedAt'),
    }, actor));
    return new CaseMemberItemHttpResponse(toCaseMemberHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteCaseMemberHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteCaseMemberRequest(businessAccountId, id, numberQuery(version), actor));
    return new DeleteCaseMemberHttpResponse(response.id, response.deleted);
  }
}
