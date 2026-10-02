import type { DataRepository } from './data.repository.js';
import type { CustomFieldValue } from '../entities/custom-field-value.js';
export interface CustomFieldValueRepository extends DataRepository<CustomFieldValue> {
  readonly entityType?: CustomFieldValue;
}
