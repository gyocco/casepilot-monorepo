import { TenantEntity } from './stored-entity.js';

export class Event extends TenantEntity {
  caseId!: string | null;
  title!: string;
  description!: string | null;
  eventType!: string | null;
  startsAt!: string;
  endsAt!: string | null;
  allDay!: boolean;
  location!: string | null;
  createdByMemberId!: string;
}
