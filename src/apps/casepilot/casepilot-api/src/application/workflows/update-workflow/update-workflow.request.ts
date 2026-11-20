import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export interface UpdateWorkflowData {
  readonly name?: string;
  readonly description?: string | null;
  readonly isActive?: boolean;
}
export class UpdateWorkflowRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateWorkflowData, public readonly actor: VerifiedIdentity) { super(); }
}
