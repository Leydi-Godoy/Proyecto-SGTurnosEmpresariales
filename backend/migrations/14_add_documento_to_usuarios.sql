-- Add the document field used by the user-management form.
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS documento VARCHAR(50) NULL AFTER empresa_id;