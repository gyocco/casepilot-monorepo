import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';
import type { CaseMember } from '../../domain/entities/case-member.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '@casepilot/abstractions/typeorm';
import { TypeOrmCaseMemberRepository } from '../../infrastructure/persistence/repositories/typeorm-case-member.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { systemCrudRuntime } from '@casepilot/abstractions/node';
import { CreateCaseMemberHandler } from '../../application/case-members/create-case-member/create-case-member.handler.js';
import { GetCaseMemberHandler } from '../../application/case-members/get-case-member/get-case-member.handler.js';
import { UpdateCaseMemberHandler } from '../../application/case-members/update-case-member/update-case-member.handler.js';
import { DeleteCaseMemberHandler } from '../../application/case-members/delete-case-member/delete-case-member.handler.js';
import { ListCaseMembersHandler } from '../../application/case-members/list-case-members/list-case-members.handler.js';
import { CaseMembersController } from './case-members.controller.js';
const WORK = Symbol('CaseMembers_WORK');
@Module({
  controllers: [CaseMembersController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<CaseMember>> =>
        new TypeOrmUnitOfWork<CrudScope<CaseMember>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmCaseMemberRepository(manager), references: new TypeOrmReferenceRepository(manager),
        })),
    },
    {
      provide: CreateCaseMemberHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CaseMember>>): CreateCaseMemberHandler => new CreateCaseMemberHandler(work, systemCrudRuntime),
    },
    {
      provide: GetCaseMemberHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CaseMember>>): GetCaseMemberHandler => new GetCaseMemberHandler(work),
    },
    {
      provide: UpdateCaseMemberHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CaseMember>>): UpdateCaseMemberHandler => new UpdateCaseMemberHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteCaseMemberHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CaseMember>>): DeleteCaseMemberHandler => new DeleteCaseMemberHandler(work),
    },
    {
      provide: ListCaseMembersHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<CaseMember>>): ListCaseMembersHandler => new ListCaseMembersHandler(work),
    },
  ],
})
export class CaseMembersModule {}
