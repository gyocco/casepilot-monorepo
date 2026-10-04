import type { CustomFieldValueResponse } from '../shared/custom-field-value.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListCustomFieldValuesResponse extends Response {
  constructor(public readonly items: readonly CustomFieldValueResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
