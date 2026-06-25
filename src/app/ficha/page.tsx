'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// Typographic Logo component
const LogoBrand = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
    <img src="/logo.png" alt="Logo" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
    <span style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.03em' }}>
      <span style={{ fontSize: '1.9rem', color: 'var(--primary-500)' }}>MA</span>
      <span style={{ color: 'var(--primary-500)' }}>terra</span>{' '}
      <span style={{ color: '#fff', fontWeight: 300, fontSize: '1.1rem' }}>elo</span>
    </span>
  </span>
)

export default function MinhaFichaPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        const { data, error } = await supabase
          .from('cadastros')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (!error && data) {
          setProfile(data)
        }
      }
      setLoading(false)
    }

    getProfile()
  }, [])

  if (loading) {
    return (
      <div className="main-layout" style={{ justifyContent: 'center', alignItems: 'center', background: '#000' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Carregando ficha de reputação...</p>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="main-layout" style={{ justifyContent: 'center', alignItems: 'center', padding: '20px', background: '#000' }}>
        <div className="form-container" style={{ textAlign: 'center' }}>
          <h1 className="form-title" style={{ marginTop: '10px' }}>Área Restrita</h1>
          <p className="form-subtitle">Você precisa estar logado para visualizar sua Ficha Materra.</p>
          <Link href="/auth/login" className="btn btn-primary btn-full" style={{ color: '#000', fontWeight: 'bold' }}>
            Fazer Login
          </Link>
        </div>
      </div>
    )
  }

  // Check if documents have been uploaded
  const hasUploadedDocs = (p: any): boolean => {
    if (!p || !p.documentos_recebidos) return false
    try {
      const parsed = JSON.parse(p.documentos_recebidos)
      return Object.keys(parsed).length > 0
    } catch (e) {
      return false
    }
  }

  // Reputation Score Helpers
  const getReputationDisplay = (p: any) => {
    if (!p) return '0/0'
    const docsExist = hasUploadedDocs(p)

    if (p.tipo_parte === 'Transportadora') {
      if (p.status_documentos !== 'Verificado' || (!p.area_atuacao && !p.area_operacao)) {
        return '0/0 (Inoperante)'
      }
      return `${p.score_0a100 || 50}/100 (Operante)`
    }

    if (!docsExist) {
      return '0/0'
    }
    return `${p.score_0a100 || 50}/100`
  }

  const seloName = profile.nivel_selo || 'Bronze'

  return (
    <div className="main-layout" style={{ background: '#000', color: '#f5f5f5', minHeight: '100vh' }}>
      {/* HEADER */}
      <nav style={{
        background: 'rgba(10, 10, 10, 0.95)',
        borderBottom: '2px solid var(--primary-500)',
        padding: '16px 24px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link href="/">
            <LogoBrand />
          </Link>
          <Link href="/" className="btn-link" style={{ fontSize: '0.9rem', color: '#aaa' }}>
            Voltar ao Início
          </Link>
        </div>
      </nav>

      {/* FICHA CONTENT */}
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', width: '100%' }}>
        <div style={{
          background: '#121212',
          border: '1px solid #333',
          borderRadius: '16px',
          padding: '32px'
        }}>
          
          {/* Header Ficha */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span style={{
                padding: '4px 10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid #333',
                borderRadius: '4px',
                fontSize: '0.8rem',
                color: 'var(--primary-500)',
                textTransform: 'uppercase',
                fontWeight: 600
              }}>
                Ficha Materra Oficial
              </span>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '10px', color: '#fff' }}>
                {profile.nome_ou_razao}
              </h1>
              <p style={{ color: '#aaa', fontSize: '0.95rem' }}>
                {profile.tipo_parte} ({profile.subtipo}) • CNPJ/CPF: {profile.cpf_ou_cnpj}
              </p>
            </div>
            
            {/* Selo */}
            <div style={{
              fontSize: '1rem',
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#1c1c1c',
              border: '1px solid var(--primary-500)',
              color: 'var(--primary-500)',
              fontWeight: 'bold'
            }}>
              Selo {seloName}
            </div>
          </div>

          <hr style={{ border: '0', borderTop: '1px solid #333', margin: '24px 0' }} />

          {/* Notas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            <div style={{
              background: '#1c1c1c',
              border: '1px solid #333',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#aaa', fontWeight: 600 }}>
                Comprometimento de Operação
              </span>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary-500)', margin: '10px 0' }}>
                {getReputationDisplay(profile).split('/')[0]}
                {!getReputationDisplay(profile).includes('Inoperante') && (
                  <span style={{ fontSize: '1.2rem', color: '#666' }}>/100</span>
                )}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#888' }}>
                Cálculo com base no envio regular de MTRs e CDFs.
              </p>
            </div>

            <div style={{
              background: '#1c1c1c',
              border: '1px solid #333',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#aaa', fontWeight: 600 }}>
                Pontuação Legal / Documentos
              </span>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary-500)', margin: '10px 0' }}>
                {hasUploadedDocs(profile) ? (profile.pontuacao_legal || 50) : 0}
                {hasUploadedDocs(profile) && (
                  <span style={{ fontSize: '1.2rem', color: '#666' }}>/100</span>
                )}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#888' }}>
                Verificação de conformidade de licenças e alvarás.
              </p>
            </div>
          </div>

          {/* Licenças Cadastradas */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: '#fff' }}>
              Licenças e Habilitações Legais
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {profile.documentos_recebidos ? (() => {
                try {
                  const docs = JSON.parse(profile.documentos_recebidos)
                  const keys = Object.keys(docs)
                  if (keys.length === 0) {
                    return (
                      <p style={{ color: '#666', fontSize: '0.9rem', fontStyle: 'italic' }}>
                        Nenhuma licença ou documento anexado no momento. Vá ao Painel na Página Inicial para enviar.
                      </p>
                    )
                  }
                  return keys.map(k => (
                    <div key={k} style={{
                      background: '#1c1c1c',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #333',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-500)' }}>
                          {k.replace(/_/g, ' ').toUpperCase()}
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '4px' }}>
                          {docs[k].num ? `Nº: ${docs[k].num}` : 'Documento carregado'}{' '}
                          {docs[k].validade ? `• Validade: ${new Date(docs[k].validade).toLocaleDateString('pt-BR')}` : ''}
                        </p>
                      </div>
                      <a href={docs[k].url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem', background: '#333', border: 'none' }}>
                        Visualizar Doc
                      </a>
                    </div>
                  ))
                } catch (e) {
                  return null
                }
              })() : (
                <p style={{ color: '#666', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  Nenhuma licença ou documento anexado no momento. Vá ao Painel na Página Inicial para enviar.
                </p>
              )}
            </div>
          </div>

          {/* Audit Trail PRIVADO */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.02)',
            border: '1px dashed rgba(255, 215, 0, 0.2)',
            padding: '24px',
            borderRadius: '12px'
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--primary-500)' }}>
              Histórico de Transações Privado (Audit Trail)
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '16px' }}>
              Este é o seu histórico verificado pelo administrador do sistema. Apenas você e o administrador têm acesso a estes dados.
            </p>
            {profile.audit_trail_privado ? (
              <div style={{
                background: '#1c1c1c',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: '#fff',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
                border: '1px solid #333'
              }}>
                {profile.audit_trail_privado}
              </div>
            ) : (
              <p style={{ color: '#666', fontSize: '0.9rem', fontStyle: 'italic' }}>
                Nenhuma transação registrada no histórico privado até o momento.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
