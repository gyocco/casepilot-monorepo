import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export interface CreateWorkflowData {
  readonly name: string;
  readonly description?: string | null;
  readonly isActive: boolean;
}
export class CreateWorkflowRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateWorkflowData, public readonly actor: VerifiedIdentity) { super(); }
}
