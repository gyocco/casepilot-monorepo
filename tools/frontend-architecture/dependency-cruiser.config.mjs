import { readdirSync, existsSync } from 'node:fs';
import { dependencyConfiguration, WEB_SOURCE } from './dependency-rules.mjs';

const directory = `${WEB_SOURCE}/features`;
const features = existsSync(directory) ? readdirSync(directory, { withFileTypes: true }).filter(item => item.isDirectory()).map(item => item.name) : [];
export default dependencyConfiguration(features);
