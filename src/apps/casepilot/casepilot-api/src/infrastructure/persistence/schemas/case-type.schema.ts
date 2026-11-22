import { EntitySchema } from 'typeorm';
import { CaseType } from '../../../domain/entities/case-type.js';
import type { SqlTable } from '@casepilot/persistence/typeorm';
import { sqlString, sqlTimestamp, sqlInteger, sqlBoolean } from '@casepilot/persistence/typeorm';
export const case_typeSchema = new EntitySchema<CaseType>({
  name: 'CaseType', target: CaseType, tableName: 'case_types',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    name: { name: 'name', type: 'varchar', nullable: false, length: 255 },
    description: { name: 'description', type: 'text', nullable: true },
    code: { name: 'code', type: 'varchar', nullable: true, length: 255 },
    isActive: { name: 'is_active', type: 'boolean', nullable: false },
    defaultWorkflowId: { name: 'default_workflow_id', type: 'uuid', nullable: true },
  },
  uniques: [
    { name: 'uq_case_types_0', columns: ["businessAccountId","id"] },
  ],
  indices: [
    { name: 'idx_case_types_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_case_types_1', columns: ["businessAccountId","defaultWorkflowId"] },
  ],
  foreignKeys: [
    { name: 'fk_case_types_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_case_types_default_workflow_id', target: 'Workflow', columnNames: ["businessAccountId","defaultWorkflowId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const case_typeTable: SqlTable<CaseType> = {
  schema: case_typeSchema, tableName: 'case_types', scopeColumn: 'business_account_id',
  idColumn: 'id', versionColumn: 'version', immutableColumns: ['id', 'created_at', 'business_account_id'],
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'name', name: 'name', value: entity => entity.name },
    { property: 'description', name: 'description', value: entity => entity.description },
    { property: 'code', name: 'code', value: entity => entity.code },
    { property: 'isActive', name: 'is_active', value: entity => entity.isActive },
    { property: 'defaultWorkflowId', name: 'default_workflow_id', value: entity => entity.defaultWorkflowId },
  ],
  read: row => {
    const entity = new CaseType();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.name = sqlString(row.name);
    entity.description = row.description === null ? null : sqlString(row.description);
    entity.code = row.code === null ? null : sqlString(row.code);
    entity.isActive = sqlBoolean(row.isActive);
    entity.defaultWorkflowId = row.defaultWorkflowId === null ? null : sqlString(row.defaultWorkflowId);
    return entity;
  },
};
