import type { StatusDefinitionResponse } from '../shared/status-definition.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListStatusDefinitionsResponse extends Response {
  constructor(public readonly items: readonly StatusDefinitionResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
