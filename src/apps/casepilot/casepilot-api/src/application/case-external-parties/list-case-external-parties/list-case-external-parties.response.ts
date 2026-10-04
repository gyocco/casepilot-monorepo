import type { CaseExternalPartyResponse } from '../shared/case-external-party.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListCaseExternalPartiesResponse extends Response {
  constructor(public readonly items: readonly CaseExternalPartyResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
