import type { DataRepository } from './data.repository.js';
import type { Payment } from '../entities/payment.js';
export interface PaymentRepository extends DataRepository<Payment> {
  readonly entityType?: Payment;
}
