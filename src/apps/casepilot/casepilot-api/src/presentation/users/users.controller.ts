import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateUserHandler } from '../../application/users/create-user.handler.js';
import { GetUserHandler } from '../../application/users/get-user.handler.js';
import { UpdateUserHandler } from '../../application/users/update-user.handler.js';
import { DeleteUserHandler } from '../../application/users/delete-user.handler.js';
import { ListUsersHandler } from '../../application/users/list-users.handler.js';
import { CreateUserRequest, GetUserRequest, UpdateUserRequest, DeleteUserRequest, ListUsersRequest } from '../../application/users/user.models.js';
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
  async create(@Body() input: unknown): Promise<UserItemHttpResponse> {
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
    }));
    return new UserItemHttpResponse(toUserHttpResponse(response.item));
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(
    @Query('pageNumber') pageNumber: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortDirection') sortDirection: string | undefined,
  ): Promise<UsersPageHttpResponse> {
    const response = await this.listHandler.execute(new ListUsersRequest(null, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc')));
    return new UsersPageHttpResponse(response.items.map(toUserHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@Param('id') id: string): Promise<UserItemHttpResponse> {
    const response = await this.getHandler.execute(new GetUserRequest(null, id));
    return new UserItemHttpResponse(toUserHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@Param('id') id: string, @Body() input: unknown): Promise<UserItemHttpResponse> {
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
    }));
    return new UserItemHttpResponse(toUserHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteUserHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteUserRequest(null, id, numberQuery(version)));
    return new DeleteUserHttpResponse(response.id, response.deleted);
  }
}
