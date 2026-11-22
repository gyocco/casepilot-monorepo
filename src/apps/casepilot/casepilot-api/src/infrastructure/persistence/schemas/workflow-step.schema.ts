import { EntitySchema } from 'typeorm';
import { WorkflowStep } from '../../../domain/entities/workflow-step.js';
import type { SqlTable } from '@casepilot/persistence/typeorm';
import { sqlString, sqlTimestamp, sqlInteger, sqlBoolean } from '@casepilot/persistence/typeorm';
export const workflow_stepSchema = new EntitySchema<WorkflowStep>({
  name: 'WorkflowStep', target: WorkflowStep, tableName: 'workflow_steps',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    workflowId: { name: 'workflow_id', type: 'uuid', nullable: false },
    statusDefinitionId: { name: 'status_definition_id', type: 'uuid', nullable: true },
    name: { name: 'name', type: 'varchar', nullable: false, length: 255 },
    description: { name: 'description', type: 'text', nullable: true },
    sortOrder: { name: 'sort_order', type: 'integer', nullable: false },
    isInitial: { name: 'is_initial', type: 'boolean', nullable: false },
    isTerminal: { name: 'is_terminal', type: 'boolean', nullable: false },
  },
  uniques: [
    { name: 'uq_workflow_steps_0', columns: ["businessAccountId","id"] },
  ],
  indices: [
    { name: 'idx_workflow_steps_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_workflow_steps_1', columns: ["businessAccountId","workflowId"] },
    { name: 'idx_workflow_steps_2', columns: ["businessAccountId","statusDefinitionId"] },
  ],
  foreignKeys: [
    { name: 'fk_workflow_steps_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_workflow_steps_workflow_id', target: 'Workflow', columnNames: ["businessAccountId","workflowId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_workflow_steps_status_definition_id', target: 'StatusDefinition', columnNames: ["businessAccountId","statusDefinitionId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const workflow_stepTable: SqlTable<WorkflowStep> = {
  schema: workflow_stepSchema, tableName: 'workflow_steps', scopeColumn: 'business_account_id',
  idColumn: 'id', versionColumn: 'version', immutableColumns: ['id', 'created_at', 'business_account_id'],
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'workflowId', name: 'workflow_id', value: entity => entity.workflowId },
    { property: 'statusDefinitionId', name: 'status_definition_id', value: entity => entity.statusDefinitionId },
    { property: 'name', name: 'name', value: entity => entity.name },
    { property: 'description', name: 'description', value: entity => entity.description },
    { property: 'sortOrder', name: 'sort_order', value: entity => entity.sortOrder },
    { property: 'isInitial', name: 'is_initial', value: entity => entity.isInitial },
    { property: 'isTerminal', name: 'is_terminal', value: entity => entity.isTerminal },
  ],
  read: row => {
    const entity = new WorkflowStep();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.workflowId = sqlString(row.workflowId);
    entity.statusDefinitionId = row.statusDefinitionId === null ? null : sqlString(row.statusDefinitionId);
    entity.name = sqlString(row.name);
    entity.description = row.description === null ? null : sqlString(row.description);
    entity.sortOrder = sqlInteger(row.sortOrder);
    entity.isInitial = sqlBoolean(row.isInitial);
    entity.isTerminal = sqlBoolean(row.isTerminal);
    return entity;
  },
};
