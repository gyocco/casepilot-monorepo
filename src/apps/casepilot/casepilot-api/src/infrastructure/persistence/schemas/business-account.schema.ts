import { EntitySchema } from 'typeorm';
import { BusinessAccount } from '../../../domain/entities/business-account.js';
import type { SqlTable } from '@casepilot/persistence/typeorm';
import { sqlString, sqlTimestamp, sqlInteger, sqlChoice, sqlJson } from '@casepilot/persistence/typeorm';
export const business_accountSchema = new EntitySchema<BusinessAccount>({
  name: 'BusinessAccount', target: BusinessAccount, tableName: 'business_accounts',
  columns: {
    id: { name: 'id', type: 'uuid', nullable: false, primary: true, generated: 'uuid', default: () => 'gen_random_uuid()' },
    createdAt: { name: 'created_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    updatedAt: { name: 'updated_at', type: 'timestamptz', nullable: false, default: () => 'now()' },
    version: { name: 'version', type: 'integer', nullable: false, default: 1 },
    name: { name: 'name', type: 'varchar', nullable: false, length: 255 },
    legalName: { name: 'legal_name', type: 'varchar', nullable: true, length: 255 },
    slug: { name: 'slug', type: 'varchar', nullable: true, length: 255 },
    type: { name: 'type', type: 'varchar', nullable: true, length: 255 },
    taxId: { name: 'tax_id', type: 'varchar', nullable: true, length: 255 },
    email: { name: 'email', type: 'varchar', nullable: true, length: 255 },
    phone: { name: 'phone', type: 'varchar', nullable: true, length: 255 },
    website: { name: 'website', type: 'varchar', nullable: true, length: 255 },
    timezone: { name: 'timezone', type: 'varchar', nullable: false, length: 255 },
    locale: { name: 'locale', type: 'varchar', nullable: false, length: 255 },
    currency: { name: 'currency', type: 'varchar', nullable: false, length: 255 },
    countryCode: { name: 'country_code', type: 'varchar', nullable: false, length: 255 },
    status: { name: 'status', type: 'varchar', nullable: false, length: 255 },
    settings: { name: 'settings', type: 'jsonb', nullable: true },
  },
  uniques: [
    { name: 'uq_business_accounts_0', columns: ["slug"] },
  ],
  indices: [
    { name: 'idx_business_accounts_0', columns: ["createdAt","id"] },
  ],
  foreignKeys: [

  ],
});
export const business_accountTable: SqlTable<BusinessAccount> = {
  schema: business_accountSchema, tableName: 'business_accounts', scopeColumn: null,
  idColumn: 'id', versionColumn: 'version', immutableColumns: ['id', 'created_at', 'business_account_id'],
  columns: [
    { property: 'id', name: 'id', value: entity => entity.id },
    { property: 'createdAt', name: 'created_at', value: entity => entity.createdAt },
    { property: 'updatedAt', name: 'updated_at', value: entity => entity.updatedAt },
    { property: 'version', name: 'version', value: entity => entity.version },
    { property: 'name', name: 'name', value: entity => entity.name },
    { property: 'legalName', name: 'legal_name', value: entity => entity.legalName },
    { property: 'slug', name: 'slug', value: entity => entity.slug },
    { property: 'type', name: 'type', value: entity => entity.type },
    { property: 'taxId', name: 'tax_id', value: entity => entity.taxId },
    { property: 'email', name: 'email', value: entity => entity.email },
    { property: 'phone', name: 'phone', value: entity => entity.phone },
    { property: 'website', name: 'website', value: entity => entity.website },
    { property: 'timezone', name: 'timezone', value: entity => entity.timezone },
    { property: 'locale', name: 'locale', value: entity => entity.locale },
    { property: 'currency', name: 'currency', value: entity => entity.currency },
    { property: 'countryCode', name: 'country_code', value: entity => entity.countryCode },
    { property: 'status', name: 'status', value: entity => entity.status },
    { property: 'settings', name: 'settings', json: true, value: entity => entity.settings },
  ],
  read: row => {
    const entity = new BusinessAccount();
    entity.id = sqlString(row.id);
    entity.createdAt = sqlTimestamp(row.createdAt);
    entity.updatedAt = sqlTimestamp(row.updatedAt);
    entity.version = sqlInteger(row.version);
    entity.name = sqlString(row.name);
    entity.legalName = row.legalName === null ? null : sqlString(row.legalName);
    entity.slug = row.slug === null ? null : sqlString(row.slug);
    entity.type = row.type === null ? null : sqlString(row.type);
    entity.taxId = row.taxId === null ? null : sqlString(row.taxId);
    entity.email = row.email === null ? null : sqlString(row.email);
    entity.phone = row.phone === null ? null : sqlString(row.phone);
    entity.website = row.website === null ? null : sqlString(row.website);
    entity.timezone = sqlString(row.timezone);
    entity.locale = sqlString(row.locale);
    entity.currency = sqlString(row.currency);
    entity.countryCode = sqlString(row.countryCode);
    entity.status = sqlChoice(row.status, ['ACTIVE', 'SUSPENDED', 'CLOSED'] as const);
    entity.settings = row.settings === null ? null : sqlJson(row.settings);
    return entity;
  },
};
