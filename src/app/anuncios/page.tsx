'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ESTADOS_BRASIL, ACONDICIONAMENTOS, WHATSAPP_NUM } from '@/lib/constants'
import { CATALOGO_MATERRA_ELO } from '@/lib/catalogo'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MapPin, Shield, Info, Calendar, Clock,
  Lock, Trash, FileText, Play, ChevronDown, ChevronUp, Heart, Search, AlertTriangle
} from 'lucide-react'

// Real-time ticking Countdown Timer component for auctions
const LeilaoTimer = ({ dias, endDate }: { dias?: number; endDate?: string }) => {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    let targetMs = 0
    if (endDate) {
      targetMs = new Date(endDate).getTime()
    } else if (dias !== undefined) {
      const targetDate = new Date()
      targetDate.setHours(0, 0, 0, 0)
      targetDate.setDate(targetDate.getDate() + dias)
      targetMs = targetDate.getTime()
    } else {
      setTimeLeft('Sem data')
      return
    }

    const updateTimer = () => {
      const now = new Date().getTime()
      const diff = targetMs - now
      if (diff <= 0) {
        setTimeLeft('Leilão Encerrado')
        return
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24))
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((diff % (1000 * 60)) / 1000)

      if (d > 0) {
        setTimeLeft(`Restam ${d}d ${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`)
      } else {
        setTimeLeft(`Restam ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [dias, endDate])

  return (
    <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontFamily: 'monospace' }}>
      {timeLeft}
    </span>
  )
}

const getDistanceBetweenCeps = (cepA: string, cepB: string): number => {
  if (!cepA || !cepB) return 50
  const cleanA = cepA.replace(/\D/g, '')
  const cleanB = cepB.replace(/\D/g, '')
  if (cleanA.length < 5 || cleanB.length < 5) return 50

  const prefixA = cleanA.substring(0, 5)
  const prefixB = cleanB.substring(0, 5)
  if (prefixA === prefixB) {
    return Math.abs(parseInt(cleanA.slice(-3)) - parseInt(cleanB.slice(-3))) % 10 + 2
  }

  const regionA3 = parseInt(cleanA.substring(0, 3))
  const regionB3 = parseInt(cleanB.substring(0, 3))
  const diff3 = Math.abs(regionA3 - regionB3)
  if (diff3 === 0) {
    return 15 + (Math.abs(parseInt(cleanA.substring(3, 5)) - parseInt(cleanB.substring(3, 5))) * 5)
  }

  const regionA2 = parseInt(cleanA.substring(0, 2))
  const regionB2 = parseInt(cleanB.substring(0, 2))
  const diff2 = Math.abs(regionA2 - regionB2)
  if (diff2 === 0) {
    return 40 + (diff3 * 8)
  }

  const regionA1 = parseInt(cleanA.substring(0, 1))
  const regionB1 = parseInt(cleanB.substring(0, 1))
  const diff1 = Math.abs(regionA1 - regionB1)
  return 100 + (diff1 * 120) + (diff2 * 12)
}

// Logo Globe Component
const LogoGlobe = ({ size = 28 }: { size?: number }) => (
  <svg viewBox="0 0 100 100" width={size} height={size} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round">
    <path d="M50,10 A40,40 0 0,0 10,50 A40,40 0 0,0 50,90" />
    <path d="M50,10 A25,40 0 0,0 25,50 A25,40 0 0,0 50,90" />
    <path d="M50,10 A12,40 0 0,0 38,50 A12,40 0 0,0 50,90" />
    <path d="M14,35 Q35,42 50,42" />
    <path d="M10,50 Q35,58 50,58" />
    <path d="M14,65 Q35,74 50,74" />
  </svg>
)

export default function VitrineAnunciosPage() {
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<'Oferta' | 'Demanda'>('Oferta')

  // Auth/profile context
  const [userProfile, setUserProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [pixPaymentModal, setPixPaymentModal] = useState<{ item: any; type: 'NORMAL' | 'SUPER_CONTATO'; amount: number } | null>(null)

  // Listings data
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Saved/Favorites (LocalStorage)
  const [savedIds, setSavedIds] = useState<string[]>([])

  // Search by Name (Passo 0)
  const [searchName, setSearchName] = useState('')

  // Advanced Filters state
  const [filterGrupo, setFilterGrupo] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterResiduo, setFilterResiduo] = useState('')
  const [filterClasse, setFilterClasse] = useState('')
  const [filterEstadoFisico, setFilterEstadoFisico] = useState('')
  const [filterAcondicionamento, setFilterAcondicionamento] = useState('')
  const [filterUf, setFilterUf] = useState('')
  const [filterMunicipio, setFilterMunicipio] = useState('')
  const [filterQtyMin, setFilterQtyMin] = useState('')
  const [filterQtyMax, setFilterQtyMax] = useState('')
  const [filterQtyUnit, setFilterQtyUnit] = useState('t')
  const [filterFrequencia, setFilterFrequencia] = useState('')
  const [filterPriceMin, setFilterPriceMin] = useState('')
  const [filterPriceMax, setFilterPriceMax] = useState('')
  const [filterSelo, setFilterSelo] = useState('')
  const [filterDocs, setFilterDocs] = useState('')
  const [filterContract, setFilterContract] = useState('') // 3, 6, 12, 18, 24 meses, Indefinido
  const [filterUrgent, setFilterUrgent] = useState(false) // Checkbox for emergencial
  const [filterDistancia, setFilterDistancia] = useState('Sem limite')
  const [filterFluxo, setFilterFluxo] = useState('')
  const [filterAceitaMenor, setFilterAceitaMenor] = useState(false)
  const [filterSituacao, setFilterSituacao] = useState('')
  const [filterTemAvaliacao, setFilterTemAvaliacao] = useState('')
  const [filterResponsavelFrete, setFilterResponsavelFrete] = useState('')
  const [filterInfraestrutura, setFilterInfraestrutura] = useState('')
  const [sortBy, setSortBy] = useState('Mais recente')

  // Inline expanded card id (Passo 10 collapsible style)
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null)

  // Sala de Negociação / Taxa Lead Modal states
  const [showLeadFeeModal, setShowLeadFeeModal] = useState(false)
  const [selectedListingForLead, setSelectedListingForLead] = useState<any>(null)
  const [leadFeeValue, setLeadFeeValue] = useState(80)
  const [showSpecialtyWarning, setShowSpecialtyWarning] = useState(false)
  const [warningType, setWarningType] = useState('')

  // Fetch logged in profile
  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      let loggedUser = session?.user

      if (!loggedUser) {
        try {
          const localUser = localStorage.getItem('materra_user')
          if (localUser) {
            loggedUser = JSON.parse(localUser)
          }
        } catch (e) {
          console.warn(e)
        }
      }

      if (loggedUser) {
        setUser(loggedUser)
        const { data } = await supabase
          .from('cadastros')
          .select('id, uf, tipo_parte, nome_ou_razao, nivel_selo, score_0a100')
          .eq('id', loggedUser.id)
          .single()
        if (data) {
          setUserProfile(data)
        } else {
          try {
            const localProfile = localStorage.getItem('materra_profile')
            if (localProfile) {
              setUserProfile(JSON.parse(localProfile))
            }
          } catch (e) {
            console.warn(e)
          }
        }
      }
    }
    loadProfile()

    // Load saved favorites
    try {
      const saved = localStorage.getItem('materra_saved_anuncios')
      if (saved) {
        setSavedIds(JSON.parse(saved))
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Fetch listings from Supabase combined with mockup wireframe items
  useEffect(() => {
    async function fetchListings() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('anuncios')
          .select(`
            *,
            cadastros (
              selo_verificado,
              nivel_selo,
              score_0a100,
              subtipo,
              tipo_parte
            )
          `)
          .eq('status', 'Anunciado')

        if (error) {
          console.warn('Database select error (falling back to mock items for wireframe):', error)
        }

        const dbListings = data || []
        
        // 3 High-fidelity premium mockup announcements matching the required form updates and contract lengths
        const mockupAnuncios: any[] = []

        // Retrieve local storage announcements
        let localAnuncios: any[] = []
        try {
          const localListStr = localStorage.getItem('materra_local_anuncios')
          if (localListStr) {
            localAnuncios = JSON.parse(localListStr)
          }
        } catch (e) {
          console.warn('Could not read local announcements:', e)
        }

        const combinedListings = [...localAnuncios, ...mockupAnuncios, ...dbListings]
        setListings(combinedListings)
      } catch (err) {
        console.error('Erro ao buscar anúncios:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [])

  // Favorite toggle helper
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    let updated = [...savedIds]
    if (updated.includes(id)) {
      updated = updated.filter(x => x !== id)
    } else {
      updated.push(id)
    }
    setSavedIds(updated)
    localStorage.setItem('materra_saved_anuncios', JSON.stringify(updated))
  }

  // Real-time deviation calculations in listings matching Passo 6
  const getListingDeviation = (item: any) => {
    const desired = Number(item.valor_desejado) || 0
    const indexPrice = Number(item.valor_index) || 340
    if (item.forma_cobranca?.toLowerCase().includes('doação') || desired === 0) {
      return { diff: 0, percent: 0, color: '#28A745', arrow: '■', label: 'Doação' }
    }
    const diff = desired - indexPrice
    const percent = (diff / Math.abs(indexPrice)) * 100

    let color = '#28A745' // Green (#28A745)
    if (Math.abs(percent) > 10 && Math.abs(percent) <= 20) {
      color = '#FFC107' // Yellow (#FFC107)
    } else if (Math.abs(percent) > 20) {
      color = '#DC3545' // Red (#DC3545)
    }

    return {
      diff,
      percent,
      color,
      arrow: percent > 0 ? '📈' : percent < 0 ? '📉' : '■',
      label: `${Math.abs(percent).toFixed(1)}%`
    }
  }

  // Filter and sort listings
  const filteredListings = listings
    .filter(item => {
      // 1. Tab check (tipo_anuncio matching activeTab)
      if (item.tipo_anuncio !== activeTab && item.tipo_anuncio !== `${activeTab} de resíduo`) {
        return false
      }

      // 2. Name search (nome_material / searchName)
      if (searchName) {
        const query = searchName.toLowerCase()
        const itemNome = item.nome_material || item.titulo || item.residuo || ''
        const codeMatch = String(item.codigo || '').toLowerCase().includes(query)
        if (!itemNome.toLowerCase().includes(query) && !codeMatch) return false
      }

      // 3. Grupo check (Materra Compliance Group)
      if (filterGrupo) {
        const itemGrupo = item.grupo !== undefined && item.grupo !== null ? item.grupo : (item.classe?.includes('Classe I') ? 4 : 3)
        if (String(itemGrupo) !== filterGrupo) return false
      }

      // 4. Categoria / Categoria_subcategoria
      if (filterCategory) {
        const itemCat = item.categoria_subcategoria || item.categoria || ''
        if (!itemCat.toLowerCase().includes(filterCategory.toLowerCase())) return false
      }

      // 5. Resíduo específico
      if (filterResiduo) {
        const itemRes = item.residuo || ''
        if (!itemRes.toLowerCase().includes(filterResiduo.toLowerCase())) return false
      }

      // 6. Classe
      if (filterClasse && filterClasse !== 'Todas') {
        const itemClass = item.classe || ''
        if (filterClasse === 'I' && !itemClass.includes('I –') && itemClass !== 'I') return false
        if (filterClasse === 'IIA' && !itemClass.includes('IIA') && itemClass !== 'IIA') return false
        if (filterClasse === 'IIB' && !itemClass.includes('IIB') && itemClass !== 'IIB') return false
      }

      // 7. Distancia (Simulated distance filter check)
      if (filterDistancia && filterDistancia !== 'Sem limite') {
        const maxDist = parseInt(filterDistancia) || 9999
        const itemDist = item.distancia_km !== undefined ? item.distancia_km : 120
        if (itemDist > maxDist) return false
      }

      // 8. Tipo_fluxo (VENDA, PASSIVO, DOACAO, COMPRA)
      if (filterFluxo) {
        const itemFluxo = item.tipo_fluxo || (item.forma_cobranca?.includes('Recebo') ? 'VENDA' : item.forma_cobranca?.includes('Doação') ? 'DOACAO' : 'PASSIVO')
        if (itemFluxo !== filterFluxo) return false
      }

      // 9. Regime_fornecimento (LOTE_UNICO, CONTRATO)
      if (filterContract) {
        const itemRegime = item.regime_fornecimento || (item.prazo_recorrencia ? 'CONTRATO' : 'LOTE_UNICO')
        if (filterContract === 'Lote Único' && itemRegime !== 'LOTE_UNICO') return false
        if (filterContract === 'Contrato' && itemRegime !== 'CONTRATO') return false
      }

      // 10. Volume_total (Volume Range check)
      const itemVol = item.volume_total !== undefined ? item.volume_total : item.quantidade
      if (filterQtyMin && itemVol < parseFloat(filterQtyMin)) return false
      if (filterQtyMax && itemVol > parseFloat(filterQtyMax)) return false

      // 11. Aceita_menor_valor (Checkbox / boolean)
      if (filterAceitaMenor && !item.aceita_menor_valor) return false

      // 12. Preco_unidade (Price Range check)
      const itemPrice = item.preco_unidade !== undefined ? item.preco_unidade : item.valor_desejado
      if (filterPriceMin && itemPrice < parseFloat(filterPriceMin)) return false
      if (filterPriceMax && itemPrice > parseFloat(filterPriceMax)) return false

      // 13. Situacao_anuncio (NORMAL, DESTAQUE, EMERGENCIA)
      if (filterSituacao) {
        const itemSituacao = item.situacao_anuncio || (item.urgencia_prazo === 'Urgente' ? 'EMERGENCIA' : 'NORMAL')
        if (itemSituacao !== filterSituacao) return false
      }

      // 14. Selo_minimo (LIVRE, BRONZE, PRATA, OURO)
      if (filterSelo) {
        const itemSelo = item.selo_minimo || (item.cadastros?.nivel_selo === 'Sem' ? 'LIVRE' : String(item.cadastros?.nivel_selo || 'LIVRE').toUpperCase())
        if (filterSelo !== 'LIVRE' && itemSelo !== filterSelo) return false
      }

      // 15. Tem_avaliacao (Checkbox / boolean)
      if (filterTemAvaliacao) {
        const itemAval = item.tem_avaliacao !== undefined ? item.tem_avaliacao : item.tem_licenca
        const expectedAval = filterTemAvaliacao === 'true'
        if (itemAval !== expectedAval) return false
      }

      // 16. Responsavel_frete (true = Advertiser, false = Contraparte)
      if (filterResponsavelFrete) {
        const itemFrete = item.responsavel_frete !== undefined ? item.responsavel_frete : (item.quem_arca_frete === 'EU')
        const expectedFrete = filterResponsavelFrete === 'true'
        if (itemFrete !== expectedFrete) return false
      }

      // 17. Infraestrutura_minima
      if (filterInfraestrutura) {
        const itemInfra = item.infraestrutura_minima || []
        if (!itemInfra.includes(filterInfraestrutura)) return false
      }

      // 18. Estado físico
      if (filterEstadoFisico && item.estado_fisico !== filterEstadoFisico) return false

      // 19. Acondicionamento
      if (filterAcondicionamento && !String(item.acondicionamento || '').includes(filterAcondicionamento)) return false

      // 20. Location (UF & Cidade)
      if (filterUf && item.uf !== filterUf) return false
      if (filterMunicipio && !item.municipio?.toLowerCase().includes(filterMunicipio.toLowerCase())) return false

      // 21. Legacy Urgent filter (keeps fallback matching)
      if (filterUrgent && item.urgencia_prazo !== 'Urgente') return false

      return true
    })
    .sort((a, b) => {
      if (sortBy === 'Mais recente') {
        return new Date(b.data_publicacao || b.created_at || '').getTime() - new Date(a.data_publicacao || a.created_at || '').getTime()
      }
      if (sortBy === 'Maior quantidade') {
        return b.quantidade - a.quantidade
      }
      if (sortBy === 'Menor preço') {
        return a.valor_desejado - b.valor_desejado
      }
      if (sortBy === 'Mais próximo') {
        const userUf = userProfile?.uf || ''
        const aMatch = a.uf === userUf ? 1 : 0
        const bMatch = b.uf === userUf ? 1 : 0
        return bMatch - aMatch
      }
      return 0
    })

  const getAdvertiserRoleLabel = (item: any) => {
    if (!item) return ''
    const tipo = item.cadastros?.tipo_parte || (item.tipo_anuncio?.toLowerCase().includes('demanda') ? 'Comprador' : 'Fornecedor')
    const sub = item.cadastros?.subtipo || 'Empresa'
    
    if (sub === 'Corretor' || sub === 'Corretor/Controlador') {
      return 'Corretor / Controlador'
    }
    return `Empresa ${tipo === 'Fornecedor' ? 'Fornecedora' : tipo === 'Comprador' ? 'Compradora' : tipo}`
  }

  const generateUuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  const openLeadFeeModal = (listing: any) => {
    // 1. Check if logged in
    const localProfileStr = localStorage.getItem('materra_profile')
    const localUserStr = localStorage.getItem('materra_user')
    let currentProfile = userProfile
    if (!currentProfile && localProfileStr) {
      currentProfile = JSON.parse(localProfileStr)
    }

    if (!localUserStr || !currentProfile) {
      alert('Por favor, faça login ou cadastre-se para participar de negociações.')
      router.push('/auth/cadastro') // Cadastrar ou login
      return
    }

    // 2. Validate specialty
    const userRole = currentProfile.tipo_parte // 'Fornecedor', 'Comprador', 'Transportadora', 'Consultor' or 'Fornecedor & Comprador'
    const isOffer = listing.tipo_anuncio?.toLowerCase().includes('oferta')
    const isDemand = listing.tipo_anuncio?.toLowerCase().includes('demanda') || listing.tipo_anuncio?.toLowerCase().includes('pedido')

    let allowed = false
    if (userRole === 'Fornecedor & Comprador' || userRole === 'Ambos') {
      allowed = true
    } else if (isOffer && userRole === 'Comprador') {
      allowed = true
    } else if (isDemand && userRole === 'Fornecedor') {
      allowed = true
    }

    if (!allowed) {
      setWarningType(isOffer ? 'Oferta' : 'Demanda')
      setShowSpecialtyWarning(true)
      return
    }

    // Calculate lead fee
    const qty = Number(listing.quantidade) || 0
    const price = Number(listing.valor_desejado) || 0
    const totalVal = qty * price
    let fee = 80
    if (listing.forma_cobranca?.toLowerCase().includes('doação') || price === 0) {
      fee = 80
    } else {
      const pctFee = totalVal * 0.015
      fee = Math.max(80, pctFee)
    }

    setSelectedListingForLead(listing)
    setLeadFeeValue(fee)
    setShowLeadFeeModal(true)
  }

  const handleConfirmLeadFee = async () => {
    if (!selectedListingForLead) return
    
    // Retrieve logged in user
    const localUserStr = localStorage.getItem('materra_user')
    const localProfileStr = localStorage.getItem('materra_profile')
    if (!localUserStr || !localProfileStr) return

    const currentUser = JSON.parse(localUserStr)
    const currentProfile = JSON.parse(localProfileStr)

    const proponenteId = currentUser.id
    const proponenteName = currentProfile.nome_ou_razao

    const roomUuid = generateUuid()
    const propostaUuid = generateUuid()

    // 2. Update listing status to 'Em negociação' in localStorage/Supabase
    try {
      const localListStr = localStorage.getItem('materra_local_anuncios') || '[]'
      const localList = JSON.parse(localListStr)
      const index = localList.findIndex((item: any) => item.id === selectedListingForLead.id)
      if (index !== -1) {
        localList[index].status = 'Em negociação'
        localStorage.setItem('materra_local_anuncios', JSON.stringify(localList))
      }
      
      // Update in Supabase
      await supabase
        .from('anuncios')
        .update({ status: 'Em negociação' })
        .eq('id', selectedListingForLead.id)
    } catch (e) {
      console.warn('Could not update status in DB/local list:', e)
    }

    // 3. Create a proposal record in Supabase
    const newProposal = {
      id: propostaUuid,
      id_anuncio: selectedListingForLead.id,
      id_proponente: proponenteId,
      papel_proponente: currentProfile.tipo_parte === 'Comprador' ? 'Comprador' : 'Fornecedor',
      valor_proposto: selectedListingForLead.valor_desejado,
      status: 'Enviada',
      observacoes: 'Taxa Lead Paga. Negociação Iniciada.'
    }

    try {
      await supabase.from('propostas').insert([newProposal])
    } catch (e) {
      console.warn('Could not insert proposal in Supabase:', e)
    }

    // Store in localStorage negotiations index
    try {
      const activeRoomsStr = localStorage.getItem('materra_active_negotiations') || '[]'
      const activeRooms = JSON.parse(activeRoomsStr)
      
      const existingIndex = activeRooms.findIndex((r: any) => r.id_anuncio === selectedListingForLead.id && r.id_proponente === proponenteId)
      if (existingIndex === -1) {
        activeRooms.push({
          id: roomUuid,
          id_anuncio: selectedListingForLead.id,
          id_proponente: proponenteId,
          proponente_nome: proponenteName,
          proponente_selo: currentProfile.nivel_selo || 'Bronze',
          proponente_score: currentProfile.score_0a100 || 45,
          created_at: new Date().toISOString(),
          status: 'Ativa',
          taxa_lead_paga: true,
          taxa_lead_valor: leadFeeValue,
          mensagens: [
            {
              id: 'msg_1',
              remetente_id: proponenteId,
              remetente_nome: proponenteName,
              texto: selectedListingForLead.forma_cobranca?.toLowerCase().includes('doação') 
                ? `Vou recolher sua doação de ${selectedListingForLead.quantidade} ${selectedListingForLead.unidade}` 
                : `Tenho interesse em ${selectedListingForLead.quantidade} ${selectedListingForLead.unidade} ao preço de R$ ${Number(selectedListingForLead.valor_desejado).toLocaleString('pt-BR', {minimumFractionDigits:2})}/${selectedListingForLead.unidade}`,
              tipo: 'PROPOSTA_INICIAL',
              quantidade: selectedListingForLead.quantidade,
              preco: selectedListingForLead.valor_desejado,
              timestamp: new Date().toISOString()
            }
          ]
        })
        localStorage.setItem('materra_active_negotiations', JSON.stringify(activeRooms))
      }
    } catch (e) {
      console.warn('Could not update active negotiations in localStorage:', e)
    }

    // 4. Save to Audit Trail
    try {
      const auditTrailStr = localStorage.getItem('materra_compliance_audit_trail') || '[]'
      const auditTrail = JSON.parse(auditTrailStr)
      auditTrail.unshift({
        event_type: 'LEAD_FEE_PAID',
        event_category: 'Financeiro',
        action: 'LEAD_FEE_PAYMENT',
        entity_type: 'Negociação',
        entity_id: roomUuid,
        actor: proponenteName,
        details: `Taxa Lead de R$ ${leadFeeValue.toFixed(2)} paga para anúncio [${selectedListingForLead.codigo || 'Novo'}].`,
        timestamp: new Date().toISOString(),
        status: 'Íntegro',
        hash: 'SHA256-' + Math.random().toString(36).substring(2, 15)
      })
      localStorage.setItem('materra_compliance_audit_trail', JSON.stringify(auditTrail))
    } catch (e) {
      console.warn('Could not write to audit trail:', e)
    }

    setShowLeadFeeModal(false)
    router.push(`/sala?id=${roomUuid}`)
  }
  const triggerPixPayment = (item: any, type: 'NORMAL' | 'SUPER_CONTATO', amount: number) => {
    if (!user) {
      alert('Faça login para prosseguir com o pagamento.')
      return
    }
    setPixPaymentModal({ item, type, amount })
  }

  const handleConfirmPixPayment = async () => {
    if (!pixPaymentModal || !user) return
    const { item, type, amount } = pixPaymentModal

    try {
      // 1. Update/insert contatos table
      const leadId = crypto.randomUUID()
      const { error: errCp } = await supabase
        .from('contatos')
        .insert([{
          id: leadId,
          id_usuario: user.id,
          id_contraparte: item.id_cadastro || '11111111-1111-1111-1111-111111111111',
          id_anuncio: item.id,
          liberado: type === 'SUPER_CONTATO',
          taxa_lead_paga: true,
          taxa_lead_valor: amount,
          tipo_lead: type,
          valor_pago: amount
        }])

      if (errCp) throw errCp

      // 2. Calculate dates for room timer if active
      let updateFields: any = { status: 'Em negociação', taxa_paga: true }
      if (item.habilitar_sala_leilao) {
        if (!item.data_abertura_leilao) {
          const nowStr = new Date().toISOString()
          const durationHrs = item.duracao_leilao_horas || 48
          const endStr = new Date(Date.now() + durationHrs * 60 * 60 * 1000).toISOString()
          updateFields.data_abertura_leilao = nowStr
          updateFields.data_fim_real = endStr
        }
      }

      // Update in Supabase anuncios table
      const { error: errAd } = await supabase
        .from('anuncios')
        .update(updateFields)
        .eq('id', item.id)

      if (errAd) throw errAd

      // 3. Create negotiation room in localStorage
      try {
        const activeRoomsStr = localStorage.getItem('materra_active_negotiations') || '[]'
        const activeRooms = JSON.parse(activeRoomsStr)
        const roomUuid = crypto.randomUUID()
        const proponenteName = userProfile?.nome_ou_razao || user.email || 'Interessado'
        const existingIndex = activeRooms.findIndex((r: any) => r.id_anuncio === item.id && r.id_proponente === user.id)
        if (existingIndex === -1) {
          activeRooms.push({
            id: roomUuid,
            id_anuncio: item.id,
            id_proponente: user.id,
            proponente_nome: proponenteName,
            proponente_selo: userProfile?.nivel_selo || 'Bronze',
            proponente_score: userProfile?.score_0a100 || 45,
            created_at: new Date().toISOString(),
            status: 'Ativa',
            taxa_lead_paga: true,
            taxa_lead_valor: amount,
            mensagens: [
              {
                id: 'msg_1',
                remetente_id: user.id,
                remetente_nome: proponenteName,
                texto: type === 'SUPER_CONTATO' 
                  ? `Iniciando contato prioritário via Super Contato!` 
                  : `Tenho interesse e entrei na sala de negociação.`,
                tipo: 'PROPOSTA_INICIAL',
                quantidade: item.quantidade || 0,
                preco: item.valor_desejado || 0,
                timestamp: new Date().toISOString()
              }
            ]
          })
          localStorage.setItem('materra_active_negotiations', JSON.stringify(activeRooms))
        }
      } catch (e) {
        console.warn('Could not update active negotiations locally:', e)
      }

      // 4. Save to Audit Trail
      try {
        const auditTrailStr = localStorage.getItem('materra_compliance_audit_trail') || '[]'
        const auditTrail = JSON.parse(auditTrailStr)
        auditTrail.unshift({
          event_type: 'LEAD_FEE_PAID',
          event_category: 'Financeiro',
          event_description: `Pagamento de Pix de R$ ${amount},00 simulado com sucesso para lead do anúncio [${item.codigo || item.id.substring(0, 6)}]. Tipo: ${type}`,
          actor_id: user.id,
          actor_name: userProfile?.nome_ou_razao || user.email,
          timestamp: new Date().toISOString()
        })
        localStorage.setItem('materra_compliance_audit_trail', JSON.stringify(auditTrail))
      } catch (e) {
        console.warn('Could not save to audit trail:', e)
      }

      alert(`Pagamento de R$ ${amount},00 processado com sucesso! Redirecionando para seus negócios...`)
      setPixPaymentModal(null)
      router.push('/?view=negocios')

    } catch (e: any) {
      alert('Erro ao processar simulação de Pix: ' + e.message)
    }
  }
  const handleInterest = async (listing: any) => {
    openLeadFeeModal(listing)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      color: 'var(--text-primary)'
    }}>
      {/* HEADER */}
      <nav style={{
        background: 'var(--glass-bg)',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <LogoGlobe size={28} />
            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>
              MATERRA ELO
            </span>
          </Link>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="/anuncios/publicar" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem', fontWeight: 'bold' }}>
              + Novo Anúncio
            </Link>
            <Link href="/" className="btn-link" style={{ fontSize: '0.9rem', alignSelf: 'center', color: '#888', textDecoration: 'none' }}>
              Voltar
            </Link>
          </div>
        </div>
      </nav>

      {/* TABS */}
      <div style={{ background: '#111', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          gap: '24px'
        }}>
          <button
            onClick={() => { setActiveTab('Oferta'); setExpandedCardId(null); }}
            style={{
              padding: '16px 24px',
              border: 'none',
              background: 'none',
              color: activeTab === 'Oferta' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'Oferta' ? '3px solid var(--primary)' : '3px solid transparent',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '1rem',
              fontFamily: 'var(--font-heading)'
            }}
          >
            Ofertas (Quem Vende)
          </button>
          <button
            onClick={() => { setActiveTab('Demanda'); setExpandedCardId(null); }}
            style={{
              padding: '16px 24px',
              border: 'none',
              background: 'none',
              color: activeTab === 'Demanda' ? 'var(--accent)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'Demanda' ? '3px solid var(--accent)' : '3px solid transparent',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '1rem',
              fontFamily: 'var(--font-heading)'
            }}
          >
            Demandas (Quem Compra)
          </button>
        </div>
      </div>

      {/* CONTENT & FILTERS */}
      <div style={{
        maxWidth: '1400px',
        margin: '24px auto',
        padding: '0 20px',
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '24px',
        width: '100%',
        flex: 1
      }}>
        {/* FILTERS PANEL */}
        <aside style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '20px',
          maxHeight: 'calc(100vh - 140px)',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          position: 'sticky',
          top: '90px',
          zIndex: 10
        }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-heading)' }}>
            <span>Filtros Avançados</span>
            <button onClick={() => {
              setFilterGrupo(''); setFilterCategory(''); setFilterResiduo(''); setFilterClasse('');
              setFilterEstadoFisico(''); setFilterAcondicionamento(''); setFilterUf('');
              setFilterMunicipio(''); setFilterQtyMin(''); setFilterQtyMax('');
              setFilterFrequencia(''); setFilterPriceMin(''); setFilterPriceMax('');
              setFilterSelo(''); setFilterDocs(''); setFilterContract('');
              setFilterUrgent(false); setSearchName('');
              setFilterDistancia('Sem limite'); setFilterFluxo('');
              setFilterAceitaMenor(false); setFilterSituacao('');
              setFilterTemAvaliacao(''); setFilterResponsavelFrete('');
              setFilterInfraestrutura('');
            }} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>
              Limpar Todos
            </button>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 1. Nome do Material (Filtro de busca livre já integrado na barra de busca superior, mas adicionamos um aviso ou caixa extra se o usuário quiser) */}

            {/* 2. Grupo Compliance */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Compliance Grupo</label>
              <select className="form-select" value={filterGrupo} onChange={e => setFilterGrupo(e.target.value)}>
                <option value="">Todos</option>
                <option value="1">Grupo 1 (Coproduto)</option>
                <option value="2">Grupo 2 (Resíduo Classe II-A)</option>
                <option value="3">Grupo 3 (Resíduo Classe II-B)</option>
                <option value="4">Grupo 4 (Classe I Perigoso)</option>
              </select>
            </div>

            {/* 3. Categoria IBAMA */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Categoria / Capítulo</label>
              <select className="form-select" value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setFilterResiduo(''); }}>
                <option value="">Todas</option>
                {Object.keys(CATALOGO_MATERRA_ELO).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {filterCategory && (
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Resíduo específico</label>
                <select className="form-select" value={filterResiduo} onChange={e => setFilterResiduo(e.target.value)}>
                  <option value="">Todos</option>
                  {(CATALOGO_MATERRA_ELO[filterCategory]?.subcategorias || []).map(res => (
                    <option key={res} value={res}>{res}</option>
                  ))}
                </select>
              </div>
            )}

            {/* 4. Situação do Anúncio */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Situação do Anúncio</label>
              <select className="form-select" value={filterSituacao} onChange={e => {
                setFilterSituacao(e.target.value);
                setFilterUrgent(e.target.value === 'EMERGENCIA');
              }}>
                <option value="">Todas</option>
                <option value="NORMAL">Normal</option>
                <option value="DESTAQUE">Destaque (Selo)</option>
                <option value="EMERGENCIA">🚨 Emergência (Urgente)</option>
              </select>
            </div>

            {/* 5. Tipo de Fluxo */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Tipo de Fluxo</label>
              <select className="form-select" value={filterFluxo} onChange={e => setFilterFluxo(e.target.value)}>
                <option value="">Todos</option>
                <option value="VENDA">Venda (Oferta comercial)</option>
                <option value="COMPRA">Compra (Demanda comercial)</option>
                <option value="PASSIVO">Passivo (Pago para destinar)</option>
                <option value="DOACAO">Doação (Retirada grátis)</option>
              </select>
            </div>

            {/* 6. Regime de Fornecimento */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Regime de Fornecimento</label>
              <select className="form-select" value={filterContract} onChange={e => setFilterContract(e.target.value)}>
                <option value="">Todos</option>
                <option value="Lote Único">Lote Único</option>
                <option value="Contrato">Contrato Recorrente</option>
              </select>
            </div>

            {/* 7. Volume Total Range */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Volume Total</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="number" placeholder="Mín" className="form-input" style={{ width: '50%' }} value={filterQtyMin} onChange={e => setFilterQtyMin(e.target.value)} />
                <input type="number" placeholder="Máx" className="form-input" style={{ width: '50%' }} value={filterQtyMax} onChange={e => setFilterQtyMax(e.target.value)} />
              </div>
              <select className="form-select" style={{ marginTop: '6px' }} value={filterQtyUnit} onChange={e => setFilterQtyUnit(e.target.value)}>
                <option value="t">t (Tonelada)</option>
                <option value="kg">kg (Quilograma)</option>
                <option value="L">L (Litro)</option>
                <option value="m³">m³ (Metro Cúbico)</option>
                <option value="unidade">unidades</option>
              </select>
            </div>

            {/* 8. Preço Unitário Range */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Preço Unitário (R$)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="number" placeholder="Mín" className="form-input" style={{ width: '50%' }} value={filterPriceMin} onChange={e => setFilterPriceMin(e.target.value)} />
                <input type="number" placeholder="Máx" className="form-input" style={{ width: '50%' }} value={filterPriceMax} onChange={e => setFilterPriceMax(e.target.value)} />
              </div>
            </div>

            {/* 9. Aceita Menor Valor */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#ccc', cursor: 'pointer' }}>
              <input type="checkbox" checked={filterAceitaMenor} onChange={e => setFilterAceitaMenor(e.target.checked)} />
              Aceita proposta menor
            </label>

            {/* 10. Selo Mínimo Anunciante */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Selo Mínimo</label>
              <select className="form-select" value={filterSelo} onChange={e => setFilterSelo(e.target.value)}>
                <option value="">Todos</option>
                <option value="OURO">Ouro</option>
                <option value="PRATA">Prata</option>
                <option value="BRONZE">Bronze</option>
                <option value="LIVRE">Sem exigência</option>
              </select>
            </div>

            {/* 11. Tem Avaliação / Laudo */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Possui Laudo Químico</label>
              <select className="form-select" value={filterTemAvaliacao} onChange={e => setFilterTemAvaliacao(e.target.value)}>
                <option value="">Indiferente</option>
                <option value="true">Sim (Laudo Anexado)</option>
                <option value="false">Não</option>
              </select>
            </div>

            {/* 12. Responsável pelo Frete */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Responsável Frete</label>
              <select className="form-select" value={filterResponsavelFrete} onChange={e => setFilterResponsavelFrete(e.target.value)}>
                <option value="">Indiferente</option>
                <option value="true">Anunciante paga</option>
                <option value="false">Contraparte paga</option>
              </select>
            </div>

            {/* 13. Infraestrutura Mínima */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Infraestrutura Mínima</label>
              <select className="form-select" value={filterInfraestrutura} onChange={e => setFilterInfraestrutura(e.target.value)}>
                <option value="">Todas</option>
                <option value="Balança no local">Balança no local</option>
                <option value="Ponte rolante">Ponte rolante</option>
                <option value="Empilhadeira no local">Empilhadeira</option>
                <option value="Rampa de acesso">Rampa de acesso</option>
              </select>
            </div>

            {/* 14. Distância Máxima */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Distância Limite</label>
              <select className="form-select" value={filterDistancia} onChange={e => setFilterDistancia(e.target.value)}>
                <option value="Sem limite">Sem limite (Qualquer distância)</option>
                <option value="50">Até 50 km</option>
                <option value="100">Até 100 km</option>
                <option value="300">Até 300 km</option>
                <option value="500">Até 500 km</option>
              </select>
            </div>

            {/* Location (UF & Cidade) removed by request */}
          </div>
        </aside>

        {/* LISTINGS DISPLAY & ORDERING */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* SEARCH BAR (Passo 0 name finder) */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <Search size={20} style={{ color: 'var(--primary)' }} />
            <input
              type="text"
              placeholder="Buscar por nome do anúncio, resíduo ou código..."
              className="form-input"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              style={{ flex: 1, padding: '10px 14px', background: '#070707', border: '1px solid #222', borderRadius: '6px', fontSize: '0.9rem', color: '#fff' }}
            />
          </div>

          {/* Result Count and Sort controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Encontrados <strong style={{ color: 'var(--primary)' }}>{filteredListings.length}</strong> anúncios
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ordenar:</label>
              <select className="form-select" style={{ padding: '6px 12px', width: '180px' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="Mais recente">Mais recente</option>
                <option value="Maior quantidade">Maior quantidade</option>
                <option value="Menor preço">Menor preço</option>
                <option value="Mais próximo">Mais próximo (UF)</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)' }}>Carregando listagem de resíduos...</p>
          ) : filteredListings.length === 0 ? (
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-color)',
              padding: '60px 20px',
              textAlign: 'center',
              borderRadius: '12px'
            }}>
              <span style={{ fontSize: '3rem' }}>🔍</span>
              <h3 style={{ marginTop: '16px', color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>Nenhum anúncio encontrado</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>Experimente remover alguns filtros ou limpar a caixa de pesquisa.</p>
            </div>
          ) : (
            /* Cards List (OLX Style 3 Columns) */
            <div className="olx-grid">
              {filteredListings.map((item, idx) => {
                const isExpanded = expandedCardId === item.id
                const advertiserSeal = item.cadastros?.nivel_selo || 'Sem Selo'
                const dev = getListingDeviation(item)
                const isFavorite = savedIds.includes(item.id)
                const isEmergencial = item.urgencia_prazo === 'Urgente'
                const days = idx === 0 ? 4 : idx === 1 ? 9 : idx === 2 ? 14 : 7

                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--surface)',
                      border: isExpanded ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                      boxShadow: isExpanded ? '0 0 15px rgba(255, 215, 0, 0.08)' : 'none',
                      borderRadius: '12px',
                      padding: '24px',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      position: 'relative'
                    }}
                  >
                    {/* CARD COLLAPSED (PART 1) */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ flex: 1, minWidth: '280px' }}>
                        {/* Upper Badges */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            background: item.tipo_anuncio?.toLowerCase().includes('oferta') ? 'rgba(67,160,71,0.1)' : 'rgba(0,188,212,0.1)',
                            color: item.tipo_anuncio?.toLowerCase().includes('oferta') ? 'var(--primary-400)' : 'var(--accent-400)',
                            textTransform: 'uppercase'
                          }}>
                            {item.tipo_anuncio?.toLowerCase().includes('oferta') ? 'Oferta' : 'Demanda'}
                          </span>

                          {isEmergencial && (
                            <span style={{ background: 'rgba(239, 83, 80, 0.15)', color: '#ef5350', border: '1px solid #ef5350', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px' }}>
                              🚨 URGENTE
                            </span>
                          )}

                          <span style={{ fontSize: '0.75rem', color: '#ffb300', fontWeight: 'bold' }}>
                            CONFIDENCIAL • {getAdvertiserRoleLabel(item)}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>
                          {item.titulo || item.residuo}
                        </h3>

                        {/* Secondary metadata */}
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.8rem', color: '#888', flexWrap: 'wrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            🏅 {advertiserSeal} (Score {item.cadastros?.score_0a100 || 50})
                          </span>
                          <span>•</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <MapPin size={12} /> {(() => {
                              if (!userProfile) return 'Distância sob consulta (Faça login)'
                              const dist = getDistanceBetweenCeps(userProfile.cep || '74000-000', item.cep || '75000-000')
                              return `A ~${dist} km de você`
                            })()}
                          </span>
                        </div>
                      </div>

                      {/* Right Side price indicator */}
                      <div style={{ textAlign: 'right', minWidth: '150px' }}>
                        {item.forma_cobranca?.toLowerCase().includes('doação') || Number(item.valor_desejado) === 0 ? (
                          <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>Doação Gratuita</strong>
                        ) : (
                          <div>
                            <strong style={{ fontSize: '1.35rem', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                              R$ {Number(item.valor_desejado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </strong>
                            <span style={{ fontSize: '0.8rem', color: '#888' }}> / {item.unidade || 't'}</span>
                          </div>
                        )}
                        <div style={{ fontSize: '0.75rem', color: dev.color, fontWeight: 'bold', marginTop: '4px' }}>
                          {dev.arrow} desvio: {dev.label}
                        </div>
                      </div>
                    </div>

                    {/* PRINCIPAIS INFOS GRID */}
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
                        <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', display: 'block', fontWeight: 'bold' }}>📦 Material & Tipo</span>
                        <span style={{ fontSize: '0.85rem', color: '#ccc', fontWeight: 'bold', display: 'block', marginTop: '2px' }}>
                          {item.quantidade} {item.unidade} ({item.estado_fisico})
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginTop: '2px' }}>
                          IBAMA: {item.codigo_ibama || 'N/A'} • {item.classe?.replace('Classe ', '')}
                        </span>
                      </div>

                      <div>
                        <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', display: 'block', fontWeight: 'bold' }}>🔄 Coleta & Recorrência</span>
                        <span style={{ fontSize: '0.85rem', color: '#ccc', fontWeight: 'bold', display: 'block', marginTop: '2px' }}>
                          {item.frequencia === 'Única' ? 'Lote Único' : `Recorrente ${item.frequencia}`}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 'bold', display: 'block', marginTop: '2px' }}>
                          CONTRATO: {item.prazo_recorrencia || 'Lote Único'}
                        </span>
                      </div>

                      <div>
                        <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', display: 'block', fontWeight: 'bold' }}>📊 Negociação</span>
                        <span style={{ fontSize: '0.85rem', color: '#ccc', fontWeight: 'bold', display: 'block', marginTop: '2px' }}>
                          Leilão {item.tipo_leilao || 'Ascendente'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginTop: '2px' }}>
                          Index: R$ {Number(item.valor_index || 340).toLocaleString('pt-BR')} / {item.unidade || 't'}
                        </span>
                      </div>

                      <div>
                        <span style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', display: 'block', fontWeight: 'bold' }}>⏱️ Leilão & Duração</span>
                        <span style={{ fontSize: '0.85rem', color: '#ccc', fontWeight: 'bold', display: 'block', marginTop: '2px' }}>
                          {item.habilitar_sala_leilao ? (
                            !item.data_abertura_leilao ? (
                              <span style={{ color: '#ffd700' }}>Aguardando 1º lance</span>
                            ) : (
                              <LeilaoTimer endDate={item.data_fim_real} />
                            )
                          ) : (
                            <span style={{ color: '#888' }}>Sem leilão (Super Contato)</span>
                          )}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginTop: '2px' }}>
                          Frete: {item.responsavel_frete ? 'Anunciante paga' : 'Contraparte paga'}
                        </span>
                      </div>
                    </div>

                    {/* Mídia & Document Requirements Bar */}
                    <div style={{ marginTop: '16px', borderTop: '1px solid #222', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {item.foto_url && (
                          <div style={{ width: '30px', height: '30px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #333' }}>
                            <img src={item.foto_url} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        {item.video_url && <span style={{ fontSize: '0.7rem', background: '#222', padding: '4px 6px', borderRadius: '4px', color: '#fff' }}>🎥 Vídeo</span>}
                        {item.tem_licenca && <span style={{ fontSize: '0.7rem', background: 'rgba(76,175,80,0.1)', padding: '4px 6px', borderRadius: '4px', color: '#81c784', fontWeight: 'bold' }}>📄 Licença / MTR</span>}
                      </div>

                      {/* Voluntary requested documents info */}
                      <span style={{ fontSize: '0.75rem', color: '#aaa' }}>
                        Requisitos: <strong style={{ color: '#fff' }}>{item.observacoes?.split('Documentos:').pop()?.split('|')[0] || 'Licença Ambiental'}</strong>
                      </span>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px', alignItems: 'center' }}>
                      <button
                        onClick={() => setExpandedCardId(isExpanded ? null : item.id)}
                        style={{
                          background: 'none',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          padding: '10px 18px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                      >
                        {isExpanded ? (
                          <>Ocultar Detalhes <ChevronUp size={16} /></>
                        ) : (
                          <>Ver Detalhes Completos <ChevronDown size={16} /></>
                        )}
                      </button>

                      {item.habilitar_sala_leilao ? (
                        <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                          <button
                            onClick={() => triggerPixPayment(item, 'NORMAL', 20)}
                            style={{
                              flex: 1, padding: '10px 10px', borderRadius: '6px', fontSize: '0.78rem',
                              fontWeight: 700, background: 'none', color: 'var(--primary)',
                              border: '1px solid var(--primary)', cursor: 'pointer', fontFamily: 'inherit'
                            }}
                          >NEGOCIAR - Taxa Normal</button>
                          <button
                            onClick={() => triggerPixPayment(item, 'SUPER_CONTATO', 80)}
                            style={{
                              flex: 1, padding: '10px 10px', borderRadius: '6px', fontSize: '0.78rem',
                              fontWeight: 700, background: 'var(--primary)', color: '#000',
                              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                              boxShadow: '0 4px 10px rgba(255, 215, 0, 0.15)'
                            }}
                          >PULAR NEGOCIAÇÃO - R$ 80</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => triggerPixPayment(item, 'SUPER_CONTATO', 45)}
                          style={{
                            flex: 1, padding: '10px 24px', borderRadius: '6px', fontSize: '0.85rem',
                            fontWeight: 700, background: 'var(--primary)', color: '#000',
                            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                            boxShadow: '0 4px 10px rgba(255, 215, 0, 0.15)'
                          }}
                        >Negociar - R$ 45,00</button>
                      )}

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => handleToggleFavorite(item.id, e)}
                        style={{
                          background: 'none',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: isFavorite ? 'var(--danger)' : '#888',
                          padding: '10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: 'auto'
                        }}
                        title={isFavorite ? 'Remover dos favoritos' : 'Salvar anúncio'}
                      >
                        <Heart size={16} fill={isFavorite ? 'var(--danger)' : 'none'} />
                      </button>
                    </div>

                    {/* CARD EXPANDED DETAILS (PART 2) */}
                    {isExpanded && (
                      <div style={{
                        marginTop: '20px',
                        borderTop: '1px dashed #333',
                        paddingTop: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        animation: 'fadeIn 0.2s ease'
                      }}>
                        
                        {/* Process and Origin description */}
                        <div>
                          <strong style={{ color: 'var(--primary)', fontSize: '0.85rem', display: 'block', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                            📝 Origem & Processo Gerador
                          </strong>
                          <p style={{ margin: 0, fontSize: '0.9rem', color: '#ccc', lineHeight: 1.5, background: '#0a0a0a', padding: '14px', borderRadius: '6px', border: '1px solid #222' }}>
                            {item.origem_processo || 'Nenhuma descrição fornecida pelo anunciante.'}
                          </p>
                        </div>

                        {/* Especificações Técnicas (Passo 2 e 3) */}
                        <div>
                          <strong style={{ color: 'var(--primary)', fontSize: '0.85rem', display: 'block', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                            🔬 Especificações Técnicas (Materra Elo)
                          </strong>
                          <div style={{ padding: '14px', fontSize: '0.9rem', color: '#ccc', background: '#0a0a0a', borderRadius: '6px', border: '1px solid #222', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                            <div><b>Grupo:</b> {item.grupo || 'N/A'}</div>
                            <div><b>Categoria/Subcategoria:</b> {item.categoria_subcategoria || item.categoria || 'N/A'}</div>
                            <div><b>Código IBAMA:</b> {item.codigo_ibama || 'N/A'}</div>
                            <div><b>Classe:</b> {item.classe || item.classe_residuo || 'N/A'}</div>
                            <div><b>Volume Total:</b> {item.volume_total || item.quantidade} {item.unidade || 't'}</div>
                            <div><b>Acondicionamento:</b> {item.acondicionamento || 'N/A'}</div>
                            <div><b>Infraestrutura Mínima:</b> {Array.isArray(item.infraestrutura_minima) ? item.infraestrutura_minima.join(', ') : item.infraestrutura_minima || 'N/A'}</div>
                            <div><b>Características:</b> {item.caracteristicas || 'N/A'}</div>
                          </div>
                        </div>

                        {/* Physical attributes / Characteristics */}
                        {item.caracteristicas && (
                          <div>
                            <strong style={{ color: 'var(--primary)', fontSize: '0.85rem', display: 'block', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                              🧪 Características do Material
                            </strong>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                              {item.caracteristicas.split(', ').map((c: string) => (
                                <span key={c} style={{ background: '#222', border: '1px solid #333', color: '#ccc', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '4px' }}>
                                  {c}
                                </span>
                              ))}
                            </div>
                            {item.caracteristicas.includes('Úmido') && (
                              <div style={{ background: '#111', padding: '10px 14px', borderRadius: '6px', border: '1px solid #222', display: 'inline-block', minWidth: '200px' }}>
                                <span style={{ fontSize: '0.75rem', color: '#888', display: 'block' }}>Umidade Indicada:</span>
                                <strong style={{ color: '#fff', fontSize: '0.85rem' }}>30% (médio)</strong>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Access restrictions and Vehicles */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                          <div>
                            <strong style={{ color: 'var(--primary)', fontSize: '0.85rem', display: 'block', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                              🚚 Acesso Logístico
                            </strong>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#aaa', lineHeight: 1.4 }}>
                              Condições: {item.acondicionamento || 'Balança no local, Doca'}.<br />
                              PBT máximo permitido: 15 toneladas.<br />
                              Altura máxima da entrada: 4,2 metros.
                            </p>
                          </div>
                          <div>
                            <strong style={{ color: 'var(--primary)', fontSize: '0.85rem', display: 'block', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
                              🚛 Tipo de Veículo Recomendado
                            </strong>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#aaa', lineHeight: 1.4 }}>
                              Compatível com: Carreta, Caminhão truck, Poliguindaste.<br />
                              Exigência de transporte: {item.classe === 'Classe I – perigoso' ? 'Classe I (MOPP / CIPP / Licença específica)' : 'Classe II (transporte comum)'}.
                            </p>
                          </div>
                        </div>

                        {/* Locked Address Indicator */}
                        <div style={{
                          background: 'rgba(255,215,0,0.04)',
                          border: '1px solid rgba(255,215,0,0.15)',
                          padding: '16px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          color: 'var(--primary)'
                        }}>
                          <Lock size={18} style={{ flexShrink: 0 }} />
                          <span style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                            <strong>Endereço de coleta ocultado:</strong> O endereço completo e o CEP ({item.cep || '00000-000'}) permanecem sob sigilo. Eles serão revelados automaticamente para a contraparte assim que uma proposta for submetida (Taxa Lead paga).
                          </span>
                        </div>

                        {/* Annex Files / Media players */}
                        <div>
                          <strong style={{ color: 'var(--primary)', fontSize: '0.85rem', display: 'block', textTransform: 'uppercase', marginBottom: '10px', fontFamily: 'var(--font-heading)' }}>
                            📎 Anexos e Mídias
                          </strong>
                          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            {item.foto_url && (
                              <div style={{ border: '1px solid #333', padding: '6px', borderRadius: '8px', background: '#0a0a0a', width: '130px' }}>
                                <img src={item.foto_url} alt="Foto resíduo" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                                <span style={{ fontSize: '10px', color: '#666', display: 'block', textAlign: 'center', marginTop: '4px' }}>Foto do Material</span>
                              </div>
                            )}

                            {item.video_url && (
                              <div style={{ border: '1px solid #333', padding: '6px', borderRadius: '8px', background: '#0a0a0a', width: '130px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '106px' }}>
                                <Play size={20} style={{ color: 'var(--primary)' }} />
                                <span style={{ fontSize: '10px', color: '#ccc', textAlign: 'center', marginTop: '4px' }}>Vídeo Curto.mp4</span>
                              </div>
                            )}

                            {item.licenca_anexo_url && (
                              <a
                                href={item.licenca_anexo_url}
                                target="_blank"
                                rel="noreferrer"
                                style={{ border: '1px solid #333', padding: '12px', borderRadius: '8px', background: '#0a0a0a', width: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textDecoration: 'none', color: '#fff' }}
                              >
                                <FileText size={24} style={{ color: 'var(--accent)', marginBottom: '6px' }} />
                                <span style={{ fontSize: '11px', fontWeight: 'bold', textAlign: 'center' }}>Ficha Técnica PDF</span>
                              </a>
                            )}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* ─── PIX PAYMENT MOCK MODAL ─── */}
      {pixPaymentModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            zIndex: 1002, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)', padding: '20px'
          }}
        >
          <div
            style={{
              width: '100%', maxWidth: '440px', background: '#0d0d0d',
              border: '1px solid #333', borderRadius: '12px', overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.8)'
            }}
          >
            {/* Header */}
            <div style={{ background: '#1c1c1c', padding: '16px 20px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#fff', margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>
                Pagamento Seguro via Pix
              </h3>
              <button
                onClick={() => setPixPaymentModal(null)}
                style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.3rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#141414', border: '1px solid #222', padding: '12px 14px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', display: 'block', fontWeight: 'bold' }}>
                  Anúncio de Referência
                </span>
                <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block', marginTop: '2px' }}>
                  {pixPaymentModal.item.residuo || pixPaymentModal.item.titulo_anuncio || pixPaymentModal.item.nome_material || 'Lote/Demanda'}
                </strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--primary)' }}>
                  Código: {pixPaymentModal.item.codigo}
                </span>
              </div>

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
                  Modalidade Escolhida
                </span>
                <strong style={{ color: '#fff', fontSize: '1.05rem', display: 'block' }}>
                  {pixPaymentModal.type === 'SUPER_CONTATO' 
                    ? (pixPaymentModal.amount === 80 ? '⚡ PULAR NEGOCIAÇÃO' : '🤝 NEGOCIAR (Sem sala / Doação)') 
                    : '🤝 TAXA NORMAL (Sala de Negociação)'}
                </strong>
                <span style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 800, display: 'block', marginTop: '6px', fontFamily: 'monospace' }}>
                  R$ {pixPaymentModal.amount},00
                </span>
              </div>

              {/* Mock QR Code */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', padding: '16px', borderRadius: '8px', width: '180px', height: '180px', margin: '0 auto', justifyContent: 'center', border: '3px solid var(--primary)' }}>
                <svg width="140" height="140" viewBox="0 0 100 100" style={{ fill: '#000' }}>
                  <rect x="0" y="0" width="25" height="25" />
                  <rect x="5" y="5" width="15" height="15" fill="#fff" />
                  <rect x="8" y="8" width="9" height="9" />
                  
                  <rect x="75" y="0" width="25" height="25" />
                  <rect x="80" y="5" width="15" height="15" fill="#fff" />
                  <rect x="83" y="8" width="9" height="9" />
                  
                  <rect x="0" y="75" width="25" height="25" />
                  <rect x="5" y="80" width="15" height="15" fill="#fff" />
                  <rect x="8" y="83" width="9" height="9" />
                  
                  <rect x="35" y="10" width="10" height="15" />
                  <rect x="55" y="5" width="12" height="12" />
                  <rect x="40" y="35" width="20" height="20" />
                  <rect x="10" y="45" width="15" height="10" />
                  <rect x="70" y="40" width="20" height="15" />
                  <rect x="35" y="70" width="15" height="20" />
                  <rect x="65" y="70" width="20" height="20" />
                </svg>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.68rem', color: '#666', display: 'block', textAlign: 'center' }}>
                  Escaneie o QR Code acima ou use o Pix Copia e Cola
                </span>
                <input
                  type="text"
                  readOnly
                  value={`00020101021226870014br.gov.bcb.pix2565materraelo${pixPaymentModal.amount}00000`}
                  style={{ padding: '6px 10px', background: '#1c1c1c', border: '1px solid #333', borderRadius: '4px', fontSize: '0.72rem', color: '#888', textAlign: 'center', width: '100%', fontFamily: 'monospace' }}
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ background: '#141414', padding: '12px 20px', borderTop: '1px solid #222', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setPixPaymentModal(null)}
                style={{ flex: 1, padding: '10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid #333', background: 'none', color: '#ccc', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPixPayment}
                style={{ flex: 1, padding: '10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, background: 'var(--primary)', color: '#000', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS SECTION */}
      {showSpecialtyWarning && (
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
              Você está tentando participar de uma <strong>{warningType === 'Oferta' ? 'Oferta (Quem Vende)' : 'Demanda (Quem Compra)'}</strong>, mas sua conta está habilitada apenas como <strong>{userProfile?.tipo_parte?.toUpperCase()}</strong>.
            </p>
            <p style={{ color: '#aaa', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
              Para negociar este resíduo, você precisa atualizar suas especialidades enviando a documentação correspondente.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button onClick={() => setShowSpecialtyWarning(false)} className="btn" style={{ flex: 1, background: '#222', color: '#fff' }}>
                Fechar
              </button>
              <button onClick={() => { setShowSpecialtyWarning(false); router.push('/?tab=documentos'); }} className="btn btn-primary" style={{ flex: 1.5, background: 'var(--primary)', color: '#000', fontWeight: 'bold' }}>
                Ir para Homologação
              </button>
            </div>
          </div>
        </div>
      )}

      {showLeadFeeModal && selectedListingForLead && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px', overflowY: 'auto'
        }}>
          <div style={{
            background: '#121212', border: '1.5px solid var(--primary)', padding: '32px', borderRadius: '16px',
            maxWidth: '500px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--primary)', margin: 0, fontFamily: 'var(--font-heading)' }}>
                🚀 PAGAMENTO DE TAXA LEAD
              </h3>
              <button onClick={() => setShowLeadFeeModal(false)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ borderBottom: '1px solid #222', paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '0.95rem', color: '#fff', margin: 0, fontWeight: 'bold' }}>
                {selectedListingForLead.titulo || selectedListingForLead.residuo}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem', color: '#aaa' }}>
                <span>Quantidade: <strong>{selectedListingForLead.quantidade} {selectedListingForLead.unidade}</strong></span>
                <span>Preço Ref: <strong>{selectedListingForLead.valor_desejado > 0 ? `R$ ${Number(selectedListingForLead.valor_desejado).toLocaleString('pt-BR', {minimumFractionDigits: 2})}/${selectedListingForLead.unidade}` : 'Doação'}</strong></span>
              </div>
            </div>

            <div style={{ background: '#0a0a0a', padding: '16px', borderRadius: '8px', border: '1px solid #222' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: '#aaa' }}>Valor total do lote:</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>
                  {selectedListingForLead.valor_desejado > 0 
                    ? `R$ ${(selectedListingForLead.quantidade * selectedListingForLead.valor_desejado).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` 
                    : 'R$ 0,00 (Doação)'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 'bold', borderTop: '1px dashed #222', paddingTop: '8px' }}>
                <span style={{ color: 'var(--primary)' }}>Taxa Lead (1.5% ou R$80 mín):</span>
                <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                  R$ {leadFeeValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#666', display: 'block', marginTop: '6px', lineHeight: 1.3 }}>
                A Taxa Lead garante a exclusividade na abertura do canal de negociação com a contraparte e libera os contatos e endereço completos no fechamento.
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', background: '#000', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
              <div style={{ width: '100px', height: '100px', background: '#fff', padding: '5px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 100 100" width="90" height="90">
                  <rect width="100" height="100" fill="#fff" />
                  <rect x="10" y="10" width="30" height="30" fill="#000" />
                  <rect x="60" y="10" width="30" height="30" fill="#000" />
                  <rect x="10" y="60" width="30" height="30" fill="#000" />
                  <rect x="60" y="60" width="15" height="15" fill="#000" />
                  <rect x="80" y="80" width="10" height="10" fill="#000" />
                  <rect x="45" y="45" width="20" height="20" fill="#000" />
                  <rect x="20" y="20" width="10" height="10" fill="#fff" />
                  <rect x="70" y="20" width="10" height="10" fill="#fff" />
                  <rect x="20" y="70" width="10" height="10" fill="#fff" />
                </svg>
              </div>
              <div style={{ width: '100%' }}>
                <span style={{ fontSize: '0.8rem', color: '#aaa', display: 'block', textAlign: 'center', marginBottom: '8px' }}>Pague via PIX copia e cola abaixo:</span>
                <input
                  type="text"
                  readOnly
                  value={`00020101021226870014br.gov.bcb.pix2565pix.materra.elo/leads/fee/pay?id=${selectedListingForLead.id}&amount=${leadFeeValue}`}
                  style={{ width: '100%', background: '#111', border: '1px solid #333', padding: '8px 12px', borderRadius: '6px', fontSize: '0.75rem', fontFamily: 'monospace', color: '#aaa', textAlign: 'center', outline: 'none' }}
                  onClick={(e) => {
                    e.currentTarget.select()
                    document.execCommand('copy')
                    alert('PIX Copia e Cola copiado para a área de transferência!')
                  }}
                />
                <span style={{ fontSize: '0.7rem', color: '#555', display: 'block', textAlign: 'center', marginTop: '4px' }}>Clique no campo para copiar</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowLeadFeeModal(false)} className="btn" style={{ flex: 1, background: '#222', color: '#fff' }}>
                Cancelar
              </button>
              <button onClick={handleConfirmLeadFee} className="btn btn-primary" style={{ flex: 1.5, background: 'var(--primary)', color: '#000', fontWeight: 'bold' }}>
                Confirmar Pagamento Simulado ✅
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  )
}
