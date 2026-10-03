import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { InvoiceLine } from '../entities/invoice-line.js';
export interface InvoiceLineRepository extends DataRepository<InvoiceLine> {
  readonly entityType?: InvoiceLine;
}
