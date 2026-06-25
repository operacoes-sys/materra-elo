-- Add NFe key column to cadastros table
ALTER TABLE cadastros ADD COLUMN IF NOT EXISTS chave_nfe_44_digitos TEXT;
