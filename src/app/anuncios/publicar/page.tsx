'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ESTADOS_BRASIL, TRATAMENTOS_PREVISTOS, ACONDICIONAMENTOS } from '@/lib/constants'
import { CATALOGO_MATERRA_ELO } from '@/lib/catalogo'
import Link from 'next/link'

export default function PublicarAnuncioPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // Form states
  const [tipoAnuncio, setTipoAnuncio] = useState<'Oferta' | 'Demanda'>('Oferta')
  const [formaCobranca, setFormaCobranca] = useState('Recebo pelo resíduo')
  const [categoria, setCategoria] = useState('METAIS FERROSOS')
  const [residuo, setResiduo] = useState('')
  const [customResiduo, setCustomResiduo] = useState('')
  const [prazoRecorrencia, setPrazoRecorrencia] = useState('')
  const [codigoIbama, setCodigoIbama] = useState('')
  const [classe, setClasse] = useState('Classe IIA – não inerte')
  const [estadoFisico, setEstadoFisico] = useState('Sólido')
  const [quantidade, setQuantidade] = useState('')
  const [unidade, setUnidade] = useState('t')
  const [frequencia, setFrequencia] = useState('Única')
  const [acondicionamento, setAcondicionamento] = useState('Granel')
  const [cep, setCep] = useState('')
  const [uf, setUf] = useState('')
  const [municipio, setMunicipio] = useState('')
  const [origemProcesso, setOrigemProcesso] = useState('')
  const [caracteristicas, setCaracteristicas] = useState('')
  const [valorDesejado, setValorDesejado] = useState('')
  const [tipoLeilao, setTipoLeilao] = useState('Sem leilão')
  const [duracaoLeilaoPreset, setDuracaoLeilaoPreset] = useState('24')
  const [duracaoLeilaoCustom, setDuracaoLeilaoCustom] = useState('')
  const [tratamentoDestinacao, setTratamentoDestinacao] = useState('')
  const [temLicenca, setTemLicenca] = useState(false)
  const [disponibilidadeImediata, setDisponibilidadeImediata] = useState(true)
  const [urgenciaPrazo, setUrgenciaPrazo] = useState('Flexível')

  // Files
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [licencaFile, setLicencaFile] = useState<File | null>(null)

  // Represented company states (optional for Brokers)
  const [repRazaoSocial, setRepRazaoSocial] = useState('')
  const [repCnpj, setRepCnpj] = useState('')
  const [repLicencaNum, setRepLicencaNum] = useState('')
  const [repCadri, setRepCadri] = useState('')
  const [repFile, setRepFile] = useState<File | null>(null)

  // UX states
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Index simulation helper variables
  const getResidueIndexValue = (cat: string, res: string): number => {
    const c = cat.toLowerCase()
    const r = res.toLowerCase()
    
    if (r.includes('cobre')) return 35000
    if (r.includes('alumínio') || r.includes('aluminio')) {
      if (r.includes('lata')) return 5500
      return 6500
    }
    if (r.includes('aço') || r.includes('aco')) return 600
    if (r.includes('ferro') || r.includes('ferrosa')) return 634
    
    if (r.includes('pp')) return 2500
    if (r.includes('pet')) return 1900
    if (r.includes('pebd')) return 1800
    if (r.includes('eps') || r.includes('isopor')) return 1500
    if (r.includes('papelão') || r.includes('papelao')) return 600
    if (r.includes('longa vida') || r.includes('embalagem')) return 500
    if (r.includes('vidro')) return 120
    
    if (r.includes('abatedouro') || r.includes('abate') || r.includes('sebo') || r.includes('osso')) return 150
    if (r.includes('bagaço') || r.includes('bagaco')) return 50
    if (r.includes('torta') || r.includes('filro')) return 60
    if (r.includes('cama') || r.includes('frango')) return 70
    
    if (r.includes('vinhaça') || r.includes('vinhaca')) return 0
    if (r.includes('pallet') || r.includes('palete')) return 0
    if (r.includes('pneu')) return 0
    if (r.includes('lubrificante') || r.includes('oluc')) return 0
    
    if (r.includes('ete') || r.includes('esgoto')) return -200
    if (r.includes('lodo') && r.includes('industrial')) return -350
    if (r.includes('cinza') || r.includes('caldeira')) return -100
    if (r.includes('classe ii')) return -190
    
    if (r.includes('tinta') || r.includes('borra')) return -1200
    if (r.includes('fora de especificação') || r.includes('especificacao')) return -900
    if (r.includes('reagente') || r.includes('vencido')) return -5000
    if (r.includes('saúde') || r.includes('saude') || r.includes('rss')) return -4000
    
    if (c.includes('metal')) return 634
    if (c.includes('plástico') || c.includes('plastico')) return 1800
    if (c.includes('papel')) return 600
    if (c.includes('vidro')) return 120
    if (c.includes('lodo')) return -200
    if (c.includes('químico') || c.includes('quimico')) return -900
    
    return 0
  }

  const getDeviationText = () => {
    const val = parseFloat(valorDesejado)
    if (isNaN(val)) return null
    const indexPrice = getResidueIndexValue(categoria, residuo)
    if (indexPrice === 0) {
      if (val === 0) return 'Seu anúncio está no mesmo preço de referência (Doação/Troca)'
      return `Seu anúncio possui valor de R$ ${val.toLocaleString('pt-BR')} (Índice de referência é R$ 0)`
    }
    const diff = val - indexPrice
    const percent = (diff / Math.abs(indexPrice)) * 100
    if (percent === 0) {
      return 'Seu anúncio está exatamente igual ao nosso índice.'
    }
    return `Seu anúncio está ${Math.abs(percent).toFixed(1)}% ${percent > 0 ? 'acima' : 'abaixo'} que nosso índice de referência.`
  }

  // Load profile and verify limit
  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        const { data, error } = await supabase
          .from('cadastros')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (!error && data) {
          setProfile(data)
        }
      }
      setLoadingProfile(false)
    }
    loadData()
  }, [])

  // Auto-fill residuo on category change
  useEffect(() => {
    const list = CATALOGO_MATERRA_ELO[categoria]?.subcategorias || []
    if (list.length > 0) {
      setResiduo(list[0])
    }
  }, [categoria])

  // ViaCEP helper
  const handleCepBlur = async () => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const data = await res.json()
        if (!data.erro) {
          setMunicipio(data.localidade || '')
          setUf(data.uf || '')
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err)
      }
    }
  }

  // Upload file helper
  const uploadFile = async (file: File, folder: string, userId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/anuncios/${folder}_${Date.now()}.${fileExt}`
    const { data, error } = await supabase.storage
      .from('documentos')
      .upload(fileName, file, { cacheControl: '3600', upsert: true })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('documentos')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const generateShortCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'MAT-'
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      if (!user || !profile) {
        throw new Error('Você precisa estar logado para publicar.')
      }

      // Check limit rule: 1 publication free limit, more needs plano_ativo
      const publicationsUsed = profile.publicacoes_usadas || 0
      const isPlanoActive = profile.plano_ativo || false

      if (publicationsUsed >= 1 && !isPlanoActive) {
        throw new Error('Você atingiu o limite gratuito de 1 publicação. Por favor, ative um plano Pago para continuar publicando.')
      }

      // Upload files
      let fotoUrl = ''
      let videoUrl = ''
      let licencaAnexoUrl = ''

      if (fotoFile) {
        fotoUrl = await uploadFile(fotoFile, 'foto', user.id)
      }
      if (videoFile) {
        videoUrl = await uploadFile(videoFile, 'video', user.id)
      }
      if (temLicenca && licencaFile) {
        licencaAnexoUrl = await uploadFile(licencaFile, 'licenca_anuncio', user.id)
      }

      const codigo = generateShortCode()

      const actualResiduo = residuo === 'Outro (descrever)' ? customResiduo : residuo
      const indexVal = getResidueIndexValue(categoria, actualResiduo)
      const desired = parseFloat(valorDesejado)
      let devText = null
      if (!isNaN(desired) && indexVal !== 0) {
        const diffPercent = ((desired - indexVal) / Math.abs(indexVal)) * 100
        devText = diffPercent > 0 
          ? `+${diffPercent.toFixed(1)}% acima do Index` 
          : `${diffPercent.toFixed(1)}% abaixo do Index`
      } else if (!isNaN(desired) && indexVal === 0) {
        devText = desired === 0 ? 'No preço de referência' : 'Comercializado'
      }

      let duracaoHoras: number | null = null
      if (tipoLeilao === 'Ascendente' || tipoLeilao === 'Descendente') {
        if (duracaoLeilaoPreset === 'personalizar') {
          const val = parseInt(duracaoLeilaoCustom)
          if (isNaN(val) || val <= 0 || val > 336) {
            throw new Error('A duração personalizada do leilão deve ser um valor entre 1 e 336 horas (máximo 14 dias).')
          }
          duracaoHoras = val
        } else {
          duracaoHoras = parseInt(duracaoLeilaoPreset)
        }
      }

      // Insert anuncio with constraint retry fallback
      let payload = {
        id_cadastro: user.id,
        codigo,
        tipo_anuncio: tipoAnuncio as string,
        forma_cobranca: formaCobranca,
        duracao_leilao_horas: duracaoHoras,
        categoria,
        residuo: actualResiduo,
        prazo_recorrencia: frequencia !== 'Única' ? prazoRecorrencia : null,
        codigo_ibama: codigoIbama || null,
        classe,
        estado_fisico: estadoFisico,
        quantidade: parseFloat(quantidade) || 0,
        unidade,
        frequencia,
        acondicionamento,
        cep,
        uf,
        municipio,
        origem_processo: origemProcesso || null,
        caracteristicas: caracteristicas || null,
        foto_url: fotoUrl || null,
        video_url: videoUrl || null,
        valor_desejado: parseFloat(valorDesejado) || 0,
        valor_index: indexVal,
        percentual_desvio: devText,
        tipo_leilao: tipoLeilao,
        tratamento_destinacao: tratamentoDestinacao || null,
        tem_licenca: temLicenca,
        licenca_anexo_url: licencaAnexoUrl || null,
        disponibilidade_imediata: tipoAnuncio === 'Oferta' ? disponibilidadeImediata : null,
        urgencia_prazo: tipoAnuncio === 'Demanda' ? urgenciaPrazo : null,
        identidade_oculta: true, // Sempre oculto por padrão no MVP
        status: 'Pendente', // Novas publicações entram em análise (Pendente)
      }

      let { error: insertError } = await supabase
        .from('anuncios')
        .insert([payload])

      if (insertError) {
        console.warn('Erro ao inserir anúncio, tentando fallbacks de restrição...', insertError)
        
        // Fallback 1: check constraint of status (Pendente vs Anunciado)
        if (insertError.message.includes('status_check') || insertError.message.includes('status')) {
          payload.status = 'Anunciado'
        }
        // Fallback 2: check constraint of tipo_anuncio
        if (insertError.message.includes('tipo_anuncio_check') || insertError.message.includes('tipo_anuncio')) {
          payload.tipo_anuncio = tipoAnuncio === 'Oferta' ? 'Oferta de resíduo' : 'Pedido de compra'
        }
        // Fallback 3: column percentual_desvio is missing or cache is stale
        if (insertError.message.includes('percentual_desvio') || insertError.message.includes('column')) {
          delete (payload as any).percentual_desvio
        }

        // Retry insertion
        let { error: retryError } = await supabase
          .from('anuncios')
          .insert([payload])
        
        if (retryError && (retryError.message.includes('percentual_desvio') || retryError.message.includes('column'))) {
          delete (payload as any).percentual_desvio
          const retryRes = await supabase.from('anuncios').insert([payload])
          retryError = retryRes.error
        }

        insertError = retryError

        // Double fallback if it still fails due to status/type mismatch
        if (insertError && (insertError.message.includes('status') || insertError.message.includes('tipo_anuncio'))) {
          payload.status = 'Anunciado'
          payload.tipo_anuncio = tipoAnuncio === 'Oferta' ? 'Oferta de resíduo' : 'Pedido de compra'
          delete (payload as any).percentual_desvio // Make absolutely sure it's gone
          const { error: finalRetryError } = await supabase
            .from('anuncios')
            .insert([payload])
          insertError = finalRetryError
        }
      }

      if (insertError) throw insertError

      // Query the newly inserted advertisement ID
      const { data: adRow } = await supabase
        .from('anuncios')
        .select('id')
        .eq('codigo', codigo)
        .single()

      if (adRow && repRazaoSocial) {
        let repUrl = ''
        if (repFile) {
          try {
            repUrl = await uploadFile(repFile, 'represented_licenca', user.id)
          } catch (uploadErr) {
            console.error('Erro ao carregar doc da representada:', uploadErr)
          }
        }
        
        // Create Ficha Empresa Representada
        const { data: fichaData } = await supabase
          .from('fichas_empresa_representada')
          .insert([{
            id_anuncio: adRow.id,
            id_corretor: user.id,
            razao_social: repRazaoSocial,
            cnpj: repCnpj || null,
            licenca_url: repUrl || null,
            cadri: repCadri || null,
            status_documentos: 'Pendente',
            score_0a100: 50,
            selo_metal: 'Bronze',
            observacoes: null
          }])
          .select()
          .single()
        
        const fichaId = fichaData?.id
        if (fichaId) {
          await supabase
            .from('anuncios')
            .update({ id_ficha_empresa: fichaId })
            .eq('id', adRow.id)
        } else {
          // Alternative lookup if select/single failed
          const { data: fichaLookup } = await supabase
            .from('fichas_empresa_representada')
            .select('id')
            .eq('id_anuncio', adRow.id)
            .single()
          if (fichaLookup?.id) {
            await supabase
              .from('anuncios')
              .update({ id_ficha_empresa: fichaLookup.id })
              .eq('id', adRow.id)
          }
        }
      }

      // Increment publicacoes_usadas count in user profile
      const { error: profileUpdateError } = await supabase
        .from('cadastros')
        .update({ publicacoes_usadas: publicationsUsed + 1 })
        .eq('id', user.id)

      if (profileUpdateError) {
        console.error('Erro ao atualizar contador de publicações:', profileUpdateError)
      }

      setSuccessMsg(`Anúncio publicado com sucesso! Código: ${codigo}`)
      
      // Reset form
      setQuantidade('')
      setCep('')
      setUf('')
      setMunicipio('')
      setOrigemProcesso('')
      setCaracteristicas('')
      setValorDesejado('')
      setFotoFile(null)
      setVideoFile(null)
      setLicencaFile(null)
      setTemLicenca(false)

    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao publicar o anúncio.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingProfile) {
    return (
      <div className="main-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Carregando dados da conta...</p>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="main-layout" style={{ justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div className="form-container" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '3rem' }}>🔒</span>
          <h1 className="form-title" style={{ marginTop: '10px' }}>Acesso Restrito</h1>
          <p className="form-subtitle">Você precisa estar logado para publicar anúncios na plataforma.</p>
          <Link href="/auth/login" className="btn btn-primary btn-full">
            Entrar na minha Conta
          </Link>
        </div>
      </div>
    )
  }

  if (profile.tipo_parte === 'Transportadora') {
    return (
      <div className="main-layout" style={{ justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div className="form-container" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '3rem' }}>🚫</span>
          <h1 className="form-title" style={{ marginTop: '10px' }}>Acesso Restrito</h1>
          <p className="form-subtitle">Transportadoras exclusivas não podem publicar anúncios de resíduos.</p>
          <Link href="/" className="btn btn-primary btn-full">
            Voltar ao Início
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="main-layout">
      {/* HEADER */}
      <nav style={{
        background: 'var(--glass-bg)',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 24px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link href="/" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#43a047' }}>
            MATERRA ELO
          </Link>
          <Link href="/" className="btn-link" style={{ fontSize: '0.9rem' }}>
            Voltar ao Início
          </Link>
        </div>
      </nav>

      {/* CONTAINER */}
      <div className="form-container" style={{ maxWidth: '750px', margin: '40px auto' }}>
        <h1 className="form-title">Publicar Anúncio</h1>
        <p className="form-subtitle">Cadastre uma oferta ou demanda de resíduos no marketplace</p>

        {errorMsg && <div className="form-error">{errorMsg}</div>}
        {successMsg && <div className="form-success">{successMsg}</div>}

        {profile.publicacoes_usadas >= 1 && !profile.plano_ativo && (
          <div className="form-error" style={{ background: 'rgba(255, 167, 38, 0.1)', color: 'var(--warning)', borderColor: 'rgba(255, 167, 38, 0.2)' }}>
            <strong>Atenção:</strong> Você já utilizou sua 1ª publicação gratuita. Ative um plano Pago para poder cadastrar mais anúncios.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Seletor Oferta/Demanda */}
          <div className="form-group">
            <label className="form-label">Tipo de Anúncio</label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="tipoAnuncio"
                  checked={tipoAnuncio === 'Oferta'}
                  onChange={() => setTipoAnuncio('Oferta')}
                />
                Oferta (Tenho resíduo / Quero vender)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="tipoAnuncio"
                  checked={tipoAnuncio === 'Demanda'}
                  onChange={() => setTipoAnuncio('Demanda')}
                />
                Demanda (Preciso de resíduo / Quero comprar)
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 'bold' }}>Forma de Cobrança</label>
              <select className="form-select" value={formaCobranca} onChange={e => setFormaCobranca(e.target.value)}>
                {tipoAnuncio === 'Oferta' ? (
                  <>
                    <option value="Recebo pelo resíduo">Recebo pelo resíduo (Vender material valorizável)</option>
                    <option value="Pago pela destinação">Pago pela destinação (Descartar passivo ambiental)</option>
                  </>
                ) : (
                  <>
                    <option value="Recebo pelo resíduo">Recebo pela destinação (Cobrar por tratamento/serviço)</option>
                    <option value="Pago pela destinação">Pago pelo resíduo (Comprar matéria-prima)</option>
                  </>
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 'bold' }}>Tipo de Leilão</label>
              <select className="form-select" value={tipoLeilao} onChange={e => setTipoLeilao(e.target.value)}>
                <option value="Sem leilão">Sem leilão (Negociação Direta)</option>
                <option value="Ascendente">Leilão Ascendente (Maior oferta vence)</option>
                <option value="Descendente">Leilão Descendente (Menor lance vence)</option>
              </select>
            </div>

            {(tipoLeilao === 'Ascendente' || tipoLeilao === 'Descendente') && (
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 'bold' }}>Duração do Leilão *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    className="form-select"
                    style={{ flex: 1 }}
                    value={duracaoLeilaoPreset}
                    onChange={e => setDuracaoLeilaoPreset(e.target.value)}
                    required
                  >
                    <option value="24">24 horas</option>
                    <option value="48">48 horas</option>
                    <option value="72">72 horas</option>
                    <option value="168">1 semana</option>
                    <option value="personalizar">Personalizar...</option>
                  </select>
                  {duracaoLeilaoPreset === 'personalizar' && (
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: '120px' }}
                      placeholder="Horas (máx 336)"
                      value={duracaoLeilaoCustom}
                      onChange={e => setDuracaoLeilaoCustom(e.target.value)}
                      min="1"
                      max="336"
                      required
                    />
                  )}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '4px', display: 'block' }}>
                  O cronômetro começará a contar somente após o primeiro lance válido ser recebido.
                </span>
              </div>
            )}

            {/* DYNAMIC COMBINATION GUIDE CARD */}
            <div style={{
              background: '#1c1503',
              border: '1px solid var(--primary-500)',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '8px',
              marginBottom: '16px',
              gridColumn: 'span 2',
              fontSize: '0.85rem'
            }}>
              <strong style={{ color: 'var(--primary-500)', display: 'block', marginBottom: '8px' }}>
                ⚖️ Entendendo a regra do seu anúncio:
              </strong>
              {tipoAnuncio === 'Oferta' ? (
                <div>
                  <p style={{ margin: 0, color: '#fff', fontWeight: 'bold' }}>
                    Você é Gerador / Vendedor (Tenho o resíduo):
                  </p>
                  <ul style={{ margin: '8px 0 0 0', paddingLeft: '16px', color: '#ccc', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li>
                      <strong>Forma de Cobrança:</strong> {formaCobranca === 'Recebo pelo resíduo' 
                        ? 'Você quer vender seu resíduo. Outros usuários pagarão a você.' 
                        : 'Você precisa descartar um passivo. Você pagará a quem coletar/destinar.'}
                    </li>
                    <li>
                      <strong>Tipo de Leilão:</strong> {tipoLeilao === 'Sem leilão' 
                        ? 'Preço fixo. Interessados entram em contato pelo valor especificado.' 
                        : tipoLeilao === 'Ascendente' 
                        ? 'Leilão Ascendente: Compradores dão lances acima do seu valor mínimo. Vence quem pagar MAIS pelo seu resíduo.' 
                        : 'Leilão Descendente: Destinadores dão lances abaixo do seu valor inicial. Vence quem cobrar MENOS para tratar seu resíduo.'}
                    </li>
                  </ul>
                </div>
              ) : (
                <div>
                  <p style={{ margin: 0, color: '#fff', fontWeight: 'bold' }}>
                    Você é Comprador / Destinador (Preciso do resíduo):
                  </p>
                  <ul style={{ margin: '8px 0 0 0', paddingLeft: '16px', color: '#ccc', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li>
                      <strong>Forma de Cobrança:</strong> {formaCobranca === 'Recebo pelo resíduo' 
                        ? 'Você presta serviço de tratamento e cobrará para receber o resíduo.' 
                        : 'Você quer comprar resíduos para usar na sua fábrica e pagará pelo material.'}
                    </li>
                    <li>
                      <strong>Tipo de Leilão:</strong> {tipoLeilao === 'Sem leilão' 
                        ? 'Preço fixo. Fornecedores entram em contato pelo valor anunciado.' 
                        : tipoLeilao === 'Ascendente' 
                        ? 'Leilão Ascendente: Geradores dão lances para te pagar. Vence quem oferecer o MAIOR valor para destinar na sua planta.' 
                        : 'Leilão Descendente: Fornecedores dão lances abaixo do seu teto. Vence quem te vender a matéria-prima pelo MENOR preço.'}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Categoria e Resíduo Específico */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Categoria do Resíduo</label>
              <select className="form-select" value={categoria} onChange={e => setCategoria(e.target.value)}>
                {Object.keys(CATALOGO_MATERRA_ELO).map(cat => (
                  <option key={cat} value={cat}>
                    {cat} ({CATALOGO_MATERRA_ELO[cat].capituloIbama})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Resíduo Específico</label>
              <select className="form-select" value={residuo} onChange={e => setResiduo(e.target.value)}>
                {(CATALOGO_MATERRA_ELO[categoria]?.subcategorias || []).map(res => (
                  <option key={res} value={res}>{res}</option>
                ))}
              </select>
              {residuo === 'Outro (descrever)' && (
                <div style={{ marginTop: '8px' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', color: '#aaa' }}>Especifique o Resíduo</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                    placeholder="Nome do resíduo ou coproduto"
                    value={customResiduo}
                    onChange={e => setCustomResiduo(e.target.value)}
                    required
                  />
                </div>
              )}
              {parseFloat(quantidade) > 0 && (() => {
                const actual = residuo === 'Outro (descrever)' ? customResiduo : residuo;
                const idx = getResidueIndexValue(categoria, actual);
                return (
                  <div style={{ marginTop: '8px', fontSize: '0.82rem', color: 'var(--primary-500)', lineHeight: '1.4' }}>
                    💡 Com base na quantidade ({quantidade} {unidade}) e no nosso index de referência <strong>({idx >= 0 ? `R$ ${idx.toLocaleString('pt-BR')}` : `-R$ ${Math.abs(idx).toLocaleString('pt-BR')}`} / {unidade === 't' ? 't' : unidade})</strong>:
                    {' '}isso {idx * (parseFloat(quantidade) || 0) >= 0 ? 'vale' : 'custa'} <strong>R$ {Math.abs(idx * (parseFloat(quantidade) || 0)).toLocaleString('pt-BR')} {idx * (parseFloat(quantidade) || 0) < 0 && '(destinação)'}</strong>, mas o valor real é sujeito a variação com base na distância, localidade, qualidade, etc.
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Código IBAMA (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: 20 01 40"
                className="form-input"
                value={codigoIbama}
                onChange={e => setCodigoIbama(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Classe do Resíduo</label>
              <select className="form-select" value={classe} onChange={e => setClasse(e.target.value)}>
                <option value="Classe I – perigoso">Classe I – perigoso</option>
                <option value="Classe IIA – não inerte">Classe IIA – não inerte</option>
                <option value="Classe IIB – inerte">Classe IIB – inerte</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Estado Físico</label>
              <select className="form-select" value={estadoFisico} onChange={e => setEstadoFisico(e.target.value)}>
                <option value="Sólido">Sólido</option>
                <option value="Líquido">Líquido</option>
                <option value="Semissólido">Semissólido</option>
                <option value="Pastoso">Pastoso</option>
                <option value="Gasoso">Gasoso</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Acondicionamento</label>
              <select className="form-select" value={acondicionamento} onChange={e => setAcondicionamento(e.target.value)}>
                {ACONDICIONAMENTOS.map(cond => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quantidade</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={quantidade}
                onChange={e => setQuantidade(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unidade</label>
              <select className="form-select" value={unidade} onChange={e => setUnidade(e.target.value)}>
                <option value="kg">kg</option>
                <option value="t">t (Tonelada)</option>
                <option value="L">L (Litro)</option>
                <option value="m³">m³ (Metro Cúbico)</option>
                <option value="unidade">Unidade</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Frequência de Geração</label>
              <select className="form-select" value={frequencia} onChange={e => setFrequencia(e.target.value)}>
                <option value="Única">Única</option>
                <option value="Semanal">Semanal</option>
                <option value="Mensal">Mensal</option>
                <option value="Recorrente">Recorrente</option>
              </select>
              {frequencia !== 'Única' && (
                <div style={{ marginTop: '8px' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', color: '#aaa' }}>Prazo da Recorrência</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                    placeholder="Ex: 12 meses, 6 meses, Indefinido, Contrato anual"
                    value={prazoRecorrencia}
                    onChange={e => setPrazoRecorrencia(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              {tipoAnuncio === 'Oferta' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', justifyContent: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <input
                      type="checkbox"
                      checked={disponibilidadeImediata}
                      onChange={e => setDisponibilidadeImediata(e.target.checked)}
                    />
                    DISPONIBILIDADE IMEDIATA
                  </label>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="form-label">Urgência / Prazo</label>
                  <select className="form-select" value={urgenciaPrazo} onChange={e => setUrgenciaPrazo(e.target.value)}>
                    <option value="Imediato">Imediato</option>
                    <option value="30 dias">30 dias</option>
                    <option value="60 dias">60 dias</option>
                    <option value="Flexível">Flexível</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Localização */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">CEP Localização</label>
              <input
                type="text"
                className="form-input"
                value={cep}
                onChange={e => setCep(e.target.value)}
                onBlur={handleCepBlur}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Município</label>
              <input
                type="text"
                className="form-input"
                value={municipio}
                onChange={e => setMunicipio(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">UF (Estado)</label>
              <select className="form-select" value={uf} onChange={e => setUf(e.target.value)} required>
                <option value="">Selecione...</option>
                {ESTADOS_BRASIL.map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Textareas */}
          <div className="form-group">
            <label className="form-label">Origem / Processo Gerador</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Descreva brevemente como o resíduo é gerado..."
              value={origemProcesso}
              onChange={e => setOrigemProcesso(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Características / Qualidade</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Ex: limpo, prensado, contaminado, teor de umidade, etc..."
              value={caracteristicas}
              onChange={e => setCaracteristicas(e.target.value)}
            />
          </div>

          {/* Tratamento / Destinação e Valor */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tratamento/Destinação Desejada</label>
              <select className="form-select" value={tratamentoDestinacao} onChange={e => setTratamentoDestinacao(e.target.value)}>
                <option value="">Não especificado (opcional)</option>
                {TRATAMENTOS_PREVISTOS.map(trat => (
                  <option key={trat} value={trat}>{trat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label className="form-label" style={{ margin: 0 }}>Valor Desejado (R$)</label>
                <span style={{ fontSize: '0.75rem', color: '#ffb300', fontWeight: 'bold' }}>
                  Referência Index: R$ {getResidueIndexValue(categoria, residuo).toLocaleString('pt-BR')}
                </span>
              </div>
              <input
                type="number"
                step="any"
                placeholder="R$ 0,00"
                className="form-input"
                value={valorDesejado}
                onChange={e => setValorDesejado(e.target.value)}
                required
              />
              
              {/* Dynamic Explanation Text based on Tipo and Leilao */}
              {(() => {
                let expText = '';
                if (tipoLeilao === 'Ascendente') {
                  if (tipoAnuncio === 'Oferta') {
                    expText = 'Valor mínimo aceito. Compradores dão lances acima desse valor; vence o maior lance.';
                  } else {
                    expText = 'Valor mínimo que você cobra pela destinação. Geradores ofertam acima; vence o maior valor pago.';
                  }
                } else if (tipoLeilao === 'Descendente') {
                  if (tipoAnuncio === 'Oferta') {
                    expText = 'Valor máximo que você paga pela destinação. Destinadores cobram igual ou menos; vence o menor preço cobrado.';
                  } else {
                    expText = 'Valor máximo que você paga pelo resíduo. Fornecedores ofertam abaixo; vence o menor preço cobrado.';
                  }
                } else {
                  expText = 'Preço de referência para negociação direta.';
                }
                return (
                  <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#aaa', fontStyle: 'italic', lineHeight: '1.4' }}>
                    💡 {expText}
                  </p>
                );
              })()}

              {getDeviationText() && (
                <div style={{ marginTop: '6px', fontSize: '0.82rem', color: '#ffb300', fontWeight: 'bold', lineHeight: '1.4' }}>
                  📈 {getDeviationText()}
                </div>
              )}
            </div>
          </div>

          {/* Licença Checkbox */}
          <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={temLicenca}
                onChange={e => setTemLicenca(e.target.checked)}
              />
              POSSUI LICENÇA / CADRI / MTR DO RESÍDUO
            </label>
          </div>

          {temLicenca && (
            <div className="form-group sub-fields-box">
              <label className="form-label">Anexo do Documento (Imagem ou PDF)</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setLicencaFile(e.target.files[0])
                  }
                }}
                required
              />
            </div>
          )}

          {/* Upload de Fotos e Vídeos */}
          <div className="form-row" style={{ marginTop: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">Foto do Resíduo</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setFotoFile(e.target.files[0])
                  }
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vídeo do Resíduo (Opcional)</label>
              <input
                type="file"
                accept="video/*"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setVideoFile(e.target.files[0])
                  }
                }}
              />
            </div>
          </div>

          {/* REPRESENTED COMPANY SECTION (OPTIONAL FOR BROKERS) */}
          {(profile?.subtipo === 'Corretor' || profile?.subtipo === 'Corretor/Controlador') && (
            <div style={{
              background: '#121212',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '24px',
              marginTop: '24px',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--primary-500)', marginBottom: '6px' }}>
                Ficha da Empresa Representada (Opcional)
              </h3>
              <p style={{ color: '#aaa', fontSize: '0.75rem', marginBottom: '16px' }}>
                Preencher é OPCIONAL e nunca bloqueia a publicação. Se preencher, o sistema criará uma Ficha Materra com score e selo independente para esta empresa vinculada ao anúncio. Se não preencher, ficará marcado como "Informação não fornecida".
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#fff' }}>Razão Social Representada</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                    value={repRazaoSocial}
                    onChange={e => setRepRazaoSocial(e.target.value)}
                    placeholder="Ex: Indústria Química ABC Ltda"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#fff' }}>CNPJ Representada</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                    value={repCnpj}
                    onChange={e => setRepCnpj(e.target.value)}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#fff' }}>Licença Ambiental (Nº ou descrição)</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                    value={repLicencaNum}
                    onChange={e => setRepLicencaNum(e.target.value)}
                    placeholder="Ex: LO nº 1234/2026"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#fff' }}>CADRI / MTR Representada</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                    value={repCadri}
                    onChange={e => setRepCadri(e.target.value)}
                    placeholder="Ex: CADRI nº 9876/2026"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#fff' }}>Upload do Documento/Licença da Representada</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setRepFile(e.target.files[0])
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="form-actions" style={{ display: 'flex', gap: '16px' }}>
            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={submitting || (profile.publicacoes_usadas >= 1 && !profile.plano_ativo)}
            >
              {submitting ? 'Publicando...' : 'Publicar Anúncio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
