import type { InvoiceLineResponse } from '../shared/invoice-line.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListInvoiceLinesResponse extends Response {
  constructor(public readonly items: readonly InvoiceLineResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
