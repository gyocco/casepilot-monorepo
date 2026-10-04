import type { Handler } from '@casepilot/cqrs';
import { type UnitOfWork, ValidationError } from '@casepilot/abstractions';
import { Expense } from '../../../domain/entities/expense.js';
import { CreateExpenseResponse } from './create-expense.response.js';
import { toExpenseResponse } from '../shared/expense.response.js';
import { type CreateExpenseRequest } from './create-expense.request.js';
import { type CrudScope } from '../../shared/crud-models.js';
import type { CrudRuntime } from '@casepilot/abstractions';
import { runCrudPersistence } from '../../shared/crud-persistence.js';
import { validateTenant } from '../../shared/crud-relations.js';
import { expenseFields, validateExpenseRelations } from '../shared/expense.rules.js';
import { validateFields } from '../../shared/crud-validation.js';

export class CreateExpenseHandler implements Handler<CreateExpenseRequest, CreateExpenseResponse> {
  constructor(private readonly work: UnitOfWork<CrudScope<Expense>>, private readonly runtime: CrudRuntime) {}

  async execute(request: CreateExpenseRequest): Promise<CreateExpenseResponse> {
    return runCrudPersistence(() => this.work.execute(async scope => {
      await validateTenant(scope.references, request.businessAccountId, true);
      if (request.businessAccountId === null) throw new ValidationError('A business account is required.');
      validateFields(request.data, expenseFields, false);
      const entity = new Expense();
      entity.id = this.runtime.newId();
      entity.createdAt = this.runtime.now();
      entity.updatedAt = entity.createdAt;
      entity.version = 1;
      entity.businessAccountId = request.businessAccountId;
      entity.caseId = request.data.caseId;
      entity.memberId = request.data.memberId ?? null;
      entity.description = request.data.description;
      entity.amount = request.data.amount;
      entity.currency = request.data.currency;
      entity.occurredOn = request.data.occurredOn;
      entity.billable = request.data.billable;
      entity.invoiceLineId = request.data.invoiceLineId ?? null;
      entity.documentId = request.data.documentId ?? null;
      await validateExpenseRelations(entity, scope.references);
      const stored = await scope.resource.add(entity);
      return new CreateExpenseResponse(toExpenseResponse(stored));
    }, 'SERIALIZABLE'));
  }
}
