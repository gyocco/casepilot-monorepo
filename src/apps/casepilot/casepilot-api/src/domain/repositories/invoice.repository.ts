import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { Invoice } from '../entities/invoice.js';
export interface InvoiceRepository extends DataRepository<Invoice> {
  readonly entityType?: Invoice;
}
