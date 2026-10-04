import type { WorkflowStepResponse } from '../shared/workflow-step.response.js';
import { Response } from '@casepilot/cqrs';
import type { PageMetadataResponse } from '@casepilot/cqrs';

export class ListWorkflowStepsResponse extends Response {
  constructor(public readonly items: readonly WorkflowStepResponse[], public readonly pagination: PageMetadataResponse) { super(); }
}
