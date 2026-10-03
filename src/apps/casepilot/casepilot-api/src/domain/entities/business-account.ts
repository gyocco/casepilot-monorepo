import { StoredEntity, type JsonValue } from '@casepilot/abstractions';

export class BusinessAccount extends StoredEntity {
  name!: string;
  legalName!: string | null;
  slug!: string | null;
  type!: string | null;
  taxId!: string | null;
  email!: string | null;
  phone!: string | null;
  website!: string | null;
  timezone!: string;
  locale!: string;
  currency!: string;
  countryCode!: string;
  status!: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  settings!: JsonValue | null;
}
