import type { BusinessAccountResponse } from '../shared/business-account.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListBusinessAccountsResponse extends Response {
  constructor(public readonly items: readonly BusinessAccountResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
