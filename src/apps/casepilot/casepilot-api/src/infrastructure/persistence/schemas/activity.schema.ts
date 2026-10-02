import { EntitySchema } from 'typeorm';
import { Activity } from '../../../domain/entities/activity.js';
import type { SqlTable } from '../sql-table.js';
import { sqlString, sqlTimestamp, sqlInteger, sqlJson } from '../sql-values.js';
export const activitySchema = new EntitySchema<Activity>({
  name: 'Activity', target: Activity, tableName: 'activities',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    actorMemberId: { name: 'actor_member_id', type: 'uuid', nullable: true },
    action: { name: 'action', type: 'varchar', nullable: false, length: 255 },
    entityType: { name: 'entity_type', type: 'varchar', nullable: false, length: 255 },
    entityId: { name: 'entity_id', type: 'uuid', nullable: false },
    caseId: { name: 'case_id', type: 'uuid', nullable: true },
    metadata: { name: 'metadata', type: 'jsonb', nullable: true },
    occurredAt: { name: 'occurred_at', type: 'timestamptz', nullable: false },
  },
  uniques: [
    { name: 'uq_activities_0', columns: ["businessAccountId","id"] },
  ],
  indices: [
    { name: 'idx_activities_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_activities_1', columns: ["businessAccountId","actorMemberId"] },
    { name: 'idx_activities_2', columns: ["businessAccountId","caseId"] },
  ],
  foreignKeys: [
    { name: 'fk_activities_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_activities_actor_member_id', target: 'Member', columnNames: ["businessAccountId","actorMemberId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_activities_case_id', target: 'Case', columnNames: ["businessAccountId","caseId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const activityTable: SqlTable<Activity> = {
  schema: activitySchema, tableName: 'activities', tenant: true,
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'actorMemberId', name: 'actor_member_id', value: entity => entity.actorMemberId },
    { property: 'action', name: 'action', value: entity => entity.action },
    { property: 'entityType', name: 'entity_type', value: entity => entity.entityType },
    { property: 'entityId', name: 'entity_id', value: entity => entity.entityId },
    { property: 'caseId', name: 'case_id', value: entity => entity.caseId },
    { property: 'metadata', name: 'metadata', json: true, value: entity => entity.metadata },
    { property: 'occurredAt', name: 'occurred_at', value: entity => entity.occurredAt },
  ],
  read: row => {
    const entity = new Activity();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.actorMemberId = row.actorMemberId === null ? null : sqlString(row.actorMemberId);
    entity.action = sqlString(row.action);
    entity.entityType = sqlString(row.entityType);
    entity.entityId = sqlString(row.entityId);
    entity.caseId = row.caseId === null ? null : sqlString(row.caseId);
    entity.metadata = row.metadata === null ? null : sqlJson(row.metadata);
    entity.occurredAt = sqlTimestamp(row.occurredAt);
    return entity;
  },
};
