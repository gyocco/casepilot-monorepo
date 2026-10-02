import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { Communication } from '../../domain/entities/communication.js';
import { UpdateCommunicationResponse, toCommunicationResponse, type UpdateCommunicationRequest } from './communication.models.js';
import { type CrudScope, type CrudRuntime } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { communicationFields, validateCommunicationRelations } from './communication.rules.js';
import { validateId, validateFields } from '../shared/crud-validation.js';
import { validateVersion } from '../shared/crud-pagination.js';
import { ConflictError } from '../shared/conflict-error.js';

export class UpdateCommunicationHandler implements Handler<UpdateCommunicationRequest, UpdateCommunicationResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Communication>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateCommunicationRequest): Promise<UpdateCommunicationResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, communicationFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new Communication();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.caseId = request.data.caseId !== undefined ? request.data.caseId : existing.caseId;
      entity.externalPartyId = request.data.externalPartyId !== undefined ? request.data.externalPartyId : existing.externalPartyId;
      entity.memberId = request.data.memberId !== undefined ? request.data.memberId : existing.memberId;
      entity.type = request.data.type !== undefined ? request.data.type : existing.type;
      entity.direction = request.data.direction !== undefined ? request.data.direction : existing.direction;
      entity.subject = request.data.subject !== undefined ? request.data.subject : existing.subject;
      entity.body = request.data.body !== undefined ? request.data.body : existing.body;
      entity.occurredAt = request.data.occurredAt !== undefined ? request.data.occurredAt : existing.occurredAt;
      entity.externalReference = request.data.externalReference !== undefined ? request.data.externalReference : existing.externalReference;
      await validateCommunicationRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateCommunicationResponse(toCommunicationResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
