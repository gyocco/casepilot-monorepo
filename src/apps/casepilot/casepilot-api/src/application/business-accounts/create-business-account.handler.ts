import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork } from '@casepilot/abstractions';
import { BusinessAccount } from '../../domain/entities/business-account.js';
import { CreateBusinessAccountResponse, toBusinessAccountResponse, type CreateBusinessAccountRequest } from './business-account.models.js';
import { type CrudScope, type CrudRuntime } from '../shared/crud-models.js';
import { runPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { business_accountFields, validateBusinessAccountRelations } from './business-account.rules.js';
import { validateFields } from '../shared/crud-validation.js';

export class CreateBusinessAccountHandler implements Handler<CreateBusinessAccountRequest, CreateBusinessAccountResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<BusinessAccount>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateBusinessAccountRequest): Promise<CreateBusinessAccountResponse> {
    return runPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, false);
      validateFields(request.data, business_accountFields, false);
      const entity = new BusinessAccount();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.name = request.data.name;
      entity.legalName = request.data.legalName ?? null;
      entity.slug = request.data.slug ?? null;
      entity.type = request.data.type ?? null;
      entity.taxId = request.data.taxId ?? null;
      entity.email = request.data.email ?? null;
      entity.phone = request.data.phone ?? null;
      entity.website = request.data.website ?? null;
      entity.timezone = request.data.timezone;
      entity.locale = request.data.locale;
      entity.currency = request.data.currency;
      entity.countryCode = request.data.countryCode;
      entity.status = request.data.status;
      entity.settings = request.data.settings ?? null;
      validateBusinessAccountRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateBusinessAccountResponse(toBusinessAccountResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
