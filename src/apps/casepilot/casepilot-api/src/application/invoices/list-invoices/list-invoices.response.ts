import type { InvoiceResponse } from '../shared/invoice.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListInvoicesResponse extends Response {
  constructor(public readonly items: readonly InvoiceResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
