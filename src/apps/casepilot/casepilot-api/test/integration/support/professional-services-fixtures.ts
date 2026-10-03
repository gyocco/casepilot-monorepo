import type { JsonValue } from '@casepilot/abstractions';
export interface ResourceFixtureDefinition {
  readonly resource: string;
  readonly tenant: boolean;
  readonly data: (ids: Readonly<Record<string, string>>) => Record<string, JsonValue>;
  readonly patch: Record<string, JsonValue>;
}
// Dependency order is explicit so the fixtures exercise real references through HTTP.
export const resourceFixtures: readonly ResourceFixtureDefinition[] = [
  { resource: 'users', tenant: false, data: _ids => ({ email: 'ada@example.test', firstName: 'Fixture firstName', lastName: 'Fixture lastName', status: 'ACTIVE' }), patch: { firstName: 'Updated fixture' } },
  { resource: 'business-accounts', tenant: false, data: _ids => ({ name: 'Fixture name', timezone: 'America/Montevideo', locale: 'es-UY', currency: 'UYU', countryCode: 'UY', status: 'ACTIVE' }), patch: { name: 'Updated fixture' } },
  { resource: 'workflows', tenant: true, data: _ids => ({ name: 'Fixture name', isActive: false }), patch: { name: 'Updated fixture' } },
  { resource: 'case-types', tenant: true, data: _ids => ({ name: 'Fixture name', isActive: false }), patch: { name: 'Updated fixture' } },
  { resource: 'members', tenant: true, data: ids => ({ userId: ids['users'], role: 'OWNER', status: 'INVITED' }), patch: { title: 'Updated fixture' } },
  { resource: 'external-parties', tenant: true, data: _ids => ({ type: 'PERSON', displayName: 'Fixture displayName' }), patch: { displayName: 'Updated fixture' } },
  { resource: 'cases', tenant: true, data: ids => ({ title: 'Fixture title', status: 'OPEN', createdByMemberId: ids['members'] }), patch: { title: 'Updated fixture' } },
  { resource: 'case-external-parties', tenant: true, data: ids => ({ caseId: ids['cases'], externalPartyId: ids['external-parties'], role: 'CLIENT', isPrimary: false }), patch: { notes: 'Updated fixture' } },
  { resource: 'case-members', tenant: true, data: ids => ({ caseId: ids['cases'], memberId: ids['members'], isPrimary: false, assignedAt: '2026-10-02T12:00:00.000Z' }), patch: { isPrimary: true } },
  { resource: 'tasks', tenant: true, data: ids => ({ title: 'Fixture title', status: 'TODO', createdByMemberId: ids['members'] }), patch: { title: 'Updated fixture' } },
  { resource: 'events', tenant: true, data: ids => ({ title: 'Fixture title', startsAt: '2026-10-02T12:00:00.000Z', allDay: false, createdByMemberId: ids['members'] }), patch: { title: 'Updated fixture' } },
  { resource: 'deadlines', tenant: true, data: ids => ({ caseId: ids['cases'], title: 'Fixture title', dueAt: '2026-10-02T12:00:00.000Z', status: 'PENDING' }), patch: { title: 'Updated fixture' } },
  { resource: 'folders', tenant: true, data: ids => ({ name: 'Fixture name', createdByMemberId: ids['members'] }), patch: { name: 'Updated fixture' } },
  { resource: 'documents', tenant: true, data: ids => ({ name: 'Fixture name', createdByMemberId: ids['members'] }), patch: { name: 'Updated fixture' } },
  { resource: 'document-versions', tenant: true, data: ids => ({ documentId: ids['documents'], versionNumber: 1, storageKey: 'Fixture storageKey', fileName: 'Fixture fileName', mimeType: 'Fixture mimeType', sizeBytes: '9007199254740993', uploadedByMemberId: ids['members'] }), patch: { fileName: 'Updated fixture' } },
  { resource: 'notes', tenant: true, data: ids => ({ authorMemberId: ids['members'], body: 'Fixture body', isPrivate: false }), patch: { title: 'Updated fixture' } },
  { resource: 'comments', tenant: true, data: ids => ({ authorMemberId: ids['members'], targetType: 'CASE', targetId: ids.cases, body: 'Fixture body' }), patch: { body: 'Updated fixture' } },
  { resource: 'activities', tenant: true, data: ids => ({ action: 'Fixture action', entityType: 'CASE', entityId: ids.cases, occurredAt: '2026-10-02T12:00:00.000Z' }), patch: { action: 'Updated fixture' } },
  { resource: 'communications', tenant: true, data: _ids => ({ type: 'EMAIL', occurredAt: '2026-10-02T12:00:00.000Z' }), patch: { subject: 'Updated fixture' } },
  { resource: 'invoices', tenant: true, data: ids => ({ externalPartyId: ids['external-parties'], number: 'Fixture number', status: 'DRAFT', currency: 'UYU', issueDate: '2026-10-02', subtotal: '25.0000', taxAmount: '25.0000', total: '25.0000', balanceDue: '25.0000' }), patch: { notes: 'Updated fixture' } },
  { resource: 'invoice-lines', tenant: true, data: ids => ({ invoiceId: ids['invoices'], description: 'Fixture description', quantity: '25.0000', unitPrice: '25.0000', subtotal: '25.0000', total: '25.0000', sortOrder: 1 }), patch: { description: 'Updated fixture' } },
  { resource: 'time-entries', tenant: true, data: ids => ({ caseId: ids['cases'], memberId: ids['members'], durationMinutes: 1, billable: false }), patch: { description: 'Updated fixture' } },
  { resource: 'expenses', tenant: true, data: ids => ({ caseId: ids['cases'], description: 'Fixture description', amount: '25.0000', currency: 'UYU', occurredOn: '2026-10-02', billable: false }), patch: { description: 'Updated fixture' } },
  { resource: 'payments', tenant: true, data: ids => ({ invoiceId: ids['invoices'], amount: '25.0000', currency: 'UYU', paidAt: '2026-10-02T12:00:00.000Z' }), patch: { reference: 'Updated fixture' } },
  { resource: 'custom-field-definitions', tenant: true, data: _ids => ({ entityType: 'CASE', name: 'Fixture name', key: 'Fixture key', dataType: 'TEXT', required: false, sortOrder: 1, isActive: false }), patch: { name: 'Updated fixture' } },
  { resource: 'custom-field-values', tenant: true, data: ids => ({ customFieldDefinitionId: ids['custom-field-definitions'], entityType: 'CASE', entityId: ids.cases }), patch: { valueText: 'Updated fixture' } },
  { resource: 'status-definitions', tenant: true, data: _ids => ({ entityType: 'CASE', name: 'Fixture name', code: 'Fixture code', sortOrder: 1, isInitial: false, isTerminal: false, isActive: false }), patch: { name: 'Updated fixture' } },
  { resource: 'workflow-steps', tenant: true, data: ids => ({ workflowId: ids['workflows'], name: 'Fixture name', sortOrder: 1, isInitial: false, isTerminal: false }), patch: { name: 'Updated fixture' } },
];
