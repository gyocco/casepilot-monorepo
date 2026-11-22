import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/persistence/typeorm';
import type { InvoiceLine } from '../../domain/entities/invoice-line.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '@casepilot/persistence/typeorm';
import { TypeOrmInvoiceLineRepository } from '../../infrastructure/persistence/repositories/typeorm-invoice-line.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { TypeOrmUserRepository } from '../../infrastructure/persistence/repositories/typeorm-user.repository.js';
import { TypeOrmUserIdentityRepository } from '../../infrastructure/persistence/repositories/typeorm-user-identity.repository.js';
import { TypeOrmMemberRepository } from '../../infrastructure/persistence/repositories/typeorm-member.repository.js';
import { systemCrudRuntime } from '@casepilot/abstractions/node';
import { CreateInvoiceLineHandler } from '../../application/invoice-lines/create-invoice-line/create-invoice-line.handler.js';
import { GetInvoiceLineHandler } from '../../application/invoice-lines/get-invoice-line/get-invoice-line.handler.js';
import { UpdateInvoiceLineHandler } from '../../application/invoice-lines/update-invoice-line/update-invoice-line.handler.js';
import { DeleteInvoiceLineHandler } from '../../application/invoice-lines/delete-invoice-line/delete-invoice-line.handler.js';
import { ListInvoiceLinesHandler } from '../../application/invoice-lines/list-invoice-lines/list-invoice-lines.handler.js';
import { InvoiceLinesController } from './invoice-lines.controller.js';
const WORK = Symbol('InvoiceLines_WORK');
@Module({
  controllers: [InvoiceLinesController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<InvoiceLine>> =>
        new TypeOrmUnitOfWork<CrudScope<InvoiceLine>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmInvoiceLineRepository(manager), references: new TypeOrmReferenceRepository(manager), users: new TypeOrmUserRepository(manager), userIdentities: new TypeOrmUserIdentityRepository(manager), members: new TypeOrmMemberRepository(manager),
        })),
    },
    {
      provide: CreateInvoiceLineHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<InvoiceLine>>): CreateInvoiceLineHandler => new CreateInvoiceLineHandler(work, systemCrudRuntime),
    },
    {
      provide: GetInvoiceLineHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<InvoiceLine>>): GetInvoiceLineHandler => new GetInvoiceLineHandler(work),
    },
    {
      provide: UpdateInvoiceLineHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<InvoiceLine>>): UpdateInvoiceLineHandler => new UpdateInvoiceLineHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteInvoiceLineHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<InvoiceLine>>): DeleteInvoiceLineHandler => new DeleteInvoiceLineHandler(work),
    },
    {
      provide: ListInvoiceLinesHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<InvoiceLine>>): ListInvoiceLinesHandler => new ListInvoiceLinesHandler(work),
    },
  ],
})
export class InvoiceLinesModule {}
