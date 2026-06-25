-- Adiciona a coluna prazo_recorrencia na tabela anuncios
ALTER TABLE anuncios
ADD COLUMN IF NOT EXISTS prazo_recorrencia TEXT DEFAULT NULL;
