import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import type { VerifiedIdentity } from '@casepilot/auth';
import { CurrentIdentity } from '@casepilot/auth/nestjs';
import { CreateUserHandler } from '../../application/users/create-user/create-user.handler.js';
import { GetUserHandler } from '../../application/users/get-user/get-user.handler.js';
import { UpdateUserHandler } from '../../application/users/update-user/update-user.handler.js';
import { DeleteUserHandler } from '../../application/users/delete-user/delete-user.handler.js';
import { ListUsersHandler } from '../../application/users/list-users/list-users.handler.js';
import { CreateUserRequest } from '../../application/users/create-user/create-user.request.js';
import { GetUserRequest } from '../../application/users/get-user/get-user.request.js';
import { UpdateUserRequest } from '../../application/users/update-user/update-user.request.js';
import { DeleteUserRequest } from '../../application/users/delete-user/delete-user.request.js';
import { ListUsersRequest } from '../../application/users/list-users/list-users.request.js';
import { readBody, numberValue, numberQuery, textQuery, stringValue, optionalString, nullableString, PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import { UserItemHttpResponse, UsersPageHttpResponse, DeleteUserHttpResponse, toUserHttpResponse } from './user-http.response.js';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(CreateUserHandler) private readonly createHandler: CreateUserHandler,
    @Inject(GetUserHandler) private readonly getHandler: GetUserHandler,
    @Inject(UpdateUserHandler) private readonly updateHandler: UpdateUserHandler,
    @Inject(DeleteUserHandler) private readonly deleteHandler: DeleteUserHandler,
    @Inject(ListUsersHandler) private readonly listHandler: ListUsersHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@CurrentIdentity() actor: VerifiedIdentity, @Body() input: unknown): Promise<UserItemHttpResponse> {
    const body = readBody(input, ['email', 'emailVerifiedAt', 'firstName', 'lastName', 'displayName', 'avatarUrl', 'locale', 'timezone', 'status', 'lastLoginAt']);
    const response = await this.createHandler.execute(new CreateUserRequest(null, {
      email: stringValue(body, 'email'),
      emailVerifiedAt: nullableString(body, 'emailVerifiedAt'),
      firstName: stringValue(body, 'firstName'),
      lastName: stringValue(body, 'lastName'),
      displayName: nullableString(body, 'displayName'),
      avatarUrl: nullableString(body, 'avatarUrl'),
      locale: nullableString(body, 'locale'),
      timezone: nullableString(body, 'timezone'),
      status: stringValue(body, 'status'),
      lastLoginAt: nullableString(body, 'lastLoginAt'),
    }, actor));
    return new UserItemHttpResponse(toUserHttpResponse(response.item));
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(
    @CurrentIdentity() actor: VerifiedIdentity,
    @Query('pageNumber') pageNumber: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortDirection') sortDirection: string | undefined,
  ): Promise<UsersPageHttpResponse> {
    const response = await this.listHandler.execute(new ListUsersRequest(null, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc'), actor));
    return new UsersPageHttpResponse(response.items.map(toUserHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@CurrentIdentity() actor: VerifiedIdentity, @Param('id') id: string): Promise<UserItemHttpResponse> {
    const response = await this.getHandler.execute(new GetUserRequest(null, id, actor));
    return new UserItemHttpResponse(toUserHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@CurrentIdentity() actor: VerifiedIdentity, @Param('id') id: string, @Body() input: unknown): Promise<UserItemHttpResponse> {
    const body = readBody(input, ['version', 'email', 'emailVerifiedAt', 'firstName', 'lastName', 'displayName', 'avatarUrl', 'locale', 'timezone', 'status', 'lastLoginAt']);
    const response = await this.updateHandler.execute(new UpdateUserRequest(null, id, numberValue(body, 'version'), {
      email: optionalString(body, 'email'),
      emailVerifiedAt: nullableString(body, 'emailVerifiedAt'),
      firstName: optionalString(body, 'firstName'),
      lastName: optionalString(body, 'lastName'),
      displayName: nullableString(body, 'displayName'),
      avatarUrl: nullableString(body, 'avatarUrl'),
      locale: nullableString(body, 'locale'),
      timezone: nullableString(body, 'timezone'),
      status: optionalString(body, 'status'),
      lastLoginAt: nullableString(body, 'lastLoginAt'),
    }, actor));
    return new UserItemHttpResponse(toUserHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@CurrentIdentity() actor: VerifiedIdentity, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteUserHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteUserRequest(null, id, numberQuery(version), actor));
    return new DeleteUserHttpResponse(response.id, response.deleted);
  }
}
