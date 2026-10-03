import { Request, Response } from '@casepilot/cqrs';
import type { CaseMember } from '../../domain/entities/case-member.js';

import type { PageMetadataResponse } from '@casepilot/cqrs';

export interface CreateCaseMemberData {
  readonly caseId: string;
  readonly memberId: string;
  readonly role?: string | null;
  readonly isPrimary: boolean;
  readonly assignedAt: string;
  readonly removedAt?: string | null;
}
export interface UpdateCaseMemberData {
  readonly caseId?: string;
  readonly memberId?: string;
  readonly role?: string | null;
  readonly isPrimary?: boolean;
  readonly assignedAt?: string;
  readonly removedAt?: string | null;
}
export class CaseMemberResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly caseId: string,
    public readonly memberId: string,
    public readonly role: string | null,
    public readonly isPrimary: boolean,
    public readonly assignedAt: string,
    public readonly removedAt: string | null,
  ) { super(); }
}
export function toCaseMemberResponse(entity: CaseMember): CaseMemberResponse {
  return new CaseMemberResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.caseId, entity.memberId, entity.role, entity.isPrimary, entity.assignedAt, entity.removedAt);
}
export class CreateCaseMemberRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateCaseMemberData) { super(); }
}
export class CreateCaseMemberResponse extends Response {
  constructor(public readonly item: CaseMemberResponse) { super(); }
}
export class GetCaseMemberRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetCaseMemberResponse extends Response {
  constructor(public readonly item: CaseMemberResponse) { super(); }
}
export class UpdateCaseMemberRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateCaseMemberData) { super(); }
}
export class UpdateCaseMemberResponse extends Response {
  constructor(public readonly item: CaseMemberResponse) { super(); }
}
export class DeleteCaseMemberRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteCaseMemberResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListCaseMembersRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListCaseMembersResponse extends Response {
  constructor(public readonly items: readonly CaseMemberResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
