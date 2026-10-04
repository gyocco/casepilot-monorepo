import { Response } from '@casepilot/cqrs';

export class DeleteInvoiceLineResponse extends Response {
  constructor(public readonly id: string, public readonly deleted: boolean) { super(); }
}
