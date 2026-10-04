import { Response } from '@casepilot/cqrs';

export class DeleteFolderResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
