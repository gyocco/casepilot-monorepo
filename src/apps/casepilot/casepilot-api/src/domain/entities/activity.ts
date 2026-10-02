import { TenantEntity, type JsonValue } from './stored-entity.js';

export class Activity extends TenantEntity {
  actorMemberId!: string | null;
  action!: string;
  entityType!: string;
  entityId!: string;
  caseId!: string | null;
  metadata!: JsonValue | null;
  occurredAt!: string;
}
