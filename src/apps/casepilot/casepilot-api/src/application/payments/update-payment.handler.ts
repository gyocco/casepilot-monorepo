import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { Payment } from '../../domain/entities/payment.js';
import { UpdatePaymentResponse, toPaymentResponse, type UpdatePaymentRequest } from './payment.models.js';
import { type CrudScope } from '../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { paymentFields, validatePaymentRelations } from './payment.rules.js';
import { validateId } from '@casepilot/validation';
import { validateFields } from '../shared/crud-validation.js';
import { validateVersion } from '../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class UpdatePaymentHandler implements Handler<UpdatePaymentRequest, UpdatePaymentResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Payment>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdatePaymentRequest): Promise<UpdatePaymentResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, paymentFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new Payment();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.invoiceId = request.data.invoiceId !== undefined ? request.data.invoiceId : existing.invoiceId;
      entity.amount = request.data.amount !== undefined ? request.data.amount : existing.amount;
      entity.currency = request.data.currency !== undefined ? request.data.currency : existing.currency;
      entity.paymentMethod = request.data.paymentMethod !== undefined ? request.data.paymentMethod : existing.paymentMethod;
      entity.reference = request.data.reference !== undefined ? request.data.reference : existing.reference;
      entity.paidAt = request.data.paidAt !== undefined ? request.data.paidAt : existing.paidAt;
      entity.notes = request.data.notes !== undefined ? request.data.notes : existing.notes;
      await validatePaymentRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdatePaymentResponse(toPaymentResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
