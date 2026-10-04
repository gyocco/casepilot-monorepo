import type { CommunicationResponse } from '../shared/communication.response.js';
import { Response } from '@casepilot/cqrs';

export class UpdateCommunicationResponse extends Response {
  constructor(public readonly item: CommunicationResponse) { super(); }
}
