import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { CreatePaymentHandler } from '../../application/payments/create-payment.handler.js';
import { GetPaymentHandler } from '../../application/payments/get-payment.handler.js';
import { UpdatePaymentHandler } from '../../application/payments/update-payment.handler.js';
import { DeletePaymentHandler } from '../../application/payments/delete-payment.handler.js';
import { ListPaymentsHandler } from '../../application/payments/list-payments.handler.js';
import { CreatePaymentRequest, GetPaymentRequest, UpdatePaymentRequest, DeletePaymentRequest, ListPaymentsRequest } from '../../application/payments/payment.models.js';
import { readBody, numberValue, numberQuery, textQuery, stringValue, optionalString, nullableString, PageMetadataHttpResponse } from '../shared/crud-http.js';
import { PaymentItemHttpResponse, PaymentsPageHttpResponse, DeletePaymentHttpResponse, toPaymentHttpResponse } from './payment-http.response.js';

@Controller('business-accounts/:businessAccountId/payments')
export class PaymentsController {
  constructor(
    @Inject(CreatePaymentHandler) private readonly createHandler: CreatePaymentHandler,
    @Inject(GetPaymentHandler) private readonly getHandler: GetPaymentHandler,
    @Inject(UpdatePaymentHandler) private readonly updateHandler: UpdatePaymentHandler,
    @Inject(DeletePaymentHandler) private readonly deleteHandler: DeletePaymentHandler,
    @Inject(ListPaymentsHandler) private readonly listHandler: ListPaymentsHandler,
  ) {}

  @Post()
  @Header('Cache-Control', 'no-store')
  async create(@Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<PaymentItemHttpResponse> {
    const body = readBody(input, ['invoiceId', 'amount', 'currency', 'paymentMethod', 'reference', 'paidAt', 'notes']);
    const response = await this.createHandler.execute(new CreatePaymentRequest(businessAccountId, {
      invoiceId: stringValue(body, 'invoiceId'),
      amount: stringValue(body, 'amount'),
      currency: stringValue(body, 'currency'),
      paymentMethod: nullableString(body, 'paymentMethod'),
      reference: nullableString(body, 'reference'),
      paidAt: stringValue(body, 'paidAt'),
      notes: nullableString(body, 'notes'),
    }));
    return new PaymentItemHttpResponse(toPaymentHttpResponse(response.item));
  }

  @Get()
  @Header('Cache-Control', 'no-store')
  async list(
    @Param('businessAccountId') businessAccountId: string,
    @Query('pageNumber') pageNumber: string | undefined,
    @Query('pageSize') pageSize: string | undefined,
    @Query('sortBy') sortBy: string | undefined,
    @Query('sortDirection') sortDirection: string | undefined,
  ): Promise<PaymentsPageHttpResponse> {
    const response = await this.listHandler.execute(new ListPaymentsRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc')));
    return new PaymentsPageHttpResponse(response.items.map(toPaymentHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<PaymentItemHttpResponse> {
    const response = await this.getHandler.execute(new GetPaymentRequest(businessAccountId, id));
    return new PaymentItemHttpResponse(toPaymentHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<PaymentItemHttpResponse> {
    const body = readBody(input, ['version', 'invoiceId', 'amount', 'currency', 'paymentMethod', 'reference', 'paidAt', 'notes']);
    const response = await this.updateHandler.execute(new UpdatePaymentRequest(businessAccountId, id, numberValue(body, 'version'), {
      invoiceId: optionalString(body, 'invoiceId'),
      amount: optionalString(body, 'amount'),
      currency: optionalString(body, 'currency'),
      paymentMethod: nullableString(body, 'paymentMethod'),
      reference: nullableString(body, 'reference'),
      paidAt: optionalString(body, 'paidAt'),
      notes: nullableString(body, 'notes'),
    }));
    return new PaymentItemHttpResponse(toPaymentHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeletePaymentHttpResponse> {
    const response = await this.deleteHandler.execute(new DeletePaymentRequest(businessAccountId, id, numberQuery(version)));
    return new DeletePaymentHttpResponse(response.id, response.deleted);
  }
}
