import { EntitySchema } from 'typeorm';
import { ExternalParty } from '../../../domain/entities/external-party.js';
import type { SqlTable } from '../sql-table.js';
import { sqlString, sqlTimestamp, sqlInteger, sqlChoice } from '../sql-values.js';
export const external_partySchema = new EntitySchema<ExternalParty>({
  name: 'ExternalParty', target: ExternalParty, tableName: 'external_parties',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    businessAccountId: { name: 'business_account_id', type: 'uuid', nullable: false },
    type: { name: 'type', type: 'varchar', nullable: false, length: 255 },
    displayName: { name: 'display_name', type: 'varchar', nullable: false, length: 255 },
    firstName: { name: 'first_name', type: 'varchar', nullable: true, length: 255 },
    lastName: { name: 'last_name', type: 'varchar', nullable: true, length: 255 },
    legalName: { name: 'legal_name', type: 'varchar', nullable: true, length: 255 },
    taxId: { name: 'tax_id', type: 'varchar', nullable: true, length: 255 },
    email: { name: 'email', type: 'varchar', nullable: true, length: 255 },
    phone: { name: 'phone', type: 'varchar', nullable: true, length: 255 },
    website: { name: 'website', type: 'varchar', nullable: true, length: 255 },
    addressLine_1: { name: 'address_line_1', type: 'varchar', nullable: true, length: 255 },
    addressLine_2: { name: 'address_line_2', type: 'varchar', nullable: true, length: 255 },
    city: { name: 'city', type: 'varchar', nullable: true, length: 255 },
    region: { name: 'region', type: 'varchar', nullable: true, length: 255 },
    postalCode: { name: 'postal_code', type: 'varchar', nullable: true, length: 255 },
    countryCode: { name: 'country_code', type: 'varchar', nullable: true, length: 255 },
    notes: { name: 'notes', type: 'text', nullable: true },
    status: { name: 'status', type: 'varchar', nullable: true, length: 255 },
  },
  uniques: [
    { name: 'uq_external_parties_0', columns: ["businessAccountId","id"] },
  ],
  indices: [
    { name: 'idx_external_parties_0', columns: ["businessAccountId","createdAt","id"] },
    { name: 'idx_external_parties_1', columns: ["businessAccountId","displayName"] },
    { name: 'idx_external_parties_2', columns: ["businessAccountId","taxId"] },
  ],
  foreignKeys: [
    { name: 'fk_external_parties_account', target: 'BusinessAccount', columnNames: ["businessAccountId"], referencedColumnNames: ["id"], onDelete: 'NO ACTION', onUpdate: 'NO ACTION' },
  ],
});
export const external_partyTable: SqlTable<ExternalParty> = {
  schema: external_partySchema, tableName: 'external_parties', tenant: true,
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'businessAccountId', name: 'business_account_id', value: entity => entity.businessAccountId },
    { property: 'type', name: 'type', value: entity => entity.type },
    { property: 'displayName', name: 'display_name', value: entity => entity.displayName },
    { property: 'firstName', name: 'first_name', value: entity => entity.firstName },
    { property: 'lastName', name: 'last_name', value: entity => entity.lastName },
    { property: 'legalName', name: 'legal_name', value: entity => entity.legalName },
    { property: 'taxId', name: 'tax_id', value: entity => entity.taxId },
    { property: 'email', name: 'email', value: entity => entity.email },
    { property: 'phone', name: 'phone', value: entity => entity.phone },
    { property: 'website', name: 'website', value: entity => entity.website },
    { property: 'addressLine_1', name: 'address_line_1', value: entity => entity.addressLine_1 },
    { property: 'addressLine_2', name: 'address_line_2', value: entity => entity.addressLine_2 },
    { property: 'city', name: 'city', value: entity => entity.city },
    { property: 'region', name: 'region', value: entity => entity.region },
    { property: 'postalCode', name: 'postal_code', value: entity => entity.postalCode },
    { property: 'countryCode', name: 'country_code', value: entity => entity.countryCode },
    { property: 'notes', name: 'notes', value: entity => entity.notes },
    { property: 'status', name: 'status', value: entity => entity.status },
  ],
  read: row => {
    const entity = new ExternalParty();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.businessAccountId = sqlString(row.businessAccountId);
    entity.type = sqlChoice(row.type, ['PERSON', 'ORGANIZATION'] as const);
    entity.displayName = sqlString(row.displayName);
    entity.firstName = row.firstName === null ? null : sqlString(row.firstName);
    entity.lastName = row.lastName === null ? null : sqlString(row.lastName);
    entity.legalName = row.legalName === null ? null : sqlString(row.legalName);
    entity.taxId = row.taxId === null ? null : sqlString(row.taxId);
    entity.email = row.email === null ? null : sqlString(row.email);
    entity.phone = row.phone === null ? null : sqlString(row.phone);
    entity.website = row.website === null ? null : sqlString(row.website);
    entity.addressLine_1 = row.addressLine_1 === null ? null : sqlString(row.addressLine_1);
    entity.addressLine_2 = row.addressLine_2 === null ? null : sqlString(row.addressLine_2);
    entity.city = row.city === null ? null : sqlString(row.city);
    entity.region = row.region === null ? null : sqlString(row.region);
    entity.postalCode = row.postalCode === null ? null : sqlString(row.postalCode);
    entity.countryCode = row.countryCode === null ? null : sqlString(row.countryCode);
    entity.notes = row.notes === null ? null : sqlString(row.notes);
    entity.status = row.status === null ? null : sqlChoice(row.status, ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const);
    return entity;
  },
};
