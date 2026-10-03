import type { EntityManager } from 'typeorm';
import type { Payment } from '../../../domain/entities/payment.js';
import type { PaymentRepository } from '../../../domain/repositories/payment.repository.js';
import { paymentTable } from '../schemas/payment.schema.js';
import { TypeOrmDataRepository } from '@casepilot/abstractions/typeorm';
export class TypeOrmPaymentRepository extends TypeOrmDataRepository<Payment> implements PaymentRepository {
  constructor(manager: EntityManager) { super(manager, paymentTable); }
}
