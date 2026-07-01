'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  MapPin, Shield, Info, Calendar, Clock, Lock, Unlock, FileText, CheckCircle,
  AlertTriangle, Send, ArrowUpRight, ArrowDownRight, Percent, Truck, Copy,
  ExternalLink, AlertCircle, RefreshCw, X, Check, Award, Plus, DollarSign, ListFilter
} from 'lucide-react'

// Mock state helper
const getStoredAuctions = () => {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem('materra_freight_auctions') || '[]')
  } catch (e) {
    return []
  }
}

const saveStoredAuctions = (auctions: any[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('materra_freight_auctions', JSON.stringify(auctions))
}

const MOCK_TRANSPORTS = {
  anunciante: {
    id: 'abc-industria-id',
    nome_ou_razao: 'ABC Indústria S/A',
    tipo_parte: 'Fornecedor',
    subtipo: 'Empresa',
    nivel_selo: 'Ouro',
    score_0a100: 95,
    whatsapp: '+55 11 3000-0000',
    email: 'contato@abc.com',
    cidade: 'São Paulo',
    uf: 'SP',
    endereco: 'Rua X, 123 - Água Rasa'
  },
  transpA: {
    id: 'transp-a-id',
    nome_ou_razao: 'Transportadora Alfa Ltda',
    tipo_parte: 'Transportadora',
    subtipo: 'Transportadora',
    nivel_selo: 'Ouro',
    score_0a100: 92,
    whatsapp: '+55 11 3000-0000',
    email: 'contato@transpa.com',
    cidade: 'São Bernardo do Campo',
    uf: 'SP',
    responsavel: 'João da Silva'
  },
  transpB: {
    id: 'transp-b-id',
    nome_ou_razao: 'Transportadora Beta S/A',
    tipo_parte: 'Transportadora',
    subtipo: 'Transportadora',
    nivel_selo: 'Prata',
    score_0a100: 70,
    whatsapp: '+55 11 8888-8888',
    email: 'contato@transpb.com.br',
    cidade: 'São Paulo',
    uf: 'SP',
    responsavel: 'Maria Santos'
  }
}

function FreightTimer({ room }: { room: any }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [isAntiSnipeActive, setIsAntiSnipeActive] = useState(false)

  useEffect(() => {
    if (room.status === 'Finalizado') {
      setTimeLeft('Encerrado')
      setIsAntiSnipeActive(false)
      return
    }

    const updateTimer = () => {
      if (!room.data_fim_leilao) {
        setTimeLeft('Sem data')
        return
      }
      const difference = new Date(room.data_fim_leilao).getTime() - Date.now()
      if (difference <= 0) {
        setTimeLeft('Encerrado')
        setIsAntiSnipeActive(false)
        return
      }

      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)

      // Anti-snipe notice if time left is less than 15 minutes
      if (difference > 0 && difference <= 15 * 60 * 1000) {
        setIsAntiSnipeActive(true)
      } else {
        setIsAntiSnipeActive(false)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [room.data_fim_leilao, room.status])

  return (
    <div>
      <span style={{ display: 'block', fontSize: '1.4rem', color: '#fff', fontFamily: 'monospace' }}>{timeLeft}</span>
      {isAntiSnipeActive && (
        <span style={{ display: 'block', fontSize: '0.65rem', color: '#ff9800', marginTop: '2px', fontWeight: 'bold' }}>
          ⚠️ Anti-snipe ativo! +15min se novo lance
        </span>
      )}
    </div>
  )
}

function FreteContent() {
  const router = useRouter()
  const supabase = createClient()
  const searchParams = useSearchParams()
  const roomId = searchParams.get('id')

  // Auth context
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentProfile, setCurrentProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [repCompanies, setRepCompanies] = useState<any[]>([])
  const [idFichaEmpresa, setIdFichaEmpresa] = useState<string | null>(null)
  const [razaoSocialEmpresa, setRazaoSocialEmpresa] = useState<string | null>(null)

  // Form states
  const [tipoCarga, setTipoCarga] = useState('')
  const [tipoCaminhao, setTipoCaminhao] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [unidade, setUnidade] = useState('toneladas')
  const [acessoBalança, setAcessoBalança] = useState(false)
  const [acessoDoca, setAcessoDoca] = useState(false)
  const [acessoRestricao, setAcessoRestricao] = useState(false)
  const [alturaRestricao, setAlturaRestricao] = useState('')
  const [pesoRestricao, setPesoRestricao] = useState('')

  const [origemUf, setOrigemUf] = useState('SP')
  const [origemMun, setOrigemMun] = useState('São Paulo')
  const [cepOrigem, setCepOrigem] = useState('')
  const [destinoUf, setDestinoUf] = useState('RJ')
  const [destinoMun, setDestinoMun] = useState('Rio de Janeiro')
  const [cepDestino, setCepDestino] = useState('')

  const [dataColeta, setDataColeta] = useState('')
  const [horarioColeta, setHorarioColeta] = useState('08h-12h')
  const [dataEntrega, setDataEntrega] = useState('')

  const [reqRntrc, setReqRntrc] = useState(true)
  const [reqMopp, setReqMopp] = useState(false)
  const [reqCipp, setReqCipp] = useState(false)
  const [reqAppIbama, setReqAppIbama] = useState(false)
  const [reqApolice, setReqApolice] = useState(false)
  const [reqPAE, setReqPAE] = useState(false)
  const [observacoes, setObservacoes] = useState('')

  const [duracaoLeilao, setDuracaoLeilao] = useState('24') // hours
  const [duracaoPersonalizada, setDuracaoPersonalizada] = useState('')

  // Simulator state
  const [simulatedDistance, setSimulatedDistance] = useState(0)
  const [simulatedIndexValue, setSimulatedIndexValue] = useState(0)
  const [simulating, setSimulating] = useState(false)
  const [simulationDone, setSimulationDone] = useState(false)

  // Checkout modal
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<'pay' | 'success'>('pay')
  const [createdRoomId, setCreatedRoomId] = useState('')
  const [leilaoCego, setLeilaoCego] = useState(false)
  const [showCarrierActivation, setShowCarrierActivation] = useState(false)
  const [activatingRoom, setActivatingRoom] = useState<any>(null)
  const [showBypassModal, setShowBypassModal] = useState(false)

  // Transportadora participation screen
  const [bidValue, setBidValue] = useState('')

  // Active rooms index for shipper view
  const [auctions, setAuctions] = useState<any[]>([])

  // Multiple contacts unlock checkout
  const [showMultiUnlock, setShowMultiUnlock] = useState(false)
  const [selectedUnlockTransports, setSelectedUnlockTransports] = useState<string[]>([])

  const UFS = ['SP', 'RJ', 'GO', 'MG', 'DF']
  const CITIES_BY_UF: any = {
    SP: ['São Paulo', 'Campinas', 'São Bernardo do Campo', 'Guarulhos', 'Santos'],
    RJ: ['Rio de Janeiro', 'Niterói', 'Duque de Caxias', 'Nova Iguaçu'],
    GO: ['Goiânia', 'Anápolis', 'Aparecida de Goiânia', 'Rio Verde'],
    MG: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora'],
    DF: ['Brasília']
  }

  // Load logistics from Supabase
  const loadDbFreightAuctions = async () => {
    try {
      const { data: dbAuctions } = await supabase
        .from('frete_leiloes')
        .select('*')
        .order('created_at', { ascending: false })
      if (dbAuctions && dbAuctions.length > 0) {
        const updatedAuctions = await Promise.all(dbAuctions.map(async (auc: any) => {
          const { data: bList } = await supabase
            .from('frete_lances')
            .select('*')
            .eq('id_leilao', auc.id)
            .order('timestamp', { ascending: false })
          
          const formattedBids = (bList || []).map((b: any) => ({
            id: b.id,
            transportadora_id: b.id_transportadora,
            preco: Number(b.preco),
            timestamp: b.timestamp
          }))

          return {
            ...auc,
            lances: formattedBids
          }
        }))
        
        const localList = getStoredAuctions()
        const merged = [...updatedAuctions]
        localList.forEach((localItem: any) => {
          if (!merged.some(m => m.id === localItem.id)) {
            merged.push(localItem)
          }
        })
        setAuctions(merged)
        saveStoredAuctions(merged)
      }
    } catch (e) {
      console.warn('Erro ao carregar leilões de frete do banco:', e)
    }
  }

  // Load session
  const loadSession = async () => {
    setLoading(true)
    let localUser = null
    let localProfile = null
    try {
      const u = localStorage.getItem('materra_user')
      const p = localStorage.getItem('materra_profile')
      if (u) localUser = JSON.parse(u)
      if (p) localProfile = JSON.parse(p)
    } catch (e) {}

    if (!localUser || !localProfile) {
      localUser = { id: MOCK_TRANSPORTS.anunciante.id, email: MOCK_TRANSPORTS.anunciante.email }
      localProfile = MOCK_TRANSPORTS.anunciante
      localStorage.setItem('materra_user', JSON.stringify(localUser))
      localStorage.setItem('materra_profile', JSON.stringify(localProfile))
    }

    setCurrentUser(localUser)
    setCurrentProfile(localProfile)
    setAuctions(getStoredAuctions())
    
    await loadDbFreightAuctions()
    
    if (localProfile && (localProfile.subtipo === 'Corretor' || localProfile.subtipo === 'Corretor/Controlador')) {
      try {
        const { data } = await supabase
          .from('fichas_empresa_representada')
          .select('*')
          .eq('id_corretor', localUser.id)
          .order('created_at', { ascending: false })
        if (data) setRepCompanies(data)
      } catch (e) {
        console.warn(e)
      }
    }
    
    setLoading(false)
  }

  useEffect(() => {
    loadSession()
  }, [])

  // Autofill Inteligente from active material deal
  useEffect(() => {
    const anuncioId = searchParams.get('anuncio_id')
    if (!anuncioId) return

    try {
      const localAdsStr = localStorage.getItem('materra_local_anuncios') || '[]'
      const localAds = JSON.parse(localAdsStr)
      const foundAd = localAds.find((a: any) => a.id === anuncioId)
      if (foundAd) {
        setTipoCarga(foundAd.titulo || foundAd.residuo || '')
        setQuantidade(String(foundAd.quantidade || ''))
        setUnidade(foundAd.unidade === 't' ? 'toneladas' : foundAd.unidade === 'm³' ? 'm³' : 'toneladas')
        if (foundAd.cep) {
          setCepOrigem(foundAd.cep)
        }
        if (foundAd.uf) {
          setOrigemUf(foundAd.uf)
        }
        if (foundAd.municipio) {
          setOrigemMun(foundAd.municipio)
        }
      }
    } catch (e) {
      console.warn('Erro no autofill do frete:', e)
    }
  }, [searchParams])

  // Pre-flight margins simulator (Pre-Flight) triggered automatically on changes to CEPs or vehicle type
  useEffect(() => {
    if (!cepOrigem || !cepDestino) return

    // 1. Calculate geometric distance based on CEP prefixes
    const cleanOrig = cepOrigem.replace(/\D/g, '')
    const cleanDest = cepDestino.replace(/\D/g, '')
    
    let distance = 250
    if (cleanOrig.substring(0, 3) === cleanDest.substring(0, 3)) {
      distance = 15
    } else if (cleanOrig.substring(0, 2) === cleanDest.substring(0, 2)) {
      distance = 45
    } else if (cleanOrig.substring(0, 1) === cleanDest.substring(0, 1)) {
      distance = 120
    } else {
      const prefA = parseInt(cleanOrig.substring(0, 2)) || 10
      const prefB = parseInt(cleanDest.substring(0, 2)) || 10
      const diff = Math.abs(prefA - prefB)
      distance = Math.max(50, diff * 65)
    }
    setSimulatedDistance(distance)

    // 2. Base price multiplier based on vehicle type
    let ratePerKm = 40
    if (tipoCaminhao === 'Vanderleia' || tipoCaminhao === 'Bitrem') {
      ratePerKm = 52.5
    } else if (tipoCaminhao === 'Truck' || tipoCaminhao === 'Bitruck') {
      ratePerKm = 38.0
    } else if (tipoCaminhao === 'Toco' || tipoCaminhao === '3/4') {
      ratePerKm = 24.5
    }

    const totalBase = distance * ratePerKm
    setSimulatedIndexValue(totalBase)
    setSimulationDone(true)
  }, [cepOrigem, cepDestino, tipoCaminhao])

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault()
    // Triggered manually as fallback or display update
  }

  const handleSwitchProfile = (roleKey: 'anunciante' | 'transpA' | 'transpB') => {
    const targetProfile = MOCK_TRANSPORTS[roleKey]
    const targetUser = { id: targetProfile.id, email: targetProfile.email }
    localStorage.setItem('materra_user', JSON.stringify(targetUser))
    localStorage.setItem('materra_profile', JSON.stringify(targetProfile))
    setCurrentUser(targetUser)
    setCurrentProfile(targetProfile)
  }

  const handleOpenCheckout = () => {
    setShowCheckout(true)
    setCheckoutStep('pay')
  }

  // Finalize reverse auction request
  const handleConfirmLeadFee = () => {
    const hours = duracaoLeilao === 'custom' ? parseInt(duracaoPersonalizada) || 24 : parseInt(duracaoLeilao)
    const roomId = 'freight_' + Math.random().toString(36).substring(2, 9)

    // Prepopulate with mock transport bids
    const initialBids = [
      {
        id: 'bid_c',
        transportadora_id: 'transp-c-id',
        transportadora_nome: 'Jota Logística e Transportes',
        transportadora_selo: 'Bronze',
        transportadora_score: 45,
        preco: simulatedIndexValue * 0.93, // e.g. R$ 19.800
        timestamp: new Date(Date.now() - 600000).toISOString()
      },
      {
        id: 'bid_d',
        transportadora_id: 'transp-d-id',
        transportadora_nome: 'Expresso Sudeste S/A',
        transportadora_selo: 'Sem Selo',
        transportadora_score: 30,
        preco: simulatedIndexValue * 0.945, // R$ 20.100
        timestamp: new Date(Date.now() - 1200000).toISOString()
      },
      {
        id: 'bid_e',
        transportadora_id: 'transp-e-id',
        transportadora_nome: 'Vargas Cargas Nacionais',
        transportadora_selo: 'Sem Selo',
        transportadora_score: 25,
        preco: simulatedIndexValue * 0.988, // R$ 21.000
        timestamp: new Date(Date.now() - 1800000).toISOString()
      }
    ]

    const newAuction = {
      id: roomId,
      id_shipper: currentUser.id,
      id_ficha_empresa: idFichaEmpresa,
      razao_social_empresa: razaoSocialEmpresa,
      shipper_nome: razaoSocialEmpresa ? `${razaoSocialEmpresa} (Controlador: ${currentProfile.nome_ou_razao})` : currentProfile.nome_ou_razao,
      tipo_carga: tipoCarga,
      tipo_caminhao: tipoCaminhao,
      quantidade: parseFloat(quantidade) || 20,
      unidade,
      condicoes_acesso: [
        acessoBalança && 'Balança no local',
        acessoDoca && 'Doca disponível',
        acessoRestricao && 'Restrição de portaria',
        alturaRestricao && `Altura máx: ${alturaRestricao}m`,
        pesoRestricao && `Peso máx: ${pesoRestricao}kg PBT`
      ].filter(Boolean),
      origem_uf: origemUf,
      origem_mun: origemMun,
      cep_origem: cepOrigem || '01000-000',
      destino_uf: destinoUf,
      destino_mun: destinoMun,
      cep_destino: cepDestino || '01000-000',
      distancia: simulatedDistance,
      data_coleta: dataColeta || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      horario_coleta: horarioColeta,
      data_entrega: dataEntrega || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      documentos_exigidos: [
        reqRntrc && 'RNTRC ativo',
        reqMopp && 'Curso MOPP',
        reqCipp && 'Certificado CIPP',
        reqAppIbama && 'CTF/APP IBAMA',
        reqApolice && 'Apólice RC/RCFDC',
        reqPAE && 'PAE (Plano de Emergência)'
      ].filter(Boolean),
      observacoes,
      valor_estimado: simulatedIndexValue,
      duracao_leilao_horas: hours,
      data_fim_leilao: new Date(Date.now() + hours * 3600 * 1000).toISOString(),
      status: 'Aberto',
      leilao_cego: leilaoCego, // blind auction flag
      participantes: ['transp-c-id', 'transp-d-id', 'transp-e-id'],
      lances: initialBids,
      taxas_adicionais_pagas: [], // unlocked transport ids
      transportadora_vencedora_id: null
    }

    const currentList = getStoredAuctions()
    currentList.unshift(newAuction)
    saveStoredAuctions(currentList)
    setAuctions(currentList)

    // Background insert to Supabase
    const runDbInsert = async () => {
      try {
        const { data: dbAuc, error: errAuc } = await supabase
          .from('frete_leiloes')
          .insert([{
            id_shipper: currentUser.id,
            id_ficha_empresa: idFichaEmpresa,
            razao_social_empresa: razaoSocialEmpresa,
            tipo_carga: tipoCarga,
            tipo_caminhao: tipoCaminhao,
            quantidade: parseFloat(quantidade) || 20,
            unidade,
            condicoes_acesso: newAuction.condicoes_acesso,
            origem_uf: origemUf,
            origem_mun: origemMun,
            cep_origem: newAuction.cep_origem,
            destino_uf: destinoUf,
            destino_mun: destinoMun,
            cep_destino: newAuction.cep_destino,
            distancia: simulatedDistance,
            data_coleta: newAuction.data_coleta,
            horario_coleta: horarioColeta,
            data_entrega: newAuction.data_entrega,
            documentos_exigidos: newAuction.documentos_exigidos,
            observacoes,
            valor_estimado: simulatedIndexValue,
            duracao_leilao_horas: hours,
            data_fim_leilao: newAuction.data_fim_leilao,
            status: 'Aberto',
            leilao_cego: leilaoCego
          }])
          .select()
          .single()

        if (!errAuc && dbAuc) {
          const bidsToInsert = initialBids.map(b => ({
            id_leilao: dbAuc.id,
            id_transportadora: currentUser.id, // using current user id or simulated uuid
            preco: b.preco
          }))
          await supabase.from('frete_lances').insert(bidsToInsert)
        }
      } catch (e) {
        console.warn('Erro ao salvar cotação frete no banco:', e)
      }
    }
    runDbInsert()

    // Log to audit trail
    try {
      const auditTrail = JSON.parse(localStorage.getItem('materra_compliance_audit_trail') || '[]')
      auditTrail.unshift({
        event_type: 'REVERSE_AUCTION_INITIATED',
        event_category: 'Logística',
        action: 'INIT_REVERSE_AUCTION',
        entity_type: 'Frete Reverso',
        entity_id: roomId,
        actor: currentProfile.nome_ou_razao,
        details: `Leilão reverso iniciado. Rota: ${origemMun}/${origemUf} -> ${destinoMun}/${destinoUf} (${simulatedDistance} km). Valor Estimado: R$ ${simulatedIndexValue.toFixed(2)}. Taxa Lead: R$ 150.00.`,
        timestamp: new Date().toISOString(),
        status: 'Íntegro',
        hash: 'SHA256-RFR-' + Math.random().toString(36).substring(2, 10)
      })
      localStorage.setItem('materra_compliance_audit_trail', JSON.stringify(auditTrail))
    } catch (e) {}

    setCreatedRoomId(roomId)
    setCheckoutStep('success')
  }

  // Transporter joins leilão
  const handleTranspParticipate = (room: any) => {
    const updated = auctions.map((r: any) => {
      if (r.id === room.id) {
        const parts = [...(r.participantes || [])]
        if (!parts.includes(currentProfile.id)) {
          parts.push(currentProfile.id)
        }
        return { ...r, participantes: parts }
      }
      return r
    })
    saveStoredAuctions(updated)
    setAuctions(updated)

    // Audit event
    try {
      const auditTrail = JSON.parse(localStorage.getItem('materra_compliance_audit_trail') || '[]')
      auditTrail.unshift({
        event_type: 'CARRIER_JOINED_AUCTION',
        event_category: 'Logística',
        action: 'JOIN_AUCTION',
        entity_type: 'Frete Reverso',
        entity_id: room.id,
        actor: currentProfile.nome_ou_razao,
        details: `Transportadora credenciada aceitou o convite do leilão de frete reverso.`,
        timestamp: new Date().toISOString(),
        status: 'Íntegro',
        hash: 'SHA256-RFR-' + Math.random().toString(36).substring(2, 10)
      })
      localStorage.setItem('materra_compliance_audit_trail', JSON.stringify(auditTrail))
    } catch (e) {}
  }

  // Transporter submits bid
  const handleTranspSubmitBid = (e: React.FormEvent, room: any) => {
    e.preventDefault()
    const val = parseFloat(bidValue)
    if (isNaN(val) || val <= 0) {
      alert('Informe um valor de frete válido.')
      return
    }

    const currentBest = room.lances.length > 0
      ? Math.min(...room.lances.map((l: any) => l.preco))
      : room.valor_estimado

    if (val >= currentBest) {
      alert(`Seu lance de R$ ${val.toLocaleString('pt-BR')} deve ser MENOR que o melhor lance atual (R$ ${currentBest.toLocaleString('pt-BR')}) para ter preferência.`)
      return
    }

    const newBid = {
      id: 'bid_' + Date.now(),
      transportadora_id: currentProfile.id,
      transportadora_nome: currentProfile.nome_ou_razao,
      transportadora_selo: currentProfile.nivel_selo,
      transportadora_score: currentProfile.score_0a100,
      preco: val,
      timestamp: new Date().toISOString()
    }

    // Anti-snipe: if within last 15 min, extend by 15 min
    let updatedEndTime = room.data_fim_leilao
    let antiSnipeTriggered = false
    if (room.data_fim_leilao) {
      const diffMin = (new Date(room.data_fim_leilao).getTime() - Date.now()) / 60000
      if (diffMin > 0 && diffMin <= 15) {
        updatedEndTime = new Date(new Date(room.data_fim_leilao).getTime() + 15 * 60 * 1000).toISOString()
        antiSnipeTriggered = true
      }
    }

    const updated = auctions.map((r: any) => {
      if (r.id === room.id) {
        const newLances = [...r.lances, newBid]
        if (antiSnipeTriggered) {
          newLances.push({
            id: 'bid_snipe_' + Date.now(),
            transportadora_id: 'SYSTEM',
            transportadora_nome: 'Sistema Materra',
            transportadora_selo: 'Info',
            transportadora_score: 100,
            preco: 0,
            texto: '⏱️ Regra Anti-Snipe acionada! Lance nos 15 min finais estendeu o leilão por +15 minutos.',
            timestamp: new Date().toISOString()
          })
        }
        return { ...r, lances: newLances, data_fim_leilao: updatedEndTime }
      }
      return r
    })

    saveStoredAuctions(updated)
    setAuctions(updated)
    setBidValue('')

    // Audit event
    try {
      const auditTrail = JSON.parse(localStorage.getItem('materra_compliance_audit_trail') || '[]')
      auditTrail.unshift({
        event_type: 'CARRIER_BID_SUBMITTED',
        event_category: 'Logística',
        action: 'SUBMIT_BID',
        entity_type: 'Frete Reverso',
        entity_id: room.id,
        actor: currentProfile.nome_ou_razao,
        details: `Novo lance de frete reverso: R$ ${val.toFixed(2)}. Anti-snipe: ${antiSnipeTriggered ? 'Sim' : 'Não'}.`,
        timestamp: new Date().toISOString(),
        status: 'Íntegro',
        hash: 'SHA256-RFR-' + Math.random().toString(36).substring(2, 10)
      })
      localStorage.setItem('materra_compliance_audit_trail', JSON.stringify(auditTrail))
    } catch (e) {}
  }

  // Freeze the auction to inspect/unlock more contacts
  const handleFreezeAuction = (room: any) => {
    const updated = auctions.map((r: any) => {
      if (r.id === room.id) {
        return { ...r, status: 'Congelado' }
      }
      return r
    })
    saveStoredAuctions(updated)
    setAuctions(updated)

    // Audit event
    try {
      const auditTrail = JSON.parse(localStorage.getItem('materra_compliance_audit_trail') || '[]')
      auditTrail.unshift({
        event_type: 'REVERSE_AUCTION_FROZEN',
        event_category: 'Logística',
        action: 'FREEZE_AUCTION',
        entity_type: 'Frete Reverso',
        entity_id: room.id,
        actor: currentProfile.nome_ou_razao,
        details: `Leilão de frete congelado pelo cliente para análise de transportadoras adicionais.`,
        timestamp: new Date().toISOString(),
        status: 'Íntegro',
        hash: 'SHA256-RFR-' + Math.random().toString(36).substring(2, 10)
      })
      localStorage.setItem('materra_compliance_audit_trail', JSON.stringify(auditTrail))
    } catch (e) {}
  }

  // Unlock additional contacts (simulate checkout)
  const handleConfirmMultiUnlock = (room: any) => {
    const updated = auctions.map((r: any) => {
      if (r.id === room.id) {
        const unlocked = [...(r.taxas_adicionais_pagas || [])]
        selectedUnlockTransports.forEach(id => {
          if (!unlocked.includes(id)) unlocked.push(id)
        })
        return { ...r, taxas_adicionais_pagas: unlocked }
      }
      return r
    })
    saveStoredAuctions(updated)
    setAuctions(updated)
    setShowMultiUnlock(false)
    setSelectedUnlockTransports([])

    // Audit event
    try {
      const auditTrail = JSON.parse(localStorage.getItem('materra_compliance_audit_trail') || '[]')
      auditTrail.unshift({
        event_type: 'CARRIER_CONTACTS_UNLOCKED',
        event_category: 'Logística',
        action: 'UNLOCK_CONTACTS',
        entity_type: 'Frete Reverso',
        entity_id: room.id,
        actor: currentProfile.nome_ou_razao,
        details: `Contatos adicionais desbloqueados. Transportadoras: ${selectedUnlockTransports.join(', ')}.`,
        timestamp: new Date().toISOString(),
        status: 'Íntegro',
        hash: 'SHA256-RFR-' + Math.random().toString(36).substring(2, 10)
      })
      localStorage.setItem('materra_compliance_audit_trail', JSON.stringify(auditTrail))
    } catch (e) {}
  }

  // Choose the winning carrier and complete leilão reverso
  const handleChooseWinner = (room: any, winnerId: string) => {
    const updated = auctions.map((r: any) => {
      if (r.id === room.id) {
        return { ...r, status: 'Finalizado', transportadora_vencedora_id: winnerId }
      }
      return r
    })
    saveStoredAuctions(updated)
    setAuctions(updated)

    // Sync status and winner with Supabase frete_leiloes
    const updateDbWinner = async () => {
      try {
        await supabase
          .from('frete_leiloes')
          .update({ status: 'Finalizado', transportadora_vencedora_id: winnerId })
          .eq('id', room.id)
      } catch (e) {
        console.warn('Erro ao atualizar vencedor do frete no Supabase:', e)
      }
    }
    updateDbWinner()

    // Audit event
    try {
      const auditTrail = JSON.parse(localStorage.getItem('materra_compliance_audit_trail') || '[]')
      auditTrail.unshift({
        event_type: 'REVERSE_AUCTION_FINISHED',
        event_category: 'Logística',
        action: 'FINISH_REVERSE_AUCTION',
        entity_type: 'Frete Reverso',
        entity_id: room.id,
        actor: currentProfile.nome_ou_razao,
        details: `Leilão reverso finalizado. Transportadora vencedora contratada: ${winnerId}.`,
        timestamp: new Date().toISOString(),
        status: 'Íntegro',
        hash: 'SHA256-RFR-' + Math.random().toString(36).substring(2, 10)
      })
      localStorage.setItem('materra_compliance_audit_trail', JSON.stringify(auditTrail))
    } catch (e) {}
  }

  // Carrier activation payment confirmation (R$ 35,00)
  const handleConfirmCarrierActivation = (room: any) => {
    const updated = auctions.map((r: any) => {
      if (r.id === room.id) {
        return { ...r, taxa_ativacao_paga: true }
      }
      return r
    })
    saveStoredAuctions(updated)
    setAuctions(updated)
    setShowCarrierActivation(false)

    // Log to audit trail
    try {
      const auditTrail = JSON.parse(localStorage.getItem('materra_compliance_audit_trail') || '[]')
      auditTrail.unshift({
        event_type: 'CARRIER_ACTIVATION_PAID',
        event_category: 'Logística',
        action: 'CONFIRM_ACTIVATION',
        entity_type: 'Frete Reverso',
        entity_id: room.id,
        actor: currentProfile.nome_ou_razao,
        details: `Taxa de ativação de frete paga pela transportadora (R$ 35,00). Contatos da carga liberados comercialmente.`,
        timestamp: new Date().toISOString(),
        status: 'Íntegro',
        hash: 'SHA256-RFR-' + Math.random().toString(36).substring(2, 10)
      })
      localStorage.setItem('materra_compliance_audit_trail', JSON.stringify(auditTrail))
    } catch (e) {}
  }

  // Transporter bypass purchase (Furar a Fila do Frete - R$ 80,00)
  const handleConfirmBypass = (room: any) => {
    const updated = auctions.map((r: any) => {
      if (r.id === room.id) {
        return {
          ...r,
          status: 'Finalizado',
          transportadora_vencedora_id: currentProfile.id,
          taxa_ativacao_paga: true
        }
      }
      return r
    })
    saveStoredAuctions(updated)
    setAuctions(updated)
    setShowBypassModal(false)

    // Sync bypass with Supabase frete_leiloes
    const updateDbBypass = async () => {
      try {
        await supabase
          .from('frete_leiloes')
          .update({
            status: 'Finalizado',
            transportadora_vencedora_id: currentProfile.id
          })
          .eq('id', room.id)
      } catch (e) {
        console.warn('Erro ao registrar bypass de frete no Supabase:', e)
      }
    }
    updateDbBypass()

    // Log to audit trail
    try {
      const auditTrail = JSON.parse(localStorage.getItem('materra_compliance_audit_trail') || '[]')
      auditTrail.unshift({
        event_type: 'CARRIER_BYPASS_PURCHASED',
        event_category: 'Logística',
        action: 'BYPASS_AUCTION',
        entity_type: 'Frete Reverso',
        entity_id: room.id,
        actor: currentProfile.nome_ou_razao,
        details: `Transportadora pagou o Super Contato de Frete de R$ 80,00 (Furar Fila). Leilão encerrado e contatos mútuos liberados.`,
        timestamp: new Date().toISOString(),
        status: 'Íntegro',
        hash: 'SHA256-RFR-' + Math.random().toString(36).substring(2, 10)
      })
      localStorage.setItem('materra_compliance_audit_trail', JSON.stringify(auditTrail))
    } catch (e) {}
  }

  // Supplier logs terminal deal (Deu Negócio)
  const handleDeuNegocio = (room: any) => {
    const updated = auctions.map((r: any) => {
      if (r.id === room.id) {
        return { ...r, status: 'SUSPENSO' }
      }
      return r
    })
    saveStoredAuctions(updated)
    setAuctions(updated)

    // Sync with Supabase frete_leiloes
    const updateDbDeuNegocio = async () => {
      try {
        await supabase
          .from('frete_leiloes')
          .update({ status: 'SUSPENSO' })
          .eq('id', room.id)
      } catch (e) {
        console.warn('Erro ao arquivar cotação frete no Supabase:', e)
      }
    }
    updateDbDeuNegocio()

    // Compliance audit trail event
    try {
      const auditTrail = JSON.parse(localStorage.getItem('materra_compliance_audit_trail') || '[]')
      auditTrail.unshift({
        event_type: 'REVERSE_AUCTION_DEAL_CLOSED',
        event_category: 'Logística',
        action: 'CLOSE_DEAL_LOGISTICS',
        entity_type: 'Frete Reverso',
        entity_id: room.id,
        actor: currentProfile.nome_ou_razao,
        details: `Carga contratada e enviada ao Cofre. Status do frete alterado para SUSPENSO (Arquivado). Transação congelada para conformidade legal.`,
        timestamp: new Date().toISOString(),
        status: 'Íntegro',
        hash: 'SHA256-RFR-' + Math.random().toString(36).substring(2, 10)
      })
      localStorage.setItem('materra_compliance_audit_trail', JSON.stringify(auditTrail))
    } catch (e) {}
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '16px', background: '#000', color: '#fff' }}>
        <div className="spinner"></div>
        <p style={{ color: '#aaa' }}>Verificando sessão de transporte...</p>
      </div>
    )
  }

  // Determine active view mode
  const activeRoom = auctions.find((a: any) => a.id === roomId)
  const isShipper = currentProfile.id === 'abc-industria-id'

  // Validation helper for freight form
  const isFormValid =
    tipoCarga !== '' &&
    tipoCaminhao !== '' &&
    quantidade.trim() !== '' &&
    origemUf && origemMun &&
    destinoUf && destinoMun &&
    reqRntrc

  return (
    <div style={{ background: '#000', color: '#f5f5f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-heading)' }}>
      
      {/* NAVBAR */}
      <nav style={{ background: 'rgba(10, 10, 10, 0.95)', borderBottom: '1px solid var(--border-color)', padding: '16px 24px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary-500)', letterSpacing: '0.05em' }}>
              🚚 LEILÃO REVERSO DE FRETE
            </span>
            <span style={{ color: '#666' }}>|</span>
            <span style={{ fontSize: '0.85rem', color: '#ccc' }}>Painel Logístico Inteligente</span>
          </div>
          <Link href="/" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem', background: '#111', border: '1px solid #333' }}>
            Voltar ao Dashboard
          </Link>
        </div>
      </nav>

      {/* SESSÃO ATIVA HEADER */}
      <div style={{ background: '#080808', borderBottom: '1px solid #1a1a1a', padding: '10px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#888' }}>
            Perfil Ativo: <strong style={{ color: '#fff' }}>{currentProfile.nome_ou_razao}</strong> ({currentProfile.tipo_parte})
          </span>
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,215,0,0.1)', color: 'var(--primary-500)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
            {currentProfile.nivel_selo} Selo ({currentProfile.score_0a100} Score)
          </span>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '24px auto', padding: '0 24px', width: '100%', flex: 1 }}>
        
        {/* VIEW 1: SALA DO LEILÃO REVERSO */}
        {activeRoom ? (
          <div>
            {/* SALA HEADER */}
            <div style={{ background: '#121212', border: '1px solid #222', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', marginBottom: '6px' }}>
                    SALA DO LEILÃO REVERSO: {activeRoom.origem_mun}, {activeRoom.origem_uf} → {activeRoom.destino_mun}, {activeRoom.destino_uf}
                  </h2>
                  <p style={{ color: '#aaa', fontSize: '0.85rem', margin: 0 }}>
                    Distância: {activeRoom.distancia} km | Carga: {activeRoom.quantidade} {activeRoom.unidade} ({activeRoom.tipo_carga}) | Veículo: {activeRoom.tipo_caminhao}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: '#888' }}>Status do Leilão:</span>
                  <span style={{
                    display: 'block', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '4px',
                    background: activeRoom.status === 'Aberto' ? 'rgba(0,255,102,0.1)' : activeRoom.status === 'Congelado' ? 'rgba(255,183,77,0.15)' : 'rgba(239,83,80,0.15)',
                    color: activeRoom.status === 'Aberto' ? '#00ff66' : activeRoom.status === 'Congelado' ? '#ffb74d' : '#ef5350',
                    border: `1px solid ${activeRoom.status === 'Aberto' ? '#00ff66' : activeRoom.status === 'Congelado' ? '#ffb74d' : '#ef5350'}33`
                  }}>
                    {activeRoom.status === 'Aberto' ? '⚡ RECEBENDO PROPOSTAS' : activeRoom.status === 'Congelado' ? '🔒 CONGELADO / ANÁLISE' : '✅ FINALIZADO'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '24px', alignItems: 'start' }}>
              
              {/* CENTRAL COL: LEILÃO STATUS & BIDDING HISTORIC */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* TIMER & HIGHLIGHTS */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div style={{ background: '#121212', border: '1px solid #222', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#666', display: 'block', textTransform: 'uppercase' }}>Tempo Restante</span>
                    <div style={{ marginTop: '4px' }}>
                      <FreightTimer room={activeRoom} />
                    </div>
                  </div>
                  <div style={{ background: '#121212', border: '1px solid #222', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#666', display: 'block', textTransform: 'uppercase' }}>Valor Estimado (Index)</span>
                    <strong style={{ fontSize: '1.4rem', color: 'var(--primary-500)', display: 'block', marginTop: '4px' }}>
                      R$ {activeRoom.valor_estimado?.toLocaleString('pt-BR')}
                    </strong>
                  </div>
                  <div style={{ background: '#121212', border: '1px solid #222', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#666', display: 'block', textTransform: 'uppercase' }}>Melhor Preço</span>
                    {activeRoom.lances.length > 0 ? (
                      <strong style={{ fontSize: '1.4rem', color: '#00ff66', display: 'block', marginTop: '4px' }}>
                        R$ {Math.min(...activeRoom.lances.filter((l: any) => l.preco > 0).map((l: any) => l.preco))?.toLocaleString('pt-BR')}
                      </strong>
                    ) : (
                      <strong style={{ fontSize: '1.2rem', color: '#888', display: 'block', marginTop: '4px' }}>Sem lances</strong>
                    )}
                  </div>
                </div>

                {/* RANKING OF CARRIERS */}
                <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    💰 RANKING DE PREÇOS (Menor ganha)
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(() => {
                      const validBids = activeRoom.lances.filter((l: any) => l.preco > 0)
                      const sortedBids = [...validBids].sort((a: any, b: any) => a.preco - b.preco)

                      if (sortedBids.length === 0) {
                        return <p style={{ color: '#555', fontStyle: 'italic' }}>Nenhum lance recebido ainda.</p>
                      }

                      return sortedBids.map((bid: any, idx: number) => {
                        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`
                        const isMyBid = bid.transportadora_id === currentProfile.id
                        const isWinner = activeRoom.transportadora_vencedora_id === bid.transportadora_id

                        return (
                          <div
                            key={bid.id}
                            style={{
                              background: isMyBid ? 'rgba(255,215,0,0.05)' : '#121212',
                              border: isMyBid ? '1px solid var(--primary-500)' : '1px solid #222',
                              borderRadius: '8px',
                              padding: '16px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '1.1rem' }}>{medal}</span>
                                <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{bid.transportadora_nome}</strong>
                                {isMyBid && <span style={{ fontSize: '0.7rem', background: 'var(--primary-500)', color: '#000', padding: '1px 4px', borderRadius: '3px', fontWeight: 'bold' }}>VOCÊ</span>}
                                {isWinner && <span style={{ fontSize: '0.7rem', background: '#4caf50', color: '#fff', padding: '1px 6px', borderRadius: '3px', fontWeight: 'bold' }}>CONTRATADA</span>}
                              </div>
                              <span style={{ fontSize: '0.75rem', color: '#888' }}>
                                Selo: {bid.transportadora_selo} • Score: {bid.transportadora_score} pts • Lance enviado em {new Date(bid.timestamp).toLocaleTimeString('pt-BR')}
                              </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <strong style={{ fontSize: '1.2rem', color: idx === 0 ? '#00ff66' : '#fff' }}>
                                {activeRoom.leilao_cego && !isShipper && !isMyBid
                                  ? '🔒 R$ ••••'
                                  : `R$ ${bid.preco?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                              </strong>
                              {!(activeRoom.leilao_cego && !isShipper && !isMyBid) && (
                                <span style={{ display: 'block', fontSize: '0.7rem', color: '#555' }}>
                                  {(((bid.preco - activeRoom.valor_estimado) / activeRoom.valor_estimado) * 100).toFixed(1)}% vs. index
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>

                {/* SYSTEM NOTICE EVENT LOG */}
                <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', padding: '20px' }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', marginBottom: '12px' }}>Eventos do Leilão</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                    {activeRoom.lances.filter((l: any) => l.preco === 0).map((sys: any) => (
                      <div key={sys.id} style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.1)', padding: '10px 14px', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--primary-400)' }}>
                        {sys.texto}
                      </div>
                    ))}
                    <div style={{ fontSize: '0.75rem', color: '#555' }}>
                      📢 {activeRoom.participantes?.length || 3} transportadoras ativas participando deste certame.
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT PANEL: ACTIONS & CONTATOS */}
              <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* SHIPPER VIEW: LOCKS, ACTIONS, UNMASKING */}
                {isShipper && (
                  <div style={{ background: '#121212', border: '1px solid #333', borderRadius: '12px', padding: '24px' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--primary-500)', fontWeight: 'bold', marginBottom: '16px', textTransform: 'uppercase' }}>
                      📞 CONTATOS LIBERADOS
                    </h4>

                    {/* Best bidder transportadora A */}
                    {(() => {
                      const bestBid = [...activeRoom.lances].filter((l: any) => l.preco > 0).sort((a: any, b: any) => a.preco - b.preco)[0]
                      
                      if (!bestBid) return <p style={{ color: '#777', fontSize: '0.8rem' }}>Sem propostas no momento.</p>

                      const isA = bestBid.transportadora_id === 'transp-a-id'
                      const tInfo = isA ? MOCK_TRANSPORTS.transpA : MOCK_TRANSPORTS.transpB

                      return (
                        <div style={{ background: '#0a0a0a', border: '1px solid #222', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                          <span style={{ fontSize: '0.7rem', color: '#00ff66', background: 'rgba(0,255,102,0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                            ✅ 1º CONTATO INCLUÍDO (Melhor Preço)
                          </span>
                          <strong style={{ display: 'block', fontSize: '0.95rem', color: '#fff', marginTop: '10px' }}>{bestBid.transportadora_nome}</strong>
                          <p style={{ fontSize: '0.8rem', color: '#ccc', margin: '6px 0 0 0', lineHeight: 1.4 }}>
                            Responsável: {tInfo.responsavel || 'João da Silva'}<br />
                            Telefone: <strong style={{ color: 'var(--primary-500)' }}>{tInfo.whatsapp}</strong><br />
                            E-mail: <strong style={{ color: 'var(--primary-500)' }}>{tInfo.email}</strong>
                          </p>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <button onClick={() => alert('Telefone copiado!')} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>Copiar</button>
                            <a href={`mailto:${tInfo.email}`} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', textDecoration: 'none' }}>Email</a>
                          </div>
                        </div>
                      )
                    })()}

                    {/* Freezing / unlock additional carriers */}
                    {activeRoom.status === 'Aberto' && (
                      <div style={{ borderTop: '1px solid #222', paddingTop: '16px', marginTop: '16px' }}>
                        <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '12px', lineHeight: 1.4 }}>
                          Para ver dados das outras transportadoras (2º, 3º lugar, etc.), você precisa primeiro congelar o leilão.
                        </p>
                        <button
                          onClick={() => handleFreezeAuction(activeRoom)}
                          className="btn btn-primary"
                          style={{ width: '100%', padding: '10px', fontSize: '0.8rem', color: '#000', fontWeight: 'bold' }}
                        >
                          Ver Próximas Transportadoras (Congelar Leilão)
                        </button>
                      </div>
                    )}

                    {activeRoom.status === 'Congelado' && (
                      <div style={{ borderTop: '1px solid #222', paddingTop: '16px', marginTop: '16px' }}>
                        <span style={{ fontSize: '0.7rem', color: '#ff9800', background: 'rgba(255,152,0,0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-block', marginBottom: '12px' }}>
                          🔒 LEILÃO REVERSO TRAVADO
                        </span>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                          {activeRoom.lances.filter((l: any) => l.preco > 0).slice(1).map((bid: any) => {
                            const isUnlocked = activeRoom.taxas_adicionais_pagas?.includes(bid.transportadora_id)
                            const tInfo = bid.transportadora_id === 'transp-b-id' ? MOCK_TRANSPORTS.transpB : MOCK_TRANSPORTS.transpA // Fallback logic

                            return (
                              <div key={bid.id} style={{ background: '#0a0a0a', border: '1px solid #222', padding: '12px', borderRadius: '6px' }}>
                                <strong style={{ fontSize: '0.8rem', color: '#fff', display: 'block' }}>{bid.transportadora_nome} (R$ {bid.preco?.toLocaleString('pt-BR')})</strong>
                                
                                {isUnlocked ? (
                                  <p style={{ fontSize: '0.75rem', color: '#ccc', margin: '4px 0 0 0', lineHeight: 1.3 }}>
                                    Resp: {tInfo.responsavel}<br />
                                    Tel: <strong style={{ color: 'var(--primary-500)' }}>{tInfo.whatsapp}</strong><br />
                                    Email: {tInfo.email}
                                  </p>
                                ) : (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                                    <span style={{ fontSize: '0.7rem', color: '#666' }}>🔒 Contato Ocultado</span>
                                    <button
                                      onClick={() => {
                                        setSelectedUnlockTransports([bid.transportadora_id])
                                        setShowMultiUnlock(true)
                                      }}
                                      className="btn btn-primary"
                                      style={{ padding: '4px 8px', fontSize: '0.7rem', color: '#000' }}
                                    >
                                      Desbloquear (R$ 15)
                                    </button>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>

                        {/* Final choices for Shipper */}
                        <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '12px' }}>
                          Escolha e contrate uma das transportadoras qualificadas para fechar o Leilão Reverso.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {activeRoom.lances.filter((l: any) => l.preco > 0).map((bid: any) => (
                            <button
                              key={bid.id}
                              onClick={() => handleChooseWinner(activeRoom, bid.transportadora_id)}
                              className="btn btn-primary"
                              style={{ width: '100%', padding: '10px', fontSize: '0.8rem', color: '#000', background: 'var(--primary-500)', fontWeight: 'bold' }}
                            >
                              ✅ Aceitar {bid.transportadora_nome} (R$ {bid.preco?.toLocaleString('pt-BR')})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeRoom.status === 'Finalizado' && (
                      <div style={{ borderTop: '1px solid #222', paddingTop: '16px', marginTop: '16px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#4caf50', background: 'rgba(76,175,80,0.1)', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', display: 'block', marginBottom: '12px' }}>
                          ✅ COTAÇÃO FINALIZADA
                        </span>
                        <p style={{ fontSize: '0.8rem', color: '#ccc', margin: '0 0 16px 0' }}>
                          Vencedor contratado com sucesso. Todos os contatos foram desmascarados e o evento foi devidamente auditado no ledger.
                        </p>
                        
                        {isShipper && (
                          <button
                            onClick={() => handleDeuNegocio(activeRoom)}
                            className="btn btn-primary"
                            style={{
                              width: '100%', padding: '12px', fontSize: '0.85rem',
                              fontWeight: 'bold', color: '#000', background: 'linear-gradient(90deg, #ffd700, #ffb300)'
                            }}
                          >
                            🤝 DEU NEGÓCIO / CONTRATAR DEFINITIVO
                          </button>
                        )}
                      </div>
                    )}

                  </div>
                )}

                {/* TRANSPORTER VIEW: PARTICIPATION / BID FORM */}
                {!isShipper && (
                  <div style={{ background: '#121212', border: '1px solid #333', borderRadius: '12px', padding: '24px' }}>
                    <h4 style={{ fontSize: '1rem', color: 'var(--primary-500)', fontWeight: 'bold', marginBottom: '16px', textTransform: 'uppercase' }}>
                      🚚 PARTICIPAR DA OPERAÇÃO
                    </h4>

                    {/* Check if transporter has already accepted invitations */}
                    {!activeRoom.participantes?.includes(currentProfile.id) ? (
                      <div>
                        <p style={{ fontSize: '0.85rem', color: '#ccc', marginBottom: '16px', lineHeight: 1.4 }}>
                          Você foi convidado para esta cotação reversa de frete. Confirme sua participação para começar a enviar lances.
                        </p>
                        <button
                          onClick={() => handleTranspParticipate(activeRoom)}
                          className="btn btn-primary"
                          style={{ width: '100%', padding: '12px', fontSize: '0.85rem', color: '#000', fontWeight: 'bold' }}
                        >
                          ✅ Confirmar Participação
                        </button>
                      </div>
                    ) : activeRoom.status !== 'Aberto' ? (
                      <div style={{ textAlign: 'center', padding: '12px 0' }}>
                        <span style={{ fontSize: '0.8rem', color: '#e57373', background: 'rgba(229,115,115,0.1)', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', display: 'block' }}>
                          SALA FECHADA PARA LANCES
                        </span>
                        <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '10px' }}>
                          Este leilão reverso foi congelado ou finalizado pelo Shipper.
                        </p>
                        {activeRoom.transportadora_vencedora_id === currentProfile.id && (
                          <div style={{ background: 'rgba(76,175,80,0.1)', border: '1px solid #4caf5033', borderRadius: '8px', padding: '16px', marginTop: '16px', textAlign: 'left' }}>
                            <strong style={{ color: '#4caf50', fontSize: '0.85rem', display: 'block', marginBottom: '6px' }}>
                              🎉 VOCÊ VENCEU A COTAÇÃO!
                            </strong>
                            <p style={{ fontSize: '0.8rem', color: '#ccc', margin: 0, lineHeight: 1.4 }}>
                              O cliente aceitou sua proposta de R$ {activeRoom.lances.find((l: any) => l.transportadora_id === currentProfile.id)?.preco?.toLocaleString('pt-BR')}!<br />
                              <br />
                              <strong>Contato do Cliente Liberado:</strong><br />
                              Empresa: {MOCK_TRANSPORTS.anunciante.nome_ou_razao}<br />
                              Responsável: João Silva<br />
                              WhatsApp: <strong style={{ color: 'var(--primary-500)' }}>{MOCK_TRANSPORTS.anunciante.whatsapp}</strong><br />
                              E-mail: {MOCK_TRANSPORTS.anunciante.email}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '16px' }}>
                          Você já está participando. Envie uma oferta abaixo do menor preço atual para liderar o ranking!
                        </p>
                        
                        <form onSubmit={(e) => handleTranspSubmitBid(e, activeRoom)}>
                          <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label" style={{ color: '#fff' }}>Seu Valor de Frete (R$)</label>
                            <input
                              type="number"
                              className="form-input"
                              placeholder="Ex: 18000"
                              style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                              value={bidValue}
                              onChange={e => setBidValue(e.target.value)}
                              required
                            />
                          </div>
                          <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '12px', fontSize: '0.85rem', color: '#000', fontWeight: 'bold' }}
                          >
                            ⚡ Colocar Meu Preço
                          </button>
                          
                          <div style={{ marginTop: '10px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setActivatingRoom(activeRoom)
                                setShowBypassModal(true)
                              }}
                              className="btn btn-secondary"
                              style={{ width: '100%', padding: '10px', fontSize: '0.8rem', fontWeight: 'bold', background: 'linear-gradient(90deg, #ffd700, #ffb300)', color: '#000', border: 'none' }}
                            >
                              🚀 Furar Fila do Frete - R$ 80,00
                            </button>
                          </div>
                        </form>

                        {/* Current rank status for active transportadora */}
                        {(() => {
                          const validBids = activeRoom.lances.filter((l: any) => l.preco > 0)
                          const sortedBids = [...validBids].sort((a: any, b: any) => a.preco - b.preco)
                          const myIdx = sortedBids.findIndex((b: any) => b.transportadora_id === currentProfile.id)

                          if (myIdx !== -1) {
                            return (
                              <div style={{ marginTop: '16px', background: '#0a0a0a', padding: '12px', borderRadius: '6px', textAlign: 'center', border: '1px solid #222' }}>
                                <span style={{ fontSize: '0.75rem', color: '#aaa' }}>Seu Posicionamento Atual:</span>
                                <strong style={{ display: 'block', fontSize: '1.2rem', color: myIdx === 0 ? '#00ff66' : '#ffb74d', marginTop: '4px' }}>
                                  {myIdx + 1}º lugar (de {sortedBids.length})
                                </strong>
                              </div>
                            )
                          }
                          return null
                        })()}
                      </div>
                    )}

                  </div>
                )}

              </aside>

            </div>
          </div>
        ) : (
          
          /* VIEW 2: FORM FILLING & ACTIVE INVITATIONS LIST */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 480px', gap: '32px', alignItems: 'start' }}>
            
            {/* LEFT: FORM FILLING FOR SHIPPER */}
            <div style={{ background: '#121212', border: '1px solid #333', borderRadius: '12px', padding: '32px' }}>
              <div style={{ borderBottom: '1px solid #222', paddingBottom: '16px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--primary-500)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={20} /> Solicitar Novo Leilão Reverso de Frete
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#aaa', margin: '4px 0 0 0' }}>
                  Preencha os dados da sua carga. Transportadoras qualificadas da região receberão um convite para ofertar preços menores em leilão reverso!
                </p>
              </div>

              <form onSubmit={handleSimulate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {(currentProfile?.subtipo === 'Corretor' || currentProfile?.subtipo === 'Corretor/Controlador') && (
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ color: 'var(--primary-500)', fontWeight: 'bold' }}>Cotar em nome de qual empresa?</label>
                    <select
                      className="form-select"
                      style={{ background: '#000', color: '#fff', border: '1px solid #333', marginTop: '6px' }}
                      value={idFichaEmpresa || ''}
                      onChange={e => {
                        const val = e.target.value
                        setIdFichaEmpresa(val || null)
                        const comp = repCompanies.find(c => c.id === val)
                        setRazaoSocialEmpresa(comp ? comp.razao_social : null)
                      }}
                    >
                      <option value="">Apenas eu ({currentProfile.nome_ou_razao})</option>
                      {repCompanies.map(comp => (
                        <option key={comp.id} value={comp.id}>
                          {comp.razao_social} (CNPJ: {comp.cnpj})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* SEÇÃO 1: ESPECIFICAÇÕES */}
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--primary-500)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>
                    📦 1. ESPECIFICAÇÕES DA CARGA
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ color: '#fff' }}>Tipo de Carga</label>
                      <select
                        className="form-select"
                        style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                        value={tipoCarga}
                        onChange={e => {
                          setTipoCarga(e.target.value)
                          if (e.target.value.includes('Classe I')) {
                            setReqMopp(true)
                            setReqCipp(true)
                          } else {
                            setReqMopp(false)
                            setReqCipp(false)
                          }
                        }}
                        required
                      >
                        <option value="">Selecione...</option>
                        <option value="Resíduos Classe I (perigoso)">Resíduos Classe I (perigoso)</option>
                        <option value="Resíduos Classe II (comum)">Resíduos Classe II (comum)</option>
                        <option value="Construção/RCC">Construção/RCC</option>
                        <option value="Outra Carga Geral">Outra Carga Geral</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ color: '#fff' }}>Caminhão Exigido</label>
                      <select
                        className="form-select"
                        style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                        value={tipoCaminhao}
                        onChange={e => setTipoCaminhao(e.target.value)}
                        required
                      >
                        <option value="">Selecione...</option>
                        <option value="Caminhão Truck">Caminhão Truck</option>
                        <option value="Carreta">Carreta</option>
                        <option value="Poliguindaste">Poliguindaste</option>
                        <option value="Tanque">Tanque</option>
                        <option value="Refrigerado">Refrigerado</option>
                        <option value="Sider">Sider</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ color: '#fff' }}>Quantidade</label>
                      <input
                        type="number"
                        placeholder="Ex: 20"
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
                        <option value="toneladas">toneladas</option>
                        <option value="m³">m³</option>
                        <option value="unidades">unidades</option>
                      </select>
                    </div>
                  </div>

                  {/* Acesso Checkboxes */}
                  <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '6px', padding: '12px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#aaa', display: 'block', marginBottom: '8px' }}>Condições de Acesso</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input type="checkbox" checked={acessoBalança} onChange={e => setAcessoBalança(e.target.checked)} /> Balança no local
                      </label>
                      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input type="checkbox" checked={acessoDoca} onChange={e => setAcessoDoca(e.target.checked)} /> Doca disponível
                      </label>
                      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input type="checkbox" checked={acessoRestricao} onChange={e => setAcessoRestricao(e.target.checked)} /> Restrição portaria
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                      <input
                        type="number"
                        placeholder="Restrição altura (m)"
                        className="form-input"
                        style={{ background: '#000', color: '#fff', border: '1px solid #222', padding: '6px 10px', fontSize: '0.75rem' }}
                        value={alturaRestricao}
                        onChange={e => setAlturaRestricao(e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Restrição peso (kg PBT)"
                        className="form-input"
                        style={{ background: '#000', color: '#fff', border: '1px solid #222', padding: '6px 10px', fontSize: '0.75rem' }}
                        value={pesoRestricao}
                        onChange={e => setPesoRestricao(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* SEÇÃO 2: LOCALIZAÇÃO */}
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--primary-500)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>
                    📍 2. LOCALIZAÇÃO E DISTÂNCIA
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ color: '#fff' }}>Origem (Estado / Cidade / CEP)</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                          className="form-select"
                          style={{ background: '#000', color: '#fff', border: '1px solid #333', width: '80px' }}
                          value={origemUf}
                          onChange={e => {
                            setOrigemUf(e.target.value)
                            setOrigemMun(CITIES_BY_UF[e.target.value][0])
                          }}
                        >
                          {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                        </select>
                        <select
                          className="form-select"
                          style={{ background: '#000', color: '#fff', border: '1px solid #333', flex: 1 }}
                          value={origemMun}
                          onChange={e => setOrigemMun(e.target.value)}
                        >
                          {CITIES_BY_UF[origemUf]?.map((c: string) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input
                          type="text"
                          placeholder="CEP Origem"
                          className="form-control"
                          style={{ background: '#000', color: '#fff', border: '1px solid #333', width: '110px', fontSize: '0.8rem' }}
                          value={cepOrigem}
                          onChange={e => setCepOrigem(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ color: '#fff' }}>Destino (Estado / Cidade / CEP)</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                          className="form-select"
                          style={{ background: '#000', color: '#fff', border: '1px solid #333', width: '80px' }}
                          value={destinoUf}
                          onChange={e => {
                            setDestinoUf(e.target.value)
                            setDestinoMun(CITIES_BY_UF[e.target.value][0])
                          }}
                        >
                          {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                        </select>
                        <select
                          className="form-select"
                          style={{ background: '#000', color: '#fff', border: '1px solid #333', flex: 1 }}
                          value={destinoMun}
                          onChange={e => setDestinoMun(e.target.value)}
                        >
                          {CITIES_BY_UF[destinoUf]?.map((c: string) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input
                          type="text"
                          placeholder="CEP Destino"
                          className="form-control"
                          style={{ background: '#000', color: '#fff', border: '1px solid #333', width: '110px', fontSize: '0.8rem' }}
                          value={cepDestino}
                          onChange={e => setCepDestino(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#0a0a0a', padding: '10px 14px', borderRadius: '6px', fontSize: '0.8rem', color: '#ccc', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Distância Estimada:</span>
                    <strong>{simulatedDistance} km</strong>
                  </div>
                </div>

                {/* SEÇÃO 3: DATAS & DOCUMENTOS */}
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--primary-500)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>
                    📅 3. DATAS, HORÁRIOS E REQUISITOS
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ color: '#fff' }}>Data de Coleta</label>
                      <input
                        type="date"
                        className="form-input"
                        style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                        value={dataColeta}
                        onChange={e => setDataColeta(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ color: '#fff' }}>Horário de Coleta</label>
                      <select
                        className="form-select"
                        style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                        value={horarioColeta}
                        onChange={e => setHorarioColeta(e.target.value)}
                      >
                        <option value="08h-12h">08h-12h</option>
                        <option value="13h-18h">13h-18h</option>
                        <option value="24h">24h contínuo</option>
                        <option value="Sob agendamento">Sob agendamento</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label" style={{ color: '#fff' }}>Data Limite de Entrega</label>
                    <input
                      type="date"
                      className="form-input"
                      style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                      value={dataEntrega}
                      onChange={e => setDataEntrega(e.target.value)}
                      required
                    />
                  </div>

                  {/* Document Requirements */}
                  <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '6px', padding: '16px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#aaa', display: 'block', marginBottom: '10px' }}>Exigências Documentais OBRIGATÓRIAS</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input type="checkbox" checked={reqRntrc} onChange={e => setReqRntrc(e.target.checked)} disabled /> RNTRC Ativo (obrigatório)
                      </label>
                      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input type="checkbox" checked={reqMopp} onChange={e => setReqMopp(e.target.checked)} /> Curso MOPP (Perigoso)
                      </label>
                      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input type="checkbox" checked={reqCipp} onChange={e => setReqCipp(e.target.checked)} /> CIPP (Tanques/Classe I)
                      </label>
                      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input type="checkbox" checked={reqAppIbama} onChange={e => setReqAppIbama(e.target.checked)} /> CTF/APP IBAMA
                      </label>
                      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input type="checkbox" checked={reqApolice} onChange={e => setReqApolice(e.target.checked)} /> Apólice RC/RCFDC
                      </label>
                      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input type="checkbox" checked={reqPAE} onChange={e => setReqPAE(e.target.checked)} /> PAE Emergência
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ color: '#fff' }}>Observações logísticas</label>
                    <textarea
                      placeholder="Ex: Coleta precisa ser no período da manhã..."
                      className="form-input"
                      maxLength={500}
                      style={{ background: '#000', color: '#fff', border: '1px solid #333', height: '60px', resize: 'none' }}
                      value={observacoes}
                      onChange={e => setObservacoes(e.target.value)}
                    />
                  </div>
                </div>

                {/* SEÇÃO 4: DURAÇÃO LEILÃO */}
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--primary-500)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>
                    ⏱️ 4. DURAÇÃO DA COTAÇÃO
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
                    {['12', '24', '48', '72'].map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setDuracaoLeilao(h)}
                        style={{
                          padding: '8px', fontSize: '0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
                          background: duracaoLeilao === h ? 'var(--primary-500)' : '#1a1a1a',
                          color: duracaoLeilao === h ? '#000' : '#ccc',
                          border: '1px solid #333'
                        }}
                      >
                        {h} horas
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setDuracaoLeilao('custom')}
                      style={{
                        padding: '8px 16px', fontSize: '0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
                        background: duracaoLeilao === 'custom' ? 'var(--primary-500)' : '#1a1a1a',
                        color: duracaoLeilao === 'custom' ? '#000' : '#ccc',
                        border: '1px solid #333'
                      }}
                    >
                      Personalizado
                    </button>
                    {duracaoLeilao === 'custom' && (
                      <input
                        type="number"
                        placeholder="Horas (máx 168h)"
                        className="form-input"
                        style={{ background: '#000', color: '#fff', border: '1px solid #333', padding: '6px 12px', width: '150px' }}
                        value={duracaoPersonalizada}
                        onChange={e => setDuracaoPersonalizada(e.target.value)}
                      />
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <Link href="/" className="btn btn-secondary" style={{ flex: 1, padding: '12px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #333', background: '#1c1c1c' }}>
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!isFormValid || simulating}
                    style={{ flex: 2, padding: '12px', fontSize: '0.9rem', fontWeight: 'bold', color: '#000', background: 'var(--primary-500)' }}
                  >
                    {simulating ? 'Simulando...' : 'Simular Valor'}
                  </button>
                </div>

              </form>

              {/* SIMULATED RESULT SECTION */}
              {simulationDone && (
                <div style={{ marginTop: '24px', background: '#1c1503', border: '1px dashed var(--primary-500)', borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>📊 Estimativa de Mercado RECY</span>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '16px 0', borderBottom: '1px solid #333', paddingBottom: '16px' }}>
                    <div style={{ background: '#121212', padding: '12px', borderRadius: '6px', border: '1px solid #222' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#888' }}>Mínimo Esperado (-10%)</span>
                      <strong style={{ fontSize: '1.25rem', color: '#00ff66', display: 'block', marginTop: '4px' }}>
                        R$ {(simulatedIndexValue * 0.9).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </strong>
                    </div>
                    <div style={{ background: '#121212', padding: '12px', borderRadius: '6px', border: '1px solid #222' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#888' }}>Máximo Esperado (+15%)</span>
                      <strong style={{ fontSize: '1.25rem', color: '#ff5252', display: 'block', marginTop: '4px' }}>
                        R$ {(simulatedIndexValue * 1.15).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </strong>
                    </div>
                  </div>

                  <div style={{ margin: '12px 0' }}>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#888' }}>Índice Médio Base de Frete Materra</span>
                    <strong style={{ fontSize: '1.8rem', color: 'var(--primary-500)', display: 'block', margin: '4px 0' }}>
                      R$ {simulatedIndexValue?.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>Cálculo baseado em {simulatedDistance} km percorrido</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: '#ccc', borderTop: '1px solid #333', paddingTop: '12px', marginBottom: '16px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Transportadoras no estado convidadas:</span>
                      <strong style={{ color: 'var(--primary-500)' }}>47 ativas</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Qualificadas (ANTT + Requisitos):</span>
                      <strong style={{ color: '#00ff66' }}>35 transportadoras</strong>
                    </div>
                  </div>

                  <button
                    onClick={handleOpenCheckout}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '14px', fontSize: '0.95rem', color: '#000', fontWeight: 'bold' }}
                  >
                    Confirmar e Lançar Leilão Reverso →
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT: TRANSPORTER PORTAL & LISTING INVITES */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ background: '#121212', border: '1px solid #333', borderRadius: '12px', padding: '32px' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 900, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ListFilter size={18} /> Convites para Leilão Reverso (Transportadoras)
                </h3>
                <p style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '20px' }}>
                  Abaixo estão os leilões de frete ativos na plataforma compatíveis com a sua região operacional.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {auctions.filter((a: any) => a.status !== 'SUSPENSO').length === 0 ? (
                    <div style={{ border: '1px dashed #222', borderRadius: '8px', padding: '32px', textAlign: 'center' }}>
                      <p style={{ color: '#555', fontSize: '0.85rem', margin: 0 }}>Nenhum leilão de frete ativo no momento.</p>
                    </div>
                  ) : (
                    auctions.filter((a: any) => a.status !== 'SUSPENSO').map((auc: any) => {
                      const hasBid = auc.lances.some((l: any) => l.transportadora_id === currentProfile.id)
                      const isInvited = !isShipper

                      return (
                        <div key={auc.id} style={{ background: '#0a0a0a', border: '1px solid #222', padding: '16px', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                            <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{auc.origem_mun}/{auc.origem_uf} → {auc.destino_mun}/{auc.destino_uf}</strong>
                            {auc.status === 'Finalizado' ? (
                              <span style={{ fontSize: '0.65rem', color: '#00ff66', background: 'rgba(0,255,102,0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>FINALIZADO</span>
                            ) : (
                              <span style={{ fontSize: '0.7rem', color: 'var(--primary-500)', fontWeight: 'bold' }}>⏱️ {auc.duracao_leilao_horas}h</span>
                            )}
                          </div>

                          <p style={{ fontSize: '0.75rem', color: '#aaa', margin: '0 0 12px 0' }}>
                            Material: {auc.tipo_carga} ({auc.quantidade} {auc.unidade})<br />
                            Caminhão: {auc.tipo_caminhao}<br />
                            Valor Estimado: R$ {auc.valor_estimado?.toLocaleString('pt-BR')}
                          </p>

                          {isInvited ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <Link
                                href={`/frete?id=${auc.id}`}
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '6px 12px', fontSize: '0.75rem', color: '#000', textAlign: 'center', fontWeight: 'bold' }}
                              >
                                {hasBid ? '⚡ Alterar Lance' : '✅ PARTICIPAR'}
                              </Link>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #222', paddingTop: '8px', fontSize: '0.75rem' }}>
                              <span style={{ color: '#555' }}>Participantes: {auc.participantes?.length || 3}</span>
                              <Link href={`/frete?id=${auc.id}`} style={{ color: 'var(--primary-500)', textDecoration: 'none' }}>Entrar na Sala →</Link>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* CHECKOUT MODAL (TAXA LEAD INITIAL) */}
      {showCheckout && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '20px'
        }}>
          <div style={{
            background: '#121212', border: '2px solid var(--primary-500)', borderRadius: '16px',
            width: '100%', maxWidth: '480px', padding: '32px', position: 'relative', boxShadow: '0 0 30px rgba(255,215,0,0.15)'
          }}>
            <button onClick={() => setShowCheckout(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#aaa', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            
            {checkoutStep === 'pay' ? (
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>
                  💳 TAXA LEAD PARA INICIAR LEILÃO REVERSO
                </h3>
                
                <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '8px', padding: '16px', marginBottom: '20px', fontSize: '0.8rem', color: '#ccc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Origem/Destino:</span>
                    <strong style={{ color: '#fff' }}>{origemMun}/{origemUf} → {destinoMun}/{destinoUf}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Distância:</span>
                    <span>{simulatedDistance} km</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Veículo / Carga:</span>
                    <span>{tipoCaminhao} / {quantidade} {unidade}</span>
                  </div>
                  
                  <div style={{ background: '#0c0c0c', border: '1px solid #222', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#ccc' }}>Taxa de Início Padrão:</span>
                      <strong style={{ fontSize: '0.9rem', color: '#fff' }}>R$ 35,00</strong>
                    </div>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', color: '#aaa', borderTop: '1px solid #222', paddingTop: '10px', marginTop: '10px' }}>
                      <input
                        type="checkbox"
                        checked={leilaoCego}
                        onChange={e => setLeilaoCego(e.target.checked)}
                        style={{ accentColor: 'var(--primary-500)' }}
                      />
                      <span>Ativar Leilão às Cegas (+ R$ 25,00)</span>
                    </label>
                  </div>

                  <div style={{ textAlign: 'center', border: '1px dashed #444', padding: '16px', borderRadius: '8px', background: '#0c0c0c', marginBottom: '20px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#aaa', display: 'block', textTransform: 'uppercase' }}>Valor Total do Pix</span>
                    <strong style={{ fontSize: '2rem', color: 'var(--primary-500)', display: 'block', margin: '4px 0' }}>
                      R$ {leilaoCego ? '60,00' : '35,00'}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#555' }}>Libera 1 contato da melhor transportadora gratuitamente</span>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setShowCheckout(false)} className="btn btn-secondary" style={{ flex: 1, padding: '12px', border: '1px solid #333' }}>Cancelar</button>
                    <button onClick={handleConfirmLeadFee} className="btn btn-primary" style={{ flex: 2, padding: '12px', color: '#000', fontWeight: 'bold', background: 'var(--primary-500)' }}>Pagar R$ {leilaoCego ? '60,00' : '35,00'} (Pix)</button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>✅</div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                  LEILÃO REVERSO INICIADO!
                </h3>
                <p style={{ color: '#aaa', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '24px' }}>
                  O pagamento da Taxa Lead foi recebido. Convites eletrônicos foram enviados a 35 transportadoras credenciadas. Elas estão ativas e enviando propostas!
                </p>

                <div style={{ background: '#0a0a0a', padding: '16px', borderRadius: '8px', border: '1px solid #222', marginBottom: '24px', fontSize: '0.8rem', color: '#ccc' }}>
                  <span>Melhor Preço Inicial:</span>
                  <strong style={{ color: '#00ff66', display: 'block', fontSize: '1.25rem', marginTop: '4px' }}>R$ 18.500</strong>
                </div>

                <button
                  onClick={() => {
                    setShowCheckout(false)
                    router.push(`/frete?id=${createdRoomId}`)
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', color: '#000', fontWeight: 'bold' }}
                >
                  🚪 Entrar no Leilão
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADDITIONAL CONTACTS UNLOCK MODAL */}
      {showMultiUnlock && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '20px'
        }}>
          <div style={{
            background: '#121212', border: '2px solid var(--primary-500)', borderRadius: '16px',
            width: '100%', maxWidth: '450px', padding: '32px', position: 'relative', boxShadow: '0 0 30px rgba(255,215,0,0.15)'
          }}>
            <button onClick={() => setShowMultiUnlock(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#aaa', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
              💳 DESBLOQUEAR CONTATO ADICIONAL
            </h3>
            
            <p style={{ color: '#aaa', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '20px' }}>
              Para visualizar o contato completo da transportadora (telefone e e-mail), confirme o pagamento da Taxa Lead adicional.
            </p>

            <div style={{ background: '#0a0a0a', padding: '16px', borderRadius: '8px', border: '1px solid #222', textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Valor por Contato</span>
              <strong style={{ display: 'block', fontSize: '2rem', color: '#fff', marginTop: '4px' }}>R$ 15,00</strong>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowMultiUnlock(false)} className="btn btn-secondary" style={{ flex: 1, padding: '12px', border: '1px solid #333' }}>Cancelar</button>
              <button onClick={() => handleConfirmMultiUnlock(activeRoom)} className="btn btn-primary" style={{ flex: 2, padding: '12px', color: '#000', fontWeight: 'bold', background: 'var(--primary-500)' }}>Pagar e Desbloquear (R$ 15)</button>
            </div>
          </div>
        </div>
      )}

      {/* CARRIER ACTIVATION FEE MODAL */}
      {showCarrierActivation && activatingRoom && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '20px'
        }}>
          <div style={{
            background: '#121212', border: '2px solid var(--primary-500)', borderRadius: '16px',
            width: '100%', maxWidth: '450px', padding: '32px', position: 'relative', boxShadow: '0 0 30px rgba(255,215,0,0.15)'
          }}>
            <button onClick={() => setShowCarrierActivation(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#aaa', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
              💳 TAXA DE ATIVAÇÃO COMERCIAL (TRANSPORTADORA)
            </h3>
            
            <p style={{ color: '#aaa', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '20px' }}>
              Para visualizar os dados de contato do fornecedor e finalizar o carregamento da carga, confirme o pagamento da taxa de ativação.
            </p>

            <div style={{ background: '#0a0a0a', padding: '16px', borderRadius: '8px', border: '1px solid #222', textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Valor da Taxa</span>
              <strong style={{ display: 'block', fontSize: '2rem', color: '#fff', marginTop: '4px' }}>R$ 35,00</strong>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowCarrierActivation(false)} className="btn btn-secondary" style={{ flex: 1, padding: '12px', border: '1px solid #333' }}>Cancelar</button>
              <button onClick={() => handleConfirmCarrierActivation(activatingRoom)} className="btn btn-primary" style={{ flex: 2, padding: '12px', color: '#000', fontWeight: 'bold', background: 'var(--primary-500)' }}>Pagar e Ativar (Pix)</button>
            </div>
          </div>
        </div>
      )}

      {/* BYPASS LOGISTICS MODAL (FURAR FILA - R$ 80,00) */}
      {showBypassModal && activatingRoom && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '20px'
        }}>
          <div style={{
            background: '#121212', border: '2px solid var(--primary-500)', borderRadius: '16px',
            width: '100%', maxWidth: '450px', padding: '32px', position: 'relative', boxShadow: '0 0 30px rgba(255,215,0,0.15)'
          }}>
            <button onClick={() => setShowBypassModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#aaa', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
              💳 FURAR FILA DO FRETE (SUPER CONTATO)
            </h3>
            
            <p style={{ color: '#aaa', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '20px' }}>
              Ao furar a fila do frete, você encerra a disputa imediatamente, se torna a transportadora vencedora e libera contatos diretos com o dono da carga.
            </p>

            <div style={{ background: '#0a0a0a', padding: '16px', borderRadius: '8px', border: '1px solid #222', textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>Valor do Super Contato</span>
              <strong style={{ display: 'block', fontSize: '2rem', color: '#fff', marginTop: '4px' }}>R$ 80,00</strong>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowBypassModal(false)} className="btn btn-secondary" style={{ flex: 1, padding: '12px', border: '1px solid #333' }}>Cancelar</button>
              <button onClick={() => handleConfirmBypass(activatingRoom)} className="btn btn-primary" style={{ flex: 2, padding: '12px', color: '#000', fontWeight: 'bold', background: 'var(--primary-500)' }}>Pagar R$ 80 (Pix)</button>
            </div>
          </div>
        </div>
      )}

      {/* HISTÓRICO | AUDIT TRAIL | CONTATOS (Cofre) */}
      <div style={{ background: '#0a0a0a', borderTop: '2px solid #333', padding: '32px 0', marginTop: '48px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ borderBottom: '1px solid #222', paddingBottom: '12px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#888', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
              🔒 HISTÓRICO | AUDIT TRAIL | CONTATOS (Cofre Logístico)
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#555', margin: '4px 0 0 0' }}>
              Contratos encerrados, auditoria de lances e trilha de compliance de logística.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <h4 style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '12px', textTransform: 'uppercase' }}>Cofre de Operações</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {auctions.filter((a: any) => a.status === 'SUSPENSO').length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: '#444', fontStyle: 'italic' }}>Nenhum contrato arquivado no cofre de fretes.</p>
                ) : (
                  auctions.filter((a: any) => a.status === 'SUSPENSO').map((auc: any) => (
                    <div key={auc.id} style={{ background: '#121212', border: '1px solid #222', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{auc.origem_mun}/{auc.origem_uf} → {auc.destino_mun}/{auc.destino_uf}</strong>
                        <span style={{ fontSize: '0.7rem', color: '#00ff66', background: 'rgba(0,255,102,0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>CONTRATO ATIVADO</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#aaa', margin: 0, lineHeight: 1.4 }}>
                        Carga: {auc.tipo_carga} ({auc.quantidade} {auc.unidade})<br />
                        Veículo contratado: {auc.tipo_caminhao}<br />
                        Valor fechado: R$ {auc.lances.find((l: any) => l.transportadora_id === auc.transportadora_vencedora_id)?.preco?.toLocaleString('pt-BR') || auc.valor_estimado?.toLocaleString('pt-BR')}<br />
                        <span style={{ color: '#555', fontSize: '0.65rem', display: 'block', marginTop: '6px' }}>Cod. ID: {auc.id}</span>
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '12px', textTransform: 'uppercase' }}>Trilha de Auditoria Compliance</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                {(() => {
                  try {
                    const localTrail = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('materra_compliance_audit_trail') || '[]' : '[]')
                    const logs = localTrail.filter((t: any) => t.event_category === 'Logística' || t.entity_type === 'Frete Reverso')
                    if (logs.length === 0) return <p style={{ fontSize: '0.8rem', color: '#444', fontStyle: 'italic' }}>Nenhum log de conformidade registrado.</p>
                    return logs.map((log: any, idx: number) => (
                      <div key={idx} style={{ background: '#0a0a0a', borderLeft: '3px solid var(--primary-500)', padding: '10px', fontSize: '0.75rem', color: '#ccc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '0.65rem', marginBottom: '4px' }}>
                          <span>{log.actor} ({log.action})</span>
                          <span>{new Date(log.timestamp).toLocaleTimeString('pt-BR')}</span>
                        </div>
                        <p style={{ margin: 0 }}>{log.details}</p>
                        <span style={{ fontSize: '0.65rem', color: '#00ff66', display: 'block', marginTop: '4px' }}>🔒 {log.status} ({log.hash})</span>
                      </div>
                    ))
                  } catch (e) {
                    return null
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* spacer to avoid content being covered by the switcher */}
      <div style={{ height: '90px' }} />

      {/* TRILATERAL TEST SWITCHER */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#0d0d0d', borderTop: '2px solid var(--primary-500)',
        padding: '12px 24px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', zIndex: 1000, boxShadow: '0 -4px 20px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-500)', letterSpacing: '0.5px' }}>
            AMBIENTE DE TESTE TRILATERAL:
          </span>
          <span style={{ fontSize: '0.8rem', color: '#aaa' }}>
            Alterne o usuário ativo para simular lances de frete e desbloqueios de contatos de transporte.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => handleSwitchProfile('anunciante')}
            style={{
              padding: '6px 14px', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
              background: currentUser?.id === MOCK_TRANSPORTS.anunciante.id ? 'var(--primary-500)' : '#222',
              color: currentUser?.id === MOCK_TRANSPORTS.anunciante.id ? '#000' : '#ccc',
              border: '1px solid #333'
            }}
          >
            🏢 Cliente Shipper: ABC Indústria (Fornecedor)
          </button>
          <button
            onClick={() => handleSwitchProfile('transpA')}
            style={{
              padding: '6px 14px', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
              background: currentUser?.id === MOCK_TRANSPORTS.transpA.id ? 'var(--primary-500)' : '#222',
              color: currentUser?.id === MOCK_TRANSPORTS.transpA.id ? '#000' : '#ccc',
              border: '1px solid #333'
            }}
          >
            🚚 Transp A: Alfa Ltda (Ouro)
          </button>
          <button
            onClick={() => handleSwitchProfile('transpB')}
            style={{
              padding: '6px 14px', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
              background: currentUser?.id === MOCK_TRANSPORTS.transpB.id ? 'var(--primary-500)' : '#222',
              color: currentUser?.id === MOCK_TRANSPORTS.transpB.id ? '#000' : '#ccc',
              border: '1px solid #333'
            }}
          >
            🚚 Transp B: Beta S/A (Prata)
          </button>
        </div>
      </div>

    </div>
  )
}

export default function FretePage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '16px', background: '#000', color: '#fff' }}>
        <p style={{ color: '#aaa' }}>Carregando dados da rota...</p>
      </div>
    }>
      <FreteContent />
    </Suspense>
  )
}
