import type { ExternalParty } from '../../domain/entities/external-party.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { FieldRule } from '../shared/crud-validation.js';


export const external_partyFields: readonly FieldRule[] = [
  { name: 'type', kind: 'string', nullable: false, choices: ['PERSON', 'ORGANIZATION'] },
  { name: 'displayName', kind: 'string', nullable: false },
  { name: 'firstName', kind: 'string', nullable: true },
  { name: 'lastName', kind: 'string', nullable: true },
  { name: 'legalName', kind: 'string', nullable: true },
  { name: 'taxId', kind: 'string', nullable: true },
  { name: 'email', kind: 'string', nullable: true },
  { name: 'phone', kind: 'string', nullable: true },
  { name: 'website', kind: 'string', nullable: true },
  { name: 'addressLine_1', kind: 'string', nullable: true },
  { name: 'addressLine_2', kind: 'string', nullable: true },
  { name: 'city', kind: 'string', nullable: true },
  { name: 'region', kind: 'string', nullable: true },
  { name: 'postalCode', kind: 'string', nullable: true },
  { name: 'countryCode', kind: 'string', nullable: true },
  { name: 'notes', kind: 'text', nullable: true },
  { name: 'status', kind: 'string', nullable: true, choices: ['ACTIVE', 'INACTIVE', 'ARCHIVED'] },
];
export const external_partySortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'type', 'displayName', 'firstName', 'lastName', 'legalName', 'taxId', 'email', 'phone', 'website', 'addressLine_1', 'addressLine_2', 'city', 'region', 'postalCode', 'countryCode', 'status'];
export function validateExternalPartyRelations(entity: ExternalParty, _references: ReferenceRepository): void {
  void entity;
}
