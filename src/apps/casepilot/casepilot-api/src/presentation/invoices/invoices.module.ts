import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';
import type { Invoice } from '../../domain/entities/invoice.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '../../infrastructure/database/database-connection.js';
import { TypeOrmInvoiceRepository } from '../../infrastructure/persistence/repositories/typeorm-invoice.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { systemCrudRuntime } from '../../infrastructure/system-crud-runtime.js';
import { CreateInvoiceHandler } from '../../application/invoices/create-invoice.handler.js';
import { GetInvoiceHandler } from '../../application/invoices/get-invoice.handler.js';
import { UpdateInvoiceHandler } from '../../application/invoices/update-invoice.handler.js';
import { DeleteInvoiceHandler } from '../../application/invoices/delete-invoice.handler.js';
import { ListInvoicesHandler } from '../../application/invoices/list-invoices.handler.js';
import { InvoicesController } from './invoices.controller.js';
const WORK = Symbol('Invoices_WORK');
@Module({
  controllers: [InvoicesController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<Invoice>> =>
        new TypeOrmUnitOfWork<CrudScope<Invoice>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmInvoiceRepository(manager), references: new TypeOrmReferenceRepository(manager),
        })),
    },
    {
      provide: CreateInvoiceHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Invoice>>): CreateInvoiceHandler => new CreateInvoiceHandler(work, systemCrudRuntime),
    },
    {
      provide: GetInvoiceHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Invoice>>): GetInvoiceHandler => new GetInvoiceHandler(work),
    },
    {
      provide: UpdateInvoiceHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Invoice>>): UpdateInvoiceHandler => new UpdateInvoiceHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteInvoiceHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Invoice>>): DeleteInvoiceHandler => new DeleteInvoiceHandler(work),
    },
    {
      provide: ListInvoicesHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Invoice>>): ListInvoicesHandler => new ListInvoicesHandler(work),
    },
  ],
})
export class InvoicesModule {}
