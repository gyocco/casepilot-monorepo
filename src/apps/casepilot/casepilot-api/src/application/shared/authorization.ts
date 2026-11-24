import { ForbiddenError, ValidationError } from '@casepilot/abstractions';
import type { VerifiedIdentity } from '@casepilot/auth';
import { validateId } from '@casepilot/validation';
import type { Member } from '../../domain/entities/member.js';
import type { User } from '../../domain/entities/user.js';
import type { AuthorizationScope } from './crud-models.js';

export type AuthorizationAction = 'read' | 'write' | 'admin';

const ALLOWED_ROLES: Readonly<Record<AuthorizationAction, ReadonlySet<string>>> = {
  read: new Set(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']),
  write: new Set(['OWNER', 'ADMIN', 'MEMBER']),
  admin: new Set(['OWNER', 'ADMIN']),
};

function normalizeRole(role: string): string {
  return role.trim().toUpperCase();
}

export async function requireActiveUser(scope: AuthorizationScope, actor: VerifiedIdentity): Promise<User> {
  const identity = await scope.userIdentities.getByProviderSubject(actor.provider, actor.subject);
  if (!identity) {
    throw new ForbiddenError('Authenticated identity is not provisioned in CasePilot.');
  }
  const user = await scope.users.getById(identity.userId, null);
  if (!user || user.status !== 'ACTIVE') {
    throw new ForbiddenError('User account is not active.');
  }
  return user;
}

export async function authorizeTenantAction(
  scope: AuthorizationScope,
  actor: VerifiedIdentity,
  businessAccountId: string | null,
  action: AuthorizationAction,
): Promise<{ readonly user: User; readonly member: Member }> {
  if (businessAccountId === null) {
    throw new ValidationError('A business account is required.');
  }
  validateId(businessAccountId);
  const user = await requireActiveUser(scope, actor);
  const member = await scope.members.getByUserAndAccount(user.id, businessAccountId);
  if (!member || member.status !== 'ACTIVE') {
    throw new ForbiddenError('You do not have access to this business account.');
  }
  if (!ALLOWED_ROLES[action].has(normalizeRole(member.role))) {
    throw new ForbiddenError('Your role does not permit this operation.');
  }
  return { user, member };
}

export async function authorizeBusinessAccountAction(
  scope: AuthorizationScope,
  actor: VerifiedIdentity,
  action: 'create' | 'list' | 'read' | 'admin',
  targetAccountId?: string,
): Promise<{ readonly user: User; readonly activeAccountIds: readonly string[] }> {
  const user = await requireActiveUser(scope, actor);
  if (action === 'create') {
    return { user, activeAccountIds: [] };
  }
  if (action === 'list') {
    const memberships = await scope.members.listByUser(user.id);
    const activeAccountIds = memberships
      .filter(member => member.status === 'ACTIVE' && ALLOWED_ROLES.read.has(normalizeRole(member.role)))
      .map(member => member.businessAccountId);
    return { user, activeAccountIds };
  }
  if (!targetAccountId) {
    throw new ValidationError('A business account identifier is required.');
  }
  validateId(targetAccountId);
  const member = await scope.members.getByUserAndAccount(user.id, targetAccountId);
  if (!member || member.status !== 'ACTIVE') {
    throw new ForbiddenError('You do not have access to this business account.');
  }
  const requiredAction: AuthorizationAction = action === 'admin' ? 'admin' : 'read';
  if (!ALLOWED_ROLES[requiredAction].has(normalizeRole(member.role))) {
    throw new ForbiddenError('Your role does not permit this operation.');
  }
  return { user, activeAccountIds: [targetAccountId] };
}

export async function authorizeUserAction(
  scope: AuthorizationScope,
  actor: VerifiedIdentity,
  action: 'create' | 'list' | 'read' | 'update' | 'delete',
  targetUserId?: string,
): Promise<User> {
  const user = await requireActiveUser(scope, actor);
  if ((action === 'read' || action === 'update' || action === 'delete') && targetUserId === user.id) {
    return user;
  }
  const actorMemberships = await scope.members.listByUser(user.id);
  const adminAccountIds = new Set(
    actorMemberships
      .filter(member => member.status === 'ACTIVE' && ALLOWED_ROLES.admin.has(normalizeRole(member.role)))
      .map(member => member.businessAccountId),
  );
  if (adminAccountIds.size === 0) {
    throw new ForbiddenError('Administrative role is required for this user operation.');
  }
  if (targetUserId && targetUserId !== user.id) {
    validateId(targetUserId);
    const targetMemberships = await scope.members.listByUser(targetUserId);
    const sharesAccount = targetMemberships.some(member => adminAccountIds.has(member.businessAccountId));
    if (targetMemberships.length > 0 && !sharesAccount) {
      throw new ForbiddenError('You do not have administrative access to this user.');
    }
  }
  return user;
}
