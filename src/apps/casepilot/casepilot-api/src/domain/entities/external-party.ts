import { TenantEntity } from './tenant-entity.js';

export class ExternalParty extends TenantEntity {
  type!: 'PERSON' | 'ORGANIZATION';
  displayName!: string;
  firstName!: string | null;
  lastName!: string | null;
  legalName!: string | null;
  taxId!: string | null;
  email!: string | null;
  phone!: string | null;
  website!: string | null;
  addressLine_1!: string | null;
  addressLine_2!: string | null;
  city!: string | null;
  region!: string | null;
  postalCode!: string | null;
  countryCode!: string | null;
  notes!: string | null;
  status!: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | null;
}
