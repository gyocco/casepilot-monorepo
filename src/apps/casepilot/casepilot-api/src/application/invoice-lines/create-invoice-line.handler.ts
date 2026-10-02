import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { InvoiceLine } from '../../domain/entities/invoice-line.js';
import { CreateInvoiceLineResponse, toInvoiceLineResponse, type CreateInvoiceLineRequest } from './invoice-line.models.js';
import { type CrudScope, type CrudRuntime } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { invoice_lineFields, validateInvoiceLineRelations } from './invoice-line.rules.js';
import { validateFields } from '../shared/crud-validation.js';

export class CreateInvoiceLineHandler implements Handler<CreateInvoiceLineRequest, CreateInvoiceLineResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<InvoiceLine>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateInvoiceLineRequest): Promise<CreateInvoiceLineResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, invoice_lineFields, false);
      const entity = new InvoiceLine();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.invoiceId = request.data.invoiceId;
      entity.caseId = request.data.caseId ?? null;
      entity.description = request.data.description;
      entity.quantity = request.data.quantity;
      entity.unitPrice = request.data.unitPrice;
      entity.taxRate = request.data.taxRate ?? null;
      entity.subtotal = request.data.subtotal;
      entity.total = request.data.total;
      entity.sortOrder = request.data.sortOrder;
      await validateInvoiceLineRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateInvoiceLineResponse(toInvoiceLineResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
