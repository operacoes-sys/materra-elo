-- ── MIGRATION V16: PAINEL DE OPERAÇÕES ────────────────────────────────────
-- Rode este script no SQL Editor do Supabase para habilitar as colunas e locks do novo painel.

-- 1. Adiciona a coluna taxa_paga na tabela anuncios (para controlar se a taxa de entrada/lead foi paga)
ALTER TABLE public.anuncios ADD COLUMN IF NOT EXISTS taxa_paga BOOLEAN DEFAULT false;

-- 2. Atualiza a restrição de status para incluir 'Finalizado'
ALTER TABLE public.anuncios DROP CONSTRAINT IF EXISTS anuncios_status_check;
ALTER TABLE public.anuncios ADD CONSTRAINT anuncios_status_check CHECK (status IN ('Pendente', 'Anunciado', 'Em negociação', 'Fechado', 'Inativo', 'Em leilão', 'Arrematado', 'Finalizado'));

-- 3. Cria a função de trigger para bloquear edições quando o anúncio tiver taxa paga ou estiver finalizado/em negociação
CREATE OR REPLACE FUNCTION public.block_anuncio_edit_on_taxa_paga()
RETURNS TRIGGER AS $$
BEGIN
    -- Se a taxa de lead foi paga ou o status indica bloqueio, impede a alteração de campos críticos de conteúdo
    IF (OLD.taxa_paga = true OR OLD.status IN ('Em negociação', 'Finalizado', 'Arrematado', 'Fechado')) THEN
        IF (NEW.residuo <> OLD.residuo OR NEW.quantidade <> OLD.quantidade OR NEW.valor_desejado <> OLD.valor_desejado OR NEW.tipo_anuncio <> OLD.tipo_anuncio) THEN
            RAISE EXCEPTION 'Não é permitido editar os detalhes de um anúncio que possui taxa paga ou já está em negociação/finalizado/arrematado.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Associa a trigger à tabela anuncios
DROP TRIGGER IF EXISTS trg_block_anuncio_edit ON public.anuncios;
CREATE TRIGGER trg_block_anuncio_edit
    BEFORE UPDATE ON public.anuncios
    FOR EACH ROW
    EXECUTE FUNCTION public.block_anuncio_edit_on_taxa_paga();
