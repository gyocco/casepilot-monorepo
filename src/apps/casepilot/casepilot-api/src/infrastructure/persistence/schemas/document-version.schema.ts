import { EntitySchema } from 'typeorm';
import { DocumentVersion } from '../../../domain/entities/document-version.js';
import type { SqlTable } from '@casepilot/persistence/typeorm';
import { sqlString, sqlTimestamp, sqlInteger } from '@casepilot/persistence/typeorm';
export const document_versionSchema = new EntitySchema<DocumentVersion>({
  name: 'DocumentVersion', target: DocumentVersion, tableName: 'document_versions',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    documentId: { name: 'document_id', type: 'uuid', nullable: false },
    versionNumber: { name: 'version_number', type: 'integer', nullable: false },
    storageKey: { name: 'storage_key', type: 'varchar', nullable: false, length: 255 },
    fileName: { name: 'file_name', type: 'varchar', nullable: false, length: 255 },
    mimeType: { name: 'mime_type', type: 'varchar', nullable: false, length: 255 },
    sizeBytes: { name: 'size_bytes', type: 'bigint', nullable: false },
    checksum: { name: 'checksum', type: 'varchar', nullable: true, length: 255 },
    uploadedByMemberId: { name: 'uploaded_by_member_id', type: 'uuid', nullable: false },
  },
  uniques: [
    { name: 'uq_document_versions_0', columns: ["businessAccountId","id"] },
    { name: 'uq_document_versions_1', columns: ["documentId","versionNumber"] },
    { name: 'uq_document_versions_2', columns: ["businessAccountId","id","documentId"] },
  ],
  indices: [
    { name: 'idx_document_versions_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_document_versions_1', columns: ["businessAccountId","documentId"] },
    { name: 'idx_document_versions_2', columns: ["businessAccountId","uploadedByMemberId"] },
  ],
  foreignKeys: [
    { name: 'fk_document_versions_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_document_versions_document_id', target: 'Document', columnNames: ["businessAccountId","documentId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_document_versions_uploaded_by_member_id', target: 'Member', columnNames: ["businessAccountId","uploadedByMemberId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const document_versionTable: SqlTable<DocumentVersion> = {
  schema: document_versionSchema, tableName: 'document_versions', scopeColumn: 'business_account_id',
  idColumn: 'id', versionColumn: 'version', immutableColumns: ['id', 'created_at', 'business_account_id'],
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'documentId', name: 'document_id', value: entity => entity.documentId },
    { property: 'versionNumber', name: 'version_number', value: entity => entity.versionNumber },
    { property: 'storageKey', name: 'storage_key', value: entity => entity.storageKey },
    { property: 'fileName', name: 'file_name', value: entity => entity.fileName },
    { property: 'mimeType', name: 'mime_type', value: entity => entity.mimeType },
    { property: 'sizeBytes', name: 'size_bytes', value: entity => entity.sizeBytes },
    { property: 'checksum', name: 'checksum', value: entity => entity.checksum },
    { property: 'uploadedByMemberId', name: 'uploaded_by_member_id', value: entity => entity.uploadedByMemberId },
  ],
  read: row => {
    const entity = new DocumentVersion();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.documentId = sqlString(row.documentId);
    entity.versionNumber = sqlInteger(row.versionNumber);
    entity.storageKey = sqlString(row.storageKey);
    entity.fileName = sqlString(row.fileName);
    entity.mimeType = sqlString(row.mimeType);
    entity.sizeBytes = sqlString(row.sizeBytes);
    entity.checksum = row.checksum === null ? null : sqlString(row.checksum);
    entity.uploadedByMemberId = sqlString(row.uploadedByMemberId);
    return entity;
  },
};
