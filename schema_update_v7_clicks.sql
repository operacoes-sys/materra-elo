-- Migration to add plans expansion counter
ALTER TABLE anuncios ADD COLUMN IF NOT EXISTS leads_expandidos_plano INTEGER DEFAULT 0;
