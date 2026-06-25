'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Stock/quote data interface
interface TickerItem {
  name: string
  val: string
  up: boolean
}

// Impostometro data matching exact updated request
const IMPOSTOMETRO_DADOS = [
  { t: 170000000, r: 12000000000, u: 't', flow: 'Bagaço de cana → Bioeletricidade', meta: '~170 milhões t/ano · ~R$ 12 bi/ano · UNICA', rate: '≈ 19.406 t/h · R$ 1,37 milhão/h' },
  { t: 360000000, r: 4000000000, u: 'm³', flow: 'Vinhaça → Fertirrigação', meta: '~360 bilhões L/ano · ~R$ 4 bi/ano · UNICA', rate: '≈ 41.096 m³/h · R$ 457 mil/h' },
  { t: 4000000, r: 6000000000, u: 't', flow: 'DDGS milho → Ração animal', meta: '~4 milhões t/ano · ~R$ 6 bi/ano · UNEM', rate: '≈ 457 t/h · R$ 685 mil/h' },
  { t: 12000000, r: 3000000000, u: 't', flow: 'Cama de frango → Fertilizante organomineral', meta: '~12 milhões t/ano · ~R$ 3 bi/ano · ABPA', rate: '≈ 1.370 t/h · R$ 342 mil/h' },
  { t: 7000000, r: 2000000000, u: 't', flow: 'Bagaço de laranja → Ração e pectina', meta: '~7 milhões t/ano · ~R$ 2 bi/ano · CitrusBR', rate: '≈ 799 t/h · R$ 228 mil/h' },
  { t: 800000, r: 4000000000, u: 't', flow: 'Sebo bovino → Biodiesel', meta: '~800 mil t/ano · ~R$ 4 bi/ano · ANP (Boletim do Biodiesel)', rate: '≈ 91 t/h · R$ 457 mil/h' },
  { t: 100000000, r: 2000000000, u: 'm³', flow: 'Dejeto suíno → Biogás e energia', meta: '~100 milhões m³/ano · ~R$ 2 bi/ano · CIBiogás / Embrapa', rate: '≈ 11.416 m³/h · R$ 228 mil/h' },
  { t: 100000000, r: 4000000000, u: 't', flow: 'RCC (entulho) → Agregado reciclado', meta: '~100 milhões t/ano · ~R$ 4 bi/ano · ABRECON / Conama 307', rate: '≈ 11.416 t/h · R$ 457 mil/h' },
  { t: 2800000, r: 1200000000, u: 't', flow: 'Casca de arroz → Energia + sílica para cimento', meta: '~2,8 milhões t/ano · ~R$ 1,2 bi/ano · IRGA', rate: '≈ 320 t/h · R$ 137 mil/h' }
]

const SEG_ANO = 31536000;
const fmt2 = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtR = (v: number) => 'R$ ' + Math.floor(v).toLocaleString('pt-BR');

interface LandingPageProps {
  searchFichaQuery: string
  setSearchFichaQuery: (v: string) => void
  handleFichaSearch: (e: React.FormEvent) => void
  searchingFicha: boolean
}

export default function LandingPage({
  searchFichaQuery,
  setSearchFichaQuery,
  handleFichaSearch,
  searchingFicha
}: LandingPageProps) {
  const [sessionStartTime] = useState(() => Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [activeTab, setActiveTab] = useState<'fornecedor' | 'comprador' | 'transportadora' | 'corretor'>('fornecedor')
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({})

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - sessionStartTime)
    }, 100)
    return () => clearInterval(timer)
  }, [sessionStartTime])

  const toggleFaq = (index: number) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }))
  }

  // Calculate totals for the footer counters
  let totalVolume = 0
  let totalValue = 0

  return (
    <div style={{ background: '#000', color: '#f5f5f5', fontFamily: 'Inter, sans-serif' }}>
      {/* Dynamic Keyframes and Classes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatLogo {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes subtlePulse {
          0% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.05); }
          50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.15); }
          100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.05); }
        }
        .animate-logo {
          animation: floatLogo 6s ease-in-out infinite;
        }
        .pulse-card {
          animation: subtlePulse 4s ease-in-out infinite;
        }
        .hover-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .hover-card:hover {
          transform: translateY(-6px);
          border-color: var(--primary-500) !important;
          box-shadow: 0 12px 30px rgba(255, 215, 0, 0.12) !important;
        }
        .factory-img {
          transition: transform 0.6s ease, filter 0.6s ease;
          filter: grayscale(1) brightness(0.5);
        }
        .factory-img:hover {
          transform: scale(1.04);
          filter: grayscale(0) brightness(0.9);
        }
      `}} />
      
      {/* HERO SECTION */}
      <section style={{
        position: 'relative',
        padding: '120px 20px 100px',
        background: 'radial-gradient(circle at center, #141414 0%, #000000 100%)',
        borderBottom: '1px solid #1c1c1c',
        overflow: 'hidden'
      }}>
        {/* Glow Effects */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'rgba(255, 215, 0, 0.03)',
          borderRadius: '50%',
          filter: 'blur(120px)',
          pointerEvents: 'none',
          zIndex: 1
        }}></div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          {/* Logo dissolving animation */}
          <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '32px' }} className="animate-logo">
            <div style={{
              padding: '8px',
              background: 'rgba(255, 215, 0, 0.03)',
              border: '2px solid rgba(255, 215, 0, 0.25)',
              borderRadius: '50%',
            }} className="pulse-card">
              <img 
                src="/logo.png" 
                alt="Logo Materra Elo" 
                style={{ height: '96px', width: '96px', borderRadius: '50%', objectFit: 'cover' }} 
              />
            </div>
          </div>

          <h1 style={{
            fontSize: '3.3rem',
            fontWeight: 900,
            lineHeight: '1.15',
            letterSpacing: '-0.03em',
            color: '#fff',
            maxWidth: '1000px',
            margin: '0 auto 24px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            O Novo Mercado Digital de <span style={{ color: 'var(--primary-500)', background: 'linear-gradient(90deg, #ffd700, #ffb300)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Coprodutos e Insumos Residuais</span> do Brasil
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: '#aaa',
            lineHeight: '1.6',
            maxWidth: '850px',
            margin: '0 auto 40px'
          }}>
            Compre, venda e intermedeie resíduos industriais e agro em todo o país com validação documental rigorosa, checagem de licenças em tempo real e inteligência de preços. <strong style={{ color: 'var(--primary-500)' }}>Atenção Controladores:</strong> Encontre resíduos na sua região, anuncie com exclusividade e garanta seu comissionamento 100% blindado.
          </p>

          {/* Quick Ficha Search on Hero */}
          <div style={{
            maxWidth: '580px',
            margin: '0 auto 48px',
            background: '#0a0a0a',
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            gap: '8px'
          }}>
            <form onSubmit={handleFichaSearch} style={{ display: 'flex', width: '100%', gap: '8px' }}>
              <input
                type="text"
                placeholder="Consulte a Ficha Materra de qualquer CNPJ ou Empresa..."
                value={searchFichaQuery}
                onChange={e => setSearchFichaQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '0.95rem',
                  padding: '8px 16px'
                }}
              />
              <button 
                type="submit" 
                style={{
                  background: 'var(--primary-500)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'transform 0.1s'
                }}
                disabled={searchingFicha}
              >
                {searchingFicha ? 'Buscando...' : 'Buscar Ficha'}
              </button>
            </form>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/cadastro?role=usuario" style={{
              background: 'var(--primary-500)',
              color: '#000',
              padding: '16px 36px',
              fontSize: '1rem',
              fontWeight: 800,
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'all 0.2s',
              boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              Criar Conta Gratuita
            </Link>
            <Link href="/auth/login" style={{
              background: '#0a0a0a',
              border: '1px solid #333',
              color: '#fff',
              padding: '16px 36px',
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#121212'
              e.currentTarget.style.borderColor = '#444'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#0a0a0a'
              e.currentTarget.style.borderColor = '#333'
            }}
            >
              Acessar Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* INSTITUCIONAL / SOBRE A PLATAFORMA */}
      <section id="sobre" style={{ padding: '80px 20px', background: '#050505', borderBottom: '1px solid #111' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ color: 'var(--primary-500)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.15em' }}>Institucional</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginTop: '10px' }}>
              Segurança e Transparência que Transformam Coprodutos em Recursos
            </h2>
            <p style={{ color: '#aaa', maxWidth: '800px', margin: '16px auto 0', fontSize: '1.05rem', lineHeight: '1.6' }}>
              A Materra Elo é a infraestrutura de confiança do mercado regulado. Ajudamos indústrias e o agro a monetizar passivos ambientais e adquirir insumos circulares sem risco jurídico ou operacional.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            {/* Box 1 */}
            <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '16px', padding: '32px' }} className="hover-card">
              <div style={{ fontSize: '1.8rem', marginBottom: '16px' }}>🛡️</div>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 'bold', marginBottom: '12px' }}>Compliance Criptografado</h3>
              <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Monitoramento constante de documentações, licenças operacionais de transporte e PGRS das empresas. Somente parceiros homologados entram na plataforma.
              </p>
            </div>

            {/* Box 2 */}
            <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '16px', padding: '32px' }} className="hover-card">
              <div style={{ fontSize: '1.8rem', marginBottom: '16px' }}>📊</div>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 'bold', marginBottom: '12px' }}>Audit Trail Trilateral</h3>
              <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Registro inviolável de cada contrato assinado, com emissão de MTR, CDF e comprovantes integrados. Auditorias preparadas em um clique.
              </p>
            </div>

            {/* Box 3 */}
            <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '16px', padding: '32px' }} className="hover-card">
              <div style={{ fontSize: '1.8rem', marginBottom: '16px' }}>⚡</div>
              <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 'bold', marginBottom: '12px' }}>Leilões Inteligentes</h3>
              <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Mecanismos de lances ascendentes e descendentes dinâmicos gerenciados por nossa assessoria comercial com foco em garantir o maior retorno financeiro.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* O QUE FAZEMOS & FICHA MATERRA */}
      <section id="funcionalidades" style={{ padding: '80px 20px', background: '#000', borderBottom: '1px solid #111' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '48px', alignItems: 'center' }}>
            
            {/* Visual Ficha Mockup */}
            <div style={{
              background: '#0a0a0a',
              border: '1px solid rgba(255, 215, 0, 0.15)',
              borderRadius: '24px',
              padding: '36px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.8)',
              position: 'relative'
            }} className="pulse-card">
              {/* Badge */}
              <div style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid var(--primary-500)',
                color: 'var(--primary-500)',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                ✓ Selo Ouro de Compliance
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ width: '48px', height: '48px', background: '#121212', border: '1px solid #333', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: 'var(--primary-500)' }}>
                  ME
                </div>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Ficha Materra</h4>
                  <span style={{ color: '#666', fontSize: '0.8rem' }}>ID: 88570213-3033-4d62</span>
                </div>
              </div>

              {/* Ficha items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ borderBottom: '1px solid #1a1a1a', paddingBottom: '10px' }}>
                  <span style={{ display: 'block', color: '#666', fontSize: '0.7rem', textTransform: 'uppercase' }}>Razão Social</span>
                  <strong style={{ color: '#fff', fontSize: '0.95rem' }}>AGRO INDUSTRIAL VALE DO SOL LTDA</strong>
                </div>

                <div style={{ borderBottom: '1px solid #1a1a1a', paddingBottom: '10px' }}>
                  <span style={{ display: 'block', color: '#666', fontSize: '0.7rem', textTransform: 'uppercase' }}>Atividade</span>
                  <strong style={{ color: '#fff', fontSize: '0.95rem' }}>Produtor de Coproduto Bagaço & Vinhaça</strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderBottom: '1px solid #1a1a1a', paddingBottom: '10px' }}>
                  <div>
                    <span style={{ display: 'block', color: '#666', fontSize: '0.7rem', textTransform: 'uppercase' }}>Licença Ambiental</span>
                    <strong style={{ color: '#ffd700', fontSize: '0.95rem' }}>Válida (SEMAD nº 834/26)</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', color: '#666', fontSize: '0.7rem', textTransform: 'uppercase' }}>PGRS homologado</span>
                    <strong style={{ color: '#4caf50', fontSize: '0.95rem' }}>Sim (Aprovado)</strong>
                  </div>
                </div>

                <div>
                  <span style={{ display: 'block', color: '#666', fontSize: '0.7rem', textTransform: 'uppercase' }}>Nota Reputacional de Operação</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div style={{ flex: 1, height: '8px', background: '#222', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '96%', height: '100%', background: 'var(--primary-500)' }}></div>
                    </div>
                    <strong style={{ color: '#fff', fontSize: '0.95rem' }}>96/100</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Text description */}
            <div>
              <span style={{ color: 'var(--primary-500)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.15em' }}>Ficha Materra</span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginTop: '10px', marginBottom: '20px' }}>
                Credibilidade Verificada Antes do Negócio
              </h2>
              <p style={{ color: '#aaa', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '24px' }}>
                A Ficha Materra é a identidade jurídica e operacional de cada fornecedor, comprador e transportadora. Todo participante é homologado por uma auditoria documental minuciosa que valida licenças ambientais, regularidade e capacidade física.
              </p>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#ccc' }}>
                  <span style={{ color: 'var(--primary-500)', fontWeight: 'bold' }}>✓</span> Apenas empresas com licença válida podem negociar.
                </li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#ccc' }}>
                  <span style={{ color: 'var(--primary-500)', fontWeight: 'bold' }}>✓</span> Exibição de notas operacionais públicas de transações passadas.
                </li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#ccc' }}>
                  <span style={{ color: 'var(--primary-500)', fontWeight: 'bold' }}>✓</span> Selos de compliance Bronze, Prata e Ouro.
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* JORNADAS DE OPERAÇÃO - INTERACTIVE TABS */}
      <section id="jornadas" style={{ padding: '80px 20px', background: '#050505', borderBottom: '1px solid #111' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ color: 'var(--primary-500)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.15em' }}>Como Funciona</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginTop: '10px' }}>
              Jornadas Sob Medida para Cada Perfil
            </h2>
            <p style={{ color: '#aaa', fontSize: '1.05rem', marginTop: '12px' }}>
              Selecione o seu perfil operacional e entenda como a Materra Elo simplifica a sua rotina.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div style={{
            display: 'flex',
            background: '#0a0a0a',
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '6px',
            marginBottom: '40px',
            gap: '6px'
          }}>
            {(['fornecedor', 'comprador', 'transportadora', 'corretor'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  background: activeTab === tab ? 'var(--primary-500)' : 'transparent',
                  color: activeTab === tab ? '#000' : '#888',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s'
                }}
              >
                {tab === 'fornecedor' ? 'Fornecedor (Gerador)' : tab}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #222',
            borderRadius: '16px',
            padding: '40px'
          }}>
            
            {activeTab === 'fornecedor' && (
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '24px' }}>
                  Jornada do Fornecedor (Gerador de Resíduos/Coprodutos)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'rgba(255,215,0,0.1)', border: '1px solid var(--primary-500)', color: 'var(--primary-500)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>1</div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 'bold', margin: '0 0 6px' }}>Cadastro & Auditoria Documental</h4>
                      <p style={{ color: '#aaa', fontSize: '0.9rem', margin: 0 }}>Você envia as licenças de operação e o PGRS da empresa. Homologamos sua Ficha Materra com o selo de compliance correspondente.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'rgba(255,215,0,0.1)', border: '1px solid var(--primary-500)', color: 'var(--primary-500)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>2</div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 'bold', margin: '0 0 6px' }}>Publicação de Anúncio de Oferta</h4>
                      <p style={{ color: '#aaa', fontSize: '0.9rem', margin: 0 }}>Cadastre o coproduto gerado (volume, frequência, tipo). O sistema gera um código único e inicia a captação de parceiros.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'rgba(255,215,0,0.1)', border: '1px solid var(--primary-500)', color: 'var(--primary-500)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>3</div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 'bold', margin: '0 0 6px' }}>Redução de Custos Logísticos com o <span style={{ color: 'var(--primary-500)' }}>Materra ReverseBid™</span></h4>
                      <p style={{ color: '#aaa', fontSize: '0.9rem', margin: 0 }}>
                        Através da funcionalidade <strong>Materra ReverseBid™</strong> (Leilão Reverso de Frete), as transportadoras credenciadas competem para ver quem oferece o menor valor por quilômetro para transportar o seu resíduo, garantindo economia operacional imediata.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'rgba(255,215,0,0.1)', border: '1px solid var(--primary-500)', color: 'var(--primary-500)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>4</div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 'bold', margin: '0 0 6px' }}>Fechamento Seguro & Audit Trail</h4>
                      <p style={{ color: '#aaa', fontSize: '0.9rem', margin: 0 }}>Liberação bilateral de contatos, fechamento contratual de frete reverso, rastreamento via MTR/CDF e registro auditável completo.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'comprador' && (
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '24px' }}>
                  Jornada do Comprador
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'rgba(255,215,0,0.1)', border: '1px solid var(--primary-500)', color: 'var(--primary-500)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>1</div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 'bold', margin: '0 0 6px' }}>Mapeamento de Insumos</h4>
                      <p style={{ color: '#aaa', fontSize: '0.9rem', margin: 0 }}>Navegue pela vitrine integrada de ofertas ou publique seus anúncios de Demanda para que geradores encontrem sua necessidade.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'rgba(255,215,0,0.1)', border: '1px solid var(--primary-500)', color: 'var(--primary-500)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>2</div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 'bold', margin: '0 0 6px' }}>Consulta de Fichas de Compliance</h4>
                      <p style={{ color: '#aaa', fontSize: '0.9rem', margin: 0 }}>Analise a conformidade ambiental de quem gerou o resíduo e as notas reputacionais antes de formalizar qualquer interesse.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'rgba(255,215,0,0.1)', border: '1px solid var(--primary-500)', color: 'var(--primary-500)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>3</div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 'bold', margin: '0 0 6px' }}>Proposta com Assessoria Exclusiva</h4>
                      <p style={{ color: '#aaa', fontSize: '0.9rem', margin: 0 }}>Apresente sua intenção de compra. Nossa assessoria conduz o processo com o gerador garantindo agilidade.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transportadora' && (
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '24px' }}>
                  Jornada da Transportadora
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'rgba(255,215,0,0.1)', border: '1px solid var(--primary-500)', color: 'var(--primary-500)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>1</div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 'bold', margin: '0 0 6px' }}>Cadastro de Ficha & ANTT (RNTRC)</h4>
                      <p style={{ color: '#aaa', fontSize: '0.9rem', margin: 0 }}>Envie sua documentação de transportes e licença ambiental de resíduos. Receba a aprovação e o selo de parceiro credenciado.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'rgba(255,215,0,0.1)', border: '1px solid var(--primary-500)', color: 'var(--primary-500)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>2</div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 'bold', margin: '0 0 6px' }}>Competição no <span style={{ color: 'var(--primary-500)' }}>Materra ReverseBid™</span></h4>
                      <p style={{ color: '#aaa', fontSize: '0.9rem', margin: 0 }}>
                        Acesse as ofertas logísticas ativas e dê lances decrescentes pelo valor do Km de transporte. O algoritmo do <strong>Materra ReverseBid™</strong> seleciona a melhor proposta, garantindo cargas recorrentes para sua frota de forma limpa e transparente.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'rgba(255,215,0,0.1)', border: '1px solid var(--primary-500)', color: 'var(--primary-500)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>3</div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 'bold', margin: '0 0 6px' }}>Coleta Segura e Emissão do MTR</h4>
                      <p style={{ color: '#aaa', fontSize: '0.9rem', margin: 0 }}>Opere com total segurança e emitindo Manifesto de Transporte de Resíduos integrado no sistema.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'corretor' && (
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '24px' }}>
                  Jornada do Corretor / Controlador
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'rgba(255,215,0,0.1)', border: '1px solid var(--primary-500)', color: 'var(--primary-500)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>1</div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 'bold', margin: '0 0 6px' }}>Mapeamento & Prospecção</h4>
                      <p style={{ color: '#aaa', fontSize: '0.9rem', margin: 0 }}>Encontre indústrias, abatedouros ou construtoras gerando resíduos na sua região. Traga-os para a Materra Elo.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'rgba(255,215,0,0.1)', border: '1px solid var(--primary-500)', color: 'var(--primary-500)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>2</div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 'bold', margin: '0 0 6px' }}>Anúncio Preservado</h4>
                      <p style={{ color: '#aaa', fontSize: '0.9rem', margin: 0 }}>Publique o material mantendo o CNPJ da fonte original oculto na vitrine pública. Somente o seu contato de Corretor será exibido para as propostas.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'rgba(255,215,0,0.1)', border: '1px solid var(--primary-500)', color: 'var(--primary-500)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>3</div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 'bold', margin: '0 0 6px' }}>Comissionamento Blindado</h4>
                      <p style={{ color: '#aaa', fontSize: '0.9rem', margin: 0 }}>Todas as ofertas logísticas e transações geram contratos digitais seguros na plataforma, assegurando o seu percentual de intermediação.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* SEÇÃO PARA CORRETORES */}
      <section id="controladores" style={{ padding: '80px 20px', background: '#000', borderBottom: '1px solid #111' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '48px', alignItems: 'center' }}>
            
            <div>
              <span style={{ color: 'var(--primary-500)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.15em' }}>Oportunidade</span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginTop: '10px', marginBottom: '20px' }}>
                Multiplique seus Resultados como Controlador Homologado
              </h2>
              <p style={{ color: '#aaa', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '24px' }}>
                A Materra Elo é a maior aliada do Controlador de Resíduos. Nossa plataforma oferece ferramentas exclusivas para você gerenciar clientes representados, intermediar operações e receber relatórios de MTR e CDF sem burocracia.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div style={{ borderLeft: '3px solid var(--primary-500)', paddingLeft: '16px' }}>
                  <h4 style={{ color: '#fff', margin: '0 0 4px', fontSize: '1rem' }}>Comissão Garantida</h4>
                  <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>Faturamento blindado através do fluxo da plataforma.</p>
                </div>
                <div style={{ borderLeft: '3px solid var(--primary-500)', paddingLeft: '16px' }}>
                  <h4 style={{ color: '#fff', margin: '0 0 4px', fontSize: '1rem' }}>Representação Total</h4>
                  <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>Lance anúncios preservando a privacidade das suas fontes.</p>
                </div>
              </div>

              <Link href="/auth/cadastro?role=usuario" style={{
                background: 'var(--primary-500)',
                color: '#000',
                padding: '12px 28px',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block'
              }}>
                Quero ser Corretor
              </Link>
            </div>

            <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '24px', padding: '36px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '20px' }}>Painel do Corretor (Módulo Exclusivo)</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#121212', border: '1px solid #222', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#ffd700', fontSize: '0.8rem', fontWeight: 'bold' }}>✓ Ficha Representada Ativa</span>
                    <span style={{ color: '#888', fontSize: '0.75rem' }}>ID: Ref-9923</span>
                  </div>
                  <strong style={{ color: '#fff', display: 'block', fontSize: '0.95rem' }}>USINA BIOENERGIA DO NORTE</strong>
                  <span style={{ color: '#666', fontSize: '0.8rem' }}>Representado por: Você (Corretor)</span>
                </div>

                <div style={{ background: '#121212', border: '1px solid #222', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#ffd700', fontSize: '0.8rem', fontWeight: 'bold' }}>✓ Ficha Representada Ativa</span>
                    <span style={{ color: '#888', fontSize: '0.75rem' }}>ID: Ref-1042</span>
                  </div>
                  <strong style={{ color: '#fff', display: 'block', fontSize: '0.95rem' }}>METALÚRGICA SÃO PEDRO S/A</strong>
                  <span style={{ color: '#666', fontSize: '0.8rem' }}>Representado por: Você (Corretor)</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* MERCADO POTENCIAL (IMPOSTOMETRO) */}
      <section id="mercado-potencial" style={{ padding: '80px 20px', background: '#050505', borderBottom: '1px solid #111' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ color: 'var(--primary-500)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.15em' }}>Dados do Setor</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginTop: '10px' }}>
              O Brasil é a maior fazenda do planeta — e a maior pilha de coprodutos também
            </h2>
            <p style={{ color: '#aaa', maxWidth: '750px', margin: '16px auto 0', fontSize: '1.05rem', lineHeight: '1.6' }}>
              Nove fluxos do agro, da pecuária e da infraestrutura, todos com dados publicados por entidades setoriais de credibilidade. Cada parceiro cadastrado na Materra Elo otimiza esse volume.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {IMPOSTOMETRO_DADOS.map((item, idx) => {
              const secVal = item.t / SEG_ANO
              const moneyVal = item.r / SEG_ANO
              const currentVolume = secVal * (elapsedTime / 1000)
              const currentValue = moneyVal * (elapsedTime / 1000)

              totalVolume += currentVolume
              totalValue += currentValue

              return (
                <div 
                  key={idx} 
                  style={{
                    background: '#0a0a0a',
                    border: '1px solid #222',
                    borderRadius: '16px',
                    padding: '24px',
                    position: 'relative',
                    transition: 'border-color 0.2s'
                  }}
                  className="hover-card"
                >
                  <div style={{ color: '#666', fontSize: '0.75rem', fontWeight: 'bold', position: 'absolute', top: '16px', right: '16px' }}>
                    0{idx + 1}
                  </div>

                  <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold', marginBottom: '6px', paddingRight: '20px' }}>
                    {item.flow}
                  </h3>
                  <div style={{ color: '#888', fontSize: '0.75rem', marginBottom: '16px' }}>
                    {item.meta}
                  </div>

                  <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', marginBottom: '2px' }}>
                    Gerado desde que abriu:
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-500)', marginBottom: '12px' }}>
                    {fmt2(currentVolume)} {item.u}
                  </div>

                  <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', marginBottom: '2px' }}>
                    Valor reciclável aproximado:
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 900, color: '#4caf50', marginBottom: '16px' }}>
                    {fmtR(currentValue)}
                  </div>

                  <div style={{ borderTop: '1px solid #111', paddingTop: '10px', fontSize: '0.75rem', color: '#666' }}>
                    Taxa: {item.rate}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Totals Summary */}
          <div style={{
            background: '#0a0a0a',
            border: '1px solid var(--primary-500)',
            borderRadius: '20px',
            padding: '32px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            textAlign: 'center'
          }} className="pulse-card">
            <div>
              <div style={{ fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '6px' }}>
                Total acumulado nesta sessão (t + m³)
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-500)' }}>
                {fmt2(totalVolume)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '6px' }}>
                Valor reciclável total acumulado
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '2.5rem', fontWeight: 900, color: '#4caf50' }}>
                {fmtR(totalValue)}
              </div>
            </div>
          </div>

          <p style={{ color: '#555', fontSize: '0.75rem', marginTop: '20px', textAlign: 'center' }}>
            Estimativas com base em dados públicos da UNICA, UNEM, ABPA, CitrusBR, ANP, CIBiogás, ABRECON e IRGA. Cada fornecedor que entra na Materra Elo é um pedaço desse fluxo.
          </p>

          {/* ── OPORTUNIDADE DE MERCADO ── */}
          <div style={{
            marginTop: '60px',
            background: 'linear-gradient(160deg, #090909 0%, #0a0a06 100%)',
            border: '1px solid rgba(255,215,0,0.15)',
            borderRadius: '20px',
            padding: '40px 32px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,215,0,0.06)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <span style={{ color: 'var(--primary-500)', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.15em' }}>
                Oportunidade de Mercado
              </span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', marginTop: '10px', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                O gap que ninguém está capturando
              </h3>
              <p style={{ color: '#777', fontSize: '0.9rem', lineHeight: '1.6', maxWidth: '620px', margin: '0 auto' }}>
                Enquanto o Brasil produz um oceano de coprodutos e resíduos industriais por ano, a demanda com compliance e bons negócios supera em muito o que está sendo ofertado formalmente no mercado.
              </p>
            </div>

            {/* 3 big counters */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              {/* Produzido */}
              <div style={{
                background: '#0d0d0d',
                border: '1px solid #222',
                borderTop: '3px solid rgba(255,215,0,0.5)',
                borderRadius: '14px',
                padding: '28px 24px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', fontWeight: 700 }}>
                  Gerado no Brasil / ano
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '2.4rem', fontWeight: 900, color: '#ffd700', lineHeight: 1, marginBottom: '6px' }}>
                  {(756_000_000 / 1_000_000).toFixed(0)}M
                </div>
                <div style={{ fontSize: '0.85rem', color: '#888' }}>toneladas de resíduos e coprodutos</div>
                <div style={{ marginTop: '12px', fontSize: '0.72rem', color: '#444', lineHeight: '1.5' }}>
                  Agro + indústria + infraestrutura
                </div>
              </div>

              {/* Anunciado */}
              <div style={{
                background: '#0d0d0d',
                border: '1px solid #222',
                borderTop: '3px solid rgba(100,180,255,0.5)',
                borderRadius: '14px',
                padding: '28px 24px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', fontWeight: 700 }}>
                  Ofertado formalmente / ano
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '2.4rem', fontWeight: 900, color: '#64b4ff', lineHeight: 1, marginBottom: '6px' }}>
                  ~38M
                </div>
                <div style={{ fontSize: '0.85rem', color: '#888' }}>toneladas em fluxo rastreável</div>
                <div style={{ marginTop: '12px', fontSize: '0.72rem', color: '#444', lineHeight: '1.5' }}>
                  Estimativa de circulação documentada no setor
                </div>
              </div>

              {/* Demandado */}
              <div style={{
                background: '#0a0d0a',
                border: '1px solid #1a2a1a',
                borderTop: '3px solid rgba(74,222,128,0.6)',
                borderRadius: '14px',
                padding: '28px 24px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute', top: '10px', right: '10px',
                  background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)',
                  borderRadius: '6px', padding: '2px 8px',
                  fontSize: '0.62rem', color: '#4ade80', fontWeight: 700, letterSpacing: '0.08em'
                }}>
                  ALTA DEMANDA
                </div>
                <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', fontWeight: 700 }}>
                  Demandado com compliance / ano
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '2.4rem', fontWeight: 900, color: '#4ade80', lineHeight: 1, marginBottom: '6px' }}>
                  &gt;290M
                </div>
                <div style={{ fontSize: '0.85rem', color: '#888' }}>toneladas procuradas por compradores</div>
                <div style={{ marginTop: '12px', fontSize: '0.72rem', color: '#444', lineHeight: '1.5' }}>
                  Indústria, reciclagem, energia e logística reversa
                </div>
              </div>
            </div>

            {/* Gap bar */}
            <div style={{
              background: '#0a0a0a',
              border: '1px solid rgba(74,222,128,0.2)',
              borderLeft: '4px solid #4ade80',
              borderRadius: '12px',
              padding: '20px 24px',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: '1.6rem', flexShrink: 0, filter: 'drop-shadow(0 0 8px rgba(74,222,128,0.6))' }}>🚀</span>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#4ade80', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  O gap é a sua oportunidade
                </div>
                <div style={{ fontSize: '0.83rem', color: '#999', lineHeight: '1.65' }}>
                  Mais de <strong style={{ color: '#fff' }}>250 milhões de toneladas</strong> de demanda ativa aguardam contrapartes com compliance, performance e preço. Se você é Controlador, Fornecedor ou Comprador — anunciar aqui é capturar um mercado invisível que já existe, mas ainda não tem onde negociar com segurança.
                </div>
              </div>
            </div>
          </div>
          {/* ── END OPORTUNIDADE ── */}

        </div>
      </section>


      {/* FACTORY IMAGES SECTION */}
      <section style={{ padding: '60px 20px', background: '#000', borderBottom: '1px solid #111' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{ color: 'var(--primary-500)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.15em' }}>Nossa Rede</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
              De onde vêm os coprodutos e insumos recicláveis negociados
            </h3>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            <div style={{ overflow: 'hidden', borderRadius: '16px', border: '1px solid #222', background: '#050505', position: 'relative' }}>
              <img src="/factory1.png" alt="Bioenergia cana" className="factory-img" style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '16px' }}>
                <strong style={{ color: '#fff', fontSize: '0.95rem', display: 'block' }}>Usinas de Bioenergia & Agro</strong>
                <span style={{ color: '#666', fontSize: '0.8rem' }}>Geração de Bagaço, Vinhaça e cinzas de caldeira</span>
              </div>
            </div>

            <div style={{ overflow: 'hidden', borderRadius: '16px', border: '1px solid #222', background: '#050505', position: 'relative' }}>
              <img src="/factory2.png" alt="Reciclagem metal" className="factory-img" style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '16px' }}>
                <strong style={{ color: '#fff', fontSize: '0.95rem', display: 'block' }}>Complexos Industriais de Reciclagem</strong>
                <span style={{ color: '#666', fontSize: '0.8rem' }}>Separação e refino de sucata ferrosa e RCC</span>
              </div>
            </div>

            <div style={{ overflow: 'hidden', borderRadius: '16px', border: '1px solid #222', background: '#050505', position: 'relative' }}>
              <img src="/factory3.png" alt="Insumos quimicos" className="factory-img" style={{ width: '100%', height: '220px', objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '16px' }}>
                <strong style={{ color: '#fff', fontSize: '0.95rem', display: 'block' }}>Indústrias Químicas & Fertilizantes</strong>
                <span style={{ color: '#666', fontSize: '0.8rem' }}>Destinação de cinzas, borras e efluentes tratados</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PERGUNTAS FREQUENTES (FAQ) */}
      <section id="faq" style={{ padding: '80px 20px', background: '#050505', borderBottom: '1px solid #111' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ color: 'var(--primary-500)', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.15em' }}>FAQ</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginTop: '10px' }}>
              Dúvidas Frequentes
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                q: "Como funciona a negociação e o sistema de lances?",
                a: "A negociação ocorre de forma humanizada e assistida. Ao clicar em 'Tenho interesse' em qualquer anúncio, o usuário é direcionado ao WhatsApp comercial com o código correspondente do anúncio. Toda negociação contratual e a condução dos lances ocorrem em ambiente seguro via assessoria comercial Materra."
              },
              {
                q: "O que é e quanto custa a Ficha Materra?",
                a: "A Ficha Materra é o cadastro reputacional e de compliance da sua empresa. A criação da ficha básica é gratuita e necessária para começar a negociar. Para homologações adicionais de licenças ou selo Ouro, existem planos mensais dedicados."
              },
              {
                q: "Quais licenças são exigidas para transportadoras?",
                a: "Para operar fretes na Materra Elo, a transportadora deve enviar obrigatoriamente a Licença Ambiental de Transporte válida e o certificado de registro no RNTRC da ANTT. A documentação passa por verificação humana."
              },
              {
                q: "A plataforma emite MTR e CDF?",
                a: "Sim. A Materra Elo fornece suporte para integração do histórico de Manifesto de Transporte de Resíduos (MTR) e Certificado de Destinação Final (CDF) de todas as transações fechadas dentro do painel do cliente."
              }
            ].map((faq, i) => (
              <div 
                key={i} 
                style={{
                  background: '#0a0a0a',
                  border: '1px solid #222',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => toggleFaq(i)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <strong style={{ color: '#fff', fontSize: '1rem' }}>{faq.q}</strong>
                  <span style={{ color: 'var(--primary-500)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {faqOpen[i] ? '−' : '+'}
                  </span>
                </button>
                
                {faqOpen[i] && (
                  <div style={{ padding: '0 24px 20px', color: '#aaa', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section style={{
        padding: '100px 20px',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #000000 100%)',
        textAlign: 'center',
        borderBottom: '1px solid #111'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginBottom: '20px' }}>
            Pronto para monetizar seus coprodutos com segurança jurídica?
          </h2>
          <p style={{ color: '#aaa', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '40px' }}>
            Junte-se a centenas de empresas que negociam coprodutos diariamente na plataforma B2B de resíduos mais confiável do Brasil.
          </p>

          <Link href="/auth/cadastro" style={{
            background: 'var(--primary-500)',
            color: '#000',
            padding: '16px 40px',
            fontSize: '1.05rem',
            fontWeight: 800,
            borderRadius: '8px',
            textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
            display: 'inline-block'
          }}>
            Cadastrar Minha Empresa Agora
          </Link>
        </div>
      </section>

    </div>
  )
}
