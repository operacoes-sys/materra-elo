-- MIGRATION V18: COMPONENTE CARD DINÂMICO E PAGAMENTOS
-- Rode este script no Editor SQL do Supabase.

-- 1. Adiciona colunas de controle da sala de negociação/leilão na tabela anuncios
ALTER TABLE public.anuncios
ADD COLUMN IF NOT EXISTS habilitar_sala_leilao BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS data_abertura_leilao TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS data_fim_real TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 2. Adiciona colunas para controle detalhado de leads na tabela contatos
ALTER TABLE public.contatos
ADD COLUMN IF NOT EXISTS tipo_lead TEXT CHECK (tipo_lead IN ('NORMAL', 'SUPER_CONTATO')) DEFAULT 'NORMAL',
ADD COLUMN IF NOT EXISTS valor_pago NUMERIC DEFAULT 0.00;
