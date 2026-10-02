import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { loadBackendConfig } from '../config/load-backend-config.js';
import { createDataSourceOptions } from './create-data-source-options.js';

export default new DataSource(createDataSourceOptions(loadBackendConfig().database));
