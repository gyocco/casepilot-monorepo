import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { StatusDefinition } from '../../domain/entities/status-definition.js';
import { CreateStatusDefinitionResponse, toStatusDefinitionResponse, type CreateStatusDefinitionRequest } from './status-definition.models.js';
import { type CrudScope } from '../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../shared/crud-persistence.js';
import { validateTenant } from '../shared/crud-relations.js';
import { status_definitionFields, validateStatusDefinitionRelations } from './status-definition.rules.js';
import { validateFields } from '../shared/crud-validation.js';

export class CreateStatusDefinitionHandler implements Handler<CreateStatusDefinitionRequest, CreateStatusDefinitionResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<StatusDefinition>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateStatusDefinitionRequest): Promise<CreateStatusDefinitionResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, status_definitionFields, false);
      const entity = new StatusDefinition();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.entityType = request.data.entityType;
      entity.caseTypeId = request.data.caseTypeId ?? null;
      entity.name = request.data.name;
      entity.code = request.data.code;
      entity.category = request.data.category ?? null;
      entity.sortOrder = request.data.sortOrder;
      entity.isInitial = request.data.isInitial;
      entity.isTerminal = request.data.isTerminal;
      entity.isActive = request.data.isActive;
      await validateStatusDefinitionRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateStatusDefinitionResponse(toStatusDefinitionResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
