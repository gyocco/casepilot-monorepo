import type { CustomFieldDefinitionResponse } from '../shared/custom-field-definition.response.js';
import { Response } from '@casepilot/cqrs';

export class UpdateCustomFieldDefinitionResponse extends Response {
  constructor(public readonly item: CustomFieldDefinitionResponse) { super(); }
}
