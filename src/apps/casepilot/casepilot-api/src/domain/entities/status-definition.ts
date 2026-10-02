import { TenantEntity } from './stored-entity.js';

export class StatusDefinition extends TenantEntity {
  entityType!: string;
  caseTypeId!: string | null;
  name!: string;
  code!: string;
  category!: string | null;
  sortOrder!: number;
  isInitial!: boolean;
  isTerminal!: boolean;
  isActive!: boolean;
}
