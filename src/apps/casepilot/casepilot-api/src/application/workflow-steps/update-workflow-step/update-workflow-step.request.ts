import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export interface UpdateWorkflowStepData {
  readonly workflowId?: string;
  readonly statusDefinitionId?: string | null;
  readonly name?: string;
  readonly description?: string | null;
  readonly sortOrder?: number;
  readonly isInitial?: boolean;
  readonly isTerminal?: boolean;
}
export class UpdateWorkflowStepRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateWorkflowStepData, public readonly actor: VerifiedIdentity) { super(); }
}
