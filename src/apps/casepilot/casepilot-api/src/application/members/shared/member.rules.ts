import type { Member } from '../../../domain/entities/member.js';
import type { ReferenceRepository } from '../../../domain/repositories/reference.repository.js';
import type { FieldRule } from '@casepilot/validation';
import { validateReference } from '../../shared/crud-relations.js';

export const memberFields: readonly FieldRule[] = [
  { name: 'userId', kind: 'uuid', nullable: false },
  { name: 'role', kind: 'string', nullable: false },
  { name: 'status', kind: 'string', nullable: false, choices: ['INVITED', 'ACTIVE', 'SUSPENDED', 'REMOVED'] },
  { name: 'title', kind: 'string', nullable: true },
  { name: 'professionalRegistration', kind: 'string', nullable: true },
  { name: 'hourlyRate', kind: 'decimal', nullable: true, nonnegative: true },
  { name: 'joinedAt', kind: 'timestamp', nullable: true },
  { name: 'invitedAt', kind: 'timestamp', nullable: true },
];

export const memberSortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'userId', 'role', 'status', 'title', 'professionalRegistration', 'hourlyRate', 'joinedAt', 'invitedAt'];

export async function validateMemberRelations(entity: Member, references: ReferenceRepository): Promise<void> {
  await validateReference(references, 'users', entity.userId, null);
}
