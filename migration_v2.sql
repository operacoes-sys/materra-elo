-- RODE ESTE SCRIPT NO SQL EDITOR DO SUPABASE PARA ADICIONAR OS CAMPOS DE CUPOM/PROMOÇÕES
ALTER TABLE cadastros 
ADD COLUMN IF NOT EXISTS plano_promocional TEXT,
ADD COLUMN IF NOT EXISTS plano_expiracao DATE;

-- Opcional: Adicione um comentário explicativo nas colunas
COMMENT ON COLUMN cadastros.plano_promocional IS 'Nome do cupom de desconto/promoção aplicado no cadastro';
COMMENT ON COLUMN cadastros.plano_expiracao IS 'Data de expiração do plano promocional ativo';
