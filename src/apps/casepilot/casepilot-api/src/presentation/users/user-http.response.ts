import type { UserResponse } from '../../application/users/user.models.js';
import { PageMetadataHttpResponse } from '@casepilot/validation/nestjs';

export class UserHttpResponse {
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
  ) {}
}
export function toUserHttpResponse(item: UserResponse): UserHttpResponse {
  return new UserHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.email, item.emailVerifiedAt, item.firstName, item.lastName, item.displayName, item.avatarUrl, item.locale, item.timezone, item.status, item.lastLoginAt);
}
export class UserItemHttpResponse {
  constructor(public readonly item: UserHttpResponse) {}
}
export class UsersPageHttpResponse {
  constructor(public readonly items: readonly UserHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteUserHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
