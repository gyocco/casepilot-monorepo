import type { User } from '../../domain/entities/user.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { FieldRule } from '../shared/crud-validation.js';


export const userFields: readonly FieldRule[] = [
  { name: 'email', kind: 'string', nullable: false },
  { name: 'emailVerifiedAt', kind: 'timestamp', nullable: true },
  { name: 'firstName', kind: 'string', nullable: false },
  { name: 'lastName', kind: 'string', nullable: false },
  { name: 'displayName', kind: 'string', nullable: true },
  { name: 'avatarUrl', kind: 'string', nullable: true },
  { name: 'locale', kind: 'string', nullable: true },
  { name: 'timezone', kind: 'string', nullable: true },
  { name: 'status', kind: 'string', nullable: false },
  { name: 'lastLoginAt', kind: 'timestamp', nullable: true },
];
export const userSortFields = ['id', 'createdAt', 'updatedAt', 'version', 'email', 'emailVerifiedAt', 'firstName', 'lastName', 'displayName', 'avatarUrl', 'locale', 'timezone', 'status', 'lastLoginAt'];
export function validateUserRelations(entity: User, _references: ReferenceRepository): void {
  void entity;
}
