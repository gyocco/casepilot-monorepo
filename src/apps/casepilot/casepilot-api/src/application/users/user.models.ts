import { Request, Response } from '@casepilot/cqrs';
import type { User } from '../../domain/entities/user.js';

import type { PageMetadataResponse } from '../shared/crud-models.js';

export interface CreateUserData {
  readonly email: string;
  readonly emailVerifiedAt?: string | null;
  readonly firstName: string;
  readonly lastName: string;
  readonly displayName?: string | null;
  readonly avatarUrl?: string | null;
  readonly locale?: string | null;
  readonly timezone?: string | null;
  readonly status: string;
  readonly lastLoginAt?: string | null;
}
export interface UpdateUserData {
  readonly email?: string;
  readonly emailVerifiedAt?: string | null;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly displayName?: string | null;
  readonly avatarUrl?: string | null;
  readonly locale?: string | null;
  readonly timezone?: string | null;
  readonly status?: string;
  readonly lastLoginAt?: string | null;
}
export class UserResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly email: string,
    public readonly emailVerifiedAt: string | null,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly displayName: string | null,
    public readonly avatarUrl: string | null,
    public readonly locale: string | null,
    public readonly timezone: string | null,
    public readonly status: string,
    public readonly lastLoginAt: string | null,
  ) { super(); }
}
export function toUserResponse(entity: User): UserResponse {
  return new UserResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.email, entity.emailVerifiedAt, entity.firstName, entity.lastName, entity.displayName, entity.avatarUrl, entity.locale, entity.timezone, entity.status, entity.lastLoginAt);
}
export class CreateUserRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateUserData) { super(); }
}
export class CreateUserResponse extends Response {
  constructor(public readonly item: UserResponse) { super(); }
}
export class GetUserRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetUserResponse extends Response {
  constructor(public readonly item: UserResponse) { super(); }
}
export class UpdateUserRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateUserData) { super(); }
}
export class UpdateUserResponse extends Response {
  constructor(public readonly item: UserResponse) { super(); }
}
export class DeleteUserRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteUserResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListUsersRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListUsersResponse extends Response {
  constructor(public readonly items: readonly UserResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
