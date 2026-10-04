import { Request } from '@casepilot/cqrs';

export class DeleteTaskRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string, public readonly version: number) { super(); }
}
