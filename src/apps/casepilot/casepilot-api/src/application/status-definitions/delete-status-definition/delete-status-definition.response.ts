import { Response } from '@casepilot/cqrs';

export class DeleteStatusDefinitionResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
