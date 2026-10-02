import { TenantEntity } from './stored-entity.js';

export class Member extends TenantEntity {
  userId!: string;
  role!: string;
  status!: 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'REMOVED';
  title!: string | null;
  professionalRegistration!: string | null;
  hourlyRate!: string | null;
  joinedAt!: string | null;
  invitedAt!: string | null;
}
