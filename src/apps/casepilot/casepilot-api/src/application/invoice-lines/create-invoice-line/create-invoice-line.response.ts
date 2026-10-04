import type { InvoiceLineResponse } from '../shared/invoice-line.response.js';
import { Response } from '@casepilot/cqrs';

export class CreateInvoiceLineResponse extends Response {
  constructor(public readonly item: InvoiceLineResponse) { super(); }
}
