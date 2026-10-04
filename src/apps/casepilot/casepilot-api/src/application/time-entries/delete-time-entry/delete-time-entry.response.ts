import { Response } from '@casepilot/cqrs';

export class DeleteTimeEntryResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
