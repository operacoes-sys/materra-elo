-- Adiciona a coluna titulo na tabela anuncios
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS titulo TEXT;
