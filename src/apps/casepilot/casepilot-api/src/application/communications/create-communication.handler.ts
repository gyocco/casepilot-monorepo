import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { Communication } from '../../domain/entities/communication.js';
import { CreateCommunicationResponse, toCommunicationResponse, type CreateCommunicationRequest } from './communication.models.js';
import { type CrudScope, type CrudRuntime } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { communicationFields, validateCommunicationRelations } from './communication.rules.js';
import { validateFields } from '../shared/crud-validation.js';

export class CreateCommunicationHandler implements Handler<CreateCommunicationRequest, CreateCommunicationResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Communication>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateCommunicationRequest): Promise<CreateCommunicationResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, communicationFields, false);
      const entity = new Communication();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.caseId = request.data.caseId ?? null;
      entity.externalPartyId = request.data.externalPartyId ?? null;
      entity.memberId = request.data.memberId ?? null;
      entity.type = request.data.type;
      entity.direction = request.data.direction ?? null;
      entity.subject = request.data.subject ?? null;
      entity.body = request.data.body ?? null;
      entity.occurredAt = request.data.occurredAt;
      entity.externalReference = request.data.externalReference ?? null;
      await validateCommunicationRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateCommunicationResponse(toCommunicationResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
