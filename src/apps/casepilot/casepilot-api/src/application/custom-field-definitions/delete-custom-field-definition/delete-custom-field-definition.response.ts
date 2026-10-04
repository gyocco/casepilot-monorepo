import { Response } from '@casepilot/cqrs';

export class DeleteCustomFieldDefinitionResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
