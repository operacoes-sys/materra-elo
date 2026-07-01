'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  MapPin, Shield, Info, Calendar, Clock, Lock, Unlock, FileText, CheckCircle,
  AlertTriangle, Send, ArrowUpRight, ArrowDownRight, Percent, Truck, Copy,
  ExternalLink, AlertCircle, RefreshCw, X, Check, Award, Plus
} from 'lucide-react'

// Helper to calculate time left
const calculateTimeLeft = (endTimeStr: string) => {
  const diff = new Date(endTimeStr).getTime() - new Date().getTime()
  if (diff <= 0) return 'Leilão Encerrado'

  const d = Math.floor(diff / (1000 * 60 * 60 * 24))
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const s = Math.floor((diff % (1000 * 60)) / 1000)

  if (d > 0) {
    return `${d}d ${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`
  }
  return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
}

function NegotiationRoomContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const roomId = searchParams.get('id') || 'demo_room'

  // Dynamic state
  const [room, setRoom] = useState<any>(null)
  const [ad, setAd] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentProfile, setCurrentProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Real bilateral profiles states
  const [anuncianteProfile, setAnuncianteProfile] = useState<any>(null)
  const [proponenteProfile, setProponenteProfile] = useState<any>(null)
  const [representedCompany, setRepresentedCompany] = useState<any>(null)

  // Rating modal states
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [ratingStars, setRatingStars] = useState(5)
  const [ratingComment, setRatingComment] = useState('')
  const [ratingRecommend, setRatingRecommend] = useState(true)
  const [hasRated, setHasRated] = useState(false)

  // Form states inside chat
  const [messageText, setMessageText] = useState('')
  const [bidPrice, setBidPrice] = useState('')
  const [bidQty, setBidQty] = useState('')
  const [showBidForm, setShowBidForm] = useState(false)
  const [showCounterForm, setShowCounterForm] = useState(false)
  const [counterPrice, setCounterPrice] = useState('')
  const [counterQty, setCounterQty] = useState('')

  // Timer state
  const [timeLeftText, setTimeLeftText] = useState('Calculando...')

  const chatEndRef = useRef<HTMLDivElement>(null)

  // Bilateral profile constants for demo/switchers
  const MOCK_PROFILES = {
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
    interessado1: {
      id: 'xyz-reciclagem-id',
      nome_ou_razao: 'XYZ Reciclagem Ltda',
      tipo_parte: 'Comprador',
      subtipo: 'Empresa',
      nivel_selo: 'Bronze',
      score_0a100: 45,
      whatsapp: '+55 11 8888-8888',
      email: 'negocio@xyz.com.br',
      cidade: 'São Paulo',
      uf: 'SP',
      endereco: 'Av. Industrial, 456 - Lapa',
      responsavel: 'Maria Santos'
    },
    interessado2: {
      id: 'mno-processadora-id',
      nome_ou_razao: 'MNO Processadora S/A',
      tipo_parte: 'Comprador',
      subtipo: 'Empresa',
      nivel_selo: 'Prata',
      score_0a100: 75,
      whatsapp: '+55 21 9999-9999',
      email: 'compras@mno.com',
      cidade: 'Rio de Janeiro',
      uf: 'RJ',
      endereco: 'Rodovia Washington Luiz, km 12 - Duque de Caxias',
      responsavel: 'José Oliveira'
    }
  }

  // Load profile and room data
  const loadData = async () => {
    setLoading(true)
    try {
      // 1. Load active user session from localStorage
      let localUser = null
      let localProfile = null
      try {
        const u = localStorage.getItem('materra_user')
        const p = localStorage.getItem('materra_profile')
        if (u) localUser = JSON.parse(u)
        if (p) localProfile = JSON.parse(p)
      } catch (e) {
        console.warn(e)
      }

      if (!localUser || !localProfile) {
        // Default to proponente 1 for demo if none logged in
        localUser = { id: MOCK_PROFILES.interessado1.id, email: MOCK_PROFILES.interessado1.email }
        localProfile = MOCK_PROFILES.interessado1
        localStorage.setItem('materra_user', JSON.stringify(localUser))
        localStorage.setItem('materra_profile', JSON.stringify(localProfile))
      }
      setCurrentUser(localUser)
      setCurrentProfile(localProfile)

      // 2. Load room from localStorage
      const activeRoomsStr = localStorage.getItem('materra_active_negotiations') || '[]'
      const activeRooms = JSON.parse(activeRoomsStr)
      let currentRoom = activeRooms.find((r: any) => r.id === roomId)

      // Fallback demo room
      if (!currentRoom || roomId === 'demo_room') {
        currentRoom = {
          id: 'demo_room',
          id_anuncio: 'demo_ad_1',
          id_proponente: MOCK_PROFILES.interessado1.id,
          proponente_nome: MOCK_PROFILES.interessado1.nome_ou_razao,
          proponente_selo: MOCK_PROFILES.interessado1.nivel_selo,
          proponente_score: MOCK_PROFILES.interessado1.score_0a100,
          created_at: new Date().toISOString(),
          status: 'Ativa', // Ativa, Fechada, Rejeitada
          taxa_lead_paga: true,
          taxa_lead_valor: 80,
          mensagens: [
            {
              id: 'msg_init',
              remetente_id: MOCK_PROFILES.interessado1.id,
              remetente_nome: MOCK_PROFILES.interessado1.nome_ou_razao,
              texto: 'Tenho interesse em 30 t ao preço de R$ 350,00/t',
              tipo: 'PROPOSTA_INICIAL',
              quantidade: 30,
              preco: 350,
              timestamp: new Date(Date.now() - 3600000).toISOString()
            }
          ]
        }
      }
      setRoom(currentRoom)

      // 3. Load corresponding advertisement
      const localAdsStr = localStorage.getItem('materra_local_anuncios') || '[]'
      const localAds = JSON.parse(localAdsStr)
      let currentAd = localAds.find((a: any) => a.id === currentRoom.id_anuncio)

      if (!currentAd) {
        // Fallback demo ad matching Case A: Ascending Auction
        currentAd = {
          id: 'demo_ad_1',
          codigo: 'FE-320',
          titulo: 'Aparas de ferro limpas - São Paulo SP',
          tipo_anuncio: 'Oferta',
          forma_cobranca: 'Pago pela destinação',
          duracao_leilao_horas: 24,
          data_inicio_leilao: new Date().toISOString(),
          // Ends tomorrow
          data_fim_leilao: new Date(Date.now() + 86400000).toISOString(),
          categoria: 'Metalurgia / Siderurgia',
          residuo: 'Aparas de ferro limpas',
          prazo_recorrencia: '12 meses',
          codigo_ibama: '12 01 01',
          classe: 'Classe IIB – inerte',
          estado_fisico: 'Sólido',
          quantidade: 30,
          unidade: 't',
          frequencia: 'Mensal',
          acondicionamento: 'Caçamba metálica',
          cep: '01311-200',
          uf: 'SP',
          municipio: 'São Paulo',
          origem_processo: 'Processo de corte e usinagem industrial de perfis de aço estrutural.',
          valor_desejado: 320,
          valor_index: 340,
          tipo_leilao: 'Ascendente',
          tem_licenca: true,
          urgencia_prazo: 'Normal',
          status: 'Em negociação',
          observacoes: 'Documentos: Licença de Operação | Contraparte arca com o frete',
          quem_arca_frete: 'CONTRAPARTE',
          selo_minimo: 'Prata',
          score_minimo: 50,
          documentos_solicitados: ['Licença Ambiental válida', 'Registro RNTRC (transportadora)'],
          id_cadastro: MOCK_PROFILES.anunciante.id,
          cadastros: MOCK_PROFILES.anunciante
        }
      }
      setAd(currentAd)

      // Resolve advertiser profile
      let resolvedAdvertiser = MOCK_PROFILES.anunciante
      if (currentAd) {
        if (localProfile && localProfile.id === currentAd.id_cadastro) {
          resolvedAdvertiser = localProfile
        } else if (currentAd.cadastros) {
          resolvedAdvertiser = currentAd.cadastros
        } else if (currentAd.id_cadastro) {
          try {
            const { data } = await supabase.from('cadastros').select('*').eq('id', currentAd.id_cadastro).maybeSingle()
            if (data) resolvedAdvertiser = data
          } catch (e) {}
        }
      }
      setAnuncianteProfile(resolvedAdvertiser)

      // Resolve proponente profile
      let resolvedProponente = currentRoom.id_proponente === MOCK_PROFILES.interessado2.id ? MOCK_PROFILES.interessado2 : MOCK_PROFILES.interessado1
      if (currentRoom) {
        if (localProfile && localProfile.id === currentRoom.id_proponente) {
          resolvedProponente = localProfile
        } else if (currentRoom.id_proponente) {
          try {
            const { data } = await supabase.from('cadastros').select('*').eq('id', currentRoom.id_proponente).maybeSingle()
            if (data) resolvedProponente = data
          } catch (e) {}
        }
      }
      setProponenteProfile(resolvedProponente)

      // Resolve represented company
      if (currentAd && currentAd.id_ficha_empresa) {
        try {
          const { data } = await supabase.from('fichas_empresa_representada').select('*').eq('id', currentAd.id_ficha_empresa).maybeSingle()
          if (data) setRepresentedCompany(data)
        } catch (e) {}
      } else if (currentAd && currentAd.fichas_empresa_representada) {
        setRepresentedCompany(currentAd.fichas_empresa_representada)
      } else {
        setRepresentedCompany(null)
      }

      // Check if already rated in local storage
      try {
        const ratings = JSON.parse(localStorage.getItem('materra_deal_ratings') || '[]')
        const rated = ratings.some((r: any) => r.room_id === currentRoom.id && r.user_id === localUser?.id)
        setHasRated(rated)
      } catch (e) {}

      // Initialize inputs with current ref prices
      setBidPrice(String(currentAd.valor_desejado))
      setBidQty(String(currentAd.quantidade))
      setCounterPrice(String(currentAd.valor_desejado))
      setCounterQty(String(currentAd.quantidade))

    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [roomId])

  // Real-time subscription to anuncios_lances
  useEffect(() => {
    if (!ad || !ad.id || !room) return

    const channel = supabase
      .channel(`lances-ad-${ad.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'anuncios_lances',
        filter: `id_anuncio=eq.${ad.id}`
      }, async (payload: any) => {
        const newBid = payload.new
        // Check if we already have it in local messages
        const exists = room.mensagens.some((m: any) => m.id === `msg_bid_db_${newBid.id}`)
        if (!exists) {
          // Resolve name
          const { data: userCad } = await supabase
            .from('cadastros')
            .select('nome_ou_razao')
            .eq('id', newBid.id_usuario)
            .single()

          const bidderName = userCad?.nome_ou_razao || 'Interessado'
          const newMsg = {
            id: `msg_bid_db_${newBid.id}`,
            remetente_id: newBid.id_usuario,
            remetente_nome: bidderName,
            texto: `Nova Oferta: ${ad.quantidade || 20} ${ad.unidade || 't'} ao preço de R$ ${Number(newBid.valor_lance).toLocaleString('pt-BR', {minimumFractionDigits:2})}/${ad.unidade || 't'}`,
            tipo: 'PROPOSTA_INTERESSADO',
            quantidade: ad.quantidade || 20,
            preco: Number(newBid.valor_lance),
            timestamp: newBid.timestamp || new Date().toISOString()
          }

          updateRoomState({
            ...room,
            mensagens: [...room.mensagens, newMsg]
          })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [ad, room])

  // Countdown timer effect
  useEffect(() => {
    if (!ad || !(ad.data_fim_real || ad.data_fim_leilao)) return

    const updateTimer = () => {
      setTimeLeftText(calculateTimeLeft(ad.data_fim_real || ad.data_fim_leilao))
    }
    updateTimer()
    const timerId = setInterval(updateTimer, 1000)
    return () => clearInterval(timerId)
  }, [ad])

  // Scroll chat to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [room?.mensagens])

  // Switcher profile action
  const handleSwitchProfile = (roleKey: 'anunciante' | 'interessado1' | 'interessado2') => {
    const targetProfile = MOCK_PROFILES[roleKey]
    const targetUser = { id: targetProfile.id, email: targetProfile.email }
    localStorage.setItem('materra_user', JSON.stringify(targetUser))
    localStorage.setItem('materra_profile', JSON.stringify(targetProfile))
    
    setCurrentUser(targetUser)
    setCurrentProfile(targetProfile)
    
    // Refresh room proponente info if we switched to interested 2
    if (roleKey === 'interessado2' && room && room.id_proponente !== MOCK_PROFILES.interessado2.id) {
      // Create a separate room for proponente 2 in our active negotiations index
      const activeRoomsStr = localStorage.getItem('materra_active_negotiations') || '[]'
      const activeRooms = JSON.parse(activeRoomsStr)
      let room2 = activeRooms.find((r: any) => r.id_anuncio === ad.id && r.id_proponente === MOCK_PROFILES.interessado2.id)
      
      if (!room2) {
        room2 = {
          id: 'room_interessado2',
          id_anuncio: ad.id,
          id_proponente: MOCK_PROFILES.interessado2.id,
          proponente_nome: MOCK_PROFILES.interessado2.nome_ou_razao,
          proponente_selo: MOCK_PROFILES.interessado2.nivel_selo,
          proponente_score: MOCK_PROFILES.interessado2.score_0a100,
          created_at: new Date().toISOString(),
          status: 'Ativa',
          taxa_lead_paga: true,
          taxa_lead_valor: 80,
          mensagens: [
            {
              id: 'msg_init2',
              remetente_id: MOCK_PROFILES.interessado2.id,
              remetente_nome: MOCK_PROFILES.interessado2.nome_ou_razao,
              texto: 'Tenho interesse na doação/venda de Aparas de ferro. Proposta de R$ 340,00/t',
              tipo: 'PROPOSTA_INICIAL',
              quantidade: ad.quantidade,
              preco: 340,
              timestamp: new Date().toISOString()
            }
          ]
        }
        activeRooms.push(room2)
        localStorage.setItem('materra_active_negotiations', JSON.stringify(activeRooms))
      }
      
      // Redirect to the room for proponente 2
      router.push(`/sala?id=${room2.id}`)
    } else if (roleKey === 'interessado1' && room && room.id === 'room_interessado2') {
      router.push(`/sala?id=demo_room`)
    }
  }

  // Send simple text message
  const handleSendMessage = () => {
    if (!messageText.trim() || !room || !currentUser) return

    const newMsg = {
      id: 'msg_' + Date.now(),
      remetente_id: currentUser.id,
      remetente_name: currentProfile.nome_ou_razao,
      texto: messageText.trim(),
      tipo: 'CHAT',
      timestamp: new Date().toISOString()
    }

    const updatedRoom = {
      ...room,
      mensagens: [...room.mensagens, newMsg]
    }

    updateRoomState(updatedRoom)
    setMessageText('')
  }

  // Update room state in State & LocalStorage
  const updateRoomState = (updatedRoom: any) => {
    setRoom(updatedRoom)
    try {
      const activeRoomsStr = localStorage.getItem('materra_active_negotiations') || '[]'
      let activeRooms = JSON.parse(activeRoomsStr)
      const index = activeRooms.findIndex((r: any) => r.id === updatedRoom.id)
      if (index !== -1) {
        activeRooms[index] = updatedRoom
      } else {
        activeRooms.push(updatedRoom)
      }
      localStorage.setItem('materra_active_negotiations', JSON.stringify(activeRooms))
    } catch (e) {
      console.warn(e)
    }
  }

  // Helper to check if rule is violated and anti-snipe triggers
  const checkAntiSnipeAndSubmit = (newProposalMsg: any) => {
    if (!ad || !room) return

    let updatedAd = { ...ad }
    let antiSnipeTriggered = false

    if (ad.data_fim_leilao) {
      const endTime = new Date(ad.data_fim_leilao).getTime()
      const now = new Date().getTime()
      const diffMinutes = (endTime - now) / (1000 * 60)

      // If anti-snipe active and within last 15 minutes, extend by +15 minutes
      if (diffMinutes > 0 && diffMinutes <= 15) {
        const newEndTime = new Date(endTime + 15 * 60 * 1000).toISOString()
        updatedAd.data_fim_leilao = newEndTime
        antiSnipeTriggered = true

        // Update ad in localStorage
        try {
          const localAdsStr = localStorage.getItem('materra_local_anuncios') || '[]'
          let localAds = JSON.parse(localAdsStr)
          const adIdx = localAds.findIndex((a: any) => a.id === ad.id)
          if (adIdx !== -1) {
            localAds[adIdx].data_fim_leilao = newEndTime
            localStorage.setItem('materra_local_anuncios', JSON.stringify(localAds))
          }
        } catch (e) {
          console.warn(e)
        }
        setAd(updatedAd)
      }
    }

    const newMsgs = [...room.mensagens, newProposalMsg]
    if (antiSnipeTriggered) {
      newMsgs.push({
        id: 'msg_snipe_' + Date.now(),
        remetente_id: 'SYSTEM',
        remetente_nome: 'Sistema Materra Elo',
        texto: '⏱️ Regra Anti-Snipe acionada! Nova proposta realizada nos 15 minutos finais estendeu o encerramento do leilão por mais +15 minutos.',
        tipo: 'AVISO_SISTEMA',
        timestamp: new Date().toISOString()
      })
    }

    updateRoomState({
      ...room,
      mensagens: newMsgs
    })
  }

  // Submit Bid (From Interested/Bidder)
  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!room || !ad || !currentUser) return

    const price = Number(bidPrice)
    const qty = Number(bidQty)

    if (isNaN(price) || isNaN(qty) || price <= 0 || qty <= 0) {
      alert('Por favor, informe valores válidos.')
      return
    }

    try {
      // Atomic verification in public.anuncios_lances
      const { data: latestBids, error: errLatest } = await supabase
        .from('anuncios_lances')
        .select('valor_lance')
        .eq('id_anuncio', ad.id)
        .order('timestamp', { ascending: false })
        .limit(1)

      if (errLatest) throw errLatest

      const lastPrice = latestBids && latestBids.length > 0
        ? Number(latestBids[0].valor_lance)
        : Number(ad.valor_desejado)

      if (ad.tipo_anuncio === 'Oferta') {
        if (price <= lastPrice) {
          alert(`Seu lance de R$ ${price.toLocaleString('pt-BR')} deve ser maior que o lance atual (R$ ${lastPrice.toLocaleString('pt-BR')}).`)
          return
        }
      } else {
        if (price >= lastPrice) {
          alert(`Seu lance de R$ ${price.toLocaleString('pt-BR')} deve ser menor que o lance atual (R$ ${lastPrice.toLocaleString('pt-BR')}).`)
          return
        }
      }

      // Insert lance to database
      const { data: newBidData, error: errInsert } = await supabase
        .from('anuncios_lances')
        .insert([{
          id_anuncio: ad.id,
          id_usuario: currentUser.id,
          valor_lance: price
        }])
        .select()
        .single()

      if (errInsert) throw errInsert

      const newMsg = {
        id: `msg_bid_db_${newBidData.id}`,
        remetente_id: currentUser.id,
        remetente_nome: currentProfile.nome_ou_razao,
        texto: `Nova Oferta: ${qty} ${ad.unidade} ao preço de R$ ${price.toLocaleString('pt-BR', {minimumFractionDigits:2})}/${ad.unidade}`,
        tipo: 'PROPOSTA_INTERESSADO',
        quantidade: qty,
        preco: price,
        timestamp: new Date().toISOString()
      }

      checkAntiSnipeAndSubmit(newMsg)
      setShowBidForm(false)

    } catch (err: any) {
      alert('Erro ao enviar lance: ' + err.message)
    }
  }

  // Submit Counter-proposal (From Advertiser/Anunciante)
  const handleSubmitCounter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!room || !ad || !currentUser) return

    const price = Number(counterPrice)
    const qty = Number(counterQty)

    if (isNaN(price) || isNaN(qty) || price <= 0 || qty <= 0) {
      alert('Por favor, informe valores válidos.')
      return
    }

    const newMsg = {
      id: 'msg_counter_' + Date.now(),
      remetente_id: currentUser.id,
      remetente_nome: currentProfile.nome_ou_razao,
      texto: `Contraproposta do Anunciante: ${qty} ${ad.unidade} a R$ ${price.toLocaleString('pt-BR', {minimumFractionDigits:2})}/${ad.unidade}`,
      tipo: 'CONTRAPROPOSTA_ANUNCIANTE',
      quantidade: qty,
      preco: price,
      timestamp: new Date().toISOString()
    }

    checkAntiSnipeAndSubmit(newMsg)
    setShowCounterForm(false)
  }

  // Save Rating Action
  const handleSaveRating = () => {
    if (!room || !currentUser) return
    const newRating = {
      room_id: room.id,
      user_id: currentUser.id,
      stars: ratingStars,
      comment: ratingComment,
      recommend: ratingRecommend,
      created_at: new Date().toISOString()
    }
    
    try {
      const ratings = JSON.parse(localStorage.getItem('materra_deal_ratings') || '[]')
      ratings.push(newRating)
      localStorage.setItem('materra_deal_ratings', JSON.stringify(ratings))
      
      // Save rating to audit trail
      const auditTrail = JSON.parse(localStorage.getItem('materra_compliance_audit_trail') || '[]')
      auditTrail.unshift({
        event_type: 'MUTUAL_RATING_SUBMITTED',
        event_category: 'Reputação',
        action: 'SUBMIT_RATING',
        entity_type: 'Negociação',
        entity_id: room.id,
        actor: currentProfile?.nome_ou_razao || 'Membro',
        details: `Avaliação de ${ratingStars} estrelas enviada para a contraparte no acordo da sala #${room.id.substring(0,6)}. Recomenda: ${ratingRecommend ? 'Sim' : 'Não'}.`,
        timestamp: new Date().toISOString(),
        status: 'Íntegro',
        hash: 'SHA256-' + Math.random().toString(36).substring(2, 15)
      })
      localStorage.setItem('materra_compliance_audit_trail', JSON.stringify(auditTrail))
    } catch(e) {
      console.warn(e)
    }
    
    setHasRated(true)
    setShowRatingModal(false)
    alert('Avaliação enviada com sucesso!')
  }

  // Accept Deal Action
  const handleAcceptDeal = async () => {
    if (!room || !ad || !currentUser) return

    const lastProposal = room.mensagens.filter((m: any) => m.tipo?.includes('PROPOSTA') || m.tipo?.includes('CONTRA')).pop()
    if (!lastProposal) return

    const finalPrice = lastProposal.preco
    const finalQty = lastProposal.quantidade

    // Update Room status to Fechada and record final terms
    const updatedRoom = {
      ...room,
      status: 'Fechada',
      valor_final: finalPrice,
      quantidade_final: finalQty,
      data_fechamento: new Date().toISOString(),
      mensagens: [
        ...room.mensagens,
        {
          id: 'msg_closed_' + Date.now(),
          remetente_id: 'SYSTEM',
          remetente_nome: 'Sistema Materra Elo',
          texto: `🎉 ACORDO FECHADO! Ambas as partes aceitaram os termos: ${finalQty} ${ad.unidade} a R$ ${Number(finalPrice).toLocaleString('pt-BR', {minimumFractionDigits: 2})}/${ad.unidade}. Contatos liberados bilateralmente!`,
          tipo: 'AVISO_FECHAMENTO',
          timestamp: new Date().toISOString()
        }
      ]
    }
    updateRoomState(updatedRoom)

    // Update original ad to 'Fechado' in localStorage/Supabase
    try {
      const localListStr = localStorage.getItem('materra_local_anuncios') || '[]'
      const localList = JSON.parse(localListStr)
      const index = localList.findIndex((item: any) => item.id === ad.id)
      if (index !== -1) {
        localList[index].status = 'Fechado'
        localStorage.setItem('materra_local_anuncios', JSON.stringify(localList))
      }

      await supabase
        .from('anuncios')
        .update({ status: 'Fechado' })
        .eq('id', ad.id)
    } catch (e) {
      console.warn(e)
    }

    // Add Released Contacts to Local Storage
    try {
      const contactsStr = localStorage.getItem('materra_released_contacts') || '[]'
      const contacts = JSON.parse(contactsStr)
      
      const resolvedInterested = room.id_proponente === MOCK_PROFILES.interessado2.id ? MOCK_PROFILES.interessado2 : MOCK_PROFILES.interessado1
      const newContactRecord = {
        id: 'contact_' + Date.now(),
        id_anuncio: ad.id,
        anuncio_codigo: ad.codigo,
        anuncio_titulo: ad.titulo || ad.residuo,
        data_acordo: new Date().toLocaleString('pt-BR'),
        preco_final: finalPrice,
        quantidade_final: finalQty,
        frequencia: ad.frequencia,
        prazo_contrato: ad.prazo_recorrencia,
        horarios: ad.frequencia === 'Recorrente' ? 'Coletas programadas' : '08h-12h',
        anunciante: MOCK_PROFILES.anunciante,
        interessado: resolvedInterested
      }
      contacts.unshift(newContactRecord)
      localStorage.setItem('materra_released_contacts', JSON.stringify(contacts))
    } catch (e) {
      console.warn(e)
    }

    // Write to Audit Trail
    try {
      const auditTrailStr = localStorage.getItem('materra_compliance_audit_trail') || '[]'
      const auditTrail = JSON.parse(auditTrailStr)
      auditTrail.unshift({
        event_type: 'DEAL_CLOSED',
        event_category: 'Operacional',
        action: 'DEAL_CLOSE',
        entity_type: 'Negociação',
        entity_id: room.id,
        actor: currentProfile.nome_ou_razao,
        details: `Deal fechado: ${finalQty} ${ad.unidade} a R$ ${finalPrice.toFixed(2)}/${ad.unidade}. CEP: ${ad.cep}.`,
        timestamp: new Date().toISOString(),
        status: 'Íntegro',
        hash: 'SHA256-' + Math.random().toString(36).substring(2, 15)
      })
      localStorage.setItem('materra_compliance_audit_trail', JSON.stringify(auditTrail))
    } catch (e) {
      console.warn(e)
    }
  }

  // Reject Deal Action
  const handleRejectDeal = () => {
    if (!room || !currentUser) return

    const updatedRoom = {
      ...room,
      status: 'Rejeitada',
      mensagens: [
        ...room.mensagens,
        {
          id: 'msg_rejected_' + Date.now(),
          remetente_id: 'SYSTEM',
          remetente_nome: 'Sistema Materra Elo',
          texto: `❌ Negociação rejeitada e sala encerrada por ${currentProfile.nome_ou_razao}.`,
          tipo: 'AVISO_REJEICAO',
          timestamp: new Date().toISOString()
        }
      ]
    }
    updateRoomState(updatedRoom)

    // Unlock original ad (status set to Anunciado) in localStorage/Supabase
    try {
      const localListStr = localStorage.getItem('materra_local_anuncios') || '[]'
      const localList = JSON.parse(localListStr)
      const index = localList.findIndex((item: any) => item.id === ad.id)
      if (index !== -1) {
        localList[index].status = 'Anunciado'
        localStorage.setItem('materra_local_anuncios', JSON.stringify(localList))
      }

      supabase
        .from('anuncios')
        .update({ status: 'Anunciado' })
        .eq('id', ad.id)
    } catch (e) {
      console.warn(e)
    }
  }

  if (loading || !room || !ad) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '16px', background: '#000', color: '#fff' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,215,0,0.1)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Carregando Sala de Negociação...</p>
      </div>
    )
  }

  // Helper checks
  const isAdvertiser = currentUser.id === ad.id_cadastro || currentUser.id === (anuncianteProfile?.id || MOCK_PROFILES.anunciante.id)
  const finalProposal = room.mensagens.filter((m: any) => m.tipo?.includes('PROPOSTA') || m.tipo?.includes('CONTRA')).pop()
  const isTimerExpired = timeLeftText === 'Finalizado' || timeLeftText === 'Encerrado' || (ad && (ad.data_fim_real || ad.data_fim_leilao) && new Date(ad.data_fim_real || ad.data_fim_leilao).getTime() <= Date.now())
  const isClosed = room.status === 'Fechada' || room.status === 'Finalizado' || room.status === 'Fechado' || room.status === 'Arrematado' || room.status === 'SUSPENSO' || isTimerExpired
  const isRejected = room.status === 'Rejeitada'
  const isPendingMyResponse = finalProposal && finalProposal.remetente_id !== currentUser.id && !isClosed && !isRejected

  // Calculate savings for Case B (Descending)
  const refTotal = ad.valor_desejado * ad.quantidade
  const finalTotal = finalProposal ? (finalProposal.preco * finalProposal.quantidade) : refTotal
  const savings = Math.max(0, refTotal - finalTotal)

  // Calculate deviation percentage
  const bidDevPct = finalProposal ? (((finalProposal.preco - ad.valor_index) / ad.valor_index) * 100).toFixed(2) : '0.00'

  const interestedProfile = proponenteProfile || (room.id_proponente === MOCK_PROFILES.interessado2.id ? MOCK_PROFILES.interessado2 : MOCK_PROFILES.interessado1)

  return (
    <div style={{ background: '#000', color: '#f5f5f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-heading)' }}>
      
      {/* HEADER BAR */}
      <nav style={{ background: 'rgba(10, 10, 10, 0.95)', borderBottom: '1px solid var(--border-color)', padding: '16px 24px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.05em' }}>
              🚪 SALA DE NEGOCIAÇÃO
            </span>
            <span style={{ color: '#666' }}>|</span>
            <span style={{ fontSize: '0.95rem', color: '#ccc', fontWeight: 'bold' }}>{ad.titulo || ad.residuo}</span>
            <span style={{ fontSize: '0.75rem', background: '#222', border: '1px solid #444', color: '#aaa', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
              COD: {ad.codigo}
            </span>
          </div>
          <Link href="/" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem', background: '#111', border: '1px solid #333' }}>
            Voltar ao Dashboard
          </Link>
        </div>
      </nav>

      {/* BILATERAL QUICK PROFILE BAR */}
      <div style={{ background: '#080808', borderBottom: '1px solid #1a1a1a', padding: '12px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Advertiser Profile Card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#111', padding: '10px 16px', borderRadius: '8px', border: '1px solid #222' }}>
            <div style={{ fontSize: '1.5rem' }}>🏢</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '0.85rem', color: '#fff' }}>
                  {representedCompany ? `${representedCompany.razao_social} (Controlador: ${anuncianteProfile?.nome_ou_razao || 'Corretor'})` : (anuncianteProfile?.nome_ou_razao || MOCK_PROFILES.anunciante.nome_ou_razao)}
                </strong>
                <span style={{ fontSize: '0.7rem', background: 'rgba(255,215,0,0.1)', color: 'var(--primary)', padding: '1px 6px', borderRadius: '3px', fontWeight: 'bold' }}>
                  {representedCompany ? representedCompany.selo_metal : (anuncianteProfile?.nivel_selo || MOCK_PROFILES.anunciante.nivel_selo)}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#888' }}>
                  ({representedCompany ? representedCompany.score_0a100 : (anuncianteProfile?.score_0a100 || MOCK_PROFILES.anunciante.score_0a100)} pts)
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#4caf50', display: 'block', marginTop: '2px' }}>
                {isClosed ? '✅ Contatos liberados' : '✅ Contato liberado após fechar o deal'}
              </span>
            </div>
          </div>

          {/* Interested Profile Card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#111', padding: '10px 16px', borderRadius: '8px', border: '1px solid #222' }}>
            <div style={{ fontSize: '1.5rem' }}>💼</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '0.85rem', color: '#fff' }}>{room.proponente_nome}</strong>
                <span style={{ fontSize: '0.7rem', background: 'rgba(255,215,0,0.1)', color: 'var(--primary)', padding: '1px 6px', borderRadius: '3px', fontWeight: 'bold' }}>
                  {room.proponente_selo}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#888' }}>({room.proponente_score} pts)</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: isClosed ? '#4caf50' : '#e57373', display: 'block', marginTop: '2px' }}>
                {isClosed ? '✅ Contatos liberados' : '❌ Contato ainda não liberado (após deal)'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* MAIN LAYOUT GRID */}
      <div style={{ maxWidth: '1400px', margin: '24px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px', width: '100%', flex: 1 }}>
        
        {/* LEFT PANEL: ADVERT DATA FROM FORM (Sections 3-8) */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
          
          {/* TIMER & LEILÃO STATE */}
          <div style={{ background: '#121212', border: '1.5px solid var(--primary)', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(255,215,0,0.05)' }}>
            <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⏱️ DURAÇÃO DO LEILÃO: {ad.duracao_leilao_horas}H
              </span>
              {ad.urgencia_prazo === 'Urgente' && (
                <span style={{ background: 'rgba(239, 83, 80, 0.15)', color: '#ef5350', border: '1px solid #ef5350', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px' }}>
                  🚨 EMERGENCIAL
                </span>
              )}
            </div>
            
            <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'monospace', color: '#fff', textAlign: 'center', padding: '10px 0', border: '1px solid #222', background: '#0a0a0a', borderRadius: '8px', marginBottom: '12px' }}>
              {isClosed ? 'ACORDO FECHADO ✅' : isRejected ? 'SALA ENCERRADA ❌' : timeLeftText}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem', color: '#888' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Regra Anti-Snipe:</span>
                <strong style={{ color: '#00ff66' }}>✅ ATIVADO (+15 min)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Encerramento previsto:</span>
                <span style={{ color: '#ccc' }}>{new Date(ad.data_fim_leilao).toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>

          {/* DADOS DO ANÚNCIO (Seção 3) */}
          <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', padding: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '14px', borderBottom: '1px solid #222', paddingBottom: '6px' }}>
              📋 DADOS DO RESÍDUO
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#666', display: 'block', fontSize: '0.75rem' }}>Material / Categoria</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{ad.residuo} ({ad.categoria})</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ color: '#666', display: 'block', fontSize: '0.75rem' }}>Classe IBAMA</span>
                  <span style={{ color: '#fff' }}>{ad.classe?.replace('Classe ', '')}</span>
                </div>
                <div>
                  <span style={{ color: '#666', display: 'block', fontSize: '0.75rem' }}>Estado Físico</span>
                  <span style={{ color: '#fff' }}>{ad.estado_fisico}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ color: '#666', display: 'block', fontSize: '0.75rem' }}>Qtd Disponível</span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>{ad.quantidade} {ad.unidade}</span>
                </div>
                <div>
                  <span style={{ color: '#666', display: 'block', fontSize: '0.75rem' }}>Acondicionamento</span>
                  <span style={{ color: '#fff' }}>{ad.acondicionamento}</span>
                </div>
              </div>
              <div>
                <span style={{ color: '#666', display: 'block', fontSize: '0.75rem' }}>Origem Geradora</span>
                <span style={{ color: '#ccc', lineHeight: 1.4 }}>{ad.origem_processo}</span>
              </div>
            </div>
          </div>

          {/* COLETA & RECORRÊNCIA (Seção 4) */}
          <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', padding: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '14px', borderBottom: '1px solid #222', paddingBottom: '6px' }}>
              🔄 COLETA & RECORRÊNCIA
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#666', display: 'block', fontSize: '0.75rem' }}>Frequência de Retirada</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{ad.frequencia}</span>
              </div>
              <div>
                <span style={{ color: '#666', display: 'block', fontSize: '0.75rem' }}>Duração do Contrato</span>
                <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{ad.prazo_recorrencia || 'Lote Único'}</span>
              </div>
              <div>
                <span style={{ color: '#666', display: 'block', fontSize: '0.75rem' }}>Próxima Coleta Prevista</span>
                <span style={{ color: '#ccc' }}>{new Date(Date.now() + 86400000 * 5).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>

          {/* LOCALIZAÇÃO & ACESSO (Seção 5) */}
          <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', padding: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '14px', borderBottom: '1px solid #222', paddingBottom: '6px' }}>
              📍 LOCALIZAÇÃO & ACESSO LOGÍSTICO
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#666', display: 'block', fontSize: '0.75rem' }}>Município</span>
                <span style={{ color: '#fff' }}>{ad.municipio}, {ad.uf} (CEP: {ad.cep})</span>
              </div>
              <div>
                <span style={{ color: '#666', display: 'block', fontSize: '0.75rem' }}>Endereço Completo</span>
                {isClosed ? (
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>
                    <Unlock size={14} /> {representedCompany ? representedCompany.endereco || 'Endereço da Representada' : (anuncianteProfile?.endereco || MOCK_PROFILES.anunciante.endereco)}
                  </span>
                ) : (
                  <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={14} /> Ocultado (Liberado após deal)
                  </span>
                )}
              </div>
              <div>
                <span style={{ color: '#666', display: 'block', fontSize: '0.75rem' }}>Horário de Disponibilidade</span>
                <span style={{ color: '#fff' }}>08h-12h / Sob Agendamento (Antecedência: 2 dias)</span>
              </div>
              <div>
                <span style={{ color: '#666', display: 'block', fontSize: '0.75rem' }}>Restrições Logísticas</span>
                <span style={{ color: '#ccc', lineHeight: 1.4 }}>Balança no local, Doca, Empilhadeira. PBT máx 15t, altura máx 4.2m.</span>
              </div>
              <div>
                <span style={{ color: '#666', display: 'block', fontSize: '0.75rem' }}>Transporte Exigido</span>
                <span style={{ color: '#ccc' }}>{ad.classe?.includes('Classe I') ? 'Classe I (Exige MOPP / CIPP / Licença específica)' : 'Classe II (Comum)'}</span>
              </div>
            </div>
          </div>

          {/* REQUISITOS DO ANUNCIANTE (Seção 8) */}
          <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', padding: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '14px', borderBottom: '1px solid #222', paddingBottom: '6px' }}>
              🏅 REQUISITOS MÍNIMOS RECOMENDADOS
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#666', display: 'block', fontSize: '0.75rem' }}>Selo Mínimo</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{ad.selo_minimo || 'Prata'}</span>
                {room.proponente_selo === 'Bronze' && ad.selo_minimo === 'Prata' && (
                  <span style={{ color: '#ffc107', fontSize: '0.75rem', display: 'block', marginTop: '2px' }}>
                    ⚠️ Seu Selo: <strong>Bronze</strong> → Anunciante recomenda <strong>Prata</strong>
                  </span>
                )}
              </div>
              <div>
                <span style={{ color: '#666', display: 'block', fontSize: '0.75rem' }}>Score Mínimo</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{ad.score_minimo || 50}/100</span>
                {room.proponente_score < (ad.score_minimo || 50) && (
                  <span style={{ color: '#ffc107', fontSize: '0.75rem', display: 'block', marginTop: '2px' }}>
                    ⚠️ Seu Score: <strong>{room.proponente_score}</strong> → Anunciante recomenda <strong>&ge; {ad.score_minimo || 50}</strong>
                  </span>
                )}
              </div>
              <div>
                <span style={{ color: '#666', display: 'block', fontSize: '0.75rem' }}>Documentos Solicitados (Homologação)</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                  {(ad.documentos_solicitados || ['Licença Ambiental válida']).map((doc: string) => (
                    <span key={doc} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#ccc' }}>
                      <CheckCircle size={12} style={{ color: 'var(--primary)' }} /> {doc}
                    </span>
                  ))}
                </div>
              </div>
              {ad.observacoes && (
                <div>
                  <span style={{ color: '#666', display: 'block', fontSize: '0.75rem' }}>Observações do Anunciante</span>
                  <span style={{ color: '#aaa', fontStyle: 'italic' }}>"{ad.observacoes.split('|')[0]}"</span>
                </div>
              )}
            </div>
          </div>

        </aside>

        {/* RIGHT COLUMN: NEGOTIATION CHAT & BID DYNAMICS */}
        <section style={{ display: 'flex', flexDirection: 'column', background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', overflow: 'hidden' }}>
          
          {/* ACTIVE STATUS BAR */}
          <div style={{ background: '#111', padding: '16px 20px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>Modalidade de Negociação</span>
              <h4 style={{ color: '#fff', margin: 0, fontWeight: 'bold', fontSize: '0.95rem' }}>
                {ad.tipo_leilao === 'Ascendente' && '📈 LEILÃO ASCENDENTE (Lance de Valor Maior Ganha)'}
                {ad.tipo_leilao === 'Descendente' && '📉 LEILÃO DESCENDENTE (Lance de Custo Menor Ganha)'}
                {ad.tipo_leilao === 'Sem leilão' && '🎁 DOAÇÃO COM RETIRADA'}
              </h4>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: '#888' }}>Preço Ref. original</span>
              <strong style={{ display: 'block', color: 'var(--primary)', fontFamily: 'monospace', fontSize: '1.1rem' }}>
                R$ {Number(ad.valor_desejado).toLocaleString('pt-BR', {minimumFractionDigits:2})} / {ad.unidade}
              </strong>
            </div>
          </div>

          {/* MESSAGES LOG */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '400px' }}>
            
            {/* Lead Fee verification system card */}
            <div style={{ background: 'rgba(255,215,0,0.03)', border: '1px dashed rgba(255,215,0,0.3)', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Award size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#fff', display: 'block' }}>Taxa Lead Habilitada com Sucesso</strong>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#aaa', lineHeight: 1.4, marginTop: '2px' }}>
                  A taxa de **R$ {room.taxa_lead_valor?.toFixed(2)}** foi processada. O endereço completo do gerador e os dados bilaterais de contato comercial serão liberados automaticamente para ambas as partes assim que um acordo sobre o preço e quantidade for selado nesta sala.
                </p>
              </div>
            </div>

            {room.mensagens.map((msg: any) => {
              const isMe = msg.remetente_id === currentUser.id
              const isSystem = msg.remetente_id === 'SYSTEM'
              
              if (isSystem) {
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                    <div style={{
                      background: msg.tipo?.includes('FECHAMENTO') ? 'rgba(76,175,80,0.1)' : msg.tipo?.includes('REJEICAO') ? 'rgba(239,83,80,0.1)' : 'rgba(255,255,255,0.02)',
                      border: msg.tipo?.includes('FECHAMENTO') ? '1px solid #4caf50' : msg.tipo?.includes('REJEICAO') ? '1px solid #ef5350' : '1px solid #333',
                      borderRadius: '6px', padding: '12px 20px', maxWidth: '80%', textAlign: 'center'
                    }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: msg.tipo?.includes('FECHAMENTO') ? '#81c784' : msg.tipo?.includes('REJEICAO') ? '#ef5350' : '#ccc', fontWeight: 'bold', lineHeight: 1.4 }}>
                        {msg.texto}
                      </p>
                      <span style={{ fontSize: '0.7rem', color: '#666', display: 'block', marginTop: '4px' }}>
                        {new Date(msg.timestamp).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                  </div>
                )
              }

              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    background: isMe ? 'var(--bg)' : '#111',
                    border: isMe ? '1px solid var(--primary)' : '1px solid #222',
                    borderRadius: '12px',
                    padding: '16px',
                    maxWidth: '70%',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    
                    {/* Message Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: isMe ? 'var(--primary)' : '#aaa' }}>
                        {isMe ? 'VOCÊ' : msg.remetente_nome}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#666' }}>
                        {new Date(msg.timestamp).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>

                    {/* Proposal parameters box */}
                    {msg.tipo !== 'CHAT' && (
                      <div style={{ background: '#070707', border: '1px solid #222', padding: '10px 14px', borderRadius: '6px', marginBottom: '8px', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', display: 'block', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                          {msg.tipo?.replace('_', ' ')}
                        </span>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '6px', color: '#fff' }}>
                          <span>Qtd: <strong>{msg.quantidade} {ad.unidade}</strong></span>
                          <span>Preço: <strong>R$ {Number(msg.preco).toLocaleString('pt-BR', {minimumFractionDigits: 2})}/{ad.unidade}</strong></span>
                        </div>
                        
                        {/* Dynamic stats */}
                        {ad.tipo_leilao === 'Descendente' && (
                          <div style={{ marginTop: '6px', color: '#81c784', fontWeight: 'bold', fontSize: '0.75rem' }}>
                            💰 Economia simulada: R$ {Math.max(0, (ad.valor_desejado * ad.quantidade) - (msg.preco * msg.quantidade)).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                          </div>
                        )}
                        {ad.tipo_leilao === 'Ascendente' && msg.preco !== ad.valor_desejado && (
                          <div style={{ marginTop: '6px', color: '#81c784', fontWeight: 'bold', fontSize: '0.75rem' }}>
                            📈 Desvio do Materra Index: {(((msg.preco - ad.valor_index) / ad.valor_index) * 100) > 0 ? '+' : ''}{(((msg.preco - ad.valor_index) / ad.valor_index) * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Body */}
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#fff', lineHeight: 1.4 }}>
                      {msg.texto}
                    </p>

                  </div>
                </div>
              )
            })}
            <div ref={chatEndRef} />
          </div>

          {/* BILATERAL CONTACT RECORD DISPLAY (IF CLOSED) */}
          {isClosed && (
            <div style={{ background: '#0a0a0a', borderTop: '2px solid #00ff66', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#00ff66', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                ✅ CONTATOS LIBERADOS E SEGURADOS
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Advertiser details */}
                <div style={{ background: '#111', border: '1px solid #333', padding: '16px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>🏢 DADOS DO ANUNCIANTE</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: '#666', display: 'block', fontSize: '0.7rem' }}>Empresa / Razão Social</span>
                      <strong style={{ color: '#fff' }}>
                        {representedCompany ? `${representedCompany.razao_social} (Controlador: ${anuncianteProfile?.nome_ou_razao})` : (anuncianteProfile?.nome_ou_razao || MOCK_PROFILES.anunciante.nome_ou_razao)}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: '#666', display: 'block', fontSize: '0.7rem' }}>Responsável Comercial</span>
                      <span style={{ color: '#ccc' }}>{anuncianteProfile?.responsavel || 'Gerente Comercial'}</span>
                    </div>
                    <div>
                      <span style={{ color: '#666', display: 'block', fontSize: '0.7rem' }}>Telefone / WhatsApp</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{anuncianteProfile?.whatsapp || MOCK_PROFILES.anunciante.whatsapp}</span>
                    </div>
                    <div>
                      <span style={{ color: '#666', display: 'block', fontSize: '0.7rem' }}>E-mail</span>
                      <span style={{ color: '#ccc' }}>{anuncianteProfile?.email || MOCK_PROFILES.anunciante.email}</span>
                    </div>
                    <div>
                      <span style={{ color: '#666', display: 'block', fontSize: '0.7rem' }}>Endereço Completo de Coleta</span>
                      <span style={{ color: '#fff', fontWeight: 'bold' }}>
                        {representedCompany ? `${representedCompany.endereco}, ${representedCompany.cidade || ''} - ${representedCompany.uf || ''}` : `${anuncianteProfile?.endereco || MOCK_PROFILES.anunciante.endereco}, ${anuncianteProfile?.cidade || MOCK_PROFILES.anunciante.cidade} - ${anuncianteProfile?.uf || MOCK_PROFILES.anunciante.uf}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bidder details */}
                <div style={{ background: '#111', border: '1px solid #333', padding: '16px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>💼 DADOS DO COMPRADOR / INTERESSADO</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: '#666', display: 'block', fontSize: '0.7rem' }}>Empresa / Razão Social</span>
                      <strong style={{ color: '#fff' }}>{room.proponente_nome}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#666', display: 'block', fontSize: '0.7rem' }}>Responsável Operações</span>
                      <span style={{ color: '#ccc' }}>{interestedProfile.responsavel || 'Maria Santos (Analista Ambiental)'}</span>
                    </div>
                    <div>
                      <span style={{ color: '#666', display: 'block', fontSize: '0.7rem' }}>Telefone / WhatsApp</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{interestedProfile.whatsapp}</span>
                    </div>
                    <div>
                      <span style={{ color: '#666', display: 'block', fontSize: '0.7rem' }}>E-mail</span>
                      <span style={{ color: '#ccc' }}>{interestedProfile.email}</span>
                    </div>
                    <div>
                      <span style={{ color: '#666', display: 'block', fontSize: '0.7rem' }}>Selo de Conformidade</span>
                      <strong style={{ color: 'var(--primary)' }}>{room.proponente_selo} ({room.proponente_score} pontos)</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px', flexWrap: 'wrap' }}>
                {!hasRated && (
                  <button
                    onClick={() => setShowRatingModal(true)}
                    className="btn"
                    style={{ background: 'var(--primary)', color: '#000', padding: '8px 16px', fontSize: '0.8rem', fontWeight: 'bold' }}
                  >
                    ⭐ Avaliar Operação
                  </button>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(anuncianteProfile?.whatsapp || MOCK_PROFILES.anunciante.whatsapp)
                    alert('Telefone copiado para transferência!')
                  }}
                  className="btn"
                  style={{ background: '#222', color: '#fff', padding: '8px 16px', fontSize: '0.8rem' }}
                >
                  <Copy size={14} style={{ marginRight: '6px' }} /> Copiar Telefone
                </button>
                <a
                  href={`mailto:${anuncianteProfile?.email || MOCK_PROFILES.anunciante.email}`}
                  className="btn btn-primary"
                  style={{ background: 'var(--primary)', color: '#000', padding: '8px 16px', fontSize: '0.8rem', textDecoration: 'none' }}
                >
                  <Send size={14} style={{ marginRight: '6px' }} /> Enviar E-mail
                </a>
              </div>
            </div>
          )}

          {/* DYNAMIC ACTION CONTROLS / FORMS (IF ACTIVE) */}
          {!isClosed && !isRejected && (
            <div style={{ background: '#111', borderTop: '1px solid #222', padding: '20px' }}>
              
              {/* If counter proposal form open */}
              {showCounterForm && (
                <form onSubmit={handleSubmitCounter} style={{ background: '#0a0a0a', border: '1px solid var(--primary)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                  <h5 style={{ color: 'var(--primary)', margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: 'bold' }}>🔄 CONTRAPROPOSTA DO ANUNCIANTE</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Quantidade ({ad.unidade})</label>
                      <input type="number" className="form-input" style={{ background: '#000', border: '1px solid #333' }} value={counterQty} onChange={e => setCounterQty(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Preço Unitário (R$)</label>
                      <input type="number" step="0.01" className="form-input" style={{ background: '#000', border: '1px solid #333' }} value={counterPrice} onChange={e => setCounterPrice(e.target.value)} required />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setShowCounterForm(false)} className="btn" style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'none' }}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.75rem', background: 'var(--primary)', color: '#000' }}>Enviar Contraproposta</button>
                  </div>
                </form>
              )}

              {/* If interested bid form open */}
              {showBidForm && (
                <form onSubmit={handleSubmitBid} style={{ background: '#0a0a0a', border: '1px solid var(--primary)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                  <h5 style={{ color: 'var(--primary)', margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: 'bold' }}>📈 FAZER NOVO LANCE</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Quantidade ({ad.unidade})</label>
                      <input type="number" className="form-input" style={{ background: '#000', border: '1px solid #333' }} value={bidQty} onChange={e => setBidQty(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Preço Oferecido (R$)</label>
                      <input type="number" step="0.01" className="form-input" style={{ background: '#000', border: '1px solid #333' }} value={bidPrice} onChange={e => setBidPrice(e.target.value)} required />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setShowBidForm(false)} className="btn" style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'none' }}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.75rem', background: 'var(--primary)', color: '#000' }}>Enviar Novo Lance</button>
                  </div>
                </form>
              )}

              {/* Action trigger buttons */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                
                {/* Text chat input */}
                <div style={{ display: 'flex', gap: '8px', width: '100%', marginBottom: '12px' }}>
                  <input
                    type="text"
                    placeholder="Escreva uma mensagem na sala..."
                    className="form-input"
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
                    style={{ flex: 1, background: '#000', border: '1px solid #222', fontSize: '0.9rem' }}
                  />
                  <button onClick={handleSendMessage} className="btn" style={{ background: 'var(--primary)', color: '#000', padding: '10px' }}>
                    <Send size={16} />
                  </button>
                </div>

                {/* Advertiser decision controls */}
                {isAdvertiser && (
                  <>
                    <button onClick={handleAcceptDeal} className="btn" style={{ background: '#4caf50', color: '#fff', fontSize: '0.8rem', padding: '8px 16px', fontWeight: 'bold' }}>
                      <Check size={14} style={{ marginRight: '6px' }} /> Aceitar Deal
                    </button>
                    <button onClick={() => setShowCounterForm(true)} className="btn" style={{ background: '#ff9800', color: '#fff', fontSize: '0.8rem', padding: '8px 16px', fontWeight: 'bold' }}>
                      <RefreshCw size={12} style={{ marginRight: '6px' }} /> Fazer Contraproposta
                    </button>
                    <button onClick={handleRejectDeal} className="btn" style={{ background: '#ef5350', color: '#fff', fontSize: '0.8rem', padding: '8px 16px', fontWeight: 'bold' }}>
                      <X size={14} style={{ marginRight: '6px' }} /> Rejeitar e Fechar Sala
                    </button>
                  </>
                )}

                {/* Proponente decision controls */}
                {!isAdvertiser && (
                  <>
                    <button onClick={handleAcceptDeal} className="btn" style={{ background: '#4caf50', color: '#fff', fontSize: '0.8rem', padding: '8px 16px', fontWeight: 'bold' }}>
                      <Check size={14} style={{ marginRight: '6px' }} /> Aceitar Deal
                    </button>
                    <button onClick={() => setShowBidForm(true)} className="btn" style={{ background: 'var(--primary)', color: '#000', fontSize: '0.8rem', padding: '8px 16px', fontWeight: 'bold' }}>
                      <Plus size={14} style={{ marginRight: '6px' }} /> Fazer Nova Oferta
                    </button>
                    <button onClick={handleRejectDeal} className="btn" style={{ background: '#ef5350', color: '#fff', fontSize: '0.8rem', padding: '8px 16px', fontWeight: 'bold' }}>
                      <X size={14} style={{ marginRight: '6px' }} /> Rejeitar Deal
                    </button>
                  </>
                )}

              </div>
            </div>
          )}

          {/* If rejected state message */}
          {isRejected && (
            <div style={{ background: '#1a0d0d', borderTop: '2px solid #ef5350', padding: '24px', textAlign: 'center', color: '#ef5350' }}>
              <strong>SALA ENCERRADA E NEGOCIAÇÃO REJEITADA</strong>
              <p style={{ fontSize: '0.8rem', color: '#aaa', margin: '4px 0 0 0' }}>Nenhum dado comercial ou de contato foi liberado nesta operação.</p>
            </div>
          )}

        </section>

      </div>

      {/* RATING MODAL */}
      {showRatingModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000
        }}>
          <div style={{
            background: '#121212', border: '1px solid var(--primary)', borderRadius: '12px',
            padding: '30px', maxWidth: '500px', width: '90%', boxShadow: '0 4px 24px rgba(0,0,0,0.6)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#fff', fontWeight: 'bold', fontFamily: 'var(--font-heading)' }}>
              ⭐ Avaliar Operação da Contraparte
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '20px' }}>
              Deixe sua avaliação comercial e de compliance sobre a contraparte para ajudar a manter a rede Materra Elo segura e confiável.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '8px', fontWeight: 'bold' }}>Nota de Desempenho (Estrelas)</label>
              <div style={{ display: 'flex', gap: '8px', fontSize: '1.8rem' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    onClick={() => setRatingStars(star)}
                    style={{ cursor: 'pointer', color: star <= ratingStars ? '#ffc107' : '#444' }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '8px', fontWeight: 'bold' }}>Comentário / Feedback Comercial</label>
              <textarea
                value={ratingComment}
                onChange={e => setRatingComment(e.target.value)}
                placeholder="ex: Transação rápida, documentação correta e ótimo atendimento comercial."
                style={{
                  width: '100%', height: '100px', background: '#000', border: '1px solid #333',
                  borderRadius: '6px', padding: '10px', color: '#fff', fontSize: '0.85rem', resize: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#ccc' }}>
                <input
                  type="checkbox"
                  checked={ratingRecommend}
                  onChange={e => setRatingRecommend(e.target.checked)}
                />
                Recomendo esta empresa para futuras negociações
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowRatingModal(false)}
                className="btn"
                style={{ background: '#222', color: '#fff', padding: '10px 16px', fontSize: '0.85rem' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRating}
                className="btn btn-primary"
                style={{ background: 'var(--primary)', color: '#000', padding: '10px 20px', fontSize: '0.85rem', fontWeight: 'bold' }}
              >
                Enviar Avaliação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER FLOATING SWITCHER BAR FOR TRILATERAL TESTING */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, background: '#111', borderTop: '2.5px solid var(--primary)',
        padding: '12px 24px', zIndex: 1000, boxShadow: '0 -4px 20px rgba(0,0,0,0.5)', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.1rem' }}>⚙️</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase' }}>
            AMBIENTE DE TESTE TRILATERAL:
          </span>
          <span style={{ fontSize: '0.8rem', color: '#aaa' }}>
            Alterne o usuário ativo para simular lances, contrapropostas e aceites de ambos os lados.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => handleSwitchProfile('anunciante')}
            style={{
              padding: '6px 14px', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
              background: currentUser?.id === MOCK_PROFILES.anunciante.id ? 'var(--primary)' : '#222',
              color: currentUser?.id === MOCK_PROFILES.anunciante.id ? '#000' : '#ccc',
              border: '1px solid #333'
            }}
          >
            🏢 Anunciante: ABC Indústria (Fornecedor)
          </button>
          <button
            onClick={() => handleSwitchProfile('interessado1')}
            style={{
              padding: '6px 14px', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
              background: currentUser?.id === MOCK_PROFILES.interessado1.id ? 'var(--primary)' : '#222',
              color: currentUser?.id === MOCK_PROFILES.interessado1.id ? '#000' : '#ccc',
              border: '1px solid #333'
            }}
          >
            💼 Interessado 1: XYZ Reciclagem (Comprador - Bronze)
          </button>
          <button
            onClick={() => handleSwitchProfile('interessado2')}
            style={{
              padding: '6px 14px', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
              background: currentUser?.id === MOCK_PROFILES.interessado2.id ? 'var(--primary)' : '#222',
              color: currentUser?.id === MOCK_PROFILES.interessado2.id ? '#000' : '#ccc',
              border: '1px solid #333'
            }}
          >
            💼 Interessado 2: MNO Processadora (Comprador - Prata)
          </button>
        </div>
      </div>

      {/* CSS Spin effect style */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  )
}

export default function NegotiationRoomPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', background: '#000', color: '#fff' }}>
        <p>Carregando dados da negociação...</p>
      </div>
    }>
      <NegotiationRoomContent />
    </Suspense>
  )
}
