-- SQL MIGRATION: ADD AUDIT TRAIL TABLE
-- RODE ESTE SCRIPT NO EDITOR SQL DO SUPABASE PARA PERSISTIR OS EVENTOS DE AUDITORIA

CREATE TABLE IF NOT EXISTS audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    event_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_category TEXT NOT NULL,
    actor_id UUID REFERENCES cadastros(id) ON DELETE SET NULL,
    actor_cnpj TEXT,
    actor_name TEXT,
    actor_role TEXT,
    actor_email TEXT,
    ip_address TEXT,
    device_info TEXT,
    session_id TEXT,
    location TEXT,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    action TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    document_name TEXT,
    document_size TEXT,
    document_hash TEXT,
    validity_date DATE,
    issuing_agency TEXT,
    verified_by TEXT,
    verification_status TEXT,
    score_before INTEGER,
    score_after INTEGER,
    seal_before TEXT,
    seal_after TEXT,
    system_signature TEXT NOT NULL,
    prev_hash TEXT,
    curr_hash TEXT NOT NULL
);

-- Habilitar RLS se necessário, ou desabilitar para simplificar o protótipo
ALTER TABLE audit_trail FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_trail DISABLE ROW LEVEL SECURITY;
