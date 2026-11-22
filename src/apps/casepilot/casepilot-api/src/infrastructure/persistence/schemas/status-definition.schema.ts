import { EntitySchema } from 'typeorm';
import { StatusDefinition } from '../../../domain/entities/status-definition.js';
import type { SqlTable } from '@casepilot/persistence/typeorm';
import { sqlString, sqlTimestamp, sqlInteger, sqlBoolean } from '@casepilot/persistence/typeorm';
export const status_definitionSchema = new EntitySchema<StatusDefinition>({
  name: 'StatusDefinition', target: StatusDefinition, tableName: 'status_definitions',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    entityType: { name: 'entity_type', type: 'varchar', nullable: false, length: 255 },
    caseTypeId: { name: 'case_type_id', type: 'uuid', nullable: true },
    name: { name: 'name', type: 'varchar', nullable: false, length: 255 },
    code: { name: 'code', type: 'varchar', nullable: false, length: 255 },
    category: { name: 'category', type: 'varchar', nullable: true, length: 255 },
    sortOrder: { name: 'sort_order', type: 'integer', nullable: false },
    isInitial: { name: 'is_initial', type: 'boolean', nullable: false },
    isTerminal: { name: 'is_terminal', type: 'boolean', nullable: false },
    isActive: { name: 'is_active', type: 'boolean', nullable: false },
  },
  uniques: [
    { name: 'uq_status_definitions_0', columns: ["businessAccountId","id"] },
  ],
  indices: [
    { name: 'idx_status_definitions_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_status_definitions_1', columns: ["businessAccountId","caseTypeId"] },
  ],
  foreignKeys: [
    { name: 'fk_status_definitions_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_status_definitions_case_type_id', target: 'CaseType', columnNames: ["businessAccountId","caseTypeId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const status_definitionTable: SqlTable<StatusDefinition> = {
  schema: status_definitionSchema, tableName: 'status_definitions', scopeColumn: 'business_account_id',
  idColumn: 'id', versionColumn: 'version', immutableColumns: ['id', 'created_at', 'business_account_id'],
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'entityType', name: 'entity_type', value: entity => entity.entityType },
    { property: 'caseTypeId', name: 'case_type_id', value: entity => entity.caseTypeId },
    { property: 'name', name: 'name', value: entity => entity.name },
    { property: 'code', name: 'code', value: entity => entity.code },
    { property: 'category', name: 'category', value: entity => entity.category },
    { property: 'sortOrder', name: 'sort_order', value: entity => entity.sortOrder },
    { property: 'isInitial', name: 'is_initial', value: entity => entity.isInitial },
    { property: 'isTerminal', name: 'is_terminal', value: entity => entity.isTerminal },
    { property: 'isActive', name: 'is_active', value: entity => entity.isActive },
  ],
  read: row => {
    const entity = new StatusDefinition();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.entityType = sqlString(row.entityType);
    entity.caseTypeId = row.caseTypeId === null ? null : sqlString(row.caseTypeId);
    entity.name = sqlString(row.name);
    entity.code = sqlString(row.code);
    entity.category = row.category === null ? null : sqlString(row.category);
    entity.sortOrder = sqlInteger(row.sortOrder);
    entity.isInitial = sqlBoolean(row.isInitial);
    entity.isTerminal = sqlBoolean(row.isTerminal);
    entity.isActive = sqlBoolean(row.isActive);
    return entity;
  },
};
