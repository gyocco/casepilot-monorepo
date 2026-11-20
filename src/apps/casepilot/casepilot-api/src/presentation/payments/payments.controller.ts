import { Body, Controller, Delete, Get, Header, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import type { VerifiedIdentity } from '@casepilot/auth';
import { CurrentIdentity } from '@casepilot/auth/nestjs';
import { CreatePaymentHandler } from '../../application/payments/create-payment/create-payment.handler.js';
import { GetPaymentHandler } from '../../application/payments/get-payment/get-payment.handler.js';
import { UpdatePaymentHandler } from '../../application/payments/update-payment/update-payment.handler.js';
import { DeletePaymentHandler } from '../../application/payments/delete-payment/delete-payment.handler.js';
import { ListPaymentsHandler } from '../../application/payments/list-payments/list-payments.handler.js';
import { CreatePaymentRequest } from '../../application/payments/create-payment/create-payment.request.js';
import { GetPaymentRequest } from '../../application/payments/get-payment/get-payment.request.js';
import { UpdatePaymentRequest } from '../../application/payments/update-payment/update-payment.request.js';
import { DeletePaymentRequest } from '../../application/payments/delete-payment/delete-payment.request.js';
import { ListPaymentsRequest } from '../../application/payments/list-payments/list-payments.request.js';
import { readBody, numberValue, numberQuery, textQuery, stringValue, optionalString, nullableString, PageMetadataHttpResponse } from '@casepilot/validation/nestjs';
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
  async create(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Body() input: unknown): Promise<PaymentItemHttpResponse> {
    const body = readBody(input, ['invoiceId', 'amount', 'currency', 'paymentMethod', 'reference', 'paidAt', 'notes']);
    const response = await this.createHandler.execute(new CreatePaymentRequest(businessAccountId, {
      invoiceId: stringValue(body, 'invoiceId'),
      amount: stringValue(body, 'amount'),
      currency: stringValue(body, 'currency'),
      paymentMethod: nullableString(body, 'paymentMethod'),
      reference: nullableString(body, 'reference'),
      paidAt: stringValue(body, 'paidAt'),
      notes: nullableString(body, 'notes'),
    }, actor));
    return new PaymentItemHttpResponse(toPaymentHttpResponse(response.item));
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
  ): Promise<PaymentsPageHttpResponse> {
    const response = await this.listHandler.execute(new ListPaymentsRequest(businessAccountId, numberQuery(pageNumber, 1), numberQuery(pageSize, 20), textQuery(sortBy, 'id'), textQuery(sortDirection, 'asc'), actor));
    return new PaymentsPageHttpResponse(response.items.map(toPaymentHttpResponse), new PageMetadataHttpResponse(response.pagination));
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  async get(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string): Promise<PaymentItemHttpResponse> {
    const response = await this.getHandler.execute(new GetPaymentRequest(businessAccountId, id, actor));
    return new PaymentItemHttpResponse(toPaymentHttpResponse(response.item));
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  async update(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Body() input: unknown): Promise<PaymentItemHttpResponse> {
    const body = readBody(input, ['version', 'invoiceId', 'amount', 'currency', 'paymentMethod', 'reference', 'paidAt', 'notes']);
    const response = await this.updateHandler.execute(new UpdatePaymentRequest(businessAccountId, id, numberValue(body, 'version'), {
      invoiceId: optionalString(body, 'invoiceId'),
      amount: optionalString(body, 'amount'),
      currency: optionalString(body, 'currency'),
      paymentMethod: nullableString(body, 'paymentMethod'),
      reference: nullableString(body, 'reference'),
      paidAt: optionalString(body, 'paidAt'),
      notes: nullableString(body, 'notes'),
    }, actor));
    return new PaymentItemHttpResponse(toPaymentHttpResponse(response.item));
  }

  @Delete(':id')
  @Header('Cache-Control', 'no-store')
  async delete(@CurrentIdentity() actor: VerifiedIdentity, @Param('businessAccountId') businessAccountId: string, @Param('id') id: string, @Query('version') version: string | undefined): Promise<DeletePaymentHttpResponse> {
    const response = await this.deleteHandler.execute(new DeletePaymentRequest(businessAccountId, id, numberQuery(version), actor));
    return new DeletePaymentHttpResponse(response.id, response.deleted);
  }
}
