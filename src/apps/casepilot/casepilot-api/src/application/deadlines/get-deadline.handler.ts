import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Deadline } from '../../domain/entities/deadline.js';
import { GetDeadlineResponse, toDeadlineResponse, type GetDeadlineRequest } from './deadline.models.js';
import type { CrudScope } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validateId } from '../shared/crud-validation.js';

export class GetDeadlineHandler implements Handler<GetDeadlineRequest, GetDeadlineResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Deadline>>) {}

  async execute(request: GetDeadlineRequest): Promise<GetDeadlineResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetDeadlineResponse(toDeadlineResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
