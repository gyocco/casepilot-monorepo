import { EntitySchema } from 'typeorm';
import { CaseExternalParty } from '../../../domain/entities/case-external-party.js';
import type { SqlTable } from '@casepilot/persistence/typeorm';
import { sqlString, sqlTimestamp, sqlInteger, sqlBoolean } from '@casepilot/persistence/typeorm';
export const case_external_partySchema = new EntitySchema<CaseExternalParty>({
  name: 'CaseExternalParty', target: CaseExternalParty, tableName: 'case_external_parties',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    caseId: { name: 'case_id', type: 'uuid', nullable: false },
    externalPartyId: { name: 'external_party_id', type: 'uuid', nullable: false },
    role: { name: 'role', type: 'varchar', nullable: false, length: 255 },
    isPrimary: { name: 'is_primary', type: 'boolean', nullable: false },
    notes: { name: 'notes', type: 'text', nullable: true },
  },
  uniques: [
    { name: 'uq_case_external_parties_0', columns: ["businessAccountId","id"] },
    { name: 'uq_case_external_parties_1', columns: ["caseId","externalPartyId","role"] },
  ],
  indices: [
    { name: 'idx_case_external_parties_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_case_external_parties_1', columns: ["businessAccountId","caseId"] },
    { name: 'idx_case_external_parties_2', columns: ["businessAccountId","externalPartyId"] },
  ],
  foreignKeys: [
    { name: 'fk_case_external_parties_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_case_external_parties_case_id', target: 'Case', columnNames: ["businessAccountId","caseId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
    { name: 'fk_case_external_parties_external_party_id', target: 'ExternalParty', columnNames: ["businessAccountId","externalPartyId"], referencedColumnNames: ["businessAccountId","id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const case_external_partyTable: SqlTable<CaseExternalParty> = {
  schema: case_external_partySchema, tableName: 'case_external_parties', scopeColumn: 'business_account_id',
  idColumn: 'id', versionColumn: 'version', immutableColumns: ['id', 'created_at', 'business_account_id'],
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'caseId', name: 'case_id', value: entity => entity.caseId },
    { property: 'externalPartyId', name: 'external_party_id', value: entity => entity.externalPartyId },
    { property: 'role', name: 'role', value: entity => entity.role },
    { property: 'isPrimary', name: 'is_primary', value: entity => entity.isPrimary },
    { property: 'notes', name: 'notes', value: entity => entity.notes },
  ],
  read: row => {
    const entity = new CaseExternalParty();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.caseId = sqlString(row.caseId);
    entity.externalPartyId = sqlString(row.externalPartyId);
    entity.role = sqlString(row.role);
    entity.isPrimary = sqlBoolean(row.isPrimary);
    entity.notes = row.notes === null ? null : sqlString(row.notes);
    return entity;
  },
};
