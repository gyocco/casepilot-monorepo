import { Request, Response } from '@casepilot/cqrs';
import type { TimeEntry } from '../../domain/entities/time-entry.js';

import type { PageMetadataResponse } from '@casepilot/cqrs';

export interface CreateTimeEntryData {
  readonly caseId: string;
  readonly memberId: string;
  readonly taskId?: string | null;
  readonly description?: string | null;
  readonly startedAt?: string | null;
  readonly endedAt?: string | null;
  readonly durationMinutes: number;
  readonly billable: boolean;
  readonly hourlyRate?: string | null;
  readonly currency?: string | null;
  readonly invoiceLineId?: string | null;
}
export interface UpdateTimeEntryData {
  readonly caseId?: string;
  readonly memberId?: string;
  readonly taskId?: string | null;
  readonly description?: string | null;
  readonly startedAt?: string | null;
  readonly endedAt?: string | null;
  readonly durationMinutes?: number;
  readonly billable?: boolean;
  readonly hourlyRate?: string | null;
  readonly currency?: string | null;
  readonly invoiceLineId?: string | null;
}
export class TimeEntryResponse extends Response {
  constructor(
    public readonly id: string,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly version: number,
    public readonly businessAccountId: string,
    public readonly caseId: string,
    public readonly memberId: string,
    public readonly taskId: string | null,
    public readonly description: string | null,
    public readonly startedAt: string | null,
    public readonly endedAt: string | null,
    public readonly durationMinutes: number,
    public readonly billable: boolean,
    public readonly hourlyRate: string | null,
    public readonly currency: string | null,
    public readonly invoiceLineId: string | null,
  ) { super(); }
}
export function toTimeEntryResponse(entity: TimeEntry): TimeEntryResponse {
  return new TimeEntryResponse(entity.id, entity.createdAt, entity.updatedAt, entity.version, entity.businessAccountId, entity.caseId, entity.memberId, entity.taskId, entity.description, entity.startedAt, entity.endedAt, entity.durationMinutes, entity.billable, entity.hourlyRate, entity.currency, entity.invoiceLineId);
}
export class CreateTimeEntryRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateTimeEntryData) { super(); }
}
export class CreateTimeEntryResponse extends Response {
  constructor(public readonly item: TimeEntryResponse) { super(); }
}
export class GetTimeEntryRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
export class GetTimeEntryResponse extends Response {
  constructor(public readonly item: TimeEntryResponse) { super(); }
}
export class UpdateTimeEntryRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateTimeEntryData) { super(); }
}
export class UpdateTimeEntryResponse extends Response {
  constructor(public readonly item: TimeEntryResponse) { super(); }
}
export class DeleteTimeEntryRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
export class DeleteTimeEntryResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
export class ListTimeEntriesRequest extends Request {
  constructor(
    public readonly businessAccountId: string | null,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly sortBy: string,
    public readonly sortDirection: string,
  ) { super(); }
}
export class ListTimeEntriesResponse extends Response {
  constructor(public readonly items: readonly TimeEntryResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
