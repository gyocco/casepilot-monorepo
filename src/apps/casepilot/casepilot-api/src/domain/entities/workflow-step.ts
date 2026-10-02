import { TenantEntity } from './stored-entity.js';

export class WorkflowStep extends TenantEntity {
  workflowId!: string;
  statusDefinitionId!: string | null;
  name!: string;
  description!: string | null;
  sortOrder!: number;
  isInitial!: boolean;
  isTerminal!: boolean;
}
