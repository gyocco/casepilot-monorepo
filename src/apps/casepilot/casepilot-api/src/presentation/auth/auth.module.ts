import { Module } from '@nestjs/common';
import type { UnitOfWork } from '@casepilot/abstractions';
import { systemCrudRuntime } from '@casepilot/abstractions/node';
import { DatabaseConnection, TypeOrmUnitOfWork } from '@casepilot/persistence/typeorm';
import { BootstrapCurrentUserHandler } from '../../application/auth/bootstrap-current-user/bootstrap-current-user.handler.js';
import { GetCurrentUserProfileHandler } from '../../application/auth/get-current-user-profile/get-current-user-profile.handler.js';
import type { AuthScope } from '../../application/auth/shared/current-user-profile.response.js';
import { UpdateCurrentUserProfileHandler } from '../../application/auth/update-current-user-profile/update-current-user-profile.handler.js';
import { TypeOrmBusinessAccountRepository } from '../../infrastructure/persistence/repositories/typeorm-business-account.repository.js';
import { TypeOrmMemberRepository } from '../../infrastructure/persistence/repositories/typeorm-member.repository.js';
import { TypeOrmUserIdentityRepository } from '../../infrastructure/persistence/repositories/typeorm-user-identity.repository.js';
import { TypeOrmUserRepository } from '../../infrastructure/persistence/repositories/typeorm-user.repository.js';
import { AuthController } from './auth.controller.js';

const AUTH_WORK = Symbol('Auth_WORK');

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_WORK,
      inject: [DatabaseConnection],
      useFactory: (connection: DatabaseConnection): UnitOfWork<AuthScope> =>
        new TypeOrmUnitOfWork<AuthScope>(() => connection.getDataSource(), manager => ({
          users: new TypeOrmUserRepository(manager),
          userIdentities: new TypeOrmUserIdentityRepository(manager),
          members: new TypeOrmMemberRepository(manager),
          businessAccounts: new TypeOrmBusinessAccountRepository(manager),
        })),
    },
    {
      provide: BootstrapCurrentUserHandler,
      inject: [AUTH_WORK],
      useFactory: (work: UnitOfWork<AuthScope>): BootstrapCurrentUserHandler =>
        new BootstrapCurrentUserHandler(work, systemCrudRuntime),
    },
    {
      provide: GetCurrentUserProfileHandler,
      inject: [AUTH_WORK],
      useFactory: (work: UnitOfWork<AuthScope>): GetCurrentUserProfileHandler =>
        new GetCurrentUserProfileHandler(work),
    },
    {
      provide: UpdateCurrentUserProfileHandler,
      inject: [AUTH_WORK],
      useFactory: (work: UnitOfWork<AuthScope>): UpdateCurrentUserProfileHandler =>
        new UpdateCurrentUserProfileHandler(work, systemCrudRuntime),
    },
  ],
})
export class AuthModule {}
