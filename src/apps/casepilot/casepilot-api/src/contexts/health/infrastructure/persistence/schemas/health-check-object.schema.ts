import { EntitySchema } from 'typeorm';

export interface HealthCheckObjectRow {
  guid: string;
  value: string;
}

export const healthCheckObjectSchema = new EntitySchema<HealthCheckObjectRow>({
  name: 'HealthCheckObject',
  tableName: 'HealthCheckObject',
  columns: {
    guid: { name: 'Guid', type: 'uuid', primary: true, default: () => 'gen_random_uuid()' },
    value: { name: 'Value', type: 'text', nullable: false },
  },
});
