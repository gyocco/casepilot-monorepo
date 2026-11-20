import { Module } from '@nestjs/common';
import { AuthModule } from './presentation/auth/auth.module.js';
import { HealthModule } from './presentation/health/health.module.js';
import { UsersModule } from './presentation/users/users.module.js';
import { BusinessAccountsModule } from './presentation/business-accounts/business-accounts.module.js';
import { MembersModule } from './presentation/members/members.module.js';
import { ExternalPartiesModule } from './presentation/external-parties/external-parties.module.js';
import { CasesModule } from './presentation/cases/cases.module.js';
import { CaseTypesModule } from './presentation/case-types/case-types.module.js';
import { CaseExternalPartiesModule } from './presentation/case-external-parties/case-external-parties.module.js';
import { CaseMembersModule } from './presentation/case-members/case-members.module.js';
import { TasksModule } from './presentation/tasks/tasks.module.js';
import { EventsModule } from './presentation/events/events.module.js';
import { DeadlinesModule } from './presentation/deadlines/deadlines.module.js';
import { FoldersModule } from './presentation/folders/folders.module.js';
import { DocumentsModule } from './presentation/documents/documents.module.js';
import { DocumentVersionsModule } from './presentation/document-versions/document-versions.module.js';
import { NotesModule } from './presentation/notes/notes.module.js';
import { CommentsModule } from './presentation/comments/comments.module.js';
import { CommunicationsModule } from './presentation/communications/communications.module.js';
import { ActivitiesModule } from './presentation/activities/activities.module.js';
import { TimeEntriesModule } from './presentation/time-entries/time-entries.module.js';
import { ExpensesModule } from './presentation/expenses/expenses.module.js';
import { InvoicesModule } from './presentation/invoices/invoices.module.js';
import { InvoiceLinesModule } from './presentation/invoice-lines/invoice-lines.module.js';
import { PaymentsModule } from './presentation/payments/payments.module.js';
import { CustomFieldDefinitionsModule } from './presentation/custom-field-definitions/custom-field-definitions.module.js';
import { CustomFieldValuesModule } from './presentation/custom-field-values/custom-field-values.module.js';
import { StatusDefinitionsModule } from './presentation/status-definitions/status-definitions.module.js';
import { WorkflowsModule } from './presentation/workflows/workflows.module.js';
import { WorkflowStepsModule } from './presentation/workflow-steps/workflow-steps.module.js';

// Register each resource module once; its endpoints and bindings stay in that module.
@Module({
  imports: [HealthModule, AuthModule, UsersModule, BusinessAccountsModule, MembersModule, ExternalPartiesModule, CasesModule, CaseTypesModule, CaseExternalPartiesModule, CaseMembersModule, TasksModule, EventsModule, DeadlinesModule, FoldersModule, DocumentsModule, DocumentVersionsModule, NotesModule, CommentsModule, CommunicationsModule, ActivitiesModule, TimeEntriesModule, ExpensesModule, InvoicesModule, InvoiceLinesModule, PaymentsModule, CustomFieldDefinitionsModule, CustomFieldValuesModule, StatusDefinitionsModule, WorkflowsModule, WorkflowStepsModule],
})
export class ApiModule {}
