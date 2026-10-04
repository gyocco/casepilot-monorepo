import type { WorkflowResponse } from '../shared/workflow.response.js';
import { Response } from '@casepilot/cqrs';

export class CreateWorkflowResponse extends Response {
  constructor(public readonly item: WorkflowResponse) { super(); }
}
