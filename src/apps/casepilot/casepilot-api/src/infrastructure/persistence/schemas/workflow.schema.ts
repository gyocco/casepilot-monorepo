import { EntitySchema } from 'typeorm';
import { Workflow } from '../../../domain/entities/workflow.js';
import type { SqlTable } from '@casepilot/abstractions/typeorm';
import { sqlString, sqlTimestamp, sqlInteger, sqlBoolean } from '@casepilot/abstractions/typeorm';
export const workflowSchema = new EntitySchema<Workflow>({
  name: 'Workflow', target: Workflow, tableName: 'workflows',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    name: { name: 'name', type: 'varchar', nullable: false, length: 255 },
    description: { name: 'description', type: 'text', nullable: true },
    isActive: { name: 'is_active', type: 'boolean', nullable: false },
  },
  uniques: [
    { name: 'uq_workflows_0', columns: ["businessAccountId","id"] },
  ],
  indices: [
    { name: 'idx_workflows_0', columns: ["businessAccountId","createdAt","id"] },
  ],
  foreignKeys: [
    { name: 'fk_workflows_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const workflowTable: SqlTable<Workflow> = {
  schema: workflowSchema, tableName: 'workflows', scopeColumn: 'business_account_id',
  idColumn: 'id', versionColumn: 'version', immutableColumns: ['id', 'created_at', 'business_account_id'],
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'name', name: 'name', value: entity => entity.name },
    { property: 'description', name: 'description', value: entity => entity.description },
    { property: 'isActive', name: 'is_active', value: entity => entity.isActive },
  ],
  read: row => {
    const entity = new Workflow();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.name = sqlString(row.name);
    entity.description = row.description === null ? null : sqlString(row.description);
    entity.isActive = sqlBoolean(row.isActive);
    return entity;
  },
};
