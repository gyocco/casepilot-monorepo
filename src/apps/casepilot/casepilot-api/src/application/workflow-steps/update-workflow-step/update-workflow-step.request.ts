import { Request } from '@casepilot/cqrs';

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
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateWorkflowStepData) { super(); }
}
