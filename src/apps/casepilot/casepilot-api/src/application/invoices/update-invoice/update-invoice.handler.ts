import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { Invoice } from '../../../domain/entities/invoice.js';
import { UpdateInvoiceResponse } from './update-invoice.response.js';
import { toInvoiceResponse } from '../shared/invoice.response.js';
import { type UpdateInvoiceRequest } from './update-invoice.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { invoiceFields, validateInvoiceRelations } from '../shared/invoice.rules.js';
import { validateId } from '@casepilot/validation';
import { validateFields } from '../../shared/crud-validation.js';
import { validateVersion } from '../../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class UpdateInvoiceHandler implements Handler<UpdateInvoiceRequest, UpdateInvoiceResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Invoice>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateInvoiceRequest): Promise<UpdateInvoiceResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, invoiceFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new Invoice();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.externalPartyId = request.data.externalPartyId !== undefined ? request.data.externalPartyId : existing.externalPartyId;
      entity.caseId = request.data.caseId !== undefined ? request.data.caseId : existing.caseId;
      entity.number = request.data.number !== undefined ? request.data.number : existing.number;
      entity.status = request.data.status !== undefined ? request.data.status : existing.status;
      entity.currency = request.data.currency !== undefined ? request.data.currency : existing.currency;
      entity.issueDate = request.data.issueDate !== undefined ? request.data.issueDate : existing.issueDate;
      entity.dueDate = request.data.dueDate !== undefined ? request.data.dueDate : existing.dueDate;
      entity.subtotal = request.data.subtotal !== undefined ? request.data.subtotal : existing.subtotal;
      entity.taxAmount = request.data.taxAmount !== undefined ? request.data.taxAmount : existing.taxAmount;
      entity.total = request.data.total !== undefined ? request.data.total : existing.total;
      entity.balanceDue = request.data.balanceDue !== undefined ? request.data.balanceDue : existing.balanceDue;
      entity.notes = request.data.notes !== undefined ? request.data.notes : existing.notes;
      await validateInvoiceRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateInvoiceResponse(toInvoiceResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
