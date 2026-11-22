import type { EntityManager } from 'typeorm';
import type { InvoiceLine } from '../../../domain/entities/invoice-line.js';
import type { InvoiceLineRepository } from '../../../domain/repositories/invoice-line.repository.js';
import { invoice_lineTable } from '../schemas/invoice-line.schema.js';
import { TypeOrmDataRepository } from '@casepilot/persistence/typeorm';
export class TypeOrmInvoiceLineRepository extends TypeOrmDataRepository<InvoiceLine> implements InvoiceLineRepository {
  constructor(manager: EntityManager) { super(manager, invoice_lineTable); }
}
