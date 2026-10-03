import type { Comment } from '../../domain/entities/comment.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { FieldRule } from '@casepilot/validation';

import { validateReference, validateTarget } from '../shared/crud-relations.js';
export const commentFields: readonly FieldRule[] = [
  { name: 'authorMemberId', kind: 'uuid', nullable: false },
  { name: 'targetType', kind: 'string', nullable: false },
  { name: 'targetId', kind: 'uuid', nullable: false },
  { name: 'body', kind: 'text', nullable: false },
];
export const commentSortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'authorMemberId', 'targetType', 'targetId'];
export async function validateCommentRelations(entity: Comment, references: ReferenceRepository): Promise<void> {
  await validateReference(references, 'members', entity.authorMemberId, entity.businessAccountId);
  await validateTarget(references, entity.targetType, entity.targetId, entity.businessAccountId);
}
