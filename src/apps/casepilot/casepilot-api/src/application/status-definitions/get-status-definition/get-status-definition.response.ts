import type { StatusDefinitionResponse } from '../shared/status-definition.response.js';
import { Response } from '@casepilot/cqrs';

export class GetStatusDefinitionResponse extends Response {
  constructor(public readonly item: StatusDefinitionResponse) { super(); }
}
