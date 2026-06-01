'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ESTADOS_BRASIL, ACONDICIONAMENTOS, WHATSAPP_NUM } from '@/lib/constants'
import { CATALOGO_MATERRA_ELO } from '@/lib/catalogo'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function VitrineAnunciosPage() {
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<'Oferta' | 'Demanda'>('Oferta')

  // Auth/profile context for "Mais próximo" sorting
  const [userProfile, setUserProfile] = useState<any>(null)

  // Raw listings from DB
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters state
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
  const [filterDocs, setFilterDocs] = useState('') // Indiferente, Com licença/MTR
  const [sortBy, setSortBy] = useState('Mais recente') // Mais recente, Maior quantidade, Menor preço, Mais próximo

  // Tab-specific filters
  const [filterImediato, setFilterImediato] = useState<string>('Todos') // Todos, Sim, Não
  const [filterUrgencia, setFilterUrgencia] = useState<string>('') // Imediato, 30 dias, 60 dias, Flexível

  // Selected Listing Detail Modal
  const [selectedListing, setSelectedListing] = useState<any>(null)

  // Fetch logged in user profile
  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data } = await supabase
          .from('cadastros')
          .select('uf, tipo_parte, nome_ou_razao')
          .eq('id', session.user.id)
          .single()
        if (data) {
          setUserProfile(data)
        }
      }
    }
    loadProfile()
  }, [])

  // Fetch listings from Supabase with relation to cadastros for the metal seal
  useEffect(() => {
    async function fetchListings() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('anuncios')
          .select(`
            *,
            cadastros (
              selo_metal,
              nivel_selo,
              selo_verificado,
              score_0a100,
              subtipo,
              tipo_parte
            )
          `)
          .eq('status', 'Anunciado')

        if (error) throw error
        setListings(data || [])
      } catch (err) {
        console.error('Erro ao buscar anúncios:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [])

  // Apply filters in-memory for immediate speed and feedback
  const filteredListings = listings
    .filter(item => {
      // 1. Tab check
      if (item.tipo_anuncio !== activeTab && item.tipo_anuncio !== `${activeTab} de resíduo`) {
        return false
      }

      // 2. Category
      if (filterCategory && item.categoria !== filterCategory) return false

      // 3. Specific waste
      if (filterResiduo && item.residuo !== filterResiduo) return false

      // 4. Class
      if (filterClasse && filterClasse !== 'Todas') {
        const itemClass = item.classe || ''
        if (filterClasse === 'I' && !itemClass.includes('I –') && itemClass !== 'I') return false
        if (filterClasse === 'IIA' && !itemClass.includes('IIA') && itemClass !== 'IIA') return false
        if (filterClasse === 'IIB' && !itemClass.includes('IIB') && itemClass !== 'IIB') return false
      }

      // 5. Estado físico
      if (filterEstadoFisico && item.estado_fisico !== filterEstadoFisico) return false

      // 6. Acondicionamento
      if (filterAcondicionamento && item.acondicionamento !== filterAcondicionamento) return false

      // 7. Location (UF & Cidade)
      if (filterUf && item.uf !== filterUf) return false
      if (filterMunicipio && !item.municipio?.toLowerCase().includes(filterMunicipio.toLowerCase())) return false

      // 8. Quantidade
      if (filterQtyMin && item.quantidade < parseFloat(filterQtyMin)) return false
      if (filterQtyMax && item.quantidade > parseFloat(filterQtyMax)) return false
      if (filterQtyUnit && item.unidade !== filterQtyUnit) return false

      // 9. Frequência
      if (filterFrequencia && item.frequencia !== filterFrequencia) return false

      // 10. Price
      if (filterPriceMin && item.valor_desejado < parseFloat(filterPriceMin)) return false
      if (filterPriceMax && item.valor_desejado > parseFloat(filterPriceMax)) return false

      // 11. Selo
      if (filterSelo) {
        const itemSelo = item.cadastros?.selo_metal || item.cadastros?.nivel_selo || 'Sem'
        if (itemSelo !== filterSelo) return false
      }

      // 12. Document check
      if (filterDocs === 'Com licença/MTR' && !item.tem_licenca) return false

      // Tab specific rules
      if (activeTab === 'Oferta') {
        if (filterImediato === 'Sim' && !item.disponibilidade_imediata) return false
        if (filterImediato === 'Não' && item.disponibilidade_imediata) return false
      } else {
        if (filterUrgencia && item.urgencia_prazo !== filterUrgencia) return false
      }

      return true
    })
    .sort((a, b) => {
      if (sortBy === 'Mais recente') {
        return new Date(b.data_publicacao).getTime() - new Date(a.data_publicacao).getTime()
      }
      if (sortBy === 'Maior quantidade') {
        return b.quantidade - a.quantidade
      }
      if (sortBy === 'Menor preço') {
        return a.valor_desejado - b.valor_desejado
      }
      if (sortBy === 'Mais próximo') {
        // Match user state first
        const userUf = userProfile?.uf || ''
        const aMatch = a.uf === userUf ? 1 : 0
        const bMatch = b.uf === userUf ? 1 : 0
        return bMatch - aMatch
      }
      return 0
    })

  const getAdvertiserRoleLabel = (item: any) => {
    if (!item) return ''
    const tipo = item.cadastros?.tipo_parte || (item.tipo_anuncio?.toLowerCase().includes('compra') || item.tipo_anuncio?.toLowerCase().includes('demanda') ? 'Comprador' : 'Fornecedor')
    const sub = item.cadastros?.subtipo || 'Empresa'
    
    if (sub === 'Corretor' || sub === 'Corretor/Controlador') {
      return 'Corretor / Controlador'
    }
    return `Empresa ${tipo === 'Fornecedor' ? 'Fornecedora' : tipo === 'Comprador' ? 'Compradora' : tipo}`
  }

  const hasUploadedDocs = (p: any): boolean => {
    if (!p || !p.documentos_recebidos) return false
    try {
      const parsed = JSON.parse(p.documentos_recebidos)
      return Object.keys(parsed).length > 0
    } catch (e) {
      return false
    }
  }

  const getReputationDisplay = (p: any) => {
    if (!p) return '0/0'
    const docsExist = hasUploadedDocs(p)

    if (p.tipo_parte === 'Transportadora') {
      if (p.status_documentos !== 'Verificado' || (!p.area_atuacao && !p.area_operacao)) {
        return '0/0 (Inoperante)'
      }
      return `${p.score_0a100 || 50}/100 (Operante)`
    }

    if (!docsExist) {
      return '0/0'
    }
    return `${p.score_0a100 || 50}/100`
  }

  const handleInterest = async (listing: any) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      alert('Você precisa estar logado para demonstrar interesse.')
      router.push('/auth/login')
      return
    }

    try {
      // Create proposal row in DB
      const { error } = await supabase
        .from('propostas')
        .insert([{
          id_anuncio: listing.id,
          id_proponente: session.user.id,
          papel_proponente: userProfile?.tipo_parte === 'Comprador' ? 'Comprador' : 'Fornecedor',
          valor_proposto: listing.valor_desejado,
          status: 'Enviada',
          observacoes: 'Interesse manifestado via botão de WhatsApp da vitrine.'
        }])

      if (error) throw error

      // Open WhatsApp
      const text = `Olá, sou ${userProfile?.nome_ou_razao || session.user.email} e vi o anúncio com código *[${listing.codigo}]* na plataforma Materra Elo. Gostaria de negociar!`
      const url = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(text)}`
      window.open(url, '_blank')
    } catch (err: any) {
      console.error('Erro ao registrar proposta:', err)
      alert('Registrando interesse e abrindo WhatsApp...')
      // Open WhatsApp anyway
      const text = `Olá, vi o anúncio com código *[${listing.codigo}]* na plataforma Materra Elo e tenho interesse. Gostaria de mais informações!`
      const url = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(text)}`
      window.open(url, '_blank')
    }
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
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link href="/" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#43a047' }}>
            MATERRA ELO
          </Link>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="/anuncios/publicar" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Publicar Anúncio
            </Link>
            <Link href="/" className="btn-link" style={{ fontSize: '0.9rem', alignSelf: 'center' }}>
              Voltar
            </Link>
          </div>
        </div>
      </nav>

      {/* TABS */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          gap: '24px'
        }}>
          <button
            onClick={() => { setActiveTab('Oferta'); setSelectedListing(null); }}
            style={{
              padding: '16px 24px',
              border: 'none',
              background: 'none',
              color: activeTab === 'Oferta' ? 'var(--primary-400)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'Oferta' ? '3px solid var(--primary-500)' : '3px solid transparent',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Ofertas (Quem Vende)
          </button>
          <button
            onClick={() => { setActiveTab('Demanda'); setSelectedListing(null); }}
            style={{
              padding: '16px 24px',
              border: 'none',
              background: 'none',
              color: activeTab === 'Demanda' ? 'var(--accent-400)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'Demanda' ? '3px solid var(--accent-500)' : '3px solid transparent',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '1rem'
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
        width: '100%'
      }}>
        {/* FILTERS PANEL */}
        <aside style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '20px',
          height: 'fit-content'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Filtros Avançados</span>
            <button onClick={() => {
              setFilterCategory(''); setFilterResiduo(''); setFilterClasse('');
              setFilterEstadoFisico(''); setFilterAcondicionamento(''); setFilterUf('');
              setFilterMunicipio(''); setFilterQtyMin(''); setFilterQtyMax('');
              setFilterFrequencia(''); setFilterPriceMin(''); setFilterPriceMax('');
              setFilterSelo(''); setFilterDocs(''); setFilterImediato('Todos');
              setFilterUrgencia('');
            }} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>
              Limpar
            </button>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Category & Specific */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Categoria</label>
              <select className="form-select" style={{ padding: '8px' }} value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setFilterResiduo(''); }}>
                <option value="">Todas</option>
                {Object.keys(CATALOGO_MATERRA_ELO).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {filterCategory && (
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Resíduo específico</label>
                <select className="form-select" style={{ padding: '8px' }} value={filterResiduo} onChange={e => setFilterResiduo(e.target.value)}>
                  <option value="">Todos</option>
                  {(CATALOGO_MATERRA_ELO[filterCategory]?.subcategorias || []).map(res => (
                    <option key={res} value={res}>{res}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Classe */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Classe do Resíduo</label>
              <select className="form-select" style={{ padding: '8px' }} value={filterClasse} onChange={e => setFilterClasse(e.target.value)}>
                <option value="Todas">Todas</option>
                <option value="I">Classe I (Perigoso)</option>
                <option value="IIA">Classe IIA (Não Inerte)</option>
                <option value="IIB">Classe IIB (Inerte)</option>
              </select>
            </div>

            {/* Estado Físico */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Estado Físico</label>
              <select className="form-select" style={{ padding: '8px' }} value={filterEstadoFisico} onChange={e => setFilterEstadoFisico(e.target.value)}>
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
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Acondicionamento</label>
              <select className="form-select" style={{ padding: '8px' }} value={filterAcondicionamento} onChange={e => setFilterAcondicionamento(e.target.value)}>
                <option value="">Todos</option>
                {ACONDICIONAMENTOS.map(cond => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>

            {/* Localização (UF & Cidade) */}
            <div className="form-row" style={{ gap: '8px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Estado (UF)</label>
                <select className="form-select" style={{ padding: '8px' }} value={filterUf} onChange={e => setFilterUf(e.target.value)}>
                  <option value="">Todos</option>
                  {ESTADOS_BRASIL.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Cidade</label>
                <input
                  type="text"
                  placeholder="Ex: Goiânia"
                  className="form-input"
                  style={{ padding: '8px' }}
                  value={filterMunicipio}
                  onChange={e => setFilterMunicipio(e.target.value)}
                />
              </div>
            </div>

            {/* Quantidade Mín-Máx */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Quantidade Faixa</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="number" placeholder="Mín" className="form-input" style={{ padding: '8px' }} value={filterQtyMin} onChange={e => setFilterQtyMin(e.target.value)} />
                <input type="number" placeholder="Máx" className="form-input" style={{ padding: '8px' }} value={filterQtyMax} onChange={e => setFilterQtyMax(e.target.value)} />
              </div>
              <select className="form-select" style={{ padding: '6px', marginTop: '6px' }} value={filterQtyUnit} onChange={e => setFilterQtyUnit(e.target.value)}>
                <option value="t">t</option>
                <option value="kg">kg</option>
                <option value="L">L</option>
                <option value="m³">m³</option>
                <option value="unidade">unidade</option>
              </select>
            </div>

            {/* Frequência */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Frequência</label>
              <select className="form-select" style={{ padding: '8px' }} value={filterFrequencia} onChange={e => setFilterFrequencia(e.target.value)}>
                <option value="">Todas</option>
                <option value="Única">Única</option>
                <option value="Semanal">Semanal</option>
                <option value="Mensal">Mensal</option>
                <option value="Recorrente">Recorrente</option>
              </select>
            </div>

            {/* Preço faixa */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Faixa de Preço (R$)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="number" placeholder="Mín" className="form-input" style={{ padding: '8px' }} value={filterPriceMin} onChange={e => setFilterPriceMin(e.target.value)} />
                <input type="number" placeholder="Máx" className="form-input" style={{ padding: '8px' }} value={filterPriceMax} onChange={e => setFilterPriceMax(e.target.value)} />
              </div>
            </div>

            {/* Nível do Selo do Anunciante */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Selo do Anunciante</label>
              <select className="form-select" style={{ padding: '8px' }} value={filterSelo} onChange={e => setFilterSelo(e.target.value)}>
                <option value="">Todos</option>
                <option value="Ouro">Ouro</option>
                <option value="Prata">Prata</option>
                <option value="Bronze">Bronze</option>
                <option value="Sem">Sem Selo</option>
              </select>
            </div>

            {/* Com documentos / MTR */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Documentação do Resíduo</label>
              <select className="form-select" style={{ padding: '8px' }} value={filterDocs} onChange={e => setFilterDocs(e.target.value)}>
                <option value="">Indiferente</option>
                <option value="Com licença/MTR">Possui Licença/CADRI/MTR</option>
              </select>
            </div>

            {/* Tab specific filter fields */}
            {activeTab === 'Oferta' ? (
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Disponibilidade Imediata</label>
                <select className="form-select" style={{ padding: '8px' }} value={filterImediato} onChange={e => setFilterImediato(e.target.value)}>
                  <option value="Todos">Todos</option>
                  <option value="Sim">Apenas Disponibilidade Imediata</option>
                  <option value="Não">Sem Disponibilidade Imediata</option>
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Urgência / Prazo</label>
                <select className="form-select" style={{ padding: '8px' }} value={filterUrgencia} onChange={e => setFilterUrgencia(e.target.value)}>
                  <option value="">Todas</option>
                  <option value="Imediato">Imediato</option>
                  <option value="30 dias">30 dias</option>
                  <option value="60 dias">60 dias</option>
                  <option value="Flexível">Flexível</option>
                </select>
              </div>
            )}
          </div>
        </aside>

        {/* LISTINGS DISPLAY & ORDERING */}
        <section>
          {/* Top bar (Results count & Sorting) */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Encontrados <strong style={{ color: 'var(--text-primary)' }}>{filteredListings.length}</strong> anúncios
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ordenar por:</label>
              <select className="form-select" style={{ padding: '6px 12px', width: '180px' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="Mais recente">Mais recente</option>
                <option value="Maior quantidade">Maior quantidade</option>
                <option value="Menor preço">Menor preço</option>
                <option value="Mais próximo">Mais próximo (UF)</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)' }}>Buscando anúncios...</p>
          ) : filteredListings.length === 0 ? (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              padding: '60px 20px',
              textAlign: 'center',
              borderRadius: '12px'
            }}>
              <span style={{ fontSize: '3rem' }}>🔍</span>
              <h3 style={{ marginTop: '16px' }}>Nenhum anúncio correspondente</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Experimente alterar os filtros avançados da barra lateral.</p>
            </div>
          ) : (
            /* Cards Grid */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {filteredListings.map(item => {
                const advertiserSeal = item.cadastros?.selo_metal || item.cadastros?.nivel_selo || 'Sem'
                const sealEmoji = ''

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedListing(item)}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'transform 150ms ease, border-color 150ms ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '16px'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.borderColor = 'var(--primary-500)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none'
                      e.currentTarget.style.borderColor = 'var(--border-color)'
                    }}
                  >
                    <div>
                      {/* Badge line */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            width: 'fit-content',
                            background: item.tipo_anuncio?.includes('Oferta') ? 'rgba(67,160,71,0.1)' : 'rgba(0,188,212,0.1)',
                            color: item.tipo_anuncio?.includes('Oferta') ? 'var(--primary-400)' : 'var(--accent-400)'
                          }}>
                            {item.tipo_anuncio?.includes('Oferta') ? 'OFERTA' : 'DEMANDA'}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#ffb300', fontWeight: 'bold' }}>
                            CONFIDENCIAL • {getAdvertiserRoleLabel(item)}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Selo: {sealEmoji} {advertiserSeal}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {item.residuo}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        Categoria: {item.categoria} • Classe: {item.classe?.replace('Classe ', '')}
                      </p>

                      {/* Detail Metrics */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                        <span style={{ background: 'var(--bg-body)', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                          📦 {item.quantidade} {item.unidade} ({item.frequencia?.toLowerCase()})
                        </span>
                        <span style={{ background: 'var(--bg-body)', border: '1px solid var(--border-color)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                          📍 {item.uf}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Index Line */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: '12px',
                      marginTop: 'auto'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                          Valor Desejado
                        </span>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                          {item.valor_desejado ? `R$ ${item.valor_desejado.toLocaleString('pt-BR')}` : 'Preço a combinar'}
                        </strong>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                          Índice Materra
                        </span>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--accent-400)' }}>
                          {item.valor_index ? `R$ ${item.valor_index.toLocaleString('pt-BR')}` : 'Sob Consulta'}
                        </strong>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* DETAIL MODAL (Anonymized) */}
      {selectedListing && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '650px',
            padding: '32px',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedListing(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              &times;
            </button>

            {/* Modal Header */}
            <div>
              <span style={{
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: selectedListing.tipo_anuncio?.includes('Oferta') ? 'rgba(67,160,71,0.1)' : 'rgba(0,188,212,0.1)',
                color: selectedListing.tipo_anuncio?.includes('Oferta') ? 'var(--primary-400)' : 'var(--accent-400)'
              }}>
                {selectedListing.tipo_anuncio?.includes('Oferta') ? 'OFERTA' : 'DEMANDA'}
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '12px', color: 'var(--text-primary)' }}>
                {selectedListing.residuo}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                Código do Anúncio: <strong style={{ color: 'var(--accent-400)' }}>{selectedListing.codigo}</strong>
              </p>

              {/* FICHA MATERRA SCORE CARD */}
              <div style={{
                background: '#161616',
                border: '1px solid var(--primary-500)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    Ficha Materra de Compliance
                  </span>
                  <span style={{
                    background: 'rgba(255, 215, 0, 0.15)',
                    border: '1px solid var(--primary-500)',
                    borderRadius: '20px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    color: 'var(--primary-500)'
                  }}>
                    {selectedListing.cadastros?.selo_verificado || selectedListing.cadastros?.nivel_selo ? `SELO ${selectedListing.cadastros?.nivel_selo || 'Bronze'}` : 'Pendente de Documentação'}
                  </span>
                </div>

                {/* Main stats */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', border: '1px solid #333', borderRadius: '50%', width: '60px', height: '60px', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary-500)' }}>
                      {getReputationDisplay(selectedListing.cadastros)}
                    </span>
                    <span style={{ fontSize: '0.55rem', color: '#777', textTransform: 'uppercase' }}>Score</span>
                  </div>
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '0.95rem', margin: 0, fontWeight: 700 }}>
                      CONFIDENCIAL
                    </h4>
                    <p style={{ color: '#aaa', fontSize: '0.75rem', margin: '4px 0 0' }}>
                      Anunciante: <strong style={{ color: 'var(--primary-500)' }}>{getAdvertiserRoleLabel(selectedListing)}</strong>
                    </p>
                  </div>
                </div>
                
                {/* If published by a Corretor, show DUAS FICHAS (Corretor + Empresa Representada) */}
                {(selectedListing.cadastros?.subtipo === 'Corretor' || selectedListing.cadastros?.subtipo === 'Corretor/Controlador') && (
                  <div style={{ borderTop: '1px dashed #333', paddingTop: '10px', marginTop: '4px' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--primary-500)', fontWeight: 'bold', margin: '0 0 6px' }}>
                      ⚠️ Este anúncio é intermediado por um Corretor/Controlador
                    </p>
                    <div style={{ display: 'flex', gap: '12px', background: '#0d0d0d', padding: '10px', borderRadius: '8px' }}>
                      <div style={{ flex: 1, borderRight: '1px solid #222', paddingRight: '8px' }}>
                        <span style={{ fontSize: '0.65rem', color: '#777', display: 'block', textTransform: 'uppercase' }}>Ficha do Corretor</span>
                        <strong style={{ fontSize: '0.8rem', color: '#fff' }}>Selo {selectedListing.cadastros?.nivel_selo || 'Bronze'}</strong>
                        <span style={{ fontSize: '0.7rem', color: '#aaa', display: 'block' }}>Score: {selectedListing.cadastros?.score_0a100 ?? 85}/100</span>
                      </div>
                      <div style={{ flex: 1, paddingLeft: '8px' }}>
                        <span style={{ fontSize: '0.65rem', color: '#777', display: 'block', textTransform: 'uppercase' }}>Empresa Anunciada</span>
                        <strong style={{ fontSize: '0.8rem', color: '#ffb300' }}>Empresa em verificação</strong>
                        <span style={{ fontSize: '0.7rem', color: '#aaa', display: 'block' }}>Os documentos da empresa real serão confirmados após o lead.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />

            {/* Specs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Categoria</span>
                <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{selectedListing.categoria}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Classe</span>
                <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{selectedListing.classe}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Quantidade</span>
                <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{selectedListing.quantidade} {selectedListing.unidade} ({selectedListing.frequencia?.toLowerCase()})</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Estado Físico</span>
                <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{selectedListing.estado_fisico}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Acondicionamento</span>
                <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{selectedListing.acondicionamento}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Localização</span>
                <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{selectedListing.municipio} - {selectedListing.uf}</p>
              </div>
              {selectedListing.tipo_anuncio?.includes('Oferta') ? (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Disponibilidade Imediata</span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{selectedListing.disponibilidade_imediata ? 'Sim' : 'Não'}</p>
                </div>
              ) : (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Urgência / Prazo</span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{selectedListing.urgencia_prazo}</p>
                </div>
              )}
              {selectedListing.codigo_ibama && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Código IBAMA</span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{selectedListing.codigo_ibama}</p>
                </div>
              )}
            </div>

            {/* Process & Details */}
            {selectedListing.origem_processo && (
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Origem / Processo Gerador</span>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'var(--bg-body)', padding: '12px', borderRadius: '8px', marginTop: '4px' }}>
                  {selectedListing.origem_processo}
                </p>
              </div>
            )}

            {selectedListing.caracteristicas && (
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Características / Qualidade</span>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'var(--bg-body)', padding: '12px', borderRadius: '8px', marginTop: '4px' }}>
                  {selectedListing.caracteristicas}
                </p>
              </div>
            )}

            {selectedListing.tratamento_destinacao && (
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tratamento/Destinação Desejada</span>
                <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedListing.tratamento_destinacao}</p>
              </div>
            )}

            {/* Media Rendering */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {selectedListing.foto_url && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Foto do Resíduo</span>
                  <img src={selectedListing.foto_url} alt="Resíduo" style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                </div>
              )}
              {selectedListing.video_url && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Vídeo do Resíduo</span>
                  <video src={selectedListing.video_url} controls style={{ width: '150px', height: '100px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                </div>
              )}
            </div>

            {/* Documents active */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <span style={{ fontSize: '1.2rem' }}>{selectedListing.tem_licenca ? '✅' : '❌'}</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {selectedListing.tem_licenca ? 'Documento legal (Licença/MTR) verificado e anexado.' : 'Sem licença anexada a esta publicação.'}
              </span>
            </div>

            {/* Call to Action */}
            <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <button
                onClick={() => handleInterest(selectedListing)}
                className="btn btn-primary"
                style={{ flex: 1, padding: '14px', fontSize: '1rem', background: '#25D366', boxShadow: '0 4px 12px rgba(37,211,102,0.2)' }}
              >
                💬 Tenho Interesse (Falar com Lucas / Concierge)
              </button>
              <button
                onClick={() => setSelectedListing(null)}
                className="btn btn-secondary"
                style={{ padding: '14px 20px' }}
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
