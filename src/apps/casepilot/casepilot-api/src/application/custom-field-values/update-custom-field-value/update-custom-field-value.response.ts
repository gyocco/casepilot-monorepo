import type { CustomFieldValueResponse } from '../shared/custom-field-value.response.js';
import { Response } from '@casepilot/cqrs';

export class UpdateCustomFieldValueResponse extends Response {
  constructor(public readonly item: CustomFieldValueResponse) { super(); }
}
