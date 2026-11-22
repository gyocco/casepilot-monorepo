import { EntitySchema } from 'typeorm';
import { Folder } from '../../../domain/entities/folder.js';
import type { SqlTable } from '@casepilot/persistence/typeorm';
import { sqlString, sqlTimestamp, sqlInteger } from '@casepilot/persistence/typeorm';
export const folderSchema = new EntitySchema<Folder>({
  name: 'Folder', target: Folder, tableName: 'folders',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    caseId: { name: 'case_id', type: 'uuid', nullable: true },
    parentFolderId: { name: 'parent_folder_id', type: 'uuid', nullable: true },
    name: { name: 'name', type: 'varchar', nullable: false, length: 255 },
    createdByMemberId: { name: 'created_by_member_id', type: 'uuid', nullable: false },
  },
  uniques: [
    { name: 'uq_folders_0', columns: ["businessAccountId","id"] },
  ],
  indices: [
    { name: 'idx_folders_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_folders_1', columns: ["businessAccountId","caseId"] },
    { name: 'idx_folders_2', columns: ["businessAccountId","parentFolderId"] },
    { name: 'idx_folders_3', columns: ["businessAccountId","createdByMemberId"] },
  ],
  foreignKeys: [
    { name: 'fk_folders_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_folders_case_id', target: 'Case', columnNames: ["businessAccountId","caseId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_folders_parent_folder_id', target: 'Folder', columnNames: ["businessAccountId","parentFolderId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_folders_created_by_member_id', target: 'Member', columnNames: ["businessAccountId","createdByMemberId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const folderTable: SqlTable<Folder> = {
  schema: folderSchema, tableName: 'folders', scopeColumn: 'business_account_id',
  idColumn: 'id', versionColumn: 'version', immutableColumns: ['id', 'created_at', 'business_account_id'],
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'caseId', name: 'case_id', value: entity => entity.caseId },
    { property: 'parentFolderId', name: 'parent_folder_id', value: entity => entity.parentFolderId },
    { property: 'name', name: 'name', value: entity => entity.name },
    { property: 'createdByMemberId', name: 'created_by_member_id', value: entity => entity.createdByMemberId },
  ],
  read: row => {
    const entity = new Folder();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.caseId = row.caseId === null ? null : sqlString(row.caseId);
    entity.parentFolderId = row.parentFolderId === null ? null : sqlString(row.parentFolderId);
    entity.name = sqlString(row.name);
    entity.createdByMemberId = sqlString(row.createdByMemberId);
    return entity;
  },
};
