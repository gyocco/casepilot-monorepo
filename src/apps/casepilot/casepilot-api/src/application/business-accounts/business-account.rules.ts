import type { BusinessAccount } from '../../domain/entities/business-account.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { FieldRule } from '../shared/crud-validation.js';


export const business_accountFields: readonly FieldRule[] = [
  { name: 'name', kind: 'string', nullable: false },
  { name: 'legalName', kind: 'string', nullable: true },
  { name: 'slug', kind: 'string', nullable: true },
  { name: 'type', kind: 'string', nullable: true },
  { name: 'taxId', kind: 'string', nullable: true },
  { name: 'email', kind: 'string', nullable: true },
  { name: 'phone', kind: 'string', nullable: true },
  { name: 'website', kind: 'string', nullable: true },
  { name: 'timezone', kind: 'string', nullable: false },
  { name: 'locale', kind: 'string', nullable: false },
  { name: 'currency', kind: 'string', nullable: false },
  { name: 'countryCode', kind: 'string', nullable: false },
  { name: 'status', kind: 'string', nullable: false, choices: ['ACTIVE', 'SUSPENDED', 'CLOSED'] },
  { name: 'settings', kind: 'json', nullable: true },
];
export const business_accountSortFields = ['id', 'createdAt', 'updatedAt', 'version', 'name', 'legalName', 'slug', 'type', 'taxId', 'email', 'phone', 'website', 'timezone', 'locale', 'currency', 'countryCode', 'status'];
export function validateBusinessAccountRelations(entity: BusinessAccount, _references: ReferenceRepository): void {
  void entity;
}
