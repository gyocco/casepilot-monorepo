import type { BusinessAccountResponse } from '../shared/business-account.response.js';
import { Response } from '@casepilot/cqrs';

export class UpdateBusinessAccountResponse extends Response {
  constructor(public readonly item: BusinessAccountResponse) { super(); }
}
