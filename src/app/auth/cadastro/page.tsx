'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function CadastroPage() {
  const router = useRouter()
  const supabase = createClient()

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nomeOuRazao, setNomeOuRazao] = useState('')
  const [cpfOuCnpj, setCpfOuCnpj] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [cep, setCep] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cidade, setCidade] = useState('')
  const [uf, setUf] = useState('')
  const [tipoParte, setTipoParte] = useState('Fornecedor') // Fornecedor, Comprador, Transportadora
  const [subtipo, setSubtipo] = useState('Empresa')

  // Transportadora fields
  const [licencaNum, setLicencaNum] = useState('')
  const [licencaOrgao, setLicencaOrgao] = useState('')
  const [licencaValidade, setLicencaValidade] = useState('')
  const [licencaFile, setLicencaFile] = useState<File | null>(null)
  
  const [rntrcNum, setRntrcNum] = useState('')
  const [rntrcValidade, setRntrcValidade] = useState('')
  const [rntrcFile, setRntrcFile] = useState<File | null>(null)

  // UX states
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Determine role based on URL parameter on mount to avoid SSR mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const roleParam = params.get('role')
      if (roleParam === 'transportadora') {
        setTipoParte('Transportadora')
        setSubtipo('Transportadora contratada')
      } else {
        setTipoParte('Fornecedor')
        setSubtipo('Empresa')
      }
    }
  }, [])

  // Lock: block new registrations until after Tuesday 2026-06-03 00:00 BRT
  const UNLOCK_DATE = new Date('2026-06-03T03:00:00Z')
  const isLocked = new Date() < UNLOCK_DATE

  if (isLocked) {
    return (
      <div className="main-layout" style={{ justifyContent: 'center', alignItems: 'center', background: '#000', flexDirection: 'column', gap: '20px', padding: '40px', minHeight: '100vh' }}>
        <div style={{ background: '#0f0f0f', border: '1px solid #222', borderRadius: '16px', padding: '48px 40px', maxWidth: '460px', width: '100%', textAlign: 'center' }}>
          <img src="/logo.png" alt="Materra Elo" style={{ height: '52px', objectFit: 'contain', marginBottom: '20px' }} />
          <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900, marginBottom: '12px' }}>Plataforma em fase de abertura</h1>
          <div style={{ background: 'rgba(255,215,0,0.07)', border: '1px solid var(--primary-500)', borderRadius: '10px', padding: '18px', marginBottom: '20px' }}>
            <p style={{ color: 'var(--primary-500)', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
              Novos cadastros disponíveis a partir de terça-feira.
            </p>
          </div>
          <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
            A Materra Elo está nos preparativos finais para o lançamento. Volte na terça-feira para criar sua conta e acessar o marketplace de resíduos industriais.
          </p>
          <Link href="/" style={{ display: 'inline-block', marginTop: '24px', color: 'var(--primary-500)', fontSize: '0.9rem', textDecoration: 'none' }}>
            Voltar para a Landing Page
          </Link>
        </div>
      </div>
    )
  }

  // Simple CEP fetch helper
  const handleCepBlur = async () => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const data = await res.json()
        if (!data.erro) {
          setEndereco(data.logradouro || '')
          setCidade(data.localidade || '')
          setUf(data.uf || '')
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err)
      }
    }
  }

  // Upload file helper
  const uploadDocument = async (file: File, folder: string, userId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${folder}_${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('documentos')
      .upload(fileName, file, { cacheControl: '3600', upsert: true })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('documentos')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      // 1. Validation for Transportadora
      if (tipoParte === 'Transportadora') {
        if (!licencaNum || !licencaOrgao || !licencaValidade || !licencaFile) {
          throw new Error('Você está se cadastrando como transportadora. Todos os campos da Licença Ambiental de Transporte são obrigatórios e você deve carregar o documento.')
        }
        if (!rntrcNum || !rntrcValidade || !rntrcFile) {
          throw new Error('Você está se cadastrando como transportadora. Todos os campos do RNTRC (ANTT) são obrigatórios e você deve carregar o documento.')
        }
      }

      // 2. SignUp user in Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) throw signUpError
      if (!authData.user) throw new Error('Não foi possível criar a conta. Tente outro e-mail.')

      const userId = authData.user.id
      let licencaUrl = ''
      let rntrcUrl = ''

      // 3. Upload documents if Transportadora
      if (tipoParte === 'Transportadora') {
        try {
          licencaUrl = await uploadDocument(licencaFile!, 'licenca_ambiental', userId)
          rntrcUrl = await uploadDocument(rntrcFile!, 'rntrc', userId)
        } catch (uploadErr: any) {
          console.error(uploadErr)
          throw new Error(`Erro ao carregar documentos: ${uploadErr.message || 'Verifique sua conexão e o storage.'}`)
        }
      }

      // 4. Create record in cadastros table
      const { error: dbError } = await supabase
        .from('cadastros')
        .insert([{
          id: userId,
          tipo_parte: tipoParte,
          subtipo: tipoParte === 'Transportadora' ? subtipo : (subtipo === 'Corretor' ? 'Corretor' : 'Empresa'),
          nome_ou_razao: nomeOuRazao,
          cpf_ou_cnpj: cpfOuCnpj,
          email,
          whatsapp,
          cep,
          endereco,
          cidade,
          uf,
          status_documentos: tipoParte === 'Transportadora' ? 'Em análise' : 'Pendente',
          recebe_convite_leilao_reverso: tipoParte === 'Transportadora',
          plano: 'Free',
          plano_ativo: false,
          licenca_ambiental_num: tipoParte === 'Transportadora' ? licencaNum : null,
          licenca_ambiental_orgao: tipoParte === 'Transportadora' ? licencaOrgao : null,
          licenca_ambiental_validade: tipoParte === 'Transportadora' ? licencaValidade : null,
          licenca_ambiental_url: licencaUrl || null,
          rntrc_num: tipoParte === 'Transportadora' ? rntrcNum : null,
          rntrc_validade: tipoParte === 'Transportadora' ? rntrcValidade : null,
          rntrc_url: rntrcUrl || null,
        }])

      if (dbError) throw dbError

      setSuccessMsg('Cadastro realizado com sucesso! Favor verificar o e-mail ou prossiga na plataforma.')
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 2000)

    } catch (err: any) {
      setErrorMsg(err.message || 'Ocorreu um erro ao processar o cadastro.')
    } finally {
      setLoading(false)
    }
  }

  const isTransportadora = tipoParte === 'Transportadora'

  return (
    <div className="main-layout" style={{ justifyContent: 'center', alignItems: 'center', background: '#000', padding: '40px 20px' }}>
      <div className="form-container" style={{ background: '#121212', border: '1px solid #333', borderRadius: '16px', maxWidth: '600px', width: '100%', padding: '32px' }}>
        
        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src="/logo.png" alt="Materra Elo" style={{ height: '50px', objectFit: 'contain' }} />
          <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, marginTop: '12px' }}>
            {isTransportadora ? 'Cadastro de Transportadora' : 'Cadastro de Fornecedor / Comprador'}
          </h2>
          <p style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '4px' }}>
            {isTransportadora ? 'Cadastre sua frota e licenças para receber lances de frete' : 'Comercialização inteligente de resíduos industriais'}
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 83, 80, 0.1)', border: '1px solid #ef5350', color: '#ef5350', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid var(--primary-500)', color: 'var(--primary-500)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Identificação */}
          <div className="form-group">
            <label className="form-label" style={{ color: '#fff' }}>Razão Social / Nome Fantasia</label>
            <input
              type="text"
              className="form-input"
              style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
              value={nomeOuRazao}
              onChange={e => setNomeOuRazao(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>CNPJ ou CPF</label>
              <input
                type="text"
                className="form-input"
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                value={cpfOuCnpj}
                onChange={e => setCpfOuCnpj(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>WhatsApp (DDI + DDD + Num)</label>
              <input
                type="tel"
                placeholder="Ex: 5562999999999"
                className="form-input"
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Endereço */}
          <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>CEP</label>
              <input
                type="text"
                className="form-input"
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                value={cep}
                onChange={e => setCep(e.target.value)}
                onBlur={handleCepBlur}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Endereço Completo</label>
              <input
                type="text"
                className="form-input"
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                value={endereco}
                onChange={e => setEndereco(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Cidade</label>
              <input
                type="text"
                className="form-input"
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                value={cidade}
                onChange={e => setCidade(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>UF</label>
              <input
                type="text"
                className="form-input"
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                value={uf}
                onChange={e => setUf(e.target.value.toUpperCase())}
                maxLength={2}
                required
              />
            </div>
          </div>

          {/* Autenticação */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>E-mail corporativo</label>
              <input
                type="email"
                className="form-input"
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Senha</label>
              <input
                type="password"
                className="form-input"
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Papel do usuário */}
          <div style={{ background: '#1a1a1a', padding: '16px', borderRadius: '8px', border: '1px solid #2a2a2a' }}>
            <label className="form-label" style={{ color: 'var(--primary-500)', fontWeight: 'bold' }}>Opção Inicial de Atuação:</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
              <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="tipoParte"
                  value="Fornecedor"
                  checked={tipoParte === 'Fornecedor'}
                  onChange={() => { setTipoParte('Fornecedor'); setSubtipo('Empresa'); }}
                />
                Fornecedor
              </label>
              <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="tipoParte"
                  value="Comprador"
                  checked={tipoParte === 'Comprador'}
                  onChange={() => { setTipoParte('Comprador'); setSubtipo('Empresa'); }}
                />
                Comprador
              </label>
              <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="tipoParte"
                  value="Transportadora"
                  checked={tipoParte === 'Transportadora'}
                  onChange={() => { setTipoParte('Transportadora'); setSubtipo('Transportadora contratada'); }}
                />
                Transportadora Exclusiva
              </label>
            </div>
            <p style={{ color: '#888', fontSize: '0.75rem', marginTop: '10px', lineHeight: '1.4' }}>
              Caso você realize ambas as operações (Fornecedor e Comprador), você poderá posteriormente anexar licenças para homologar ambas as pontas em sua Ficha Materra.
            </p>
          </div>

          {/* Subtipo de atuação */}
          {(tipoParte === 'Fornecedor' || tipoParte === 'Comprador') && (
            <div style={{ background: '#1a1a1a', padding: '16px', borderRadius: '8px', border: '1px solid #2a2a2a', marginTop: '16px' }}>
              <label className="form-label" style={{ color: 'var(--primary-500)', fontWeight: 'bold' }}>Subtipo de Atuação:</label>
              <select
                className="form-select"
                style={{ background: '#000', color: '#fff', border: '1px solid #333', width: '100%', marginTop: '8px', padding: '10px' }}
                value={subtipo === 'Corretor' ? 'Corretor' : 'Empresa'}
                onChange={e => setSubtipo(e.target.value)}
              >
                <option value="Empresa">Empresa ({tipoParte === 'Fornecedor' ? 'Fornecedora' : 'Compradora'})</option>
                <option value="Corretor">Corretor / Controlador (Faz anúncios de demanda e oferta em nome de terceiros)</option>
              </select>
            </div>
          )}

          {/* Campos Específicos de Transportadora */}
          {isTransportadora && (
            <div style={{ background: '#1c1503', border: '1px solid var(--primary-500)', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ color: 'var(--primary-500)', fontSize: '0.95rem', fontWeight: 'bold' }}>
                🚛 Licenças Obrigatórias de Transporte
              </h3>
              <p style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '-8px' }}>
                Para habilitar sua transportadora e receber lances, o envio e preenchimento das licenças abaixo são obrigatórios.
              </p>

              {/* Licença Ambiental */}
              <div style={{ borderTop: '1px solid #3a2d0a', paddingTop: '12px' }}>
                <label className="form-label" style={{ color: '#fff', fontWeight: 'bold' }}>1. Licença Ambiental (Estadual / Federal)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                  <input
                    type="text"
                    placeholder="Nº da Licença"
                    className="form-input"
                    style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                    value={licencaNum}
                    onChange={e => setLicencaNum(e.target.value)}
                    required={isTransportadora}
                  />
                  <input
                    type="text"
                    placeholder="Órgão (ex: SEMAD)"
                    className="form-input"
                    style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                    value={licencaOrgao}
                    onChange={e => setLicencaOrgao(e.target.value)}
                    required={isTransportadora}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px', alignItems: 'center' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#aaa' }}>Validade:</label>
                    <input
                      type="date"
                      className="form-input"
                      style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                      value={licencaValidade}
                      onChange={e => setLicencaValidade(e.target.value)}
                      required={isTransportadora}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#aaa' }}>Arquivo da Licença:</label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setLicencaFile(e.target.files[0])
                        }
                      }}
                      required={isTransportadora}
                    />
                  </div>
                </div>
              </div>

              {/* RNTRC ANTT */}
              <div style={{ borderTop: '1px solid #3a2d0a', paddingTop: '12px' }}>
                <label className="form-label" style={{ color: '#fff', fontWeight: 'bold' }}>2. Registro RNTRC (ANTT)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                  <input
                    type="text"
                    placeholder="Nº ANTT"
                    className="form-input"
                    style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                    value={rntrcNum}
                    onChange={e => setRntrcNum(e.target.value)}
                    required={isTransportadora}
                  />
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#aaa' }}>Validade:</label>
                    <input
                      type="date"
                      className="form-input"
                      style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                      value={rntrcValidade}
                      onChange={e => setRntrcValidade(e.target.value)}
                      required={isTransportadora}
                    />
                  </div>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <label style={{ fontSize: '0.7rem', color: '#aaa', display: 'block', marginBottom: '4px' }}>Arquivo do Certificado RNTRC:</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        setRntrcFile(e.target.files[0])
                      }
                    }}
                    required={isTransportadora}
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', color: '#000', fontWeight: 'bold', background: 'var(--primary-500)', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Processando cadastro...' : 'Concluir Cadastro'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem', marginTop: '20px' }}>
          Já tem conta? <Link href="/auth/login" style={{ color: 'var(--primary-500)', textDecoration: 'underline' }}>Fazer Login</Link>
        </p>
      </div>
    </div>
  )
}
