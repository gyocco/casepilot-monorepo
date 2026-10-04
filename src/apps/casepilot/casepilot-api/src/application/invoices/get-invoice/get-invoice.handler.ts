import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Invoice } from '../../../domain/entities/invoice.js';
import { GetInvoiceResponse } from './get-invoice.response.js';
import { toInvoiceResponse } from '../shared/invoice.response.js';
import { type GetInvoiceRequest } from './get-invoice.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { validateId } from '@casepilot/validation';

export class GetInvoiceHandler implements Handler<GetInvoiceRequest, GetInvoiceResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Invoice>>) {}

  async execute(request: GetInvoiceRequest): Promise<GetInvoiceResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetInvoiceResponse(toInvoiceResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
