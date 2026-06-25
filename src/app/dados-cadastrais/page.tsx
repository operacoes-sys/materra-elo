'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, CheckCircle } from 'lucide-react';

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
);

const LogoBrand = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
    <img src="/logo.png" alt="Logo" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
    <span style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.03em' }}>
      <span style={{ fontSize: '1.9rem', color: 'var(--primary-500)' }}>MA</span>
      <span style={{ color: 'var(--primary-500)' }}>terra</span>{' '}
      <span style={{ color: '#fff', fontWeight: 300, fontSize: '1.1rem' }}>elo</span>
    </span>
  </span>
);

export default function DadosCadastraisPage() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sixLinesMenuOpen, setSixLinesMenuOpen] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (sixLinesMenuOpen && !target.closest('#six-lines-dropdown-container')) {
        setSixLinesMenuOpen(false);
      }
    }
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [sixLinesMenuOpen]);

  // Form states
  const [nomeOuRazao, setNomeOuRazao] = useState('');
  const [cpfOuCnpj, setCpfOuCnpj] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telefone, setTelefone] = useState('');
  const [chavePix, setChavePix] = useState('');
  const [titularidadePix, setTitularidadePix] = useState('');
  const [pixTitularNome, setPixTitularNome] = useState('');
  const [pixTitularCpf, setPixTitularCpf] = useState('');
  const [pixTitularEmail, setPixTitularEmail] = useState('');
  const [rntrcNum, setRntrcNum] = useState('');
  const [chaveNfe, setChaveNfe] = useState('');
  const [areaOperacao, setAreaOperacao] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/auth/login');
        return;
      }
      setUser(session.user);
      const { data } = await supabase
        .from('cadastros')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (data) {
        setProfile(data);
        setNomeOuRazao(data.nome_ou_razao || '');
        setCpfOuCnpj(data.cpf_ou_cnpj || '');
        setEndereco(data.endereco || '');
        setCep(data.cep || '');
        setLogradouro(data.logradouro || '');
        setNumero(data.numero || '');
        setBairro(data.bairro || '');
        setCidade(data.cidade || '');
        setUf(data.uf || '');
        setWhatsapp(data.whatsapp || '');
        setTelefone(data.telefone || '');
        setChavePix(data.chave_pix || '');
        setTitularidadePix(data.titularidade_pix || '');
        setPixTitularNome(data.pix_titular_nome || '');
        setPixTitularCpf(data.pix_titular_cpf || '');
        setPixTitularEmail(data.pix_titular_email || '');
        setRntrcNum(data.rntrc_num || '');
        setChaveNfe(data.chave_nfe_44_digitos || '');
        setAreaOperacao(data.area_operacao || '');
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSuccessMsg(false);
    try {
      // Re-format full address for search index compatibility
      const fullAddress = `${logradouro || ''}, ${numero || ''} - ${bairro || ''}, ${cidade || ''} - ${uf || ''}`.trim();
      
      const { error } = await supabase
        .from('cadastros')
        .update({
          nome_ou_razao: nomeOuRazao,
          cpf_ou_cnpj: cpfOuCnpj,
          endereco: fullAddress || endereco,
          cep: cep || null,
          logradouro: logradouro || null,
          numero: numero || null,
          bairro: bairro || null,
          cidade: cidade,
          uf: uf,
          whatsapp: whatsapp,
          telefone: telefone || null,
          chave_pix: chavePix,
          titularidade_pix: titularidadePix || null,
          pix_titular_nome: pixTitularNome || null,
          pix_titular_cpf: pixTitularCpf || null,
          pix_titular_email: pixTitularEmail || null,
          rntrc_num: rntrcNum || null,
          chave_nfe_44_digitos: chaveNfe || null,
          area_operacao: areaOperacao || null
        })
        .eq('id', user.id);

      if (error) throw error;
      setSuccessMsg(true);
      setProfile((prev: any) => ({
        ...prev,
        nome_ou_razao: nomeOuRazao,
        cpf_ou_cnpj: cpfOuCnpj,
        endereco: fullAddress || endereco,
        cep,
        logradouro,
        numero,
        bairro,
        cidade,
        uf,
        whatsapp,
        telefone,
        chave_pix: chavePix,
        titularidade_pix: titularidadePix,
        pix_titular_nome: pixTitularNome,
        pix_titular_cpf: pixTitularCpf,
        pix_titular_email: pixTitularEmail,
        rntrc_num: rntrcNum,
        chave_nfe_44_digitos: chaveNfe,
        area_operacao: areaOperacao
      }));
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err: any) {
      alert('Erro ao salvar dados: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ffd700' }}>
        Carregando seus dados cadastrais...
      </div>
    );
  }

  const labelStyle = { display: 'block', fontSize: '0.75rem', color: '#aaa', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase' as const };
  const inputStyle = { width: '100%', padding: '10px 14px', background: '#121212', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '0.9rem', outline: 'none' };
  const sectionTitleStyle = { fontSize: '0.92rem', color: '#ffd700', fontWeight: 800, margin: '20px 0 10px 0', borderBottom: '1px solid rgba(255, 215, 0, 0.15)', paddingBottom: '6px', textTransform: 'uppercase' as const, letterSpacing: '1px' };

  return (
    <div style={{ minHeight: '100vh', background: '#060606', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <nav style={{
        background: 'rgba(10, 10, 10, 0.95)',
        borderBottom: '2px solid var(--primary-500)',
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Logo Brand & Dropdown Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {user && profile && (
              <div id="six-lines-dropdown-container" style={{ position: 'relative', fontFamily: 'Inter, sans-serif' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSixLinesMenuOpen(!sixLinesMenuOpen);
                  }}
                  style={{
                    background: 'rgba(8, 8, 8, 0.92)',
                    backdropFilter: 'blur(12px)',
                    border: '2px solid #ffd700',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '2.5px',
                    padding: 0,
                    boxShadow: '0 0 10px rgba(255, 215, 0, 0.3), inset 0 0 5px rgba(255, 215, 0, 0.05)',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    outline: 'none'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#ffd700';
                    e.currentTarget.style.boxShadow = '0 0 18px rgba(255, 215, 0, 0.7)';
                    const lines = e.currentTarget.children;
                    for (let i = 0; i < lines.length; i++) {
                      (lines[i] as HTMLElement).style.background = '#000000';
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(8, 8, 8, 0.92)';
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.3)';
                    const lines = e.currentTarget.children;
                    for (let i = 0; i < lines.length; i++) {
                      (lines[i] as HTMLElement).style.background = '#ffd700';
                    }
                  }}
                >
                  <div style={{ width: '18px', height: '2px', background: '#ffd700', borderRadius: '1px', transition: 'all 0.2s' }}></div>
                  <div style={{ width: '18px', height: '2px', background: '#ffd700', borderRadius: '1px', transition: 'all 0.2s' }}></div>
                  <div style={{ width: '18px', height: '2px', background: '#ffd700', borderRadius: '1px', transition: 'all 0.2s' }}></div>
                  <div style={{ width: '18px', height: '2px', background: '#ffd700', borderRadius: '1px', transition: 'all 0.2s' }}></div>
                  <div style={{ width: '18px', height: '2px', background: '#ffd700', borderRadius: '1px', transition: 'all 0.2s' }}></div>
                  <div style={{ width: '18px', height: '2px', background: '#ffd700', borderRadius: '1px', transition: 'all 0.2s' }}></div>
                </button>
                
                {sixLinesMenuOpen && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: '46px',
                      left: 0,
                      background: 'rgba(8, 8, 8, 0.98)',
                      backdropFilter: 'blur(16px)',
                      border: '1.5px solid #ffd700',
                      borderRadius: '6px',
                      minWidth: '250px',
                      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.95), 0 0 25px rgba(255, 215, 0, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      animation: 'fadeIn 0.2s ease-out',
                      zIndex: 999999
                    }}
                  >
                    <div style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(255, 215, 0, 0.2)',
                      fontSize: '0.72rem',
                      color: '#ffd700',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                      background: 'rgba(255, 215, 0, 0.05)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>Navegação</span>
                      <span style={{ fontSize: '0.6rem', padding: '2px 6px', background: '#ffd700', color: '#000', borderRadius: '3px', fontWeight: 900 }}>
                        {profile?.tipo_parte || 'USER'}
                      </span>
                    </div>
                    
                    <Link
                      href="/planos"
                      onClick={() => setSixLinesMenuOpen(false)}
                      style={{ background: 'none', border: 'none', padding: '12px 16px', color: '#fff', fontSize: '0.85rem', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      💳 Planos e Pagamentos
                    </Link>
                    
                    <Link
                      href="/ajuda"
                      onClick={() => setSixLinesMenuOpen(false)}
                      style={{ background: 'none', border: 'none', padding: '12px 16px', color: '#fff', fontSize: '0.85rem', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      ❓ Ajuda
                    </Link>
                    
                    <Link
                      href="/dados-cadastrais"
                      onClick={() => setSixLinesMenuOpen(false)}
                      style={{ background: 'none', border: 'none', padding: '12px 16px', color: '#fff', fontSize: '0.85rem', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      👤 Meus Dados Cadastrais
                    </Link>
                    
                    <Link
                      href="/ficha"
                      onClick={() => setSixLinesMenuOpen(false)}
                      style={{ background: 'none', border: 'none', padding: '12px 16px', color: '#fff', fontSize: '0.85rem', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      📋 Minha Ficha Materra
                    </Link>
                    
                    <Link
                      href="/upload-documentos"
                      onClick={() => setSixLinesMenuOpen(false)}
                      style={{ background: 'none', border: 'none', padding: '12px 16px', color: '#fff', fontSize: '0.85rem', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      📤 Upload de Documentos
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <LogoBrand />
            </Link>
          </div>
          <Link href="/" style={{ fontSize: '0.82rem', color: '#888', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ffd700')}
            onMouseLeave={e => (e.currentTarget.style.color = '#888')}
          >
            <ArrowLeft size={16} /> Voltar ao Painel
          </Link>
        </div>
      </nav>

      <main style={{ maxWidth: '750px', margin: '40px auto 80px', padding: '0 24px' }}>
        <div style={{
          background: 'rgba(8, 8, 8, 0.98)',
          border: '2px solid #ffd700',
          borderRadius: '8px',
          padding: '32px',
          boxShadow: '0 0 20px rgba(255, 215, 0, 0.15)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffd700', marginBottom: '8px', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
            👤 Ficha Cadastral do Usuário
          </h2>
          <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '24px' }}>
            Consulte e atualize todas as informações imputadas no seu onboarding da plataforma Materra Elo.
          </p>

          {successMsg && (
            <div style={{
              background: 'rgba(0, 255, 102, 0.1)',
              border: '1px solid #00ff66',
              color: '#00ff66',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              marginBottom: '20px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle size={16} /> Dados atualizados com sucesso!
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* SECTION 1: IDENTIFICATION */}
            <div style={sectionTitleStyle}>👤 Identificação e Login</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Razão Social / Nome</label>
                <input type="text" required value={nomeOuRazao} onChange={e => setNomeOuRazao(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>CPF / CNPJ</label>
                <input type="text" required value={cpfOuCnpj} onChange={e => setCpfOuCnpj(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>E-mail de Login (Acesso)</label>
                <input type="email" readOnly value={profile?.email || user?.email || ''} style={{ ...inputStyle, background: '#222', color: '#888', cursor: 'not-allowed' }} />
              </div>
              <div>
                <label style={labelStyle}>Papel na Plataforma</label>
                <input type="text" readOnly value={`${profile?.tipo_parte || ''} (${profile?.subtipo || ''})`} style={{ ...inputStyle, background: '#222', color: '#888', cursor: 'not-allowed' }} />
              </div>
            </div>

            {/* SECTION 2: LOCATION */}
            <div style={sectionTitleStyle}>📍 Endereço e Localização</div>

            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 100px', gap: '16px' }}>
              <div>
                <label style={labelStyle}>CEP</label>
                <input type="text" value={cep} onChange={e => setCep(e.target.value)} style={inputStyle} placeholder="Ex: 01001-000" />
              </div>
              <div>
                <label style={labelStyle}>Logradouro</label>
                <input type="text" value={logradouro} onChange={e => setLogradouro(e.target.value)} style={inputStyle} placeholder="Ex: Avenida Paulista" />
              </div>
              <div>
                <label style={labelStyle}>Número</label>
                <input type="text" value={numero} onChange={e => setNumero(e.target.value)} style={inputStyle} placeholder="Ex: 1000" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 80px', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Bairro</label>
                <input type="text" value={bairro} onChange={e => setBairro(e.target.value)} style={inputStyle} placeholder="Ex: Bela Vista" />
              </div>
              <div>
                <label style={labelStyle}>Cidade</label>
                <input type="text" required value={cidade} onChange={e => setCidade(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>UF</label>
                <input type="text" required maxLength={2} value={uf} onChange={e => setUf(e.target.value)} style={{ ...inputStyle, textAlign: 'center' }} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Endereço Completo Formatado (Exibição)</label>
              <input type="text" readOnly value={endereco} style={{ ...inputStyle, background: '#222', color: '#aaa', cursor: 'not-allowed' }} />
            </div>

            {/* SECTION 3: CONTACTS */}
            <div style={sectionTitleStyle}>📞 Telefones e Contatos</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>WhatsApp (Celular)</label>
                <input type="text" required value={whatsapp} onChange={e => setWhatsapp(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Telefone Comercial</label>
                <input type="text" value={telefone} onChange={e => setTelefone(e.target.value)} style={inputStyle} placeholder="Ex: (11) 3224-5566" />
              </div>
            </div>

            {/* SECTION 4: LOGISTICS & TAXES */}
            <div style={sectionTitleStyle}>🚚 Fiscal e Logística</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Registro ANTT (RNTRC)</label>
                <input type="text" value={rntrcNum} onChange={e => setRntrcNum(e.target.value)} style={inputStyle} placeholder="Ex: 55432123" />
              </div>
              <div>
                <label style={labelStyle}>Chave NF-e (44 dígitos)</label>
                <input type="text" value={chaveNfe} onChange={e => setChaveNfe(e.target.value)} style={inputStyle} placeholder="Chave da última NF-e emitida" />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Estados de Atuação / Operação</label>
              <input type="text" value={areaOperacao} onChange={e => setAreaOperacao(e.target.value)} style={inputStyle} placeholder="Ex: SP, RJ, MG" />
              <small style={{ color: '#666', marginTop: '4px', display: 'block', fontSize: '0.72rem' }}>Lista de estados onde sua transportadora possui licença para operar.</small>
            </div>

            {/* SECTION 5: PIX & FINANCE */}
            <div style={sectionTitleStyle}>💳 Chave PIX e Repasses Financeiros</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Chave PIX para Recebimentos</label>
                <input type="text" value={chavePix} onChange={e => setChavePix(e.target.value)} style={{ ...inputStyle, border: '1px solid #ffd700' }} placeholder="E-mail, CNPJ, Telefone ou Aleatória" />
              </div>
              <div>
                <label style={labelStyle}>Titularidade</label>
                <select value={titularidadePix} onChange={e => setTitularidadePix(e.target.value)} style={inputStyle}>
                  <option value="">Selecione a titularidade</option>
                  <option value="Minha conta">Conta própria da empresa</option>
                  <option value="Terceiros">Conta de Terceiros / Sócio</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Nome do Titular do PIX</label>
                <input type="text" value={pixTitularNome} onChange={e => setPixTitularNome(e.target.value)} style={inputStyle} placeholder="Nome completo do beneficiário" />
              </div>
              <div>
                <label style={labelStyle}>CPF/CNPJ do Titular</label>
                <input type="text" value={pixTitularCpf} onChange={e => setPixTitularCpf(e.target.value)} style={inputStyle} placeholder="Ex: 00.000.000/0001-00" />
              </div>
            </div>

            <div>
              <label style={labelStyle}>E-mail de Notificações PIX (Contato Financeiro)</label>
              <input type="email" value={pixTitularEmail} onChange={e => setPixTitularEmail(e.target.value)} style={inputStyle} placeholder="Ex: financeiro@empresa.com" />
            </div>

            {/* SECTION 6: COMPLIANCE SCORES & ONBOARDING */}
            <div style={sectionTitleStyle}>🎖️ Compliance & Histórico do Operador</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Selo de Conformidade</label>
                <div style={{ ...inputStyle, background: '#18181b', border: '1px solid #27272a', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                  🏅 {profile?.nivel_selo || 'Bronze'}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Materra Score (0-100)</label>
                <div style={{ ...inputStyle, background: '#18181b', border: '1px solid #27272a', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: '#00FF66' }}>
                  📈 {profile?.score_0a100 || '50'} / 100
                </div>
              </div>
              <div>
                <label style={labelStyle}>Plano de Assinatura</label>
                <div style={{ ...inputStyle, background: '#18181b', border: '1px solid #27272a', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: '#ffd700' }}>
                  💎 {profile?.plano || 'Free'}
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Observações / Histórico de Registro</label>
              <textarea readOnly value={profile?.observacoes || 'Nenhum registro de onboarding inserido.'} style={{ ...inputStyle, height: '80px', background: '#222', color: '#888', cursor: 'not-allowed', resize: 'none' }} />
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                padding: '14px 20px',
                background: '#ffd700',
                border: 'none',
                borderRadius: '4px',
                color: '#000',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 0 10px rgba(255, 215, 0, 0.2)',
                transition: 'all 0.2s',
                marginTop: '15px'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#ffd700'; e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.2)'; }}
            >
              {saving ? 'Salvando...' : 'Salvar Alterações Cadastrais'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
