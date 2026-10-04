import type { WorkflowStepResponse } from '../shared/workflow-step.response.js';
import { Response } from '@casepilot/cqrs';

export class GetWorkflowStepResponse extends Response {
  constructor(public readonly item: WorkflowStepResponse) { super(); }
}
