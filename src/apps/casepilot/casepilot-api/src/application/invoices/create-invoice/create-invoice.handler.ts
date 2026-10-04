import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { Invoice } from '../../../domain/entities/invoice.js';
import { CreateInvoiceResponse } from './create-invoice.response.js';
import { toInvoiceResponse } from '../shared/invoice.response.js';
import { type CreateInvoiceRequest } from './create-invoice.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { invoiceFields, validateInvoiceRelations } from '../shared/invoice.rules.js';
import { validateFields } from '../../shared/crud-validation.js';

export class CreateInvoiceHandler implements Handler<CreateInvoiceRequest, CreateInvoiceResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Invoice>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateInvoiceRequest): Promise<CreateInvoiceResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, invoiceFields, false);
      const entity = new Invoice();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.externalPartyId = request.data.externalPartyId;
      entity.caseId = request.data.caseId ?? null;
      entity.number = request.data.number;
      entity.status = request.data.status;
      entity.currency = request.data.currency;
      entity.issueDate = request.data.issueDate;
      entity.dueDate = request.data.dueDate ?? null;
      entity.subtotal = request.data.subtotal;
      entity.taxAmount = request.data.taxAmount;
      entity.total = request.data.total;
      entity.balanceDue = request.data.balanceDue;
      entity.notes = request.data.notes ?? null;
      await validateInvoiceRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateInvoiceResponse(toInvoiceResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
