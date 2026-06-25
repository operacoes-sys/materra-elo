-- RODE ESTE SCRIPT NO SQL EDITOR DO SUPABASE PARA DESATIVAR RLS (ROW LEVEL SECURITY)
-- E LIBERAR O UPLOAD DE IMAGENS E DOCUMENTOS NO ARMAZENAMENTO (STORAGE)

-- 1. Desativa RLS nas tabelas principais do banco de dados
ALTER TABLE cadastros DISABLE ROW LEVEL SECURITY;
ALTER TABLE anuncios DISABLE ROW LEVEL SECURITY;
ALTER TABLE propostas DISABLE ROW LEVEL SECURITY;
ALTER TABLE contatos DISABLE ROW LEVEL SECURITY;
ALTER TABLE frete DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- 2. Garante que o bucket 'documentos' existe no Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Remove políticas antigas do storage (se existirem) para evitar conflitos
DROP POLICY IF EXISTS "Acesso livre de leitura em documentos" ON storage.objects;
DROP POLICY IF EXISTS "Acesso livre de escrita em documentos" ON storage.objects;
DROP POLICY IF EXISTS "Acesso livre de atualizacao em documentos" ON storage.objects;

-- 4. Cria políticas de acesso livre para o bucket 'documentos'
CREATE POLICY "Acesso livre de leitura em documentos" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'documentos');

CREATE POLICY "Acesso livre de escrita em documentos" ON storage.objects
FOR INSERT TO public WITH CHECK (bucket_id = 'documentos');

CREATE POLICY "Acesso livre de atualizacao em documentos" ON storage.objects
FOR UPDATE TO public USING (bucket_id = 'documentos');
