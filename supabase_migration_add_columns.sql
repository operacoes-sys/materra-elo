-- Migration: Add missing columns to 'cadastros' table
-- Run this in Supabase → SQL Editor
-- After running, all form data will be saved fully in one INSERT (no fallback needed)

ALTER TABLE cadastros
  ADD COLUMN IF NOT EXISTS bairro            text,
  ADD COLUMN IF NOT EXISTS logradouro        text,
  ADD COLUMN IF NOT EXISTS numero            text,
  ADD COLUMN IF NOT EXISTS telefone          text,
  ADD COLUMN IF NOT EXISTS chave_pix         text,
  ADD COLUMN IF NOT EXISTS titularidade_pix  text,
  ADD COLUMN IF NOT EXISTS pix_titular_nome  text,
  ADD COLUMN IF NOT EXISTS pix_titular_cpf   text,
  ADD COLUMN IF NOT EXISTS pix_titular_email text;

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'cadastros'
ORDER BY ordinal_position;
