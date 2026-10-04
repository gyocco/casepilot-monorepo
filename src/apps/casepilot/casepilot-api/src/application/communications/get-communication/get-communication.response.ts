import type { CommunicationResponse } from '../shared/communication.response.js';
import { Response } from '@casepilot/cqrs';

export class GetCommunicationResponse extends Response {
  constructor(public readonly item: CommunicationResponse) { super(); }
}
