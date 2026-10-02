import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateCaseMemberHandler } from '../../application/case-members/create-case-member.handler.js';
import { GetCaseMemberHandler } from '../../application/case-members/get-case-member.handler.js';
import { UpdateCaseMemberHandler } from '../../application/case-members/update-case-member.handler.js';
import { DeleteCaseMemberHandler } from '../../application/case-members/delete-case-member.handler.js';
import { ListCaseMembersHandler } from '../../application/case-members/list-case-members.handler.js';
import { CreateCaseMemberRequest, GetCaseMemberRequest, UpdateCaseMemberRequest, DeleteCaseMemberRequest, ListCaseMembersRequest } from '../../application/case-members/case-member.models.js';
import { readBody, numberValue, numberQuery, textQuery, stringValue, optionalString, nullableString, booleanValue, optionalBoolean, PageMetadataHttpResponse } from '../shared/crud-http.js';
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
  async create(@Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<CaseMemberItemHttpResponse> {
    const body = readBody(input, ['caseId', 'memberId', 'role', 'isPrimary', 'assignedAt', 'removedAt']);
    const response = await this.createHandler.execute(new CreateCaseMemberRequest(businessAccountId, {
      caseId: stringValue(body, 'caseId'),
      memberId: stringValue(body, 'memberId'),
      role: nullableString(body, 'role'),
      isPrimary: booleanValue(body, 'isPrimary'),
      assignedAt: stringValue(body, 'assignedAt'),
      removedAt: nullableString(body, 'removedAt'),
    }));
    return new CaseMemberItemHttpResponse(toCaseMemberHttpResponse(response.item));
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(
    @Param('businessAccountId') businessAccountId: string,
    @Query('pageNumber') pageNumber: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortDirection') sortDirection: string | undefined,
  ): Promise<CaseMembersPageHttpResponse> {
    const response = await this.listHandler.execute(new ListCaseMembersRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc')));
    return new CaseMembersPageHttpResponse(response.items.map(toCaseMemberHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<CaseMemberItemHttpResponse> {
    const response = await this.getHandler.execute(new GetCaseMemberRequest(businessAccountId, id));
    return new CaseMemberItemHttpResponse(toCaseMemberHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<CaseMemberItemHttpResponse> {
    const body = readBody(input, ['version', 'caseId', 'memberId', 'role', 'isPrimary', 'assignedAt', 'removedAt']);
    const response = await this.updateHandler.execute(new UpdateCaseMemberRequest(businessAccountId, id, numberValue(body, 'version'), {
      caseId: optionalString(body, 'caseId'),
      memberId: optionalString(body, 'memberId'),
      role: nullableString(body, 'role'),
      isPrimary: optionalBoolean(body, 'isPrimary'),
      assignedAt: optionalString(body, 'assignedAt'),
      removedAt: nullableString(body, 'removedAt'),
    }));
    return new CaseMemberItemHttpResponse(toCaseMemberHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteCaseMemberHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteCaseMemberRequest(businessAccountId, id, numberQuery(version)));
    return new DeleteCaseMemberHttpResponse(response.id, response.deleted);
  }
}
