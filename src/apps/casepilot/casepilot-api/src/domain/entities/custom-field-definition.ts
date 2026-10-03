import { TenantEntity } from './tenant-entity.js';
import type { JsonValue } from '@casepilot/abstractions';

export class CustomFieldDefinition extends TenantEntity {
  entityType!: string;
  caseTypeId!: string | null;
  name!: string;
  key!: string;
  dataType!: string;
  required!: boolean;
  configuration!: JsonValue | null;
  sortOrder!: number;
  isActive!: boolean;
}
