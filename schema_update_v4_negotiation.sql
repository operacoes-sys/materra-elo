-- RODE ESTE SCRIPT NO SQL EDITOR DO SUPABASE PARA CRIAR AS TABELAS DE PROPOSTAS E CONTATOS
CREATE TABLE IF NOT EXISTS propostas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    id_anuncio UUID REFERENCES anuncios(id) ON DELETE CASCADE,
    id_proponente UUID REFERENCES cadastros(id) ON DELETE CASCADE,
    papel_proponente TEXT CHECK (papel_proponente IN ('Comprador', 'Fornecedor')),
    valor_proposto NUMERIC,
    status TEXT CHECK (status IN ('Enviada', 'Confirmada', 'Recusada')) DEFAULT 'Enviada',
    data DATE DEFAULT CURRENT_DATE,
    observacoes TEXT
);

CREATE TABLE IF NOT EXISTS contatos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    id_usuario UUID REFERENCES cadastros(id) ON DELETE CASCADE,
    id_contraparte UUID REFERENCES cadastros(id) ON DELETE CASCADE,
    id_anuncio UUID REFERENCES anuncios(id) ON DELETE SET NULL,
    id_transacao TEXT, -- Referência textual ou UUID da transação de origem
    papel_contraparte TEXT CHECK (papel_contraparte IN ('Fornecedor', 'Comprador', 'Transportadora')),
    taxa_lead_valor NUMERIC DEFAULT 0,
    taxa_lead_paga BOOLEAN DEFAULT false,
    liberado BOOLEAN DEFAULT false,
    valor_index NUMERIC DEFAULT 0,
    valor_real NUMERIC DEFAULT 0,
    premiacao_percent NUMERIC DEFAULT 0,
    data_liberacao TIMESTAMP WITH TIME ZONE
);
