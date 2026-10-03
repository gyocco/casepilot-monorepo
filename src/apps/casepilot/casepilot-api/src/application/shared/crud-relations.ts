import { NotFoundError, ValidationError } from '@casepilot/abstractions';
import type { ReferenceRepository } from '../../domain/repositories/reference.repository.js';
import type { ReferenceRecord } from '../../domain/entities/reference-record.js';
import { tenantResourceKinds, type ResourceKind } from '../../domain/entities/resource-kind.js';
import { validateId } from '@casepilot/validation';

// Tenant IDs select public data; they are not authenticated authorization context.
export async function validateTenant(references: ReferenceRepository, tenant: string | null, required: boolean): Promise<void> {
  if (required && tenant === null) throw new ValidationError('A business account is required.');
  if (!required && tenant !== null) throw new ValidationError('This resource is global.');
  if (tenant !== null) {
    validateId(tenant);
    if (!await references.find('business_accounts', tenant, null)) throw new NotFoundError('Business account was not found.');
  }
}

export async function validateReference(references: ReferenceRepository, kind: ResourceKind, id: string | null, tenant: string | null): Promise<ReferenceRecord | null> {
  if (id === null) return null;
  validateId(id);
  const reference = await references.find(kind, id, kind === 'users' ? null : tenant);
  if (!reference || (kind !== 'users' && reference.businessAccountId !== tenant)) throw new ValidationError('The referenced record must exist in the same business account.');
  return reference;
}

export async function validateTarget(references: ReferenceRepository, type: string, id: string, tenant: string): Promise<void> {
  const kind = tenantResourceKinds[type];
  if (!kind) throw new ValidationError('Unsupported tenant entity type.');
  await validateReference(references, kind, id, tenant);
}

export async function validateFolderParent(references: ReferenceRepository, id: string, parentId: string | null, tenant: string): Promise<void> {
  const visited = new Set<string>([id]);
  let current = parentId;
  while (current !== null) {
    if (visited.has(current)) throw new ValidationError('Folder parents must not form a cycle.');
    visited.add(current);
    if (visited.size > 100) throw new ValidationError('Folder nesting exceeds its supported depth.');
    const parent = await validateReference(references, 'folders', current, tenant);
    current = parent?.parentId ?? null;
  }
}
