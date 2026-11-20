import { Table, TableForeignKey, TableIndex, TableUnique, type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateUserIdentities1790985600000 implements MigrationInterface {
  readonly name = 'CreateUserIdentities1790985600000';

  private schema(queryRunner: QueryRunner): string {
    const options = queryRunner.connection.options;
    if (options.type !== 'postgres') throw new Error('This migration requires PostgreSQL.');
    return options.schema ?? 'public';
  }

  async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.schema(queryRunner);
    const tableName = `${schema}.user_identities`;
    await queryRunner.createTable(new Table({
      name: tableName,
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, isNullable: false, default: 'gen_random_uuid()' },
        { name: 'created_at', type: 'timestamptz', isNullable: false, default: 'now()' },
        { name: 'updated_at', type: 'timestamptz', isNullable: false, default: 'now()' },
        { name: 'version', type: 'integer', isNullable: false, default: '1' },
        { name: 'user_id', type: 'uuid', isNullable: false },
        { name: 'provider', type: 'varchar', length: '64', isNullable: false },
        { name: 'subject', type: 'varchar', length: '255', isNullable: false },
      ],
    }));
    await queryRunner.createUniqueConstraint(tableName, new TableUnique({
      name: 'uq_user_identities_provider_subject',
      columnNames: ['provider', 'subject'],
    }));
    await queryRunner.createIndex(tableName, new TableIndex({
      name: 'idx_user_identities_user_id',
      columnNames: ['user_id'],
    }));
    await queryRunner.createForeignKey(tableName, new TableForeignKey({
      name: 'fk_user_identities_user_id',
      columnNames: ['user_id'],
      referencedTableName: `${schema}.users`,
      referencedColumnNames: ['id'],
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
    }));
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(`${this.schema(queryRunner)}.user_identities`);
  }
}
