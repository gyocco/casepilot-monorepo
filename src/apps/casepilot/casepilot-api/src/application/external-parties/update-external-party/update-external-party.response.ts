import type { ExternalPartyResponse } from '../shared/external-party.response.js';
import { Response } from '@casepilot/cqrs';

export class UpdateExternalPartyResponse extends Response {
  constructor(public readonly item: ExternalPartyResponse) { super(); }
}
