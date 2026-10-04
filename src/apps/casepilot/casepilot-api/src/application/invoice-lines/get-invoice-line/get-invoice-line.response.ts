import type { InvoiceLineResponse } from '../shared/invoice-line.response.js';
import { Response } from '@casepilot/cqrs';

export class GetInvoiceLineResponse extends Response {
  constructor(public readonly item: InvoiceLineResponse) { super(); }
}
