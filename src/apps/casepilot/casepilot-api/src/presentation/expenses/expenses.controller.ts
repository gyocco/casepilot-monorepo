import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import type { VerifiedIdentity } from '@casepilot/auth';
import { CurrentIdentity } from '@casepilot/auth/nestjs';
import { CreateExpenseHandler } from '../../application/expenses/create-expense/create-expense.handler.js';
import { GetExpenseHandler } from '../../application/expenses/get-expense/get-expense.handler.js';
import { UpdateExpenseHandler } from '../../application/expenses/update-expense/update-expense.handler.js';
import { DeleteExpenseHandler } from '../../application/expenses/delete-expense/delete-expense.handler.js';
import { ListExpensesHandler } from '../../application/expenses/list-expenses/list-expenses.handler.js';
import { CreateExpenseRequest } from '../../application/expenses/create-expense/create-expense.request.js';
import { GetExpenseRequest } from '../../application/expenses/get-expense/get-expense.request.js';
import { UpdateExpenseRequest } from '../../application/expenses/update-expense/update-expense.request.js';
import { DeleteExpenseRequest } from '../../application/expenses/delete-expense/delete-expense.request.js';
import { ListExpensesRequest } from '../../application/expenses/list-expenses/list-expenses.request.js';
import { readBody, numberValue, numberQuery, textQuery, stringValue, optionalString, nullableString, booleanValue, optionalBoolean, PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import { ExpenseItemHttpResponse, ExpensesPageHttpResponse, DeleteExpenseHttpResponse, toExpenseHttpResponse } from './expense-http.response.js';

@Controller('business-accounts/:businessAccountId/expenses')
export class ExpensesController {
  constructor(
    @Inject(CreateExpenseHandler) private readonly createHandler: CreateExpenseHandler,
    @Inject(GetExpenseHandler) private readonly getHandler: GetExpenseHandler,
    @Inject(UpdateExpenseHandler) private readonly updateHandler: UpdateExpenseHandler,
    @Inject(DeleteExpenseHandler) private readonly deleteHandler: DeleteExpenseHandler,
    @Inject(ListExpensesHandler) private readonly listHandler: ListExpensesHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<ExpenseItemHttpResponse> {
    const body = readBody(input, ['caseId', 'memberId', 'description', 'amount', 'currency', 'occurredOn', 'billable', 'invoiceLineId', 'documentId']);
    const response = await this.createHandler.execute(new CreateExpenseRequest(businessAccountId, {
      caseId: stringValue(body, 'caseId'),
      memberId: nullableString(body, 'memberId'),
      description: stringValue(body, 'description'),
      amount: stringValue(body, 'amount'),
      currency: stringValue(body, 'currency'),
      occurredOn: stringValue(body, 'occurredOn'),
      billable: booleanValue(body, 'billable'),
      invoiceLineId: nullableString(body, 'invoiceLineId'),
      documentId: nullableString(body, 'documentId'),
    }, actor));
    return new ExpenseItemHttpResponse(toExpenseHttpResponse(response.item));
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(
    @CurrentIdentity() actor: VerifiedIdentity,
    @Param('businessAccountId') businessAccountId: string,
    @Query('pageNumber') pageNumber: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortDirection') sortDirection: string | undefined,
  ): Promise<ExpensesPageHttpResponse> {
    const response = await this.listHandler.execute(new ListExpensesRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc'), actor));
    return new ExpensesPageHttpResponse(response.items.map(toExpenseHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<ExpenseItemHttpResponse> {
    const response = await this.getHandler.execute(new GetExpenseRequest(businessAccountId, id, actor));
    return new ExpenseItemHttpResponse(toExpenseHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<ExpenseItemHttpResponse> {
    const body = readBody(input, ['version', 'caseId', 'memberId', 'description', 'amount', 'currency', 'occurredOn', 'billable', 'invoiceLineId', 'documentId']);
    const response = await this.updateHandler.execute(new UpdateExpenseRequest(businessAccountId, id, numberValue(body, 'version'), {
      caseId: optionalString(body, 'caseId'),
      memberId: nullableString(body, 'memberId'),
      description: optionalString(body, 'description'),
      amount: optionalString(body, 'amount'),
      currency: optionalString(body, 'currency'),
      occurredOn: optionalString(body, 'occurredOn'),
      billable: optionalBoolean(body, 'billable'),
      invoiceLineId: nullableString(body, 'invoiceLineId'),
      documentId: nullableString(body, 'documentId'),
    }, actor));
    return new ExpenseItemHttpResponse(toExpenseHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteExpenseHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteExpenseRequest(businessAccountId, id, numberQuery(version), actor));
    return new DeleteExpenseHttpResponse(response.id, response.deleted);
  }
}
