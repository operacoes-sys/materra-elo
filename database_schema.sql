-- Extensão para UUID no PostgreSQL (padrão no Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CADASTROS
CREATE TABLE IF NOT EXISTS cadastros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_parte TEXT CHECK (tipo_parte IN ('Fornecedor', 'Comprador', 'Transportadora', 'Consultor')),
    subtipo TEXT CHECK (subtipo IN ('Empresa', 'Corretor', 'Indivíduo', 'Transportadora própria', 'Transportadora contratada')),
    nome_ou_razao TEXT,
    cpf_ou_cnpj TEXT,
    email TEXT,
    whatsapp TEXT,
    cep TEXT,
    cidade TEXT,
    uf TEXT,
    area_operacao TEXT,
    documentos_recebidos TEXT,
    status_documentos TEXT CHECK (status_documentos IN ('Pendente', 'Em análise', 'Verificado', 'Reprovado')),
    coerencia_operacao TEXT,
    score_0a100 INTEGER,
    selo_verificado BOOLEAN,
    nivel_selo TEXT CHECK (nivel_selo IN ('Vermelho', 'Amarelo', 'Verde', 'Ouro')),
    avaliacao_estrelas NUMERIC,
    recebe_convite_leilao_reverso BOOLEAN DEFAULT false,
    plano TEXT CHECK (plano IN ('Free', 'Pago')),
    plano_ativo BOOLEAN DEFAULT false,
    data_cadastro TIMESTAMP DEFAULT NOW(),
    observacoes TEXT,
    endereco TEXT,
    -- Campos específicos da Transportadora (Obrigatórios no cadastro)
    licenca_ambiental_num TEXT,
    licenca_ambiental_orgao TEXT,
    licenca_ambiental_validade DATE,
    licenca_ambiental_url TEXT,
    rntrc_num TEXT,
    rntrc_validade DATE,
    rntrc_url TEXT
);

-- 2. VEICULOS
CREATE TABLE IF NOT EXISTS veiculos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_cadastro UUID REFERENCES cadastros(id) ON DELETE CASCADE,
    placa TEXT,
    tipo_veiculo TEXT,
    capacidade_ton NUMERIC,
    mopp BOOLEAN,
    crlv_status TEXT,
    licenca_residuo TEXT,
    classes_autorizadas TEXT,
    observacoes TEXT
);

-- 3. ANUNCIOS
CREATE TABLE IF NOT EXISTS anuncios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_cadastro UUID REFERENCES cadastros(id) ON DELETE CASCADE,
    codigo TEXT UNIQUE,
    tipo_anuncio TEXT CHECK (tipo_anuncio IN ('Oferta de resíduo', 'Pedido de compra', 'Oferta', 'Demanda')),
    forma_cobranca TEXT,
    categoria TEXT,
    residuo TEXT,
    codigo_ibama TEXT,
    classe TEXT CHECK (classe IN ('I', 'IIA', 'IIB', 'Classe I – perigoso', 'Classe IIA – não inerte', 'Classe IIB – inerte')),
    estado_fisico TEXT,
    quantidade NUMERIC,
    unidade TEXT,
    frequencia TEXT,
    acondicionamento TEXT,
    uf TEXT,
    municipio TEXT,
    cep TEXT,
    origem_processo TEXT,
    caracteristicas TEXT,
    foto_url TEXT,
    video_url TEXT,
    valor_desejado NUMERIC,
    tipo_leilao TEXT CHECK (tipo_leilao IN ('Ascendente', 'Descendente', 'Reverso de frete', 'Sem leilão')),
    tratamento_destinacao TEXT,
    tem_licenca BOOLEAN DEFAULT false,
    licenca_anexo_url TEXT,
    disponibilidade_imediata BOOLEAN DEFAULT true,
    urgencia_prazo TEXT,
    identidade_oculta BOOLEAN DEFAULT true,
    status TEXT CHECK (status IN ('Anunciado', 'Em negociação', 'Fechado', 'Inativo', 'Em leilão', 'Arrematado')),
    valor_index NUMERIC DEFAULT 0,
    taxa_lead_valor NUMERIC DEFAULT 0,
    data_publicacao DATE DEFAULT CURRENT_DATE,
    data_encerramento DATE,
    observacoes TEXT
);

-- 4. OPERACOES_AUDIT
CREATE TABLE IF NOT EXISTS operacoes_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_anuncio UUID REFERENCES anuncios(id) ON DELETE SET NULL,
    fornecedor UUID REFERENCES cadastros(id) ON DELETE SET NULL,
    comprador UUID REFERENCES cadastros(id) ON DELETE SET NULL,
    transportadora UUID REFERENCES cadastros(id) ON DELETE SET NULL,
    consultor UUID REFERENCES cadastros(id) ON DELETE SET NULL,
    valor_residuo_rs NUMERIC,
    valor_frete_rs NUMERIC,
    data_hora TIMESTAMP DEFAULT NOW(),
    ip TEXT,
    hash TEXT,
    mtr_numero TEXT,
    mtr_data DATE,
    cdf_numero TEXT,
    cdf_data DATE,
    nivel_audit TEXT CHECK (nivel_audit IN ('Alto (verificado por nós)', 'Médio', 'Baixo (boa-fé)')),
    aval_fornecedor INTEGER,
    aval_comprador INTEGER,
    aval_transportadora INTEGER,
    aval_consultor INTEGER,
    observacoes TEXT
);

-- 5. INDEX
-- Utilizando o nome "indices" pois "index" é uma palavra reservada no SQL
CREATE TABLE IF NOT EXISTS indices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data DATE,
    item TEXT,
    classe TEXT,
    uf TEXT,
    valor_rs NUMERIC,
    unidade TEXT,
    tipo_cotacao TEXT CHECK (tipo_cotacao IN ('Resíduo ASC', 'Resíduo DESC', 'Transporte'))
);

-- 6. LEADS
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa TEXT,
    cnpj TEXT,
    tipo_parte TEXT,
    residuo_ou_servico TEXT,
    fonte_do_lead TEXT,
    contato TEXT,
    telefone TEXT,
    email TEXT,
    status_funil TEXT CHECK (status_funil IN ('A contatar', 'Contatado', 'Negociando', 'Fechado', 'Perdido')),
    proximo_passo TEXT,
    data DATE DEFAULT CURRENT_DATE,
    observacoes TEXT
);

-- 7. PROPOSTAS
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

-- 8. CONTATOS (Meus Contatos)
CREATE TABLE IF NOT EXISTS contatos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    id_usuario UUID REFERENCES cadastros(id) ON DELETE CASCADE,
    id_contraparte UUID REFERENCES cadastros(id) ON DELETE CASCADE,
    id_anuncio UUID REFERENCES anuncios(id) ON DELETE SET NULL,
    id_transacao TEXT,
    papel_contraparte TEXT CHECK (papel_contraparte IN ('Fornecedor', 'Comprador', 'Transportadora')),
    taxa_lead_valor NUMERIC DEFAULT 0,
    taxa_lead_paga BOOLEAN DEFAULT false,
    liberado BOOLEAN DEFAULT false,
    valor_index NUMERIC DEFAULT 0,
    valor_real NUMERIC DEFAULT 0,
    premiacao_percent NUMERIC DEFAULT 0,
    data_liberacao TIMESTAMP WITH TIME ZONE
);

-- 9. FRETE (Leilão Reverso de Frete)
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
    status TEXT DEFAULT 'Aberto',
    data DATE DEFAULT CURRENT_DATE
);

-- DADOS DE EXEMPLO

-- Inserindo 6 Cadastros
INSERT INTO cadastros (id, tipo_parte, subtipo, nome_ou_razao, cpf_ou_cnpj, email, status_documentos, nivel_selo, plano, plano_ativo) VALUES
('11111111-1111-1111-1111-111111111111', 'Fornecedor', 'Empresa', 'Indústria ABC Ltda', '12.345.678/0001-90', 'contato@abc.com.br', 'Verificado', 'Verde', 'Pago', true),
('22222222-2222-2222-2222-222222222222', 'Comprador', 'Empresa', 'Recicladora XYZ', '98.765.432/0001-10', 'compras@xyz.com.br', 'Verificado', 'Ouro', 'Pago', true),
('33333333-3333-3333-3333-333333333333', 'Transportadora', 'Empresa', 'Logística Rápida', '45.678.901/0001-23', 'log@rapida.com.br', 'Em análise', 'Amarelo', 'Free', false),
('44444444-4444-4444-4444-444444444444', 'Consultor', 'Indivíduo', 'João Silva Consultoria', '123.456.789-00', 'joao@consultoria.com.br', 'Pendente', 'Vermelho', 'Free', false),
('55555555-5555-5555-5555-555555555555', 'Fornecedor', 'Empresa', 'Madeireira do Sul', '11.222.333/0001-44', 'vendas@madeireira.com.br', 'Verificado', 'Verde', 'Pago', true),
('66666666-6666-6666-6666-666666666666', 'Comprador', 'Indivíduo', 'Maria Souza', '987.654.321-11', 'maria@souza.com', 'Verificado', 'Verde', 'Free', false);

-- Inserindo 3 Anúncios
INSERT INTO anuncios (id, id_cadastro, tipo_anuncio, residuo, classe, quantidade, unidade, tipo_leilao, status, data_publicacao) VALUES
('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'Oferta de resíduo', 'Sucata de Ferro', 'IIB', 5.5, 'Toneladas', 'Ascendente', 'Anunciado', '2026-05-25'),
('88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222', 'Pedido de compra', 'Plástico PET Moído', 'IIB', 10, 'Toneladas', 'Descendente', 'Em leilão', '2026-05-24'),
('99999999-9999-9999-9999-999999999999', '55555555-5555-5555-5555-555555555555', 'Oferta de resíduo', 'Serragem', 'IIA', 15, 'Toneladas', 'Sem leilão', 'Anunciado', '2026-05-20');
