import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { ExternalParty } from '../../../domain/entities/external-party.js';
import { UpdateExternalPartyResponse } from './update-external-party.response.js';
import { toExternalPartyResponse } from '../shared/external-party.response.js';
import { type UpdateExternalPartyRequest } from './update-external-party.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { external_partyFields, validateExternalPartyRelations } from '../shared/external-party.rules.js';
import { validateId } from '@casepilot/validation';
import { validateFields } from '../../shared/crud-validation.js';
import { validateVersion } from '../../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class UpdateExternalPartyHandler implements Handler<UpdateExternalPartyRequest, UpdateExternalPartyResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<ExternalParty>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateExternalPartyRequest): Promise<UpdateExternalPartyResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, external_partyFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new ExternalParty();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.type = request.data.type !== undefined ? request.data.type : existing.type;
      entity.displayName = request.data.displayName !== undefined ? request.data.displayName : existing.displayName;
      entity.firstName = request.data.firstName !== undefined ? request.data.firstName : existing.firstName;
      entity.lastName = request.data.lastName !== undefined ? request.data.lastName : existing.lastName;
      entity.legalName = request.data.legalName !== undefined ? request.data.legalName : existing.legalName;
      entity.taxId = request.data.taxId !== undefined ? request.data.taxId : existing.taxId;
      entity.email = request.data.email !== undefined ? request.data.email : existing.email;
      entity.phone = request.data.phone !== undefined ? request.data.phone : existing.phone;
      entity.website = request.data.website !== undefined ? request.data.website : existing.website;
      entity.addressLine_1 = request.data.addressLine_1 !== undefined ? request.data.addressLine_1 : existing.addressLine_1;
      entity.addressLine_2 = request.data.addressLine_2 !== undefined ? request.data.addressLine_2 : existing.addressLine_2;
      entity.city = request.data.city !== undefined ? request.data.city : existing.city;
      entity.region = request.data.region !== undefined ? request.data.region : existing.region;
      entity.postalCode = request.data.postalCode !== undefined ? request.data.postalCode : existing.postalCode;
      entity.countryCode = request.data.countryCode !== undefined ? request.data.countryCode : existing.countryCode;
      entity.notes = request.data.notes !== undefined ? request.data.notes : existing.notes;
      entity.status = request.data.status !== undefined ? request.data.status : existing.status;
      validateExternalPartyRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateExternalPartyResponse(toExternalPartyResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
