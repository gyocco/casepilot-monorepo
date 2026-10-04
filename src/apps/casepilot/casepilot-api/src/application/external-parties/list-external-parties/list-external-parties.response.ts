import type { ExternalPartyResponse } from '../shared/external-party.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListExternalPartiesResponse extends Response {
  constructor(public readonly items: readonly ExternalPartyResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
