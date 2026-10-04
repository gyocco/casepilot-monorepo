import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Payment } from '../../../domain/entities/payment.js';
import { GetPaymentResponse } from './get-payment.response.js';
import { toPaymentResponse } from '../shared/payment.response.js';
import { type GetPaymentRequest } from './get-payment.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { validateId } from '@casepilot/validation';

export class GetPaymentHandler implements Handler<GetPaymentRequest, GetPaymentResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Payment>>) {}

  async execute(request: GetPaymentRequest): Promise<GetPaymentResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetPaymentResponse(toPaymentResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
