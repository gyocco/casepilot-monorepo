import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { BusinessAccount } from '../../../domain/entities/business-account.js';
import { UpdateBusinessAccountResponse } from './update-business-account.response.js';
import { toBusinessAccountResponse } from '../shared/business-account.response.js';
import { type UpdateBusinessAccountRequest } from './update-business-account.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { business_accountFields, validateBusinessAccountRelations } from '../shared/business-account.rules.js';
import { validateId } from '@casepilot/validation';
import { validateFields } from '../../shared/crud-validation.js';
import { validateVersion } from '../../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class UpdateBusinessAccountHandler implements Handler<UpdateBusinessAccountRequest, UpdateBusinessAccountResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<BusinessAccount>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateBusinessAccountRequest): Promise<UpdateBusinessAccountResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, false);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, business_accountFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new BusinessAccount();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.name = request.data.name !== undefined ? request.data.name : existing.name;
      entity.legalName = request.data.legalName !== undefined ? request.data.legalName : existing.legalName;
      entity.slug = request.data.slug !== undefined ? request.data.slug : existing.slug;
      entity.type = request.data.type !== undefined ? request.data.type : existing.type;
      entity.taxId = request.data.taxId !== undefined ? request.data.taxId : existing.taxId;
      entity.email = request.data.email !== undefined ? request.data.email : existing.email;
      entity.phone = request.data.phone !== undefined ? request.data.phone : existing.phone;
      entity.website = request.data.website !== undefined ? request.data.website : existing.website;
      entity.timezone = request.data.timezone !== undefined ? request.data.timezone : existing.timezone;
      entity.locale = request.data.locale !== undefined ? request.data.locale : existing.locale;
      entity.currency = request.data.currency !== undefined ? request.data.currency : existing.currency;
      entity.countryCode = request.data.countryCode !== undefined ? request.data.countryCode : existing.countryCode;
      entity.status = request.data.status !== undefined ? request.data.status : existing.status;
      entity.settings = request.data.settings !== undefined ? request.data.settings : existing.settings;
      validateBusinessAccountRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateBusinessAccountResponse(toBusinessAccountResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
