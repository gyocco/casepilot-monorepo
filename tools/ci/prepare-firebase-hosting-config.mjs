import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function prepareFirebaseHostingConfig({
  sourceConfigPath,
  outputConfigPath,
  siteId,
}) {
  if (typeof siteId !== 'string' || !/^[a-z0-9][a-z0-9-]{2,62}$/.test(siteId.trim())) {
    throw new Error('FIREBASE_HOSTING_SITE must be a valid Firebase Hosting site identifier.');
  }

  const resolvedSource = resolve(sourceConfigPath);
  const resolvedOutput = resolve(outputConfigPath);
  const parsed = JSON.parse(readFileSync(resolvedSource, 'utf8'));

  if (!parsed || typeof parsed !== 'object' || !parsed.hosting || typeof parsed.hosting !== 'object') {
    throw new Error(`Invalid Firebase Hosting config at ${resolvedSource}: missing "hosting" block.`);
  }

  // Re-resolve the `public` directory relative to the generated config's parent directory.
  const absolutePublicDir = resolve(dirname(resolvedSource), parsed.hosting.public);
  const relativePublicDir = relative(dirname(resolvedOutput), absolutePublicDir).replace(/\\/g, '/');

  const generated = {
    ...parsed,
    hosting: {
      ...parsed.hosting,
      site: siteId.trim(),
      public: relativePublicDir,
    },
  };

  mkdirSync(dirname(resolvedOutput), { recursive: true });
  writeFileSync(resolvedOutput, `${JSON.stringify(generated, null, 2)}\n`, 'utf8');
  return { outputConfigPath: resolvedOutput, config: generated };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const sourceConfigPath = process.env.FIREBASE_SOURCE_CONFIG?.trim() || 'deploy/dev/firebase.json';
  const outputConfigPath = process.env.FIREBASE_OUTPUT_CONFIG?.trim() || 'build/firebase.dev.generated.json';
  const siteId = process.env.FIREBASE_HOSTING_SITE?.trim() || '';

  const { outputConfigPath: written } = prepareFirebaseHostingConfig({
    sourceConfigPath,
    outputConfigPath,
    siteId,
  });
  process.stdout.write(`Prepared Firebase Hosting deploy config for site "${siteId}" at ${written}\n`);
}
