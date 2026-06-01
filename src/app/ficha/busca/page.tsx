'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function BuscadorFichasPage() {
  const supabase = createClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setLoading(true)
    setSearched(true)
    try {
      // Query cadastros table by name (case-insensitive search)
      const { data, error } = await supabase
        .from('cadastros')
        .select('id, nome_ou_razao, tipo_parte, subtipo, selo_metal, nivel_selo, nota_operacao_0a100, score_0a100, pontuacao_legal, licenca_url, licenca_ambiental_url, licenca_ambiental_num')
        .ilike('nome_ou_razao', `%${searchTerm}%`)

      if (error) throw error
      setResults(data || [])
    } catch (err) {
      console.error('Erro na busca de empresas:', err)
    } finally {
      setLoading(false)
    }
  }

  // Helper for seal details
  const getSeloDetails = (selo: string) => {
    switch (selo) {
      case 'Ouro': return { emoji: '🏆', text: 'Ouro', class: 'ouro' }
      case 'Verde': case 'Prata': return { emoji: '🥈', text: 'Prata', class: 'verde' }
      case 'Amarelo': case 'Bronze': return { emoji: '🥉', text: 'Bronze', class: 'amarelo' }
      default: return { emoji: '⚪', text: 'Sem Selo', class: 'vermelho' }
    }
  }

  return (
    <div className="main-layout">
      {/* HEADER */}
      <nav style={{
        background: 'var(--glass-bg)',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 24px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link href="/" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#43a047' }}>
            ♻️ MATERRA ELO
          </Link>
          <Link href="/" className="btn-link" style={{ fontSize: '0.9rem' }}>
            Voltar ao Início
          </Link>
        </div>
      </nav>

      {/* SEARCH SECTION */}
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', width: '100%' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
          🔍 Buscador de Fichas de Reputação
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
          Busque outras empresas cadastradas pelo nome para conferir a validade dos documentos e o comprometimento operacional.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <input
            type="text"
            placeholder="Digite o nome ou razão social da empresa..."
            className="form-input"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {/* Results */}
        <div>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Procurando empresas no banco de dados...</p>
          ) : searched && results.length === 0 ? (
            <div className="empty-state" style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div className="empty-icon">🏢</div>
              <h3>Nenhuma empresa encontrada</h3>
              <p>Não encontramos nenhuma empresa cadastrada com o termo "{searchTerm}".</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {results.map(company => {
                const selo = getSeloDetails(company.selo_metal || company.nivel_selo)
                const docUrl = company.licenca_ambiental_url || company.licenca_url

                return (
                  <div key={company.id} style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    padding: '24px',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {company.nome_ou_razao}
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {company.tipo_parte} ({company.subtipo})
                        </p>
                      </div>
                      <span className={`badge-selo ${selo.class}`} style={{ fontSize: '0.8rem' }}>
                        {selo.emoji} {selo.text}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div style={{ background: 'var(--bg-body)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                          Operação
                        </span>
                        <strong style={{ fontSize: '1.2rem', color: 'var(--primary-400)' }}>
                          {company.nota_operacao_0a100 || company.score_0a100 || 0}/100
                        </strong>
                      </div>
                      <div style={{ background: 'var(--bg-body)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                          Legal
                        </span>
                        <strong style={{ fontSize: '1.2rem', color: 'var(--accent-400)' }}>
                          {company.pontuacao_legal || 0}/100
                        </strong>
                      </div>
                    </div>

                    {docUrl ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          📄 Licença Ambiental ativa disponível.
                        </span>
                        <a href={docUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                          Ver Habilitação Legal
                        </a>
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                        Nenhum documento legal público anexado.
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
