import type { StatusDefinitionResponse } from '../shared/status-definition.response.js';
import { Response } from '@casepilot/cqrs';

export class CreateStatusDefinitionResponse extends Response {
  constructor(public readonly item: StatusDefinitionResponse) { super(); }
}
