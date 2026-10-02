import { TenantEntity, type JsonValue } from './stored-entity.js';

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
