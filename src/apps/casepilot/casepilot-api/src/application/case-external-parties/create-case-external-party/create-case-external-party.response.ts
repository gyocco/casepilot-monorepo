import type { CaseExternalPartyResponse } from '../shared/case-external-party.response.js';
import { Response } from '@casepilot/cqrs';

export class CreateCaseExternalPartyResponse extends Response {
  constructor(public readonly item: CaseExternalPartyResponse) { super(); }
}
