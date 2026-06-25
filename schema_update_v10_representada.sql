-- Script to support Represented Companies Fichas (Fichas de Empresas Representadas)
CREATE TABLE IF NOT EXISTS fichas_empresa_representada (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_anuncio UUID REFERENCES anuncios(id) ON DELETE CASCADE,
  id_corretor UUID REFERENCES cadastros(id) ON DELETE SET NULL,
  razao_social TEXT,
  cnpj TEXT,
  licenca_url TEXT,
  cadri TEXT,
  status_documentos TEXT DEFAULT 'Pendente',
  score_0a100 INT DEFAULT 50,
  selo_metal TEXT DEFAULT 'Bronze',
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Disable Row Level Security on the new table
ALTER TABLE fichas_empresa_representada DISABLE ROW LEVEL SECURITY;

-- Add id_ficha_empresa to table anuncios if not exists
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS id_ficha_empresa UUID REFERENCES fichas_empresa_representada(id) ON DELETE SET NULL;
