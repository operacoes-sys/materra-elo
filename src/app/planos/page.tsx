'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WHATSAPP_NUM } from '@/lib/constants'
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

export default function PlanosPage() {
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Copy PIX UX
  const [copied, setCopied] = useState(false)
  const pixKey = 'materraelo@pix.com.br' // Chave Pix mock

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        const { data } = await supabase
          .from('cadastros')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (data) {
          setProfile(data)
        }
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleNotifyPayment = () => {
    const email = user?.email || 'meu email'
    const text = `Olá Lucas, acabei de realizar o pagamento de R$35,00 via Pix para ativar o plano Pago da Materra Elo (Usuário: ${email}). Favor validar meu acesso!`
    const url = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const handleMercadoPago = () => {
    window.open('https://www.mercadopago.com.br/', '_blank')
  }

  if (loading) {
    return (
      <div className="main-layout" style={{ justifyContent: 'center', alignItems: 'center', background: '#000' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Carregando planos...</p>
      </div>
    )
  }

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

      {/* PLANS CONTAINER */}
      <div style={{ maxWidth: '900px', margin: '60px auto', padding: '0 20px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>Planos e Taxas Materra Elo</h1>
          <p style={{ color: '#aaa', fontSize: '1.1rem', marginTop: '8px' }}>
            Escolha a melhor modalidade para sua operação B2B
          </p>
        </div>

        {profile?.plano_ativo && (
          <div style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid var(--primary-500)', color: 'var(--primary-500)', padding: '16px', borderRadius: '8px', marginBottom: '32px', textAlign: 'center' }}>
            Sua Assinatura ProAtiva está Ativa! Você possui acesso irrestrito a todos os recursos.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'stretch' }}>
          
          {/* ASSINATURA PLAN */}
          <div style={{
            background: '#121212',
            border: '2px solid var(--primary-500)',
            borderRadius: '16px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-15px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--primary-500)',
              color: '#000',
              padding: '4px 16px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700
            }}>
              RECOMENDADO
            </div>

            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>Plano ProAtiva</h2>
              <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '6px' }}>Ideal para geradores, compradores e transportadoras regulares</p>
              
              <div style={{ margin: '24px 0', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff' }}>R$ 35</span>
                <span style={{ color: '#aaa', fontSize: '0.95rem' }}>/ mês</span>
              </div>

              <hr style={{ border: '0', borderTop: '1px solid #333', margin: '20px 0' }} />

              <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: 0, listStyle: 'none', color: '#aaa', fontSize: '0.95rem' }}>
                <li>Publicação ilimitada de anúncios e demandas</li>
                <li>Visualização de Fichas de Homologação completas</li>
                <li>Obtenção e verificação de Selo Materra</li>
                <li>Histórico privado de Rastreabilidade (Audit Trail)</li>
                <li>Participação nos Leilões Reversos de Frete e Resíduos</li>
              </ul>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={handleMercadoPago} className="btn btn-primary btn-full" style={{ color: '#000', fontWeight: 'bold' }}>
                Assinar via Mercado Pago
              </button>
              
              <div style={{ background: '#1c1c1c', padding: '16px', borderRadius: '8px', border: '1px solid #333' }}>
                <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '8px', textAlign: 'center' }}>
                  Ou pague por Pix (ativação manual pelo Concierge):
                </p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '8px' }}>
                  <code style={{ background: '#000', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', color: '#fff' }}>{pixKey}</code>
                  <button onClick={handleCopyPix} style={{ background: 'none', border: 'none', color: 'var(--primary-500)', cursor: 'pointer', fontSize: '0.85rem' }}>
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <button onClick={handleNotifyPayment} className="btn btn-secondary btn-full" style={{ padding: '8px', fontSize: '0.8rem', background: '#333', border: 'none' }}>
                  Avisar no WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* TAXA LEAD PLAN */}
          <div style={{
            background: '#121212',
            border: '1px solid #333',
            borderRadius: '16px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>Taxa Lead (Avulso)</h2>
              <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '6px' }}>Pague apenas pelas conexões comerciais extras</p>
              
              <div style={{ margin: '24px 0', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff' }}>Taxa Lead</span>
              </div>

              <hr style={{ border: '0', borderTop: '1px solid #333', margin: '20px 0' }} />

              <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: 0, listStyle: 'none', color: '#aaa', fontSize: '0.95rem' }}>
                <li>A 1ª transação ou contato da conta é gratuita</li>
                <li>Sem mensalidade ou custo fixo obrigatório</li>
                <li>Taxa aplicada por contato de anúncio extra</li>
                <li>Liberação de contatos após confirmação financeira</li>
                <li>Transações assistidas e monitoradas pelo Concierge</li>
              </ul>
            </div>

            <div style={{ marginTop: '32px' }}>
              <p style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', marginBottom: '16px' }}>
                A cobrança da taxa lead avulsa é gerenciada pelo Concierge após o interesse mútuo.
              </p>
              <Link href="/" className="btn btn-secondary btn-full" style={{ textAlign: 'center', background: '#1c1c1c', border: '1px solid #333' }}>
                Explorar Vitrine de Anúncios
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
