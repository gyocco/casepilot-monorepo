import { TenantEntity } from './tenant-entity.js';

export class DocumentVersion extends TenantEntity {
  documentId!: string;
  versionNumber!: number;
  storageKey!: string;
  fileName!: string;
  mimeType!: string;
  sizeBytes!: string;
  checksum!: string | null;
  uploadedByMemberId!: string;
}
