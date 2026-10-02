import type { DataRepository } from './data.repository.js';
import type { InvoiceLine } from '../entities/invoice-line.js';
export interface InvoiceLineRepository extends DataRepository<InvoiceLine> {
  readonly entityType?: InvoiceLine;
}
