import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { CaseMember } from '../../domain/entities/case-member.js';
import { GetCaseMemberResponse, toCaseMemberResponse, type GetCaseMemberRequest } from './case-member.models.js';
import type { CrudScope } from '../shared/crud-models.js';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { validateId } from '@casepilot/validation';

export class GetCaseMemberHandler implements Handler<GetCaseMemberRequest, GetCaseMemberResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<CaseMember>>) {}

  async execute(request: GetCaseMemberRequest): Promise<GetCaseMemberResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetCaseMemberResponse(toCaseMemberResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
