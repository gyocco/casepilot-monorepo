import { ValidationError } from '@casepilot/abstractions';
import type { TimeEntry } from '../../domain/entities/time-entry.js';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { FieldRule } from '@casepilot/validation';
import { validateChronology } from '../shared/crud-validation.js';
import { validateReference } from '../shared/crud-relations.js';
export const time_entryFields: readonly FieldRule[] = [
  { name: 'caseId', kind: 'uuid', nullable: false },
  { name: 'memberId', kind: 'uuid', nullable: false },
  { name: 'taskId', kind: 'uuid', nullable: true },
  { name: 'description', kind: 'text', nullable: true },
  { name: 'startedAt', kind: 'timestamp', nullable: true },
  { name: 'endedAt', kind: 'timestamp', nullable: true },
  { name: 'durationMinutes', kind: 'integer', nullable: false },
  { name: 'billable', kind: 'boolean', nullable: false },
  { name: 'hourlyRate', kind: 'decimal', nullable: true, nonnegative: true },
  { name: 'currency', kind: 'string', nullable: true, pattern: /^[A-Z]{3}$/ },
  { name: 'invoiceLineId', kind: 'uuid', nullable: true },
];
export const time_entrySortFields = ['id', 'createdAt', 'updatedAt', 'version', 'businessAccountId', 'caseId', 'memberId', 'taskId', 'startedAt', 'endedAt', 'durationMinutes', 'billable', 'hourlyRate', 'currency', 'invoiceLineId'];
export async function validateTimeEntryRelations(entity: TimeEntry, references: ReferenceRepository): Promise<void> {
  await validateReference(references, 'cases', entity.caseId, entity.businessAccountId);
  await validateReference(references, 'members', entity.memberId, entity.businessAccountId);
  const task = await validateReference(references, 'tasks', entity.taskId, entity.businessAccountId);
  await validateReference(references, 'invoice_lines', entity.invoiceLineId, entity.businessAccountId);
  if (task !== null && task.caseId !== entity.caseId) throw new ValidationError('The task must belong to the same case.');
  validateChronology(entity.startedAt, entity.endedAt);
}
