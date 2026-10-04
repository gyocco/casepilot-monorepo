import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError } from '@casepilot/abstractions';
import type { Member } from '../../../domain/entities/member.js';
import { GetMemberResponse } from './get-member.response.js';
import { toMemberResponse } from '../shared/member.response.js';
import { type GetMemberRequest } from './get-member.request.js';
import type { CrudScope } from '../../shared/crud-models.js';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { validateId } from '@casepilot/validation';

export class GetMemberHandler implements Handler<GetMemberRequest, GetMemberResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Member>>) {}

  async execute(request: GetMemberRequest): Promise<GetMemberResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      const entity = await scope.resource.getById(request.id, request.businessAccountId);
      if (!entity) throw new NotFoundError();
      return new GetMemberResponse(toMemberResponse(entity));
    }, 'REPEATABLE READ'));
  }
}
