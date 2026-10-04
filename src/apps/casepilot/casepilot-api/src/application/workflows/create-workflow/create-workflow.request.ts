import { Request } from '@casepilot/cqrs';

export interface CreateWorkflowData {
  readonly name: string;
  readonly description?: string | null;
  readonly isActive: boolean;
}
export class CreateWorkflowRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly data: CreateWorkflowData) { super(); }
}
