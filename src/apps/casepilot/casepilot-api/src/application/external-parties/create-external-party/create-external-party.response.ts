import type { ExternalPartyResponse } from '../shared/external-party.response.js';
import { Response } from '@casepilot/cqrs';

export class CreateExternalPartyResponse extends Response {
  constructor(public readonly item: ExternalPartyResponse) { super(); }
}
