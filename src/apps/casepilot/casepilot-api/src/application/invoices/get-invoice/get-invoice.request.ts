import { Request } from '@casepilot/cqrs';

export class GetInvoiceRequest extends Request {
  constructor(public readonly businessAccountId: string | null, public readonly id: string) { super(); }
}
