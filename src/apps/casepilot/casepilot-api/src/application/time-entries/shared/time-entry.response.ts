import { Response } from '@casepilot/cqrs';
import type { TimeEntry } from '../../../domain/entities/time-entry.js';

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
