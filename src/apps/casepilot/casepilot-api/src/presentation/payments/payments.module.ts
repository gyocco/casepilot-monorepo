import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/persistence/typeorm';
import type { Payment } from '../../domain/entities/payment.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '@casepilot/persistence/typeorm';
import { TypeOrmPaymentRepository } from '../../infrastructure/persistence/repositories/typeorm-payment.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { TypeOrmUserRepository } from '../../infrastructure/persistence/repositories/typeorm-user.repository.js';
import { TypeOrmUserIdentityRepository } from '../../infrastructure/persistence/repositories/typeorm-user-identity.repository.js';
import { TypeOrmMemberRepository } from '../../infrastructure/persistence/repositories/typeorm-member.repository.js';
import { systemCrudRuntime } from '@casepilot/abstractions/node';
import { CreatePaymentHandler } from '../../application/payments/create-payment/create-payment.handler.js';
import { GetPaymentHandler } from '../../application/payments/get-payment/get-payment.handler.js';
import { UpdatePaymentHandler } from '../../application/payments/update-payment/update-payment.handler.js';
import { DeletePaymentHandler } from '../../application/payments/delete-payment/delete-payment.handler.js';
import { ListPaymentsHandler } from '../../application/payments/list-payments/list-payments.handler.js';
import { PaymentsController } from './payments.controller.js';
const WORK = Symbol('Payments_WORK');
@Module({
  controllers: [PaymentsController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<Payment>> =>
        new TypeOrmUnitOfWork<CrudScope<Payment>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmPaymentRepository(manager), references: new TypeOrmReferenceRepository(manager), users: new TypeOrmUserRepository(manager), userIdentities: new TypeOrmUserIdentityRepository(manager), members: new TypeOrmMemberRepository(manager),
        })),
    },
    {
      provide: CreatePaymentHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Payment>>): CreatePaymentHandler => new CreatePaymentHandler(work, systemCrudRuntime),
    },
    {
      provide: GetPaymentHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Payment>>): GetPaymentHandler => new GetPaymentHandler(work),
    },
    {
      provide: UpdatePaymentHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Payment>>): UpdatePaymentHandler => new UpdatePaymentHandler(work, systemCrudRuntime),
    },
    {
      provide: DeletePaymentHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Payment>>): DeletePaymentHandler => new DeletePaymentHandler(work),
    },
    {
      provide: ListPaymentsHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Payment>>): ListPaymentsHandler => new ListPaymentsHandler(work),
    },
  ],
})
export class PaymentsModule {}
