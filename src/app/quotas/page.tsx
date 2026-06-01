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
  tendencia: 'up' | 'down'
}

interface TransporteCotacao {
  categoria: string
  eixos: string
  precoKm: string
}

export default function QuotasPage() {
  const [residuoSearch, setResiduoSearch] = useState('')
  const [transporteSearch, setTransporteSearch] = useState('')

  const residuosList: ResiduoCotacao[] = [
    { nome: 'Cobre', categoria: 'Metais', preco: 'R$ 35.000 / t', tendencia: 'up' },
    { nome: 'Alumínio', categoria: 'Metais', preco: 'R$ 6.500 / t', tendencia: 'up' },
    { nome: 'Latas de alumínio', categoria: 'Metais', preco: 'R$ 5.500 / t', tendencia: 'up' },
    { nome: 'Aço', categoria: 'Metais', preco: 'R$ 600 / t', tendencia: 'up' },
    { nome: 'Sucata ferrosa', categoria: 'Metais', preco: 'R$ 634 / t', tendencia: 'up' },
    { nome: 'PP', categoria: 'Plásticos', preco: 'R$ 2.500 / t', tendencia: 'up' },
    { nome: 'PET', categoria: 'Plásticos', preco: 'R$ 1.900 / t', tendencia: 'up' },
    { nome: 'PEBD', categoria: 'Plásticos', preco: 'R$ 1.800 / t', tendencia: 'up' },
    { nome: 'EPS isopor', categoria: 'Plásticos', preco: 'R$ 1.500 / t', tendencia: 'up' },
    { nome: 'Papelão ondulado', categoria: 'Papel/Papelão', preco: 'R$ 600 / t', tendencia: 'up' },
    { nome: 'Embalagem longa vida', categoria: 'Papel/Papelão', preco: 'R$ 500 / t', tendencia: 'up' },
    { nome: 'Caco de vidro', categoria: 'Vidro', preco: 'R$ 120 / t', tendencia: 'up' },
    { nome: 'Resíduo de abatedouro', categoria: 'Orgânicos', preco: 'R$ 150 / t', tendencia: 'up' },
    { nome: 'Bagaço', categoria: 'Orgânicos', preco: 'R$ 50 / t', tendencia: 'up' },
    { nome: 'Torta de filtro', categoria: 'Fertilizante', preco: 'R$ 60 / t', tendencia: 'up' },
    { nome: 'Cama de frango', categoria: 'Fertilizante', preco: 'R$ 70 / t', tendencia: 'up' },
    { nome: 'Vinhaça', categoria: 'Fertilizante', preco: 'R$ 0 / m³ (doação/troca)', tendencia: 'up' },
    { nome: 'Pallets', categoria: 'Madeira', preco: 'R$ 0 / un (doação/troca)', tendencia: 'up' },
    { nome: 'Pneus inservíveis', categoria: 'Borracha', preco: 'R$ 0 / un (coleta)', tendencia: 'up' },
    { nome: 'Óleo lubrificante', categoria: 'Óleos/graxas', preco: 'R$ 0 / m³ (coleta)', tendencia: 'up' },
    { nome: 'Lodo de ETE', categoria: 'Lodos', preco: '-R$ 200 / t (paga p/ destinar)', tendencia: 'down' },
    { nome: 'Lodo industrial', categoria: 'Lodos', preco: '-R$ 350 / t (paga p/ destinar)', tendencia: 'down' },
    { nome: 'Cinzas de caldeira', categoria: 'Outros', preco: '-R$ 100 / t (paga p/ destinar)', tendencia: 'down' },
    { nome: 'Resíduo Classe II', categoria: 'Outros', preco: '-R$ 190 / t (paga p/ destinar)', tendencia: 'down' },
    { nome: 'Tintas e borras', categoria: 'Químicos', preco: '-R$ 1.200 / t (paga p/ destinar)', tendencia: 'down' },
    { nome: 'Produtos fora de especificação', categoria: 'Outros', preco: '-R$ 900 / t (paga p/ destinar)', tendencia: 'down' },
    { nome: 'Reagentes vencidos', categoria: 'Químicos', preco: '-R$ 5 / kg (paga p/ destinar)', tendencia: 'down' },
    { nome: 'Resíduo de saúde RSS', categoria: 'Outros', preco: '-R$ 4 / kg (paga p/ destinar)', tendencia: 'down' },
  ]

  const transportesList: TransporteCotacao[] = [
    { categoria: 'Carga Geral', eixos: '2 eixos', precoKm: 'R$ 4,00' },
    { categoria: 'Carga Geral', eixos: '3 eixos', precoKm: 'R$ 5,13' },
    { categoria: 'Carga Geral', eixos: '4 eixos', precoKm: 'R$ 5,82' },
    { categoria: 'Carga Geral', eixos: '5 eixos', precoKm: 'R$ 6,71' },
    { categoria: 'Carga Geral', eixos: '6 eixos', precoKm: 'R$ 7,41' },
    { categoria: 'Carga Geral', eixos: '7 eixos', precoKm: 'R$ 8,13' },
    { categoria: 'Carga Geral', eixos: '9 eixos', precoKm: 'R$ 9,25' },
    { categoria: 'Perigosa Geral', eixos: '2 eixos', precoKm: 'R$ 4,36' },
    { categoria: 'Perigosa Geral', eixos: '3 eixos', precoKm: 'R$ 5,50' },
    { categoria: 'Perigosa Geral', eixos: '4 eixos', precoKm: 'R$ 6,20' },
    { categoria: 'Perigosa Geral', eixos: '5 eixos', precoKm: 'R$ 7,15' },
    { categoria: 'Perigosa Geral', eixos: '6 eixos', precoKm: 'R$ 7,90' },
    { categoria: 'Perigosa Geral', eixos: '7 eixos', precoKm: 'R$ 8,65' },
    { categoria: 'Perigosa Geral', eixos: '9 eixos', precoKm: 'R$ 9,80' },
    { categoria: 'Granel Sólido', eixos: '2 eixos', precoKm: 'R$ 4,20' },
    { categoria: 'Granel Sólido', eixos: '3 eixos', precoKm: 'R$ 5,30' },
    { categoria: 'Granel Sólido', eixos: '4 eixos', precoKm: 'R$ 5,95' },
    { categoria: 'Granel Sólido', eixos: '5 eixos', precoKm: 'R$ 6,85' },
    { categoria: 'Granel Sólido', eixos: '6 eixos', precoKm: 'R$ 7,60' },
    { categoria: 'Granel Sólido', eixos: '7 eixos', precoKm: 'R$ 8,35' },
    { categoria: 'Granel Sólido', eixos: '9 eixos', precoKm: 'R$ 9,50' },
  ]

  const filteredResiduos = residuosList.filter(item =>
    item.nome.toLowerCase().includes(residuoSearch.toLowerCase()) ||
    item.categoria.toLowerCase().includes(residuoSearch.toLowerCase())
  )

  const filteredTransportes = transportesList.filter(item =>
    item.categoria.toLowerCase().includes(transporteSearch.toLowerCase()) ||
    item.eixos.toLowerCase().includes(transporteSearch.toLowerCase())
  )

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
            Acompanhe em tempo real o preço médio praticado no mercado para lotes de resíduos industriais e as tarifas referenciadas de transporte rodoviário por eixo.
          </p>
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

            <div style={{ overflowX: 'auto', maxHeight: '550px', overflowY: 'auto' }}>
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
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 'bold', color: item.preco.startsWith('-') ? '#ff5353' : '#4caf50' }}>
                        {item.preco}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', color: item.tendencia === 'up' ? 'var(--primary-500)' : '#ff5353', fontWeight: 'bold' }}>
                        {item.tendencia === 'up' ? '▲' : '▼'}
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
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-500)' }}>Index de Transporte km</h2>
                <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '2px' }}>Referência rodoviária por eixo (ANTT / Acordos)</p>
              </div>
              <input
                type="text"
                placeholder="Filtrar eixos/carga..."
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

            <div style={{ overflowX: 'auto', maxHeight: '550px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #222', color: '#888' }}>
                    <th style={{ padding: '12px 8px' }}>Tipo de Carga</th>
                    <th style={{ padding: '12px 8px' }}>Configuração</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Valor por Km rodado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransportes.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #1a1a1a' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 'bold', color: '#fff' }}>{item.categoria}</td>
                      <td style={{ padding: '12px 8px', color: '#aaa' }}>{item.eixos}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 'bold', color: 'var(--primary-500)' }}>
                        {item.precoKm}
                      </td>
                    </tr>
                  ))}
                  {filteredTransportes.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: '#666' }}>Nenhuma configuração correspondente.</td>
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
            Nota: Todas as cotações apresentadas acima servem como referencial consultivo de negociação e estimativa de custos. As propostas finais e lances reais de fechamento de cada lote e rota são auditados e acordados caso a caso via Concierge Materra Elo.
          </p>
        </div>
      </div>
    </div>
  )
}
