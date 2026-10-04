import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { CaseMember } from '../../../domain/entities/case-member.js';
import { GetCaseMemberResponse } from './get-case-member.response.js';
import { toCaseMemberResponse } from '../shared/case-member.response.js';
import { type GetCaseMemberRequest } from './get-case-member.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
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
