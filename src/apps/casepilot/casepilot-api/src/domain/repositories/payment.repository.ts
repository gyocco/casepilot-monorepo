import type { ScopedDataRepository as DataRepository } from '@casepilot/abstractions';
import type { Payment } from '../entities/payment.js';
export interface PaymentRepository extends DataRepository<Payment> {
  readonly entityType?: Payment;
}
