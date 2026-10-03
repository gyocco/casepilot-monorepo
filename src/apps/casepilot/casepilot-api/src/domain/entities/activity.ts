import { TenantEntity } from './tenant-entity.js';
import type { JsonValue } from '@casepilot/abstractions';

export class Activity extends TenantEntity {
  actorMemberId!: string | null;
  action!: string;
  entityType!: string;
  entityId!: string;
  caseId!: string | null;
  metadata!: JsonValue | null;
  occurredAt!: string;
}
