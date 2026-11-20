import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { TypeOrmUnitOfWork } from '@casepilot/abstractions/typeorm';
import type { Member } from '../../domain/entities/member.js';
import type { CrudScope } from '../../application/shared/crud-models.js';
import { DatabaseConnection } from '@casepilot/abstractions/typeorm';
import { TypeOrmMemberRepository } from '../../infrastructure/persistence/repositories/typeorm-member.repository.js';
import { TypeOrmReferenceRepository } from '../../infrastructure/persistence/repositories/typeorm-reference.repository.js';
import { TypeOrmUserRepository } from '../../infrastructure/persistence/repositories/typeorm-user.repository.js';
import { TypeOrmUserIdentityRepository } from '../../infrastructure/persistence/repositories/typeorm-user-identity.repository.js';
import { systemCrudRuntime } from '@casepilot/abstractions/node';
import { CreateMemberHandler } from '../../application/members/create-member/create-member.handler.js';
import { GetMemberHandler } from '../../application/members/get-member/get-member.handler.js';
import { UpdateMemberHandler } from '../../application/members/update-member/update-member.handler.js';
import { DeleteMemberHandler } from '../../application/members/delete-member/delete-member.handler.js';
import { ListMembersHandler } from '../../application/members/list-members/list-members.handler.js';
import { MembersController } from './members.controller.js';
const WORK = Symbol('Members_WORK');
@Module({
  controllers: [MembersController],
  providers: [
    {
      provide: WORK, inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<CrudScope<Member>> =>
        new TypeOrmUnitOfWork<CrudScope<Member>>(() => connection.getDataSource(), manager => ({
          resource: new TypeOrmMemberRepository(manager), references: new TypeOrmReferenceRepository(manager), users: new TypeOrmUserRepository(manager), userIdentities: new TypeOrmUserIdentityRepository(manager), members: new TypeOrmMemberRepository(manager),
        })),
    },
    {
      provide: CreateMemberHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Member>>): CreateMemberHandler => new CreateMemberHandler(work, systemCrudRuntime),
    },
    {
      provide: GetMemberHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Member>>): GetMemberHandler => new GetMemberHandler(work),
    },
    {
      provide: UpdateMemberHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Member>>): UpdateMemberHandler => new UpdateMemberHandler(work, systemCrudRuntime),
    },
    {
      provide: DeleteMemberHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Member>>): DeleteMemberHandler => new DeleteMemberHandler(work),
    },
    {
      provide: ListMembersHandler, inject: [WORK],
      useFactory: (work: UnitOfWork<CrudScope<Member>>): ListMembersHandler => new ListMembersHandler(work),
    },
  ],
})
export class MembersModule {}
