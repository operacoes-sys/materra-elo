-- Adiciona colunas para leilão, visualizações e urgência na tabela anuncios
ALTER TABLE anuncios
ADD COLUMN IF NOT EXISTS duracao_leilao_horas INTEGER,
ADD COLUMN IF NOT EXISTS data_inicio_leilao TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS data_fim_leilao TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS visualizacoes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS urgencia_admin TEXT DEFAULT NULL;
