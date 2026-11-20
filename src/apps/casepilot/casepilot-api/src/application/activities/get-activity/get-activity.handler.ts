import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Activity } from '../../../domain/entities/activity.js';
import { GetActivityResponse } from './get-activity.response.js';
import { toActivityResponse } from '../shared/activity.response.js';
import { type GetActivityRequest } from './get-activity.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { authorizeTenantAction } from '../../shared/authorization.js';
import { validateId } from '@casepilot/validation';

export class GetActivityHandler implements Handler<GetActivityRequest, GetActivityResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Activity>>) {}

  async execute(request: GetActivityRequest): Promise<GetActivityResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await authorizeTenantAction(scope, request.actor, request.businessAccountId, 'read');
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetActivityResponse(toActivityResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
