'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ESTADOS_BRASIL, TRATAMENTOS_PREVISTOS } from '@/lib/constants'
import { AUTOCOMPLETE_DICTIONARY } from '@/lib/autocomplete_data'
import Link from 'next/link'
import {
  ArrowLeft, Check, X, Shield, Info, Calendar, MapPin,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Upload,
  Plus, Trash, Play, FileText, Sliders, Lock
} from 'lucide-react'

// Custom Globe Logo
const LogoGlobe = ({ size = 28 }: { size?: number }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round">
    <path d="M50,10 A40,40 0 0,0 10,50 A40,40 0 0,0 50,90" />
    <path d="M50,10 A25,40 0 0,0 25,50 A25,40 0 0,0 50,90" />
    <path d="M50,10 A12,40 0 0,0 38,50 A12,40 0 0,0 50,90" />
    <path d="M14,35 Q35,42 50,42" />
    <path d="M10,50 Q35,58 50,58" />
    <path d="M14,65 Q35,74 50,74" />
    <polygon points="56,22 62,20 60,26" fill="var(--primary)" stroke="none" />
    <polygon points="68,14 74,12 71,18" fill="var(--primary)" stroke="none" />
    <polygon points="58,34 65,30 63,38" fill="var(--primary)" stroke="none" />
    <polygon points="72,28 78,25 76,32" fill="var(--primary)" stroke="none" />
    <polygon points="84,20 88,17 86,24" fill="var(--primary)" stroke="none" />
    <polygon points="54,50 60,46 58,54" fill="var(--primary)" stroke="none" />
    <polygon points="66,45 74,40 70,48" fill="var(--primary)" stroke="none" />
    <polygon points="78,42 84,38 82,46" fill="var(--primary)" stroke="none" />
    <polygon points="56,66 64,62 61,70" fill="var(--primary)" stroke="none" />
    <polygon points="70,60 76,56 74,64" fill="var(--primary)" stroke="none" />
    <polygon points="54,80 60,76 58,84" fill="var(--primary)" stroke="none" />
  </svg>
)

// IBAMA Chapters Catalog
const CATALOGO_IBAMA: Record<string, { cod: string; sub: { cod: string; name: string; class: string }[] }> = {
  '1. Prospecção, mineração e tratamento de minerais': {
    cod: '01',
    sub: [
      { cod: '01 01 01', name: 'Resíduos de mineração de minerais metálicos', class: 'Classe IIA – não inerte' },
      { cod: '01 04 08', name: 'Resíduos de cascalho e rochas fragmentadas', class: 'Classe IIB – inerte' }
    ]
  },
  '2. Agricultura, horticultura, piscicultura e alimentação': {
    cod: '02',
    sub: [
      { cod: '02 01 03', name: 'Resíduos de tecidos vegetais (palhas, bagaços, cascas)', class: 'Classe IIA – não inerte' },
      { cod: '02 02 03', name: 'Resíduos impróprios para consumo ou processamento alimentar', class: 'Classe IIA – não inerte' }
    ]
  },
  '3. Madeira, papel, cartão e móveis': {
    cod: '03',
    sub: [
      { cod: '03 01 05', name: 'Serragem, aparas e cascas de madeira', class: 'Classe IIA – não inerte' },
      { cod: '03 03 08', name: 'Resíduos de classificação de papel e cartão para reciclagem', class: 'Classe IIB – inerte' }
    ]
  },
  '4. Couro, pele e têxteis': {
    cod: '04',
    sub: [
      { cod: '04 01 01', name: 'Carniça e rasuras de peles grossas e couros', class: 'Classe IIA – não inerte' },
      { cod: '04 02 22', name: 'Resíduos de fibras processadas e tecidos', class: 'Classe IIB – inerte' }
    ]
  },
  '5. Refino de petróleo, gás natural e carvão': {
    cod: '05',
    sub: [
      { cod: '05 01 03', name: 'Borras ácidas de refino de petróleo', class: 'Classe I – perigoso' },
      { cod: '05 01 05', name: 'Vazamentos de óleo lubrificante ou combustíveis', class: 'Classe I – perigoso' }
    ]
  },
  '6. Processos químicos inorgânicos': {
    cod: '06',
    sub: [
      { cod: '06 01 01', name: 'Ácido sulfúrico e ácido sulfuroso usados', class: 'Classe I – perigoso' },
      { cod: '06 02 01', name: 'Hidróxido de cálcio residual', class: 'Classe I – perigoso' }
    ]
  },
  '7. Processos químicos orgânicos': {
    cod: '07',
    sub: [
      { cod: '07 01 01', name: 'Líquidos de lavagem aquosos e licores-mães orgânicos', class: 'Classe I – perigoso' },
      { cod: '07 02 13', name: 'Resíduos de plásticos condensados ou polímeros', class: 'Classe IIA – não inerte' }
    ]
  },
  '8. Tintas, varnizes, esmaltes, adesivos (FFDU)': {
    cod: '08',
    sub: [
      { cod: '08 01 11', name: 'Resíduos de tintas e vernizes contendo solventes orgânicos', class: 'Classe I – perigoso' },
      { cod: '08 04 09', name: 'Resíduos de adesivos e selantes contendo solventes', class: 'Classe I – perigoso' }
    ]
  },
  '9. Indústria fotográfica': {
    cod: '09',
    sub: [
      { cod: '09 01 01', name: 'Soluções reveladoras aquosas de películas fotográficas', class: 'Classe I – perigoso' }
    ]
  },
  '10. Processos térmicos': {
    cod: '10',
    sub: [
      { cod: '10 01 01', name: 'Cinzas de caldeira a biomassa ou carvão', class: 'Classe IIA – não inerte' },
      { cod: '10 02 07', name: 'Escórias e poeiras de aciaria', class: 'Classe IIA – não inerte' }
    ]
  },
  '11. Tratamento químico de superfícies': {
    cod: '11',
    sub: [
      { cod: '11 01 05', name: 'Ácidos de decapagem de ligas metálicas', class: 'Classe I – perigoso' }
    ]
  },
  '12. Conformação física/mecânica de metais e plásticos': {
    cod: '12',
    sub: [
      { cod: '12 01 01', name: 'Aparas e limalhas de metais ferrosos', class: 'Classe IIB – inerte' },
      { cod: '12 01 03', name: 'Aparas e limalhas de metais não ferrosos (alumínio, cobre)', class: 'Classe IIB – inerte' }
    ]
  },
  '13. Óleos e combustíveis líquidos': {
    cod: '13',
    sub: [
      { cod: '13 02 05', name: 'Óleos de motores, de engrenagens e lubrificantes usados', class: 'Classe I – perigoso' }
    ]
  },
  '14. Solventes, fluidos de refrigeração e gases propelentes': {
    cod: '14',
    sub: [
      { cod: '14 06 02', name: 'Solventes halogenados e misturas solventes', class: 'Classe I – perigoso' }
    ]
  },
  '15. Embalagens, absorvedores, panos de limpeza e EPIs': {
    cod: '15',
    sub: [
      { cod: '15 01 01', name: 'Embalagens de papel e papelão industriais', class: 'Classe IIB – inerte' },
      { cod: '15 01 02', name: 'Embalagens de plástico industrial limpas', class: 'Classe IIB – inerte' },
      { cod: '15 02 02', name: 'Panos de limpeza, EPIs e filtros contaminados com óleo', class: 'Classe I – perigoso' }
    ]
  },
  '16. Resíduos não especificados em outros capítulos': {
    cod: '16',
    sub: [
      { cod: '16 01 03', name: 'Pneus inservíveis e raspas de borracha', class: 'Classe IIB – inerte' }
    ]
  },
  '17. Construção e demolição (RCC) - CONAMA 307/2002': {
    cod: '17',
    sub: [
      { cod: '17 01 01', name: 'Concreto, tijolos e telhas limpas (Classe A RCC)', class: 'Classe IIB – inerte' },
      { cod: '17 09 04', name: 'Resíduos mistos de demolição (entulho sujo Classe B/C)', class: 'Classe IIA – não inerte' }
    ]
  },
  '18. Resíduos de saúde (RSS) - Anvisa RDC 222/2018': {
    cod: '18',
    sub: [
      { cod: '18 01 03', name: 'Resíduos de saúde infectantes e biológicos Classe A', class: 'Classe I – perigoso' },
      { cod: '18 01 09', name: 'Resíduos químicos e medicamentos vencidos Classe B', class: 'Classe I – perigoso' }
    ]
  },
  '19. Gestão de resíduos, ETEs e tratamento de água': {
    cod: '19',
    sub: [
      { cod: '19 08 05', name: 'Lodo de tratamento de efluentes sanitários (ETE)', class: 'Classe IIA – não inerte' }
    ]
  },
  '20. Resíduos urbanos e equivalentes': {
    cod: '20',
    sub: [
      { cod: '20 01 01', name: 'Papel e cartão reciclável urbano', class: 'Classe IIB – inerte' },
      { cod: '20 01 39', name: 'Plásticos recicláveis urbanos mistos', class: 'Classe IIB – inerte' }
    ]
  }
}

export default function PublicarAnuncioPage() {
  const router = useRouter()
  const supabase = createClient()

  // Profile status
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [repCompanies, setRepCompanies] = useState<any[]>([])

  // Retrieve query parameters safely inside useEffect to avoid Next.js build-time suspense issues
  const [idFichaEmpresa, setIdFichaEmpresa] = useState<string | null>(null)
  const [razaoSocialEmpresa, setRazaoSocialEmpresa] = useState<string | null>(null)

  const [tipoPredefinido, setTipoPredefinido] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const idFicha = params.get('id_ficha_empresa')
      const name = params.get('razao_social')
      const tipoParam = params.get('tipo')
      if (idFicha) setIdFichaEmpresa(idFicha)
      if (name) setRazaoSocialEmpresa(name)
      if (tipoParam === 'Oferta' || tipoParam === 'Demanda') {
        setTipoAnuncio(tipoParam)
        setTipoPredefinido(true)
      }
    }
  }, [])

  // Step state (0 to 10)
  const [step, setStep] = useState(0)

  // Global messages
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Habilitation checks for CNPJ specialization
  const [showHabilitacaoWarning, setShowHabilitacaoWarning] = useState(false)
  const [warningType, setWarningType] = useState<'Oferta' | 'Demanda' | null>(null)

  const isHabilitated = (type: 'Oferta' | 'Demanda') => {
    if (!profile) return true;
    const role = String(profile.tipo_parte || '').toLowerCase();
    
    if (role.includes('transportadora') || role.includes('consultor') || role.includes('corretor') || role.includes('admin')) {
      return true;
    }

    if (role.includes('fornecedor') && role.includes('comprador')) {
      return true;
    }

    if (type === 'Oferta') {
      return role.includes('fornecedor');
    }
    if (type === 'Demanda') {
      return role.includes('comprador');
    }
    return true;
  };

  // ==========================================
  // FORM STATES (11 step structure)
  // ==========================================

  // Autocomplete and matrix compliance states
  const [buscaAmigavel, setBuscaAmigavel] = useState('')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showManualFallback, setShowManualFallback] = useState(false)
  const [grupo, setGrupo] = useState<number | null>(null)
  const [categoriaSubcategoria, setCategoriaSubcategoria] = useState('')
  const [nomeMaterial, setNomeMaterial] = useState('')
  const [distanciaKm, setDistanciaKm] = useState<number>(0)
  const [tipoFluxo, setTipoFluxo] = useState<string>('VENDA')
  const [regimeFornecimento, setRegimeFornecimento] = useState<string>('LOTE_UNICO')
  const [aceitaFracionar, setAceitaFracionar] = useState(false)
  const [aceitaMenorValor, setAceitaMenorValor] = useState(false)
  const [precoUnidade, setPrecoUnidade] = useState<number>(0)
  const [situacaoAnuncio, setSituacaoAnuncio] = useState<string>('NORMAL')

  // Manual free-text metadata fields
  const [origemProcessoGerador, setOrigemProcessoGerador] = useState('')
  const [especificacoesTecnicasExigencias, setEspecificacoesTecnicasExigencias] = useState('')
  const [requisitosAdicionaisObservacoes, setRequisitosAdicionaisObservacoes] = useState('')

  // Step 0: Nome do Anúncio
  const [tituloAnuncio, setTituloAnuncio] = useState('')

  // Step 1: Tipo Anúncio
  const [tipoAnuncio, setTipoAnuncio] = useState<'Oferta' | 'Demanda'>('Oferta')

  // Step 2: Categoria (IBAMA Chapter)
  const [categoria, setCategoria] = useState('12. Conformação física/mecânica de metais e plásticos')
  const [searchCategory, setSearchCategory] = useState('')

  // Step 3: Resíduo Específico, Classe, Quantidade
  const [residuo, setResiduo] = useState('12 01 01 --- Aparas e limalhas de metais ferrosos')
  const [customResiduo, setCustomResiduo] = useState('')
  const [classe, setClasse] = useState('Classe IIB – inerte')
  const [overrideClasse, setOverrideClasse] = useState(false)
  const [codigoIbama, setCodigoIbama] = useState('12 01 01')
  const [estadoFisico, setEstadoFisico] = useState('Sólido')
  const [quantidade, setQuantidade] = useState('')
  const [unidade, setUnidade] = useState('t')
  const [acondicionamento, setAcondicionamento] = useState<string[]>(['Granel'])
  const [acondicionamentoOutro, setAcondicionamentoOutro] = useState('')
  const [origemProcesso, setOrigemProcesso] = useState('')
  const [caracteristicas, setCaracteristicas] = useState<string[]>([])
  const [umidadePercent, setUmidadePercent] = useState(30)
  const [caracteristicasOutros, setCaracteristicasOutros] = useState('')

  // Step 4: Disponibilidade & Coleta
  const [tipoColeta, setTipoColeta] = useState<'COLETA ÚNICA' | 'COLETA RECORRENTE'>('COLETA ÚNICA')
  const [frequencia, setFrequencia] = useState('Mensal')
  const [duracaoContrato, setDuracaoContrato] = useState('12 meses')
  const [quandoComeca, setQuandoComeca] = useState<'Imediatamente' | 'Data específica'>('Imediatamente')
  const [dataInicio, setDataInicio] = useState('')
  const [diasSemana, setDiasSemana] = useState<string[]>(['Seg', 'Ter', 'Qua', 'Qui', 'Sex'])
  const [horariosDisponibilidade, setHorariosDisponibilidade] = useState('08h - 12h (manhã)')
  const [necessidadeAgendamento, setNecessidadeAgendamento] = useState<'Sim' | 'Não'>('Não')
  const [antecedenciaMinima, setAntecedenciaMinima] = useState('2')

  // Step 5: Localização e Logística
  const [uf, setUf] = useState('')
  const [municipio, setMunicipio] = useState('')
  const [cep, setCep] = useState('')
  const [rua, setRua] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [condicoesAcesso, setCondicoesAcesso] = useState<string[]>(['Balança no local'])
  const [alturaMaxima, setAlturaMaxima] = useState('')
  const [pbtMaximo, setPbtMaximo] = useState('')
  const [tipoVeiculoNecessario, setTipoVeiculoNecessario] = useState<string[]>(['Caminhão truck'])
  const [veiculoOutro, setVeiculoOutro] = useState('')
  const [transporteObrigatorio, setTransporteObrigatorio] = useState('Classe II')

  // Step 6: Forma de Negociação & Preço (Materra Index)
  const [formaNegociacao, setFormaNegociacao] = useState<'EU RECEBO' | 'EU PAGO' | 'DOAÇÃO'>('EU RECEBO')
  const [valorDesejado, setValorDesejado] = useState('')
  const [opcaoDoacaoInteressados, setOpcaoDoacaoInteressados] = useState<'Leilão ASCENDENTE' | 'Leilão DESCENDENTE'>('Leilão ASCENDENTE')

  // Real-time index state variables
  const [valorIndexRealTime, setValorIndexRealTime] = useState<number>(340)
  const [unidadeIndexRealTime, setUnidadeIndexRealTime] = useState<string>('t')
  const [loadingIndex, setLoadingIndex] = useState(false)

  // Step 7: Duração do Leilão
  const [duracaoLeilao, setDuracaoLeilao] = useState('48h')
  const [duracaoLeilaoCustom, setDuracaoLeilaoCustom] = useState('')
  const [antiSnipe, setAntiSnipe] = useState(true)
  const [quandoEntraAr, setQuandoEntraAr] = useState<'AGORA' | 'PROGRAMAR'>('AGORA')
  const [dataHoraProgramada, setDataHoraProgramada] = useState('')
  const [coletaEmergencial, setColetaEmergencial] = useState(false)
  const [deadlineEmergencia, setDeadlineEmergencia] = useState('48h')

  // Step 8: Requisitos Recomendados
  const [seloMinimo, setSeloMinimo] = useState('Sem exigência')
  const [scoreMinimo, setScoreMinimo] = useState(0)
  const [documentosSolicitados, setDocumentosSolicitados] = useState<string[]>(['Licença Ambiental válida'])
  const [documentoOutro, setDocumentoOutro] = useState('')
  const [distanciaMaxima, setDistanciaMaxima] = useState('Sem limite')
  const [frequenciaCompativelExigida, setFrequenciaCompativelExigida] = useState(false)
  const [quemArcaFrete, setQuemArcaFrete] = useState<'EU' | 'CONTRAPARTE'>('CONTRAPARTE')
  const [requisitosEscrito, setRequisitosEscrito] = useState('')

  // Step 9: Anexos Mídia
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [fotoUrlSimulated, setFotoUrlSimulated] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [laudoFile, setLaudoFile] = useState<File | null>(null)
  const [fispqFile, setFispqFile] = useState<File | null>(null)

  // Step 10: Aceite
  const [declaracaoAceite, setDeclaracaoAceite] = useState(false)

  // Card view collapse/expand in Step 10
  const [cardExpanded, setCardExpanded] = useState(false)

  // Load account data from Supabase
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
          if (data.uf) setUf(data.uf)
          if (data.cidade) setMunicipio(data.cidade)
          
          if (data.subtipo === 'Corretor' || data.subtipo === 'Corretor/Controlador') {
            const { data: companies } = await supabase
              .from('fichas_empresa_representada')
              .select('*')
              .eq('id_corretor', session.user.id)
              .order('created_at', { ascending: false })
            if (companies) {
              setRepCompanies(companies)
            }
          }
        }
      }
      setLoadingProfile(false)
    }
    loadData()
  }, [])

  // Auto-suggest fields when category or residue changes
  useEffect(() => {
    const list = CATALOGO_IBAMA[categoria]?.sub || []
    if (list.length > 0) {
      const first = list[0]
      setResiduo(`${first.cod} --- ${first.name}`)
      setCodigoIbama(first.cod)
      if (!overrideClasse) {
        setClasse(first.class)
      }
    }
  }, [categoria])

  useEffect(() => {
    const parts = residuo.split(' --- ')
    if (parts.length > 1) {
      setCodigoIbama(parts[0])
      const list = CATALOGO_IBAMA[categoria]?.sub || []
      const found = list.find(item => item.cod === parts[0])
      if (found && !overrideClasse) {
        setClasse(found.class)
      }
    }
  }, [residuo])

  // Automatically enforce FISPQ requirement and Transport type when Classe I is selected
  useEffect(() => {
    if (classe === 'Classe I – perigoso') {
      setTransporteObrigatorio('Classe I')
      if (!documentosSolicitados.includes('CADRI (se Classe I)')) {
        setDocumentosSolicitados(prev => [...prev, 'CADRI (se Classe I)'])
      }
      if (!documentosSolicitados.includes('MOPP do motorista (Classe I)')) {
        setDocumentosSolicitados(prev => [...prev, 'MOPP do motorista (Classe I)'])
      }
    } else {
      setTransporteObrigatorio('Classe II')
    }
  }, [classe])

  // Step 4: Lock transport requirement based on compliance group
  useEffect(() => {
    if (grupo === 4) {
      setTransporteObrigatorio('Classe I')
    } else if (grupo !== null) {
      setTransporteObrigatorio('Classe II')
    }
  }, [grupo])

  // Fetch real-time Index price from API when step is 6 or when residue/UF changes
  useEffect(() => {
    if (step === 6 && residuo && uf) {
      setLoadingIndex(true)
      const cleanRes = residuo.split(' --- ').pop() || residuo
      fetch(`/api/v1/index/price?residue=${encodeURIComponent(cleanRes)}&state=${encodeURIComponent(uf)}`)
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.valor_rs === 'number') {
            setValorIndexRealTime(data.valor_rs)
            setUnidadeIndexRealTime(data.unidade || 't')
          }
        })
        .catch(err => {
          console.error('Erro ao consultar API de indices:', err)
          setValorIndexRealTime(getResidueIndexValue(categoria, residuo))
          setUnidadeIndexRealTime(unidade || 't')
        })
        .finally(() => setLoadingIndex(false))
    }
  }, [step, residuo, uf])

  // Helper validation for plans
  const checkHasPaidPlan = (prof: any): boolean => {
    if (!prof) return false
    if (prof.plano_ativo === true || prof.plano_ativo === 'true') return true
    const planoName = String(prof.plano || '').toLowerCase()
    const planoAtivoName = String(prof.plano_ativo || '').toLowerCase()
    return (
      planoAtivoName.includes('starter') ||
      planoAtivoName.includes('growth') ||
      planoAtivoName.includes('business') ||
      planoAtivoName.includes('intermediário') ||
      planoAtivoName.includes('intermediario') ||
      planoAtivoName.includes('pro') ||
      planoAtivoName.includes('mercado') ||
      planoAtivoName.includes('pago') ||
      planoName.includes('starter') ||
      planoName.includes('growth') ||
      planoName.includes('business') ||
      planoName.includes('intermediário') ||
      planoName.includes('intermediario') ||
      planoName.includes('pro') ||
      planoName.includes('mercado') ||
      planoName.includes('pago')
    )
  }

  // Value index simulation
  const getResidueIndexValue = (cat: string, res: string): number => {
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
    if (r.includes('papelão') || r.includes('papelao')) return 600
    if (r.includes('embalagem') || r.includes('panos')) return 500
    if (r.includes('bagaço') || r.includes('bagaco')) return 50
    if (r.includes('lodo')) return -200
    if (r.includes('tinta') || r.includes('verniz')) return -1200
    if (r.includes('médico') || r.includes('saúde') || r.includes('rss')) return -4000
    return 340 // Fallback
  }

  // Calculate desvio details
  const getDeviationData = () => {
    const val = parseFloat(valorDesejado)
    if (isNaN(val) || formaNegociacao === 'DOAÇÃO') return null
    const indexPrice = valorIndexRealTime
    if (indexPrice === 0) return { diff: 0, percent: 0, color: '#28A745', arrow: '■', label: 'Doação' }
    const diff = val - indexPrice
    const percent = (diff / Math.abs(indexPrice)) * 100

    let color = '#28A745' // Green (#28A745)
    let statusText = 'Normal'
    if (Math.abs(percent) > 10 && Math.abs(percent) <= 20) {
      color = '#FFC107' // Yellow (#FFC107)
      statusText = 'Atenção'
    } else if (Math.abs(percent) > 20) {
      color = '#DC3545' // Red (#DC3545)
      statusText = 'Alerta'
    }

    return {
      diff,
      percent,
      color,
      statusText,
      arrow: percent > 0 ? '📈' : percent < 0 ? '📉' : '■',
      label: `${Math.abs(percent).toFixed(2)}% ${percent > 0 ? 'acima' : percent < 0 ? 'abaixo' : 'igual'} do índice`
    }
  }

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
          setRua(data.logradouro || '')
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err)
      }
    }
  }

  // Simulated File Upload
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

  // Submit flow
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      if (!user || !profile) {
        throw new Error('Você precisa estar logado para publicar.')
      }

      const publicationsUsed = profile.publicacoes_usadas || 0
      const isPlanoActive = checkHasPaidPlan(profile)

      if (publicationsUsed >= 1 && !isPlanoActive) {
        throw new Error('Você atingiu o limite gratuito de 1 publicação. Por favor, ative um plano pago (Starter, Growth ou Business) para continuar publicando.')
      }

      if (grupo === 4 && !fispqFile) {
        throw new Error('A FISPQ é obrigatória para resíduos do Grupo 4 (Perigoso).')
      }

      if (!declaracaoAceite) {
        throw new Error('Você deve declarar e aceitar os termos antes de publicar.')
      }

      // Upload files
      let fotoUrl = fotoUrlSimulated
      let videoUrl = ''
      let licencaAnexoUrl = ''

      if (fotoFile) {
        fotoUrl = await uploadFile(fotoFile, 'foto', user.id)
      }
      if (videoFile) {
        videoUrl = await uploadFile(videoFile, 'video', user.id)
      }
      if (fispqFile) {
        licencaAnexoUrl = await uploadFile(fispqFile, 'fispq', user.id)
      } else if (laudoFile) {
        licencaAnexoUrl = await uploadFile(laudoFile, 'laudo', user.id)
      }

      const codigo = generateShortCode()
      const actualResiduo = residuo === 'Outro (descrever)' ? customResiduo : residuo.split(' --- ').pop() || residuo
      const desired = parseFloat(valorDesejado) || 0

      const devData = getDeviationData()
      const devText = devData ? `${devData.percent > 0 ? '+' : ''}${devData.percent.toFixed(1)}% do Index` : 'Doação'

      let duracaoHoras: number | null = 48
      if (duracaoLeilao === '24h') duracaoHoras = 24
      if (duracaoLeilao === '48h') duracaoHoras = 48
      if (duracaoLeilao === '72h') duracaoHoras = 72
      if (duracaoLeilao === '1 semana') duracaoHoras = 168
      if (duracaoLeilao === 'Personalizado') duracaoHoras = parseInt(duracaoLeilaoCustom) || 48

      let mappingTipoLeilao = 'Sem leilão'
      if (formaNegociacao === 'EU RECEBO') mappingTipoLeilao = 'Ascendente'
      if (formaNegociacao === 'EU PAGO') mappingTipoLeilao = 'Descendente'
      if (formaNegociacao === 'DOAÇÃO') {
        mappingTipoLeilao = opcaoDoacaoInteressados === 'Leilão ASCENDENTE' ? 'Ascendente' : 'Descendente'
      }

      // Map exact 15 keys
      const mappedGrupo = grupo !== null ? grupo : (classe === 'Classe I – perigoso' ? 4 : 3)
      const regimeFornecVal = tipoColeta === 'COLETA RECORRENTE' ? 'CONTRATO' : 'LOTE_UNICO'
      
      let mappedFluxo = 'VENDA'
      if (tipoAnuncio === 'Oferta') {
        if (formaNegociacao === 'DOAÇÃO') mappedFluxo = 'DOACAO'
        else if (formaNegociacao === 'EU RECEBO') mappedFluxo = 'VENDA'
        else mappedFluxo = 'PASSIVO'
      } else {
        if (formaNegociacao === 'DOAÇÃO') mappedFluxo = 'DOACAO'
        else if (formaNegociacao === 'EU PAGO') mappedFluxo = 'COMPRA'
        else mappedFluxo = 'PASSIVO'
      }

      const mappedSelo = seloMinimo === 'Sem exigência' ? 'LIVRE' : seloMinimo.toUpperCase()
      const mappedFrete = quemArcaFrete === 'EU'
      const mappedSituacao = coletaEmergencial ? 'EMERGENCIA' : (mappedSelo !== 'LIVRE' ? 'DESTAQUE' : 'NORMAL')

      // Build payload for anuncios
      let payload = {
        id_cadastro: user.id,
        id_ficha_empresa: idFichaEmpresa || null,
        codigo,
        titulo: tituloAnuncio || actualResiduo,
        tipo_anuncio: tipoAnuncio,
        forma_cobranca: formaNegociacao === 'EU RECEBO' ? 'Recebo pelo resíduo' : (formaNegociacao === 'DOAÇÃO' ? 'Doação' : 'Pago pela destinação'),
        duracao_leilao_horas: duracaoHoras,
        categoria,
        residuo: actualResiduo,
        prazo_recorrencia: tipoColeta === 'COLETA RECORRENTE' ? duracaoContrato : null,
        codigo_ibama: codigoIbama,
        classe,
        estado_fisico: estadoFisico,
        quantidade: parseFloat(quantidade) || 0,
        unidade,
        frequencia: tipoColeta === 'COLETA RECORRENTE' ? frequencia : 'Única',
        acondicionamento: acondicionamento.join(', ') + (acondicionamentoOutro ? `: ${acondicionamentoOutro}` : ''),
        cep,
        uf,
        municipio,
        origem_processo: origemProcessoGerador || origemProcesso,
        caracteristicas: caracteristicas.join(', ') + (caracteristicasOutros ? `: ${caracteristicasOutros}` : ''),
        foto_url: fotoUrl || null,
        video_url: videoUrl || null,
        valor_desejado: desired,
        valor_index: valorIndexRealTime,
        percentual_desvio: devText,
        tipo_leilao: mappingTipoLeilao,
        tratamento_destinacao: TRATAMENTOS_PREVISTOS[0],
        tem_licenca: !!laudoFile,
        licenca_anexo_url: licencaAnexoUrl || null,
        disponibilidade_imediata: quandoComeca === 'Imediatamente',
        urgencia_prazo: coletaEmergencial ? 'Urgente' : 'Normal',
        identidade_oculta: true,
        status: 'Anunciado',
        quem_arca_frete: quemArcaFrete,
        observacoes: requisitosAdicionaisObservacoes || requisitosEscrito || `Frequência compatível exigida: ${frequenciaCompativelExigida ? 'Sim' : 'Não'}`,
        
        // 15 exact keys for vitrine search index
        grupo: mappedGrupo,
        categoria_subcategoria: categoriaSubcategoria || categoria,
        nome_material: tituloAnuncio || actualResiduo,
        distancia_km: distanciaKm || 0,
        tipo_fluxo: mappedFluxo,
        regime_fornecimento: regimeFornecVal,
        volume_total: parseFloat(quantidade) || 0,
        aceita_menor_valor: aceitaMenorValor,
        preco_unidade: desired,
        situacao_anuncio: mappedSituacao,
        selo_minimo: mappedSelo,
        tem_avaliacao: !!laudoFile,
        responsavel_frete: mappedFrete,
        infraestrutura_minima: condicoesAcesso,
        origem_processo_gerador: origemProcessoGerador || origemProcesso,
        especificacoes_tecnicas_exigencias: especificacoesTecnicasExigencias,
        requisitos_adicionais_observacoes: requisitosAdicionaisObservacoes || requisitosEscrito
      }

      // Save announcement in localStorage so it appears in the Vitrine mock/wireframe list
      try {
        const localListStr = localStorage.getItem('materra_local_anuncios') || '[]'
        const localList = JSON.parse(localListStr)
        const repCompanyObj = repCompanies.find(c => c.id === idFichaEmpresa)
        const localObj = {
          ...payload,
          id: 'local_' + codigo,
          created_at: new Date().toISOString(),
          cadastros: {
            selo_verificado: true,
            nivel_selo: profile?.nivel_selo || 'Bronze',
            score_0a100: profile?.score_0a100 || 85,
            subtipo: profile?.subtipo || 'Empresa',
            tipo_parte: profile?.tipo_parte || 'Fornecedor'
          },
          fichas_empresa_representada: repCompanyObj || null
        }
        localList.unshift(localObj)
        localStorage.setItem('materra_local_anuncios', JSON.stringify(localList))
      } catch (e) {
        console.warn('Could not save announcement locally:', e)
      }

      const { error: insertError } = await supabase
        .from('anuncios')
        .insert([payload])

      if (insertError) {
        console.warn('Database insert failed (falling back to simulated success for wireframe):', insertError)
      }

      // Increment publicacoes_usadas count
      try {
        await supabase
          .from('cadastros')
          .update({ publicacoes_usadas: publicationsUsed + 1 })
          .eq('id', user.id)
      } catch (countError) {
        console.warn('Could not update publications count:', countError)
      }

      setSuccessMsg(`Anúncio publicado com sucesso (Wireframe)! Código: ${codigo}`)
      setStep(11) // Success Screen
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao publicar o anúncio.')
      setStep(10) // Stay on confirmation to view error
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Photo input (simulating file reader)
  const handlePhotoUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFotoFile(file)
      // Make local preview URL
      const reader = new FileReader()
      reader.onload = (event) => {
        setFotoUrlSimulated(event.target?.result as string || '')
      }
      reader.readAsDataURL(file)
    }
  }

  // Render Step Navigation Buttons
  const renderNavButtons = () => {
    // Determine if next is disabled based on current step obligations
    let nextDisabled = false

    if (step === 0) {
      nextDisabled = !tituloAnuncio || tituloAnuncio.length < 10 || tituloAnuncio.length > 100
    }
    if (step === 2) {
      nextDisabled = !selectedItem && !showManualFallback
    }
    if (step === 3) {
      const textVal = tipoAnuncio === 'Oferta' ? origemProcessoGerador : especificacoesTecnicasExigencias
      nextDisabled = !quantidade || parseFloat(quantidade) <= 0 || !residuo || !textVal || textVal.length < 20
    }
    if (step === 4) {
      nextDisabled = quandoComeca === 'Data específica' && !dataInicio
    }
    if (step === 5) {
      nextDisabled = !uf || !municipio || !cep || !rua || !numero
    }
    if (step === 6) {
      nextDisabled = formaNegociacao !== 'DOAÇÃO' && !valorDesejado
    }

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginTop: '32px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px' }}>
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(prev => (tipoPredefinido && prev === 2) ? 0 : prev - 1)}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'var(--text-secondary)',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-heading)',
              textTransform: 'uppercase',
              fontSize: '0.8rem'
            }}
          >
            ← Voltar
          </button>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
          <Link
            href="/"
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: 'none',
              color: 'var(--danger)',
              textDecoration: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              fontFamily: 'var(--font-heading)',
              textTransform: 'uppercase',
              fontSize: '0.8rem'
            }}
          >
            Cancelar Rascunho
          </Link>
          {step < 10 ? (
            <button
              type="button"
              disabled={nextDisabled}
              onClick={() => setStep(prev => (tipoPredefinido && prev === 0) ? 2 : prev + 1)}
              style={{
                padding: '12px 28px',
                background: nextDisabled ? 'rgba(255,255,255,0.05)' : 'var(--primary)',
                border: 'none',
                color: nextDisabled ? '#666' : '#000',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: nextDisabled ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-heading)',
                textTransform: 'uppercase',
                fontSize: '0.8rem'
              }}
            >
              Próximo Passo →
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting || !declaracaoAceite || (grupo === 4 && !fispqFile)}
              style={{
                padding: '12px 32px',
                background: (submitting || !declaracaoAceite || (grupo === 4 && !fispqFile)) ? 'rgba(255,255,255,0.05)' : '#00FF66',
                border: 'none',
                color: '#000',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: (submitting || !declaracaoAceite || (grupo === 4 && !fispqFile)) ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-heading)',
                textTransform: 'uppercase',
                fontSize: '0.8rem'
              }}
            >
              {submitting ? 'Publicando...' : 'Publicar Anúncio Agora 🚀'}
            </button>
          )}
        </div>
      </div>
    )
  }

  if (loadingProfile) {
    return (
      <div style={{ justifyContent: 'center', alignItems: 'center', background: '#000', minHeight: '100vh', display: 'flex' }}>
        <p style={{ color: '#aaa', fontFamily: 'sans-serif' }}>Carregando dados da conta...</p>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div style={{ justifyContent: 'center', alignItems: 'center', background: '#000', minHeight: '100vh', display: 'flex', padding: '20px' }}>
        <div className="glass" style={{ textAlign: 'center', padding: '40px', maxWidth: '420px', width: '100%' }}>
          <span style={{ fontSize: '3rem' }}>🔒</span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--primary)', marginTop: '20px' }}>Acesso Restrito</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '12px 0 24px 0', lineHeight: 1.5 }}>
            Você precisa estar logado para publicar anúncios na plataforma.
          </p>
          <Link href="/auth/login" className="btn btn-primary" style={{ display: 'block', padding: '12px', textDecoration: 'none', color: '#000', fontWeight: 'bold' }}>
            Entrar na minha Conta
          </Link>
        </div>
      </div>
    )
  }

  if (profile.tipo_parte === 'Transportadora') {
    return (
      <div style={{ justifyContent: 'center', alignItems: 'center', background: '#000', minHeight: '100vh', display: 'flex', padding: '20px' }}>
        <div className="glass" style={{ textAlign: 'center', padding: '40px', maxWidth: '420px', width: '100%' }}>
          <span style={{ fontSize: '3rem' }}>🚫</span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--danger)', marginTop: '20px' }}>Acesso Restrito</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '12px 0 24px 0', lineHeight: 1.5 }}>
            Transportadoras exclusivas não podem publicar anúncios de resíduos industriais.
          </p>
          <Link href="/" className="btn btn-primary" style={{ display: 'block', padding: '12px', textDecoration: 'none', color: '#000', fontWeight: 'bold' }}>
            Voltar ao Início
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      color: 'var(--text-primary)'
    }}>
      {/* Background Glows */}
      <div className="ambient-glow-gold" style={{ top: '10%', left: '-10%', opacity: 0.15 }} />
      <div className="ambient-glow-gold" style={{ bottom: '10%', right: '-10%', opacity: 0.1 }} />

      {/* Header Navigation */}
      <header className="glass" style={{
        borderRadius: 0,
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <LogoGlobe size={30} />
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.3rem',
              fontWeight: 900,
              color: 'var(--primary)',
              letterSpacing: '0.05em',
              textShadow: '0 0 10px rgba(255, 215, 0, 0.25)',
            }}>
              MATERRA ELO
            </span>
          </Link>
          <Link href="/" className="nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <ArrowLeft size={16} /> Voltar ao Dashboard
          </Link>
        </div>
      </header>

      {/* Main Flow Container */}
      <main style={{ maxWidth: '800px', margin: '40px auto 100px', padding: '0 24px', width: '100%', flex: 1, zIndex: 1 }}>
        
        {/* Step Indicator Header */}
        {step <= 10 && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {tipoPredefinido 
                  ? `PASSO ${step === 0 ? 0 : step - 1} DE 9`
                  : `PASSO ${step} DE 10`
                }
              </span>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                {step === 0 && 'Nome do Anúncio'}
                {step === 1 && 'Tipo de Anúncio'}
                {step === 2 && 'Dados do Produto & Matriz Elo'}
                {step === 3 && 'Detalhamento do Resíduo'}
                {step === 4 && 'Disponibilidade e Coleta'}
                {step === 5 && 'Localização & Logística'}
                {step === 6 && 'Forma de Negociação'}
                {step === 7 && 'Requisitos & Projeção MTR/CDF'}
                {step === 8 && 'Duração & Urgência'}
                {step === 9 && 'Mídias e Anexos'}
                {step === 10 && 'Confirmação e Preview'}
              </span>
            </div>
            {/* Horizontal progress indicators */}
            <div style={{ display: 'flex', gap: '4px', height: '6px' }}>
              {Array.from({ length: tipoPredefinido ? 10 : 11 }).map((_, idx) => {
                const currentStepIndex = tipoPredefinido ? (step === 0 ? 0 : step - 1) : step;
                const isActive = idx === currentStepIndex;
                const isCompleted = idx < currentStepIndex;
                return (
                  <div
                    key={idx}
                    style={{
                      flex: 1,
                      background: isActive 
                        ? 'var(--accent)' 
                        : isCompleted 
                          ? 'var(--primary)' 
                          : 'rgba(255,255,255,0.06)',
                      borderRadius: '3px',
                      transition: 'all 0.3s ease'
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px', padding: '36px' }}>
          
          {errorMsg && (
            <div className="form-error" style={{ marginBottom: '24px', background: 'rgba(255, 83, 83, 0.08)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '16px', borderRadius: '8px' }}>
              <AlertTriangle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              {errorMsg}
            </div>
          )}

          {/* ==========================================
              STEP 0: NOME DO ANÚNCIO
             ========================================== */}
          {step === 0 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>
                Nome do Anúncio *
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '28px' }}>
                Seja descritivo! Um bom nome atrai mais interessados.
              </p>

              {(profile?.subtipo === 'Corretor' || profile?.subtipo === 'Corretor/Controlador') && (
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Publicar em nome de qual empresa?</label>
                  <select
                    className="form-input"
                    value={idFichaEmpresa || ''}
                    onChange={e => {
                      const val = e.target.value
                      setIdFichaEmpresa(val || null)
                      const comp = repCompanies.find(c => c.id === val)
                      setRazaoSocialEmpresa(comp ? comp.razao_social : null)
                    }}
                    style={{ background: '#1A1A1A', color: '#fff', border: '1px solid #333', padding: '12px', width: '100%', borderRadius: '6px', fontSize: '0.9rem', marginTop: '6px' }}
                  >
                    <option value="">Apenas eu ({profile.nome_ou_razao})</option>
                    {repCompanies.map(comp => (
                      <option key={comp.id} value={comp.id}>
                        {comp.razao_social} (CNPJ: {comp.cnpj})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Nome / Título do Anúncio</label>
                <input
                  type="text"
                  placeholder="ex: Aparas de ferro limpas - São Paulo SP"
                  className="form-input"
                  value={tituloAnuncio}
                  onChange={e => setTituloAnuncio(e.target.value)}
                  maxLength={100}
                  minLength={10}
                  style={{ background: '#1A1A1A', color: '#fff', border: '1px solid #333', padding: '12px', width: '100%', borderRadius: '6px', fontSize: '0.9rem', marginTop: '6px' }}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: tituloAnuncio.length >= 10 ? '#28A745' : '#DC3545', marginTop: '8px', display: 'block' }}>
                  {tituloAnuncio.length}/100 caracteres (mínimo 10)
                </span>
              </div>
            </div>
          )}

          {/* ==========================================
              STEP 1: TIPO DE ANÚNCIO
             ========================================== */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
                O que você deseja anunciar?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '28px' }}>
                Selecione se possui um material para ofertar ou se busca um material no mercado.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                <div
                  onClick={() => {
                    if (isHabilitated('Oferta')) {
                      setTipoAnuncio('Oferta');
                      setStep(2);
                    } else {
                      setWarningType('Oferta');
                      setShowHabilitacaoWarning(true);
                    }
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.01)',
                    border: tipoAnuncio === 'Oferta' ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '10px',
                    padding: '32px 24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = tipoAnuncio === 'Oferta' ? 'var(--accent)' : 'rgba(255,255,255,0.05)' }}
                >
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '16px' }}>📦</span>
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '8px' }}>OFERTA</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4, marginBottom: '20px' }}>
                    Tenho esse resíduo / coproduto e quero destinar ou vender para parceiros.
                  </p>
                  <button type="button" style={{ border: 'none', background: 'none', color: 'var(--accent)', fontWeight: 'bold', fontSize: '0.85rem', padding: 0 }}>
                    Selecionar Oferta →
                  </button>
                </div>

                <div
                  onClick={() => {
                    if (isHabilitated('Demanda')) {
                      setTipoAnuncio('Demanda');
                      setStep(2);
                    } else {
                      setWarningType('Demanda');
                      setShowHabilitacaoWarning(true);
                    }
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.01)',
                    border: tipoAnuncio === 'Demanda' ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '10px',
                    padding: '32px 24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = tipoAnuncio === 'Demanda' ? 'var(--accent)' : 'rgba(255,255,255,0.05)' }}
                >
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '16px' }}>🔍</span>
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '8px' }}>DEMANDA</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4, marginBottom: '20px' }}>
                    Preciso de resíduos / coprodutos específicos e quero comprar ou coletar.
                  </p>
                  <button type="button" style={{ border: 'none', background: 'none', color: 'var(--accent)', fontWeight: 'bold', fontSize: '0.85rem', padding: 0 }}>
                    Selecionar Demanda →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              STEP 2: CATEGORIA DO RESÍDUO (IBAMA Chapters / Autocomplete)
             ========================================== */}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
                Dados do Produto & Matriz Materra Elo
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '28px' }}>
                Digite o termo popular/comercial do material para obter o compliance automático.
              </p>

              {!selectedItem && !showManualFallback && (
                <div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label">Busca do Material (Friendly Term)</label>
                    <input
                      type="text"
                      placeholder="Digite ex: 'Farelo de soja', 'Rejeito de minério', 'Lâmpadas'..."
                      className="form-input"
                      value={buscaAmigavel}
                      onChange={e => setBuscaAmigavel(e.target.value)}
                      style={{ background: '#000', color: '#fff', border: '1px solid #333', padding: '12px' }}
                    />
                  </div>

                  {buscaAmigavel.trim().length > 1 && (
                    <div style={{
                      background: '#111',
                      border: '1px solid #222',
                      borderRadius: '8px',
                      maxHeight: '260px',
                      overflowY: 'auto',
                      marginBottom: '20px'
                    }}>
                      {AUTOCOMPLETE_DICTIONARY.filter(item =>
                        item.termo_amigavel.toLowerCase().includes(buscaAmigavel.toLowerCase())
                      ).slice(0, 10).map(item => (
                        <div
                          key={item.termo_amigavel}
                          onClick={() => {
                            setSelectedItem(item);
                            setGrupo(item.grupo);
                            setCategoriaSubcategoria(item.categoria_subcategoria);
                            setCodigoIbama(item.codigo_ibama);
                            setNomeMaterial(item.termo_amigavel);
                            setTituloAnuncio(item.termo_amigavel);
                            
                            // Map friendly class to database enum
                            let dbClasse = 'Classe IIB – inerte';
                            if (item.classe_perigo_nbr.includes('Classe I')) {
                              dbClasse = 'Classe I – perigoso';
                            } else if (item.classe_perigo_nbr.includes('Classe II-A') || item.classe_perigo_nbr.includes('Classe IIA')) {
                              dbClasse = 'Classe IIA – não inerte';
                            }
                            setClasse(dbClasse);
                          }}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid #222',
                            cursor: 'pointer',
                            color: '#fff',
                            fontSize: '0.9rem',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#1a1a1a' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                        >
                          <span style={{ fontWeight: 'bold', color: 'var(--primary-500)' }}>{item.termo_amigavel}</span>
                          <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: '10px' }}>
                            (Grupo {item.grupo} • {item.classe_perigo_nbr})
                          </span>
                        </div>
                      ))}
                      {AUTOCOMPLETE_DICTIONARY.filter(item =>
                        item.termo_amigavel.toLowerCase().includes(buscaAmigavel.toLowerCase())
                      ).length === 0 && (
                        <div style={{ padding: '16px', color: '#666', textAlign: 'center', fontSize: '0.95rem' }}>
                          Nenhum material encontrado com este termo.
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button
                      type="button"
                      onClick={() => setShowManualFallback(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        textDecoration: 'underline'
                      }}
                    >
                      Ou escolha manualmente no catálogo IBAMA
                    </button>
                  </div>
                </div>
              )}

              {selectedItem && (
                <div style={{
                  background: '#0a0a0a',
                  border: '1px solid rgba(255, 215, 0, 0.25)',
                  borderRadius: '10px',
                  padding: '24px',
                  boxShadow: '0 0 15px rgba(255, 215, 0, 0.05)',
                  marginBottom: '24px'
                }}>
                  <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={18} style={{ color: 'var(--primary)' }} />
                    Card de Compliance (Somente Leitura)
                  </h3>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '12px',
                    marginBottom: '20px',
                    background: '#121212',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #222'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>Material</span>
                      <strong style={{ display: 'block', fontSize: '0.85rem', color: '#fff', marginTop: '2px' }}>{selectedItem.termo_amigavel}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>Materra Grupo</span>
                      <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--primary-500)', marginTop: '2px' }}>
                        Grupo {selectedItem.grupo}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>Código IBAMA</span>
                      <strong style={{ display: 'block', fontSize: '0.85rem', color: '#ccc', marginTop: '2px' }}>{selectedItem.codigo_ibama}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>Classe NBR</span>
                      <strong style={{ display: 'block', fontSize: '0.85rem', color: '#ccc', marginTop: '2px' }}>{selectedItem.classe_perigo_nbr}</strong>
                    </div>
                  </div>

                  {/* Duties matrix warning based on group and type */}
                  <div style={{
                    background: selectedItem.grupo === 4 ? 'rgba(239, 83, 80, 0.06)' : 'rgba(0, 255, 102, 0.03)',
                    border: `1px solid ${selectedItem.grupo === 4 ? '#ef5350' : '#28A745'}`,
                    padding: '16px',
                    borderRadius: '8px',
                    color: '#eee',
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    marginBottom: '24px'
                  }}>
                    <strong style={{ display: 'block', color: selectedItem.grupo === 4 ? '#ef5350' : '#28A745', marginBottom: '6px', fontSize: '0.9rem' }}>
                      📋 INTEGRAÇÃO MATRIZ ELO — DEVERES LEGAIS:
                    </strong>
                    {selectedItem.grupo === 1 ? (
                      tipoAnuncio === 'Oferta' ? (
                        "Classificação confirmada: Grupo 1 (Coproduto). Deveres Legais: O Fornecedor (Você) emitirá apenas NF-e e Cadastro Técnico Estadual comum. A Transportadora portará o DANFE (sem exigência de licença ambiental). O Comprador precisará de LO Industrial padrão. Isento de MTR e CDF."
                      ) : (
                        "Demanda de Grupo 1 (Coproduto). Deveres Legais: O Fornecedor emitirá NF-e e CTF. A Transportadora usará DANFE (sem licença ambiental). Como Comprador, você precisará de LO Industrial padrão. Isento de MTR e CDF."
                      )
                    ) : (selectedItem.grupo === 2 || selectedItem.grupo === 3) ? (
                      tipoAnuncio === 'Oferta' ? (
                        `Classificação confirmada: Grupo ${selectedItem.grupo} (Resíduo Classe II). Deveres Legais: O Fornecedor (Você) precisará de LO com PGRS e CTF/APP ativo. A Transportadora exigirá Licença Ambiental de Transporte Rodoviário. O Comprador precisará de LO de Tratamento/Reciclagem. A emissão de MTR e CDF será obrigatória.`
                      ) : (
                        `Demanda de Grupo ${selectedItem.grupo}. Deveres Legais: O Fornecedor precisará de LO, PGRS e emitir o MTR. A Transportadora exigirá Licença Rodoviária. Você, como Comprador/Destinador, precisará de LO de Tratamento e será legalmente obrigado a gerar o CDF no SINIR.`
                      )
                    ) : (
                      tipoAnuncio === 'Oferta' ? (
                        "Classificação confirmada: Grupo 4 (Classe I - Perigoso). Deveres Legais Severos: O Fornecedor (Você) precisará de PGRS Classe I, Laudo e Ficha de Emergência. A Transportadora necessitará de Licença de Carga Perigosa, CIPP, curso MOPP, ANTT e Seguro. O Comprador exigirá LO restrita Classe I. MTR e CDF são mandatórios."
                      ) : (
                        "Demanda de Classe I. Deveres Legais Severos: O Fornecedor precisará de PGRS Classe I, Ficha de Emergência e emitirá MTR rígido. A Transportadora exigirá Licença de Carga Perigosa, CIPP e MOPP. Você, como Comprador, precisará de LO restrita Classe I e será obrigado a emitir o CDF."
                      )
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '12px', color: '#000', fontWeight: 'bold' }}
                    >
                      ✔ SIM, CONCORDO COM A CLASSIFICAÇÃO
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSelectedItem(null); setBuscaAmigavel(''); }}
                      className="btn btn-secondary"
                      style={{ padding: '12px 18px', background: '#1c1c1c', border: '1px solid #333' }}
                    >
                      ESCOLHER OUTRO TERMO
                    </button>
                  </div>
                </div>
              )}

              {showManualFallback && (
                <div>
                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="form-label">Filtrar Categoria</label>
                    <input
                      type="text"
                      placeholder="Pesquise por nome ou código (ex: 'Metais', '12 01')"
                      className="form-input"
                      value={searchCategory}
                      onChange={e => setSearchCategory(e.target.value)}
                      style={{ background: '#000', color: '#fff', border: '1px solid #333', padding: '10px' }}
                    />
                  </div>

                  <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px', marginBottom: '20px' }}>
                    {Object.keys(CATALOGO_IBAMA)
                      .filter(cat => cat.toLowerCase().includes(searchCategory.toLowerCase()))
                      .map(cat => {
                        const isSelected = categoria === cat
                        return (
                          <div
                            key={cat}
                            onClick={() => {
                              setCategoria(cat);
                              // Mock manual choice details
                              setGrupo(cat.includes('Saúde') || cat.includes('Perigosos') || cat.includes('Óleos') ? 4 : 3);
                              setCategoriaSubcategoria(cat);
                              setSelectedItem({
                                termo_amigavel: cat,
                                grupo: cat.includes('Saúde') || cat.includes('Perigosos') || cat.includes('Óleos') ? 4 : 3,
                                categoria_subcategoria: cat,
                                codigo_ibama: CATALOGO_IBAMA[cat]?.cod || '00',
                                classe_perigo_nbr: cat.includes('Saúde') || cat.includes('Perigosos') || cat.includes('Óleos') ? 'Classe I (Perigoso)' : 'Classe II-A'
                              });
                              setShowManualFallback(false);
                            }}
                            style={{
                              background: isSelected ? 'rgba(255, 215, 0, 0.08)' : 'rgba(255,255,255,0.01)',
                              border: isSelected ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.05)',
                              borderRadius: '6px',
                              padding: '12px 16px',
                              cursor: 'pointer',
                              color: isSelected ? 'var(--accent)' : '#fff',
                              fontSize: '0.85rem'
                            }}
                          >
                            {cat}
                          </div>
                        )
                      })}
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setShowManualFallback(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        textDecoration: 'underline'
                      }}
                    >
                      ← Voltar para Autocomplete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              STEP 3: RESÍDUO ESPECÍFICO + CLASSIFICAÇÃO
             ========================================== */}
          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', marginBottom: '28px' }}>
                Identificação do Resíduo
              </h2>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Resíduo Específico (Catálogo IBAMA) *</label>
                <select
                  className="form-select"
                  value={residuo}
                  onChange={e => setResiduo(e.target.value)}
                  style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                >
                  {(CATALOGO_IBAMA[categoria]?.sub || []).map(item => (
                    <option key={item.cod} value={`${item.cod} --- ${item.name}`}>
                      {item.cod} --- {item.name}
                    </option>
                  ))}
                  <option value="Outro (descrever)">Outro (descrever)</option>
                </select>
              </div>

              {residuo === 'Outro (descrever)' && (
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Especifique o Nome do Material *</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                    value={customResiduo}
                    onChange={e => setCustomResiduo(e.target.value)}
                    placeholder="Ex: Escória metálica de solda"
                    required
                  />
                </div>
              )}

              {/* Classe de Perigo */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Classe de Perigo *</span>
                  <label style={{ fontSize: '0.8rem', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="checkbox" checked={overrideClasse} onChange={e => setOverrideClasse(e.target.checked)} />
                    Sobrescrever automático (análise técnica)
                  </label>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '8px' }}>
                  {[
                    { val: 'Classe I – perigoso', label: 'CLASSE I', color: 'red', desc: 'Perigoso' },
                    { val: 'Classe IIA – não inerte', label: 'CLASSE IIA', color: 'orange', desc: 'Não Inerte' },
                    { val: 'Classe IIB – inerte', label: 'CLASSE IIB', color: 'green', desc: 'Inerte' }
                  ].map(item => {
                    const active = classe === item.val
                    return (
                      <div
                        key={item.val}
                        onClick={() => {
                          if (overrideClasse) {
                            setClasse(item.val)
                          } else {
                            alert('Habilite o checkbox de sobrescrever para mudar a classe sugerida.')
                          }
                        }}
                        style={{
                          background: active ? '#1a1a1a' : 'rgba(255,255,255,0.01)',
                          border: active 
                            ? `1px solid ${item.color === 'red' ? '#ef5350' : item.color === 'orange' ? '#ffd700' : '#4caf50'}`
                            : '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '6px',
                          padding: '12px 6px',
                          textAlign: 'center',
                          cursor: overrideClasse ? 'pointer' : 'not-allowed',
                          opacity: (overrideClasse || active) ? 1 : 0.4
                        }}
                      >
                        <strong style={{
                          fontSize: '0.8rem',
                          color: item.color === 'red' ? '#ef5350' : item.color === 'orange' ? '#ffd700' : '#4caf50'
                        }}>
                          {item.label}
                        </strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>{item.desc}</span>
                      </div>
                    )
                  })}
                </div>
                {grupo === 4 && (
                  <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(255,77,77,0.06)', border: '1px solid rgba(255,77,77,0.2)', color: '#ef5350', fontSize: '0.8rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={16} />
                    <span>Atenção: Resíduos do Grupo 4 exigem anexar a FISPQ na etapa final de mídias.</span>
                  </div>
                )}
              </div>

              {/* Codigo IBAMA (Read-Only) */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Código IBAMA correspondente</label>
                <input
                  type="text"
                  readOnly
                  disabled
                  className="form-input"
                  style={{ background: '#111', color: '#666', border: '1px solid #222' }}
                  value={codigoIbama}
                />
              </div>

              {/* Estado Fisico, Quantidade, Unidade */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Estado Físico *</label>
                  <select className="form-select" value={estadoFisico} onChange={e => setEstadoFisico(e.target.value)}>
                    <option value="Sólido">Sólido</option>
                    <option value="Líquido">Líquido</option>
                    <option value="Semissólido">Semissólido</option>
                    <option value="Pastoso">Pastoso</option>
                    <option value="Gasoso">Gasoso</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Quantidade *</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    max="999999.999"
                    className="form-input"
                    value={quantidade}
                    onChange={e => setQuantidade(e.target.value)}
                    placeholder="0,001"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Unidade *</label>
                  <select className="form-select" value={unidade} onChange={e => setUnidade(e.target.value)}>
                    <option value="kg">kg</option>
                    <option value="t">t (Tonelada)</option>
                    <option value="L">L (Litro)</option>
                    <option value="m³">m³ (Metro Cúbico)</option>
                    <option value="unidade">unidade (Peça)</option>
                  </select>
                </div>
              </div>

              {/* Acondicionamento */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Forma de Acondicionamento * (Marque todas aplicáveis)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '8px 0' }}>
                  {acondicionamento.map(cond => (
                    <span key={cond} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,215,0,0.08)', border: '1px solid var(--primary)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 10px', borderRadius: '4px' }}>
                      {cond}
                      <X size={12} style={{ cursor: 'pointer' }} onClick={() => setAcondicionamento(prev => prev.filter(c => c !== cond))} />
                    </span>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', marginTop: '10px' }}>
                  {['Granel', 'Big bag', 'Tambor', 'Bombona', 'Caçamba aberta', 'Caçamba fechada', 'Container', 'Pallets', 'Fardo', 'Saco plástico', 'Outros'].map(opt => {
                    const checked = acondicionamento.includes(opt)
                    return (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#ccc', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => {
                            if (e.target.checked) {
                              setAcondicionamento(prev => [...prev, opt])
                            } else {
                              setAcondicionamento(prev => prev.filter(c => c !== opt))
                            }
                          }}
                        />
                        {opt}
                      </label>
                    )
                  })}
                </div>
                {acondicionamento.includes('Outros') && (
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="Descreva a forma de acondicionamento..."
                    style={{ marginTop: '10px', fontSize: '0.85rem' }}
                    value={acondicionamentoOutro}
                    onChange={e => setAcondicionamentoOutro(e.target.value)}
                    required
                  />
                )}
              </div>

              {/* Origem Processo / Especificações Técnicas */}
              {tipoAnuncio === 'Oferta' ? (
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Origem / Processo Gerador *</span>
                    <span style={{ fontSize: '0.75rem', color: origemProcessoGerador.length >= 20 ? '#4caf50' : '#ff5353' }}>
                      {origemProcessoGerador.length}/500 (mínimo 20 caracteres)
                    </span>
                  </label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Descreva detalhadamente de onde vem o material (ex: refugo do setor de corte de chapas)..."
                    value={origemProcessoGerador}
                    onChange={e => {
                      setOrigemProcessoGerador(e.target.value);
                      setOrigemProcesso(e.target.value); // fallback legacy
                    }}
                    minLength={20}
                    maxLength={500}
                    required
                  />
                </div>
              ) : (
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Especificações Técnicas e Exigências *</span>
                    <span style={{ fontSize: '0.75rem', color: especificacoesTecnicasExigencias.length >= 20 ? '#4caf50' : '#ff5353' }}>
                      {especificacoesTecnicasExigencias.length}/500 (mínimo 20 caracteres)
                    </span>
                  </label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Descreva as exigências do material a ser comprado (ex: granulometria menor que 10mm, umidade menor que 15%)..."
                    value={especificacoesTecnicasExigencias}
                    onChange={e => setEspecificacoesTecnicasExigencias(e.target.value)}
                    minLength={20}
                    maxLength={500}
                    required
                  />
                </div>
              )}

              {/* Características e umidade */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Características / Qualidades (Opcional)</label>
                <div style={{ display: 'flex', gap: '16px', margin: '8px 0' }}>
                  {['Limpo', 'Contaminado', 'Úmido', 'Seco', 'Oleoso', 'Outros'].map(opt => {
                    const checked = caracteristicas.includes(opt)
                    return (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#ccc', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => {
                            if (e.target.checked) {
                              setCaracteristicas(prev => [...prev, opt])
                            } else {
                              setCaracteristicas(prev => prev.filter(c => c !== opt))
                            }
                          }}
                        />
                        {opt}
                      </label>
                    )
                  })}
                </div>
                {caracteristicas.includes('Úmido') && (
                  <div style={{ background: '#111', padding: '14px', borderRadius: '6px', border: '1px solid #222', marginTop: '10px' }}>
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span>Grau de Umidade</span>
                      <strong>{umidadePercent}%</strong>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={umidadePercent}
                      onChange={e => setUmidadePercent(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--primary-500)' }}
                    />
                  </div>
                )}
                {caracteristicas.includes('Outros') && (
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="Descreva outras qualidades do resíduo..."
                    style={{ marginTop: '10px', fontSize: '0.85rem' }}
                    value={caracteristicasOutros}
                    onChange={e => setCaracteristicasOutros(e.target.value)}
                    required
                  />
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              STEP 4: DISPONIBILIDADE E COLETA
             ========================================== */}
          {step === 4 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', marginBottom: '28px' }}>
                Disponibilidade e Coleta
              </h2>

              {/* Tipo de Coleta */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Tipo de Coleta *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
                  <div
                    onClick={() => setTipoColeta('COLETA ÚNICA')}
                    style={{
                      background: tipoColeta === 'COLETA ÚNICA' ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.01)',
                      border: tipoColeta === 'COLETA ÚNICA' ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      padding: '20px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <h4 style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>Lote Único</h4>
                    <span style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginTop: '4px' }}>Uma única destinação</span>
                  </div>
                  <div
                    onClick={() => setTipoColeta('COLETA RECORRENTE')}
                    style={{
                      background: tipoColeta === 'COLETA RECORRENTE' ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.01)',
                      border: tipoColeta === 'COLETA RECORRENTE' ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      padding: '20px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <h4 style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>Recorrente</h4>
                    <span style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginTop: '4px' }}>Geração / Coleta contínua</span>
                  </div>
                </div>
              </div>

              {/* Recorrencia settings */}
              {tipoColeta === 'COLETA RECORRENTE' && (
                <div style={{ background: '#111', padding: '20px', borderRadius: '8px', border: '1px solid #222', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Frequência da Coleta</label>
                    <select className="form-select" value={frequencia} onChange={e => setFrequencia(e.target.value)}>
                      <option value="Semanal">Semanal</option>
                      <option value="Quinzenal">Quinzenal</option>
                      <option value="Mensal">Mensal</option>
                      <option value="Bimestral">Bimestral</option>
                      <option value="Trimestral">Trimestral</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Prazo / Duração do Contrato (Por quanto tempo terá o resíduo disponível?) *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '8px' }}>
                      {['3 meses', '6 meses', '12 meses', '18 meses', '24 meses', 'Indefinido'].map(opt => (
                        <label
                          key={opt}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: duracaoContrato === opt ? '#1A1A1A' : 'transparent',
                            border: duracaoContrato === opt ? '1px solid var(--accent)' : '1px solid #222',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            color: duracaoContrato === opt ? 'var(--accent)' : '#aaa'
                          }}
                        >
                          <input
                            type="radio"
                            name="duracaoContrato"
                            checked={duracaoContrato === opt}
                            onChange={() => setDuracaoContrato(opt)}
                            style={{ display: 'none' }}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#888', marginTop: '8px', display: 'block' }}>
                      Previsão: {frequencia === 'Semanal' ? '~4 coletas por mês' : frequencia === 'Quinzenal' ? '~2 coletas por mês' : '~1 coleta por mês'}
                      {duracaoContrato !== 'Indefinido' && ` • Estimativa de ~${
                        (duracaoContrato === '3 meses' ? 3 : duracaoContrato === '6 meses' ? 6 : duracaoContrato === '12 meses' ? 12 : duracaoContrato === '18 meses' ? 18 : 24) * 
                        (frequencia === 'Semanal' ? 4 : frequencia === 'Quinzenal' ? 2 : 1)
                      } coletas no total do contrato.`}
                    </span>
                  </div>

                  {/* Dias da semana */}
                  <div className="form-group">
                    <label className="form-label">Dias da Semana Disponíveis</label>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map(dia => {
                        const active = diasSemana.includes(dia)
                        return (
                          <div
                            key={dia}
                            onClick={() => {
                              if (active) {
                                if (diasSemana.length > 1) {
                                  setDiasSemana(prev => prev.filter(d => d !== dia))
                                } else {
                                  alert('Selecione pelo menos um dia.')
                                }
                              } else {
                                setDiasSemana(prev => [...prev, dia])
                              }
                            }}
                            style={{
                              flex: 1,
                              padding: '10px 4px',
                              textAlign: 'center',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              fontSize: '0.8rem',
                              background: active ? 'var(--primary)' : '#222',
                              color: active ? '#000' : '#aaa',
                              border: active ? '1px solid var(--primary)' : '1px solid #333'
                            }}
                          >
                            {dia}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Quando Começa */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Quando começa a coleta? *</label>
                <div style={{ display: 'flex', gap: '20px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="radio" checked={quandoComeca === 'Imediatamente'} onChange={() => setQuandoComeca('Imediatamente')} />
                    Imediatamente (hoje)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="radio" checked={quandoComeca === 'Data específica'} onChange={() => setQuandoComeca('Data específica')} />
                    A partir de data específica
                  </label>
                </div>
                {quandoComeca === 'Data específica' && (
                  <div style={{ marginTop: '12px' }}>
                    <input
                      type="date"
                      className="form-input"
                      style={{ background: '#000', color: '#fff', border: '1px solid #333', display: 'block' }}
                      value={dataInicio}
                      onChange={e => setDataInicio(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Horarios de Disponibilidade */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Horários de Coleta/Disponibilidade *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '6px' }}>
                  {[
                    '08h - 12h (manhã)',
                    '13h - 18h (tarde)',
                    '24h aberto (recorrência contínua)',
                    'Sob agendamento prévio'
                  ].map(hOpt => (
                    <label key={hOpt} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: '#111', border: '1px solid #222', borderRadius: '6px', fontSize: '0.82rem', color: '#ccc', cursor: 'pointer' }}>
                      <input type="radio" checked={horariosDisponibilidade === hOpt} onChange={() => setHorariosDisponibilidade(hOpt)} />
                      {hOpt}
                    </label>
                  ))}
                </div>
              </div>

              {/* Necessidade de Agendamento */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Necessidade de Agendamento Prévio? *</label>
                <div style={{ display: 'flex', gap: '20px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="radio" checked={necessidadeAgendamento === 'Sim'} onChange={() => setNecessidadeAgendamento('Sim')} />
                    Sim
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="radio" checked={necessidadeAgendamento === 'Não'} onChange={() => setNecessidadeAgendamento('Não')} />
                    Não
                  </label>
                </div>
                {necessidadeAgendamento === 'Sim' && (
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#aaa' }}>Antecedência Mínima de</span>
                    <input
                      type="number"
                      className="form-input"
                      style={{ width: '80px', display: 'inline-block', padding: '8px', background: '#000', color: '#fff', border: '1px solid #333' }}
                      value={antecedenciaMinima}
                      onChange={e => setAntecedenciaMinima(e.target.value)}
                      min="1"
                    />
                    <span style={{ fontSize: '0.85rem', color: '#aaa' }}>dias</span>
                  </div>
                )}
              </div>

              {/* Resumo visual */}
              <div style={{ padding: '16px', background: 'rgba(76, 175, 80, 0.05)', border: '1px solid rgba(76,175,80,0.2)', borderRadius: '8px', color: '#81c784', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} />
                <span>
                  <strong>Resumo da coleta:</strong> {tipoColeta === 'COLETA ÚNICA' ? 'Lote único' : `Recorrente ${frequencia.toLowerCase()} (${duracaoContrato})`} com início {quandoComeca === 'Imediatamente' ? 'imediato' : `em ${dataInicio}`}, nos horários de {horariosDisponibilidade}. {necessidadeAgendamento === 'Sim' ? `Requer agendamento de ${antecedenciaMinima} dias.` : 'Não requer agendamento.'}
                </span>
              </div>
            </div>
          )}

          {/* ==========================================
              STEP 5: LOCALIZAÇÃO E LOGÍSTICA
             ========================================== */}
          {step === 5 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', marginBottom: '28px' }}>
                Localização e Acesso Logístico
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Estado (UF) *</label>
                  <select className="form-select" value={uf} onChange={e => setUf(e.target.value)} required>
                    <option value="">Selecione...</option>
                    {ESTADOS_BRASIL.map(estado => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Município *</label>
                  <input type="text" className="form-input" value={municipio} onChange={e => setMunicipio(e.target.value)} required placeholder="Ex: Goiânia" />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">CEP *</label>
                <input
                  type="text"
                  placeholder="00000-000"
                  className="form-input"
                  value={cep}
                  onChange={e => setCep(e.target.value)}
                  onBlur={handleCepBlur}
                  required
                />
              </div>

              {/* Endereco completo em card cinza/locked */}
              <div style={{ background: '#111', border: '1px solid #222', padding: '20px', borderRadius: '8px', marginBottom: '24px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#aaa', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={14} style={{ color: 'var(--accent)' }} /> Endereço de Coleta (Ocultado publicamente)
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: '#666' }}>Visível apenas após Taxa Lead</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem', color: '#777' }}>Logradouro / Rua *</label>
                    <input type="text" className="form-input" style={{ background: '#000', color: '#fff', border: '1px solid #222' }} value={rua} onChange={e => setRua(e.target.value)} required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.8rem', color: '#777' }}>Número *</label>
                      <input type="text" className="form-input" style={{ background: '#000', color: '#fff', border: '1px solid #222' }} value={numero} onChange={e => setNumero(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.8rem', color: '#777' }}>Complemento</label>
                      <input type="text" className="form-input" style={{ background: '#000', color: '#fff', border: '1px solid #222' }} value={complemento} onChange={e => setComplemento(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Condicoes de acesso */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Condições de Acesso Logístico</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '8px' }}>
                  {[
                    'Balança no local',
                    'Doca de carga',
                    'Empilhadeira disponível',
                    'Acesso restrito (cancela/portaria)',
                    'Restrição de altura do veículo',
                    'Restrição de peso (PBT máximo)',
                    'Sinal de GPS/Rede móvel'
                  ].map(opt => {
                    const checked = condicoesAcesso.includes(opt)
                    return (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#ccc', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => {
                            if (e.target.checked) {
                              setCondicoesAcesso(prev => [...prev, opt])
                            } else {
                              setCondicoesAcesso(prev => prev.filter(c => c !== opt))
                            }
                          }}
                        />
                        {opt}
                      </label>
                    )
                  })}
                </div>

                {condicoesAcesso.includes('Restrição de altura do veículo') && (
                  <div style={{ marginTop: '12px' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Altura máxima permitida (metros)</label>
                    <input type="number" step="0.1" className="form-input" placeholder="Ex: 4.2" value={alturaMaxima} onChange={e => setAlturaMaxima(e.target.value)} />
                  </div>
                )}

                {condicoesAcesso.includes('Restrição de peso (PBT máximo)') && (
                  <div style={{ marginTop: '12px' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>PBT máximo permitido (kg)</label>
                    <input type="number" className="form-input" placeholder="Ex: 15000" value={pbtMaximo} onChange={e => setPbtMaximo(e.target.value)} />
                  </div>
                )}
              </div>

              {/* Veiculos necessarios */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Tipo de Veículo Recomendado</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '8px' }}>
                  {['Caminhão truck', 'Carreta', 'Poliguindaste', 'Tanque', 'Sider', 'Outros'].map(vOpt => {
                    const checked = tipoVeiculoNecessario.includes(vOpt)
                    return (
                      <label key={vOpt} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#ccc', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => {
                            if (e.target.checked) {
                              setTipoVeiculoNecessario(prev => [...prev, vOpt])
                            } else {
                              setTipoVeiculoNecessario(prev => prev.filter(v => v !== vOpt))
                            }
                          }}
                        />
                        {vOpt}
                      </label>
                    )
                  })}
                </div>
                {tipoVeiculoNecessario.includes('Outros') && (
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="Descreva outro tipo de veículo necessário..."
                    style={{ marginTop: '10px', fontSize: '0.85rem' }}
                    value={veiculoOutro}
                    onChange={e => setVeiculoOutro(e.target.value)}
                    required
                  />
                )}
              </div>

              {/* Transporte Obrigatório */}
              <div className="form-group">
                <label className="form-label">Exigência de Transporte Rodoviário * {grupo !== null && <span style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>(Travado por Compliance do Grupo {grupo})</span>}</label>
                <div style={{ display: 'flex', gap: '20px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: grupo !== null ? 'not-allowed' : 'pointer', fontSize: '0.9rem', opacity: grupo === 4 || grupo === null ? 1 : 0.4 }}>
                    <input type="radio" checked={transporteObrigatorio === 'Classe I'} onChange={() => setTransporteObrigatorio('Classe I')} disabled={grupo !== null} />
                    Classe I (Exige MOPP / CIPP / Licenças ambientais específicas)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: grupo !== null ? 'not-allowed' : 'pointer', fontSize: '0.9rem', opacity: (grupo !== 4 && grupo !== null) || grupo === null ? 1 : 0.4 }}>
                    <input type="radio" checked={transporteObrigatorio === 'Classe II'} onChange={() => setTransporteObrigatorio('Classe II')} disabled={grupo !== null} />
                    Classe II (Transporte Comum sem periculosidade)
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              STEP 6: COMO VOCÊ QUER SER REMUNERADO?
             ========================================== */}
          {step === 6 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
                Forma de Negociação & Preço
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '28px' }}>
                Escolha o formato comercial que melhor atende à sua empresa e configure o valor de referência.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
                {[
                  {
                    val: 'EU RECEBO',
                    title: '💰 EU RECEBO (Leilão Ascendente)',
                    desc: 'O material tem valor comercial. Quem oferecer o MAIOR lance leva a mercadoria.'
                  },
                  {
                    val: 'EU PAGO',
                    title: '💸 EU PAGO (Leilão Descendente)',
                    desc: 'O material é um passivo ambiental. Destinadores disputam oferecendo o MENOR custo de descarte.'
                  },
                  {
                    val: 'DOAÇÃO',
                    title: '🎁 DOAÇÃO / COLETA GRATUITA (Sem cobrança)',
                    desc: 'Sem custo de venda ou descarte. O interessado assume os custos logísticos de retirada.'
                  }
                ].map(item => (
                  <div
                    key={item.val}
                    onClick={() => {
                      setFormaNegociacao(item.val as any)
                      if (item.val === 'DOAÇÃO') setValorDesejado('0')
                    }}
                    style={{
                      background: formaNegociacao === item.val ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.01)',
                      border: formaNegociacao === item.val ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <h4 style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '4px' }}>{item.title}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.4, margin: 0 }}>{item.desc}</p>
                  </div>
                ))}
              </div>

              {formaNegociacao !== 'DOAÇÃO' ? (
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Valor de Referência (por {unidade}) *</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-500)', fontFamily: 'var(--font-mono)' }}>R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="form-input"
                      value={valorDesejado}
                      onChange={e => setValorDesejado(e.target.value)}
                      placeholder="Ex: 340.00"
                      style={{ background: '#000', color: '#fff', border: '1px solid #333', padding: '12px', borderRadius: '6px', width: '100%' }}
                      required
                    />
                  </div>

                  {/* Real-time index container */}
                  <div style={{
                    background: '#111111',
                    border: '1px solid #333333',
                    borderRadius: '8px',
                    padding: '20px',
                    color: '#fff'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        📊 MATERRA INDEX - VALOR SUGERIDO
                      </span>
                      {loadingIndex && <span style={{ fontSize: '0.75rem', color: '#888' }}>Buscando index...</span>}
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#aaa', margin: '0 0 12px 0' }}>
                      Baseado em: <strong>{residuo.split(' --- ').pop()}</strong> + <strong>{uf || 'Sua Região'}</strong>
                    </p>

                    <div style={{ fontSize: '0.9rem', color: '#fff', display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span>Preço de referência do mercado:</span>
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>
                        R$ {valorIndexRealTime.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / {unidadeIndexRealTime}
                      </strong>
                    </div>

                    {quantidade && !isNaN(parseFloat(quantidade)) && (
                      <div style={{ fontSize: '0.85rem', color: '#888', background: '#070707', padding: '8px 12px', borderRadius: '4px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>CALCULADORA RÁPIDA (Index):</span>
                        <span>{quantidade} {unidade} × R$ {valorIndexRealTime.toLocaleString('pt-BR')} = <strong>R$ {(parseFloat(quantidade) * valorIndexRealTime).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                      </div>
                    )}

                    {(() => {
                      const dev = getDeviationData()
                      if (!dev) return null
                      const totalEst = parseFloat(quantidade) * parseFloat(valorDesejado)
                      return (
                        <div style={{ borderTop: '1px solid #222', paddingTop: '16px', marginTop: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.85rem', color: '#aaa', fontWeight: 'bold' }}>DESVIO CALCULADO:</span>
                            <strong style={{ color: dev.color, fontFamily: 'var(--font-mono)', fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              {dev.arrow} {dev.label}
                            </strong>
                          </div>

                          {!isNaN(totalEst) && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '0.9rem' }}>
                              <span>Valor Total Estimado:</span>
                              <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                                R$ {totalEst.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </strong>
                            </div>
                          )}

                          <div style={{
                            padding: '8px 12px',
                            background: `${dev.color}10`,
                            border: `1px solid ${dev.color}40`,
                            borderRadius: '4px',
                            color: dev.color,
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            textAlign: 'center'
                          }}>
                            {dev.percent <= 10 && dev.percent >= -10 ? '🟢 Normal (dentro de ±10% do índice)' : 
                             Math.abs(dev.percent) <= 20 ? '🟡 Atenção (valor entre 10% e 20% do índice)' : 
                             '🔴 Alerta (valor com desvio superior a 20% do índice)'}
                          </div>
                        </div>
                      )
                    })()}
                    
                    <div style={{ marginTop: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                        ⚡ TIPO DE LEILÃO (Preenchido Automaticamente)
                      </span>
                      <p style={{ color: '#fff', fontSize: '0.95rem', margin: 0, fontWeight: 'bold' }}>
                        {formaNegociacao === 'EU RECEBO' ? '📈 Leilão Ascendente (Quem oferecer o maior lance comercial vence)' : '📉 Leilão Descendente (Quem oferecer o menor preço de destinação vence)'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#111', border: '1px solid #222', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
                  <label className="form-label" style={{ marginBottom: '10px' }}>Se houver mais de um interessado na coleta gratuita, como decidir o vencedor? *</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input type="radio" checked={opcaoDoacaoInteressados === 'Leilão ASCENDENTE'} onChange={() => setOpcaoDoacaoInteressados('Leilão ASCENDENTE')} />
                      Leilão Ascendente (Quem oferecer pagar mais pelo frete/serviço leva)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input type="radio" checked={opcaoDoacaoInteressados === 'Leilão DESCENDENTE'} onChange={() => setOpcaoDoacaoInteressados('Leilão DESCENDENTE')} />
                      Leilão Descendente (Quem cobrar menos para fazer a retirada leva)
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              STEP 7: REQUISITOS DA CONTRAPARTE & PROJEÇÃO MTR/CDF
             ========================================== */}
          {step === 7 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
                Requisitos & Projeção MTR/CDF
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '28px' }}>
                Defina suas preferências de qualificação e consulte as projeções de documentos de rastreamento.
              </p>

              {/* Selo Mínimo */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Selo Materra Mínimo Recomendado</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '8px' }}>
                  {[
                    { val: 'Sem exigência', label: 'Livre', desc: 'Qualquer selo' },
                    { val: 'Bronze', label: 'Bronze ⭐', desc: 'Score ≥ 42' },
                    { val: 'Prata', label: 'Prata ⭐⭐', desc: 'Score ≥ 70' },
                    { val: 'Ouro', label: 'Ouro ⭐⭐⭐', desc: 'Score ≥ 85' }
                  ].map(item => {
                    const active = seloMinimo === item.val
                    return (
                      <div
                        key={item.val}
                        onClick={() => setSeloMinimo(item.val)}
                        style={{
                          background: active ? 'rgba(255, 215, 0, 0.08)' : 'rgba(255,255,255,0.01)',
                          border: active ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '6px',
                          padding: '12px 6px',
                          textAlign: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <strong style={{ fontSize: '0.85rem', color: active ? 'var(--accent)' : '#fff' }}>{item.label}</strong>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#777', marginTop: '2px' }}>{item.desc}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Score slider */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Reputação Mínima Recomendada (Score)</span>
                  <strong>{scoreMinimo === 0 ? 'Sem exigência' : `${scoreMinimo}/100`}</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={scoreMinimo}
                  onChange={e => setScoreMinimo(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary-500)' }}
                />
              </div>

              {/* Documentos Checklist */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">
                  Documentos Solicitados para Homologar
                  {grupo !== null && grupo > 1 && (
                    <span style={{ color: 'var(--primary)', fontSize: '0.75rem', marginLeft: '8px' }}>
                      (🔒 Documentos obrigatórios travados por compliance legal para Grupo {grupo})
                    </span>
                  )}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '8px' }}>
                  {[
                    'Licença Ambiental válida',
                    'CADRI (se Classe I)',
                    'Licença RSS (hospitalar)',
                    'Licença de Coprocessamento',
                    'CTF/APP-IBAMA regulamentado',
                    'Registro RNTRC (transportadora)',
                    'MOPP do motorista (Classe I)',
                    'PGRS estruturado',
                    'Outros'
                  ].map(doc => {
                    // Check if document is locked based on group value
                    let isLocked = false
                    if (grupo === 4) {
                      isLocked = ['CADRI (se Classe I)', 'MOPP do motorista (Classe I)', 'Licença Ambiental válida', 'CTF/APP-IBAMA regulamentado'].includes(doc)
                    } else if (grupo === 2 || grupo === 3) {
                      isLocked = ['Licença Ambiental válida', 'CTF/APP-IBAMA regulamentado'].includes(doc)
                    }

                    const checked = documentosSolicitados.includes(doc) || isLocked
                    return (
                      <label key={doc} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8rem',
                        color: isLocked ? 'var(--primary)' : '#ccc',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        opacity: isLocked ? 0.95 : 1
                      }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={isLocked}
                          onChange={e => {
                            if (e.target.checked) {
                              setDocumentosSolicitados(prev => [...prev, doc])
                            } else {
                              setDocumentosSolicitados(prev => prev.filter(d => d !== doc))
                            }
                          }}
                        />
                        {doc} {isLocked && '🔒'}
                      </label>
                    )
                  })}
                </div>
                {documentosSolicitados.includes('Outros') && (
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="Descreva quais outros documentos você necessita do parceiro..."
                    style={{ marginTop: '10px', fontSize: '0.85rem' }}
                    value={documentoOutro}
                    onChange={e => setDocumentoOutro(e.target.value)}
                    required
                  />
                )}
              </div>

              {/* Projeção MTR / CDF Box */}
              <div style={{
                background: '#111111',
                border: '1px solid #333333',
                borderRadius: '8px',
                padding: '20px',
                color: '#fff',
                marginBottom: '24px'
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                  📊 Projeção de Rastreamento (MTR & CDF)
                </span>
                {(() => {
                  if (grupo === 1) {
                    return (
                      <p style={{ fontSize: '0.85rem', color: '#88ff88', margin: 0, fontWeight: 'bold' }}>
                        Isento de MTR e CDF (Grupo 1 Coproduto). Operação livre de manifestos de resíduos.
                      </p>
                    )
                  }

                  const monthsStr = String(duracaoContrato || '12 meses').split(' ')[0]
                  const months = monthsStr === 'Indefinido' ? 12 : parseInt(monthsStr) || 12
                  
                  let collectionsPerMonth = 1
                  if (frequencia === 'Semanal') collectionsPerMonth = 4.33
                  else if (frequencia === 'Quinzenal') collectionsPerMonth = 2
                  else if (frequencia === 'Mensal') collectionsPerMonth = 1
                  else if (frequencia === 'Bimestral') collectionsPerMonth = 0.5
                  else if (frequencia === 'Trimestral') collectionsPerMonth = 0.33
                  
                  const count = tipoColeta === 'COLETA ÚNICA' ? 1 : Math.ceil(months * collectionsPerMonth)
                  const mtrTotal = count
                  const cdfTotal = count

                  return (
                    <div>
                      <p style={{ fontSize: '0.85rem', color: '#aaa', margin: '0 0 12px 0' }}>
                        Modelo de Destinação: <strong>{tipoColeta === 'COLETA ÚNICA' ? 'Lote Único' : `Contrato Recorrente (${frequencia})`}</strong>
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                          <span>MTRs Projetados (Manifesto de Transporte):</span>
                          <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{mtrTotal} emissões</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                          <span>CDFs Projetados (Certificado de Destinação):</span>
                          <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{cdfTotal} certificados</strong>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#666', display: 'block', marginTop: '12px' }}>
                        * Projeção calculada automaticamente com base na frequência da coleta e a vigência estimada. Emissão integrada com o SINIR.
                      </span>
                    </div>
                  )
                })()}
              </div>

              {/* Distancia */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Distância Máxima Aceitável</label>
                <select className="form-select" value={distanciaMaxima} onChange={e => setDistanciaMaxima(e.target.value)} style={{ width: '100%' }}>
                  <option value="Sem limite">Sem limite (Qualquer região)</option>
                  <option value="50 km">Até 50 km</option>
                  <option value="100 km">Até 100 km</option>
                  <option value="300 km">Até 300 km</option>
                  <option value="500 km">Até 500 km</option>
                </select>
              </div>

              {/* Frequencia compativel */}
              {tipoColeta === 'COLETA RECORRENTE' && (
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input type="checkbox" checked={frequenciaCompativelExigida} onChange={e => setFrequenciaCompativelExigida(e.target.checked)} />
                    Exigir obrigatoriamente que a contraparte atenda à frequência configurada
                  </label>
                </div>
              )}

              {/* Requisitos adicionais por escrito */}
              <div className="form-group">
                <label className="form-label">Requisitos adicionais (Observações livres)</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Ex: A coleta deve ser agendada em horário comercial com 24h de antecedência..."
                  value={requisitosAdicionaisObservacoes}
                  onChange={e => {
                    setRequisitosAdicionaisObservacoes(e.target.value);
                    setRequisitosEscrito(e.target.value); // legacy fallback
                  }}
                  maxLength={500}
                />
              </div>
            </div>
          )}

          {/* ==========================================
              STEP 8: DURAÇÃO DO LEILÃO & PRAZO
             ========================================== */}
          {step === 8 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', marginBottom: '28px' }}>
                Configuração do Leilão & Prazo
              </h2>

              {/* Duracao */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Duração do Leilão *</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <select className="form-select" style={{ flex: 1 }} value={duracaoLeilao} onChange={e => setDuracaoLeilao(e.target.value)}>
                    <option value="24h">24 horas</option>
                    <option value="48h">48 horas</option>
                    <option value="72h">72 horas</option>
                    <option value="1 week">1 semana</option>
                    <option value="Personalizado">Personalizado...</option>
                  </select>
                  {duracaoLeilao === 'Personalizado' && (
                    <input
                      type="number"
                      placeholder="Horas (24 a 336)"
                      className="form-input"
                      style={{ width: '150px' }}
                      value={duracaoLeilaoCustom}
                      onChange={e => setDuracaoLeilaoCustom(e.target.value)}
                      min="24"
                      max="336"
                    />
                  )}
                </div>
              </div>

              {/* Anti-snipe */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={antiSnipe} onChange={e => setAntiSnipe(e.target.checked)} style={{ marginTop: '3px' }} />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#fff', display: 'block' }}>Habilitar Regra Anti-Snipe (Recomendado)</strong>
                    <span style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginTop: '2px', lineHeight: 1.3 }}>
                      Evita que bots ou usuários enviem lances nos segundos finais. Lances nos últimos 15 minutos adicionam mais 15 minutos de tolerância ao cronômetro do leilão.
                    </span>
                  </div>
                </label>
              </div>

              {/* Quando entra no ar */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Quando publicar? *</label>
                <div style={{ display: 'flex', gap: '20px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="radio" checked={quandoEntraAr === 'AGORA'} onChange={() => setQuandoEntraAr('AGORA')} />
                    Imediatamente (Entra no ar hoje)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="radio" checked={quandoEntraAr === 'PROGRAMAR'} onChange={() => setQuandoEntraAr('PROGRAMAR')} />
                    Programar data e hora
                  </label>
                </div>
                {quandoEntraAr === 'PROGRAMAR' && (
                  <div style={{ marginTop: '12px' }}>
                    <input
                      type="datetime-local"
                      className="form-input"
                      style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                      value={dataHoraProgramada}
                      onChange={e => setDataHoraProgramada(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Coleta Emergencial */}
              <div className="form-group" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={coletaEmergencial} onChange={e => setColetaEmergencial(e.target.checked)} style={{ marginTop: '3px' }} />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#ef5350', display: 'block' }}>🚨 Ativar como Coleta Emergencial</strong>
                    <span style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginTop: '2px', lineHeight: 1.3 }}>
                      Marque se o material precisa ser coletado urgentemente (risco de parada de fábrica, embargo, etc). Seu anúncio receberá o selo de URGENTE e ficará em destaque no topo das buscas dos interessados.
                    </span>
                  </div>
                </label>
                {coletaEmergencial && (
                  <div style={{ marginTop: '12px', background: 'rgba(239, 83, 80, 0.05)', border: '1px solid rgba(239, 83, 80, 0.2)', padding: '12px', borderRadius: '6px' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', color: '#fff' }}>Prazo limite para a coleta emergencial:</label>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#ccc', cursor: 'pointer' }}>
                        <input type="radio" checked={deadlineEmergencia === '24h'} onChange={() => setDeadlineEmergencia('24h')} />
                        24 horas
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#ccc', cursor: 'pointer' }}>
                        <input type="radio" checked={deadlineEmergencia === '48h'} onChange={() => setDeadlineEmergencia('48h')} />
                        48 horas
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Quem arca com o frete */}
              <div className="form-group" style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Quem arca com o frete? *</label>
                <div style={{ display: 'flex', gap: '20px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#fff' }}>
                    <input type="radio" name="quemArcaFrete" checked={quemArcaFrete === 'CONTRAPARTE'} onChange={() => setQuemArcaFrete('CONTRAPARTE')} />
                    Contraparte (Quem coleta/compra assume o frete)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#fff' }}>
                    <input type="radio" name="quemArcaFrete" checked={quemArcaFrete === 'EU'} onChange={() => setQuemArcaFrete('EU')} />
                    Anunciante (Minha empresa arca com o frete)
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              STEP 9: MÍDIA E DOCUMENTAÇÃO
             ========================================== */}
          {step === 9 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', marginBottom: '28px' }}>
                Fotos e Documentação
              </h2>

              {/* Fotos */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Fotos do Resíduo * (Mínimo 1, Máximo 6)</label>
                <div style={{
                  border: '2px dashed rgba(255, 215, 0, 0.2)',
                  borderRadius: '8px',
                  padding: '24px',
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.01)',
                  position: 'relative',
                  cursor: 'pointer'
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUploadChange}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer' }}
                  />
                  <Upload size={32} style={{ color: 'var(--primary)', marginBottom: '8px', display: 'inline-block' }} />
                  <p style={{ fontSize: '0.85rem', color: '#fff', margin: '4px 0' }}>Arraste ou clique para selecionar fotos</p>
                  <span style={{ fontSize: '0.75rem', color: '#666' }}>Suporta JPG, PNG até 5MB</span>
                </div>

                {/* Previews */}
                {fotoUrlSimulated && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginTop: '16px' }}>
                    <div style={{ position: 'relative', border: '2px solid var(--accent)', borderRadius: '6px', overflow: 'hidden', height: '80px' }}>
                      <img src={fotoUrlSimulated} alt="Preview resíduo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--accent)', color: '#000', fontSize: '9px', fontWeight: 'bold', textAlign: 'center', padding: '2px 0' }}>CAPA</span>
                      <X size={14} style={{ position: 'absolute', top: '2px', right: '2px', background: '#000', color: '#fff', borderRadius: '50%', cursor: 'pointer', padding: '2px' }} onClick={() => { setFotoFile(null); setFotoUrlSimulated(''); }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Video */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Vídeo Curto Demonstrativo (Opcional)</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setVideoFile(e.target.files[0])
                    }
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px', display: 'block' }}>Máximo 60 segundos (50MB)</span>
                {videoFile && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', background: '#111', padding: '8px 12px', borderRadius: '4px', border: '1px solid #222' }}>
                    <Play size={14} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '0.8rem', color: '#fff' }}>{videoFile.name} (Pronto para envio)</span>
                    <Trash size={14} style={{ color: 'var(--danger)', marginLeft: 'auto', cursor: 'pointer' }} onClick={() => setVideoFile(null)} />
                  </div>
                )}
              </div>

              {/* Laudo */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Laudo de Caracterização / Análise Química (Opcional)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setLaudoFile(e.target.files[0])
                    }
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px', display: 'block' }}>Anexar PDF aumenta seu reputação Score em até +10 pontos.</span>
                {laudoFile && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', background: '#111', padding: '8px 12px', borderRadius: '4px', border: '1px solid #222' }}>
                    <FileText size={14} style={{ color: '#00FF66' }} />
                    <span style={{ fontSize: '0.8rem', color: '#fff' }}>{laudoFile.name}</span>
                    <Trash size={14} style={{ color: 'var(--danger)', marginLeft: 'auto', cursor: 'pointer' }} onClick={() => setLaudoFile(null)} />
                  </div>
                )}
              </div>

              {/* FISPQ (Mandatory for Class I / Grupo 4) */}
              {grupo === 4 ? (
                <div className="form-group" style={{ background: 'rgba(239, 83, 80, 0.04)', border: '1px solid var(--danger)', padding: '20px', borderRadius: '8px' }}>
                  <label className="form-label" style={{ color: '#ef5350', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={16} /> FISPQ (Ficha de Segurança Química) * OBRIGATÓRIA
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setFispqFile(e.target.files[0])
                      }
                    }}
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '4px', display: 'block' }}>Obrigatório para resíduos Classe I. O botão de enviar ficará travado se ausente.</span>
                  {fispqFile && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', background: '#111', padding: '8px 12px', borderRadius: '4px', border: '1px solid #222' }}>
                      <CheckCircle size={14} style={{ color: '#00FF66' }} />
                      <span style={{ fontSize: '0.8rem', color: '#fff' }}>{fispqFile.name} (Validada)</span>
                      <Trash size={14} style={{ color: 'var(--danger)', marginLeft: 'auto', cursor: 'pointer' }} onClick={() => setFispqFile(null)} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">FISPQ / Ficha de Segurança (Opcional)</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setFispqFile(e.target.files[0])
                      }
                    }}
                  />
                  {fispqFile && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', background: '#111', padding: '8px 12px', borderRadius: '4px', border: '1px solid #222' }}>
                      <FileText size={14} style={{ color: '#aaa' }} />
                      <span style={{ fontSize: '0.8rem', color: '#fff' }}>{fispqFile.name}</span>
                      <Trash size={14} style={{ color: 'var(--danger)', marginLeft: 'auto', cursor: 'pointer' }} onClick={() => setFispqFile(null)} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              STEP 10: CONFIRMAÇÃO + PREVIEW DO CARD
             ========================================== */}
          {step === 10 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', marginBottom: '20px' }}>
                Confirmação & Visualização Prévia
              </h2>

              {/* CARD PREVIEW CONTAINER */}
              <div style={{ marginBottom: '28px' }}>
                <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                  Visualização do anúncio no Marketplace:
                </span>

                {/* Simulated Render of Card */}
                <div style={{
                  background: 'var(--surface)',
                  border: '1px solid rgba(255, 215, 0, 0.25)',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.06)'
                }}>
                  {/* Card Collapsed */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <span style={{ display: 'inline-block', background: 'rgba(255,215,0,0.1)', color: 'var(--primary)', border: '1px solid var(--primary)', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {tipoAnuncio}
                      </span>
                      {coletaEmergencial && (
                        <span style={{ display: 'inline-block', background: 'rgba(239, 83, 80, 0.15)', color: '#ef5350', border: '1px solid #ef5350', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', marginLeft: '6px' }}>
                          🚨 URGENTE
                        </span>
                      )}
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', marginTop: '8px', marginBottom: '4px' }}>
                        {tituloAnuncio || (residuo === 'Outro (descrever)' ? customResiduo : residuo.split(' --- ').pop())}
                      </h3>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.8rem', color: '#888' }}>
                        <span>Preferência: <strong>{seloMinimo}</strong></span>
                        <span>•</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={12} /> {municipio || 'Cidade'}, {uf || 'UF'}
                        </span>
                      </div>
                    </div>

                    {/* Right column price */}
                    <div style={{ textAlign: 'right' }}>
                      {formaNegociacao === 'DOAÇÃO' ? (
                        <strong style={{ fontSize: '1.25rem', color: 'var(--primary-500)' }}>Doação Gratuita</strong>
                      ) : (
                        <div>
                          <strong style={{ fontSize: '1.35rem', color: 'var(--primary-500)', fontFamily: 'var(--font-mono)' }}>
                            R$ {parseFloat(valorDesejado || '0').toFixed(2)}
                          </strong>
                          <span style={{ fontSize: '0.8rem', color: '#888' }}> / {unidade}</span>
                        </div>
                      )}
                      {(() => {
                        const dev = getDeviationData()
                        if (!dev) return null
                        return (
                          <div style={{ fontSize: '0.75rem', color: dev.color, fontWeight: 'bold', marginTop: '4px' }}>
                            {dev.arrow} desvio: {dev.percent > 0 ? '+' : ''}{dev.percent.toFixed(1)}%
                          </div>
                        )
                      })()}
                    </div>
                  </div>

                  {/* Summary grid details */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    background: '#0a0a0a',
                    border: '1px solid #222',
                    borderRadius: '8px',
                    padding: '16px',
                    marginTop: '20px'
                  }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', display: 'block' }}>Material & Volume</span>
                      <span style={{ fontSize: '13px', color: '#ccc', fontWeight: 'bold', display: 'block', marginTop: '2px' }}>
                        {quantidade} {unidade} ({estadoFisico})
                      </span>
                      <span style={{ fontSize: '12px', color: '#888' }}>Acondicionado: {acondicionamento.join(', ')}</span>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', display: 'block' }}>Coleta & Recorrência</span>
                      <span style={{ fontSize: '13px', color: '#ccc', fontWeight: 'bold', display: 'block', marginTop: '2px' }}>
                        {tipoColeta === 'COLETA ÚNICA' ? 'Lote Único' : `${frequencia}`}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 'bold' }}>
                        CONTRATO: {tipoColeta === 'COLETA RECORRENTE' ? duracaoContrato : 'Lote Único'}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', display: 'block' }}>Classe de Perigo</span>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: 'bold',
                        display: 'block',
                        marginTop: '2px',
                        color: classe.includes('perigoso') ? '#ef5350' : classe.includes('não inerte') ? '#ffd700' : '#4caf50'
                      }}>
                        {classe.split(' – ').pop() || classe}
                      </span>
                      <span style={{ fontSize: '12px', color: '#888' }}>Código IBAMA: {codigoIbama}</span>
                    </div>
                  </div>

                  {/* Document and transport requirements */}
                  <div style={{ marginTop: '16px', fontSize: '0.8rem', color: '#aaa', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Shield size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      <span>Documentos requeridos (Voluntário): <strong style={{ color: '#fff' }}>{documentosSolicitados.join(', ') || 'Sem exigência'}</strong></span>
                    </div>
                    {requisitosEscrito && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '4px' }}>
                        <Info size={14} style={{ color: '#888', marginTop: '2px', flexShrink: 0 }} />
                        <span>Notas adicionais: <span style={{ color: '#eee', fontStyle: 'italic' }}>"{requisitosEscrito}"</span></span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Previews */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid #222', paddingTop: '16px' }}>
                    {fotoUrlSimulated && (
                      <div style={{ background: '#111', padding: '4px', borderRadius: '4px', border: '1px solid #333' }}>
                        <img src={fotoUrlSimulated} alt="Thumbnail preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '2px' }} />
                      </div>
                    )}
                    {videoFile && (
                      <div style={{ background: '#111', padding: '12px 16px', borderRadius: '4px', border: '1px solid #333', fontSize: '0.75rem', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        🎥 Vídeo
                      </div>
                    )}
                    {laudoFile && (
                      <div style={{ background: '#111', padding: '12px 16px', borderRadius: '4px', border: '1px solid #333', fontSize: '0.75rem', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        📄 Laudo PDF
                      </div>
                    )}
                    {fispqFile && (
                      <div style={{ background: '#111', padding: '12px 16px', borderRadius: '4px', border: '1px solid #333', fontSize: '0.75rem', color: '#ef5350', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                        📄 FISPQ
                      </div>
                    )}
                  </div>

                  {/* Expand button details */}
                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setCardExpanded(prev => !prev)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold', textDecoration: 'underline', fontFamily: 'var(--font-body)' }}
                    >
                      {cardExpanded ? 'Ocultar Detalhes Completos ▲' : 'Ver Detalhes Completos (Expandir) ▼'}
                    </button>
                  </div>

                  {cardExpanded && (
                    <div style={{
                      marginTop: '16px',
                      borderTop: '1px dashed #333',
                      paddingTop: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      fontSize: '0.85rem',
                      color: '#bbb'
                    }}>
                      <div>
                        <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>Descrição / Processo Gerador:</strong>
                        <p style={{ margin: 0, lineHeight: 1.4 }}>{origemProcesso}</p>
                      </div>

                      {caracteristicas.length > 0 && (
                        <div>
                          <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>Características do material:</strong>
                          <span>{caracteristicas.join(', ')} {caracteristicas.includes('Úmido') && `(Umidade: ${umidadePercent}%)`} {caracteristicasOutros && `: ${caracteristicasOutros}`}</span>
                        </div>
                      )}

                      <div>
                        <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>Acesso Logístico & Veículos:</strong>
                        <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <li>Condições de acesso: {condicoesAcesso.join(', ')} {alturaMaxima && `(Altura máx: ${alturaMaxima}m)`} {pbtMaximo && `(PBT máx: ${pbtMaximo}kg)`}</li>
                          <li>Veículos necessários: {tipoVeiculoNecessario.join(', ')} {veiculoOutro && `: ${veiculoOutro}`}</li>
                        </ul>
                      </div>

                      {/* Locked Address Indicator */}
                      <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,215,0,0.1)', padding: '12px', borderRadius: '6px', color: 'var(--accent)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Lock size={14} />
                        <span>
                          <strong>Endereço Ocultado:</strong> {municipio}, {uf} (O endereço detalhado e CEP {cep} permanecem sob sigilo até a contraparte pagar a Taxa Lead).
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Declaracao Checkbox */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={declaracaoAceite}
                    onChange={e => setDeclaracaoAceite(e.target.checked)}
                    style={{ marginTop: '3px', accentColor: 'var(--accent)' }}
                  />
                  <span>
                    Declaro que tenho a posse física e legal deste resíduo, que as informações fornecidas acima são verdadeiras e estou de acordo com os termos de negociação e comissões da plataforma.
                  </span>
                </label>
              </div>

              {grupo === 4 && !fispqFile && (
                <div style={{ marginBottom: '16px', background: 'rgba(239, 83, 80, 0.05)', border: '1px solid #ef5350', color: '#ef5350', padding: '12px', borderRadius: '6px', fontSize: '0.8rem' }}>
                  ⚠️ Atenção: A FISPQ é obrigatória para resíduos do Grupo 4 (Perigoso). Volte à etapa de Mídias e envie o documento para publicar.
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              STEP 11: SUCCESS SCREEN
             ========================================== */}
          {step === 11 && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <CheckCircle size={64} style={{ color: '#00FF66' }} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: '#00FF66', fontWeight: 'bold', marginBottom: '12px' }}>
                {razaoSocialEmpresa ? '✅ Anúncio Publicado em Nome da Empresa!' : 'Anúncio Publicado com Sucesso!'}
              </h2>
              {razaoSocialEmpresa && (
                <div style={{ background: 'rgba(255, 215, 0, 0.05)', border: '1px solid rgba(255, 215, 0, 0.15)', padding: '12px 18px', borderRadius: '6px', maxWidth: '480px', margin: '0 auto 20px', fontSize: '0.9rem', color: 'var(--primary)' }}>
                  Publicado em nome de: <strong>{razaoSocialEmpresa}</strong>
                </div>
              )}
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, maxWidth: '500px', margin: '0 auto 32px' }}>
                Seu anúncio foi inserido na plataforma. O leilão reverso de fretes será acionado assim que houver propostas confirmadas sobre o lote.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <Link href={razaoSocialEmpresa ? `/?published_for=${encodeURIComponent(razaoSocialEmpresa)}` : '/'} className="btn btn-primary" style={{ padding: '12px 28px', color: '#000', fontWeight: 'bold', textDecoration: 'none', borderRadius: '6px' }}>
                  Ir para o Dashboard
                </Link>
              </div>
            </div>
          )}

          {/* Render navigation controls */}
          {step <= 10 && renderNavButtons()}
        </form>
      </main>

      {/* Footer */}
      <footer style={{
        background: '#050505',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '24px',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-mono)'
      }}>
        © {new Date().getFullYear()} MATERRA ELO — OPERAÇÕES DE RECURSOS E SUSTENTABILIDADE INDUSTRIAL
      </footer>
      {/* WARNING MODAL - ESPECIALIDADE NÃO HABILITADA */}
      {showHabilitacaoWarning && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: '#121212', border: '1px solid #ff5353', padding: '32px', borderRadius: '16px',
            maxWidth: '500px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ff5353', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              ⚠️ AVISO - ESPECIALIDADE NÃO HABILITADA
            </h3>
            <p style={{ color: '#fff', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
              Você está tentando anunciar uma <strong>{warningType?.toUpperCase()}</strong> ({warningType === 'Oferta' ? 'oferecimento de resíduos' : 'preciso de resíduos'}), mas sua conta está habilitada apenas como <strong>{profile?.tipo_parte?.toUpperCase()}</strong>.
            </p>
            <p style={{ color: '#aaa', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
              Para anunciar {warningType === 'Oferta' ? 'ofertas' : 'demandas'}, você precisa ser {warningType === 'Oferta' ? 'FORNECEDOR' : 'COMPRADOR'}.
            </p>
            
            <div style={{
              background: 'rgba(0,255,102,0.05)',
              border: '1px solid #00ff66',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '0.85rem'
            }}>
              <strong style={{ color: '#00ff66', display: 'block', marginBottom: '6px' }}>✅ SOLUÇÃO:</strong>
              <span style={{ color: '#ccc' }}>
                Vá em "Documentos e Verificação" e faça upload da sua {warningType === 'Oferta' ? 'Licença Ambiental LO / PGRS' : 'Licença Ambiental de Reciclagem/Aterro/Tratamento'}. Sua especialidade vai mudar para "Fornecedor & Comprador" e você poderá anunciar {warningType === 'Oferta' ? 'ofertas' : 'demandas'}.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  // Redirect to dashboard with documents tab active
                  window.location.href = '/?tab=documentos';
                }}
                className="btn btn-primary"
                style={{ flex: 2, padding: '12px', background: 'var(--primary)', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                📋 Ir para Documentos
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowHabilitacaoWarning(false);
                }}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '12px', background: '#1c1c1c', border: '1px solid #333', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
