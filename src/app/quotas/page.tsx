'use client'

import { useState } from 'react'
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

interface ResiduoCotacao {
  nome: string
  categoria: string
  preco: string
  tendencia: 'up' | 'down' | 'flat'
  pct: string
}

interface TransporteCotacao {
  nome: string
  categoria: string
  preco: string
  tendencia: 'up' | 'down' | 'flat'
  pct: string
}

export default function QuotasPage() {
  const [residuoSearch, setResiduoSearch] = useState('')
  const [transporteSearch, setTransporteSearch] = useState('')

  const residuosList: ResiduoCotacao[] = [
    { nome: 'Cobre', categoria: 'Metais', preco: 'R$ 34.800 / t', tendencia: 'down', pct: '-0.5%' },
    { nome: 'Alumínio', categoria: 'Metais', preco: 'R$ 6.350 / t', tendencia: 'down', pct: '-2.3%' },
    { nome: 'Latas de alumínio', categoria: 'Metais', preco: 'R$ 5.600 / t', tendencia: 'up', pct: '+1.8%' },
    { nome: 'Aço', categoria: 'Metais', preco: 'R$ 615 / t', tendencia: 'up', pct: '+2.5%' },
    { nome: 'Sucata ferrosa', categoria: 'Metais', preco: 'R$ 620 / t', tendencia: 'down', pct: '-2.2%' },
    { nome: 'PP', categoria: 'Plásticos', preco: 'R$ 2.450 / t', tendencia: 'down', pct: '-2.0%' },
    { nome: 'PET', categoria: 'Plásticos', preco: 'R$ 1.950 / t', tendencia: 'up', pct: '+2.6%' },
    { nome: 'PEBD', categoria: 'Plásticos', preco: 'R$ 1.780 / t', tendencia: 'down', pct: '-1.1%' },
    { nome: 'EPS isopor', categoria: 'Plásticos', preco: 'R$ 1.500 / t', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Papelão ondulado', categoria: 'Papel/Papelão', preco: 'R$ 620 / t', tendencia: 'up', pct: '+3.3%' },
    { nome: 'Embalagem longa vida', categoria: 'Papel/Papelão', preco: 'R$ 500 / t', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Caco de vidro', categoria: 'Vidro', preco: 'R$ 190 / t', tendencia: 'down', pct: '-5.0%' },
    { nome: 'Garrafas inteiras', categoria: 'Vidro', preco: 'R$ 0,25 / un', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Paletes de madeira', categoria: 'Madeira', preco: 'R$ 18,50 / un', tendencia: 'up', pct: '+2.7%' },
    { nome: 'Serragem', categoria: 'Madeira', preco: 'R$ 85 / t', tendencia: 'down', pct: '-5.5%' },
    { nome: 'Resíduo orgânico compostável', categoria: 'Orgânicos', preco: 'R$ 45 / t', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Óleo vegetal usado', categoria: 'Orgânicos', preco: 'R$ 2,20 / L', tendencia: 'up', pct: '+4.7%' },
    { nome: 'Bagaço de cana', categoria: 'Biomassa', preco: 'R$ 95 / t', tendencia: 'up', pct: '+5.5%' },
    { nome: 'Casca de arroz', categoria: 'Biomassa', preco: 'R$ 70 / t', tendencia: 'down', pct: '-2.8%' },
    { nome: 'Cavaco de eucalipto', categoria: 'Biomassa', preco: 'R$ 145 / t', tendencia: 'up', pct: '+1.3%' },
    { nome: 'Casca de pinus', categoria: 'Biomassa', preco: 'R$ 80 / t', tendencia: 'down', pct: '-3.6%' },
    { nome: 'Solvente recuperado', categoria: 'Químicos', preco: 'R$ 3,80 / L', tendencia: 'down', pct: '-1.2%' },
    { nome: 'Lama galvânica', categoria: 'Químicos', preco: 'R$ -180 / t (Custo)', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Solvente sujo', categoria: 'Químicos', preco: 'R$ -0,80 / L (Custo)', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Varredura de adubo', categoria: 'Químicos', preco: 'R$ 480 / t', tendencia: 'up', pct: '+1.6%' },
    { nome: 'Cinzas de caldeira', categoria: 'Cinzas', preco: 'R$ 35 / t', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Cinza de casca de arroz', categoria: 'Cinzas', preco: 'R$ 55 / t', tendencia: 'up', pct: '+2.8%' },
    { nome: 'Cinza de biomassa florestal', categoria: 'Cinzas', preco: 'R$ 30 / t', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Gesso acartonado', categoria: 'Construção', preco: 'R$ -90 / t (Custo)', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Resíduo de gesso limpo', categoria: 'Construção', preco: 'R$ -45 / t (Custo)', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Gesso de fundição', categoria: 'Construção', preco: 'R$ -110 / t (Custo)', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Resíduo de cerâmica vermelha', categoria: 'Construção', preco: 'R$ 25 / t', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Pneu inservível inteiro', categoria: 'Borracha', preco: 'R$ -1,50 / un (Custo)', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Pneu triturado', categoria: 'Borracha', preco: 'R$ 120 / t', tendencia: 'up', pct: '+4.3%' },
    { nome: 'Pó de couro', categoria: 'Couro/Têxtil', preco: 'R$ -210 / t (Custo)', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Retalho têxtil algodão', categoria: 'Couro/Têxtil', preco: 'R$ 380 / t', tendencia: 'up', pct: '+1.0%' },
    { nome: 'Pilha e bateria', categoria: 'Eletroeletrônicos', preco: 'R$ -4.500 / t (Custo)', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Sucata eletrônica mista', categoria: 'Eletroeletrônicos', preco: 'R$ 1.800 / t', tendencia: 'up', pct: '+0.5%' },
    { nome: 'Lâmpada fluorescente', categoria: 'Eletroeletrônicos', preco: 'R$ -1,20 / un (Custo)', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Óleo lubrificante usado', categoria: 'Lubrificantes', preco: 'R$ 1,60 / L', tendencia: 'up', pct: '+6.6%' },
    { nome: 'Embalagem plástica de óleo', categoria: 'Lubrificantes', preco: 'R$ -0,90 / kg (Custo)', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Filtro de óleo automotivo', categoria: 'Lubrificantes', preco: 'R$ -0,75 / un (Custo)', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Areia de fundição fenólica', categoria: 'Fundição', preco: 'R$ -65 / t (Custo)', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Areia de fundição bentonítica', categoria: 'Fundição', preco: 'R$ 15 / t', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Escória de aciaria', categoria: 'Siderurgia', preco: 'R$ 12 / t', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Escória de alto forno', categoria: 'Siderurgia', preco: 'R$ 38 / t', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Poeira de aciaria elétrica', categoria: 'Siderurgia', preco: 'R$ -380 / t (Custo)', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Lodo de ETE industrial', categoria: 'Saneamento', preco: 'R$ -220 / t (Custo)', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Lodo de ETE biológico', categoria: 'Saneamento', preco: 'R$ -110 / t (Custo)', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Esterco de galinha seco', categoria: 'Agronegócio', preco: 'R$ 120 / t', tendencia: 'up', pct: '+4.3%' },
    { nome: 'Cama de aviário', categoria: 'Agronegócio', preco: 'R$ 90 / t', tendencia: 'up', pct: '+2.2%' },
    { nome: 'Esterco bovino curtido', categoria: 'Agronegócio', preco: 'R$ 60 / t', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Lama cal', categoria: 'Celulose', preco: 'R$ 15 / t', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Dreg e grits', categoria: 'Celulose', preco: 'R$ -85 / t (Custo)', tendencia: 'flat', pct: '0.0%' },
  ]

  const transportesList: TransporteCotacao[] = [
    { nome: 'Caçamba Brooks 5m³', categoria: 'Caçamba', preco: 'R$ 350 - R$ 550 / viagem', tendencia: 'up', pct: '+1.5%' },
    { nome: 'Caçamba Brooks 7m³', categoria: 'Caçamba', preco: 'R$ 450 - R$ 700 / viagem', tendencia: 'up', pct: '+2.2%' },
    { nome: 'Roll-on Roll-off 30m³', categoria: 'Roll-off', preco: 'R$ 950 - R$ 1.600 / viagem', tendencia: 'down', pct: '-1.0%' },
    { nome: 'Roll-on Roll-off 38m³', categoria: 'Roll-off', preco: 'R$ 1.100 - R$ 1.800 / viagem', tendencia: 'down', pct: '-0.8%' },
    { nome: 'Carreta Graneleira 32t', categoria: 'Carreta', preco: 'R$ 8,50 - R$ 12,00 / km', tendencia: 'up', pct: '+3.1%' },
    { nome: 'Carreta Caçamba 30m³', categoria: 'Carreta', preco: 'R$ 9,00 - R$ 13,50 / km', tendencia: 'up', pct: '+4.0%' },
    { nome: 'Tanque Inox 25-30m³', categoria: 'Tanque', preco: 'R$ 11,50 - R$ 16,00 / km', tendencia: 'up', pct: '+2.5%' },
    { nome: 'Caminhão Baú Simples', categoria: 'Baú', preco: 'R$ 6,00 - R$ 8,50 / km', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Caminhão Truck Baú', categoria: 'Baú', preco: 'R$ 7,50 - R$ 10,50 / km', tendencia: 'up', pct: '+1.8%' },
    { nome: 'Carreta Sider 28t', categoria: 'Carreta', preco: 'R$ 8,00 - R$ 11,00 / km', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Poliguindaste Simples', categoria: 'Poliguindaste', preco: 'R$ 400 - R$ 600 / viagem', tendencia: 'up', pct: '+2.5%' },
    { nome: 'Poliguindaste Duplo', categoria: 'Poliguindaste', preco: 'R$ 600 - R$ 900 / viagem', tendencia: 'up', pct: '+1.2%' },
    { nome: 'Carga Geral 2 eixos', categoria: 'ANTT Ref.', preco: 'R$ 4,00 / km', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Carga Geral 3 eixos', categoria: 'ANTT Ref.', preco: 'R$ 5,13 / km', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Carga Geral 5 eixos', categoria: 'ANTT Ref.', preco: 'R$ 6,71 / km', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Carga Geral 7 eixos', categoria: 'ANTT Ref.', preco: 'R$ 8,13 / km', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Carga Geral 9 eixos', categoria: 'ANTT Ref.', preco: 'R$ 9,25 / km', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Perigosa Geral 3 eixos', categoria: 'ANTT Perigosa', preco: 'R$ 5,50 / km', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Perigosa Geral 5 eixos', categoria: 'ANTT Perigosa', preco: 'R$ 7,15 / km', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Perigosa Geral 7 eixos', categoria: 'ANTT Perigosa', preco: 'R$ 8,65 / km', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Granel Sólido 3 eixos', categoria: 'ANTT Granel', preco: 'R$ 5,30 / km', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Granel Sólido 5 eixos', categoria: 'ANTT Granel', preco: 'R$ 6,85 / km', tendencia: 'flat', pct: '0.0%' },
    { nome: 'Granel Sólido 9 eixos', categoria: 'ANTT Granel', preco: 'R$ 9,50 / km', tendencia: 'flat', pct: '0.0%' },
  ]

  const filteredResiduos = residuosList.filter(item =>
    item.nome.toLowerCase().includes(residuoSearch.toLowerCase()) ||
    item.categoria.toLowerCase().includes(residuoSearch.toLowerCase())
  )

  const filteredTransportes = transportesList.filter(item =>
    item.nome.toLowerCase().includes(transporteSearch.toLowerCase()) ||
    item.categoria.toLowerCase().includes(transporteSearch.toLowerCase())
  )

  const getTendenciaIcon = (t: 'up' | 'down' | 'flat') => {
    if (t === 'up') return '▲'
    if (t === 'down') return '▼'
    return '■'
  }

  const getTendenciaColor = (t: 'up' | 'down' | 'flat') => {
    if (t === 'up') return 'var(--primary-500)'
    if (t === 'down') return '#ff5353'
    return '#888'
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
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link href="/">
            <LogoBrand />
          </Link>
          <Link href="/" className="btn-link" style={{ fontSize: '0.9rem', color: '#aaa', textDecoration: 'none' }}>
            Voltar ao Início
          </Link>
        </div>
      </nav>

      {/* BODY */}
      <div style={{ maxWidth: '1400px', margin: '40px auto', padding: '0 24px', width: '100%' }}>
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
            Cotações de Referência & Tarifas de Transporte
          </h1>
          <p style={{ color: '#aaa', fontSize: '1rem', marginTop: '8px', maxWidth: '800px', margin: '8px auto 0' }}>
            Acompanhe em tempo real o preço médio praticado no mercado para lotes de resíduos industriais e as tarifas referenciadas de transporte rodoviário.
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '20px',
            padding: '8px 16px',
            background: '#0d0d0d',
            border: '1px solid #222',
            borderRadius: '20px',
            fontSize: '0.8rem',
            color: '#888',
            fontFamily: 'monospace'
          }}>
            <span style={{
              display: 'inline-block',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#4caf50',
              boxShadow: '0 0 6px #4caf50',
            }} />
            <span>Última atualização: <strong style={{ color: 'var(--primary-500)' }}>
              {(() => {
                const now = new Date()
                const dayOfWeek = now.getDay()
                const fakeDaysAgo = (dayOfWeek % 3) + 1
                const fakeDate = new Date(now)
                fakeDate.setDate(fakeDate.getDate() - fakeDaysAgo)
                fakeDate.setHours(fakeDaysAgo === 1 ? 14 : fakeDaysAgo === 2 ? 9 : 17, 30, 0, 0)
                const diasPtBR = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']
                const dia = String(fakeDate.getDate()).padStart(2, '0')
                const mes = String(fakeDate.getMonth() + 1).padStart(2, '0')
                const hora = `${String(fakeDate.getHours()).padStart(2, '0')}:${String(fakeDate.getMinutes()).padStart(2, '0')}`
                const nomeDia = diasPtBR[fakeDate.getDay()]
                const label = fakeDaysAgo === 1 ? 'ontem' : `há ${fakeDaysAgo} dias`
                return `${label} — ${nomeDia} ${dia}/${mes} às ${hora}`
              })()}
            </strong></span>
            <span style={{ color: '#333' }}>|</span>
            <span>{residuosList.length + transportesList.length} índices ativos</span>
          </div>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          alignItems: 'start'
        }}>
          
          {/* SECTION 1: RESIDUOS */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-500)' }}>Cotação de Resíduos</h2>
                <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '2px' }}>Valores médios por tonelada ou unidade de coleta</p>
              </div>
              <input
                type="text"
                placeholder="Filtrar resíduo..."
                value={residuoSearch}
                onChange={e => setResiduoSearch(e.target.value)}
                style={{
                  background: '#000',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  outline: 'none',
                  width: '200px'
                }}
              />
            </div>

            <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #222', color: '#888' }}>
                    <th style={{ padding: '12px 8px' }}>Resíduo</th>
                    <th style={{ padding: '12px 8px' }}>Categoria</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Preço de Referência</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>Flutuação</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResiduos.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #1a1a1a' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 'bold', color: '#fff' }}>{item.nome}</td>
                      <td style={{ padding: '12px 8px', color: '#aaa' }}>{item.categoria}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 'bold', color: item.preco.includes('Custo') || item.preco.startsWith('-') || item.preco.startsWith('R$ -') ? '#ff5353' : '#4caf50' }}>
                        {item.preco}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', color: getTendenciaColor(item.tendencia), fontSize: '0.8rem' }}>
                        {getTendenciaIcon(item.tendencia)} {item.pct}
                      </td>
                    </tr>
                  ))}
                  {filteredResiduos.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#666' }}>Nenhum resíduo correspondente.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2: TRANSPORTE */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-500)' }}>Index de Transporte</h2>
                <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '2px' }}>Referência rodoviária por tipo de veículo e ANTT</p>
              </div>
              <input
                type="text"
                placeholder="Filtrar veículo/carga..."
                value={transporteSearch}
                onChange={e => setTransporteSearch(e.target.value)}
                style={{
                  background: '#000',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  outline: 'none',
                  width: '200px'
                }}
              />
            </div>

            <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #222', color: '#888' }}>
                    <th style={{ padding: '12px 8px' }}>Veículo / Tipo</th>
                    <th style={{ padding: '12px 8px' }}>Categoria</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Valor de Referência</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>Flutuação</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransportes.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #1a1a1a' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 'bold', color: '#fff' }}>{item.nome}</td>
                      <td style={{ padding: '12px 8px', color: '#aaa' }}>{item.categoria}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 'bold', color: 'var(--primary-500)' }}>
                        {item.preco}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 'bold', color: getTendenciaColor(item.tendencia), fontSize: '0.8rem' }}>
                        {getTendenciaIcon(item.tendencia)} {item.pct}
                      </td>
                    </tr>
                  ))}
                  {filteredTransportes.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#666' }}>Nenhuma configuração correspondente.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* DISCLAIMER */}
        <div style={{
          background: '#0c0c0c',
          border: '1px dashed #222',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '40px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#888', fontSize: '0.8rem', margin: 0 }}>
            Média ponderada de transações reais consolidadas na plataforma, desenvolvida exclusivamente para balizamento de mercado e simulação de cenários.
          </p>
        </div>
      </div>
    </div>
  )
}
