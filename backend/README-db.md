Database migration notes (MySQL)
================================

These are helper SQL migrations to adapt the SGTURNOS schema and data
to this project. They are written for MySQL 5.7+/8.0.

Files in `backend/migrations/`:
- `01_roles_per_company.sql`  : creates `roles` and `user_roles` tables so companies can define roles.
- `02_update_emails.sql`     : replaces email domain `@paliacare.com` -> `@sgturnos.com` for existing users.

How to run (development)
-------------------------
1. Ensure you have a local MySQL server and a database created for development.
2. Backup the `users` table before running updates:

```bash
mysqldump -u <user> -p <database> users > users_backup.sql
```

3. Apply migrations in order:

```bash
mysql -u <user> -p <database> < backend/migrations/01_roles_per_company.sql
mysql -u <user> -p <database> < backend/migrations/02_update_emails.sql
```

Notes and recommendations
-------------------------
- Review `roles` and `user_roles` structure and adapt foreign key column names to match your `companies` and `users` tables.
- If your original SGTurnos project had different table/column names, merge adjustments before running.
- After applying migrations, test login and role assignment flows in a dev environment.
- Rotate any API credentials that may have been exposed in the old dataset.

If you want, I can:
- Extract the schema from the referenced repository and generate a full set of SQL migration scripts adapted to this project, or
- Add `knex` migrations and npm scripts to run them programmatically.
