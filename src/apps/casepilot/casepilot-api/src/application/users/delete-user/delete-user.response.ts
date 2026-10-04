import { Response } from '@casepilot/cqrs';

export class DeleteUserResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
