import { Response } from '@casepilot/cqrs';
import type { Deadline } from '../../../domain/entities/deadline.js';

export class DeadlineResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly caseId: string,
    public readonly title: string,
    public readonly dueAt: string,
    public readonly status: 'PENDING' | 'COMPLETED' | 'MISSED' | 'CANCELLED',
    public readonly responsibleMemberId: string | null,
    public readonly completedAt: string | null,
    public readonly notes: string | null,
  ) { super(); }
}
export function toDeadlineResponse(entity: Deadline): DeadlineResponse {
  return new DeadlineResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.caseId, entity.title, entity.dueAt, entity.status, entity.responsibleMemberId, entity.completedAt, entity.notes);
}
