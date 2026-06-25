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
const LeilaoTimer = ({ dias }: { dias: number }) => {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    // Calculate target date when mounted (today at midnight + X days)
    const targetDate = new Date()
    targetDate.setHours(0, 0, 0, 0)
    targetDate.setDate(targetDate.getDate() + dias)
    const targetMs = targetDate.getTime()

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

      setTimeLeft(`Restam ${d}d ${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [dias])

  return (
    <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontFamily: 'monospace' }}>
      {timeLeft}
    </span>
  )
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

  // Listings data
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Saved/Favorites (LocalStorage)
  const [savedIds, setSavedIds] = useState<string[]>([])

  // Search by Name (Passo 0)
  const [searchName, setSearchName] = useState('')

  // Advanced Filters state
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
      // 1. Tab check
      if (item.tipo_anuncio !== activeTab && item.tipo_anuncio !== `${activeTab} de resíduo`) {
        return false
      }

      // 2. Name search (Passo 0)
      if (searchName) {
        const query = searchName.toLowerCase()
        const nameMatch = item.titulo?.toLowerCase().includes(query)
        const residueMatch = item.residuo?.toLowerCase().includes(query)
        const codeMatch = item.codigo?.toLowerCase().includes(query)
        if (!nameMatch && !residueMatch && !codeMatch) return false
      }

      // 3. Category
      if (filterCategory && item.categoria !== filterCategory) return false

      // 4. Specific waste
      if (filterResiduo && item.residuo !== filterResiduo) return false

      // 5. Class
      if (filterClasse && filterClasse !== 'Todas') {
        const itemClass = item.classe || ''
        if (filterClasse === 'I' && !itemClass.includes('I –') && itemClass !== 'I') return false
        if (filterClasse === 'IIA' && !itemClass.includes('IIA') && itemClass !== 'IIA') return false
        if (filterClasse === 'IIB' && !itemClass.includes('IIB') && itemClass !== 'IIB') return false
      }

      // 6. Estado físico
      if (filterEstadoFisico && item.estado_fisico !== filterEstadoFisico) return false

      // 7. Acondicionamento
      if (filterAcondicionamento && !String(item.acondicionamento || '').includes(filterAcondicionamento)) return false

      // 8. Location
      if (filterUf && item.uf !== filterUf) return false
      if (filterMunicipio && !item.municipio?.toLowerCase().includes(filterMunicipio.toLowerCase())) return false

      // 9. Quantidade
      if (filterQtyMin && item.quantidade < parseFloat(filterQtyMin)) return false
      if (filterQtyMax && item.quantidade > parseFloat(filterQtyMax)) return false
      if (filterQtyUnit && item.unidade !== filterQtyUnit) return false

      // 10. Frequência
      if (filterFrequencia && item.frequencia !== filterFrequencia) return false

      // 11. Price
      if (filterPriceMin && item.valor_desejado < parseFloat(filterPriceMin)) return false
      if (filterPriceMax && item.valor_desejado > parseFloat(filterPriceMax)) return false

      // 12. Selo
      if (filterSelo) {
        const itemSelo = item.cadastros?.nivel_selo || 'Sem'
        if (itemSelo !== filterSelo) return false
      }

      // 13. Document check
      if (filterDocs === 'Com licença/MTR' && !item.tem_licenca) return false

      // 14. Contract length
      if (filterContract && item.prazo_recorrencia !== filterContract) return false

      // 15. Urgent filter
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
          height: 'fit-content'
        }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-heading)' }}>
            <span>Filtros Avançados</span>
            <button onClick={() => {
              setFilterCategory(''); setFilterResiduo(''); setFilterClasse('');
              setFilterEstadoFisico(''); setFilterAcondicionamento(''); setFilterUf('');
              setFilterMunicipio(''); setFilterQtyMin(''); setFilterQtyMax('');
              setFilterFrequencia(''); setFilterPriceMin(''); setFilterPriceMax('');
              setFilterSelo(''); setFilterDocs(''); setFilterContract('');
              setFilterUrgent(false); setSearchName('');
            }} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>
              Limpar Todos
            </button>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Urgente Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#ef5350', cursor: 'pointer', fontWeight: 'bold', background: 'rgba(239,83,80,0.06)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(239,83,80,0.2)' }}>
              <input type="checkbox" checked={filterUrgent} onChange={e => setFilterUrgent(e.target.checked)} />
              🚨 Apenas Coletas Urgentes
            </label>

            {/* Category */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Categoria</label>
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

            {/* Classe */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Classe do Resíduo</label>
              <select className="form-select" value={filterClasse} onChange={e => setFilterClasse(e.target.value)}>
                <option value="Todas">Todas</option>
                <option value="I">Classe I (Perigoso)</option>
                <option value="IIA">Classe IIA (Não Inerte)</option>
                <option value="IIB">Classe IIB (Inerte)</option>
              </select>
            </div>

            {/* Prazo Recorrência (Duração Contrato) */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Prazo do Contrato</label>
              <select className="form-select" value={filterContract} onChange={e => setFilterContract(e.target.value)}>
                <option value="">Todos</option>
                <option value="3 meses">3 meses</option>
                <option value="6 meses">6 meses</option>
                <option value="12 meses">12 meses</option>
                <option value="18 meses">18 meses</option>
                <option value="24 meses">24 meses</option>
                <option value="Indefinido">Indefinido</option>
                <option value="Lote Único">Lote Único / Avulso</option>
              </select>
            </div>

            {/* Estado Físico */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Estado Físico</label>
              <select className="form-select" value={filterEstadoFisico} onChange={e => setFilterEstadoFisico(e.target.value)}>
                <option value="">Todos</option>
                <option value="Sólido">Sólido</option>
                <option value="Líquido">Líquido</option>
                <option value="Semissólido">Semissólido</option>
                <option value="Pastoso">Pastoso</option>
                <option value="Gasoso">Gasoso</option>
              </select>
            </div>

            {/* Acondicionamento */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Acondicionamento</label>
              <select className="form-select" value={filterAcondicionamento} onChange={e => setFilterAcondicionamento(e.target.value)}>
                <option value="">Todos</option>
                {ACONDICIONAMENTOS.map(cond => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>

            {/* Localização */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Estado (UF)</label>
                <select className="form-select" value={filterUf} onChange={e => setFilterUf(e.target.value)}>
                  <option value="">Todos</option>
                  {ESTADOS_BRASIL.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Cidade</label>
                <input
                  type="text"
                  placeholder="Cidade"
                  className="form-input"
                  value={filterMunicipio}
                  onChange={e => setFilterMunicipio(e.target.value)}
                />
              </div>
            </div>

            {/* Quantidade */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Faixa Quantidade</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="number" placeholder="Mín" className="form-input" style={{ width: '50%' }} value={filterQtyMin} onChange={e => setFilterQtyMin(e.target.value)} />
                <input type="number" placeholder="Máx" className="form-input" style={{ width: '50%' }} value={filterQtyMax} onChange={e => setFilterQtyMax(e.target.value)} />
              </div>
              <select className="form-select" style={{ marginTop: '6px' }} value={filterQtyUnit} onChange={e => setFilterQtyUnit(e.target.value)}>
                <option value="t">t</option>
                <option value="kg">kg</option>
                <option value="L">L</option>
                <option value="m³">m³</option>
                <option value="unidade">unidade</option>
              </select>
            </div>

            {/* Frequência */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Frequência</label>
              <select className="form-select" value={filterFrequencia} onChange={e => setFilterFrequencia(e.target.value)}>
                <option value="">Todas</option>
                <option value="Única">Única</option>
                <option value="Semanal">Semanal</option>
                <option value="Mensal">Mensal</option>
                <option value="Recorrente">Recorrente</option>
              </select>
            </div>

            {/* Preço */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Faixa de Preço (R$)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="number" placeholder="Mín" className="form-input" style={{ width: '50%' }} value={filterPriceMin} onChange={e => setFilterPriceMin(e.target.value)} />
                <input type="number" placeholder="Máx" className="form-input" style={{ width: '50%' }} value={filterPriceMax} onChange={e => setFilterPriceMax(e.target.value)} />
              </div>
            </div>

            {/* Selo do Anunciante */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Selo do Anunciante</label>
              <select className="form-select" value={filterSelo} onChange={e => setFilterSelo(e.target.value)}>
                <option value="">Todos</option>
                <option value="Ouro">Ouro</option>
                <option value="Prata">Prata</option>
                <option value="Bronze">Bronze</option>
                <option value="Sem">Sem Selo</option>
              </select>
            </div>

            {/* Documentação */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Documentação</label>
              <select className="form-select" value={filterDocs} onChange={e => setFilterDocs(e.target.value)}>
                <option value="">Indiferente</option>
                <option value="Com licença/MTR">Com Licença / MTR</option>
              </select>
            </div>
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
                            <MapPin size={12} /> {item.municipio}, {item.uf} (CEP 🔒)
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
                          Timer: <LeilaoTimer dias={days} />
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginTop: '2px' }}>
                          Frete: {item.observacoes?.includes('Anunciante') ? 'Anunciante paga' : 'Contraparte paga'}
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

                      <button
                        onClick={() => handleInterest(item)}
                        style={{
                          background: 'var(--primary)',
                          border: 'none',
                          color: '#000',
                          padding: '10px 24px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 10px rgba(255, 215, 0, 0.15)'
                        }}
                      >
                        Participar 🚀
                      </button>

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
