import { EntitySchema } from 'typeorm';
import { Communication } from '../../../domain/entities/communication.js';
import type { SqlTable } from '../sql-table.js';
import { sqlString, sqlTimestamp, sqlInteger, sqlChoice } from '../sql-values.js';
export const communicationSchema = new EntitySchema<Communication>({
  name: 'Communication', target: Communication, tableName: 'communications',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    caseId: { name: 'case_id', type: 'uuid', nullable: true },
    externalPartyId: { name: 'external_party_id', type: 'uuid', nullable: true },
    memberId: { name: 'member_id', type: 'uuid', nullable: true },
    type: { name: 'type', type: 'varchar', nullable: false, length: 255 },
    direction: { name: 'direction', type: 'varchar', nullable: true, length: 255 },
    subject: { name: 'subject', type: 'varchar', nullable: true, length: 255 },
    body: { name: 'body', type: 'text', nullable: true },
    occurredAt: { name: 'occurred_at', type: 'timestamptz', nullable: false },
    externalReference: { name: 'external_reference', type: 'varchar', nullable: true, length: 255 },
  },
  uniques: [
    { name: 'uq_communications_0', columns: ["businessAccountId","id"] },
  ],
  indices: [
    { name: 'idx_communications_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_communications_1', columns: ["businessAccountId","caseId"] },
    { name: 'idx_communications_2', columns: ["businessAccountId","externalPartyId"] },
    { name: 'idx_communications_3', columns: ["businessAccountId","memberId"] },
  ],
  foreignKeys: [
    { name: 'fk_communications_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_communications_case_id', target: 'Case', columnNames: ["businessAccountId","caseId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_communications_external_party_id', target: 'ExternalParty', columnNames: ["businessAccountId","externalPartyId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_communications_member_id', target: 'Member', columnNames: ["businessAccountId","memberId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const communicationTable: SqlTable<Communication> = {
  schema: communicationSchema, tableName: 'communications', tenant: true,
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'caseId', name: 'case_id', value: entity => entity.caseId },
    { property: 'externalPartyId', name: 'external_party_id', value: entity => entity.externalPartyId },
    { property: 'memberId', name: 'member_id', value: entity => entity.memberId },
    { property: 'type', name: 'type', value: entity => entity.type },
    { property: 'direction', name: 'direction', value: entity => entity.direction },
    { property: 'subject', name: 'subject', value: entity => entity.subject },
    { property: 'body', name: 'body', value: entity => entity.body },
    { property: 'occurredAt', name: 'occurred_at', value: entity => entity.occurredAt },
    { property: 'externalReference', name: 'external_reference', value: entity => entity.externalReference },
  ],
  read: row => {
    const entity = new Communication();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.caseId = row.caseId === null ? null : sqlString(row.caseId);
    entity.externalPartyId = row.externalPartyId === null ? null : sqlString(row.externalPartyId);
    entity.memberId = row.memberId === null ? null : sqlString(row.memberId);
    entity.type = sqlChoice(row.type, ['EMAIL', 'PHONE', 'MEETING', 'MESSAGE', 'LETTER'] as const);
    entity.direction = row.direction === null ? null : sqlChoice(row.direction, ['INBOUND', 'OUTBOUND'] as const);
    entity.subject = row.subject === null ? null : sqlString(row.subject);
    entity.body = row.body === null ? null : sqlString(row.body);
    entity.occurredAt = sqlTimestamp(row.occurredAt);
    entity.externalReference = row.externalReference === null ? null : sqlString(row.externalReference);
    return entity;
  },
};
