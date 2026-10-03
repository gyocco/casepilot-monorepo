import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { Payment } from '../../domain/entities/payment.js';
import { CreatePaymentResponse, toPaymentResponse, type CreatePaymentRequest } from './payment.models.js';
import { type CrudScope } from '../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { paymentFields, validatePaymentRelations } from './payment.rules.js';
import { validateFields } from '../shared/crud-validation.js';

export class CreatePaymentHandler implements Handler<CreatePaymentRequest, CreatePaymentResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Payment>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, paymentFields, false);
      const entity = new Payment();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.invoiceId = request.data.invoiceId;
      entity.amount = request.data.amount;
      entity.currency = request.data.currency;
      entity.paymentMethod = request.data.paymentMethod ?? null;
      entity.reference = request.data.reference ?? null;
      entity.paidAt = request.data.paidAt;
      entity.notes = request.data.notes ?? null;
      await validatePaymentRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreatePaymentResponse(toPaymentResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
