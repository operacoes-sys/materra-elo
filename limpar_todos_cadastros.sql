-- ============================================================
-- SCRIPT: LIMPAR TODOS OS CADASTROS E DADOS DA PLATAFORMA
-- Materra Elo — Execute no SQL Editor do Supabase
-- ============================================================
-- ATENÇÃO: Este script apaga TODOS os dados de usuários, 
-- anúncios, propostas e registros relacionados.
-- Esta operação é IRREVERSÍVEL.
-- ============================================================

-- 1. Apagar tabelas filhas primeiro (dependentes)
TRUNCATE TABLE audit_trail RESTART IDENTITY CASCADE;
TRUNCATE TABLE operacoes_audit RESTART IDENTITY CASCADE;
TRUNCATE TABLE contatos RESTART IDENTITY CASCADE;
TRUNCATE TABLE frete RESTART IDENTITY CASCADE;
TRUNCATE TABLE propostas RESTART IDENTITY CASCADE;
TRUNCATE TABLE fichas_empresa_representada RESTART IDENTITY CASCADE;
TRUNCATE TABLE anuncios RESTART IDENTITY CASCADE;
TRUNCATE TABLE veiculos RESTART IDENTITY CASCADE;
TRUNCATE TABLE leads RESTART IDENTITY CASCADE;
TRUNCATE TABLE indices RESTART IDENTITY CASCADE;

-- 2. Apagar cadastros (a tabela raiz)
TRUNCATE TABLE cadastros RESTART IDENTITY CASCADE;

-- 3. Apagar TODOS os usuários autenticados do Supabase Auth
-- (Remove todos os registros da tabela interna auth.users)
DELETE FROM auth.users;

-- ============================================================
-- Resultado esperado: Todas as tabelas acima estarão vazias.
-- Novos cadastros poderão ser feitos normalmente após isso.
-- ============================================================
