-- RODE ESTE SCRIPT NO SQL EDITOR DO SUPABASE PARA PREPARAR O BANCO DE DADOS
-- ELE ADICIONA AS COLUNAS E AJUSTA AS CONSTRAINTS PARA AS NOVAS FUNCIONALIDADES

-- 1. ADICIONA COLUNAS NA TABELA DE CADASTROS (TRANSPORTADORA PRÓPRIA E ÁREA DE ATUAÇÃO)
ALTER TABLE cadastros ADD COLUMN IF NOT EXISTS transportadora_propria BOOLEAN DEFAULT false;
ALTER TABLE cadastros ADD COLUMN IF NOT EXISTS area_atuacao TEXT;

-- 2. AJUSTA CONSTRAINT DE STATUS DO ANÚNCIO PARA PERMITIR "PENDENTE"
ALTER TABLE anuncios DROP CONSTRAINT IF EXISTS anuncios_status_check;
ALTER TABLE anuncios ADD CONSTRAINT anuncios_status_check CHECK (status IN ('Pendente', 'Anunciado', 'Em negociação', 'Fechado', 'Inativo', 'Em leilão', 'Arrematado'));

-- Garante que anúncios novos entrem como 'Pendente' por padrão
ALTER TABLE anuncios ALTER COLUMN status SET DEFAULT 'Pendente';

-- 3. AJUSTA CONSTRAINT DE TIPO DE ANÚNCIO PARA ACEITAR 'Oferta' E 'Demanda'
ALTER TABLE anuncios DROP CONSTRAINT IF EXISTS anuncios_tipo_anuncio_check;
ALTER TABLE anuncios ADD CONSTRAINT anuncios_tipo_anuncio_check CHECK (tipo_anuncio IN ('Oferta de resíduo', 'Pedido de compra', 'Oferta', 'Demanda'));

-- 4. REMOVE CONSTRAINT RÍGIDA DE CLASSE SE HOUVER
ALTER TABLE anuncios DROP CONSTRAINT IF EXISTS anuncios_classe_check;

-- 5. ADICIONA COLUNAS DE CUSTO REF INDEX E DESVIO PERCENTUAL NO ANÚNCIO
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS percentual_desvio TEXT;

-- 6. ADICIONA COLUNAS DE DETALHAMENTO NO LEILÃO DE FRETE
ALTER TABLE frete ADD COLUMN IF NOT EXISTS prazo_coleta_entrega TEXT;
ALTER TABLE frete ADD COLUMN IF NOT EXISTS tipo_material TEXT;
ALTER TABLE frete ADD COLUMN IF NOT EXISTS tem_documento BOOLEAN DEFAULT false;

-- Garante que se houver constraints antigas elas não travem o tipo_parte da Transportadora
ALTER TABLE cadastros DROP CONSTRAINT IF EXISTS cadastros_tipo_parte_check;
ALTER TABLE cadastros ADD CONSTRAINT cadastros_tipo_parte_check CHECK (tipo_parte IN ('Fornecedor', 'Comprador', 'Transportadora', 'Consultor'));
