import { Table, TableForeignKey, TableIndex, type TableColumnOptions, type MigrationInterface, type QueryRunner } from 'typeorm';

interface SnapshotTable {
  readonly name: string;
  readonly columns: TableColumnOptions[];
  readonly uniques: { name: string; columnNames: string[] }[];
  readonly indices: { name: string; columnNames: string[] }[];
  readonly foreignKeys: { name: string; columnNames: string[]; referencedTableName: string; referencedColumnNames: string[] }[];
}
// Immutable snapshot: future schema edits must not change this migration.
const tables: readonly SnapshotTable[] = [
  {
    "name": "users",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "email",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "email_verified_at",
        "type": "timestamptz",
        "isNullable": true
      },
      {
        "name": "first_name",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "last_name",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "display_name",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "avatar_url",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "locale",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "timezone",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "status",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "last_login_at",
        "type": "timestamptz",
        "isNullable": true
      }
    ],
    "uniques": [
      {
        "name": "uq_users_0",
        "columnNames": [
          "email"
        ]
      }
    ],
    "foreignKeys": [],
    "indices": [
      {
        "name": "idx_users_0",
        "columnNames": [
          "created_at",
          "id"
        ]
      }
    ]
  },
  {
    "name": "business_accounts",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "name",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "legal_name",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "slug",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "type",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "tax_id",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "email",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "phone",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "website",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "timezone",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "locale",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "currency",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "country_code",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "status",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "settings",
        "type": "jsonb",
        "isNullable": true
      }
    ],
    "uniques": [
      {
        "name": "uq_business_accounts_0",
        "columnNames": [
          "slug"
        ]
      }
    ],
    "foreignKeys": [],
    "indices": [
      {
        "name": "idx_business_accounts_0",
        "columnNames": [
          "created_at",
          "id"
        ]
      }
    ]
  },
  {
    "name": "members",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "user_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "role",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "status",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "title",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "professional_registration",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "hourly_rate",
        "type": "numeric",
        "isNullable": true,
        "precision": 20,
        "scale": 4
      },
      {
        "name": "joined_at",
        "type": "timestamptz",
        "isNullable": true
      },
      {
        "name": "invited_at",
        "type": "timestamptz",
        "isNullable": true
      }
    ],
    "uniques": [
      {
        "name": "uq_members_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "uq_members_1",
        "columnNames": [
          "business_account_id",
          "user_id"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_members_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      },
      {
        "name": "fk_members_user_id",
        "columnNames": [
          "user_id"
        ],
        "referencedTableName": "users",
        "referencedColumnNames": [
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_members_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_members_1",
        "columnNames": [
          "business_account_id",
          "user_id"
        ]
      }
    ]
  },
  {
    "name": "external_parties",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "type",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "display_name",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "first_name",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "last_name",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "legal_name",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "tax_id",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "email",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "phone",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "website",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "address_line_1",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "address_line_2",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "city",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "region",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "postal_code",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "country_code",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "notes",
        "type": "text",
        "isNullable": true
      },
      {
        "name": "status",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      }
    ],
    "uniques": [
      {
        "name": "uq_external_parties_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_external_parties_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_external_parties_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_external_parties_1",
        "columnNames": [
          "business_account_id",
          "display_name"
        ]
      },
      {
        "name": "idx_external_parties_2",
        "columnNames": [
          "business_account_id",
          "tax_id"
        ]
      }
    ]
  },
  {
    "name": "cases",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "case_type_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "number",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "external_reference",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "title",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "description",
        "type": "text",
        "isNullable": true
      },
      {
        "name": "status",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "priority",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "opened_at",
        "type": "timestamptz",
        "isNullable": true
      },
      {
        "name": "closed_at",
        "type": "timestamptz",
        "isNullable": true
      },
      {
        "name": "responsible_member_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "billing_type",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "hourly_rate",
        "type": "numeric",
        "isNullable": true,
        "precision": 20,
        "scale": 4
      },
      {
        "name": "currency",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "created_by_member_id",
        "type": "uuid",
        "isNullable": false
      }
    ],
    "uniques": [
      {
        "name": "uq_cases_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "uq_cases_1",
        "columnNames": [
          "business_account_id",
          "number"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_cases_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      },
      {
        "name": "fk_cases_case_type_id",
        "columnNames": [
          "business_account_id",
          "case_type_id"
        ],
        "referencedTableName": "case_types",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_cases_responsible_member_id",
        "columnNames": [
          "business_account_id",
          "responsible_member_id"
        ],
        "referencedTableName": "members",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_cases_created_by_member_id",
        "columnNames": [
          "business_account_id",
          "created_by_member_id"
        ],
        "referencedTableName": "members",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_cases_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_cases_1",
        "columnNames": [
          "business_account_id",
          "status"
        ]
      },
      {
        "name": "idx_cases_2",
        "columnNames": [
          "business_account_id",
          "case_type_id"
        ]
      },
      {
        "name": "idx_cases_3",
        "columnNames": [
          "business_account_id",
          "responsible_member_id"
        ]
      },
      {
        "name": "idx_cases_4",
        "columnNames": [
          "business_account_id",
          "created_by_member_id"
        ]
      }
    ]
  },
  {
    "name": "case_types",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "name",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "description",
        "type": "text",
        "isNullable": true
      },
      {
        "name": "code",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "is_active",
        "type": "boolean",
        "isNullable": false
      },
      {
        "name": "default_workflow_id",
        "type": "uuid",
        "isNullable": true
      }
    ],
    "uniques": [
      {
        "name": "uq_case_types_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_case_types_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      },
      {
        "name": "fk_case_types_default_workflow_id",
        "columnNames": [
          "business_account_id",
          "default_workflow_id"
        ],
        "referencedTableName": "workflows",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_case_types_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_case_types_1",
        "columnNames": [
          "business_account_id",
          "default_workflow_id"
        ]
      }
    ]
  },
  {
    "name": "case_external_parties",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "case_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "external_party_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "role",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "is_primary",
        "type": "boolean",
        "isNullable": false
      },
      {
        "name": "notes",
        "type": "text",
        "isNullable": true
      }
    ],
    "uniques": [
      {
        "name": "uq_case_external_parties_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "uq_case_external_parties_1",
        "columnNames": [
          "case_id",
          "external_party_id",
          "role"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_case_external_parties_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      },
      {
        "name": "fk_case_external_parties_case_id",
        "columnNames": [
          "business_account_id",
          "case_id"
        ],
        "referencedTableName": "cases",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_case_external_parties_external_party_id",
        "columnNames": [
          "business_account_id",
          "external_party_id"
        ],
        "referencedTableName": "external_parties",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_case_external_parties_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_case_external_parties_1",
        "columnNames": [
          "business_account_id",
          "case_id"
        ]
      },
      {
        "name": "idx_case_external_parties_2",
        "columnNames": [
          "business_account_id",
          "external_party_id"
        ]
      }
    ]
  },
  {
    "name": "case_members",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "case_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "member_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "role",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "is_primary",
        "type": "boolean",
        "isNullable": false
      },
      {
        "name": "assigned_at",
        "type": "timestamptz",
        "isNullable": false
      },
      {
        "name": "removed_at",
        "type": "timestamptz",
        "isNullable": true
      }
    ],
    "uniques": [
      {
        "name": "uq_case_members_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "uq_case_members_1",
        "columnNames": [
          "case_id",
          "member_id"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_case_members_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      },
      {
        "name": "fk_case_members_case_id",
        "columnNames": [
          "business_account_id",
          "case_id"
        ],
        "referencedTableName": "cases",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_case_members_member_id",
        "columnNames": [
          "business_account_id",
          "member_id"
        ],
        "referencedTableName": "members",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_case_members_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_case_members_1",
        "columnNames": [
          "business_account_id",
          "case_id"
        ]
      },
      {
        "name": "idx_case_members_2",
        "columnNames": [
          "business_account_id",
          "member_id"
        ]
      }
    ]
  },
  {
    "name": "tasks",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "case_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "title",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "description",
        "type": "text",
        "isNullable": true
      },
      {
        "name": "status",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "priority",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "assigned_member_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "created_by_member_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "due_at",
        "type": "timestamptz",
        "isNullable": true
      },
      {
        "name": "completed_at",
        "type": "timestamptz",
        "isNullable": true
      }
    ],
    "uniques": [
      {
        "name": "uq_tasks_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "uq_tasks_1",
        "columnNames": [
          "business_account_id",
          "id",
          "case_id"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_tasks_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      },
      {
        "name": "fk_tasks_case_id",
        "columnNames": [
          "business_account_id",
          "case_id"
        ],
        "referencedTableName": "cases",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_tasks_assigned_member_id",
        "columnNames": [
          "business_account_id",
          "assigned_member_id"
        ],
        "referencedTableName": "members",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_tasks_created_by_member_id",
        "columnNames": [
          "business_account_id",
          "created_by_member_id"
        ],
        "referencedTableName": "members",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_tasks_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_tasks_1",
        "columnNames": [
          "business_account_id",
          "assigned_member_id",
          "status"
        ]
      },
      {
        "name": "idx_tasks_2",
        "columnNames": [
          "case_id",
          "status"
        ]
      },
      {
        "name": "idx_tasks_3",
        "columnNames": [
          "due_at"
        ]
      },
      {
        "name": "idx_tasks_4",
        "columnNames": [
          "business_account_id",
          "case_id"
        ]
      },
      {
        "name": "idx_tasks_5",
        "columnNames": [
          "business_account_id",
          "assigned_member_id"
        ]
      },
      {
        "name": "idx_tasks_6",
        "columnNames": [
          "business_account_id",
          "created_by_member_id"
        ]
      }
    ]
  },
  {
    "name": "events",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "case_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "title",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "description",
        "type": "text",
        "isNullable": true
      },
      {
        "name": "event_type",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "starts_at",
        "type": "timestamptz",
        "isNullable": false
      },
      {
        "name": "ends_at",
        "type": "timestamptz",
        "isNullable": true
      },
      {
        "name": "all_day",
        "type": "boolean",
        "isNullable": false
      },
      {
        "name": "location",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "created_by_member_id",
        "type": "uuid",
        "isNullable": false
      }
    ],
    "uniques": [
      {
        "name": "uq_events_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_events_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      },
      {
        "name": "fk_events_case_id",
        "columnNames": [
          "business_account_id",
          "case_id"
        ],
        "referencedTableName": "cases",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_events_created_by_member_id",
        "columnNames": [
          "business_account_id",
          "created_by_member_id"
        ],
        "referencedTableName": "members",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_events_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_events_1",
        "columnNames": [
          "business_account_id",
          "case_id"
        ]
      },
      {
        "name": "idx_events_2",
        "columnNames": [
          "business_account_id",
          "created_by_member_id"
        ]
      }
    ]
  },
  {
    "name": "deadlines",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "case_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "title",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "due_at",
        "type": "timestamptz",
        "isNullable": false
      },
      {
        "name": "status",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "responsible_member_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "completed_at",
        "type": "timestamptz",
        "isNullable": true
      },
      {
        "name": "notes",
        "type": "text",
        "isNullable": true
      }
    ],
    "uniques": [
      {
        "name": "uq_deadlines_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_deadlines_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      },
      {
        "name": "fk_deadlines_case_id",
        "columnNames": [
          "business_account_id",
          "case_id"
        ],
        "referencedTableName": "cases",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_deadlines_responsible_member_id",
        "columnNames": [
          "business_account_id",
          "responsible_member_id"
        ],
        "referencedTableName": "members",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_deadlines_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_deadlines_1",
        "columnNames": [
          "business_account_id",
          "due_at",
          "status"
        ]
      },
      {
        "name": "idx_deadlines_2",
        "columnNames": [
          "business_account_id",
          "case_id"
        ]
      },
      {
        "name": "idx_deadlines_3",
        "columnNames": [
          "business_account_id",
          "responsible_member_id"
        ]
      }
    ]
  },
  {
    "name": "folders",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "case_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "parent_folder_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "name",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "created_by_member_id",
        "type": "uuid",
        "isNullable": false
      }
    ],
    "uniques": [
      {
        "name": "uq_folders_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_folders_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      },
      {
        "name": "fk_folders_case_id",
        "columnNames": [
          "business_account_id",
          "case_id"
        ],
        "referencedTableName": "cases",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_folders_parent_folder_id",
        "columnNames": [
          "business_account_id",
          "parent_folder_id"
        ],
        "referencedTableName": "folders",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_folders_created_by_member_id",
        "columnNames": [
          "business_account_id",
          "created_by_member_id"
        ],
        "referencedTableName": "members",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_folders_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_folders_1",
        "columnNames": [
          "business_account_id",
          "case_id"
        ]
      },
      {
        "name": "idx_folders_2",
        "columnNames": [
          "business_account_id",
          "parent_folder_id"
        ]
      },
      {
        "name": "idx_folders_3",
        "columnNames": [
          "business_account_id",
          "created_by_member_id"
        ]
      }
    ]
  },
  {
    "name": "documents",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "case_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "external_party_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "folder_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "name",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "description",
        "type": "text",
        "isNullable": true
      },
      {
        "name": "document_type",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "current_version_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "created_by_member_id",
        "type": "uuid",
        "isNullable": false
      }
    ],
    "uniques": [
      {
        "name": "uq_documents_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_documents_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      },
      {
        "name": "fk_documents_case_id",
        "columnNames": [
          "business_account_id",
          "case_id"
        ],
        "referencedTableName": "cases",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_documents_external_party_id",
        "columnNames": [
          "business_account_id",
          "external_party_id"
        ],
        "referencedTableName": "external_parties",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_documents_folder_id",
        "columnNames": [
          "business_account_id",
          "folder_id"
        ],
        "referencedTableName": "folders",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_documents_current_version_id",
        "columnNames": [
          "business_account_id",
          "current_version_id",
          "id"
        ],
        "referencedTableName": "document_versions",
        "referencedColumnNames": [
          "business_account_id",
          "id",
          "document_id"
        ]
      },
      {
        "name": "fk_documents_created_by_member_id",
        "columnNames": [
          "business_account_id",
          "created_by_member_id"
        ],
        "referencedTableName": "members",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_documents_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_documents_1",
        "columnNames": [
          "business_account_id",
          "case_id"
        ]
      },
      {
        "name": "idx_documents_2",
        "columnNames": [
          "business_account_id",
          "external_party_id"
        ]
      },
      {
        "name": "idx_documents_3",
        "columnNames": [
          "business_account_id",
          "folder_id"
        ]
      },
      {
        "name": "idx_documents_4",
        "columnNames": [
          "business_account_id",
          "current_version_id"
        ]
      },
      {
        "name": "idx_documents_5",
        "columnNames": [
          "business_account_id",
          "created_by_member_id"
        ]
      }
    ]
  },
  {
    "name": "document_versions",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "document_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "version_number",
        "type": "integer",
        "isNullable": false
      },
      {
        "name": "storage_key",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "file_name",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "mime_type",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "size_bytes",
        "type": "bigint",
        "isNullable": false
      },
      {
        "name": "checksum",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "uploaded_by_member_id",
        "type": "uuid",
        "isNullable": false
      }
    ],
    "uniques": [
      {
        "name": "uq_document_versions_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "uq_document_versions_1",
        "columnNames": [
          "document_id",
          "version_number"
        ]
      },
      {
        "name": "uq_document_versions_2",
        "columnNames": [
          "business_account_id",
          "id",
          "document_id"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_document_versions_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      },
      {
        "name": "fk_document_versions_document_id",
        "columnNames": [
          "business_account_id",
          "document_id"
        ],
        "referencedTableName": "documents",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_document_versions_uploaded_by_member_id",
        "columnNames": [
          "business_account_id",
          "uploaded_by_member_id"
        ],
        "referencedTableName": "members",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_document_versions_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_document_versions_1",
        "columnNames": [
          "business_account_id",
          "document_id"
        ]
      },
      {
        "name": "idx_document_versions_2",
        "columnNames": [
          "business_account_id",
          "uploaded_by_member_id"
        ]
      }
    ]
  },
  {
    "name": "notes",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "case_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "external_party_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "author_member_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "title",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "body",
        "type": "text",
        "isNullable": false
      },
      {
        "name": "is_private",
        "type": "boolean",
        "isNullable": false
      }
    ],
    "uniques": [
      {
        "name": "uq_notes_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_notes_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      },
      {
        "name": "fk_notes_case_id",
        "columnNames": [
          "business_account_id",
          "case_id"
        ],
        "referencedTableName": "cases",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_notes_external_party_id",
        "columnNames": [
          "business_account_id",
          "external_party_id"
        ],
        "referencedTableName": "external_parties",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_notes_author_member_id",
        "columnNames": [
          "business_account_id",
          "author_member_id"
        ],
        "referencedTableName": "members",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_notes_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_notes_1",
        "columnNames": [
          "business_account_id",
          "case_id"
        ]
      },
      {
        "name": "idx_notes_2",
        "columnNames": [
          "business_account_id",
          "external_party_id"
        ]
      },
      {
        "name": "idx_notes_3",
        "columnNames": [
          "business_account_id",
          "author_member_id"
        ]
      }
    ]
  },
  {
    "name": "comments",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "author_member_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "target_type",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "target_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "body",
        "type": "text",
        "isNullable": false
      }
    ],
    "uniques": [
      {
        "name": "uq_comments_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_comments_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      },
      {
        "name": "fk_comments_author_member_id",
        "columnNames": [
          "business_account_id",
          "author_member_id"
        ],
        "referencedTableName": "members",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_comments_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_comments_1",
        "columnNames": [
          "business_account_id",
          "author_member_id"
        ]
      }
    ]
  },
  {
    "name": "communications",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "case_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "external_party_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "member_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "type",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "direction",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "subject",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "body",
        "type": "text",
        "isNullable": true
      },
      {
        "name": "occurred_at",
        "type": "timestamptz",
        "isNullable": false
      },
      {
        "name": "external_reference",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      }
    ],
    "uniques": [
      {
        "name": "uq_communications_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_communications_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      },
      {
        "name": "fk_communications_case_id",
        "columnNames": [
          "business_account_id",
          "case_id"
        ],
        "referencedTableName": "cases",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_communications_external_party_id",
        "columnNames": [
          "business_account_id",
          "external_party_id"
        ],
        "referencedTableName": "external_parties",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_communications_member_id",
        "columnNames": [
          "business_account_id",
          "member_id"
        ],
        "referencedTableName": "members",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_communications_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_communications_1",
        "columnNames": [
          "business_account_id",
          "case_id"
        ]
      },
      {
        "name": "idx_communications_2",
        "columnNames": [
          "business_account_id",
          "external_party_id"
        ]
      },
      {
        "name": "idx_communications_3",
        "columnNames": [
          "business_account_id",
          "member_id"
        ]
      }
    ]
  },
  {
    "name": "activities",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "actor_member_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "action",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "entity_type",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "entity_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "case_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "metadata",
        "type": "jsonb",
        "isNullable": true
      },
      {
        "name": "occurred_at",
        "type": "timestamptz",
        "isNullable": false
      }
    ],
    "uniques": [
      {
        "name": "uq_activities_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_activities_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      },
      {
        "name": "fk_activities_actor_member_id",
        "columnNames": [
          "business_account_id",
          "actor_member_id"
        ],
        "referencedTableName": "members",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_activities_case_id",
        "columnNames": [
          "business_account_id",
          "case_id"
        ],
        "referencedTableName": "cases",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_activities_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_activities_1",
        "columnNames": [
          "business_account_id",
          "actor_member_id"
        ]
      },
      {
        "name": "idx_activities_2",
        "columnNames": [
          "business_account_id",
          "case_id"
        ]
      }
    ]
  },
  {
    "name": "time_entries",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "case_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "member_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "task_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "description",
        "type": "text",
        "isNullable": true
      },
      {
        "name": "started_at",
        "type": "timestamptz",
        "isNullable": true
      },
      {
        "name": "ended_at",
        "type": "timestamptz",
        "isNullable": true
      },
      {
        "name": "duration_minutes",
        "type": "integer",
        "isNullable": false
      },
      {
        "name": "billable",
        "type": "boolean",
        "isNullable": false
      },
      {
        "name": "hourly_rate",
        "type": "numeric",
        "isNullable": true,
        "precision": 20,
        "scale": 4
      },
      {
        "name": "currency",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "invoice_line_id",
        "type": "uuid",
        "isNullable": true
      }
    ],
    "uniques": [
      {
        "name": "uq_time_entries_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_time_entries_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      },
      {
        "name": "fk_time_entries_case_id",
        "columnNames": [
          "business_account_id",
          "case_id"
        ],
        "referencedTableName": "cases",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_time_entries_member_id",
        "columnNames": [
          "business_account_id",
          "member_id"
        ],
        "referencedTableName": "members",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_time_entries_task_id",
        "columnNames": [
          "business_account_id",
          "task_id"
        ],
        "referencedTableName": "tasks",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_time_entries_invoice_line_id",
        "columnNames": [
          "business_account_id",
          "invoice_line_id"
        ],
        "referencedTableName": "invoice_lines",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_time_entries_task_case",
        "columnNames": [
          "business_account_id",
          "task_id",
          "case_id"
        ],
        "referencedTableName": "tasks",
        "referencedColumnNames": [
          "business_account_id",
          "id",
          "case_id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_time_entries_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_time_entries_1",
        "columnNames": [
          "case_id",
          "member_id"
        ]
      },
      {
        "name": "idx_time_entries_2",
        "columnNames": [
          "business_account_id",
          "case_id"
        ]
      },
      {
        "name": "idx_time_entries_3",
        "columnNames": [
          "business_account_id",
          "member_id"
        ]
      },
      {
        "name": "idx_time_entries_4",
        "columnNames": [
          "business_account_id",
          "task_id"
        ]
      },
      {
        "name": "idx_time_entries_5",
        "columnNames": [
          "business_account_id",
          "invoice_line_id"
        ]
      }
    ]
  },
  {
    "name": "expenses",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "case_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "member_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "description",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "amount",
        "type": "numeric",
        "isNullable": false,
        "precision": 20,
        "scale": 4
      },
      {
        "name": "currency",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "occurred_on",
        "type": "date",
        "isNullable": false
      },
      {
        "name": "billable",
        "type": "boolean",
        "isNullable": false
      },
      {
        "name": "invoice_line_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "document_id",
        "type": "uuid",
        "isNullable": true
      }
    ],
    "uniques": [
      {
        "name": "uq_expenses_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_expenses_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      },
      {
        "name": "fk_expenses_case_id",
        "columnNames": [
          "business_account_id",
          "case_id"
        ],
        "referencedTableName": "cases",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_expenses_member_id",
        "columnNames": [
          "business_account_id",
          "member_id"
        ],
        "referencedTableName": "members",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_expenses_invoice_line_id",
        "columnNames": [
          "business_account_id",
          "invoice_line_id"
        ],
        "referencedTableName": "invoice_lines",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_expenses_document_id",
        "columnNames": [
          "business_account_id",
          "document_id"
        ],
        "referencedTableName": "documents",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_expenses_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_expenses_1",
        "columnNames": [
          "business_account_id",
          "case_id"
        ]
      },
      {
        "name": "idx_expenses_2",
        "columnNames": [
          "business_account_id",
          "member_id"
        ]
      },
      {
        "name": "idx_expenses_3",
        "columnNames": [
          "business_account_id",
          "invoice_line_id"
        ]
      },
      {
        "name": "idx_expenses_4",
        "columnNames": [
          "business_account_id",
          "document_id"
        ]
      }
    ]
  },
  {
    "name": "invoices",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "external_party_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "case_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "number",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "status",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "currency",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "issue_date",
        "type": "date",
        "isNullable": false
      },
      {
        "name": "due_date",
        "type": "date",
        "isNullable": true
      },
      {
        "name": "subtotal",
        "type": "numeric",
        "isNullable": false,
        "precision": 20,
        "scale": 4
      },
      {
        "name": "tax_amount",
        "type": "numeric",
        "isNullable": false,
        "precision": 20,
        "scale": 4
      },
      {
        "name": "total",
        "type": "numeric",
        "isNullable": false,
        "precision": 20,
        "scale": 4
      },
      {
        "name": "balance_due",
        "type": "numeric",
        "isNullable": false,
        "precision": 20,
        "scale": 4
      },
      {
        "name": "notes",
        "type": "text",
        "isNullable": true
      }
    ],
    "uniques": [
      {
        "name": "uq_invoices_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "uq_invoices_1",
        "columnNames": [
          "business_account_id",
          "number"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_invoices_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      },
      {
        "name": "fk_invoices_external_party_id",
        "columnNames": [
          "business_account_id",
          "external_party_id"
        ],
        "referencedTableName": "external_parties",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_invoices_case_id",
        "columnNames": [
          "business_account_id",
          "case_id"
        ],
        "referencedTableName": "cases",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_invoices_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_invoices_1",
        "columnNames": [
          "business_account_id",
          "status"
        ]
      },
      {
        "name": "idx_invoices_2",
        "columnNames": [
          "external_party_id"
        ]
      },
      {
        "name": "idx_invoices_3",
        "columnNames": [
          "business_account_id",
          "external_party_id"
        ]
      },
      {
        "name": "idx_invoices_4",
        "columnNames": [
          "business_account_id",
          "case_id"
        ]
      }
    ]
  },
  {
    "name": "invoice_lines",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "invoice_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "case_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "description",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "quantity",
        "type": "numeric",
        "isNullable": false,
        "precision": 20,
        "scale": 4
      },
      {
        "name": "unit_price",
        "type": "numeric",
        "isNullable": false,
        "precision": 20,
        "scale": 4
      },
      {
        "name": "tax_rate",
        "type": "numeric",
        "isNullable": true,
        "precision": 20,
        "scale": 4
      },
      {
        "name": "subtotal",
        "type": "numeric",
        "isNullable": false,
        "precision": 20,
        "scale": 4
      },
      {
        "name": "total",
        "type": "numeric",
        "isNullable": false,
        "precision": 20,
        "scale": 4
      },
      {
        "name": "sort_order",
        "type": "integer",
        "isNullable": false
      }
    ],
    "uniques": [
      {
        "name": "uq_invoice_lines_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_invoice_lines_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      },
      {
        "name": "fk_invoice_lines_invoice_id",
        "columnNames": [
          "business_account_id",
          "invoice_id"
        ],
        "referencedTableName": "invoices",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_invoice_lines_case_id",
        "columnNames": [
          "business_account_id",
          "case_id"
        ],
        "referencedTableName": "cases",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_invoice_lines_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_invoice_lines_1",
        "columnNames": [
          "business_account_id",
          "invoice_id"
        ]
      },
      {
        "name": "idx_invoice_lines_2",
        "columnNames": [
          "business_account_id",
          "case_id"
        ]
      }
    ]
  },
  {
    "name": "payments",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "invoice_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "amount",
        "type": "numeric",
        "isNullable": false,
        "precision": 20,
        "scale": 4
      },
      {
        "name": "currency",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "payment_method",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "reference",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "paid_at",
        "type": "timestamptz",
        "isNullable": false
      },
      {
        "name": "notes",
        "type": "text",
        "isNullable": true
      }
    ],
    "uniques": [
      {
        "name": "uq_payments_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_payments_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      },
      {
        "name": "fk_payments_invoice_id",
        "columnNames": [
          "business_account_id",
          "invoice_id"
        ],
        "referencedTableName": "invoices",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_payments_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_payments_1",
        "columnNames": [
          "business_account_id",
          "invoice_id"
        ]
      }
    ]
  },
  {
    "name": "custom_field_definitions",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "entity_type",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "case_type_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "name",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "key",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "data_type",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "required",
        "type": "boolean",
        "isNullable": false
      },
      {
        "name": "configuration",
        "type": "jsonb",
        "isNullable": true
      },
      {
        "name": "sort_order",
        "type": "integer",
        "isNullable": false
      },
      {
        "name": "is_active",
        "type": "boolean",
        "isNullable": false
      }
    ],
    "uniques": [
      {
        "name": "uq_custom_field_definitions_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "uq_custom_field_definitions_1",
        "columnNames": [
          "business_account_id",
          "entity_type",
          "key"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_custom_field_definitions_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      },
      {
        "name": "fk_custom_field_definitions_case_type_id",
        "columnNames": [
          "business_account_id",
          "case_type_id"
        ],
        "referencedTableName": "case_types",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_custom_field_definitions_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_custom_field_definitions_1",
        "columnNames": [
          "business_account_id",
          "case_type_id"
        ]
      }
    ]
  },
  {
    "name": "custom_field_values",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "custom_field_definition_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "entity_type",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "entity_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "value_text",
        "type": "text",
        "isNullable": true
      },
      {
        "name": "value_number",
        "type": "numeric",
        "isNullable": true,
        "precision": 20,
        "scale": 4
      },
      {
        "name": "value_date",
        "type": "timestamptz",
        "isNullable": true
      },
      {
        "name": "value_boolean",
        "type": "boolean",
        "isNullable": true
      },
      {
        "name": "value_json",
        "type": "jsonb",
        "isNullable": true
      }
    ],
    "uniques": [
      {
        "name": "uq_custom_field_values_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "uq_custom_field_values_1",
        "columnNames": [
          "business_account_id",
          "custom_field_definition_id",
          "entity_type",
          "entity_id"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_custom_field_values_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      },
      {
        "name": "fk_custom_field_values_custom_field_definition_id",
        "columnNames": [
          "business_account_id",
          "custom_field_definition_id"
        ],
        "referencedTableName": "custom_field_definitions",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_custom_field_values_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_custom_field_values_1",
        "columnNames": [
          "business_account_id",
          "custom_field_definition_id"
        ]
      }
    ]
  },
  {
    "name": "status_definitions",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "entity_type",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "case_type_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "name",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "code",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "category",
        "type": "varchar",
        "isNullable": true,
        "length": "255"
      },
      {
        "name": "sort_order",
        "type": "integer",
        "isNullable": false
      },
      {
        "name": "is_initial",
        "type": "boolean",
        "isNullable": false
      },
      {
        "name": "is_terminal",
        "type": "boolean",
        "isNullable": false
      },
      {
        "name": "is_active",
        "type": "boolean",
        "isNullable": false
      }
    ],
    "uniques": [
      {
        "name": "uq_status_definitions_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_status_definitions_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      },
      {
        "name": "fk_status_definitions_case_type_id",
        "columnNames": [
          "business_account_id",
          "case_type_id"
        ],
        "referencedTableName": "case_types",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_status_definitions_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_status_definitions_1",
        "columnNames": [
          "business_account_id",
          "case_type_id"
        ]
      }
    ]
  },
  {
    "name": "workflows",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "name",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "description",
        "type": "text",
        "isNullable": true
      },
      {
        "name": "is_active",
        "type": "boolean",
        "isNullable": false
      }
    ],
    "uniques": [
      {
        "name": "uq_workflows_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_workflows_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_workflows_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      }
    ]
  },
  {
    "name": "workflow_steps",
    "columns": [
      {
        "name": "id",
        "type": "uuid",
        "isNullable": false,
        "isPrimary": true,
        "default": "gen_random_uuid()"
      },
      {
        "name": "created_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "updated_at",
        "type": "timestamptz",
        "isNullable": false,
        "default": "now()"
      },
      {
        "name": "version",
        "type": "integer",
        "isNullable": false,
        "default": "1"
      },
      {
        "name": "business_account_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "workflow_id",
        "type": "uuid",
        "isNullable": false
      },
      {
        "name": "status_definition_id",
        "type": "uuid",
        "isNullable": true
      },
      {
        "name": "name",
        "type": "varchar",
        "isNullable": false,
        "length": "255"
      },
      {
        "name": "description",
        "type": "text",
        "isNullable": true
      },
      {
        "name": "sort_order",
        "type": "integer",
        "isNullable": false
      },
      {
        "name": "is_initial",
        "type": "boolean",
        "isNullable": false
      },
      {
        "name": "is_terminal",
        "type": "boolean",
        "isNullable": false
      }
    ],
    "uniques": [
      {
        "name": "uq_workflow_steps_0",
        "columnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "foreignKeys": [
      {
        "name": "fk_workflow_steps_account",
        "columnNames": [
          "business_account_id"
        ],
        "referencedTableName": "business_accounts",
        "referencedColumnNames": [
          "id"
        ]
      },
      {
        "name": "fk_workflow_steps_workflow_id",
        "columnNames": [
          "business_account_id",
          "workflow_id"
        ],
        "referencedTableName": "workflows",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      },
      {
        "name": "fk_workflow_steps_status_definition_id",
        "columnNames": [
          "business_account_id",
          "status_definition_id"
        ],
        "referencedTableName": "status_definitions",
        "referencedColumnNames": [
          "business_account_id",
          "id"
        ]
      }
    ],
    "indices": [
      {
        "name": "idx_workflow_steps_0",
        "columnNames": [
          "business_account_id",
          "created_at",
          "id"
        ]
      },
      {
        "name": "idx_workflow_steps_1",
        "columnNames": [
          "business_account_id",
          "workflow_id"
        ]
      },
      {
        "name": "idx_workflow_steps_2",
        "columnNames": [
          "business_account_id",
          "status_definition_id"
        ]
      }
    ]
  }
];
export class CreateProfessionalServices1790899200000 implements MigrationInterface {
  readonly name = 'CreateProfessionalServices1790899200000';
  private schema(runner: QueryRunner): string {
    const options = runner.connection.options;
    if (options.type !== 'postgres') throw new Error('This migration requires PostgreSQL.');
    return options.schema ?? 'public';
  }
  async up(runner: QueryRunner): Promise<void> {
    const schema = this.schema(runner);
    for (const table of tables) {
      await runner.createTable(new Table({ name: schema + '.' + table.name, columns: table.columns, uniques: table.uniques }));
      for (const index of table.indices) await runner.createIndex(schema + '.' + table.name, new TableIndex(index));
    }
    // Add references only after every table exists, including cyclic document/version references.
    for (const table of tables) {
      for (const key of table.foreignKeys) {
        await runner.createForeignKey(schema + '.' + table.name, new TableForeignKey({
          ...key, referencedTableName: schema + '.' + key.referencedTableName,
          onDelete: 'NO ACTION', onUpdate: 'NO ACTION',
        }));
      }
    }
  }
  async down(runner: QueryRunner): Promise<void> {
    const schema = this.schema(runner);
    for (const table of tables) {
      for (const key of table.foreignKeys) await runner.dropForeignKey(schema + '.' + table.name, key.name);
    }
    for (const table of [...tables].reverse()) await runner.dropTable(schema + '.' + table.name, false, false, false);
  }
}
