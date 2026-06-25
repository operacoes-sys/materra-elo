'use client'

import { useState } from 'react'
import Link from 'next/link'

const LogoBrand = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
    <img src="/logo.png" alt="Logo" style={{ height: '26px', width: 'auto', objectFit: 'contain' }} />
    <span style={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.03em' }}>
      <span style={{ fontSize: '1.7rem', color: 'var(--primary-500)' }}>MA</span>
      <span style={{ color: 'var(--primary-500)' }}>terra</span>{' '}
      <span style={{ color: '#fff', fontWeight: 300, fontSize: '1rem' }}>elo</span>
    </span>
  </span>
)

/* ─── FAQ Item ─────────────────────────────── */
type FaqItem = { q: string; a: React.ReactNode }

const FaqAccordion = ({ items, accent }: { items: FaqItem[]; accent: string }) => {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={i} style={{
            background: '#0d0d0d',
            border: `1px solid ${isOpen ? accent + '40' : '#1e1e1e'}`,
            borderLeft: `3px solid ${isOpen ? accent : '#2a2a2a'}`,
            borderRadius: '10px',
            overflow: 'hidden',
            transition: 'border-color 0.2s'
          }}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px 20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                gap: '16px',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: isOpen ? '#fff' : '#ccc', lineHeight: '1.4', flex: 1 }}>
                {item.q}
              </span>
              <span style={{
                color: isOpen ? accent : '#444',
                fontSize: '1.1rem',
                flexShrink: 0,
                transition: 'transform 0.2s, color 0.2s',
                transform: isOpen ? 'rotate(45deg)' : 'none',
                display: 'inline-block'
              }}>+</span>
            </button>
            {isOpen && (
              <div style={{
                padding: '0 20px 18px',
                fontSize: '0.83rem',
                color: '#999',
                lineHeight: '1.7',
                borderTop: `1px solid ${accent}20`
              }}>
                {item.a}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Section ──────────────────────────────── */
const Section = ({ icon, title, accent, items }: { icon: string; title: string; accent: string; items: FaqItem[] }) => (
  <div style={{ marginBottom: '48px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
      <span style={{ fontSize: '1.4rem', filter: `drop-shadow(0 0 8px ${accent}70)` }}>{icon}</span>
      <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>{title}</h2>
      <div style={{ height: '1px', flex: 1, background: `linear-gradient(90deg, ${accent}30, transparent)` }} />
    </div>
    <FaqAccordion items={items} accent={accent} />
  </div>
)

/* ─── DATA ─────────────────────────────────── */

const sections = [
  {
    icon: '🏅',
    title: 'Materra Selos — O Sistema de Conformidade',
    accent: '#ffd700',
    items: [
      {
        q: 'O que são os Materra Selos?',
        a: (
          <div style={{ marginTop: '10px' }}>
            <p style={{ marginBottom: '12px' }}>
              Os <strong style={{ color: '#fff' }}>Materra Selos</strong> são certificações digitais de conformidade emitidas pela plataforma que indicam o nível de documentação, licenciamento e regularidade de cada empresa cadastrada. Eles funcionam como um passaporte de confiança dentro do ecossistema de negociações.
            </p>
            <p style={{ marginBottom: '12px' }}>
              Ao contrário de licenças ambientais governamentais (como MTR e CDF, que a Materra Elo não emite), os Selos são <strong style={{ color: '#fff' }}>credenciais internas da plataforma</strong> que sinalizam para outros usuários o grau de rastreabilidade e comprometimento da empresa com compliance operacional.
            </p>
          </div>
        )
      },
      {
        q: 'Quais são os níveis de Selo e o que cada um desbloqueia?',
        a: (
          <div style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { nivel: 'Bronze', cor: '#cd7f32', desc: 'Cadastro básico concluído. Permite anunciar e visualizar a vitrine. Acesso às funções essenciais da plataforma.', docs: 'CNPJ ativo + e-mail verificado' },
                { nivel: 'Prata', cor: '#aaa', desc: 'Empresa com documentação ambiental inicial validada. Desbloqueia acesso às salas de negociação com desconto progressivo na Taxa Lead.', docs: '+ Licença de operação ou alvará ambiental' },
                { nivel: 'Ouro', cor: '#ffd700', desc: 'Empresa com histórico de operações concluídas e licenças plenas. Destaque nos resultados da vitrine e score de prioridade em leilões.', docs: '+ Licença plena + histórico de transações' },
                { nivel: 'Platina', cor: '#e0f0ff', desc: 'Nível máximo. Empresa auditada, com trilha completa de compliance. Acesso a negociações de alto volume e parceiros estratégicos exclusivos.', docs: '+ Audit Trail completo + validação documental avançada' }
              ].map(s => (
                <div key={s.nivel} style={{
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                  background: '#111', border: `1px solid ${s.cor}25`,
                  borderLeft: `3px solid ${s.cor}`, borderRadius: '8px', padding: '12px 16px'
                }}>
                  <div style={{ flexShrink: 0, marginTop: '2px' }}>
                    <span style={{ fontSize: '1.1rem', filter: `drop-shadow(0 0 6px ${s.cor})` }}>🏅</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: s.cor, fontSize: '0.85rem', marginBottom: '4px' }}>Selo {s.nivel}</div>
                    <div style={{ color: '#999', fontSize: '0.8rem', lineHeight: '1.55', marginBottom: '4px' }}>{s.desc}</div>
                    <div style={{ color: '#555', fontSize: '0.73rem' }}>Requisitos: {s.docs}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      },
      {
        q: 'Como faço para subir de nível e desbloquear Selos melhores?',
        a: (
          <ul style={{ margin: '10px 0 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Acesse o painel da sua conta e vá em <strong style={{ color: '#fff' }}>Minha Ficha Materra</strong>.</li>
            <li>Na aba de documentos, faça o upload das licenças exigidas para o próximo nível (ex: licença ambiental, AATIPP, CADRI, ou equivalentes estaduais).</li>
            <li>Nossa equipe de validação analisa os documentos em até <strong style={{ color: '#fff' }}>48 horas úteis</strong> e, se aprovados, o Selo é atualizado automaticamente no seu perfil.</li>
            <li>Para Fornecedor e Comprador na mesma conta, podem ser exigidos tipos adicionais de licença para cobrir ambas as atividades.</li>
          </ul>
        )
      },
      {
        q: 'Por que os Selos são importantes nas negociações?',
        a: (
          <p style={{ marginTop: '10px', lineHeight: '1.7' }}>
            Ao anunciar ou entrar em uma sala de negociação, você pode <strong style={{ color: '#fff' }}>exigir um nível mínimo de Selo</strong> das contrapartes. Isso filtra automaticamente quem pode participar da sua sala e elimina concorrentes sem documentação adequada. Da mesma forma, ter um Selo alto aumenta a chance de ser escolhido em leilões onde o anunciante dá preferência a empresas com maior nível de conformidade — especialmente em negociações de alto volume ou materiais de classe I (perigosos).
          </p>
        )
      }
    ]
  },
  {
    icon: '🔑',
    title: 'Acesso e Segurança da Conta',
    accent: '#a78bfa',
    items: [

      {
        q: 'Esqueci minha senha. Como recuperar o acesso?',
        a: (
          <ul style={{ margin: '10px 0 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Acesse a tela de login clicando em <strong style={{ color: '#fff' }}>[Acessar]</strong> no menu superior.</li>
            <li>Clique no link <strong style={{ color: '#ffd700' }}>"Esqueci minha senha"</strong> logo abaixo dos campos de preenchimento.</li>
            <li>Insira o e-mail corporativo cadastrado na plataforma.</li>
            <li>Você receberá um link seguro para a redefinição de sua credencial. Por segurança, este link expira em <strong style={{ color: '#fff' }}>24 horas</strong>.</li>
          </ul>
        )
      },
      {
        q: 'Como alterar os dados cadastrais da minha empresa?',
        a: (
          <ul style={{ margin: '10px 0 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Após realizar o login, acesse o painel <strong style={{ color: '#fff' }}>Configurações da Conta</strong>.</li>
            <li>Na aba <strong style={{ color: '#fff' }}>Dados Corporativos</strong>, você poderá atualizar o CNPJ, razão social ou e-mail principal.</li>
            <li><em>Nota:</em> Alterações críticas de dados fiscais colocam a conta temporariamente em modo de reanálise para atualização do seu <strong style={{ color: '#ffd700' }}>Materra Score</strong>.</li>
          </ul>
        )
      }
    ]
  },
  {
    icon: '🛡️',
    title: 'Governança e Ficha Materra Elo',
    accent: '#a78bfa',
    items: [
      {
        q: 'Como reivindicar a Ficha Materra Elo da minha empresa?',
        a: (
          <ul style={{ margin: '10px 0 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Como a Materra Elo atua na organização do mercado nacional, perfis estruturais de grandes polos geradores podem ser mapeados e consolidados previamente em nossa base de dados com base em registros de mercado.</li>
            <li>Se você localizou a ficha da sua empresa na vitrine ou no buscador e deseja assumir o controle total dela, clique no botão <strong style={{ color: '#fff' }}>"Reivindicar Ficha"</strong> visível no próprio perfil ou entre em contato direto pelo suporte: <strong style={{ color: '#a78bfa' }}>(62) 99927-1816</strong>.</li>
            <li>Será exigida a comprovação de vínculo corporativo (cartão CNPJ e e-mail institucional) para transferir a titularidade e liberar Selos superiores.</li>
          </ul>
        )
      },
      {
        q: 'O que é e como funciona o Materra Score?',
        a: (
          <p style={{ margin: '10px 0 0' }}>
            O <strong style={{ color: '#fff' }}>Materra Score</strong> é um indicador algorítmico de reputação que mede o comprometimento operacional, a pontualidade na liberação de cargas, o histórico de pagamentos e a integridade de cada player. Manter contratos recorrentes atualizados e cumprir os prazos das salas de negociação eleva automaticamente a sua pontuação, atraindo melhores propostas no mercado.
          </p>
        )
      }
    ]
  },
  {
    icon: '🔄',
    title: 'Operações, Negociações e Logística',
    accent: '#34d399',
    items: [
      {
        q: 'Como funciona a Sala de Negociação e a Taxa Lead?',
        a: (
          <ul style={{ margin: '10px 0 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>A <strong style={{ color: '#fff' }}>Taxa Lead</strong> é um valor fixo pago exclusivamente para abrir uma Sala de Negociação privada e entrar em contato direto com anúncios de terceiros da vitrine.</li>
            <li>Ao entrar, você participa da dinâmica de lances configurada pelo anunciante (Leilão Ascendente ou Descendente). Ao final do prazo estipulado, o contato do anunciante é liberado para você (e o seu para ele), permitindo o fechamento direto, independentemente da sua posição no ranking de lances.</li>
          </ul>
        )
      },
      {
        q: 'Como funciona o Leilão Reverso de Frete de R$ 30?',
        a: (
          <ul style={{ margin: '10px 0 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Ao consolidar um negócio de materiais, você pode acionar nosso sistema de frete reverso informando o trajeto, volume e tipo de caminhão exigido.</li>
            <li>Pelo valor fixo de <strong style={{ color: '#34d399' }}>R$ 30 por cotação</strong>, a plataforma convida automaticamente as transportadoras homologadas da região para disputarem o frete dando lances menores. O usuário tem total liberdade para escolher a transportadora que desejar a qualquer momento do cronômetro.</li>
          </ul>
        )
      },
      {
        q: 'A Materra Elo emite MTR ou CDF?',
        a: (
          <ul style={{ margin: '10px 0 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong style={{ color: '#f87171' }}>Não.</strong> A Materra Elo não emite manifestos, certidões ou licenças ambientais compulsórias. A emissão de documentos governamentais continua sendo de responsabilidade estrita das empresas operantes nos órgãos competentes.</li>
            <li>Nossa plataforma atua como uma camada de <strong style={{ color: '#fff' }}>validação cadastral</strong> e <strong style={{ color: '#fff' }}>registro imutável</strong>, consolidando todas as informações, rotas e uploads em um <strong style={{ color: '#34d399' }}>Audit Trail</strong> (Trilha de Auditoria) digital exportável para fins de compliance socioambiental e fiscal.</li>
          </ul>
        )
      }
    ]
  }
]

/* ─── PAGE ─────────────────────────────────── */

export default function AjudaPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#060606', color: '#fff', fontFamily: 'Inter, sans-serif' }}>

      {/* Top bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(6,6,6,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1a1a1a',
        padding: '14px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <LogoBrand />
        <Link href="/" style={{
          fontSize: '0.82rem', color: '#888', textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ffd700')}
          onMouseLeave={e => (e.currentTarget.style.color = '#888')}
        >
          ← Voltar ao Início
        </Link>
      </header>

      <main style={{ maxWidth: '820px', margin: '0 auto', padding: '60px 24px 100px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,215,0,0.08)',
            border: '1px solid rgba(255,215,0,0.2)',
            borderRadius: '20px', padding: '6px 18px',
            fontSize: '0.75rem', color: '#ffd700', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px'
          }}>
            Central de Ajuda e Suporte
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 4.5vw, 2.8rem)', fontWeight: 900,
            margin: '0 0 16px',
            background: 'linear-gradient(135deg, #fff 30%, #ffd700 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.03em', lineHeight: 1.1
          }}>
            Como podemos ajudar?
          </h1>
          <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.7', maxWidth: '480px', margin: '0 auto 32px' }}>
            Encontre respostas rápidas sobre acesso, operações e governança. Para suporte direto, fale com nossa equipe.
          </p>

          {/* Support contact card */}
          <div style={{
            display: 'inline-flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'linear-gradient(135deg, rgba(255,215,0,0.07) 0%, rgba(255,215,0,0.02) 100%)',
            border: '1px solid rgba(255,215,0,0.3)',
            borderLeft: '3px solid #ffd700',
            borderRadius: '12px',
            padding: '20px 28px',
            textAlign: 'left',
            boxShadow: '0 0 24px rgba(255,215,0,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.4rem', filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.5))' }}>💬</span>
              <strong style={{ color: '#ffd700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Suporte Direto
              </strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#ccc', lineHeight: '1.8' }}>
              <div>
                <span style={{ color: '#888' }}>WhatsApp / Suporte: </span>
                <a href="https://wa.me/5562999271816" target="_blank" rel="noopener noreferrer"
                  style={{ color: '#25d366', fontWeight: 700, textDecoration: 'none' }}>
                  +55 (62) 99927-1816
                </a>
              </div>
              <div>
                <span style={{ color: '#888' }}>Horário: </span>
                <span style={{ color: '#fff' }}>Segunda a Sexta-feira, 08h às 18h</span>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Sections */}
        {sections.map(s => (
          <Section key={s.title} icon={s.icon} title={s.title} accent={s.accent} items={s.items} />
        ))}

        {/* Still need help */}
        <div style={{
          textAlign: 'center',
          background: '#0a0a0a',
          border: '1px solid #1e1e1e',
          borderRadius: '16px',
          padding: '40px 32px'
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '12px' }}>🤝</div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
            Ainda precisa de ajuda?
          </h2>
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '24px', lineHeight: '1.6' }}>
            Nossa equipe de Concierge Materra Elo está disponível para suporte operacional, dúvidas sobre compliance e onboarding corporativo.
          </p>
          <a
            href="https://wa.me/5562999271816"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: '#25d366', color: '#fff', fontWeight: 800,
              fontSize: '0.88rem', padding: '13px 28px', borderRadius: '8px',
              textDecoration: 'none', letterSpacing: '0.02em',
              boxShadow: '0 4px 20px rgba(37,211,102,0.25)',
              transition: 'transform 0.15s, box-shadow 0.15s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(37,211,102,0.35)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.25)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Falar com Suporte via WhatsApp
          </a>
        </div>

      </main>
    </div>
  )
}
