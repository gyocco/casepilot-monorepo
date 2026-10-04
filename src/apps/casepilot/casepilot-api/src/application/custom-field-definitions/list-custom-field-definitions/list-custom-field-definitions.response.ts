import type { CustomFieldDefinitionResponse } from '../shared/custom-field-definition.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListCustomFieldDefinitionsResponse extends Response {
  constructor(public readonly items: readonly CustomFieldDefinitionResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
