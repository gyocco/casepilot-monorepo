import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { InvoiceLine } from '../../domain/entities/invoice-line.js';
import { GetInvoiceLineResponse, toInvoiceLineResponse, type GetInvoiceLineRequest } from './invoice-line.models.js';
import type { CrudScope } from '../shared/crud-models.js';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validateId } from '@casepilot/validation';

export class GetInvoiceLineHandler implements Handler<GetInvoiceLineRequest, GetInvoiceLineResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<InvoiceLine>>) {}

  async execute(request: GetInvoiceLineRequest): Promise<GetInvoiceLineResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetInvoiceLineResponse(toInvoiceLineResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
