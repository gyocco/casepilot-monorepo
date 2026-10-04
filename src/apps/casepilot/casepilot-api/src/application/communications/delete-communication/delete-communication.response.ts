import { Response } from '@casepilot/cqrs';

export class DeleteCommunicationResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
