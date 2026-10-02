import type { DataRepository } from './data.repository.js';
import type { Invoice } from '../entities/invoice.js';
export interface InvoiceRepository extends DataRepository<Invoice> {
  readonly entityType?: Invoice;
}
