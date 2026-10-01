import { Table, type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreateHealthCheckObject1790726400000 implements MigrationInterface {
  readonly name = 'CreateHealthCheckObject1790726400000';

  private schema(queryRunner: QueryRunner): string {
    const options = queryRunner.connection.options;
    if (options.type !== 'postgres') throw new Error('This migration requires PostgreSQL.');
    return options.schema ?? 'public';
  }

  async up(queryRunner: QueryRunner): Promise<void> {
    const schema = this.schema(queryRunner);
    await queryRunner.createTable(new Table({
      name: `${schema}.HealthCheckObject`,
      columns: [
        { name: 'Guid', type: 'uuid', isPrimary: true, isNullable: false, default: 'gen_random_uuid()' },
        { name: 'Value', type: 'text', isNullable: false },
      ],
    }));
    const table = `${queryRunner.connection.driver.escape(schema)}."HealthCheckObject"`;
    await queryRunner.query(`INSERT INTO ${table} ("Guid", "Value") VALUES ($1, $2)`, [
      '00000000-0000-4000-8000-000000000001', 'CasePilot API',
    ]);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(`${this.schema(queryRunner)}.HealthCheckObject`);
  }
}
