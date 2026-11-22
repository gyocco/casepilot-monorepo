import { EntitySchema } from 'typeorm';
import { CustomFieldValue } from '../../../domain/entities/custom-field-value.js';
import type { SqlTable } from '@casepilot/persistence/typeorm';
import { sqlString, sqlTimestamp, sqlInteger, sqlBoolean, sqlJson } from '@casepilot/persistence/typeorm';
export const custom_field_valueSchema = new EntitySchema<CustomFieldValue>({
  name: 'CustomFieldValue', target: CustomFieldValue, tableName: 'custom_field_values',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    customFieldDefinitionId: { name: 'custom_field_definition_id', type: 'uuid', nullable: false },
    entityType: { name: 'entity_type', type: 'varchar', nullable: false, length: 255 },
    entityId: { name: 'entity_id', type: 'uuid', nullable: false },
    valueText: { name: 'value_text', type: 'text', nullable: true },
    valueNumber: { name: 'value_number', type: 'numeric', nullable: true, precision: 20, scale: 4 },
    valueDate: { name: 'value_date', type: 'timestamptz', nullable: true },
    valueBoolean: { name: 'value_boolean', type: 'boolean', nullable: true },
    valueJson: { name: 'value_json', type: 'jsonb', nullable: true },
  },
  uniques: [
    { name: 'uq_custom_field_values_0', columns: ["businessAccountId","id"] },
    { name: 'uq_custom_field_values_1', columns: ["businessAccountId","customFieldDefinitionId","entityType","entityId"] },
  ],
  indices: [
    { name: 'idx_custom_field_values_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_custom_field_values_1', columns: ["businessAccountId","customFieldDefinitionId"] },
  ],
  foreignKeys: [
    { name: 'fk_custom_field_values_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_custom_field_values_custom_field_definition_id', target: 'CustomFieldDefinition', columnNames: ["businessAccountId","customFieldDefinitionId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const custom_field_valueTable: SqlTable<CustomFieldValue> = {
  schema: custom_field_valueSchema, tableName: 'custom_field_values', scopeColumn: 'business_account_id',
  idColumn: 'id', versionColumn: 'version', immutableColumns: ['id', 'created_at', 'business_account_id'],
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'customFieldDefinitionId', name: 'custom_field_definition_id', value: entity => entity.customFieldDefinitionId },
    { property: 'entityType', name: 'entity_type', value: entity => entity.entityType },
    { property: 'entityId', name: 'entity_id', value: entity => entity.entityId },
    { property: 'valueText', name: 'value_text', value: entity => entity.valueText },
    { property: 'valueNumber', name: 'value_number', value: entity => entity.valueNumber },
    { property: 'valueDate', name: 'value_date', value: entity => entity.valueDate },
    { property: 'valueBoolean', name: 'value_boolean', value: entity => entity.valueBoolean },
    { property: 'valueJson', name: 'value_json', json: true, value: entity => entity.valueJson },
  ],
  read: row => {
    const entity = new CustomFieldValue();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.customFieldDefinitionId = sqlString(row.customFieldDefinitionId);
    entity.entityType = sqlString(row.entityType);
    entity.entityId = sqlString(row.entityId);
    entity.valueText = row.valueText === null ? null : sqlString(row.valueText);
    entity.valueNumber = row.valueNumber === null ? null : sqlString(row.valueNumber);
    entity.valueDate = row.valueDate === null ? null : sqlTimestamp(row.valueDate);
    entity.valueBoolean = row.valueBoolean === null ? null : sqlBoolean(row.valueBoolean);
    entity.valueJson = row.valueJson === null ? null : sqlJson(row.valueJson);
    return entity;
  },
};
