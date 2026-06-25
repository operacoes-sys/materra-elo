-- RODE ESTE SCRIPT NO SQL EDITOR DO SUPABASE PARA CRIAR A TABELA DE FRETE
CREATE TABLE IF NOT EXISTS frete (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    id_comprador UUID REFERENCES cadastros(id) ON DELETE CASCADE,
    id_anuncio UUID REFERENCES anuncios(id) ON DELETE SET NULL,
    valor_desejado NUMERIC DEFAULT 0,
    valor_simulado NUMERIC DEFAULT 0,
    valor_encontrado NUMERIC DEFAULT 0,
    id_transportadora UUID REFERENCES cadastros(id) ON DELETE SET NULL,
    taxa_lead_valor NUMERIC DEFAULT 0,
    taxa_lead_paga BOOLEAN DEFAULT false,
    origem TEXT,
    destino TEXT,
    quantidade NUMERIC DEFAULT 0,
    unidade TEXT,
    acondicionamento TEXT,
    status TEXT DEFAULT 'Aberto', -- Aberto, Cotado, Fechado, Cancelado
    data DATE DEFAULT CURRENT_DATE
);
