import { Request } from '@casepilot/cqrs';

export class GetWorkflowRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
