import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateInvoiceHandler } from '../../application/invoices/create-invoice/create-invoice.handler.js';
import { GetInvoiceHandler } from '../../application/invoices/get-invoice/get-invoice.handler.js';
import { UpdateInvoiceHandler } from '../../application/invoices/update-invoice/update-invoice.handler.js';
import { DeleteInvoiceHandler } from '../../application/invoices/delete-invoice/delete-invoice.handler.js';
import { ListInvoicesHandler } from '../../application/invoices/list-invoices/list-invoices.handler.js';
import { CreateInvoiceRequest } from '../../application/invoices/create-invoice/create-invoice.request.js';
import { GetInvoiceRequest } from '../../application/invoices/get-invoice/get-invoice.request.js';
import { UpdateInvoiceRequest } from '../../application/invoices/update-invoice/update-invoice.request.js';
import { DeleteInvoiceRequest } from '../../application/invoices/delete-invoice/delete-invoice.request.js';
import { ListInvoicesRequest } from '../../application/invoices/list-invoices/list-invoices.request.js';
import { readBody, numberValue, numberQuery, textQuery, stringValue, optionalString, nullableString, choiceValue, optionalChoice, PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import { InvoiceItemHttpResponse, InvoicesPageHttpResponse, DeleteInvoiceHttpResponse, toInvoiceHttpResponse } from './invoice-http.response.js';

@Controller('business-accounts/:businessAccountId/invoices')
export class InvoicesController {
  constructor(
    @Inject(CreateInvoiceHandler) private readonly createHandler: CreateInvoiceHandler,
    @Inject(GetInvoiceHandler) private readonly getHandler: GetInvoiceHandler,
    @Inject(UpdateInvoiceHandler) private readonly updateHandler: UpdateInvoiceHandler,
    @Inject(DeleteInvoiceHandler) private readonly deleteHandler: DeleteInvoiceHandler,
    @Inject(ListInvoicesHandler) private readonly listHandler: ListInvoicesHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<InvoiceItemHttpResponse> {
    const body = readBody(input, ['externalPartyId', 'caseId', 'number', 'status', 'currency', 'issueDate', 'dueDate', 'subtotal', 'taxAmount', 'total', 'balanceDue', 'notes']);
    const response = await this.createHandler.execute(new CreateInvoiceRequest(businessAccountId, {
      externalPartyId: stringValue(body, 'externalPartyId'),
      caseId: nullableString(body, 'caseId'),
      number: stringValue(body, 'number'),
      status: choiceValue(body, 'status', ['DRAFT', 'ISSUED', 'PAID', 'VOID', 'OVERDUE']),
      currency: stringValue(body, 'currency'),
      issueDate: stringValue(body, 'issueDate'),
      dueDate: nullableString(body, 'dueDate'),
      subtotal: stringValue(body, 'subtotal'),
      taxAmount: stringValue(body, 'taxAmount'),
      total: stringValue(body, 'total'),
      balanceDue: stringValue(body, 'balanceDue'),
      notes: nullableString(body, 'notes'),
    }));
    return new InvoiceItemHttpResponse(toInvoiceHttpResponse(response.item));
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(
    @Param('businessAccountId') businessAccountId: string,
    @Query('pageNumber') pageNumber: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortDirection') sortDirection: string | undefined,
  ): Promise<InvoicesPageHttpResponse> {
    const response = await this.listHandler.execute(new ListInvoicesRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc')));
    return new InvoicesPageHttpResponse(response.items.map(toInvoiceHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<InvoiceItemHttpResponse> {
    const response = await this.getHandler.execute(new GetInvoiceRequest(businessAccountId, id));
    return new InvoiceItemHttpResponse(toInvoiceHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<InvoiceItemHttpResponse> {
    const body = readBody(input, ['version', 'externalPartyId', 'caseId', 'number', 'status', 'currency', 'issueDate', 'dueDate', 'subtotal', 'taxAmount', 'total', 'balanceDue', 'notes']);
    const response = await this.updateHandler.execute(new UpdateInvoiceRequest(businessAccountId, id, numberValue(body, 'version'), {
      externalPartyId: optionalString(body, 'externalPartyId'),
      caseId: nullableString(body, 'caseId'),
      number: optionalString(body, 'number'),
      status: optionalChoice(body, 'status', ['DRAFT', 'ISSUED', 'PAID', 'VOID', 'OVERDUE']),
      currency: optionalString(body, 'currency'),
      issueDate: optionalString(body, 'issueDate'),
      dueDate: nullableString(body, 'dueDate'),
      subtotal: optionalString(body, 'subtotal'),
      taxAmount: optionalString(body, 'taxAmount'),
      total: optionalString(body, 'total'),
      balanceDue: optionalString(body, 'balanceDue'),
      notes: nullableString(body, 'notes'),
    }));
    return new InvoiceItemHttpResponse(toInvoiceHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteInvoiceHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteInvoiceRequest(businessAccountId, id, numberQuery(version)));
    return new DeleteInvoiceHttpResponse(response.id, response.deleted);
  }
}
