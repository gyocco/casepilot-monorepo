import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { InvoiceLine } from '../../domain/entities/invoice-line.js';
import { UpdateInvoiceLineResponse, toInvoiceLineResponse, type UpdateInvoiceLineRequest } from './invoice-line.models.js';
import { type CrudScope, type CrudRuntime } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { invoice_lineFields, validateInvoiceLineRelations } from './invoice-line.rules.js';
import { validateId, validateFields } from '../shared/crud-validation.js';
import { validateVersion } from '../shared/crud-pagination.js';
import { ConflictError } from '../shared/conflict-error.js';

export class UpdateInvoiceLineHandler implements Handler<UpdateInvoiceLineRequest, UpdateInvoiceLineResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<InvoiceLine>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateInvoiceLineRequest): Promise<UpdateInvoiceLineResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, invoice_lineFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new InvoiceLine();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.invoiceId = request.data.invoiceId !== undefined ? request.data.invoiceId : existing.invoiceId;
      entity.caseId = request.data.caseId !== undefined ? request.data.caseId : existing.caseId;
      entity.description = request.data.description !== undefined ? request.data.description : existing.description;
      entity.quantity = request.data.quantity !== undefined ? request.data.quantity : existing.quantity;
      entity.unitPrice = request.data.unitPrice !== undefined ? request.data.unitPrice : existing.unitPrice;
      entity.taxRate = request.data.taxRate !== undefined ? request.data.taxRate : existing.taxRate;
      entity.subtotal = request.data.subtotal !== undefined ? request.data.subtotal : existing.subtotal;
      entity.total = request.data.total !== undefined ? request.data.total : existing.total;
      entity.sortOrder = request.data.sortOrder !== undefined ? request.data.sortOrder : existing.sortOrder;
      await validateInvoiceLineRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateInvoiceLineResponse(toInvoiceLineResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
