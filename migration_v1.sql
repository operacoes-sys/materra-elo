-- RODE ESTE SCRIPT NO SQL EDITOR DO SUPABASE PARA ADICIONAR OS NOVOS CAMPOS
ALTER TABLE cadastros 
ADD COLUMN IF NOT EXISTS endereco TEXT,
ADD COLUMN IF NOT EXISTS licenca_ambiental_num TEXT,
ADD COLUMN IF NOT EXISTS licenca_ambiental_orgao TEXT,
ADD COLUMN IF NOT EXISTS licenca_ambiental_validade DATE,
ADD COLUMN IF NOT EXISTS licenca_ambiental_url TEXT,
ADD COLUMN IF NOT EXISTS rntrc_num TEXT,
ADD COLUMN IF NOT EXISTS rntrc_validade DATE,
ADD COLUMN IF NOT EXISTS rntrc_url TEXT;

-- Garantir valores padrões de segurança
ALTER TABLE cadastros 
ALTER COLUMN recebe_convite_leilao_reverso SET DEFAULT false,
ALTER COLUMN plano_ativo SET DEFAULT false;
