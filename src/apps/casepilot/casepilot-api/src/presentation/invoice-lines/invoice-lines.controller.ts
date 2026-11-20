import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import type { VerifiedIdentity } from '@casepilot/auth';
import { CurrentIdentity } from '@casepilot/auth/nestjs';
import { CreateInvoiceLineHandler } from '../../application/invoice-lines/create-invoice-line/create-invoice-line.handler.js';
import { GetInvoiceLineHandler } from '../../application/invoice-lines/get-invoice-line/get-invoice-line.handler.js';
import { UpdateInvoiceLineHandler } from '../../application/invoice-lines/update-invoice-line/update-invoice-line.handler.js';
import { DeleteInvoiceLineHandler } from '../../application/invoice-lines/delete-invoice-line/delete-invoice-line.handler.js';
import { ListInvoiceLinesHandler } from '../../application/invoice-lines/list-invoice-lines/list-invoice-lines.handler.js';
import { CreateInvoiceLineRequest } from '../../application/invoice-lines/create-invoice-line/create-invoice-line.request.js';
import { GetInvoiceLineRequest } from '../../application/invoice-lines/get-invoice-line/get-invoice-line.request.js';
import { UpdateInvoiceLineRequest } from '../../application/invoice-lines/update-invoice-line/update-invoice-line.request.js';
import { DeleteInvoiceLineRequest } from '../../application/invoice-lines/delete-invoice-line/delete-invoice-line.request.js';
import { ListInvoiceLinesRequest } from '../../application/invoice-lines/list-invoice-lines/list-invoice-lines.request.js';
import { readBody, numberValue, numberQuery, textQuery, stringValue, optionalString, nullableString, optionalNumber, PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
import { InvoiceLineItemHttpResponse, InvoiceLinesPageHttpResponse, DeleteInvoiceLineHttpResponse, toInvoiceLineHttpResponse } from './invoice-line-http.response.js';

@Controller('business-accounts/:businessAccountId/invoice-lines')
export class InvoiceLinesController {
  constructor(
    @Inject(CreateInvoiceLineHandler) private readonly createHandler: CreateInvoiceLineHandler,
    @Inject(GetInvoiceLineHandler) private readonly getHandler: GetInvoiceLineHandler,
    @Inject(UpdateInvoiceLineHandler) private readonly updateHandler: UpdateInvoiceLineHandler,
    @Inject(DeleteInvoiceLineHandler) private readonly deleteHandler: DeleteInvoiceLineHandler,
    @Inject(ListInvoiceLinesHandler) private readonly listHandler: ListInvoiceLinesHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<InvoiceLineItemHttpResponse> {
    const body = readBody(input, ['invoiceId', 'caseId', 'description', 'quantity', 'unitPrice', 'taxRate', 'subtotal', 'total', 'sortOrder']);
    const response = await this.createHandler.execute(new CreateInvoiceLineRequest(businessAccountId, {
      invoiceId: stringValue(body, 'invoiceId'),
      caseId: nullableString(body, 'caseId'),
      description: stringValue(body, 'description'),
      quantity: stringValue(body, 'quantity'),
      unitPrice: stringValue(body, 'unitPrice'),
      taxRate: nullableString(body, 'taxRate'),
      subtotal: stringValue(body, 'subtotal'),
      total: stringValue(body, 'total'),
      sortOrder: numberValue(body, 'sortOrder'),
    }, actor));
    return new InvoiceLineItemHttpResponse(toInvoiceLineHttpResponse(response.item));
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
  ): Promise<InvoiceLinesPageHttpResponse> {
    const response = await this.listHandler.execute(new ListInvoiceLinesRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc'), actor));
    return new InvoiceLinesPageHttpResponse(response.items.map(toInvoiceLineHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<InvoiceLineItemHttpResponse> {
    const response = await this.getHandler.execute(new GetInvoiceLineRequest(businessAccountId, id, actor));
    return new InvoiceLineItemHttpResponse(toInvoiceLineHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<InvoiceLineItemHttpResponse> {
    const body = readBody(input, ['version', 'invoiceId', 'caseId', 'description', 'quantity', 'unitPrice', 'taxRate', 'subtotal', 'total', 'sortOrder']);
    const response = await this.updateHandler.execute(new UpdateInvoiceLineRequest(businessAccountId, id, numberValue(body, 'version'), {
      invoiceId: optionalString(body, 'invoiceId'),
      caseId: nullableString(body, 'caseId'),
      description: optionalString(body, 'description'),
      quantity: optionalString(body, 'quantity'),
      unitPrice: optionalString(body, 'unitPrice'),
      taxRate: nullableString(body, 'taxRate'),
      subtotal: optionalString(body, 'subtotal'),
      total: optionalString(body, 'total'),
      sortOrder: optionalNumber(body, 'sortOrder'),
    }, actor));
    return new InvoiceLineItemHttpResponse(toInvoiceLineHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeleteInvoiceLineHttpResponse> {
    const response = await this.deleteHandler.execute(new DeleteInvoiceLineRequest(businessAccountId, id, numberQuery(version), actor));
    return new DeleteInvoiceLineHttpResponse(response.id, response.deleted);
  }
}
