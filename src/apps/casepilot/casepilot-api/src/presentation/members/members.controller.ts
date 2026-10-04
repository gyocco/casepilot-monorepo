import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateMemberHandler } from '../../application/members/create-member/create-member.handler.js';
import { GetMemberHandler } from '../../application/members/get-member/get-member.handler.js';
import { UpdateMemberHandler } from '../../application/members/update-member/update-member.handler.js';
import { DeleteMemberHandler } from '../../application/members/delete-member/delete-member.handler.js';
import { ListMembersHandler } from '../../application/members/list-members/list-members.handler.js';
import { CreateMemberRequest } from '../../application/members/create-member/create-member.request.js';
import { GetMemberRequest } from '../../application/members/get-member/get-member.request.js';
import { UpdateMemberRequest } from '../../application/members/update-member/update-member.request.js';
import { DeleteMemberRequest } from '../../application/members/delete-member/delete-member.request.js';
import { ListMembersRequest } from '../../application/members/list-members/list-members.request.js';
import { readBody, numberValue, numberQuery, textQuery, stringValue, optionalString, choiceValue, optionalChoice, nullableString, PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import { MemberItemHttpResponse, MembersPageHttpResponse, DeleteMemberHttpResponse, toMemberHttpResponse } from './member-http.response.js';

@Controller('business-accounts/:businessAccountId/members')
export class MembersController {
  constructor(
    @Inject(CreateMemberHandler) private readonly createHandler: CreateMemberHandler,
    @Inject(GetMemberHandler) private readonly getHandler: GetMemberHandler,
    @Inject(UpdateMemberHandler) private readonly updateHandler: UpdateMemberHandler,
    @Inject(DeleteMemberHandler) private readonly deleteHandler: DeleteMemberHandler,
    @Inject(ListMembersHandler) private readonly listHandler: ListMembersHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<MemberItemHttpResponse> {
    const body = readBody(input, ['userId', 'role', 'status', 'title', 'professionalRegistration', 'hourlyRate', 'joinedAt', 'invitedAt']);
    const response = await this.createHandler.execute(new CreateMemberRequest(businessAccountId, {
      userId: stringValue(body, 'userId'),
      role: stringValue(body, 'role'),
      status: choiceValue(body, 'status', ['INVITED', 'ACTIVE', 'SUSPENDED', 'REMOVED']),
      title: nullableString(body, 'title'),
      professionalRegistration: nullableString(body, 'professionalRegistration'),
      hourlyRate: nullableString(body, 'hourlyRate'),
      joinedAt: nullableString(body, 'joinedAt'),
      invitedAt: nullableString(body, 'invitedAt'),
    }));
    return new MemberItemHttpResponse(toMemberHttpResponse(response.item));
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(
    @Param('businessAccountId') businessAccountId: string,
    @Query('pageNumber') pageNumber: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortDirection') sortDirection: string | undefined,
  ): Promise<MembersPageHttpResponse> {
    const response = await this.listHandler.execute(new ListMembersRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc')));
    return new MembersPageHttpResponse(response.items.map(toMemberHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<MemberItemHttpResponse> {
    const response = await this.getHandler.execute(new GetMemberRequest(businessAccountId, id));
    return new MemberItemHttpResponse(toMemberHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<MemberItemHttpResponse> {
    const body = readBody(input, ['version', 'userId', 'role', 'status', 'title', 'professionalRegistration', 'hourlyRate', 'joinedAt', 'invitedAt']);
    const response = await this.updateHandler.execute(new UpdateMemberRequest(businessAccountId, id, numberValue(body, 'version'), {
      userId: optionalString(body, 'userId'),
      role: optionalString(body, 'role'),
      status: optionalChoice(body, 'status', ['INVITED', 'ACTIVE', 'SUSPENDED', 'REMOVED']),
      title: nullableString(body, 'title'),
      professionalRegistration: nullableString(body, 'professionalRegistration'),
      hourlyRate: nullableString(body, 'hourlyRate'),
      joinedAt: nullableString(body, 'joinedAt'),
      invitedAt: nullableString(body, 'invitedAt'),
    }));
    return new MemberItemHttpResponse(toMemberHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteMemberHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteMemberRequest(businessAccountId, id, numberQuery(version)));
    return new DeleteMemberHttpResponse(response.id, response.deleted);
  }
}
