import { EntitySchema } from 'typeorm';
import { Case } from '../../../domain/entities/case.js';
import type { SqlTable } from '@casepilot/persistence/typeorm';
import { sqlString, sqlTimestamp, sqlInteger, sqlChoice } from '@casepilot/persistence/typeorm';
export const caseSchema = new EntitySchema<Case>({
  name: 'Case', target: Case, tableName: 'cases',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    caseTypeId: { name: 'case_type_id', type: 'uuid', nullable: true },
    number: { name: 'number', type: 'varchar', nullable: true, length: 255 },
    externalReference: { name: 'external_reference', type: 'varchar', nullable: true, length: 255 },
    title: { name: 'title', type: 'varchar', nullable: false, length: 255 },
    description: { name: 'description', type: 'text', nullable: true },
    status: { name: 'status', type: 'varchar', nullable: false, length: 255 },
    priority: { name: 'priority', type: 'varchar', nullable: true, length: 255 },
    openedAt: { name: 'opened_at', type: 'timestamptz', nullable: true },
    closedAt: { name: 'closed_at', type: 'timestamptz', nullable: true },
    responsibleMemberId: { name: 'responsible_member_id', type: 'uuid', nullable: true },
    billingType: { name: 'billing_type', type: 'varchar', nullable: true, length: 255 },
    hourlyRate: { name: 'hourly_rate', type: 'numeric', nullable: true, precision: 20, scale: 4 },
    currency: { name: 'currency', type: 'varchar', nullable: true, length: 255 },
    createdByMemberId: { name: 'created_by_member_id', type: 'uuid', nullable: false },
  },
  uniques: [
    { name: 'uq_cases_0', columns: ["businessAccountId","id"] },
    { name: 'uq_cases_1', columns: ["businessAccountId","number"] },
  ],
  indices: [
    { name: 'idx_cases_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_cases_1', columns: ["businessAccountId","status"] },
    { name: 'idx_cases_2', columns: ["businessAccountId","caseTypeId"] },
    { name: 'idx_cases_3', columns: ["businessAccountId","responsibleMemberId"] },
    { name: 'idx_cases_4', columns: ["businessAccountId","createdByMemberId"] },
  ],
  foreignKeys: [
    { name: 'fk_cases_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_cases_case_type_id', target: 'CaseType', columnNames: ["businessAccountId","caseTypeId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_cases_responsible_member_id', target: 'Member', columnNames: ["businessAccountId","responsibleMemberId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_cases_created_by_member_id', target: 'Member', columnNames: ["businessAccountId","createdByMemberId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const caseTable: SqlTable<Case> = {
  schema: caseSchema, tableName: 'cases', scopeColumn: 'business_account_id',
  idColumn: 'id', versionColumn: 'version', immutableColumns: ['id', 'created_at', 'business_account_id'],
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'caseTypeId', name: 'case_type_id', value: entity => entity.caseTypeId },
    { property: 'number', name: 'number', value: entity => entity.number },
    { property: 'externalReference', name: 'external_reference', value: entity => entity.externalReference },
    { property: 'title', name: 'title', value: entity => entity.title },
    { property: 'description', name: 'description', value: entity => entity.description },
    { property: 'status', name: 'status', value: entity => entity.status },
    { property: 'priority', name: 'priority', value: entity => entity.priority },
    { property: 'openedAt', name: 'opened_at', value: entity => entity.openedAt },
    { property: 'closedAt', name: 'closed_at', value: entity => entity.closedAt },
    { property: 'responsibleMemberId', name: 'responsible_member_id', value: entity => entity.responsibleMemberId },
    { property: 'billingType', name: 'billing_type', value: entity => entity.billingType },
    { property: 'hourlyRate', name: 'hourly_rate', value: entity => entity.hourlyRate },
    { property: 'currency', name: 'currency', value: entity => entity.currency },
    { property: 'createdByMemberId', name: 'created_by_member_id', value: entity => entity.createdByMemberId },
  ],
  read: row => {
    const entity = new Case();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.caseTypeId = row.caseTypeId === null ? null : sqlString(row.caseTypeId);
    entity.number = row.number === null ? null : sqlString(row.number);
    entity.externalReference = row.externalReference === null ? null : sqlString(row.externalReference);
    entity.title = sqlString(row.title);
    entity.description = row.description === null ? null : sqlString(row.description);
    entity.status = sqlString(row.status);
    entity.priority = row.priority === null ? null : sqlChoice(row.priority, ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const);
    entity.openedAt = row.openedAt === null ? null : sqlTimestamp(row.openedAt);
    entity.closedAt = row.closedAt === null ? null : sqlTimestamp(row.closedAt);
    entity.responsibleMemberId = row.responsibleMemberId === null ? null : sqlString(row.responsibleMemberId);
    entity.billingType = row.billingType === null ? null : sqlChoice(row.billingType, ['HOURLY', 'FIXED', 'RETAINER', 'NON_BILLABLE'] as const);
    entity.hourlyRate = row.hourlyRate === null ? null : sqlString(row.hourlyRate);
    entity.currency = row.currency === null ? null : sqlString(row.currency);
    entity.createdByMemberId = sqlString(row.createdByMemberId);
    return entity;
  },
};
