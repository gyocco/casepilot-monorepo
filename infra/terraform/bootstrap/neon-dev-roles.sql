-- CasePilot DEV — Least-privilege PostgreSQL roles for Neon PostgreSQL 18.
--
-- Run ONCE against the `casepilot_dev` database in Neon using the Neon owner/admin role
-- (via `psql` or Neon SQL Editor) BEFORE executing the first Cloud Run migration job.
--
-- Replace BOTH placeholder passwords locally in your session before running;
-- NEVER commit real passwords to Git. Store the exact passwords in Google Secret Manager:
--   - `neon-db-migrator-password` -> password of `casepilot_migrator`
--   - `neon-db-runtime-password`  -> password of `casepilot_app`

-- 1. Create dedicated roles (idempotent; update password explicitly if re-running).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'casepilot_migrator') THEN
    CREATE ROLE casepilot_migrator LOGIN PASSWORD 'REPLACE_WITH_STRONG_MIGRATOR_PASSWORD';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'casepilot_app') THEN
    CREATE ROLE casepilot_app LOGIN PASSWORD 'REPLACE_WITH_STRONG_RUNTIME_PASSWORD';
  END IF;
END
$$;

-- 2. Harden public schema: prevent arbitrary PUBLIC object creation.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- 3. Grant database connection to both roles.
GRANT CONNECT ON DATABASE casepilot_dev TO casepilot_migrator;
GRANT CONNECT ON DATABASE casepilot_dev TO casepilot_app;

-- 4. Grant DDL ownership/usage to migrator (creates tables, indices, constraints, migrations table).
GRANT USAGE, CREATE ON SCHEMA public TO casepilot_migrator;

-- 5. Grant minimal DML access to runtime role on existing objects.
GRANT USAGE ON SCHEMA public TO casepilot_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO casepilot_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO casepilot_app;

-- 6. Automatically grant minimal DML privileges to `casepilot_app` on every table/sequence
--    created in the future by `casepilot_migrator` during TypeORM migrations.
--    Note: On managed non-superuser PostgreSQL (e.g., Neon), execute these two statements
--    while connected as `casepilot_migrator` (omitting `FOR ROLE casepilot_migrator`).
ALTER DEFAULT PRIVILEGES FOR ROLE casepilot_migrator IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO casepilot_app;

ALTER DEFAULT PRIVILEGES FOR ROLE casepilot_migrator IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO casepilot_app;
