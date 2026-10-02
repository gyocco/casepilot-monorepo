import { Request, Response } from '@casepilot/cqrs';
import type { Deadline } from '../../domain/entities/deadline.js';

import type { PageMetadataResponse } from '../shared/crud-models.js';

export interface CreateDeadlineData {
  readonly caseId: string;
  readonly title: string;
  readonly dueAt: string;
  readonly status: 'PENDING' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
  readonly responsibleMemberId?: string | null;
  readonly completedAt?: string | null;
  readonly notes?: string | null;
}
export interface UpdateDeadlineData {
  readonly caseId?: string;
  readonly title?: string;
  readonly dueAt?: string;
  readonly status?: 'PENDING' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
  readonly responsibleMemberId?: string | null;
  readonly completedAt?: string | null;
  readonly notes?: string | null;
}
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
export class CreateDeadlineRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateDeadlineData) { super(); }
}
export class CreateDeadlineResponse extends Response {
  constructor(public readonly item: DeadlineResponse) { super(); }
}
export class GetDeadlineRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetDeadlineResponse extends Response {
  constructor(public readonly item: DeadlineResponse) { super(); }
}
export class UpdateDeadlineRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateDeadlineData) { super(); }
}
export class UpdateDeadlineResponse extends Response {
  constructor(public readonly item: DeadlineResponse) { super(); }
}
export class DeleteDeadlineRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteDeadlineResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListDeadlinesRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListDeadlinesResponse extends Response {
  constructor(public readonly items: readonly DeadlineResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
