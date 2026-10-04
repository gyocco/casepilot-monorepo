import type { CommunicationResponse } from '../shared/communication.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListCommunicationsResponse extends Response {
  constructor(public readonly items: readonly CommunicationResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
