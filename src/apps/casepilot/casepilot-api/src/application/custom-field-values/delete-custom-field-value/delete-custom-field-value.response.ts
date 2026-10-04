import { Response } from '@casepilot/cqrs';

export class DeleteCustomFieldValueResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
