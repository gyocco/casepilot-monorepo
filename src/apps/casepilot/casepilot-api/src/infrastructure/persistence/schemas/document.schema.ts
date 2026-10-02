import { EntitySchema } from 'typeorm';
import { Document } from '../../../domain/entities/document.js';
import type { SqlTable } from '../sql-table.js';
import { sqlString, sqlTimestamp, sqlInteger } from '../sql-values.js';
export const documentSchema = new EntitySchema<Document>({
  name: 'Document', target: Document, tableName: 'documents',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    caseId: { name: 'case_id', type: 'uuid', nullable: true },
    externalPartyId: { name: 'external_party_id', type: 'uuid', nullable: true },
    folderId: { name: 'folder_id', type: 'uuid', nullable: true },
    name: { name: 'name', type: 'varchar', nullable: false, length: 255 },
    description: { name: 'description', type: 'text', nullable: true },
    documentType: { name: 'document_type', type: 'varchar', nullable: true, length: 255 },
    currentVersionId: { name: 'current_version_id', type: 'uuid', nullable: true },
    createdByMemberId: { name: 'created_by_member_id', type: 'uuid', nullable: false },
  },
  uniques: [
    { name: 'uq_documents_0', columns: ["businessAccountId","id"] },
  ],
  indices: [
    { name: 'idx_documents_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_documents_1', columns: ["businessAccountId","caseId"] },
    { name: 'idx_documents_2', columns: ["businessAccountId","externalPartyId"] },
    { name: 'idx_documents_3', columns: ["businessAccountId","folderId"] },
    { name: 'idx_documents_4', columns: ["businessAccountId","currentVersionId"] },
    { name: 'idx_documents_5', columns: ["businessAccountId","createdByMemberId"] },
  ],
  foreignKeys: [
    { name: 'fk_documents_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_documents_case_id', target: 'Case', columnNames: ["businessAccountId","caseId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_documents_external_party_id', target: 'ExternalParty', columnNames: ["businessAccountId","externalPartyId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_documents_folder_id', target: 'Folder', columnNames: ["businessAccountId","folderId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_documents_current_version_id', target: 'DocumentVersion', columnNames: ["businessAccountId","currentVersionId","id"], referencedColumnNames: ["businessAccountId","id","documentId"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_documents_created_by_member_id', target: 'Member', columnNames: ["businessAccountId","createdByMemberId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const documentTable: SqlTable<Document> = {
  schema: documentSchema, tableName: 'documents', tenant: true,
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'caseId', name: 'case_id', value: entity => entity.caseId },
    { property: 'externalPartyId', name: 'external_party_id', value: entity => entity.externalPartyId },
    { property: 'folderId', name: 'folder_id', value: entity => entity.folderId },
    { property: 'name', name: 'name', value: entity => entity.name },
    { property: 'description', name: 'description', value: entity => entity.description },
    { property: 'documentType', name: 'document_type', value: entity => entity.documentType },
    { property: 'currentVersionId', name: 'current_version_id', value: entity => entity.currentVersionId },
    { property: 'createdByMemberId', name: 'created_by_member_id', value: entity => entity.createdByMemberId },
  ],
  read: row => {
    const entity = new Document();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.caseId = row.caseId === null ? null : sqlString(row.caseId);
    entity.externalPartyId = row.externalPartyId === null ? null : sqlString(row.externalPartyId);
    entity.folderId = row.folderId === null ? null : sqlString(row.folderId);
    entity.name = sqlString(row.name);
    entity.description = row.description === null ? null : sqlString(row.description);
    entity.documentType = row.documentType === null ? null : sqlString(row.documentType);
    entity.currentVersionId = row.currentVersionId === null ? null : sqlString(row.currentVersionId);
    entity.createdByMemberId = sqlString(row.createdByMemberId);
    return entity;
  },
};
