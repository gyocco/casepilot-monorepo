import { Request, Response } from '@casepilot/cqrs';
import type { Member } from '../../domain/entities/member.js';

import type { PageMetadataResponse } from '@casepilot/cqrs';

export interface CreateMemberData {
  readonly userId: string;
  readonly role: string;
  readonly status: 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'REMOVED';
  readonly title?: string | null;
  readonly professionalRegistration?: string | null;
  readonly hourlyRate?: string | null;
  readonly joinedAt?: string | null;
  readonly invitedAt?: string | null;
}
export interface UpdateMemberData {
  readonly userId?: string;
  readonly role?: string;
  readonly status?: 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'REMOVED';
  readonly title?: string | null;
  readonly professionalRegistration?: string | null;
  readonly hourlyRate?: string | null;
  readonly joinedAt?: string | null;
  readonly invitedAt?: string | null;
}
export class MemberResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly userId: string,
    public readonly role: string,
    public readonly status: 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'REMOVED',
    public readonly title: string | null,
    public readonly professionalRegistration: string | null,
    public readonly hourlyRate: string | null,
    public readonly joinedAt: string | null,
    public readonly invitedAt: string | null,
  ) { super(); }
}
export function toMemberResponse(entity: Member): MemberResponse {
  return new MemberResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.userId, entity.role, entity.status, entity.title, entity.professionalRegistration, entity.hourlyRate, entity.joinedAt, entity.invitedAt);
}
export class CreateMemberRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateMemberData) { super(); }
}
export class CreateMemberResponse extends Response {
  constructor(public readonly item: MemberResponse) { super(); }
}
export class GetMemberRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetMemberResponse extends Response {
  constructor(public readonly item: MemberResponse) { super(); }
}
export class UpdateMemberRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateMemberData) { super(); }
}
export class UpdateMemberResponse extends Response {
  constructor(public readonly item: MemberResponse) { super(); }
}
export class DeleteMemberRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteMemberResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListMembersRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListMembersResponse extends Response {
  constructor(public readonly items: readonly MemberResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
