'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ACONDICIONAMENTOS, WHATSAPP_NUM } from '@/lib/constants'
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

export default function FretePage() {
  const supabase = createClient()

  // User auth context
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // Simulation / Request Form (Comprador)
  const [origem, setOrigem] = useState('')
  const [destino, setDestino] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [unidade, setUnidade] = useState('t')
  const [acondicionamento, setAcondicionamento] = useState('Granel')
  const [valorDesejado, setValorDesejado] = useState('')
  const [prazoColeta, setPrazoColeta] = useState('')
  const [tipoMaterial, setTipoMaterial] = useState('')
  const [temDocumento, setTemDocumento] = useState(false)

  // Simulation timer & results
  const [simulatedValue, setSimulatedValue] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [requesting, setRequesting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Transportadora listings
  const [auctions, setAuctions] = useState<any[]>([])
  const [loadingAuctions, setLoadingAuctions] = useState(true)

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
      setLoadingProfile(false)
    }
    loadData()
    fetchAuctions()
  }, [])

  async function fetchAuctions() {
    setLoadingAuctions(true)
    try {
      const { data, error } = await supabase
        .from('frete')
        .select('*')
        .eq('status', 'Aberto')

      if (error) throw error
      setAuctions(data || [])
    } catch (err) {
      console.error('Erro ao buscar leilões de frete:', err)
    } finally {
      setLoadingAuctions(false)
    }
  }

  // Countdown timer for simulation
  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
      setCountdown(null)
      // Execute the actual simulation calculation
      const baseDistance = (origem.length + destino.length) * 15
      const qty = parseFloat(quantidade) || 1
      const costPerKm = 3.8
      const baseCost = baseDistance * costPerKm * (qty * 0.12 + 0.88)
      const min = baseCost * 0.92
      const max = baseCost * 1.18
      setSimulatedValue(`R$ ${min.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} a R$ ${max.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`)
      return
    }

    const interval = setInterval(() => {
      setCountdown(prev => (prev !== null ? prev - 1 : null))
    }, 1000)

    return () => clearInterval(interval)
  }, [countdown])

  const handleSimulateTrigger = (e: React.FormEvent) => {
    e.preventDefault()
    if (!origem || !destino || !quantidade || !tipoMaterial) {
      alert('Por favor, preencha a origem, destino, quantidade e tipo de material.')
      return
    }
    setSimulatedValue(null)
    setCountdown(5) // Start 5 second countdown
  }

  // Request Leilão Reverso
  const handleRequestAuction = async () => {
    if (!user || !profile) {
      alert('Você precisa estar logado para solicitar um leilão reverso.')
      return
    }

    setRequesting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const valSimulated = simulatedValue ? parseFloat(simulatedValue.replace(/\D/g, '')) / 100 : 0

      const { data, error } = await supabase
        .from('frete')
        .insert([{
          id_comprador: user.id,
          origem,
          destino,
          quantidade: parseFloat(quantidade) || 0,
          unidade,
          acondicionamento,
          valor_desejado: parseFloat(valorDesejado) || 0,
          valor_simulado: valSimulated,
          prazo_coleta_entrega: prazoColeta,
          tipo_material: tipoMaterial,
          tem_documento: temDocumento,
          status: 'Aberto'
        }])
        .select()
        .single()

      if (error) throw error

      setSuccessMsg('Solicitação de frete registrada com sucesso! Abrindo o WhatsApp do Concierge...')

      // Redirect to WhatsApp with full details
      const docText = temDocumento ? 'Sim (MTR/CADRI pronto)' : 'Não possui'
      const text = `Olá Lucas Concierge, sou o parceiro *${profile.nome_ou_razao}* e acabei de solicitar um Leilão Reverso de Frete (Cod: #${data.id.substring(0,6)}).\nTipo Material: ${tipoMaterial}\nOrigem: ${origem}\nDestino: ${destino}\nQuantidade: ${quantidade} ${unidade} (${acondicionamento})\nPrazo Coleta: ${prazoColeta}\nTem Documento: ${docText}\nSimulação sugerida: R$ ${valSimulated}`
      const url = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(text)}`
      window.open(url, '_blank')

      // Clear form
      setOrigem('')
      setDestino('')
      setQuantidade('')
      setValorDesejado('')
      setPrazoColeta('')
      setTipoMaterial('')
      setTemDocumento(false)
      setSimulatedValue(null)
      fetchAuctions()

    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao criar solicitação.')
    } finally {
      setRequesting(false)
    }
  }

  // Transportadora Bidding
  const handleBidTransportadora = (auction: any) => {
    const text = `Olá Lucas Concierge, sou a transportadora *${profile?.nome_ou_razao || 'Membro'}* e estou interessada no Leilão de Frete #${auction.id.substring(0,6)} (${auction.tipo_material}). Rota: ${auction.origem} → ${auction.destino}. Quero dar um lance de frete!`
    const url = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  if (loadingProfile) {
    return (
      <div className="main-layout" style={{ justifyContent: 'center', alignItems: 'center', background: '#000' }}>
        <p style={{ color: 'var(--primary-500)', fontSize: '1.2rem', fontWeight: 'bold' }}>Carregando dados da rota...</p>
      </div>
    )
  }

  return (
    <div className="main-layout" style={{ background: '#000' }}>
      
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
          <Link href="/" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#1c1c1c', border: '1px solid #333' }}>
            Voltar ao Início
          </Link>
        </div>
      </nav>

      {/* CONTAINER */}
      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', width: '100%' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>
          Frete & Leilão Reverso de Logística
        </h1>
        <p style={{ color: '#aaa', fontSize: '1rem', marginBottom: '32px' }}>
          Obtenha simulações de custos e crie leilões para transportadoras credenciadas.
        </p>

        {successMsg && (
          <div style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid var(--primary-500)', color: 'var(--primary-500)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div style={{ background: 'rgba(239, 83, 80, 0.1)', border: '1px solid #ef5350', color: '#ef5350', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
            {errorMsg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* LEFT: SIMULATOR & REQUEST FORM */}
          <div style={{ background: '#121212', border: '1px solid #333', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px', color: 'var(--primary-500)' }}>
              Simulador & Solicitação (Emissor de Frete)
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '24px' }}>
              Forneça os detalhes abaixo para calcularmos a estimativa de custos e prepararmos o envio para as transportadoras credenciadas.
            </p>

            <form onSubmit={handleSimulateTrigger} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#fff' }}>Origem (Cidade - UF)</label>
                  <input
                    type="text"
                    placeholder="Ex: Goiânia - GO"
                    className="form-input"
                    style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                    value={origem}
                    onChange={e => setOrigem(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#fff' }}>Destino (Cidade - UF)</label>
                  <input
                    type="text"
                    placeholder="Ex: Anápolis - GO"
                    className="form-input"
                    style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                    value={destino}
                    onChange={e => setDestino(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#fff' }}>Tipo de Material / Resíduo</label>
                <input
                  type="text"
                  placeholder="Ex: Borra de tinta, Plásticos triturados"
                  className="form-input"
                  style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                  value={tipoMaterial}
                  onChange={e => setTipoMaterial(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#fff' }}>Quantidade</label>
                  <input
                    type="number"
                    className="form-input"
                    style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                    value={quantidade}
                    onChange={e => setQuantidade(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#fff' }}>Unidade</label>
                  <select
                    className="form-select"
                    style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                    value={unidade}
                    onChange={e => setUnidade(e.target.value)}
                  >
                    <option value="t">t</option>
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                    <option value="m³">m³</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#fff' }}>Acondicionamento</label>
                  <select
                    className="form-select"
                    style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                    value={acondicionamento}
                    onChange={e => setAcondicionamento(e.target.value)}
                  >
                    {ACONDICIONAMENTOS.map(cond => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#fff' }}>Valor Máximo Desejado (R$)</label>
                  <input
                    type="number"
                    placeholder="Ex: 1200"
                    className="form-input"
                    style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                    value={valorDesejado}
                    onChange={e => setValorDesejado(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#fff' }}>Prazo de Coleta / Entrega</label>
                  <input
                    type="text"
                    placeholder="Ex: Até 05/06"
                    className="form-input"
                    style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                    value={prazoColeta}
                    onChange={e => setPrazoColeta(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={temDocumento}
                      onChange={e => setTemDocumento(e.target.checked)}
                    />
                    Tem Documento / MTR pronto
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1rem', color: '#000', fontWeight: 'bold', background: 'var(--primary-500)', marginTop: '10px' }}
                disabled={countdown !== null}
              >
                {countdown !== null ? `Calculando rota... (${countdown}s)` : 'Simular Custo de Rota'}
              </button>
            </form>

            {/* COUNTDOWN TIMER ANIMATION DISPLAY */}
            {countdown !== null && (
              <div style={{
                marginTop: '24px',
                background: '#1c1503',
                border: '1px dashed var(--primary-500)',
                padding: '20px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
                <strong style={{ color: 'var(--primary-500)', display: 'block', fontSize: '0.95rem' }}>
                  Aguarde, calculando rotas, eixos e pedágios federais...
                </strong>
                <span style={{ fontSize: '2rem', color: '#fff', fontWeight: 900, display: 'block', marginTop: '10px' }}>
                  {countdown}s
                </span>
              </div>
            )}

            {/* SIMULATED RESULT AND ACTION BUTTON */}
            {simulatedValue && countdown === null && (
              <div style={{
                marginTop: '24px',
                background: '#1c1c1c',
                border: '1px dashed var(--primary-500)',
                padding: '20px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase' }}>Custo Estimado Concierge Materra</span>
                <h3 style={{ fontSize: '1.6rem', color: 'var(--primary-500)', fontWeight: 900, margin: '6px 0' }}>
                  {simulatedValue}
                </h3>
                <p style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '16px' }}>
                  Tudo certo! Quer prosseguir e acionar as transportadoras credenciadas para um Leilão Reverso?
                </p>
                <button
                  onClick={handleRequestAuction}
                  disabled={requesting}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '0.95rem', color: '#000', fontWeight: 'bold' }}
                >
                  {requesting ? 'Iniciando Leilão...' : 'Confirmar e Lançar Leilão Reverso'}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: LIST OF PUBLIC LEILÕES FOR TRANSPORTERS */}
          <div style={{ background: '#121212', border: '1px solid #333', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px', color: 'var(--primary-500)' }}>
              Painel Público de Fretes (Para Transportadoras)
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '24px' }}>
              Lista de demandas de transporte que necessitam de lances. Selecione o frete e lance sua oferta comercial no WhatsApp.
            </p>

            {loadingAuctions ? (
              <p style={{ color: '#aaa' }}>Carregando demandas...</p>
            ) : auctions.length === 0 ? (
              <div style={{ border: '1px dashed #333', padding: '40px 20px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '2.5rem' }}>Sem Convites</span>
                <p style={{ color: '#777', marginTop: '10px' }}>Nenhum leilão de frete aberto no momento.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {auctions.map(auc => (
                  <div key={auc.id} style={{
                    background: '#0a0a0a',
                    border: '1px solid #222',
                    padding: '16px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary-500)' }}>LEILÃO ATIVO</span>
                      <span style={{ fontSize: '0.7rem', color: '#666' }}>Cod: #{auc.id.substring(0,6)}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                      <div>
                        <span style={{ color: '#666', display: 'block', fontSize: '0.7rem' }}>ORIGEM</span>
                        <strong style={{ color: '#fff' }}>{auc.origem}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#666', display: 'block', fontSize: '0.7rem' }}>DESTINO</span>
                        <strong style={{ color: '#fff' }}>{auc.destino}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#666', display: 'block', fontSize: '0.7rem' }}>CARGA / MATERIAL</span>
                        <span style={{ color: '#aaa' }}>{auc.tipo_material || 'Resíduo'} ({auc.quantidade} {auc.unidade})</span>
                      </div>
                      <div>
                        <span style={{ color: '#666', display: 'block', fontSize: '0.7rem' }}>PRAZO COLETA</span>
                        <strong style={{ color: '#fff' }}>{auc.prazo_coleta_entrega || 'N/A'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#666', display: 'block', fontSize: '0.7rem' }}>MTR/DOC LEGAL</span>
                        <span style={{ color: auc.tem_documento ? 'var(--primary-500)' : '#aaa', fontWeight: 'bold' }}>
                          {auc.tem_documento ? 'Possui MTR' : 'Não possui'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#666', display: 'block', fontSize: '0.7rem' }}>VALOR ALVO</span>
                        <strong style={{ color: '#fff' }}>R$ {auc.valor_desejado}</strong>
                      </div>
                    </div>

                    {(profile?.tipo_parte === 'Transportadora' || profile?.transportadora_propria) ? (
                      <button
                        onClick={() => handleBidTransportadora(auc)}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '8px', fontSize: '0.8rem', color: '#000', fontWeight: 'bold' }}
                      >
                        Dar Lance no Frete (WhatsApp)
                      </button>
                    ) : (
                      <p style={{ fontSize: '0.75rem', color: '#555', textAlign: 'center', borderTop: '1px solid #222', paddingTop: '8px', margin: 0 }}>
                        Opção exclusiva para transportadoras credenciadas.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
