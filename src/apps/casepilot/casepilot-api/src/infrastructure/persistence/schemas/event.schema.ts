import { EntitySchema } from 'typeorm';
import { Event } from '../../../domain/entities/event.js';
import type { SqlTable } from '@casepilot/persistence/typeorm';
import { sqlString, sqlTimestamp, sqlInteger, sqlBoolean } from '@casepilot/persistence/typeorm';
export const eventSchema = new EntitySchema<Event>({
  name: 'Event', target: Event, tableName: 'events',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    caseId: { name: 'case_id', type: 'uuid', nullable: true },
    title: { name: 'title', type: 'varchar', nullable: false, length: 255 },
    description: { name: 'description', type: 'text', nullable: true },
    eventType: { name: 'event_type', type: 'varchar', nullable: true, length: 255 },
    startsAt: { name: 'starts_at', type: 'timestamptz', nullable: false },
    endsAt: { name: 'ends_at', type: 'timestamptz', nullable: true },
    allDay: { name: 'all_day', type: 'boolean', nullable: false },
    location: { name: 'location', type: 'varchar', nullable: true, length: 255 },
    createdByMemberId: { name: 'created_by_member_id', type: 'uuid', nullable: false },
  },
  uniques: [
    { name: 'uq_events_0', columns: ["businessAccountId","id"] },
  ],
  indices: [
    { name: 'idx_events_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_events_1', columns: ["businessAccountId","caseId"] },
    { name: 'idx_events_2', columns: ["businessAccountId","createdByMemberId"] },
  ],
  foreignKeys: [
    { name: 'fk_events_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_events_case_id', target: 'Case', columnNames: ["businessAccountId","caseId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_events_created_by_member_id', target: 'Member', columnNames: ["businessAccountId","createdByMemberId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const eventTable: SqlTable<Event> = {
  schema: eventSchema, tableName: 'events', scopeColumn: 'business_account_id',
  idColumn: 'id', versionColumn: 'version', immutableColumns: ['id', 'created_at', 'business_account_id'],
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'caseId', name: 'case_id', value: entity => entity.caseId },
    { property: 'title', name: 'title', value: entity => entity.title },
    { property: 'description', name: 'description', value: entity => entity.description },
    { property: 'eventType', name: 'event_type', value: entity => entity.eventType },
    { property: 'startsAt', name: 'starts_at', value: entity => entity.startsAt },
    { property: 'endsAt', name: 'ends_at', value: entity => entity.endsAt },
    { property: 'allDay', name: 'all_day', value: entity => entity.allDay },
    { property: 'location', name: 'location', value: entity => entity.location },
    { property: 'createdByMemberId', name: 'created_by_member_id', value: entity => entity.createdByMemberId },
  ],
  read: row => {
    const entity = new Event();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.caseId = row.caseId === null ? null : sqlString(row.caseId);
    entity.title = sqlString(row.title);
    entity.description = row.description === null ? null : sqlString(row.description);
    entity.eventType = row.eventType === null ? null : sqlString(row.eventType);
    entity.startsAt = sqlTimestamp(row.startsAt);
    entity.endsAt = row.endsAt === null ? null : sqlTimestamp(row.endsAt);
    entity.allDay = sqlBoolean(row.allDay);
    entity.location = row.location === null ? null : sqlString(row.location);
    entity.createdByMemberId = sqlString(row.createdByMemberId);
    return entity;
  },
};
