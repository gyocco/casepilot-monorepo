import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { TimeEntry } from '../../domain/entities/time-entry.js';
import { GetTimeEntryResponse, toTimeEntryResponse, type GetTimeEntryRequest } from './time-entry.models.js';
import type { CrudScope } from '../shared/crud-models.js';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validateId } from '@casepilot/validation';

export class GetTimeEntryHandler implements Handler<GetTimeEntryRequest, GetTimeEntryResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<TimeEntry>>) {}

  async execute(request: GetTimeEntryRequest): Promise<GetTimeEntryResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetTimeEntryResponse(toTimeEntryResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
