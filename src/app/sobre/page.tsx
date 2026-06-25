'use client'

import Link from 'next/link'

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

export default function SobrePage() {
  return (
    <div className="main-layout" style={{ background: '#000', color: '#f5f5f5', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* HEADER */}
      <nav style={{
        background: 'rgba(10, 10, 10, 0.95)',
        borderBottom: '2px solid var(--primary-500)',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <Link href="/">
            <LogoBrand />
          </Link>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link href="/" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-500)'} onMouseLeave={e => e.currentTarget.style.color = '#aaa'}>Início / Vitrine</Link>
            <Link href="/jornadas" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-500)'} onMouseLeave={e => e.currentTarget.style.color = '#aaa'}>Como funciona</Link>
            <Link href="/mercado-potencial" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-500)'} onMouseLeave={e => e.currentTarget.style.color = '#aaa'}>Mercado Potencial / Controladores</Link>
            <Link href="/quotas" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-500)'} onMouseLeave={e => e.currentTarget.style.color = '#aaa'}>Cotações</Link>
            <Link href="/" className="btn btn-secondary" style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              background: '#121212',
              border: '1px solid #333',
              color: '#fff',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 'bold',
              transition: 'border-color 0.15s, color 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-500)'; e.currentTarget.style.color = 'var(--primary-500)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#fff' }}
            >
              ← Voltar ao Início
            </Link>
          </div>
        </div>
      </nav>

      {/* BODY */}
      <div style={{ maxWidth: '1000px', margin: '60px auto', padding: '0 24px' }}>
        <header style={{ marginBottom: '48px', textAlign: 'center' }}>
          <span style={{
            color: 'var(--primary-500)',
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            fontWeight: 800,
            letterSpacing: '0.15em'
          }}>
            Institucional
          </span>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', marginTop: '12px', letterSpacing: '-0.02em' }}>
            Sobre a Materra Elo
          </h1>
          <p style={{ color: '#ccc', fontSize: '1.2rem', lineHeight: '1.6', marginTop: '16px' }}>
            A infraestrutura de confiança para o mercado B2B de coprodutos e resíduos industriais no Brasil.
          </p>
        </header>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* Seção 1: O Que Fazemos */}
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #222',
            borderRadius: '16px',
            padding: '32px'
          }}>
            <h2 style={{ fontSize: '1.6rem', color: '#fff', fontWeight: 'bold', marginBottom: '16px' }}>
              O Que Fazemos
            </h2>
            <p style={{ color: '#aaa', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '16px' }}>
              Somos a plataforma tecnológica que centraliza o mercado de coprodutos e resíduos industriais, agroindustriais e comerciais no Brasil. Conectamos geradores, compradores e transportadores em um ecossistema de negociação eficiente, seguro e focado em liquidez.
            </p>
            <p style={{ color: '#aaa', fontSize: '1.05rem', lineHeight: '1.6' }}>
              A Materra Elo atua na checagem estruturada e validação cadastral de todos os usuários. Não emitimos licenças ou documentos ambientais compulsórios — nosso papel é verificar e registrar cada etapa da operation em uma trilha de auditoria digital, garantindo governança e transparência para todas as partes envolvidas.
            </p>
          </div>

          {/* Seção 2: Pilares Operacionais */}
          <div>
            <h2 style={{ fontSize: '1.6rem', color: '#fff', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>
              Pilares Operacionais
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {/* Card 1 */}
              <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-500)', fontWeight: 'bold', marginBottom: '12px' }}>
                  Mercado e Leilões Dinâmicos
                </h3>
                <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Vitrine integrada para anúncios de Oferta e Demanda com salas de negociação competitiva por lances. Conta com um sistema integrado de Leilão Reverso de Logística, onde transportadoras homologadas disputam o frete de forma descendente, reduzindo custos operacionais e garantindo a melhor contratação para a sua carga.
                </p>
              </div>

              {/* Card 2 */}
              <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-500)', fontWeight: 'bold', marginBottom: '12px' }}>
                  Filtro Reputacional (Score e Selos)
                </h3>
                <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  A plataforma valida a regularidade de licenças operacionais e registros de transporte. Permitimos que você selecione parceiros comerciais com base em critérios claros: os Selos identificam o nível de compliance socioambiental comprovado do player, enquanto o Materra Score mede o real comprometimento, pontualidade e histórico operacional da empresa na indústria.
                </p>
              </div>

              {/* Card 3 */}
              <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-500)', fontWeight: 'bold', marginBottom: '12px' }}>
                  Índices e Auditoria Imutável
                </h3>
                <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  Centralizamos um banco de dados agregados que gera os Índices Materra — médias de contratos reais concluídos que servem como baliza referencial de preços de materiais e fretes para suas simulações. Toda a operação é consolidada em uma trilha de auditoria digital imutável (Audit Trail), fornecendo o registro definitivo para a governança da sua empresa.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action & Back Button */}
          <div style={{
            background: 'linear-gradient(135deg, #1c1c1c 0%, #0a0a0a 100%)',
            border: '1px solid var(--primary-500)',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            marginTop: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Negocie com conformidade e inteligência de preços
            </h3>
            <p style={{ color: '#ccc', fontSize: '1rem', lineHeight: '1.5', maxWidth: '700px', margin: 0 }}>
              Cadastre-se hoje mesmo para começar a operar com geradores e compradores certificados em todo o território nacional.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
              <Link href="/auth/cadastro" style={{
                background: 'var(--primary-500)',
                color: '#000',
                padding: '14px 32px',
                fontSize: '1rem',
                fontWeight: 'bold',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block'
              }}>
                Criar Conta Gratuita
              </Link>
              <Link href="/" style={{
                background: '#121212',
                color: '#fff',
                border: '1px solid #333',
                padding: '14px 32px',
                fontSize: '1rem',
                fontWeight: 'bold',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'border-color 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-500)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#333'}
              >
                Voltar à Vitrine
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
