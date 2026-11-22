import { EntitySchema } from 'typeorm';
import { CustomFieldDefinition } from '../../../domain/entities/custom-field-definition.js';
import type { SqlTable } from '@casepilot/persistence/typeorm';
import { sqlString, sqlTimestamp, sqlInteger, sqlBoolean, sqlJson } from '@casepilot/persistence/typeorm';
export const custom_field_definitionSchema = new EntitySchema<CustomFieldDefinition>({
  name: 'CustomFieldDefinition', target: CustomFieldDefinition, tableName: 'custom_field_definitions',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    entityType: { name: 'entity_type', type: 'varchar', nullable: false, length: 255 },
    caseTypeId: { name: 'case_type_id', type: 'uuid', nullable: true },
    name: { name: 'name', type: 'varchar', nullable: false, length: 255 },
    key: { name: 'key', type: 'varchar', nullable: false, length: 255 },
    dataType: { name: 'data_type', type: 'varchar', nullable: false, length: 255 },
    required: { name: 'required', type: 'boolean', nullable: false },
    configuration: { name: 'configuration', type: 'jsonb', nullable: true },
    sortOrder: { name: 'sort_order', type: 'integer', nullable: false },
    isActive: { name: 'is_active', type: 'boolean', nullable: false },
  },
  uniques: [
    { name: 'uq_custom_field_definitions_0', columns: ["businessAccountId","id"] },
    { name: 'uq_custom_field_definitions_1', columns: ["businessAccountId","entityType","key"] },
  ],
  indices: [
    { name: 'idx_custom_field_definitions_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_custom_field_definitions_1', columns: ["businessAccountId","caseTypeId"] },
  ],
  foreignKeys: [
    { name: 'fk_custom_field_definitions_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_custom_field_definitions_case_type_id', target: 'CaseType', columnNames: ["businessAccountId","caseTypeId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const custom_field_definitionTable: SqlTable<CustomFieldDefinition> = {
  schema: custom_field_definitionSchema, tableName: 'custom_field_definitions', scopeColumn: 'business_account_id',
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
    { property: 'key', name: 'key', value: entity => entity.key },
    { property: 'dataType', name: 'data_type', value: entity => entity.dataType },
    { property: 'required', name: 'required', value: entity => entity.required },
    { property: 'configuration', name: 'configuration', json: true, value: entity => entity.configuration },
    { property: 'sortOrder', name: 'sort_order', value: entity => entity.sortOrder },
    { property: 'isActive', name: 'is_active', value: entity => entity.isActive },
  ],
  read: row => {
    const entity = new CustomFieldDefinition();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.entityType = sqlString(row.entityType);
    entity.caseTypeId = row.caseTypeId === null ? null : sqlString(row.caseTypeId);
    entity.name = sqlString(row.name);
    entity.key = sqlString(row.key);
    entity.dataType = sqlString(row.dataType);
    entity.required = sqlBoolean(row.required);
    entity.configuration = row.configuration === null ? null : sqlJson(row.configuration);
    entity.sortOrder = sqlInteger(row.sortOrder);
    entity.isActive = sqlBoolean(row.isActive);
    return entity;
  },
};
