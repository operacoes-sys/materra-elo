'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const LogoBrand = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
    <img src="/logo.png" alt="Logo" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
    <span style={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.03em' }}>
      <span style={{ fontSize: '1.7rem', color: 'var(--primary-500)' }}>MA</span>
      <span style={{ color: 'var(--primary-500)' }}>terra</span>{' '}
      <span style={{ color: '#fff', fontWeight: 300, fontSize: '1rem' }}>elo</span>
    </span>
  </span>
)

const FLUXOS = [
  { t: 170_000_000, r: 12_000_000_000, u: 't',  flow: 'Bagaço de cana → Bioeletricidade',     meta: 'UNICA',    rate: '≈ 19.406 t/h · R$ 1,37 mi/h' },
  { t: 360_000_000, r:  4_000_000_000, u: 'm³', flow: 'Vinhaça → Fertirrigação',              meta: 'UNICA',    rate: '≈ 41.096 m³/h · R$ 457 mil/h' },
  { t:   4_000_000, r:  6_000_000_000, u: 't',  flow: 'DDGS de milho → Ração animal',          meta: 'UNEM',     rate: '≈ 457 t/h · R$ 685 mil/h' },
  { t:  12_000_000, r:  3_000_000_000, u: 't',  flow: 'Cama de frango → Fertilizante',         meta: 'ABPA',     rate: '≈ 1.370 t/h · R$ 342 mil/h' },
  { t:   7_000_000, r:  2_000_000_000, u: 't',  flow: 'Bagaço de laranja → Ração e pectina',   meta: 'CitrusBR', rate: '≈ 799 t/h · R$ 228 mil/h' },
  { t:     800_000, r:  4_000_000_000, u: 't',  flow: 'Sebo bovino → Biodiesel',               meta: 'ANP',      rate: '≈ 91 t/h · R$ 457 mil/h' },
  { t: 100_000_000, r:  2_000_000_000, u: 'm³', flow: 'Dejeto suíno → Biogás e energia',       meta: 'CIBiogás', rate: '≈ 11.416 m³/h · R$ 228 mil/h' },
  { t: 100_000_000, r:  4_000_000_000, u: 't',  flow: 'RCC (entulho) → Agregado reciclado',    meta: 'ABRECON',  rate: '≈ 11.416 t/h · R$ 457 mil/h' },
  { t:   2_800_000, r:  1_200_000_000, u: 't',  flow: 'Casca de arroz → Energia e sílica',     meta: 'IRGA',     rate: '≈ 320 t/h · R$ 137 mil/h' },
]

const SEG_ANO = 31_536_000
const fmtVol = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtBRL = (v: number) => 'R$ ' + Math.floor(v).toLocaleString('pt-BR')

export default function MercadoPotencialPage() {
  const [sessionStart] = useState(() => Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [dot, setDot] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setElapsed(Date.now() - sessionStart)
      setDot(d => !d)
    }, 100)
    return () => clearInterval(t)
  }, [sessionStart])

  let totalVol = 0
  let totalVal = 0

  return (
    <div style={{ background: '#000', color: '#e0e0e0', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes glowGold  { 0%,100%{ box-shadow:0 0 16px rgba(255,215,0,0.12); } 50%{ box-shadow:0 0 36px rgba(255,215,0,0.32); } }
        @keyframes glowCyan  { 0%,100%{ box-shadow:0 0 16px rgba(0,200,255,0.10); } 50%{ box-shadow:0 0 32px rgba(0,200,255,0.28); } }
        @keyframes fadeUp    { from{ opacity:0; transform:translateY(18px); } to{ opacity:1; transform:translateY(0); } }
        @keyframes tickPulse { 0%,100%{ color:var(--primary-500); } 50%{ color:#fff200; } }
        @keyframes scanH     { 0%{ left:-100%; } 100%{ left:100%; } }
        .flow-card:hover { transform:translateY(-3px); border-color:rgba(255,215,0,0.35)!important; }
        .ctrl-feature:hover { background:rgba(0,200,255,0.07)!important; border-color:rgba(0,200,255,0.25)!important; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        background: 'rgba(0,0,0,0.96)',
        borderBottom: '1px solid rgba(255,215,0,0.18)',
        padding: '13px 32px',
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(14px)'
      }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <Link href="/"><LogoBrand /></Link>
          <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
            {[
              { href: '/', label: '← Vitrine' },
              { href: '/sobre', label: 'O que fazemos' },
              { href: '/jornadas', label: 'Como funciona' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ color: '#888', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ddd')}
                onMouseLeave={e => (e.currentTarget.style.color = '#888')}
              >{l.label}</Link>
            ))}
            <Link href="/auth/cadastro" style={{
              background: 'var(--primary-500)', color: '#000', textDecoration: 'none',
              fontSize: '0.78rem', fontWeight: 800, padding: '7px 16px', borderRadius: '6px',
              boxShadow: '0 2px 12px rgba(255,215,0,0.25)', letterSpacing: '0.3px'
            }}>⚡ Anunciar agora</Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 24px 100px' }}>

        {/* ── HERO ── */}
        <section style={{ textAlign: 'center', padding: '72px 0 56px', animation: 'fadeUp 0.5s ease' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.22)',
            borderRadius: '20px', padding: '4px 14px',
            fontSize: '0.68rem', fontWeight: 800, color: 'var(--primary-500)',
            letterSpacing: '1.8px', textTransform: 'uppercase', marginBottom: '22px'
          }}>
            <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: dot ? '#4ade80' : '#1e5c30', boxShadow: dot ? '0 0 7px #4ade80' : 'none', transition: 'all 0.1s' }} />
            IMPOSTÔMETRO DE COPRODUTOS — AO VIVO
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 900, color: '#fff',
            marginBottom: '16px', letterSpacing: '-0.03em', lineHeight: 1.08
          }}>
            Mercado Potencial<br />
            <span style={{ color: 'var(--primary-500)' }}>de Insumos Residuais</span>
          </h1>
          <p style={{ color: '#aaa', fontSize: '1rem', maxWidth: '640px', margin: '0 auto', lineHeight: 1.75 }}>
            O Brasil gera volumes colossais de coprodutos aproveitáveis a cada segundo. Acompanhe a estimativa acumulada em tempo real com base em dados de entidades setoriais públicas.
          </p>
        </section>

        {/* ── CALLOUT 250M ── */}
        <section style={{ marginBottom: '56px', animation: 'fadeUp 0.6s ease' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,215,0,0.06) 0%, rgba(255,215,0,0.02) 100%)',
            border: '1.5px solid rgba(255,215,0,0.3)',
            borderRadius: '16px', padding: '32px 36px',
            position: 'relative', overflow: 'hidden',
            animation: 'glowGold 3.5s ease-in-out infinite'
          }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: 'linear-gradient(180deg, var(--primary-500), transparent)' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '32px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--primary-500)', fontWeight: 800, letterSpacing: '1.8px', textTransform: 'uppercase', marginBottom: '14px' }}>
                  📊 Gap de mercado · Demanda não atendida
                </div>
                <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.2rem)', fontWeight: 600, color: '#ddd', lineHeight: 1.65, margin: 0 }}>
                  "Mais de{' '}
                  <span style={{ color: 'var(--primary-500)', fontFamily: 'monospace', fontWeight: 900, fontSize: '1.3em' }}>250 milhões</span>
                  {' '}de toneladas de demanda ativa aguardam contrapartes com compliance, performance e preço...
                  <span style={{ display: 'block', marginTop: '10px', fontWeight: 400, color: '#999', fontSize: '0.88em', fontStyle: 'italic' }}>
                    anunciar aqui é capturar um mercado invisível que já existe."
                  </span>
                </p>
              </div>
              <div style={{ textAlign: 'center', minWidth: '110px' }}>
                <div style={{
                  fontFamily: 'monospace', fontSize: '2.8rem', fontWeight: 900,
                  color: 'var(--primary-500)', lineHeight: 1,
                  animation: 'tickPulse 2.5s ease-in-out infinite'
                }}>250M</div>
                <div style={{ fontSize: '0.62rem', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '6px', lineHeight: 1.4 }}>t/ano<br />em demanda</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── GRID DE FLUXOS ── */}
        <section style={{ marginBottom: '56px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: dot ? '#4ade80' : '#1e5c30', boxShadow: dot ? '0 0 8px #4ade80' : 'none', transition: 'all 0.1s' }} />
                <span style={{ fontSize: '0.65rem', color: '#4ade80', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase' }}>AO VIVO · atualizando a cada 100ms</span>
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: 0 }}>9 Fluxos de Coprodutos Monitorados</h2>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#888', textAlign: 'right', lineHeight: 1.5 }}>
              Reinicia ao recarregar a página.<br />Dados: UNICA · UNEM · ABPA · CitrusBR · ANP · CIBiogás · ABRECON · IRGA
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))', gap: '14px', marginBottom: '36px' }}>
            {FLUXOS.map((item, idx) => {
              const currentVol = (item.t / SEG_ANO) * (elapsed / 1000)
              const currentVal = (item.r / SEG_ANO) * (elapsed / 1000)
              totalVol += currentVol
              totalVal += currentVal

              return (
                <div key={idx} className="flow-card" style={{
                  background: 'linear-gradient(160deg, #0e0e0e 0%, #0a0a0a 100%)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '12px', padding: '20px',
                  position: 'relative', overflow: 'hidden',
                  transition: 'transform 0.2s, border-color 0.2s'
                }}>
                  <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '9px', color: '#555', fontFamily: 'monospace', fontWeight: 700 }}>
                    [{String(idx + 1).padStart(2, '0')}]
                  </div>

                  <div style={{ display: 'inline-block', fontSize: '8px', color: '#888', border: '1px solid #333', padding: '1px 6px', borderRadius: '3px', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '10px', textTransform: 'uppercase' }}>
                    {item.meta}
                  </div>

                  <h3 style={{ color: '#fff', fontSize: '0.92rem', fontWeight: 700, marginBottom: '16px', lineHeight: 1.35, paddingRight: '18px' }}>
                    {item.flow}
                  </h3>

                  <div style={{ fontSize: '8px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Gerado nesta sessão</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary-500)', marginBottom: '12px', animation: 'tickPulse 3s ease-in-out infinite' }}>
                    {fmtVol(currentVol)} <span style={{ fontSize: '0.7rem', color: '#aaa', fontWeight: 400 }}>{item.u}</span>
                  </div>

                  <div style={{ fontSize: '8px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Valor reciclável aprox.</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 800, color: '#4ade80', marginBottom: '14px' }}>
                    {fmtBRL(currentVal)}
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', fontSize: '9.5px', color: '#777', lineHeight: 1.5 }}>
                    {item.rate}
                  </div>
                </div>
              )
            })}
          </div>

          {/* TOTAIS */}
          <div style={{
            background: 'linear-gradient(160deg, #0f0f0f, #0a0a0a)',
            border: '2px solid var(--primary-500)',
            borderRadius: '16px', padding: '32px',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', textAlign: 'center',
            animation: 'glowGold 4s ease-in-out infinite'
          }}>
            <div>
              <div style={{ fontSize: '0.62rem', color: '#aaa', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1.2px', marginBottom: '10px' }}>⚖️ ACUMULADO NA SESSÃO</div>
              <div style={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 900, color: 'var(--primary-500)', animation: 'tickPulse 2.5s ease-in-out infinite' }}>
                {fmtVol(totalVol)}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#888', marginTop: '6px' }}>t + m³ combinados</div>
            </div>
            <div>
              <div style={{ fontSize: '0.62rem', color: '#aaa', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1.2px', marginBottom: '10px' }}>💰 VALOR AGREGÁVEL ACUMULADO</div>
              <div style={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 900, color: '#4ade80' }}>
                {fmtBRL(totalVal)}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#888', marginTop: '6px' }}>estimativa de valor reciclável</div>
            </div>
          </div>
        </section>

        {/* ── SEÇÃO CONTROLADOR ── */}
        <section style={{ position: 'relative', overflow: 'hidden' }}>
          {/* top glow line */}
          <div style={{ position: 'absolute', top: 0, left: '8%', right: '8%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,200,255,0.5), transparent)' }} />

          <div style={{
            background: 'linear-gradient(160deg, #080808 0%, #060606 100%)',
            border: '1px solid rgba(0,200,255,0.12)',
            borderRadius: '20px', padding: '52px 48px',
            animation: 'glowCyan 4s ease-in-out infinite'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px', alignItems: 'start' }}>

              {/* LEFT */}
              <div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(0,200,255,0.07)', border: '1px solid rgba(0,200,255,0.2)',
                  borderRadius: '20px', padding: '4px 14px',
                  fontSize: '0.65rem', fontWeight: 800, color: '#00c8ff',
                  letterSpacing: '1.8px', textTransform: 'uppercase', marginBottom: '22px'
                }}>🎯 OPORTUNIDADE PARA CONTROLADORES</div>

                <h2 style={{
                  fontSize: 'clamp(1.4rem, 3vw, 2.1rem)', fontWeight: 900,
                  color: '#fff', marginBottom: '16px', lineHeight: 1.15
                }}>
                  Um mercado invisível<br />
                  que <span style={{ color: '#00c8ff' }}>já existe</span> — e ainda<br />
                  não está conectado.
                </h2>

                <p style={{ color: '#aaa', fontSize: '0.92rem', lineHeight: 1.8, marginBottom: '32px' }}>
                  Controladores são consultores e intermediários que conhecem as fontes e os destinos dos resíduos industriais. A Materra Elo é a infraestrutura que conecta esse conhecimento ao mercado — sem desintermediação, com privacidade das fontes garantida em cada etapa.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '36px' }}>
                  {[
                    {
                      icon: '🛡️',
                      title: 'Privacidade total das fontes',
                      desc: 'Nenhum comprador acessa nome, contato ou localização exata da planta antes do fechamento. Você controla cada etapa da divulgação.'
                    },
                    {
                      icon: '📋',
                      title: 'Duas Fichas, um anúncio',
                      desc: 'Seu anúncio terá sua Ficha Materra com score e selos e a da empresa representada totalmente anônima. Os interessados serão enviados para o seu contato — sendo você o elo com a empresa que representa.'
                    },
                    {
                      icon: '💼',
                      title: 'Comissão registrada e protegida',
                      desc: 'Sua participação fica registrada no contrato digital. Nenhuma parte pode fechar por fora sem auditoria visível na plataforma.'
                    },
                  ].map((item, i) => (
                    <div key={i} className="ctrl-feature" style={{
                      display: 'flex', gap: '14px', alignItems: 'flex-start',
                      padding: '16px 18px',
                      background: 'rgba(0,200,255,0.03)',
                      border: '1px solid rgba(0,200,255,0.08)',
                      borderRadius: '10px',
                      transition: 'background 0.2s, border-color 0.2s'
                    }}>
                      <span style={{ fontSize: '1.3rem', flexShrink: 0, marginTop: '1px' }}>{item.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginBottom: '5px' }}>{item.title}</div>
                        <div style={{ color: '#aaa', fontSize: '0.82rem', lineHeight: 1.65 }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <Link href="/auth/cadastro" style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #005f80, #00c8ff)',
                  color: '#000', fontWeight: 800, fontSize: '0.88rem',
                  padding: '13px 28px', borderRadius: '8px', textDecoration: 'none',
                  boxShadow: '0 4px 20px rgba(0,200,255,0.28)', letterSpacing: '0.3px'
                }}>
                  Quero ser Controlador →
                </Link>
              </div>

              {/* RIGHT — animated stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '0.62rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1.2px', fontWeight: 700, marginBottom: '4px' }}>
                  📡 Por que anunciar agora?
                </div>

                {[
                  {
                    label: 'Toneladas sem contraparte anunciada',
                    value: fmtVol((250_000_000 / SEG_ANO) * (elapsed / 1000)),
                    unit: 't desde que você abriu esta página',
                    color: 'var(--primary-500)',
                    desc: 'A demanda ativa acumula silenciosamente — cada tonelada não anunciada é receita perdida.'
                  },
                  {
                    label: 'Potencial de mercado não transacionado',
                    value: fmtBRL((37_000_000_000 / SEG_ANO) * (elapsed / 1000)),
                    unit: 'de R$ 37 bi/ano sem plataforma de compliance',
                    color: '#4ade80',
                    desc: 'A maioria dos fluxos ainda opera via planilha, indicação e informal. A captura começa com o anúncio.'
                  },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '12px', padding: '20px 22px'
                  }}>
                    <div style={{ fontSize: '9px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{s.label}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '1.6rem', fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: '5px' }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#888', marginBottom: '12px' }}>{s.unit}</div>
                    <div style={{ fontSize: '10.5px', color: '#aaa', lineHeight: 1.55, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '10px' }}>{s.desc}</div>
                  </div>
                ))}

                {/* Mock card */}
                <div style={{
                  background: 'linear-gradient(160deg, #0d0d0d, #0a0a0a)',
                  border: '1px solid rgba(255,215,0,0.15)',
                  borderRadius: '12px', padding: '18px',
                  marginTop: '4px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '8.5px', color: '#00c8ff', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.8px',
                      border: '1px solid rgba(0,200,255,0.25)', padding: '2px 7px', borderRadius: '3px',
                      background: 'rgba(0,200,255,0.07)'
                    }}>via controlador</span>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '8px', color: '#888' }}>Ctrl</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '1px 7px', borderRadius: '10px', fontSize: '9px', fontWeight: 700, background: 'rgba(205,127,50,0.15)', color: '#cd7f32', border: '1px solid rgba(205,127,50,0.4)' }}>★ Bronze · 42</span>
                      <span style={{ fontSize: '8px', color: '#888' }}>Emp</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '1px 7px', borderRadius: '10px', fontSize: '9px', fontWeight: 700, background: 'rgba(255,215,0,0.15)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.4)' }}>★ Ouro · 81</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', marginBottom: '3px' }}>Escória de Siderurgia</div>
                  <div style={{ fontSize: '9.5px', color: '#888', marginBottom: '12px' }}>Coproduto · ABNT 10004 · Classe IIA</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '10.5px', color: '#aaa' }}>
                    <span>⚖️ <strong style={{ color: '#fff' }}>800 t</strong>/mês</span>
                    <span>📅 Recorrente · 24m</span>
                    <span>📍 Sul de Goiás</span>
                    <span style={{ color: '#4ade80' }}>🏷️ Recebe</span>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: '12px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary-500)', fontSize: '13px' }}>R$ 42,00/t</span>
                    <span style={{ fontSize: '9px', color: '#666' }}>👁 47 views · 🔍 9 expandiram</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
