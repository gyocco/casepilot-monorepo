import { Response } from '@casepilot/cqrs';
import type { CaseMember } from '../../../domain/entities/case-member.js';

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
