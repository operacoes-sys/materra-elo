'use client'

import { useState } from 'react'
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

/* ── sub-step bullet ─────────────────────── */
const Bullet = ({ children }: { children: React.ReactNode }) => (
  <li style={{
    color: '#999',
    fontSize: '0.83rem',
    lineHeight: '1.65',
    paddingLeft: '4px',
    marginBottom: '4px'
  }}>
    {children}
  </li>
)

/* ── step card ─────────────────────────────── */
type StepData = { num: number; title: string; bullets: React.ReactNode[] }

const StepCard = ({ step, accent }: { step: StepData; accent: string }) => (
  <div style={{
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start',
    background: '#0d0d0d',
    border: `1px solid ${accent}20`,
    borderLeft: `3px solid ${accent}`,
    borderRadius: '10px',
    padding: '20px 22px',
    transition: 'box-shadow 0.2s ease'
  }}
    onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 20px ${accent}14`)}
    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
  >
    <div style={{
      flexShrink: 0,
      width: '34px',
      height: '34px',
      borderRadius: '50%',
      background: `${accent}12`,
      border: `1.5px solid ${accent}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.78rem',
      fontWeight: 800,
      color: accent,
      fontFamily: 'var(--font-mono, monospace)',
      boxShadow: `0 0 10px ${accent}28`,
      marginTop: '2px'
    }}>
      {String(step.num).padStart(2, '0')}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f0f0f0', marginBottom: '10px' }}>
        {step.title}
      </div>
      <ul style={{ margin: 0, paddingLeft: '16px', listStyle: 'disc' }}>
        {step.bullets.map((b, i) => <Bullet key={i}>{b}</Bullet>)}
      </ul>
    </div>
  </div>
)

/* ── journey block ───────────────────────────── */
type Journey = {
  id: string; icon: string; title: string; subtitle: string
  accent: string; steps: StepData[]
}

const JourneyBlock = ({ j }: { j: Journey }) => (
  <section style={{
    background: 'linear-gradient(160deg, #0a0a0a 0%, #0c0c08 100%)',
    border: `1px solid ${j.accent}1a`,
    borderRadius: '16px',
    padding: '36px 32px',
    boxShadow: `0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 ${j.accent}0d`
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
      <span style={{ fontSize: '2rem', filter: `drop-shadow(0 0 8px ${j.accent}80)` }}>{j.icon}</span>
      <div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>{j.title}</div>
        <div style={{ fontSize: '0.75rem', color: j.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{j.subtitle}</div>
      </div>
    </div>
    <div style={{ height: '1px', background: `linear-gradient(90deg, ${j.accent}40, transparent)`, marginBottom: '28px' }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {j.steps.map(s => <StepCard key={s.num} step={s} accent={j.accent} />)}
    </div>
  </section>
)

/* ── profile card ─────────────────────────── */
type Profile = { icon: string; name: string; desc: React.ReactNode; accent: string }

const ProfileCard = ({ p }: { p: Profile }) => (
  <div style={{
    background: '#0d0d0d',
    border: `1px solid ${p.accent}22`,
    borderTop: `3px solid ${p.accent}`,
    borderRadius: '12px',
    padding: '22px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '1.5rem', filter: `drop-shadow(0 0 6px ${p.accent}60)` }}>{p.icon}</span>
      <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{p.name}</strong>
    </div>
    <div style={{ fontSize: '0.8rem', color: '#888', lineHeight: '1.65' }}>{p.desc}</div>
  </div>
)

/* ── DATA ──────────────────────────────────── */

const profiles: Profile[] = [
  {
    icon: '🏭',
    name: 'Fornecedor e Comprador',
    accent: '#ffd700',
    desc: 'Uma única conta serve para as duas funções. Você pode anunciar o que quer vender (Oferta) ou o que quer comprar (Demanda). Só precisa anexar as licenças do tipo adicional para ter os melhores Selos de conformidade.'
  },
  {
    icon: '🧑‍💼',
    name: 'Controlador (CNPJ ou CPF)',
    accent: '#a78bfa',
    desc: (
      <>
        Perfil para consultores e intermediários. Não há desintermediação: o anúncio do Controlador mostra de forma transparente a sua própria ficha e também a ficha da empresa que ele está representando.{' '}
        <span style={{ color: '#a78bfa', fontWeight: 600 }}>
          Em nenhum momento o sistema exibe o nome, contato ou qualquer informação da empresa representada que possa levar à desintermediação — apenas o contato do Controlador é liberado ao final da negociação.
        </span>
      </>
    )
  },
  {
    icon: '🚛',
    name: 'Transportadora',
    accent: '#34d399',
    desc: 'Empresas de logística focadas no transporte de resíduos e coprodutos industriais.'
  }
]

const journeys: Journey[] = [
  {
    id: 'fornecedor-comprador',
    icon: '🏭',
    title: 'Fornecedor e Comprador',
    subtitle: 'Jornada 1',
    accent: '#ffd700',
    steps: [
      {
        num: 1,
        title: 'Cadastro e Anúncio',
        bullets: [
          'Crie sua conta no plano gratuito ou escolha um plano pago.',
          'Faça o levantamento ao anunciar as ofertas e demandas do seu negócio, informando a quantidade, preço, fotos, quais exigências de Score ou Selos você quer que os interessados tenham e como devemos negociar.'
        ]
      },
      {
        num: 2,
        title: 'Negociação Dinâmica (No seu Anúncio)',
        bullets: [
          'A Materra Elo traz os interessados até você.',
          'Mesmo se o seu anúncio for uma Doação, se houver mais de um interessado e você autorizar, o sistema roda um Leilão Ascendente (quem pagar mais leva, em caso de ativo) ou Descendente (quem destina por menos, em caso de passivo). Caso apenas um interessado apareça e seja uma doação, o lote é enviado para você com o valor de doação. Toda a negociação é definida pelo anunciante.',
          'Ao final do prazo, você recebe a lista de interessados ordenada por quem deu o melhor lance. Você escolhe o vencedor avaliando o preço, os Selos, o Score e as avaliações passadas dele.'
        ]
      },
      {
        num: 3,
        title: 'Acesso Rápido (Anúncio de Terceiros)',
        bullets: [
          'Se tiver pressa e não quiser esperar interessados no seu anúncio, vá direto na vitrine e busque anúncios contrários ao seu interesse (por exemplo: se você é ofertante, procure uma demanda).',
          'Pague a Taxa Lead (com descontos progressivos dependendo do seu plano) para abrir uma Sala de Negociação e aguarde o tempo pré-indicado pelo anunciante. A negociação prossegue assim que alguém entrar, caso concorrentes deem lances no tipo de leilão pré-configurado.',
          'O contato do anunciante é liberado para você e o seu para ele, mesmo que você não seja o autor do melhor lance da sala.'
        ]
      },
      {
        num: 4,
        title: 'Leilão Reverso de Frete',
        bullets: [
          'Se precisar de transporte, ative nosso sistema de frete reverso por uma taxa fixa de R$ 30 (igual para todos os planos).',
          'Preencha o trajeto, data, volume e o tipo de caminhão. O sistema simula o custo médio usando nossos índices e convida as transportadoras da região.',
          'As transportadoras entram em uma página exclusiva e disputam o frete dando lances menores nos prazos de 12h, 24h, 72h ou 1 semana. Você escolhe a que quiser pelo painel a qualquer momento.'
        ]
      },
      {
        num: 5,
        title: 'Auditoria Blindada',
        bullets: [
          'Assim que o negócio fecha, a plataforma junta todos os dados e gera o seu Audit Trail (Trilha de Auditoria). Caso seja um contrato de coletas recorrentes de longo prazo (e não um lote único), o registro vai se atualizando por etapas conforme o negócio avança, onde você vai marcando as conformidades e fazendo o upload dos documentos.',
          'É um registro digital imutável e exportável de todas as suas transações para garantir o compliance da sua empresa.'
        ]
      }
    ]
  },
  {
    id: 'controlador',
    icon: '🧑‍💼',
    title: 'Controlador',
    subtitle: 'Jornada 2',
    accent: '#a78bfa',
    steps: [
      {
        num: 1,
        title: 'Cadastro e Transparência',
        bullets: [
          'Cadastre-se com seu CPF ou CNPJ de consultor/intermediário.',
          'Anuncie as ofertas ou demandas dos seus clientes na plataforma.'
        ]
      },
      {
        num: 2,
        title: 'Regra Antiburlar (Sem Desintermediação)',
        bullets: [
          'Para evitar que passem a perna no seu trabalho, o card do seu anúncio exibe obrigatoriamente duas informações casadas: a sua Ficha Materra de Controlador e a Ficha da Empresa Anunciante que você representa.',
          'Em nenhum momento o sistema exibe nomes, contatos ou informações que levem à desintermediação — apenas o seu contato como Controlador é liberado ao final da negociação.'
        ]
      },
      {
        num: 3,
        title: 'Fechamento e Logística',
        bullets: [
          'Monitore os anúncios que você configurou para os materiais do seu cliente.',
          'Use os filtros de Score e Selos para escolher a melhor proposta e use o Leilão Reverso de Frete de R$ 30 para coordenar a retirada. Você recebe a Trilha de Auditoria unificada para prestar contas ao seu cliente.',
          'Caso seu cliente tenha pressa e não queira aguardar interessados, você também pode ir aos anúncios recomendados contrários (por exemplo: se você anunciou uma demanda, vá a uma oferta, pague a Lead e entre na sala de negociação).'
        ]
      }
    ]
  },
  {
    id: 'transportadora',
    icon: '🚛',
    title: 'Transportadora',
    subtitle: 'Jornada 3',
    accent: '#34d399',
    steps: [
      {
        num: 1,
        title: 'Credenciamento da Frota',
        bullets: [
          'Cadastre sua transportadora, escolha seu plano de cobertura de região e envie os documentos (como ANTT e licenças ambientais). Isso define seus Selos e seu Score inicial.'
        ]
      },
      {
        num: 2,
        title: 'Alertas de Frete',
        bullets: [
          'Sempre que um Fornecedor ou Comprador fechar um negócio de materiais na sua região de atuação e iniciar uma cotação de frete, você recebe um convite automático no seu painel em tempo real.'
        ]
      },
      {
        num: 3,
        title: 'Disputa e Execução',
        bullets: [
          'Entre na tela da cotação e envie o seu valor de frete. Você pode reduzir seu lance para cobrir a concorrência enquanto o cronômetro do cliente estiver rodando.',
          'Se o cliente te escolher pelo preço, Score ou Selos, os dados são liberados para o transporte. O contato dele fica disponível para você, assim como o seu contato para ele. Fazer uma entrega pontual e correta aumenta o seu Score Materra para os próximos fretes.'
        ]
      }
    ]
  }
]

/* ── PAGE ──────────────────────────────────── */

export default function JornadasPage() {
  const [activeJourney, setActiveJourney] = useState<string>('fornecedor-comprador')
  const activeData = journeys.find(j => j.id === activeJourney)!
  return (
    <div style={{ minHeight: '100vh', background: '#060606', color: '#fff', fontFamily: 'Inter, sans-serif' }}>

      {/* Top bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(6,6,6,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1a1a1a',
        padding: '14px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <LogoBrand />
        <Link href="/" style={{
          fontSize: '0.82rem',
          color: '#888',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'color 0.2s'
        }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ffd700')}
          onMouseLeave={e => (e.currentTarget.style.color = '#888')}
        >
          ← Voltar ao Início
        </Link>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 100px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,215,0,0.08)',
            border: '1px solid rgba(255,215,0,0.2)',
            borderRadius: '20px',
            padding: '6px 18px',
            fontSize: '0.75rem',
            color: '#ffd700',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '20px'
          }}>
            Como Funciona a Plataforma
          </div>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
            fontWeight: 900,
            margin: '0 0 16px',
            background: 'linear-gradient(135deg, #fff 30%, #ffd700 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.03em',
            lineHeight: 1.1
          }}>
            3 Perfis.<br />3 Jornadas.<br />1 Ecossistema.
          </h1>
          <p style={{ color: '#888', fontSize: '1rem', lineHeight: '1.7', maxWidth: '560px', margin: '0 auto' }}>
            A Materra Elo conecta geradores, compradores, controladores e transportadoras
            em um único ecossistema de negociação auditado, eficiente e focado em liquidez.
          </p>
        </div>

        {/* Profiles section */}
        <div style={{ marginBottom: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <div style={{ height: '1px', flex: 1, background: '#1a1a1a' }} />
            <span style={{ fontSize: '0.72rem', color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
              Quem é Quem na Plataforma
            </span>
            <div style={{ height: '1px', flex: 1, background: '#1a1a1a' }} />
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px'
          }}>
            {profiles.map(p => <ProfileCard key={p.name} p={p} />)}
          </div>
        </div>

        {/* Journeys */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Section label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ height: '1px', flex: 1, background: '#1a1a1a' }} />
            <span style={{ fontSize: '0.72rem', color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
              Jornadas Práticas
            </span>
            <div style={{ height: '1px', flex: 1, background: '#1a1a1a' }} />
          </div>

          {/* Tab Switcher */}
          <div style={{
            display: 'flex',
            gap: '0',
            background: '#0a0a0a',
            border: '1px solid #1e1e1e',
            borderRadius: '12px',
            padding: '4px',
            position: 'relative'
          }}>
            {journeys.map(j => {
              const isActive = activeJourney === j.id
              return (
                <button
                  key={j.id}
                  onClick={() => setActiveJourney(j.id)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 8px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 700 : 500,
                    fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.2s ease',
                    background: isActive
                      ? `linear-gradient(135deg, ${j.accent}18 0%, ${j.accent}08 100%)`
                      : 'transparent',
                    color: isActive ? j.accent : '#555',
                    boxShadow: isActive ? `0 0 16px ${j.accent}18, inset 0 0 0 1px ${j.accent}30` : 'none',
                    letterSpacing: isActive ? '0.01em' : '0'
                  }}
                >
                  <span style={{ fontSize: '1rem', filter: isActive ? `drop-shadow(0 0 6px ${j.accent}80)` : 'none', transition: 'filter 0.2s' }}>
                    {j.icon}
                  </span>
                  <span style={{ whiteSpace: 'nowrap' }}>{j.title}</span>
                </button>
              )
            })}
          </div>

          {/* Active Journey */}
          <div key={activeJourney} style={{ animation: 'fadeSlideIn 0.25s ease' }}>
            <style>{`@keyframes fadeSlideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
            <JourneyBlock j={activeData} />
          </div>

        </div>

        {/* CTA footer */}
        <div style={{
          marginTop: '72px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(255,215,0,0.06) 0%, rgba(255,215,0,0.02) 100%)',
          border: '1px solid rgba(255,215,0,0.2)',
          borderRadius: '16px',
          padding: '40px 32px'
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '12px' }}>🔗</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
            Pronto para entrar no ecossistema?
          </h2>
          <p style={{ color: '#777', fontSize: '0.88rem', marginBottom: '24px', lineHeight: '1.6' }}>
            Crie sua conta, complete seu cadastro e comece a negociar com o mercado de coprodutos industriais do Brasil.
          </p>
          <Link href="/auth/cadastro" style={{
            display: 'inline-block',
            background: 'var(--primary-500)',
            color: '#000',
            fontWeight: 800,
            fontSize: '0.9rem',
            padding: '14px 32px',
            borderRadius: '8px',
            textDecoration: 'none',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            boxShadow: '0 4px 20px rgba(255,215,0,0.3)',
            transition: 'transform 0.15s, box-shadow 0.15s'
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(255,215,0,0.4)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,215,0,0.3)'
            }}
          >
            Criar Conta Gratuita
          </Link>
        </div>

      </main>
    </div>
  )
}
