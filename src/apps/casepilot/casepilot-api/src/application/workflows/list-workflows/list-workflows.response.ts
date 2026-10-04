import type { WorkflowResponse } from '../shared/workflow.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListWorkflowsResponse extends Response {
  constructor(public readonly items: readonly WorkflowResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
