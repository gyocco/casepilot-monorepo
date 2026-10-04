import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { ExternalParty } from '../../../domain/entities/external-party.js';
import { CreateExternalPartyResponse } from './create-external-party.response.js';
import { toExternalPartyResponse } from '../shared/external-party.response.js';
import { type CreateExternalPartyRequest } from './create-external-party.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { external_partyFields, validateExternalPartyRelations } from '../shared/external-party.rules.js';
import { validateFields } from '../../shared/crud-validation.js';

export class CreateExternalPartyHandler implements Handler<CreateExternalPartyRequest, CreateExternalPartyResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<ExternalParty>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateExternalPartyRequest): Promise<CreateExternalPartyResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, external_partyFields, false);
      const entity = new ExternalParty();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.type = request.data.type;
      entity.displayName = request.data.displayName;
      entity.firstName = request.data.firstName ?? null;
      entity.lastName = request.data.lastName ?? null;
      entity.legalName = request.data.legalName ?? null;
      entity.taxId = request.data.taxId ?? null;
      entity.email = request.data.email ?? null;
      entity.phone = request.data.phone ?? null;
      entity.website = request.data.website ?? null;
      entity.addressLine_1 = request.data.addressLine_1 ?? null;
      entity.addressLine_2 = request.data.addressLine_2 ?? null;
      entity.city = request.data.city ?? null;
      entity.region = request.data.region ?? null;
      entity.postalCode = request.data.postalCode ?? null;
      entity.countryCode = request.data.countryCode ?? null;
      entity.notes = request.data.notes ?? null;
      entity.status = request.data.status ?? null;
      validateExternalPartyRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateExternalPartyResponse(toExternalPartyResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
