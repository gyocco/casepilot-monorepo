import type { EntityManager } from 'typeorm';
import type { Invoice } from '../../../domain/entities/invoice.js';
import type { InvoiceRepository } from '../../../domain/repositories/invoice.repository.js';
import { invoiceTable } from '../schemas/invoice.schema.js';
import { TypeOrmDataRepository } from './typeorm-data.repository.js';
export class TypeOrmInvoiceRepository extends TypeOrmDataRepository<Invoice> implements InvoiceRepository {
  constructor(manager: EntityManager) { super(manager, invoiceTable); }
}
