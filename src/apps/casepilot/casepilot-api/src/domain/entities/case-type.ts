import { TenantEntity } from './stored-entity.js';

export class CaseType extends TenantEntity {
  name!: string;
  description!: string | null;
  code!: string | null;
  isActive!: boolean;
  defaultWorkflowId!: string | null;
}
