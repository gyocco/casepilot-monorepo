import { TenantEntity } from './tenant-entity.js';

export class Workflow extends TenantEntity {
  name!: string;
  description!: string | null;
  isActive!: boolean;
}
