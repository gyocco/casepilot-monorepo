import { EntitySchema } from 'typeorm';
import { Note } from '../../../domain/entities/note.js';
import type { SqlTable } from '@casepilot/abstractions/typeorm';
import { sqlString, sqlTimestamp, sqlInteger, sqlBoolean } from '@casepilot/abstractions/typeorm';
export const noteSchema = new EntitySchema<Note>({
  name: 'Note', target: Note, tableName: 'notes',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    caseId: { name: 'case_id', type: 'uuid', nullable: true },
    externalPartyId: { name: 'external_party_id', type: 'uuid', nullable: true },
    authorMemberId: { name: 'author_member_id', type: 'uuid', nullable: false },
    title: { name: 'title', type: 'varchar', nullable: true, length: 255 },
    body: { name: 'body', type: 'text', nullable: false },
    isPrivate: { name: 'is_private', type: 'boolean', nullable: false },
  },
  uniques: [
    { name: 'uq_notes_0', columns: ["businessAccountId","id"] },
  ],
  indices: [
    { name: 'idx_notes_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_notes_1', columns: ["businessAccountId","caseId"] },
    { name: 'idx_notes_2', columns: ["businessAccountId","externalPartyId"] },
    { name: 'idx_notes_3', columns: ["businessAccountId","authorMemberId"] },
  ],
  foreignKeys: [
    { name: 'fk_notes_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_notes_case_id', target: 'Case', columnNames: ["businessAccountId","caseId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_notes_external_party_id', target: 'ExternalParty', columnNames: ["businessAccountId","externalPartyId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_notes_author_member_id', target: 'Member', columnNames: ["businessAccountId","authorMemberId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const noteTable: SqlTable<Note> = {
  schema: noteSchema, tableName: 'notes', scopeColumn: 'business_account_id',
  idColumn: 'id', versionColumn: 'version', immutableColumns: ['id', 'created_at', 'business_account_id'],
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'caseId', name: 'case_id', value: entity => entity.caseId },
    { property: 'externalPartyId', name: 'external_party_id', value: entity => entity.externalPartyId },
    { property: 'authorMemberId', name: 'author_member_id', value: entity => entity.authorMemberId },
    { property: 'title', name: 'title', value: entity => entity.title },
    { property: 'body', name: 'body', value: entity => entity.body },
    { property: 'isPrivate', name: 'is_private', value: entity => entity.isPrivate },
  ],
  read: row => {
    const entity = new Note();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.caseId = row.caseId === null ? null : sqlString(row.caseId);
    entity.externalPartyId = row.externalPartyId === null ? null : sqlString(row.externalPartyId);
    entity.authorMemberId = sqlString(row.authorMemberId);
    entity.title = row.title === null ? null : sqlString(row.title);
    entity.body = sqlString(row.body);
    entity.isPrivate = sqlBoolean(row.isPrivate);
    return entity;
  },
};
