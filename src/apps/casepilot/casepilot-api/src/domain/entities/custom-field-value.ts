import { TenantEntity } from './tenant-entity.js';
import type { JsonValue } from '@casepilot/abstractions';

export class CustomFieldValue extends TenantEntity {
  customFieldDefinitionId!: string;
  entityType!: string;
  entityId!: string;
  valueText!: string | null;
  valueNumber!: string | null;
  valueDate!: string | null;
  valueBoolean!: boolean | null;
  valueJson!: JsonValue | null;
}
