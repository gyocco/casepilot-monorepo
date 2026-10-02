import type { ResourceKind } from '../../domain/entities/resource-kind.js';
interface ReferenceTable {
  readonly name: string;
  readonly tenant: boolean;
  readonly caseColumn: string | null;
  readonly parentColumn: string | null;
}
export const referenceTables: Readonly<Record<ResourceKind, ReferenceTable>> = {
  users: { name: 'users', tenant: false, caseColumn: null, parentColumn: null },
  business_accounts: { name: 'business_accounts', tenant: false, caseColumn: null, parentColumn: null },
  members: { name: 'members', tenant: true, caseColumn: null, parentColumn: null },
  external_parties: { name: 'external_parties', tenant: true, caseColumn: null, parentColumn: null },
  cases: { name: 'cases', tenant: true, caseColumn: null, parentColumn: null },
  case_types: { name: 'case_types', tenant: true, caseColumn: null, parentColumn: null },
  case_external_parties: { name: 'case_external_parties', tenant: true, caseColumn: 'case_id', parentColumn: null },
  case_members: { name: 'case_members', tenant: true, caseColumn: 'case_id', parentColumn: null },
  tasks: { name: 'tasks', tenant: true, caseColumn: 'case_id', parentColumn: null },
  events: { name: 'events', tenant: true, caseColumn: 'case_id', parentColumn: null },
  deadlines: { name: 'deadlines', tenant: true, caseColumn: 'case_id', parentColumn: null },
  folders: { name: 'folders', tenant: true, caseColumn: 'case_id', parentColumn: 'parent_folder_id' },
  documents: { name: 'documents', tenant: true, caseColumn: 'case_id', parentColumn: null },
  document_versions: { name: 'document_versions', tenant: true, caseColumn: null, parentColumn: 'document_id' },
  notes: { name: 'notes', tenant: true, caseColumn: 'case_id', parentColumn: null },
  comments: { name: 'comments', tenant: true, caseColumn: null, parentColumn: null },
  communications: { name: 'communications', tenant: true, caseColumn: 'case_id', parentColumn: null },
  activities: { name: 'activities', tenant: true, caseColumn: 'case_id', parentColumn: null },
  time_entries: { name: 'time_entries', tenant: true, caseColumn: 'case_id', parentColumn: null },
  expenses: { name: 'expenses', tenant: true, caseColumn: 'case_id', parentColumn: 'document_id' },
  invoices: { name: 'invoices', tenant: true, caseColumn: 'case_id', parentColumn: null },
  invoice_lines: { name: 'invoice_lines', tenant: true, caseColumn: 'case_id', parentColumn: null },
  payments: { name: 'payments', tenant: true, caseColumn: null, parentColumn: null },
  custom_field_definitions: { name: 'custom_field_definitions', tenant: true, caseColumn: null, parentColumn: null },
  custom_field_values: { name: 'custom_field_values', tenant: true, caseColumn: null, parentColumn: null },
  status_definitions: { name: 'status_definitions', tenant: true, caseColumn: null, parentColumn: null },
  workflows: { name: 'workflows', tenant: true, caseColumn: null, parentColumn: null },
  workflow_steps: { name: 'workflow_steps', tenant: true, caseColumn: null, parentColumn: null },
};
