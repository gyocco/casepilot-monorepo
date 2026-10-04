import { Response } from '@casepilot/cqrs';

export class DeleteExpenseResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
