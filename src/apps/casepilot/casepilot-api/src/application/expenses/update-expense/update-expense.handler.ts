import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, NotFoundError, ValidationError } from '@casepilot/abstractions';
import { Expense } from '../../../domain/entities/expense.js';
import { UpdateExpenseResponse } from './update-expense.response.js';
import { toExpenseResponse } from '../shared/expense.response.js';
import { type UpdateExpenseRequest } from './update-expense.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { expenseFields, validateExpenseRelations } from '../shared/expense.rules.js';
import { validateId } from '@casepilot/validation';
import { validateFields } from '../../shared/crud-validation.js';
import { validateVersion } from '../../shared/crud-pagination.js';
import { ConflictError } from '@casepilot/abstractions';

export class UpdateExpenseHandler implements Handler<UpdateExpenseRequest, UpdateExpenseResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Expense>>, private readonly runtime: CrudRuntime) {}

  async execute(request: UpdateExpenseRequest): Promise<UpdateExpenseResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      validateId(request.id);
      validateVersion(request.version);
      validateFields(request.data, expenseFields, true);
      if (Object.values(request.data).every(value => value === undefined)) throw new ValidationError('At least one field is required.');
      const existing = await scope.resource.getById(request.id, request.businessAccountId);
      if (!existing) throw new NotFoundError();
      if (existing.version !== request.version) throw new ConflictError('The record version is stale.');
      const entity = new Expense();
      entity.id = existing.id;
      entity.createdAt = existing.createdAt;
      entity.updatedAt = this.runtime.now();
      entity.version = request.version + 1;
      entity.businessAccountId = existing.businessAccountId;
      entity.caseId = request.data.caseId !== undefined ? request.data.caseId : existing.caseId;
      entity.memberId = request.data.memberId !== undefined ? request.data.memberId : existing.memberId;
      entity.description = request.data.description !== undefined ? request.data.description : existing.description;
      entity.amount = request.data.amount !== undefined ? request.data.amount : existing.amount;
      entity.currency = request.data.currency !== undefined ? request.data.currency : existing.currency;
      entity.occurredOn = request.data.occurredOn !== undefined ? request.data.occurredOn : existing.occurredOn;
      entity.billable = request.data.billable !== undefined ? request.data.billable : existing.billable;
      entity.invoiceLineId = request.data.invoiceLineId !== undefined ? request.data.invoiceLineId : existing.invoiceLineId;
      entity.documentId = request.data.documentId !== undefined ? request.data.documentId : existing.documentId;
      await validateExpenseRelations(entity, scope.references);
      const stored = await scope.resource.update(entity, request.businessAccountId, request.version);
      if (!stored) throw new ConflictError('The record changed concurrently.');
      return new UpdateExpenseResponse(toExpenseResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
