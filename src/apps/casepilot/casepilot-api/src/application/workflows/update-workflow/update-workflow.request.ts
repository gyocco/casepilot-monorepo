import { Request } from '@casepilot/cqrs';

export interface UpdateWorkflowData {
  readonly name?: string;
  readonly description?: string | null;
  readonly isActive?: boolean;
}
export class UpdateWorkflowRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number, public readonly data: UpdateWorkflowData) { super(); }
}
