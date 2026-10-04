import { Response } from '@casepilot/cqrs';
import type { User } from '../../../domain/entities/user.js';

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
