-- Migration: 02_update_emails.sql
-- Description: Replace email domain @paliacare.com with @sgturnos.com
-- Run with: mysql -u <user> -p <database> < 02_update_emails.sql

-- Backup first! Example:
-- mysqldump -u <user> -p <database> users > users_backup.sql

UPDATE users
SET email = REPLACE(email, '@paliacare.com', '@sgturnos.com')
WHERE email LIKE '%@paliacare.com';

-- If you have other email columns in other tables, repeat accordingly.
