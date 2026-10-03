import { EntitySchema } from 'typeorm';
import { Comment } from '../../../domain/entities/comment.js';
import type { SqlTable } from '@casepilot/abstractions/typeorm';
import { sqlString, sqlTimestamp, sqlInteger } from '@casepilot/abstractions/typeorm';
export const commentSchema = new EntitySchema<Comment>({
  name: 'Comment', target: Comment, tableName: 'comments',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    authorMemberId: { name: 'author_member_id', type: 'uuid', nullable: false },
    targetType: { name: 'target_type', type: 'varchar', nullable: false, length: 255 },
    targetId: { name: 'target_id', type: 'uuid', nullable: false },
    body: { name: 'body', type: 'text', nullable: false },
  },
  uniques: [
    { name: 'uq_comments_0', columns: ["businessAccountId","id"] },
  ],
  indices: [
    { name: 'idx_comments_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_comments_1', columns: ["businessAccountId","authorMemberId"] },
  ],
  foreignKeys: [
    { name: 'fk_comments_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_comments_author_member_id', target: 'Member', columnNames: ["businessAccountId","authorMemberId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const commentTable: SqlTable<Comment> = {
  schema: commentSchema, tableName: 'comments', scopeColumn: 'business_account_id',
  idColumn: 'id', versionColumn: 'version', immutableColumns: ['id', 'created_at', 'business_account_id'],
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'authorMemberId', name: 'author_member_id', value: entity => entity.authorMemberId },
    { property: 'targetType', name: 'target_type', value: entity => entity.targetType },
    { property: 'targetId', name: 'target_id', value: entity => entity.targetId },
    { property: 'body', name: 'body', value: entity => entity.body },
  ],
  read: row => {
    const entity = new Comment();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.authorMemberId = sqlString(row.authorMemberId);
    entity.targetType = sqlString(row.targetType);
    entity.targetId = sqlString(row.targetId);
    entity.body = sqlString(row.body);
    return entity;
  },
};
