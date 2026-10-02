import { TenantEntity } from './stored-entity.js';

export class Comment extends TenantEntity {
  authorMemberId!: string;
  targetType!: string;
  targetId!: string;
  body!: string;
}
