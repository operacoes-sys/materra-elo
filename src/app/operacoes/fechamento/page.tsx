'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

export default function FechamentoOperacaoPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(true)

  // Options lists
  const [myAnuncios, setMyAnuncios] = useState<any[]>([])
  const [myContatos, setMyContatos] = useState<any[]>([])
  const [carriers, setCarriers] = useState<any[]>([])

  // Form fields
  const [selectedAnuncioId, setSelectedAnuncioId] = useState('')
  const [selectedContraparteId, setSelectedContraparteId] = useState('')
  const [selectedCarrierId, setSelectedCarrierId] = useState('')
  const [dataNegocio, setDataNegocio] = useState(new Date().toISOString().substring(0, 10))
  const [valorResiduo, setValorResiduo] = useState('')
  const [valorFrete, setValorFrete] = useState('')
  const [emitiuMtr, setEmitiuMtr] = useState(false)
  const [mtrNumero, setMtrNumero] = useState('')
  const [emitiuCdf, setEmitiuCdf] = useState(false)
  const [cdfNumero, setCdfNumero] = useState('')
  const [avaliacao, setAvaliacao] = useState(5)
  const [observacoes, setObservacoes] = useState('')

  // UX states
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function loadInitialData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)

        // Profile
        const { data: prof } = await supabase
          .from('cadastros')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setProfile(prof)

        // Fetch user's active/approved ads
        const { data: ads } = await supabase
          .from('anuncios')
          .select('*')
          .eq('id_cadastro', session.user.id)
        setMyAnuncios(ads || [])

        // Fetch user's approved contacts to link the counterpart
        const { data: conts } = await supabase
          .from('contatos')
          .select(`
            *,
            contraparte:id_contraparte (
              id,
              nome_ou_razao
            )
          `)
          .eq('id_usuario', session.user.id)
        setMyContatos(conts || [])

        // Fetch carriers for option selection
        const { data: transps } = await supabase
          .from('cadastros')
          .select('id, nome_ou_razao')
          .eq('tipo_parte', 'Transportadora')
        setCarriers(transps || [])
      }
      setLoadingData(false)
    }
    loadInitialData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      if (!user || !profile) {
        throw new Error('Você precisa estar logado para declarar o fechamento.')
      }

      // Determine roles for insertion
      const isFornecedor = profile.tipo_parte === 'Fornecedor'
      const isComprador = profile.tipo_parte === 'Comprador'

      // Insert robust row into operacoes_audit
      const { error: insertError } = await supabase
        .from('operacoes_audit')
        .insert([{
          id_anuncio: selectedAnuncioId || null,
          fornecedor: isFornecedor ? user.id : (isComprador ? selectedContraparteId : null),
          comprador: isComprador ? user.id : (isFornecedor ? selectedContraparteId : null),
          transportadora: selectedCarrierId || null,
          valor_residuo_rs: parseFloat(valorResiduo) || 0,
          valor_frete_rs: parseFloat(valorFrete) || 0,
          mtr_numero: emitiuMtr ? mtrNumero : null,
          mtr_data: emitiuMtr ? dataNegocio : null,
          cdf_numero: emitiuCdf ? cdfNumero : null,
          cdf_data: emitiuCdf ? dataNegocio : null,
          nivel_audit: 'Alto (verificado por nós)',
          aval_fornecedor: isComprador ? avaliacao : null,
          aval_comprador: isFornecedor ? avaliacao : null,
          observacoes: observacoes || null
        }])

      if (insertError) throw insertError

      setSuccessMsg('Transação homologada e registrada no Audit Trail individual com sucesso!')
      
      // Clear fields
      setValorResiduo('')
      setValorFrete('')
      setMtrNumero('')
      setCdfNumero('')
      setObservacoes('')

      setTimeout(() => {
        router.push('/')
      }, 1500)

    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao enviar dados do fechamento.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingData) {
    return (
      <div className="main-layout" style={{ justifyContent: 'center', alignItems: 'center', background: '#000' }}>
        <p style={{ color: 'var(--primary-500)', fontSize: '1.2rem', fontWeight: 'bold' }}>Carregando dados de fechamento...</p>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="main-layout" style={{ justifyContent: 'center', alignItems: 'center', background: '#000', padding: '20px' }}>
        <div className="form-container" style={{ textAlign: 'center', background: '#121212', border: '1px solid #333' }}>
          <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold', margin: '16px 0 8px' }}>Acesso Restrito</h1>
          <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '24px' }}>Faça login para declarar o fechamento e auditar transações.</p>
          <Link href="/auth/login" className="btn btn-primary" style={{ width: '100%', color: '#000', fontWeight: 'bold' }}>
            Entrar
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="main-layout" style={{ background: '#000', padding: '40px 20px', minHeight: '100vh', color: '#f5f5f5' }}>
      
      {/* HEADER */}
      <nav style={{
        background: 'rgba(10, 10, 10, 0.95)',
        borderBottom: '2px solid var(--primary-500)',
        padding: '16px 24px',
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/">
            <LogoBrand />
          </Link>
          <Link href="/" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#1c1c1c', border: '1px solid #333' }}>
            Voltar ao Início
          </Link>
        </div>
      </nav>

      {/* FORM CONTAINER */}
      <div className="form-container" style={{ maxWidth: '650px', margin: '80px auto 40px', background: '#121212', border: '1px solid #333', padding: '32px', borderRadius: '16px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: '8px' }}>
          Homologação e Fechamento de Negócio
        </h1>
        <p style={{ color: '#aaa', fontSize: '0.85rem', textAlign: 'center', marginBottom: '24px' }}>
          Preencha os dados reais abaixo para registrar a rastreabilidade da carga no Audit Trail.
        </p>

        {successMsg && (
          <div style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid var(--primary-500)', color: 'var(--primary-500)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div style={{ background: 'rgba(239, 83, 80, 0.1)', border: '1px solid #ef5350', color: '#ef5350', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-group">
            <label className="form-label" style={{ color: '#fff' }}>Selecione o Anúncio Relacionado</label>
            <select
              className="form-select"
              style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
              value={selectedAnuncioId}
              onChange={e => setSelectedAnuncioId(e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              {myAnuncios.map(an => (
                <option key={an.id} value={an.id}>[{an.codigo}] {an.residuo} - Referência: R$ {an.valor_desejado}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#fff' }}>Empresa Contraparte (Comprador/Fornecedor)</label>
            <select
              className="form-select"
              style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
              value={selectedContraparteId}
              onChange={e => setSelectedContraparteId(e.target.value)}
              required
            >
              <option value="">Selecione a empresa...</option>
              {myContatos.map(con => (
                <option key={con.id} value={con.contraparte?.id}>
                  {con.contraparte?.nome_ou_razao}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#fff' }}>Transportadora Responsável</label>
            <select
              className="form-select"
              style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
              value={selectedCarrierId}
              onChange={e => setSelectedCarrierId(e.target.value)}
            >
              <option value="">Nenhuma / Transporte Próprio</option>
              {carriers.map(tr => (
                <option key={tr.id} value={tr.id}>
                  {tr.nome_ou_razao}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Valor Real do Resíduo (R$)</label>
              <input
                type="number"
                placeholder="R$ 0,00"
                className="form-input"
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                value={valorResiduo}
                onChange={e => setValorResiduo(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Valor Real do Frete (R$)</label>
              <input
                type="number"
                placeholder="R$ 0,00"
                className="form-input"
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                value={valorFrete}
                onChange={e => setValorFrete(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Data do Fechamento</label>
              <input
                type="date"
                className="form-input"
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                value={dataNegocio}
                onChange={e => setDataNegocio(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Avaliação da Contraparte</label>
              <select
                className="form-select"
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                value={avaliacao}
                onChange={e => setAvaliacao(parseInt(e.target.value))}
              >
                <option value="5">5 - Excelente</option>
                <option value="4">4 - Bom</option>
                <option value="3">3 - Regular</option>
                <option value="2">2 - Ruim</option>
                <option value="1">1 - Péssimo</option>
              </select>
            </div>
          </div>

          <div style={{ background: '#1a1a1a', padding: '16px', borderRadius: '8px', border: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={emitiuMtr}
                  onChange={e => setEmitiuMtr(e.target.checked)}
                />
                Possui MTR (Manifesto de Transporte de Resíduos)
              </label>
              <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={emitiuCdf}
                  onChange={e => setEmitiuCdf(e.target.checked)}
                />
                Possui CDF (Certificado de Destinação Final emitido pelo Comprador)
              </label>
            </div>

            {emitiuMtr && (
              <div className="form-group">
                <label className="form-label" style={{ color: '#fff', fontSize: '0.8rem' }}>Número do MTR SINIR</label>
                <input
                  type="text"
                  placeholder="Ex: MTR-982312"
                  className="form-input"
                  style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                  value={mtrNumero}
                  onChange={e => setMtrNumero(e.target.value)}
                  required={emitiuMtr}
                />
              </div>
            )}

            {emitiuCdf && (
              <div className="form-group">
                <label className="form-label" style={{ color: '#fff', fontSize: '0.8rem' }}>Número do CDF do Receptor</label>
                <input
                  type="text"
                  placeholder="Ex: CDF-102931"
                  className="form-input"
                  style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                  value={cdfNumero}
                  onChange={e => setCdfNumero(e.target.value)}
                  required={emitiuCdf}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#fff' }}>Relatório ou Observações adicionais</label>
            <textarea
              className="form-input"
              rows={3}
              style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
              placeholder="Descreva observações sobre a logística, acondicionamento ou qualquer desvio de peso..."
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', color: '#000', fontWeight: 'bold', background: 'var(--primary-500)', marginTop: '10px' }}
            disabled={submitting}
          >
            {submitting ? 'Registrando Auditoria...' : 'Homologar Negócio e Salvar no Audit Trail'}
          </button>
        </form>
      </div>

    </div>
  )
}
