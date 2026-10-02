import type { TimeEntryResponse } from '../../application/time-entries/time-entry.models.js';
import { PageMetadataHttpResponse } from '../shared/crud-http.js';

export class TimeEntryHttpResponse {
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
  ) {}
}
export function toTimeEntryHttpResponse(item: TimeEntryResponse): TimeEntryHttpResponse {
  return new TimeEntryHttpResponse(item.id, item.createdAt, item.updatedAt, item.version, item.businessAccountId, item.caseId, item.memberId, item.taskId, item.description, item.startedAt, item.endedAt, item.durationMinutes, item.billable, item.hourlyRate, item.currency, item.invoiceLineId);
}
export class TimeEntryItemHttpResponse {
  constructor(public readonly item: TimeEntryHttpResponse) {}
}
export class TimeEntriesPageHttpResponse {
  constructor(public readonly items: readonly TimeEntryHttpResponse[], public readonly pagination: PageMetadataHttpResponse) {}
}
export class DeleteTimeEntryHttpResponse {
  constructor(public readonly id: string, public readonly deleted: boolean) {}
}
