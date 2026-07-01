-- MIGRATION V18 BLOCK 3: SALA DE LEILÃO E COTAÇÃO REVERSA DE FRETE
-- Rode este script no Editor SQL do Supabase.

-- 1. Cria a tabela public.anuncios_lances para o leilão de materiais
CREATE TABLE IF NOT EXISTS public.anuncios_lances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_anuncio UUID NOT NULL REFERENCES public.anuncios(id) ON DELETE CASCADE,
    id_usuario UUID NOT NULL REFERENCES public.cadastros(id) ON DELETE CASCADE,
    valor_lance NUMERIC NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Cria a tabela public.frete_leiloes para as cotações de frete
CREATE TABLE IF NOT EXISTS public.frete_leiloes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_shipper UUID NOT NULL REFERENCES public.cadastros(id) ON DELETE CASCADE,
    id_ficha_empresa UUID REFERENCES public.fichas_empresa_representada(id) ON DELETE SET NULL,
    razao_social_empresa TEXT,
    tipo_carga TEXT NOT NULL,
    tipo_caminhao TEXT NOT NULL,
    quantidade NUMERIC NOT NULL,
    unidade TEXT DEFAULT 't',
    condicoes_acesso TEXT[] DEFAULT '{}',
    origem_uf TEXT NOT NULL,
    origem_mun TEXT NOT NULL,
    cep_origem TEXT NOT NULL,
    destino_uf TEXT NOT NULL,
    destino_mun TEXT NOT NULL,
    cep_destino TEXT NOT NULL,
    distancia NUMERIC NOT NULL,
    data_coleta DATE NOT NULL,
    horario_coleta TEXT,
    data_entrega DATE,
    documentos_exigidos TEXT[] DEFAULT '{}',
    observacoes TEXT,
    valor_estimado NUMERIC NOT NULL,
    duracao_leilao_horas INTEGER DEFAULT 24,
    data_fim_leilao TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'Aberto', -- 'Aberto', 'Selecionado', 'Finalizado', 'SUSPENSO'
    leilao_cego BOOLEAN DEFAULT false,
    participantes UUID[] DEFAULT '{}',
    transportadora_vencedora_id UUID REFERENCES public.cadastros(id) ON DELETE SET NULL,
    taxas_adicionais_pagas UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Cria a tabela public.frete_lances para os lances de frete das transportadoras
CREATE TABLE IF NOT EXISTS public.frete_lances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_leilao UUID NOT NULL REFERENCES public.frete_leiloes(id) ON DELETE CASCADE,
    id_transportadora UUID NOT NULL REFERENCES public.cadastros(id) ON DELETE CASCADE,
    preco NUMERIC NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Habilita replicação Realtime para as tabelas criadas
ALTER PUBLICATION supabase_realtime ADD TABLE public.anuncios_lances;
ALTER PUBLICATION supabase_realtime ADD TABLE public.frete_leiloes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.frete_lances;
