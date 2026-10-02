import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Payment } from '../../domain/entities/payment.js';
import { GetPaymentResponse, toPaymentResponse, type GetPaymentRequest } from './payment.models.js';
import type { CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validateId } from '../shared/crud-validation.js';

export class GetPaymentHandler implements Handler<GetPaymentRequest, GetPaymentResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Payment>>) {}

  async execute(request: GetPaymentRequest): Promise<GetPaymentResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetPaymentResponse(toPaymentResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
