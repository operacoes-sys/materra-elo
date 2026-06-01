'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function MeusContatosPage() {
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  // Contacts list
  const [contacts, setContacts] = useState<any[]>([])
  const [loadingContacts, setLoadingContacts] = useState(true)

  // Active tab (Fornecedores / Compradores / Transportadoras)
  const [activeTab, setActiveTab] = useState<'Fornecedor' | 'Comprador' | 'Transportadora'>('Fornecedor')

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        fetchContacts(session.user.id)
      } else {
        setLoadingContacts(false)
      }
      setLoadingUser(false)
    }
    loadUser()
  }, [])

  async function fetchContacts(userId: string) {
    setLoadingContacts(true)
    try {
      const { data, error } = await supabase
        .from('contatos')
        .select(`
          *,
          contraparte:id_contraparte (
            id,
            nome_ou_razao,
            whatsapp,
            email,
            cnpj,
            uf,
            cidade
          ),
          anuncio:id_anuncio (
            id,
            codigo,
            residuo,
            categoria,
            classe
          )
        `)
        .eq('id_usuario', userId)
        .eq('liberado', true)

      if (error) throw error
      setContacts(data || [])
    } catch (err) {
      console.error('Erro ao buscar contatos liberados:', err)
    } finally {
      setLoadingContacts(false)
    }
  }

  const filteredContacts = contacts.filter(c => c.papel_contraparte === activeTab)

  const handleWhatsapp = (whatsappNum: string, anuncioCodigo: string) => {
    const cleanNum = whatsappNum.replace(/\D/g, '')
    const text = `Olá, fazemos parte da plataforma Materra Elo e nosso contato foi liberado para negociar o anúncio *[${anuncioCodigo}]*.`
    const url = `https://wa.me/55${cleanNum}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  if (loadingUser) {
    return (
      <div className="main-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Carregando conta...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="main-layout" style={{ justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div className="form-container" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '3rem' }}>🔒</span>
          <h1 className="form-title" style={{ marginTop: '10px' }}>Acesso Restrito</h1>
          <p className="form-subtitle">Faça login para visualizar seus contatos liberados.</p>
          <Link href="/auth/login" className="btn btn-primary btn-full">
            Entrar na minha Conta
          </Link>
        </div>
      </div>
    )
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
            MATERRA ELO
          </Link>
          <Link href="/" className="btn-link" style={{ fontSize: '0.9rem' }}>
            Voltar ao Início
          </Link>
        </div>
      </nav>

      {/* TABS */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          gap: '24px'
        }}>
          <button
            onClick={() => setActiveTab('Fornecedor')}
            style={{
              padding: '16px 24px',
              border: 'none',
              background: 'none',
              color: activeTab === 'Fornecedor' ? 'var(--primary-400)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'Fornecedor' ? '3px solid var(--primary-500)' : '3px solid transparent',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Fornecedores Liberados
          </button>
          <button
            onClick={() => setActiveTab('Comprador')}
            style={{
              padding: '16px 24px',
              border: 'none',
              background: 'none',
              color: activeTab === 'Comprador' ? 'var(--accent-400)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'Comprador' ? '3px solid var(--accent-500)' : '3px solid transparent',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Compradores Liberados
          </button>
          <button
            onClick={() => setActiveTab('Transportadora')}
            style={{
              padding: '16px 24px',
              border: 'none',
              background: 'none',
              color: activeTab === 'Transportadora' ? 'var(--warning)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'Transportadora' ? '3px solid var(--warning)' : '3px solid transparent',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Transportadoras
          </button>
        </div>
      </div>

      {/* CONTAINER */}
      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', width: '100%' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Meus Contatos Liberados
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Contatos e acordos intermediados com sucesso pelo Concierge
        </p>

        {loadingContacts ? (
          <p style={{ color: 'var(--text-secondary)' }}>Carregando seus contatos liberados...</p>
        ) : filteredContacts.length === 0 ? (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            padding: '60px 20px',
            textAlign: 'center',
            borderRadius: '12px'
          }}>
            <span style={{ fontSize: '3rem' }}></span>
            <h3 style={{ marginTop: '16px', color: 'var(--text-primary)' }}>Nenhum contato nesta categoria</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
              Manifeste interesse em algum anúncio na vitrine. Após o pagamento da taxa lead, os contatos bilaterais aparecerão aqui!
            </p>
            <Link href="/" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '20px' }}>
              Ir para a Vitrine de Anúncios
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            {filteredContacts.map(c => {
              const cp = c.contraparte || {}
              const an = c.anuncio || {}

              return (
                <div key={c.id} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {/* Origin Ad Info */}
                  <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Anúncio de Origem</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                      {an.residuo || 'Resíduo Geral'}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Código: <strong style={{ color: 'var(--accent-400)' }}>{an.codigo || 'N/A'}</strong>
                    </p>
                  </div>

                  {/* Company contact details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Razão Social / Nome</span>
                      <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{cp.nome_ou_razao || 'N/A'}</p>
                    </div>
                    {cp.cnpj && (
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CNPJ</span>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{cp.cnpj}</p>
                      </div>
                    )}
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Localização</span>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{cp.cidade || 'N/A'} - {cp.uf || 'N/A'}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>E-mail</span>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{cp.email || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Performance Indicators */}
                  <div style={{
                    background: 'var(--bg-body)',
                    border: '1px solid var(--border-color)',
                    padding: '12px',
                    borderRadius: '8px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Preço Referência</span>
                      <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{c.valor_index ? `R$ ${c.valor_index}` : 'N/A'}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Preço Fechado</span>
                      <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{c.valor_real ? `R$ ${c.valor_real}` : 'N/A'}</p>
                    </div>
                    {c.premiacao_percent > 0 && (
                      <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>
                          <strong>Premiação Materra:</strong> Economia de <strong>{c.premiacao_percent}%</strong> sobre a referência!
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => handleWhatsapp(cp.whatsapp, an.codigo)}
                      className="btn btn-primary btn-full"
                      style={{ background: '#25D366', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                      disabled={!cp.whatsapp}
                    >
                      Iniciar Conversa
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
