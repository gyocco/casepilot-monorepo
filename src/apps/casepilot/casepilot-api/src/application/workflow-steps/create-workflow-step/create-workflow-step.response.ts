import type { WorkflowStepResponse } from '../shared/workflow-step.response.js';
import { Response } from '@casepilot/cqrs';

export class CreateWorkflowStepResponse extends Response {
  constructor(public readonly item: WorkflowStepResponse) { super(); }
}
