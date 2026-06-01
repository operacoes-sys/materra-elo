'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import LinkComponent from 'next/link'

const getAuctionStatus = (ad: any) => {
  if (!ad || (ad.tipo_leilao !== 'Ascendente' && ad.tipo_leilao !== 'Descendente')) {
    return { statusText: 'Sem leilão', isWaiting: false, isOpen: false, isEnded: false };
  }
  if (ad.status === 'Arrematado') {
    return { statusText: 'Encerrado (Arrematado)', isWaiting: false, isOpen: false, isEnded: true };
  }
  if (ad.status === 'Suspenso') {
    return { statusText: 'Encerrado (Suspenso)', isWaiting: false, isOpen: false, isEnded: true };
  }
  if (ad.status === 'Fechado') {
    return { statusText: 'Encerrado', isWaiting: false, isOpen: false, isEnded: true };
  }
  if (!ad.data_inicio_leilao || !ad.data_fim_leilao) {
    return { statusText: 'Aguardando abertura', isWaiting: true, isOpen: false, isEnded: false };
  }
  const now = new Date().getTime();
  const end = new Date(ad.data_fim_leilao).getTime();
  if (now >= end) {
    return { statusText: 'Encerrado', isWaiting: false, isOpen: false, isEnded: true };
  }
  const diffMs = end - now;
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  let timeText = '';
  if (diffHrs > 0) {
    timeText = `Restam ${diffHrs}h ${diffMins}min`;
  } else {
    timeText = `Restam ${diffMins}min`;
  }
  return {
    statusText: `Aberto — ${timeText}`,
    timeRemainingText: timeText,
    isWaiting: false,
    isOpen: true,
    isEnded: false
  };
};

export default function AdminDashboard() {
  const supabase = createClient()

  const [isAdmin, setIsAdmin] = useState(false)
  const [loadingAuth, setLoadingAuth] = useState(true)

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'cadastros' | 'anuncios' | 'propostas' | 'fretes' | 'leads' | 'fichas_representadas' | 'contatos_liberados'>('cadastros')

  // Lists state
  const [cadastros, setCadastros] = useState<any[]>([])
  const [anuncios, setAnuncios] = useState<any[]>([])
  const [propostas, setPropostas] = useState<any[]>([])
  const [fretes, setFretes] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [allContatosList, setAllContatosList] = useState<any[]>([])
  const [fichasRepresentadas, setFichasRepresentadas] = useState<any[]>([])
  const [selectedFichaRep, setSelectedFichaRep] = useState<any>(null)
  const [transportadoras, setTransportadoras] = useState<any[]>([])
  const [releaseTransporterId, setReleaseTransporterId] = useState<string>('')
  const [selectedFrete, setSelectedFrete] = useState<any>(null)
  const [releaseFreteTransporterId, setReleaseFreteTransporterId] = useState<string>('')
  const [releaseFreteValEncontrado, setReleaseFreteValEncontrado] = useState<string>('')
  const [releaseFreteLeadValor, setReleaseFreteLeadValor] = useState<string>('35.00')

  // Action / Edit states
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [selectedAd, setSelectedAd] = useState<any>(null)
  const [selectedProp, setSelectedProp] = useState<any>(null)
  const [selectedAdForManualContacts, setSelectedAdForManualContacts] = useState<any>(null)
  const [allCadastros, setAllCadastros] = useState<any[]>([])
  const [manualBuyerId, setManualBuyerId] = useState<string>('')
  const [manualSellerId, setManualSellerId] = useState<string>('')
  const [manualTransporterId, setManualTransporterId] = useState<string>('')
  const [manualValIndex, setManualValIndex] = useState<string>('')
  const [manualValReal, setManualValReal] = useState<string>('')
  const [manualReward, setManualReward] = useState<string>('0')
  const [tempIndexes, setTempIndexes] = useState<Record<string, string>>({})
  const [userFilter, setUserFilter] = useState<'todos' | 'fornecedor' | 'comprador' | 'corretor' | 'transportadora'>('todos')

  // Forms state
  const [newLeadEmpresa, setNewLeadEmpresa] = useState('')
  const [newLeadContato, setNewLeadContato] = useState('')
  const [newLeadTel, setNewLeadTel] = useState('')
  const [newLeadStatus, setNewLeadStatus] = useState<'A contatar' | 'Contatado' | 'Negociando' | 'Fechado'>('A contatar')

  // Bilateral release inputs
  const [releaseValIndex, setReleaseValIndex] = useState('')
  const [releaseValReal, setReleaseValReal] = useState('')
  const [releaseReward, setReleaseReward] = useState('')

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 4000)
  }

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const email = session.user.email || ''
        if (email.includes('admin') || email.includes('lucas') || email.includes('souto')) {
          setIsAdmin(true)
        } else {
          setIsAdmin(true) // Development default
        }
      } else {
        setIsAdmin(true)
      }
      setLoadingAuth(false)
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAdmin) {
      loadData()
    }
  }, [isAdmin, activeTab])

  async function loadData() {
    if (activeTab === 'cadastros') {
      const { data } = await supabase.from('cadastros').select('*').order('data_cadastro', { ascending: false })
      const mapped = (data || []).map((c: any) => ({
        ...c,
        area_atuacao: c.area_atuacao || c.area_operacao || ''
      }))
      setCadastros(mapped)
    } else if (activeTab === 'anuncios') {
      const { data } = await supabase.from('anuncios').select(`
        *,
        cadastros:id_cadastro (
          id, nome_ou_razao, email, cpf_ou_cnpj, whatsapp, chave_pix
        )
      `).order('data_publicacao', { ascending: false })
      setAnuncios(data || [])
      
      const { data: allCads } = await supabase
        .from('cadastros')
        .select('id, nome_ou_razao, email, tipo_parte, subtipo')
        .order('nome_ou_razao', { ascending: true })
      setAllCadastros(allCads || [])
    } else if (activeTab === 'propostas') {
      const { data } = await supabase.from('propostas').select(`
        *,
        anuncio:id_anuncio (
          id, codigo, residuo, id_cadastro, valor_desejado
        ),
        proponente:id_proponente (
          id, nome_ou_razao, email
        )
      `).order('created_at', { ascending: false })
      setPropostas(data || [])
      const { data: transps } = await supabase.from('cadastros').select('id, nome_ou_razao, email').eq('tipo_parte', 'Transportadora')
      setTransportadoras(transps || [])
    } else if (activeTab === 'fretes') {
      const { data } = await supabase.from('frete').select(`
        *,
        comprador:id_comprador (
          id, nome_ou_razao, email
        ),
        transportadora:id_transportadora (
          id, nome_ou_razao, email
        ),
        anuncio:id_anuncio (
          id, codigo, residuo, id_cadastro
        )
      `).order('created_at', { ascending: false })
      setFretes(data || [])
      const { data: transps } = await supabase.from('cadastros').select('id, nome_ou_razao, email').eq('tipo_parte', 'Transportadora')
      setTransportadoras(transps || [])
    } else if (activeTab === 'leads') {
      const { data } = await supabase.from('leads').select('*').order('data', { ascending: false })
      setLeads(data || [])
    } else if (activeTab === 'fichas_representadas') {
      const { data } = await supabase
        .from('fichas_empresa_representada')
        .select(`
          *,
          corretor:id_corretor (
            id, nome_ou_razao, email, whatsapp
          )
        `)
        .order('created_at', { ascending: false })
      setFichasRepresentadas(data || [])
    } else if (activeTab === 'contatos_liberados') {
      const { data } = await supabase.from('contatos').select(`
        *,
        usuario:id_usuario (
          id, nome_ou_razao, email, tipo_parte
        ),
        contraparte:id_contraparte (
          id, nome_ou_razao, email, tipo_parte
        ),
        anuncio:id_anuncio (
          id, codigo, residuo
        )
      `).order('data_liberacao', { ascending: false })
      setAllContatosList(data || [])

      const { data: allCads } = await supabase
        .from('cadastros')
        .select('id, nome_ou_razao, email, tipo_parte, subtipo')
        .order('nome_ou_razao', { ascending: true })
      setAllCadastros(allCads || [])

      const { data: allAds } = await supabase
        .from('anuncios')
        .select('id, codigo, residuo, id_cadastro, valor_desejado, valor_index')
        .order('codigo', { ascending: true })
      setAnuncios(allAds || [])
    }
  }

  // Save changes to User (including carrier area_atuacao and status_documentos)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    const { error } = await supabase
      .from('cadastros')
      .update({
        selo_verificado: selectedUser.selo_verificado,
        nivel_selo: selectedUser.nivel_selo || 'Amarelo',
        score_0a100: selectedUser.score_0a100 !== null && selectedUser.score_0a100 !== undefined ? parseInt(String(selectedUser.score_0a100)) : 50,
        plano_ativo: selectedUser.plano_ativo,
        plano: selectedUser.plano_ativo ? 'Pago' : 'Free',
        status_documentos: selectedUser.status_documentos,
        area_operacao: selectedUser.area_atuacao || null,
        observacoes: selectedUser.observacoes || null
      })
      .eq('id', selectedUser.id)

    if (!error) {
      showNotification('Cadastro homologado e atualizado!', 'success')
      setSelectedUser(null)
      loadData()
    } else {
      showNotification('Erro: ' + error.message, 'error')
    }
  }

  const handleSaveFichaRep = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFichaRep) return
    const { error } = await supabase
      .from('fichas_empresa_representada')
      .update({
        status_documentos: selectedFichaRep.status_documentos,
        score_0a100: selectedFichaRep.score_0a100 !== null && selectedFichaRep.score_0a100 !== undefined ? parseInt(String(selectedFichaRep.score_0a100)) : 50,
        selo_metal: selectedFichaRep.selo_metal,
        observacoes: selectedFichaRep.observacoes || null
      })
      .eq('id', selectedFichaRep.id)

    if (!error) {
      showNotification('Ficha de empresa representada salva com sucesso!', 'success')
      setSelectedFichaRep(null)
      loadData()
    } else {
      showNotification('Erro ao salvar ficha: ' + error.message, 'error')
    }
  }

  // Save changes to Ad (calculates Index Materra percent deviation)
  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAd) return

    let devText = null
    const desired = parseFloat(selectedAd.valor_desejado)
    const indexVal = parseFloat(selectedAd.valor_index)

    if (desired && indexVal) {
      const diffPercent = ((desired - indexVal) / indexVal) * 100
      devText = diffPercent > 0 
        ? `+${diffPercent.toFixed(1)}% acima do Index` 
        : `${diffPercent.toFixed(1)}% abaixo do Index`
    }

    const { error } = await supabase
      .from('anuncios')
      .update({
        valor_index: indexVal || 0,
        taxa_lead_valor: parseFloat(selectedAd.taxa_lead_valor) || 0,
        status: selectedAd.status,
        percentual_desvio: devText,
        urgencia_admin: selectedAd.urgencia_admin || null,
        duracao_leilao_horas: selectedAd.duracao_leilao_horas ? parseInt(selectedAd.duracao_leilao_horas) : null,
        data_inicio_leilao: selectedAd.data_inicio_leilao || null,
        data_fim_leilao: selectedAd.data_fim_leilao || null
      })
      .eq('id', selectedAd.id)

    if (!error) {
      showNotification('Anúncio atualizado e homologado com sucesso!', 'success')
      setSelectedAd(null)
      loadData()
    } else {
      showNotification('Erro: ' + error.message, 'error')
    }
  }

  // Quick Direct Update for Ad Materra Index
  const handleDirectUpdateIndex = async (adId: string, desired: number, indexVal: number) => {
    let devText = null
    if (desired && indexVal) {
      const diffPercent = ((desired - indexVal) / indexVal) * 100
      devText = diffPercent > 0 
        ? `+${diffPercent.toFixed(1)}% acima do Index` 
        : `${diffPercent.toFixed(1)}% abaixo do Index`
    }

    const { error } = await supabase
      .from('anuncios')
      .update({
        valor_index: indexVal || 0,
        percentual_desvio: devText
      })
      .eq('id', adId)

    if (!error) {
      showNotification('Materra Index atualizado com sucesso!', 'success')
      setTempIndexes(prev => {
        const copy = { ...prev }
        delete copy[adId]
        return copy
      })
      loadData()
    } else {
      showNotification('Erro: ' + error.message, 'error')
    }
  }
  // Recalculate broker's score and level based on confirmation rate, docs, and operations
  const recalculateBrokerScore = async (brokerId: string) => {
    try {
      const { data: broker } = await supabase
        .from('cadastros')
        .select('*')
        .eq('id', brokerId)
        .maybeSingle()

      if (!broker || (broker.subtipo !== 'Corretor' && broker.subtipo !== 'Corretor/Controlador')) return

      const { data: brokerAds } = await supabase
        .from('anuncios')
        .select('id')
        .eq('id_cadastro', brokerId)

      const adIds = (brokerAds || []).map(a => a.id)
      let confirmationRate = 85 // default weight 40

      if (adIds.length > 0) {
        const { data: props } = await supabase
          .from('propostas')
          .select('status')
          .in('id_anuncio', adIds)

        const confirmedCount = (props || []).filter(p => p.status === 'Confirmada').length
        const refusedCount = (props || []).filter(p => p.status === 'Recusada').length
        const total = confirmedCount + refusedCount
        if (total > 0) {
          confirmationRate = (confirmedCount / total) * 100
        }
      }

      let legalDocsScore = 20
      if (broker.status_documentos === 'Verificado') legalDocsScore = 100
      else if (broker.status_documentos === 'Em análise') legalDocsScore = 50
      else if (broker.status_documentos === 'Reprovado') legalDocsScore = 0

      const { count } = await supabase
        .from('operacoes_audit')
        .select('*', { count: 'exact', head: true })
        .or(`fornecedor.eq.${brokerId},comprador.eq.${brokerId}`)

      const operationScore = Math.min((count || 0) * 20, 100)

      let qualificationScore = 50
      try {
        if (broker.documentos_recebidos) {
          const docsObj = JSON.parse(broker.documentos_recebidos)
          if (docsObj.crea_art_opcional || docsObj.qualificacao_gestao_opcional) {
            qualificationScore = 100
          }
        }
      } catch (e) {}

      const finalScore = Math.round(
        (legalDocsScore * 0.3) +
        (confirmationRate * 0.4) +
        (operationScore * 0.2) +
        (qualificationScore * 0.1)
      )

      let newSeal = 'Bronze'
      if (finalScore >= 85) newSeal = 'Ouro'
      else if (finalScore >= 60) newSeal = 'Verde'

      await supabase
        .from('cadastros')
        .update({
          score_0a100: finalScore,
          nivel_selo: newSeal
        })
        .eq('id', brokerId)

    } catch (e) {
      console.error('Erro ao recalcular score do corretor:', e)
    }
  }

  // Confirm receipt by the company flow
  const handleConfirmReceipt = async (p: any) => {
    try {
      const { error } = await supabase
        .from('propostas')
        .update({ status: 'Confirmada' })
        .eq('id', p.id)
      
      if (error) throw error

      showNotification('Proposta/Lead confirmado com sucesso!', 'success')
      
      // Recalculate broker score if applicable
      const brokerId = p.anuncio?.id_cadastro
      if (brokerId) {
        await recalculateBrokerScore(brokerId)
      }

      // WhatsApp message for confirmation receipt
      const text = `Olá! Sou o Lucas da Materra Elo. Confirmamos o recebimento e negociação do resíduo ${p.anuncio?.residuo || ''} (Cód: ${p.anuncio?.codigo || ''}) com a empresa ${p.proponente?.nome_ou_razao || p.proponente?.email || ''}. Rastreabilidade ativa no Audit Trail.`
      const url = `https://wa.me/5562999104815?text=${encodeURIComponent(text)}`
      window.open(url, '_blank')
      
      loadData()
    } catch (err: any) {
      console.error(err)
      showNotification('Erro ao confirmar recebimento: ' + err.message, 'error')
    }
  }

  // Decline/refuse proposal flow
  const handleDeclineReceipt = async (p: any) => {
    try {
      const { error } = await supabase
        .from('propostas')
        .update({ status: 'Recusada' })
        .eq('id', p.id)
      
      if (error) throw error

      showNotification('Proposta marcada como Recusada!', 'success')

      // Recalculate broker score if applicable
      const brokerId = p.anuncio?.id_cadastro
      if (brokerId) {
        await recalculateBrokerScore(brokerId)
      }
      
      loadData()
    } catch (err: any) {
      console.error(err)
      showNotification('Erro ao recusar proposta: ' + err.message, 'error')
    }
  }

  // Bilateral Contact Release
  const handleReleaseBilateral = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProp) return

    try {
      const buyerId = selectedProp.papel_proponente === 'Comprador' ? selectedProp.id_proponente : selectedProp.anuncio?.id_cadastro
      const sellerId = selectedProp.papel_proponente === 'Fornecedor' ? selectedProp.id_proponente : selectedProp.anuncio?.id_cadastro

      if (!buyerId || !sellerId) {
        throw new Error('Não foi possível identificar as partes.')
      }

      // 1. Create Row for Buyer
      const { error: error1 } = await supabase
        .from('contatos')
        .insert([{
          id_usuario: buyerId,
          id_contraparte: sellerId,
          id_anuncio: selectedProp.id_anuncio,
          id_transacao: selectedProp.id,
          papel_contraparte: 'Fornecedor',
          taxa_lead_valor: 35.00,
          taxa_lead_paga: true,
          liberado: true,
          valor_index: parseFloat(releaseValIndex) || 0,
          valor_real: parseFloat(releaseValReal) || 0,
          premiacao_percent: parseFloat(releaseReward) || 0,
          data_liberacao: new Date().toISOString()
        }])

      if (error1) throw error1

      // 2. Create Row for Seller
      const { error: error2 } = await supabase
        .from('contatos')
        .insert([{
          id_usuario: sellerId,
          id_contraparte: buyerId,
          id_anuncio: selectedProp.id_anuncio,
          id_transacao: selectedProp.id,
          papel_contraparte: 'Comprador',
          taxa_lead_valor: 35.00,
          taxa_lead_paga: true,
          liberado: true,
          valor_index: parseFloat(releaseValIndex) || 0,
          valor_real: parseFloat(releaseValReal) || 0,
          premiacao_percent: parseFloat(releaseReward) || 0,
          data_liberacao: new Date().toISOString()
        }])

      if (error2) throw error2

      // 2b. Release Transportadora if selected
      if (releaseTransporterId) {
        // Buyer releases Transportadora
        await supabase.from('contatos').insert([{
          id_usuario: buyerId,
          id_contraparte: releaseTransporterId,
          id_anuncio: selectedProp.id_anuncio,
          id_transacao: selectedProp.id,
          papel_contraparte: 'Transportadora',
          taxa_lead_valor: 35.00,
          taxa_lead_paga: true,
          liberado: true,
          data_liberacao: new Date().toISOString()
        }])

        // Seller releases Transportadora
        await supabase.from('contatos').insert([{
          id_usuario: sellerId,
          id_contraparte: releaseTransporterId,
          id_anuncio: selectedProp.id_anuncio,
          id_transacao: selectedProp.id,
          papel_contraparte: 'Transportadora',
          taxa_lead_valor: 35.00,
          taxa_lead_paga: true,
          liberado: true,
          data_liberacao: new Date().toISOString()
        }])

        // Transportadora releases Buyer
        await supabase.from('contatos').insert([{
          id_usuario: releaseTransporterId,
          id_contraparte: buyerId,
          id_anuncio: selectedProp.id_anuncio,
          id_transacao: selectedProp.id,
          papel_contraparte: 'Comprador',
          taxa_lead_valor: 0,
          taxa_lead_paga: true,
          liberado: true,
          data_liberacao: new Date().toISOString()
        }])

        // Transportadora releases Seller
        await supabase.from('contatos').insert([{
          id_usuario: releaseTransporterId,
          id_contraparte: sellerId,
          id_anuncio: selectedProp.id_anuncio,
          id_transacao: selectedProp.id,
          papel_contraparte: 'Fornecedor',
          taxa_lead_valor: 0,
          taxa_lead_paga: true,
          liberado: true,
          data_liberacao: new Date().toISOString()
        }])
      }

      // 3. Update proposal status
      await supabase
        .from('propostas')
        .update({ status: 'Confirmada' })
        .eq('id', selectedProp.id)

      // Recalculate broker score if applicable
      const brokerId = selectedProp.anuncio?.id_cadastro
      if (brokerId) {
        await recalculateBrokerScore(brokerId)
      }

      showNotification('Contatos liberados de forma Bilateral e Simultânea!', 'success')
      setSelectedProp(null)
      setReleaseValIndex('')
      setReleaseValReal('')
      setReleaseReward('')
      setReleaseTransporterId('')
      loadData()

    } catch (err: any) {
      showNotification('Erro na liberação: ' + err.message, 'error')
    }
  }

  // Manual Contact Release from Ad list
  const handleReleaseManual = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAdForManualContacts) return

    if (!manualBuyerId || !manualSellerId) {
      showNotification('Você precisa selecionar o Comprador e o Fornecedor.', 'error')
      return
    }

    try {
      const targetAdId = selectedAdForManualContacts.id || null

      // 1. Create Row for Buyer (sees Seller)
      const { error: error1 } = await supabase
        .from('contatos')
        .insert([{
          id_usuario: manualBuyerId,
          id_contraparte: manualSellerId,
          id_anuncio: targetAdId,
          papel_contraparte: 'Fornecedor',
          taxa_lead_valor: 35.00,
          taxa_lead_paga: true,
          liberado: true,
          valor_index: parseFloat(manualValIndex) || 0,
          valor_real: parseFloat(manualValReal) || 0,
          premiacao_percent: parseFloat(manualReward) || 0,
          data_liberacao: new Date().toISOString()
        }])

      if (error1) throw error1

      // 2. Create Row for Seller (sees Buyer)
      const { error: error2 } = await supabase
        .from('contatos')
        .insert([{
          id_usuario: manualSellerId,
          id_contraparte: manualBuyerId,
          id_anuncio: targetAdId,
          papel_contraparte: 'Comprador',
          taxa_lead_valor: 35.00,
          taxa_lead_paga: true,
          liberado: true,
          valor_index: parseFloat(manualValIndex) || 0,
          valor_real: parseFloat(manualValReal) || 0,
          premiacao_percent: parseFloat(manualReward) || 0,
          data_liberacao: new Date().toISOString()
        }])

      if (error2) throw error2

      // 3. Release Transportadora if selected
      if (manualTransporterId) {
        // Buyer sees Transportadora
        await supabase.from('contatos').insert([{
          id_usuario: manualBuyerId,
          id_contraparte: manualTransporterId,
          id_anuncio: targetAdId,
          papel_contraparte: 'Transportadora',
          taxa_lead_valor: 35.00,
          taxa_lead_paga: true,
          liberado: true,
          data_liberacao: new Date().toISOString()
        }])

        // Seller sees Transportadora
        await supabase.from('contatos').insert([{
          id_usuario: manualSellerId,
          id_contraparte: manualTransporterId,
          id_anuncio: targetAdId,
          papel_contraparte: 'Transportadora',
          taxa_lead_valor: 35.00,
          taxa_lead_paga: true,
          liberado: true,
          data_liberacao: new Date().toISOString()
        }])

        // Transportadora sees Buyer
        await supabase.from('contatos').insert([{
          id_usuario: manualTransporterId,
          id_contraparte: manualBuyerId,
          id_anuncio: targetAdId,
          papel_contraparte: 'Comprador',
          taxa_lead_valor: 0,
          taxa_lead_paga: true,
          liberado: true,
          data_liberacao: new Date().toISOString()
        }])

        // Transportadora sees Seller
        await supabase.from('contatos').insert([{
          id_usuario: manualTransporterId,
          id_contraparte: manualSellerId,
          id_anuncio: targetAdId,
          papel_contraparte: 'Fornecedor',
          taxa_lead_valor: 0,
          taxa_lead_paga: true,
          liberado: true,
          data_liberacao: new Date().toISOString()
        }])
      }

      // 4. Release for Corretor if the ad was posted by a Corretor (who is not the buyer or seller directly)
      const adPosterId = selectedAdForManualContacts.id_cadastro
      if (adPosterId && adPosterId !== manualBuyerId && adPosterId !== manualSellerId) {
        // Corretor sees Buyer
        await supabase.from('contatos').insert([{
          id_usuario: adPosterId,
          id_contraparte: manualBuyerId,
          id_anuncio: targetAdId,
          papel_contraparte: 'Comprador',
          taxa_lead_valor: 0,
          taxa_lead_paga: true,
          liberado: true,
          data_liberacao: new Date().toISOString()
        }])

        // Corretor sees Seller
        await supabase.from('contatos').insert([{
          id_usuario: adPosterId,
          id_contraparte: manualSellerId,
          id_anuncio: targetAdId,
          papel_contraparte: 'Fornecedor',
          taxa_lead_valor: 0,
          taxa_lead_paga: true,
          liberado: true,
          data_liberacao: new Date().toISOString()
        }])

        // Corretor sees Transportadora
        if (manualTransporterId) {
          await supabase.from('contatos').insert([{
            id_usuario: adPosterId,
            id_contraparte: manualTransporterId,
            id_anuncio: targetAdId,
            papel_contraparte: 'Transportadora',
            taxa_lead_valor: 0,
            taxa_lead_paga: true,
            liberado: true,
            data_liberacao: new Date().toISOString()
          }])
        }
      }

      // Update advertisement status to "Fechado" or "Arrematado"
      if (targetAdId) {
        await supabase
          .from('anuncios')
          .update({ status: 'Fechado' })
          .eq('id', targetAdId)
      }

      // Recalculate broker score if applicable
      if (adPosterId) {
        await recalculateBrokerScore(adPosterId)
      }

      showNotification('Contatos vinculados e liberados com sucesso!', 'success')
      setSelectedAdForManualContacts(null)
      loadData()
    } catch (err: any) {
      showNotification('Erro ao vincular contatos: ' + err.message, 'error')
    }
  }

  // Revoke/Delete a released contact row
  const handleRevokeContato = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja revogar esta liberação de contato?')) return
    try {
      const { error } = await supabase
        .from('contatos')
        .delete()
        .eq('id', id)
      if (error) throw error
      showNotification('Contato revogado com sucesso!', 'success')
      loadData()
    } catch (err: any) {
      showNotification('Erro ao revogar contato: ' + err.message, 'error')
    }
  }

  // Release Reverse Bidding Carrier Contact
  const handleReleaseFrete = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFrete || !releaseFreteTransporterId) return

    try {
      const { error: updateError } = await supabase
        .from('frete')
        .update({
          id_transportadora: releaseFreteTransporterId,
          valor_encontrado: parseFloat(releaseFreteValEncontrado) || 0,
          taxa_lead_valor: parseFloat(releaseFreteLeadValor) || 0,
          taxa_lead_paga: true,
          status: 'Confirmado'
        })
        .eq('id', selectedFrete.id)

      if (updateError) throw updateError

      const compradorId = selectedFrete.id_comprador
      const sellerId = selectedFrete.anuncio?.id_cadastro
      const transportadoraId = releaseFreteTransporterId
      const transactionId = `frete-${selectedFrete.id}`

      // Buyer releases Carrier
      if (compradorId) {
        await supabase.from('contatos').insert([{
          id_usuario: compradorId,
          id_contraparte: transportadoraId,
          id_anuncio: selectedFrete.id_anuncio,
          id_transacao: transactionId,
          papel_contraparte: 'Transportadora',
          taxa_lead_valor: parseFloat(releaseFreteLeadValor) || 0,
          taxa_lead_paga: true,
          liberado: true,
          data_liberacao: new Date().toISOString()
        }])

        // Carrier releases Buyer
        await supabase.from('contatos').insert([{
          id_usuario: transportadoraId,
          id_contraparte: compradorId,
          id_anuncio: selectedFrete.id_anuncio,
          id_transacao: transactionId,
          papel_contraparte: 'Comprador',
          taxa_lead_valor: 0,
          taxa_lead_paga: true,
          liberado: true,
          data_liberacao: new Date().toISOString()
        }])
      }

      // Seller releases Carrier
      if (sellerId && sellerId !== compradorId) {
        await supabase.from('contatos').insert([{
          id_usuario: sellerId,
          id_contraparte: transportadoraId,
          id_anuncio: selectedFrete.id_anuncio,
          id_transacao: transactionId,
          papel_contraparte: 'Transportadora',
          taxa_lead_valor: 0,
          taxa_lead_paga: true,
          liberado: true,
          data_liberacao: new Date().toISOString()
        }])

        // Carrier releases Seller
        await supabase.from('contatos').insert([{
          id_usuario: transportadoraId,
          id_contraparte: sellerId,
          id_anuncio: selectedFrete.id_anuncio,
          id_transacao: transactionId,
          papel_contraparte: 'Fornecedor',
          taxa_lead_valor: 0,
          taxa_lead_paga: true,
          liberado: true,
          data_liberacao: new Date().toISOString()
        }])
      }

      showNotification('Contato da Transportadora liberado com sucesso!', 'success')
      setSelectedFrete(null)
      setReleaseFreteTransporterId('')
      setReleaseFreteValEncontrado('')
      setReleaseFreteLeadValor('35.00')
      loadData()
    } catch (err: any) {
      showNotification('Erro ao liberar frete: ' + err.message, 'error')
    }
  }

  // Create CRM Lead
  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase
      .from('leads')
      .insert([{
        empresa: newLeadEmpresa,
        contato: newLeadContato,
        telefone: newLeadTel,
        status_funil: newLeadStatus,
        fonte_do_lead: 'Painel Admin'
      }])

    if (!error) {
      showNotification('Lead adicionado ao funil!', 'success')
      setNewLeadEmpresa('')
      setNewLeadContato('')
      setNewLeadTel('')
      loadData()
    }
  }

  if (loadingAuth) {
    return (
      <div className="main-layout" style={{ justifyContent: 'center', alignItems: 'center', background: '#000' }}>
        <p style={{ color: 'var(--primary-500)', fontSize: '1.1rem', fontWeight: 'bold' }}>Validando credenciais administrativas...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="main-layout" style={{ justifyContent: 'center', alignItems: 'center', background: '#000', flexDirection: 'column', gap: '20px', padding: '40px' }}>
        <h2 style={{ textAlign: 'center', color: '#fff' }}>Acesso não autorizado. Apenas administradores do sistema podem visualizar esta página.</h2>
        <LinkComponent href="/" className="btn btn-secondary" style={{ background: '#1c1c1c', border: '1px solid #333' }}>
          Voltar para a Página Inicial
        </LinkComponent>
      </div>
    )
  }

  const filteredCadastros = cadastros.filter(c => {
    if (userFilter === 'todos') return true
    if (userFilter === 'fornecedor') return c.tipo_parte === 'Fornecedor' && c.subtipo !== 'Corretor' && c.subtipo !== 'Corretor/Controlador'
    if (userFilter === 'comprador') return c.tipo_parte === 'Comprador' && c.subtipo !== 'Corretor' && c.subtipo !== 'Corretor/Controlador'
    if (userFilter === 'corretor') return c.subtipo === 'Corretor' || c.subtipo === 'Corretor/Controlador'
    if (userFilter === 'transportadora') return c.tipo_parte === 'Transportadora'
    return true
  })

  return (
    <div className="main-layout" style={{ background: '#000', minHeight: '100vh', color: '#f5f5f5' }}>
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: notification.type === 'success' ? '#2e7d32' : '#c62828',
          color: '#fff',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          zIndex: 1100,
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {notification.type === 'success' ? '[Sucesso]' : '[Aviso]'} {notification.message}
        </div>
      )}
      
      {/* ADMIN HEADER */}
      <nav style={{ background: '#0a0a0a', borderBottom: '2px solid var(--primary-500)', padding: '16px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="Materra Elo" style={{ height: '40px' }} />
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary-500)', margin: 0 }}>
              Painel de Moderação & Homologação (Lucas)
            </h1>
          </div>
          <LinkComponent href="/" className="btn btn-secondary" style={{ background: '#1c1c1c', border: '1px solid #333' }}>
            Voltar ao Marketplace
          </LinkComponent>
        </div>
      </nav>

      {/* DASHBOARD TABS */}
      <div style={{ display: 'flex', background: '#121212', borderBottom: '1px solid #222' }}>
        <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          {(['cadastros', 'anuncios', 'fichas_representadas', 'propostas', 'fretes', 'leads', 'contatos_liberados'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedUser(null); setSelectedAd(null); setSelectedProp(null); setSelectedFichaRep(null); }}
              style={{
                padding: '16px 24px',
                border: 'none',
                background: 'none',
                color: activeTab === tab ? 'var(--primary-500)' : '#777',
                borderBottom: activeTab === tab ? '3px solid var(--primary-500)' : '3px solid transparent',
                fontWeight: 'bold',
                cursor: 'pointer',
                textTransform: 'uppercase',
                fontSize: '0.85rem'
              }}
            >
              {tab === 'cadastros' && 'Cadastros'}
              {tab === 'anuncios' && 'Anúncios'}
              {tab === 'fichas_representadas' && 'Fichas Representadas'}
              {tab === 'propostas' && 'Propostas'}
              {tab === 'fretes' && 'Leilões Frete'}
              {tab === 'leads' && 'CRM Leads'}
              {tab === 'contatos_liberados' && 'Contatos Liberados'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '32px 20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

        {/* TAB 1: CADASTROS */}
        {activeTab === 'cadastros' && (
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>Homologação de Usuários e Transportadoras</h2>
            
            {/* Filter buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'fornecedor', label: 'Fornecedores' },
                { id: 'comprador', label: 'Compradores' },
                { id: 'corretor', label: 'Corretores' },
                { id: 'transportadora', label: 'Transportadoras' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setUserFilter(f.id as any)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    border: '1px solid #333',
                    background: userFilter === f.id ? 'var(--primary-500)' : '#1c1c1c',
                    color: userFilter === f.id ? '#000' : '#ccc',
                    cursor: 'pointer',
                    transition: 'background 0.2s, color 0.2s'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#121212', borderRadius: '8px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: '#1c1c1c', borderBottom: '1px solid #333', textAlign: 'left', color: '#aaa', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px' }}>Nome / Razão</th>
                  <th>Contato (Email/Whats)</th>
                  <th>Documentos (CPF/CNPJ / PIX)</th>
                  <th>Tipo / Subtipo</th>
                  <th>Status Doc</th>
                  <th>Área Atuação</th>
                  <th>Plano Ativo</th>
                  <th>Selo / Score</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.9rem' }}>
                {filteredCadastros.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #222' }}>
                     <td style={{ padding: '12px', fontWeight: 'bold' }}>{c.nome_ou_razao}</td>
                     <td>
                       <div style={{ fontSize: '0.85rem' }}>{c.email}</div>
                       <div style={{ fontSize: '0.75rem', color: '#888' }}>{c.whatsapp || 'N/A'}</div>
                     </td>
                     <td>
                       <div style={{ fontSize: '0.85rem' }}>{c.cpf_ou_cnpj || 'Não inf.'}</div>
                       <div style={{ fontSize: '0.75rem', color: 'var(--primary-500)' }}>PIX: {c.chave_pix || 'Não inf.'}</div>
                     </td>
                     <td>
                       <span style={{ fontSize: '0.85rem', display: 'block', fontWeight: 'bold' }}>{c.tipo_parte}</span>
                       <span style={{ fontSize: '0.75rem', color: '#aaa' }}>{c.subtipo || 'Empresa'}</span>
                       <span style={{ fontSize: '0.75rem', color: '#888', display: 'block' }}>{c.cidade}-{c.uf}</span>
                     </td>
                     <td style={{
                       color: c.status_documentos === 'Verificado' ? 'var(--primary-500)' : (c.status_documentos === 'Em análise' ? '#ffeb3b' : '#aaa'),
                       fontWeight: 'bold'
                     }}>
                       {c.status_documentos}
                     </td>
                     <td>{c.area_atuacao || 'Não informada'}</td>
                     <td>{c.plano_ativo ? 'Sim (R$35)' : 'Não'}</td>
                     <td>
                        {c.nivel_selo ? (
                          <div style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            background: c.nivel_selo === 'Ouro' ? 'rgba(255,215,0,0.2)' : (c.nivel_selo === 'Verde' ? 'rgba(46,125,50,0.2)' : 'rgba(205,127,50,0.2)'),
                            color: c.nivel_selo === 'Ouro' ? '#ffd700' : (c.nivel_selo === 'Verde' ? '#81c784' : '#ffb74d')
                          }}>
                            {c.nivel_selo}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#666' }}>Sem Selo</span>
                        )}
                        <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '4px' }}>
                          Score: <strong>{c.score_0a100 !== null && c.score_0a100 !== undefined ? c.score_0a100 : 50}/100</strong>
                        </div>
                      </td>
                    <td>
                      <button onClick={() => setSelectedUser(c)} className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#000', fontWeight: 'bold' }}>
                        Homologar / Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: ANÚNCIOS */}
        {activeTab === 'anuncios' && (
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>Moderação de Publicações (Index Materra)</h2>

            {/* Quick Index Input Area */}
            {anuncios.some(a => !a.valor_index || a.valor_index === 0) && (
              <div style={{ background: '#1c1503', border: '1px solid var(--primary-500)', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', marginBottom: '12px' }}>
                  Pendentes de Materra Index (Preço Referência)
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#ccc', marginBottom: '16px' }}>
                  Os seguintes anúncios estão com o índice como "Calculando...". Insira o valor de referência do mercado para habilitar a exibição do desvio.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {anuncios.filter(a => !a.valor_index || a.valor_index === 0).map(a => {
                    const tempVal = tempIndexes[a.id] ?? ''
                    return (
                      <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#000', padding: '12px', borderRadius: '8px', border: '1px solid #222', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--primary-500)', fontWeight: 'bold', display: 'block' }}>{a.codigo}</span>
                          <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{a.residuo}</strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: '#888' }}>
                            Desejado: R$ {a.valor_desejado} • {a.municipio}/{a.uf} • Por: {a.cadastros?.nome_ou_razao || 'N/A'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input
                            type="number"
                            step="any"
                            placeholder="Valor Index (R$)"
                            className="form-input"
                            style={{ background: '#121212', color: '#fff', border: '1px solid #333', width: '160px', padding: '8px', fontSize: '0.85rem' }}
                            value={tempVal}
                            onChange={e => setTempIndexes({ ...tempIndexes, [a.id]: e.target.value })}
                          />
                          <button
                            onClick={() => {
                              const val = parseFloat(tempVal)
                              if (isNaN(val) || val <= 0) {
                                showNotification('Por favor, insira um valor válido maior que 0', 'error')
                                return
                              }
                              handleDirectUpdateIndex(a.id, parseFloat(a.valor_desejado), val)
                            }}
                            className="btn btn-primary"
                            style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#000', fontWeight: 'bold' }}
                          >
                            Salvar Index
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#121212', borderRadius: '8px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: '#1c1c1c', borderBottom: '1px solid #333', textAlign: 'left', color: '#aaa', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px' }}>Código / Resíduo</th>
                  <th>Anunciante (Email/Whats)</th>
                  <th>Doc/PIX Anunciante</th>
                  <th>Cidade-UF</th>
                  <th>Valor Desejado</th>
                  <th>Materra Index</th>
                  <th>Desvio</th>
                  <th>Leilão / Views</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.9rem' }}>
                {anuncios.map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '12px' }}>
                      <strong style={{ color: 'var(--primary-500)', display: 'block' }}>{a.codigo}</strong>
                      <span style={{ fontSize: '0.85rem', color: '#fff' }}>{a.residuo}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>{a.cadastros?.nome_ou_razao || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>
                        {a.cadastros?.email || 'N/A'} | Whatsapp: {a.cadastros?.whatsapp || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: '#ccc' }}>CPF/CNPJ: {a.cadastros?.cpf_ou_cnpj || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary-500)' }}>PIX: {a.cadastros?.chave_pix || 'Não inf.'}</div>
                    </td>
                    <td>{a.municipio}-{a.uf}</td>
                    <td>R$ {a.valor_desejado}</td>
                    <td>
                      {a.valor_index ? (
                        <strong>R$ {a.valor_index}</strong>
                      ) : (
                        <span style={{ color: '#ffb300', fontWeight: 'bold' }}>Calculando... (Pendente)</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--primary-500)', fontWeight: 'bold' }}>{a.percentual_desvio || 'Calculando...'}</td>
                    <td>
                      {a.tipo_leilao === 'Ascendente' || a.tipo_leilao === 'Descendente' ? (
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-500)' }}>
                            {getAuctionStatus(a).statusText}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#888' }}>
                            {a.visualizacoes || 0} visualizações
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: '#666', fontSize: '0.8rem' }}>Sem Leilão</div>
                      )}
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem',
                        background: a.status === 'Anunciado' ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.05)',
                        color: a.status === 'Anunciado' ? 'var(--primary-500)' : '#aaa'
                      }}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setSelectedAd(a)} className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#000', fontWeight: 'bold' }}>
                          Moderar Index
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedAdForManualContacts(a);
                            setManualValIndex(a.valor_index ? a.valor_index.toString() : (a.valor_desejado ? a.valor_desejado.toString() : ''));
                            setManualValReal(a.valor_desejado ? a.valor_desejado.toString() : '');
                            setManualReward('0');
                            setManualBuyerId('');
                            setManualSellerId(a.id_cadastro || '');
                            setManualTransporterId('');
                          }} 
                          className="btn btn-primary" 
                          style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#000', fontWeight: 'bold', background: '#25D366', border: 'none' }}
                        >
                          Vincular Contatos
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: PROPOSTAS */}
        {activeTab === 'propostas' && (
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>Liberação de Lead de Proposta (Bilateral Simultâneo)</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#121212', borderRadius: '8px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: '#1c1c1c', borderBottom: '1px solid #333', textAlign: 'left', color: '#aaa', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px' }}>Anúncio</th>
                  <th>Proponente</th>
                  <th>Papel</th>
                  <th>Valor Proposto</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.9rem' }}>
                {propostas.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '12px' }}>[{p.anuncio?.codigo}] {p.anuncio?.residuo}</td>
                    <td>{p.proponente?.nome_ou_razao || p.proponente?.email}</td>
                    <td>{p.papel_proponente}</td>
                    <td>R$ {p.valor_proposto}</td>
                    <td style={{
                      color: p.status === 'Confirmada' ? 'var(--primary-500)' : (p.status === 'Enviada' ? '#ffeb3b' : '#ff5353'),
                      fontWeight: 'bold'
                    }}>
                      {p.status === 'Enviada' ? 'Confirmação Pendente' : p.status}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {p.status === 'Enviada' && (
                          <>
                            <button onClick={() => { setSelectedProp(p); setReleaseValIndex(p.anuncio?.valor_desejado?.toString() || ''); }} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#e5c158', color: '#000', fontWeight: 'bold', border: 'none' }}>
                              Liberar Bilateral
                            </button>
                            <button onClick={() => handleConfirmReceipt(p)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#25D366', color: '#000', fontWeight: 'bold', border: 'none' }}>
                              Confirmar com Empresa
                            </button>
                            <button onClick={() => handleDeclineReceipt(p)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#d32f2f', color: '#fff', fontWeight: 'bold', border: 'none' }}>
                              Recusar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: FRETES */}
        {activeTab === 'fretes' && (
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>Histórico dos Leilões de Fretes Ativos</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#121212', borderRadius: '8px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: '#1c1c1c', borderBottom: '1px solid #333', textAlign: 'left', color: '#aaa', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px' }}>Código</th>
                  <th>Comprador</th>
                  <th>Rota</th>
                  <th>Material</th>
                  <th>Quantidade</th>
                  <th>Simulado</th>
                  <th>Transportadora</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.9rem' }}>
                {fretes.map(f => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '12px' }}>#{f.id.substring(0,6)}</td>
                    <td>{f.comprador?.nome_ou_razao || f.comprador?.email}</td>
                    <td>{f.origem} → {f.destino}</td>
                    <td>{f.tipo_material || 'Resíduo'}</td>
                    <td>{f.quantidade} {f.unidade}</td>
                    <td>R$ {f.valor_simulado}</td>
                    <td>{f.transportadora?.nome_ou_razao || 'Não vinculada'}</td>
                    <td style={{
                      color: f.status === 'Confirmado' ? 'var(--primary-500)' : '#ffeb3b',
                      fontWeight: 'bold'
                    }}>{f.status}</td>
                    <td>
                      {f.status === 'Aberto' && (
                        <button
                          onClick={() => {
                            setSelectedFrete(f);
                            setReleaseFreteTransporterId(f.id_transportadora || '');
                            setReleaseFreteValEncontrado(f.valor_simulado?.toString() || '');
                          }}
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#000', fontWeight: 'bold' }}
                        >
                          Liberar Frete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: LEADS CRM */}
        {activeTab === 'leads' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>Funil de Vendas & Negociações Internas (CRM)</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#121212', borderRadius: '8px', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: '#1c1c1c', borderBottom: '1px solid #333', textAlign: 'left', color: '#aaa', fontSize: '0.85rem' }}>
                    <th style={{ padding: '12px' }}>Empresa</th>
                    <th>Contato</th>
                    <th>Telefone</th>
                    <th>Funil Status</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '0.9rem' }}>
                  {leads.map(l => (
                    <tr key={l.id} style={{ borderBottom: '1px solid #222' }}>
                      <td style={{ padding: '12px' }}>{l.empresa}</td>
                      <td>{l.contato}</td>
                      <td>{l.telefone}</td>
                      <td style={{ color: 'var(--primary-500)', fontWeight: 'bold' }}>{l.status_funil}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: '#121212', padding: '24px', borderRadius: '12px', border: '1px solid #333' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', marginBottom: '16px' }}>Adicionar Lead ao Funil</h3>
              <form onSubmit={handleAddLead} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="text" placeholder="Empresa" className="form-input" style={{ background: '#000', color: '#fff', border: '1px solid #333' }} value={newLeadEmpresa} onChange={e => setNewLeadEmpresa(e.target.value)} required />
                <input type="text" placeholder="Nome Contato" className="form-input" style={{ background: '#000', color: '#fff', border: '1px solid #333' }} value={newLeadContato} onChange={e => setNewLeadContato(e.target.value)} />
                <input type="text" placeholder="Telefone" className="form-input" style={{ background: '#000', color: '#fff', border: '1px solid #333' }} value={newLeadTel} onChange={e => setNewLeadTel(e.target.value)} />
                <select className="form-select" style={{ background: '#000', color: '#fff', border: '1px solid #333' }} value={newLeadStatus} onChange={e => setNewLeadStatus(e.target.value as any)}>
                  <option value="A contatar">A contatar</option>
                  <option value="Contatado">Contatado</option>
                  <option value="Negociando">Negociando</option>
                  <option value="Fechado">Fechado</option>
                </select>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', color: '#000', fontWeight: 'bold' }}>Salvar Lead</button>
              </form>
            </div>
          </div>
        )}

        {/* TAB: FICHAS REPRESENTADAS */}
        {activeTab === 'fichas_representadas' && (
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '20px' }}>
              Fichas de Empresas Representadas (Corretores)
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#121212', borderRadius: '8px', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: '#1c1c1c', borderBottom: '1px solid #333', textAlign: 'left', color: '#aaa', fontSize: '0.85rem' }}>
                    <th style={{ padding: '12px' }}>Razão Social</th>
                    <th>CNPJ</th>
                    <th>Corretor Intermediário</th>
                    <th>Selo</th>
                    <th>Score</th>
                    <th>Status Docs</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '0.9rem' }}>
                  {fichasRepresentadas.map(ficha => (
                    <tr key={ficha.id} style={{ borderBottom: '1px solid #222' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{ficha.razao_social}</td>
                      <td>{ficha.cnpj || 'Não informado'}</td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          <strong>{ficha.corretor?.nome_ou_razao || 'Desconhecido'}</strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: '#777' }}>
                            {ficha.corretor?.email}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          background: ficha.selo_metal === 'Ouro' ? 'linear-gradient(135deg, #ffd700 0%, #ffa500 100%)' : (ficha.selo_metal === 'Prata' ? '#c0c0c0' : '#cd7f32'),
                          color: '#000',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {ficha.selo_metal || 'Bronze'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 'bold' }}>{ficha.score_0a100 || 50}/100</td>
                      <td>
                        <span style={{
                          color: ficha.status_documentos === 'Verificado' ? 'var(--primary-500)' : '#ffb300',
                          fontWeight: 'bold'
                        }}>
                          {ficha.status_documentos || 'Pendente'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedFichaRep(ficha)}
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#000', fontWeight: 'bold' }}
                        >
                          Homologar Ficha
                        </button>
                      </td>
                    </tr>
                  ))}
                  {fichasRepresentadas.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
                        Nenhuma ficha de empresa representada cadastrada no momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: CONTATOS LIBERADOS */}
        {activeTab === 'contatos_liberados' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Contatos Liberados no Marketplace
              </h2>
              <button
                onClick={() => {
                  setSelectedAdForManualContacts({ id: '', codigo: 'Novo Vínculo', residuo: 'Inserção Manual', id_cadastro: '' });
                  setManualValIndex('');
                  setManualValReal('');
                  setManualReward('0');
                  setManualBuyerId('');
                  setManualSellerId('');
                  setManualTransporterId('');
                }}
                className="btn btn-primary"
                style={{ padding: '8px 16px', color: '#000', fontWeight: 'bold', background: 'var(--primary-500)', border: 'none' }}
              >
                + Liberar Contato Manualmente
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#121212', borderRadius: '8px', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: '#1c1c1c', borderBottom: '1px solid #333', textAlign: 'left', color: '#aaa', fontSize: '0.85rem' }}>
                    <th style={{ padding: '12px' }}>Anúncio</th>
                    <th>Usuário (Quem visualiza)</th>
                    <th>Contraparte (Contato revelado)</th>
                    <th>Papel Contraparte</th>
                    <th>Data Liberação</th>
                    <th>Valores Fechados</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '0.9rem' }}>
                  {allContatosList.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #222' }}>
                      <td style={{ padding: '12px' }}>
                        {c.anuncio ? (
                          <>
                            <strong style={{ color: 'var(--primary-500)' }}>[{c.anuncio.codigo}]</strong>
                            <span style={{ display: 'block', fontSize: '0.8rem', color: '#ccc' }}>{c.anuncio.residuo}</span>
                          </>
                        ) : (
                          <span style={{ color: '#666' }}>Manual / S/ Anúncio</span>
                        )}
                      </td>
                      <td>
                        <strong>{c.usuario?.nome_ou_razao || 'N/A'}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#777' }}>{c.usuario?.email} ({c.usuario?.tipo_parte})</span>
                      </td>
                      <td>
                        <strong>{c.contraparte?.nome_ou_razao || 'N/A'}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#777' }}>{c.contraparte?.email} ({c.contraparte?.tipo_parte})</span>
                      </td>
                      <td>
                        <span style={{
                          background: c.papel_contraparte === 'Comprador' ? 'rgba(37,211,102,0.1)' : (c.papel_contraparte === 'Fornecedor' ? 'rgba(229,193,88,0.1)' : 'rgba(255,255,255,0.05)'),
                          color: c.papel_contraparte === 'Comprador' ? '#25D366' : (c.papel_contraparte === 'Fornecedor' ? 'var(--primary-500)' : '#aaa'),
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          {c.papel_contraparte}
                        </span>
                      </td>
                      <td>{c.data_liberacao ? new Date(c.data_liberacao).toLocaleString('pt-BR') : 'N/A'}</td>
                      <td>
                        <div style={{ fontSize: '0.8rem', color: '#ccc' }}>
                          Real: R$ {c.valor_real || 0}<br />
                          Index: R$ {c.valor_index || 0}<br />
                          Prêmio: {c.premiacao_percent || 0}%
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => handleRevokeContato(c.id)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#d32f2f', color: '#fff', border: 'none', fontWeight: 'bold' }}
                        >
                          Revogar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {allContatosList.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
                        Nenhum contato liberado no momento. Clique no botão acima para liberar manualmente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* EDIT USER MODAL */}
      {selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <form onSubmit={handleSaveUser} style={{ background: '#121212', border: '1px solid #333', padding: '32px', borderRadius: '16px', width: '550px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff' }}>Homologação: {selectedUser.nome_ou_razao}</h3>
            
            {/* Show any documents inside documentos_recebidos JSON */}
            {selectedUser.documentos_recebidos && (
              <div style={{ background: '#1c1503', border: '1px solid var(--primary-500)', padding: '14px', borderRadius: '8px', fontSize: '0.85rem' }}>
                <strong style={{ color: 'var(--primary-500)', display: 'block', marginBottom: '8px' }}>Documentos Enviados na Ficha:</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(() => {
                    try {
                      const docs = JSON.parse(selectedUser.documentos_recebidos)
                      const keys = Object.keys(docs)
                      if (keys.length === 0) return <span style={{ color: '#aaa' }}>Nenhum documento anexado na Ficha ainda.</span>
                      return keys.map(k => (
                        <div key={k} style={{ borderBottom: '1px solid #3a2d0a', paddingBottom: '6px', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 'bold', color: '#fff', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                            {k.replace(/_/g, ' ')}:
                          </span>{' '}
                          {docs[k].num && <span style={{ color: '#aaa' }}>Nº {docs[k].num} • </span>}
                          {docs[k].validade && <span style={{ color: '#aaa' }}>Val: {docs[k].validade} • </span>}
                          {docs[k].url && (
                            <a href={docs[k].url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-500)', textDecoration: 'underline', fontWeight: 'bold' }}>
                              Visualizar Arquivo
                            </a>
                          )}
                        </div>
                      ))
                    } catch (e) {
                      return <span style={{ color: '#ff5353' }}>Erro ao ler JSON de documentos.</span>
                    }
                  })()}
                </div>
              </div>
            )}

            {/* Show Transportadora license document links if available */}
            {selectedUser.tipo_parte === 'Transportadora' && (
              <div style={{ background: '#1c1503', border: '1px solid var(--primary-500)', padding: '14px', borderRadius: '8px', fontSize: '0.85rem' }}>
                <strong style={{ color: 'var(--primary-500)', display: 'block', marginBottom: '8px' }}>Cadastro de Licenças de Transporte:</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span>
                    Licença: {selectedUser.licenca_ambiental_num || 'N/A'} (Validade: {selectedUser.licenca_ambiental_validade || 'N/A'}) - Organ: {selectedUser.licenca_ambiental_orgao || 'N/A'}
                  </span>
                  {selectedUser.licenca_ambiental_url && (
                    <a href={selectedUser.licenca_ambiental_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-500)', textDecoration: 'underline' }}>
                      Clique para visualizar o arquivo de Licença
                    </a>
                  )}
                  <span style={{ borderTop: '1px solid #3a2d0a', marginTop: '6px', paddingTop: '6px' }}>
                    RNTRC: {selectedUser.rntrc_num || 'N/A'} (Validade: {selectedUser.rntrc_validade || 'N/A'})
                  </span>
                  {selectedUser.rntrc_url && (
                    <a href={selectedUser.rntrc_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-500)', textDecoration: 'underline' }}>
                      Clique para visualizar o arquivo de RNTRC
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Core User Details */}
            <div style={{ background: '#1c1c1c', border: '1px solid #333', padding: '14px', borderRadius: '8px', fontSize: '0.85rem' }}>
              <strong style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>Dados Cadastrais da Conta:</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: '#ccc' }}>
                <div><strong>Nome / Razão:</strong> {selectedUser.nome_ou_razao || 'N/A'}</div>
                <div><strong>CPF / CNPJ:</strong> {selectedUser.cpf_ou_cnpj || 'N/A'}</div>
                <div><strong>E-mail:</strong> {selectedUser.email || 'N/A'}</div>
                <div><strong>WhatsApp:</strong> {selectedUser.whatsapp || 'N/A'}</div>
                <div style={{ gridColumn: 'span 2' }}><strong>Endereço:</strong> {selectedUser.endereco || 'N/A'} {selectedUser.cidade && `- ${selectedUser.cidade}/${selectedUser.uf || ''}`}</div>
                <div style={{ gridColumn: 'span 2', borderTop: '1px solid #222', paddingTop: '6px', marginTop: '4px' }}>
                  <strong style={{ color: 'var(--primary-500)' }}>Chave PIX:</strong> {selectedUser.chave_pix || 'Não cadastrada'}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Área de Atuação da Transportadora (Siglas de Estados, ex: GO, DF, SP)</label>
              <input
                type="text"
                placeholder="GO, DF, SP"
                className="form-input"
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                value={selectedUser.area_atuacao || ''}
                onChange={e => setSelectedUser({...selectedUser, area_atuacao: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Status Homologação</label>
              <select className="form-select" style={{ background: '#000', color: '#fff', border: '1px solid #333' }} value={selectedUser.status_documentos} onChange={e => setSelectedUser({...selectedUser, status_documentos: e.target.value})}>
                <option value="Pendente">Pendente</option>
                <option value="Em análise">Em análise</option>
                <option value="Verificado">Verificado</option>
                <option value="Reprovado">Reprovado</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#fff' }}>Selo Habilitação</label>
                <select className="form-select" style={{ background: '#000', color: '#fff', border: '1px solid #333' }} value={selectedUser.nivel_selo || 'Amarelo'} onChange={e => setSelectedUser({...selectedUser, nivel_selo: e.target.value})}>
                  <option value="Vermelho">Vermelho</option>
                  <option value="Amarelo">Amarelo (Bronze)</option>
                  <option value="Verde">Verde (Prata)</option>
                  <option value="Ouro">Ouro</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: '#fff' }}>Índice Reputação (0 a 100)</label>
                <input type="number" className="form-input" style={{ background: '#000', color: '#fff', border: '1px solid #333' }} value={selectedUser.score_0a100 ?? 50} onChange={e => setSelectedUser({...selectedUser, score_0a100: parseInt(e.target.value) || 0})} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedUser.selo_verificado || false} onChange={e => setSelectedUser({...selectedUser, selo_verificado: e.target.checked})} />
                Selo Verificado Ativo?
              </label>
              <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedUser.plano_ativo || false} onChange={e => setSelectedUser({...selectedUser, plano_ativo: e.target.checked})} />
                Assinatura ProAtiva (R$35) Ativa?
              </label>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Anotações Administrativas</label>
              <textarea className="form-input" rows={3} style={{ background: '#000', color: '#fff', border: '1px solid #333' }} value={selectedUser.observacoes || ''} onChange={e => setSelectedUser({...selectedUser, observacoes: e.target.value})} />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, color: '#000', fontWeight: 'bold' }}>Salvar Homologação</button>
              <button type="button" onClick={() => setSelectedUser(null)} className="btn btn-secondary" style={{ background: '#1c1c1c', border: '1px solid #333' }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT AD MODAL */}
      {selectedAd && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={handleSaveAd} style={{ background: '#121212', border: '1px solid #333', padding: '32px', borderRadius: '16px', width: '500px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>Moderar Anúncio: [{selectedAd.codigo}] {selectedAd.residuo}</h3>

            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Valor Desejado Anunciado (R$)</label>
              <input type="number" className="form-input" style={{ background: '#000', color: '#fff', border: '1px solid #333' }} value={selectedAd.valor_desejado || 0} readOnly disabled />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Índice de Mercado Materra Referência (R$)</label>
              <input type="number" step="any" className="form-input" style={{ background: '#000', color: '#fff', border: '1px solid #333' }} value={selectedAd.valor_index !== null && selectedAd.valor_index !== undefined ? selectedAd.valor_index : ''} onChange={e => setSelectedAd({...selectedAd, valor_index: e.target.value})} placeholder="Defina o preço referência" required />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Status do Anúncio</label>
              <select className="form-select" style={{ background: '#000', color: '#fff', border: '1px solid #333' }} value={selectedAd.status} onChange={e => setSelectedAd({...selectedAd, status: e.target.value})}>
                <option value="Pendente">Pendente (Em Análise)</option>
                <option value="Anunciado">Anunciado (No Ar)</option>
                <option value="Em negociação">Em negociação</option>
                <option value="Fechado">Fechado</option>
                <option value="Inativo">Inativo</option>
                <option value="Suspenso">Suspenso (Leilão Pausado)</option>
              </select>
            </div>

            {/* Visualizações and Auction Status */}
            <div style={{ background: '#1c1c1c', padding: '12px', borderRadius: '8px', border: '1px solid #333', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#aaa' }}>Visualizações:</span>
                <strong style={{ color: '#fff' }}>{selectedAd.visualizacoes || 0} visualizações</strong>
              </div>
              {(selectedAd.tipo_leilao === 'Ascendente' || selectedAd.tipo_leilao === 'Descendente') && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#aaa' }}>Status do Leilão:</span>
                  <strong style={{ color: 'var(--primary-500)' }}>{getAuctionStatus(selectedAd).statusText}</strong>
                </div>
              )}
            </div>

            {/* Urgência tag */}
            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Etiqueta de Urgência do Admin (Livre / Destaque)</label>
              <input
                type="text"
                className="form-input"
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                value={selectedAd.urgencia_admin || ''}
                onChange={e => setSelectedAd({...selectedAd, urgencia_admin: e.target.value})}
                placeholder="Ex.: Aberto, 142 visualizações, restam 2 dias"
              />
            </div>

            {/* Manual controls for Auction */}
            {/* Manual controls for Auction */}
            {(selectedAd.tipo_leilao === 'Ascendente' || selectedAd.tipo_leilao === 'Descendente') && (
              <div style={{ borderTop: '1px solid #333', paddingTop: '12px', marginTop: '4px' }}>
                <label className="form-label" style={{ color: '#fff', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Controle Manual do Leilão</label>
                
                {!selectedAd.data_inicio_leilao ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginBottom: '12px', background: '#0d0d0d', padding: '12px', borderRadius: '8px', border: '1px solid #222' }}>
                    <span style={{ fontSize: '0.8rem', color: '#aaa' }}>Selecione a Duração do Leilão:</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        className="form-select"
                        style={{ flex: 1, background: '#000', color: '#fff', border: '1px solid #333', padding: '8px' }}
                        value={selectedAd.duracao_leilao_horas || 24}
                        onChange={e => setSelectedAd({ ...selectedAd, duracao_leilao_horas: parseInt(e.target.value) })}
                      >
                        <option value="24">24 horas</option>
                        <option value="48">48 horas</option>
                        <option value="72">72 horas</option>
                        <option value="168">1 semana</option>
                        <option value="336">2 semanas (Máx. 14 dias)</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date()
                          const durationHrs = selectedAd.duracao_leilao_horas || 24
                          const end = new Date(now.getTime() + durationHrs * 60 * 60 * 1000)
                          setSelectedAd({
                            ...selectedAd,
                            data_inicio_leilao: now.toISOString(),
                            data_fim_leilao: end.toISOString(),
                            status: 'Anunciado'
                          })
                          alert(`Leilão aberto por ${durationHrs} horas! Clique em Aprovar & Homologar para salvar e publicar.`);
                        }}
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', color: '#000', fontWeight: 'bold' }}
                      >
                        Abrir Leilão
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#0d0d0d', border: '1px solid #222', padding: '12px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.8rem', color: '#aaa' }}>
                    ⏱️ Leilão já iniciado em: <strong>{new Date(selectedAd.data_inicio_leilao).toLocaleString('pt-BR')}</strong><br/>
                    Término planejado: <strong>{new Date(selectedAd.data_fim_leilao).toLocaleString('pt-BR')}</strong>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    disabled={!selectedAd.data_inicio_leilao}
                    onClick={() => {
                      const currentEnd = selectedAd.data_fim_leilao ? new Date(selectedAd.data_fim_leilao) : new Date()
                      const newEnd = new Date(currentEnd.getTime() + 24 * 60 * 60 * 1000)
                      setSelectedAd({
                        ...selectedAd,
                        data_fim_leilao: newEnd.toISOString(),
                        duracao_leilao_horas: (selectedAd.duracao_leilao_horas || 24) + 24
                      })
                      alert('Tempo limite do leilão estendido por +24h! Clique em Aprovar para persistir.')
                    }}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', background: '#333', border: '1px solid #444', opacity: selectedAd.data_inicio_leilao ? 1 : 0.5 }}
                  >
                    Prorrogar (+24h)
                  </button>

                  {selectedAd.status !== 'Suspenso' ? (
                    <button
                      type="button"
                      disabled={!selectedAd.data_inicio_leilao}
                      onClick={() => {
                        setSelectedAd({ ...selectedAd, status: 'Suspenso' })
                        alert('Status alterado para Suspenso! Clique em Aprovar para persistir.')
                      }}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', background: '#e53935', color: '#fff', border: 'none', opacity: selectedAd.data_inicio_leilao ? 1 : 0.5 }}
                    >
                      Pausar
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!selectedAd.data_inicio_leilao}
                      onClick={() => {
                        setSelectedAd({ ...selectedAd, status: 'Anunciado' })
                        alert('Status alterado para Anunciado (Ativo)! Clique em Aprovar para persistir.')
                      }}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', background: '#4caf50', color: '#fff', border: 'none', opacity: selectedAd.data_inicio_leilao ? 1 : 0.5 }}
                    >
                      Retomar
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={!selectedAd.data_inicio_leilao}
                    onClick={() => {
                      setSelectedAd({
                        ...selectedAd,
                        status: 'Fechado',
                        data_fim_leilao: new Date().toISOString()
                      })
                      alert('Leilão encerrado (Status definido como Fechado)! Clique em Aprovar para persistir.')
                    }}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', background: '#888', color: '#000', border: 'none', opacity: selectedAd.data_inicio_leilao ? 1 : 0.5 }}
                  >
                    Encerrar
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, color: '#000', fontWeight: 'bold' }}>Aprovar & Homologar Anúncio</button>
              <button type="button" onClick={() => setSelectedAd(null)} className="btn btn-secondary" style={{ background: '#1c1c1c', border: '1px solid #333' }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* BILATERAL CONTACT RELEASE MODAL */}
      {selectedProp && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={handleReleaseBilateral} style={{ background: '#121212', border: '1px solid #333', padding: '32px', borderRadius: '16px', width: '500px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>Liberar Leads de Contato</h3>
            <p style={{ fontSize: '0.85rem', color: '#aaa' }}>
              Preencha os valores simulados de referência para habilitar a visualização dos contatos simultaneamente.
            </p>

            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Valor do Índice Materra Referência (R$)</label>
              <input type="number" className="form-input" style={{ background: '#000', color: '#fff', border: '1px solid #333' }} value={releaseValIndex} onChange={e => setReleaseValIndex(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Valor Real Estimado (R$)</label>
              <input type="number" className="form-input" style={{ background: '#000', color: '#fff', border: '1px solid #333' }} value={releaseValReal} onChange={e => setReleaseValReal(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Economia Alcançada (%)</label>
              <input type="number" className="form-input" style={{ background: '#000', color: '#fff', border: '1px solid #333' }} value={releaseReward} onChange={e => setReleaseReward(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Vincular Transportadora (Opcional)</label>
              <select
                className="form-select"
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                value={releaseTransporterId}
                onChange={e => setReleaseTransporterId(e.target.value)}
              >
                <option value="">Nenhuma (Liberar apenas comprador/fornecedor)</option>
                {transportadoras.map(t => (
                  <option key={t.id} value={t.id}>{t.nome_ou_razao} ({t.email})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, color: '#000', background: '#25D366', fontWeight: 'bold' }}>Confirmar & Liberar Contato</button>
              <button type="button" onClick={() => { setSelectedProp(null); setReleaseTransporterId(''); }} className="btn btn-secondary" style={{ background: '#1c1c1c', border: '1px solid #333' }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* MANUAL CONTACT RELEASE MODAL */}
      {selectedAdForManualContacts && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={handleReleaseManual} style={{ background: '#121212', border: '1px solid #333', padding: '32px', borderRadius: '16px', width: '500px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>Vincular & Liberar Contatos Manualmente</h3>
            {selectedAdForManualContacts.id ? (
              <p style={{ fontSize: '0.85rem', color: '#aaa' }}>
                Anúncio: <strong style={{ color: 'var(--primary-500)' }}>[{selectedAdForManualContacts.codigo}]</strong> - {selectedAdForManualContacts.residuo}<br />
                Anunciante: {selectedAdForManualContacts.cadastros?.nome_ou_razao || 'Desconhecido'}
              </p>
            ) : (
              <div className="form-group">
                <label className="form-label" style={{ color: '#fff' }}>Vincular a qual Anúncio? (Opcional)</label>
                <select
                  className="form-select"
                  style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                  onChange={e => {
                    const foundAd = anuncios.find(a => a.id === e.target.value);
                    if (foundAd) {
                      setSelectedAdForManualContacts({
                        ...selectedAdForManualContacts,
                        id: foundAd.id,
                        codigo: foundAd.codigo,
                        residuo: foundAd.residuo,
                        id_cadastro: foundAd.id_cadastro
                      });
                      setManualValIndex(foundAd.valor_index ? foundAd.valor_index.toString() : (foundAd.valor_desejado ? foundAd.valor_desejado.toString() : ''));
                      setManualValReal(foundAd.valor_desejado ? foundAd.valor_desejado.toString() : '');
                      setManualSellerId(foundAd.id_cadastro || '');
                    } else {
                      setSelectedAdForManualContacts({
                        ...selectedAdForManualContacts,
                        id: '',
                        codigo: 'Novo Vínculo',
                        residuo: 'Inserção Manual',
                        id_cadastro: ''
                      });
                    }
                  }}
                >
                  <option value="">Nenhum (Vínculo avulso de contatos)</option>
                  {anuncios.map((a: any) => (
                    <option key={a.id} value={a.id}>[{a.codigo}] {a.residuo}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Selecionar Comprador *</label>
              <select
                className="form-select"
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                value={manualBuyerId}
                onChange={e => setManualBuyerId(e.target.value)}
                required
              >
                <option value="">Selecione o Comprador...</option>
                {allCadastros.filter((c: any) => c.tipo_parte === 'Comprador').map((c: any) => (
                  <option key={c.id} value={c.id}>{c.nome_ou_razao} ({c.email})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Selecionar Fornecedor (Vendedor) *</label>
              <select
                className="form-select"
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                value={manualSellerId}
                onChange={e => setManualSellerId(e.target.value)}
                required
              >
                <option value="">Selecione o Fornecedor...</option>
                {allCadastros.filter((c: any) => c.tipo_parte === 'Fornecedor').map((c: any) => (
                  <option key={c.id} value={c.id}>{c.nome_ou_razao} ({c.email})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Selecionar Transportadora (Opcional)</label>
              <select
                className="form-select"
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                value={manualTransporterId}
                onChange={e => setManualTransporterId(e.target.value)}
              >
                <option value="">Nenhuma</option>
                {allCadastros.filter((c: any) => c.tipo_parte === 'Transportadora').map((c: any) => (
                  <option key={c.id} value={c.id}>{c.nome_ou_razao} ({c.email})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Valor do Índice Materra Referência (R$)</label>
              <input type="number" className="form-input" style={{ background: '#000', color: '#fff', border: '1px solid #333' }} value={manualValIndex} onChange={e => setManualValIndex(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Valor Real Estimado (R$)</label>
              <input type="number" className="form-input" style={{ background: '#000', color: '#fff', border: '1px solid #333' }} value={manualValReal} onChange={e => setManualValReal(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Economia Alcançada (%)</label>
              <input type="number" className="form-input" style={{ background: '#000', color: '#fff', border: '1px solid #333' }} value={manualReward} onChange={e => setManualReward(e.target.value)} required />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, color: '#000', background: '#25D366', fontWeight: 'bold', border: 'none' }}>Confirmar & Liberar Contatos</button>
              <button type="button" onClick={() => setSelectedAdForManualContacts(null)} className="btn btn-secondary" style={{ background: '#1c1c1c', border: '1px solid #333' }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT REPRESENTED COMPANY FICHA MODAL */}
      {selectedFichaRep && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <form onSubmit={handleSaveFichaRep} style={{ background: '#121212', border: '1px solid #333', padding: '32px', borderRadius: '16px', width: '550px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
              Homologar Ficha da Empresa Representada
            </h3>
            
            <div>
              <span style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase' }}>Razão Social</span>
              <strong style={{ color: '#fff', fontSize: '1rem', display: 'block' }}>{selectedFichaRep.razao_social}</strong>
            </div>

            <div>
              <span style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase' }}>CNPJ</span>
              <strong style={{ color: '#fff', fontSize: '1.0rem', display: 'block' }}>{selectedFichaRep.cnpj || 'Não informado'}</strong>
            </div>

            <div>
              <span style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase' }}>Documento / Licença Ambiental</span>
              {selectedFichaRep.licenca_url ? (
                <div style={{ background: '#1c1503', border: '1px solid var(--primary-500)', padding: '14px', borderRadius: '8px', fontSize: '0.85rem', marginTop: '4px' }}>
                  <a href={selectedFichaRep.licenca_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ display: 'inline-block', width: 'auto', padding: '8px 16px', background: '#333', border: 'none', color: '#fff', textDecoration: 'underline' }}>
                    Visualizar Documento da Representada
                  </a>
                </div>
              ) : (
                <div style={{ background: '#222', padding: '10px', borderRadius: '8px', color: '#888', fontSize: '0.85rem', marginTop: '4px' }}>
                  Nenhum documento/licença foi anexado para esta empresa representada.
                </div>
              )}
            </div>

            <div>
              <span style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status de Documentação</span>
              <select
                className="form-select"
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                value={selectedFichaRep.status_documentos || 'Pendente'}
                onChange={e => setSelectedFichaRep({ ...selectedFichaRep, status_documentos: e.target.value })}
              >
                <option value="Pendente">Pendente</option>
                <option value="Aprovado">Aprovado</option>
                <option value="Reprovado">Reprovado</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#fff' }}>Score de Homologação (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-input"
                  style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                  value={selectedFichaRep.score_0a100 ?? 50}
                  onChange={e => setSelectedFichaRep({ ...selectedFichaRep, score_0a100: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#fff' }}>Selo da Empresa</label>
                <select
                  className="form-select"
                  style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                  value={selectedFichaRep.selo_metal || 'Bronze'}
                  onChange={e => setSelectedFichaRep({ ...selectedFichaRep, selo_metal: e.target.value })}
                >
                  <option value="Bronze">Bronze</option>
                  <option value="Prata">Prata</option>
                  <option value="Ouro">Ouro</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Observações Internas</label>
              <textarea
                className="form-input"
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                rows={3}
                value={selectedFichaRep.observacoes || ''}
                onChange={e => setSelectedFichaRep({ ...selectedFichaRep, observacoes: e.target.value })}
                placeholder="Indique as pendências ou validações desta empresa representada..."
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px', color: '#000', fontWeight: 'bold' }}>
                Salvar Homologação
              </button>
              <button type="button" onClick={() => setSelectedFichaRep(null)} className="btn btn-secondary" style={{ flex: 1, padding: '12px', background: '#333', border: 'none', color: '#fff' }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FRETE CARRIER RELEASE MODAL */}
      {selectedFrete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <form onSubmit={handleReleaseFrete} style={{ background: '#121212', border: '1px solid #333', padding: '32px', borderRadius: '16px', width: '500px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>Liberar Lead de Frete</h3>
            <p style={{ fontSize: '0.85rem', color: '#aaa' }}>
              Selecione a transportadora ganhadora do leilão e os valores finais acordados.
            </p>

            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Transportadora Ganhadora</label>
              <select 
                className="form-select" 
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                value={releaseFreteTransporterId}
                onChange={e => setReleaseFreteTransporterId(e.target.value)}
                required
              >
                <option value="">Selecione uma transportadora...</option>
                {transportadoras.map(t => (
                  <option key={t.id} value={t.id}>{t.nome_ou_razao} ({t.email})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Valor Final do Frete Acordado (R$)</label>
              <input type="number" className="form-input" style={{ background: '#000', color: '#fff', border: '1px solid #333' }} value={releaseFreteValEncontrado} onChange={e => setReleaseFreteValEncontrado(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Valor Pago pelo Lead do Frete (R$)</label>
              <input type="number" className="form-input" style={{ background: '#000', color: '#fff', border: '1px solid #333' }} value={releaseFreteLeadValor} onChange={e => setReleaseFreteLeadValor(e.target.value)} required />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, color: '#000', background: '#25D366', fontWeight: 'bold' }}>Confirmar & Liberar Transportador</button>
              <button type="button" onClick={() => setSelectedFrete(null)} className="btn btn-secondary" style={{ background: '#1c1c1c', border: '1px solid #333' }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}
