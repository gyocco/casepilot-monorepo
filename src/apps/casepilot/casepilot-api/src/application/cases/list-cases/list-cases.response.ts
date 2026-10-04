import type { CaseResponse } from '../shared/case.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListCasesResponse extends Response {
  constructor(public readonly items: readonly CaseResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
