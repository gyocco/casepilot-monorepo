import { Request } from '@casepilot/cqrs';
import type { VerifiedIdentity } from '@casepilot/auth';

export interface CreateWorkflowStepData {
  readonly workflowId: string;
  readonly statusDefinitionId?: string | null;
  readonly name: string;
  readonly description?: string | null;
  readonly sortOrder: number;
  readonly isInitial: boolean;
  readonly isTerminal: boolean;
}
export class CreateWorkflowStepRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateWorkflowStepData, public readonly actor: VerifiedIdentity) { super(); }
}
