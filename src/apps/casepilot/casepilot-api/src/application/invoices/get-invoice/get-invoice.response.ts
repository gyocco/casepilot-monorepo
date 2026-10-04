import type { InvoiceResponse } from '../shared/invoice.response.js';
import { Response } from '@casepilot/cqrs';

export class GetInvoiceResponse extends Response {
  constructor(public readonly item: InvoiceResponse) { super(); }
}
