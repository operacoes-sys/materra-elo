'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, CheckCircle, Upload, FileText, Check, X, ShieldAlert } from 'lucide-react';

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

export default function UploadDocumentosPage() {
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

  // Upload states
  const [activeDocType, setActiveDocType] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docNumber, setDocNumber] = useState('');
  const [docValidity, setDocValidity] = useState('');
  const [docMoppChecked, setDocMoppChecked] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Extra fields for custom document metadata
  const [docOrgao, setDocOrgao] = useState('');
  const [docAnoReferencia, setDocAnoReferencia] = useState('');
  const [docOrgaoCertificador, setDocOrgaoCertificador] = useState('');
  const [docSeguradora, setDocSeguradora] = useState('');
  const [docTipoAtividade, setDocTipoAtividade] = useState('');
  const [docVolumeMensal, setDocVolumeMensal] = useState('');
  const [docTecnologia, setDocTecnologia] = useState('');
  const [docPlaca, setDocPlaca] = useState('');
  const [docRenavam, setDocRenavam] = useState('');
  const [docValorCobertura, setDocValorCobertura] = useState('');

  useEffect(() => {
    async function loadData() {
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
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleUpdateTipoParte = async (newTipo: string) => {
    if (!user || !profile) return;
    try {
      const { error } = await supabase
        .from('cadastros')
        .update({ tipo_parte: newTipo })
        .eq('id', user.id);
      if (error) throw error;
      setProfile({ ...profile, tipo_parte: newTipo });
      alert(`Aptidão atualizada para: ${newTipo}`);
    } catch (e: any) {
      alert('Erro ao atualizar papel: ' + e.message);
    }
  };

  interface RequiredDoc {
    key: string;
    label: string;
    level: 'Prata' | 'Ouro';
    role: 'Fornecedor' | 'Comprador' | 'Transportadora' | 'Controlador';
    description: string;
  }

  const REQUIRED_DOCUMENTS: RequiredDoc[] = [
    // Fornecedor (Gerador)
    {
      key: 'licenca_ambiental_operacao_forn',
      label: 'Licença Ambiental de Operação (LO) - Atividade Geradora',
      level: 'Prata',
      role: 'Fornecedor',
      description: 'Número, órgão emissor, validade e upload do PDF.'
    },
    {
      key: 'pgrs',
      label: 'PGRS (Plano de Gerenciamento de Resíduos Sólidos)',
      level: 'Prata',
      role: 'Fornecedor',
      description: 'Upload do documento PDF.'
    },
    {
      key: 'alvara_municipal_forn',
      label: 'Alvará de Funcionamento Municipal (Forn.)',
      level: 'Prata',
      role: 'Fornecedor',
      description: 'Número e data de validade.'
    },
    {
      key: 'avcb_forn',
      label: 'AVCB (Corpo de Bombeiros - Forn.)',
      level: 'Prata',
      role: 'Fornecedor',
      description: 'Número e data de validade.'
    },
    {
      key: 'inventario_anual_rapp',
      label: 'Inventário Anual (RAPP) entregue',
      level: 'Ouro',
      role: 'Fornecedor',
      description: 'Upload do PDF do protocolo SINIR/CTF + ano de referência.'
    },
    {
      key: 'iso_14001_forn',
      label: 'Certificação ISO 14001 (Forn.)',
      level: 'Ouro',
      role: 'Fornecedor',
      description: 'Número do certificado, validade e organismo certificador.'
    },
    {
      key: 'apolice_ambiental_forn',
      label: 'Apólice de Seguro de Responsabilidade Ambiental (Forn.)',
      level: 'Ouro',
      role: 'Fornecedor',
      description: 'Número da apólice, seguradora e validade.'
    },
    {
      key: 'export_mtr_cdf_forn',
      label: 'Export do Histórico de MTR/CDF Emitidos',
      level: 'Ouro',
      role: 'Fornecedor',
      description: 'Upload do PDF extraído do painel do SINIR ou sistema estadual.'
    },

    // Comprador (Recicladora / Destinadora)
    {
      key: 'licenca_ambiental_operacao_comp',
      label: 'Licença Ambiental de Operação (LO) - Atividade de Recebimento',
      level: 'Prata',
      role: 'Comprador',
      description: 'Número, órgão, validade, tipo (reciclagem, aterro, coprocessamento, tratamento etc.) e upload.'
    },
    {
      key: 'cadri_aaf',
      label: 'CADRI / AAF / Autorização Estadual para Receber de Terceiros',
      level: 'Prata',
      role: 'Comprador',
      description: 'Número, órgão, validade e upload (essencial para o destinador).'
    },
    {
      key: 'capacidade_instalada',
      label: 'Capacidade Instalada',
      level: 'Prata',
      role: 'Comprador',
      description: 'Volume autorizado por mês (t/m³) e tecnologia empregada.'
    },
    {
      key: 'alvara_municipal_comp',
      label: 'Alvará de Funcionamento Municipal (Comp.)',
      level: 'Prata',
      role: 'Comprador',
      description: 'Número e data de validade.'
    },
    {
      key: 'avcb_comp',
      label: 'AVCB (Corpo de Bombeiros - Comp.)',
      level: 'Prata',
      role: 'Comprador',
      description: 'Número e data de validade.'
    },
    {
      key: 'iso_14001_comp',
      label: 'Certificação ISO 14001 (Comp.)',
      level: 'Ouro',
      role: 'Comprador',
      description: 'Número do certificado, validade e organismo certificador.'
    },
    {
      key: 'apolice_ambiental_comp',
      label: 'Apólice de Responsabilidade Ambiental (Comp.)',
      level: 'Ouro',
      role: 'Comprador',
      description: 'Número, seguradora e validade.'
    },
    {
      key: 'anvisa_rss',
      label: 'ANVISA (Apenas para RSS)',
      level: 'Ouro',
      role: 'Comprador',
      description: 'Número da autorização (exigido caso opere com Resíduos de Serviços de Saúde).'
    },
    {
      key: 'export_cdf_comp',
      label: 'Export do Histórico de CDF Emitidos',
      level: 'Ouro',
      role: 'Comprador',
      description: 'PDF extraído do painel do SINIR ou sistema estadual.'
    },

    // Transportadora
    {
      key: 'licenca_transporte',
      label: 'Licença Ambiental de Coleta e Transporte de Resíduo',
      level: 'Prata',
      role: 'Transportadora',
      description: 'Número, órgão estadual, validade e upload.'
    },
    {
      key: 'crlv_veiculos',
      label: 'CRLV dos Veículos Cadastrados',
      level: 'Prata',
      role: 'Transportadora',
      description: 'Placa, RENAVAM e validade por veículo.'
    },
    {
      key: 'civ_veiculos',
      label: 'CIV (Certificado de Inspeção Veicular)',
      level: 'Prata',
      role: 'Transportadora',
      description: 'Por veículo, número e validade.'
    },
    {
      key: 'mopp',
      label: 'MOPP do Motorista (Classe I - Perigosas)',
      level: 'Prata',
      role: 'Transportadora',
      description: 'Número e validade (Exigido para cargas perigosas Classe I).'
    },
    {
      key: 'cipp',
      label: 'CIPP - Certificado de Inspeção para Produtos Perigosos',
      level: 'Prata',
      role: 'Transportadora',
      description: 'Por veículo, número e validade (Exigido para cargas perigosas Classe I).'
    },
    {
      key: 'apolice_seguro_rc',
      label: 'Apólice de Seguro RC + RCFDC',
      level: 'Ouro',
      role: 'Transportadora',
      description: 'Número, seguradora, valor de cobertura e validade.'
    },
    {
      key: 'pae_transporte',
      label: 'Plano de Atendimento Emergencial (PAE)',
      level: 'Ouro',
      role: 'Transportadora',
      description: 'Upload do documento PDF (obrigatório para resíduos perigosos).'
    },
    {
      key: 'export_mtr_trans',
      label: 'Export do Histórico de MTR como Transportadora',
      level: 'Ouro',
      role: 'Transportadora',
      description: 'PDF extraído do painel do SINIR ou sistema estadual.'
    },
    {
      key: 'iso_9001_14001',
      label: 'Certificação ISO 9001 / 14001',
      level: 'Ouro',
      role: 'Transportadora',
      description: 'Número e validade.'
    },

    // Mandato / Controlador (Consultor / Corretor)
    {
      key: 'procuracao_simples',
      label: 'Procuração ou Carta de Autorização Simples',
      level: 'Prata',
      role: 'Controlador',
      description: 'Upload de documento assinado digitalmente ou fisicamente pelo responsável legal do CNPJ dono do resíduo.'
    },
    {
      key: 'procuracao_eletronica',
      label: 'Procuração Eletrônica / Assinatura Digital GOV.BR ou ICP-Brasil',
      level: 'Ouro',
      role: 'Controlador',
      description: 'Validação via Clicksign ou arquivo autenticado criptograficamente.'
    },
    {
      key: 'carteira_conselho_art',
      label: 'Carteira do Conselho Profissional (CREA/CRQ) + ART de Cargo/Função',
      level: 'Ouro',
      role: 'Controlador',
      description: 'Cópia do registro profissional do consultor atestando que ele é o Responsável Técnico legal.'
    }
  ];

  const getRequiredDocsForUser = (): RequiredDoc[] => {
    if (!profile) return [];
    
    const role = profile.tipo_parte;
    const isControlador = role === 'Consultor' || profile.subtipo === 'Corretor' || profile.subtipo === 'Corretor/Controlador';
    
    if (isControlador) {
      return REQUIRED_DOCUMENTS.filter(d => d.role === 'Controlador');
    }
    
    if (role === 'Transportadora') {
      return REQUIRED_DOCUMENTS.filter(d => d.role === 'Transportadora');
    }
    
    if (role === 'Fornecedor') {
      return REQUIRED_DOCUMENTS.filter(d => d.role === 'Fornecedor');
    }
    
    if (role === 'Comprador') {
      return REQUIRED_DOCUMENTS.filter(d => d.role === 'Comprador');
    }
    
    if (role === 'Fornecedor / Comprador' || role === 'Fornecedor e Comprador') {
      return REQUIRED_DOCUMENTS.filter(d => d.role === 'Fornecedor' || d.role === 'Comprador');
    }
    
    return [];
  };

  const getDocNameFriendly = (type: string) => {
    const names: Record<string, string> = {
      licenca_ambiental_operacao_forn: 'Licença Ambiental de Operação (LO) - Atividade Geradora',
      pgrs: 'PGRS (Plano de Gerenciamento de Resíduos Sólidos)',
      alvara_municipal_forn: 'Alvará de Funcionamento Municipal (Forn.)',
      avcb_forn: 'AVCB (Corpo de Bombeiros - Forn.)',
      inventario_anual_rapp: 'Inventário Anual (RAPP) entregue',
      iso_14001_forn: 'Certificação ISO 14001 (Forn.)',
      apolice_ambiental_forn: 'Apólice de Seguro de Responsabilidade Ambiental (Forn.)',
      export_mtr_cdf_forn: 'Export do Histórico de MTR/CDF Emitidos',
      licenca_ambiental_operacao_comp: 'Licença Ambiental de Operação (LO) - Atividade de Recebimento',
      cadri_aaf: 'CADRI / AAF / Autorização Estadual',
      capacidade_instalada: 'Capacidade Instalada',
      alvara_municipal_comp: 'Alvará de Funcionamento Municipal (Comp.)',
      avcb_comp: 'AVCB (Corpo de Bombeiros - Comp.)',
      iso_14001_comp: 'Certificação ISO 14001 (Comp.)',
      apolice_ambiental_comp: 'Apólice de Responsabilidade Ambiental (Comp.)',
      anvisa_rss: 'ANVISA (Apenas para RSS)',
      export_cdf_comp: 'Export do Histórico de CDF Emitidos',
      licenca_transporte: 'Licença Ambiental de Coleta e Transporte',
      crlv_veiculos: 'CRLV dos Veículos Cadastrados',
      civ_veiculos: 'CIV (Certificado de Inspeção Veicular)',
      mopp: 'MOPP do Motorista',
      cipp: 'CIPP (Certificado de Inspeção para Produtos Perigosos)',
      apolice_seguro_rc: 'Apólice de Seguro RC + RCFDC',
      pae_transporte: 'Plano de Atendimento Emergencial (PAE)',
      export_mtr_trans: 'Export do Histórico de MTR como Transportadora',
      iso_9001_14001: 'Certificação ISO 9001 / 14001',
      procuracao_simples: 'Procuração ou Carta de Autorização Simples',
      procuracao_eletronica: 'Procuração Eletrônica / Assinatura Digital GOV.BR',
      carteira_conselho_art: 'Carteira do Conselho Profissional + ART'
    };
    return names[type] || type.replace(/_/g, ' ').toUpperCase();
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !activeDocType || !docFile) {
      alert('Selecione um arquivo válido.');
      return;
    }

    setUploadingDoc(true);
    setSuccessMsg('');
    try {
      const fileExt = docFile.name.split('.').pop();
      const fileName = `${user.id}/docs/${activeDocType}_${Date.now()}.${fileExt}`;

      const { error: uploadErr } = await supabase.storage
        .from('documentos')
        .upload(fileName, docFile, { cacheControl: '3600', upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from('documentos')
        .getPublicUrl(fileName);

      let docsObj: any = {};
      if (profile.documentos_recebidos) {
        try {
          docsObj = JSON.parse(profile.documentos_recebidos);
        } catch (e) {
          docsObj = {};
        }
      }

      docsObj[activeDocType] = {
        url: publicUrl,
        num: docNumber || null,
        validade: docValidity || null,
        orgao: docOrgao || null,
        anoReferencia: docAnoReferencia || null,
        orgaoCertificador: docOrgaoCertificador || null,
        seguradora: docSeguradora || null,
        tipoAtividade: docTipoAtividade || null,
        volumeMensal: docVolumeMensal || null,
        tecnologia: docTecnologia || null,
        placa: docPlaca || null,
        renavam: docRenavam || null,
        valorCobertura: docValorCobertura || null,
        mopp: docMoppChecked,
        data_upload: new Date().toISOString()
      };

      const jsonStr = JSON.stringify(docsObj);
      const { error: dbError } = await supabase
        .from('cadastros')
        .update({
          documentos_recebidos: jsonStr,
          status_documentos: 'Em análise'
        })
        .eq('id', user.id);

      if (dbError) throw dbError;

      setProfile({
        ...profile,
        documentos_recebidos: jsonStr,
        status_documentos: 'Em análise'
      });

      setSuccessMsg('Documento enviado com sucesso para análise!');
      setDocFile(null);
      setDocNumber('');
      setDocValidity('');
      setDocMoppChecked(false);
      setDocOrgao('');
      setDocAnoReferencia('');
      setDocOrgaoCertificador('');
      setDocSeguradora('');
      setDocTipoAtividade('');
      setDocVolumeMensal('');
      setDocTecnologia('');
      setDocPlaca('');
      setDocRenavam('');
      setDocValorCobertura('');
      setActiveDocType('');
    } catch (err: any) {
      alert('Erro ao enviar documento: ' + err.message);
    } finally {
      setUploadingDoc(false);
    }
  };

  const labelStyle = { display: 'block', fontSize: '0.75rem', color: '#aaa', marginBottom: '6px', fontWeight: 'bold' };
  const inputStyle = { width: '100%', padding: '8px 12px', background: '#000', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '0.85rem', outline: 'none' };

  const renderFormFields = (docKey: string) => {
    switch (docKey) {
      case 'licenca_ambiental_operacao_forn':
        return (
          <>
            <div>
              <label style={labelStyle}>Número da LO</label>
              <input type="text" value={docNumber} onChange={e => setDocNumber(e.target.value)} required style={inputStyle} placeholder="Ex: LO nº 1234/2026" />
            </div>
            <div>
              <label style={labelStyle}>Órgão Emissor</label>
              <input type="text" value={docOrgao} onChange={e => setDocOrgao(e.target.value)} required style={inputStyle} placeholder="Ex: CETESB, INEA, FEAM" />
            </div>
            <div>
              <label style={labelStyle}>Data de Validade</label>
              <input type="date" value={docValidity} onChange={e => setDocValidity(e.target.value)} required style={inputStyle} />
            </div>
          </>
        );
      case 'alvara_municipal_forn':
      case 'alvara_municipal_comp':
        return (
          <>
            <div>
              <label style={labelStyle}>Número do Alvará</label>
              <input type="text" value={docNumber} onChange={e => setDocNumber(e.target.value)} required style={inputStyle} placeholder="Ex: 55432-A" />
            </div>
            <div>
              <label style={labelStyle}>Data de Validade</label>
              <input type="date" value={docValidity} onChange={e => setDocValidity(e.target.value)} required style={inputStyle} />
            </div>
          </>
        );
      case 'avcb_forn':
      case 'avcb_comp':
        return (
          <>
            <div>
              <label style={labelStyle}>Número do AVCB</label>
              <input type="text" value={docNumber} onChange={e => setDocNumber(e.target.value)} required style={inputStyle} placeholder="Ex: 887321" />
            </div>
            <div>
              <label style={labelStyle}>Data de Validade</label>
              <input type="date" value={docValidity} onChange={e => setDocValidity(e.target.value)} required style={inputStyle} />
            </div>
          </>
        );
      case 'inventario_anual_rapp':
        return (
          <div>
            <label style={labelStyle}>Ano de Referência</label>
            <input type="number" min="2000" max="2100" value={docAnoReferencia} onChange={e => setDocAnoReferencia(e.target.value)} required style={inputStyle} placeholder="Ex: 2025" />
          </div>
        );
      case 'iso_14001_forn':
      case 'iso_14001_comp':
        return (
          <>
            <div>
              <label style={labelStyle}>Número do Certificado</label>
              <input type="text" value={docNumber} onChange={e => setDocNumber(e.target.value)} required style={inputStyle} placeholder="Ex: BR045332" />
            </div>
            <div>
              <label style={labelStyle}>Organismo Certificador</label>
              <input type="text" value={docOrgaoCertificador} onChange={e => setDocOrgaoCertificador(e.target.value)} required style={inputStyle} placeholder="Ex: SGS, Bureau Veritas, DNV" />
            </div>
            <div>
              <label style={labelStyle}>Data de Validade</label>
              <input type="date" value={docValidity} onChange={e => setDocValidity(e.target.value)} required style={inputStyle} />
            </div>
          </>
        );
      case 'apolice_ambiental_forn':
      case 'apolice_ambiental_comp':
        return (
          <>
            <div>
              <label style={labelStyle}>Número da Apólice</label>
              <input type="text" value={docNumber} onChange={e => setDocNumber(e.target.value)} required style={inputStyle} placeholder="Ex: AP-77123" />
            </div>
            <div>
              <label style={labelStyle}>Seguradora</label>
              <input type="text" value={docSeguradora} onChange={e => setDocSeguradora(e.target.value)} required style={inputStyle} placeholder="Ex: Porto Seguro, Allianz, Tokio Marine" />
            </div>
            <div>
              <label style={labelStyle}>Data de Validade</label>
              <input type="date" value={docValidity} onChange={e => setDocValidity(e.target.value)} required style={inputStyle} />
            </div>
          </>
        );
      case 'licenca_ambiental_operacao_comp':
        return (
          <>
            <div>
              <label style={labelStyle}>Número da LO</label>
              <input type="text" value={docNumber} onChange={e => setDocNumber(e.target.value)} required style={inputStyle} placeholder="Ex: LO nº 9923/2026" />
            </div>
            <div>
              <label style={labelStyle}>Órgão Emissor</label>
              <input type="text" value={docOrgao} onChange={e => setDocOrgao(e.target.value)} required style={inputStyle} placeholder="Ex: CETESB, FEPAM" />
            </div>
            <div>
              <label style={labelStyle}>Data de Validade</label>
              <input type="date" value={docValidity} onChange={e => setDocValidity(e.target.value)} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Tipo de Destinação Autorizada</label>
              <input type="text" value={docTipoAtividade} onChange={e => setDocTipoAtividade(e.target.value)} required style={inputStyle} placeholder="Ex: Reciclagem, Aterro, Coprocessamento, Tratamento" />
            </div>
          </>
        );
      case 'cadri_aaf':
        return (
          <>
            <div>
              <label style={labelStyle}>Número do Documento</label>
              <input type="text" value={docNumber} onChange={e => setDocNumber(e.target.value)} required style={inputStyle} placeholder="Ex: CADRI nº 44002341" />
            </div>
            <div>
              <label style={labelStyle}>Órgão Emissor</label>
              <input type="text" value={docOrgao} onChange={e => setDocOrgao(e.target.value)} required style={inputStyle} placeholder="Ex: CETESB, FATMA" />
            </div>
            <div>
              <label style={labelStyle}>Data de Validade</label>
              <input type="date" value={docValidity} onChange={e => setDocValidity(e.target.value)} required style={inputStyle} />
            </div>
          </>
        );
      case 'capacidade_instalada':
        return (
          <>
            <div>
              <label style={labelStyle}>Volume Autorizado por Mês (t/m³)</label>
              <input type="text" value={docVolumeMensal} onChange={e => setDocVolumeMensal(e.target.value)} required style={inputStyle} placeholder="Ex: 500 t/m³ ou 2.500 m³" />
            </div>
            <div>
              <label style={labelStyle}>Tecnologia Empregada</label>
              <input type="text" value={docTecnologia} onChange={e => setDocTecnologia(e.target.value)} required style={inputStyle} placeholder="Ex: Trituração, Coprocessamento, Triagem Óptica" />
            </div>
          </>
        );
      case 'anvisa_rss':
        return (
          <div>
            <label style={labelStyle}>Número da Autorização ANVISA</label>
            <input type="text" value={docNumber} onChange={e => setDocNumber(e.target.value)} required style={inputStyle} placeholder="Ex: ANVISA-RSS-33291" />
          </div>
        );
      case 'licenca_transporte':
        return (
          <>
            <div>
              <label style={labelStyle}>Número da Licença</label>
              <input type="text" value={docNumber} onChange={e => setDocNumber(e.target.value)} required style={inputStyle} placeholder="Ex: L.A. nº 3921/2026" />
            </div>
            <div>
              <label style={labelStyle}>Órgão Estadual</label>
              <input type="text" value={docOrgao} onChange={e => setDocOrgao(e.target.value)} required style={inputStyle} placeholder="Ex: CETESB, IAP, INEA" />
            </div>
            <div>
              <label style={labelStyle}>Data de Validade</label>
              <input type="date" value={docValidity} onChange={e => setDocValidity(e.target.value)} required style={inputStyle} />
            </div>
          </>
        );
      case 'crlv_veiculos':
        return (
          <>
            <div>
              <label style={labelStyle}>Placa do Veículo</label>
              <input type="text" value={docPlaca} onChange={e => setDocPlaca(e.target.value)} required style={inputStyle} placeholder="Ex: ABC-1234" />
            </div>
            <div>
              <label style={labelStyle}>RENAVAM</label>
              <input type="text" value={docRenavam} onChange={e => setDocRenavam(e.target.value)} required style={inputStyle} placeholder="Ex: 123456789" />
            </div>
            <div>
              <label style={labelStyle}>Data de Validade da Licença do Veículo</label>
              <input type="date" value={docValidity} onChange={e => setDocValidity(e.target.value)} required style={inputStyle} />
            </div>
          </>
        );
      case 'civ_veiculos':
      case 'cipp':
        return (
          <>
            <div>
              <label style={labelStyle}>Número do Certificado</label>
              <input type="text" value={docNumber} onChange={e => setDocNumber(e.target.value)} required style={inputStyle} placeholder="Ex: CIV-993821" />
            </div>
            <div>
              <label style={labelStyle}>Data de Validade</label>
              <input type="date" value={docValidity} onChange={e => setDocValidity(e.target.value)} required style={inputStyle} />
            </div>
          </>
        );
      case 'mopp':
        return (
          <>
            <div>
              <label style={labelStyle}>Número de Registro da CNH (com MOPP)</label>
              <input type="text" value={docNumber} onChange={e => setDocNumber(e.target.value)} required style={inputStyle} placeholder="Ex: 0453321928" />
            </div>
            <div>
              <label style={labelStyle}>Data de Validade do MOPP</label>
              <input type="date" value={docValidity} onChange={e => setDocValidity(e.target.value)} required style={inputStyle} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
              <input type="checkbox" checked={docMoppChecked} onChange={e => setDocMoppChecked(e.target.checked)} id="mopp-check" />
              <label htmlFor="mopp-check" style={{ fontSize: '0.8rem', color: '#fff', cursor: 'pointer' }}>Possui homologação MOPP ativa na CNH?</label>
            </div>
          </>
        );
      case 'apolice_seguro_rc':
        return (
          <>
            <div>
              <label style={labelStyle}>Número da Apólice</label>
              <input type="text" value={docNumber} onChange={e => setDocNumber(e.target.value)} required style={inputStyle} placeholder="Ex: RC-88732" />
            </div>
            <div>
              <label style={labelStyle}>Seguradora</label>
              <input type="text" value={docSeguradora} onChange={e => setDocSeguradora(e.target.value)} required style={inputStyle} placeholder="Ex: Mapfre, Allianz, Tokio" />
            </div>
            <div>
              <label style={labelStyle}>Valor da Cobertura (R$)</label>
              <input type="text" value={docValorCobertura} onChange={e => setDocValorCobertura(e.target.value)} required style={inputStyle} placeholder="Ex: R$ 500.000,00" />
            </div>
            <div>
              <label style={labelStyle}>Data de Validade</label>
              <input type="date" value={docValidity} onChange={e => setDocValidity(e.target.value)} required style={inputStyle} />
            </div>
          </>
        );
      case 'iso_9001_14001':
        return (
          <>
            <div>
              <label style={labelStyle}>Número do Certificado ISO</label>
              <input type="text" value={docNumber} onChange={e => setDocNumber(e.target.value)} required style={inputStyle} placeholder="Ex: ISO-9001-88421" />
            </div>
            <div>
              <label style={labelStyle}>Data de Validade</label>
              <input type="date" value={docValidity} onChange={e => setDocValidity(e.target.value)} required style={inputStyle} />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const renderUploadForm = (docKey: string) => {
    const isSelected = activeDocType === docKey;
    if (!isSelected) return null;

    return (
      <div style={{ borderTop: '1px solid #222', marginTop: '16px', paddingTop: '16px' }}>
        <form onSubmit={handleUpload} style={{ background: '#0a0a0a', border: '1px solid #ffd700', padding: '20px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ color: '#ffd700', fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>
            Enviar Arquivo: {getDocNameFriendly(docKey)}
          </h4>

          {renderFormFields(docKey)}

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: '#aaa', marginBottom: '6px', fontWeight: 'bold' }}>Selecione o arquivo (PDF, Imagem)</label>
            <input type="file" required onChange={e => setDocFile(e.target.files?.[0] || null)} style={{ color: '#ccc', fontSize: '0.8rem' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={uploadingDoc} style={{ background: '#ffd700', border: 'none', padding: '10px 20px', borderRadius: '4px', color: '#000', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fff'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffd700'}
            >
              {uploadingDoc ? 'Enviando...' : 'Fazer Upload'}
            </button>
            <button type="button" onClick={() => setActiveDocType('')} style={{ background: '#222', border: '1px solid #444', padding: '10px 20px', borderRadius: '4px', color: '#fff', fontSize: '0.85rem', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ffd700' }}>
        Carregando gerenciador de documentos...
      </div>
    );
  }

  const isCarrierUser = profile?.tipo_parte === 'Transportadora';

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

      <main style={{ maxWidth: '800px', margin: '40px auto 80px', padding: '0 24px' }}>
        
        {/* HABILITACAO PERFIL DUPLO (Dupla Aptidão) Selector */}
        {profile && ['Fornecedor', 'Comprador', 'Fornecedor / Comprador', 'Fornecedor e Comprador'].includes(profile.tipo_parte) && (
          <div style={{
            background: 'rgba(8, 8, 8, 0.98)',
            border: '2px solid #ffd700',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: '0 0 15px rgba(255, 215, 0, 0.1)'
          }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#ffd700', fontWeight: 'bold' }}>⚡ Aptidão da Empresa</h3>
            
            {profile.tipo_parte === 'Fornecedor' && (
              <>
                <p style={{ margin: '4px 0 12px 0', fontSize: '0.8rem', color: '#aaa' }}>
                  Sua escolha inicial é <strong>Fornecedor (Gerador)</strong>. Habilite a Dupla Aptidão para atuar também como Comprador. Esta ação é definitiva.
                </p>
                <button
                  type="button"
                  onClick={() => handleUpdateTipoParte('Fornecedor / Comprador')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#121212',
                    color: '#ffd700',
                    border: '2px solid #ffd700',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 0 8px rgba(255, 215, 0, 0.1)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#ffd700';
                    e.currentTarget.style.color = '#000';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.4)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#121212';
                    e.currentTarget.style.color = '#ffd700';
                    e.currentTarget.style.boxShadow = '0 0 8px rgba(255, 215, 0, 0.1)';
                  }}
                >
                  ⚡ Habilitar Dupla Aptidão (Fornecedor + Comprador)
                </button>
              </>
            )}

            {profile.tipo_parte === 'Comprador' && (
              <>
                <p style={{ margin: '4px 0 12px 0', fontSize: '0.8rem', color: '#aaa' }}>
                  Sua escolha inicial é <strong>Comprador (Recicladora / Destinadora)</strong>. Habilite a Dupla Aptidão para atuar também como Fornecedor. Esta ação é definitiva.
                </p>
                <button
                  type="button"
                  onClick={() => handleUpdateTipoParte('Fornecedor / Comprador')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#121212',
                    color: '#ffd700',
                    border: '2px solid #ffd700',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 0 8px rgba(255, 215, 0, 0.1)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#ffd700';
                    e.currentTarget.style.color = '#000';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.4)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#121212';
                    e.currentTarget.style.color = '#ffd700';
                    e.currentTarget.style.boxShadow = '0 0 8px rgba(255, 215, 0, 0.1)';
                  }}
                >
                  ⚡ Habilitar Dupla Aptidão (Fornecedor + Comprador)
                </button>
              </>
            )}

            {(profile.tipo_parte === 'Fornecedor / Comprador' || profile.tipo_parte === 'Fornecedor e Comprador') && (
              <div style={{ marginTop: '10px' }}>
                <p style={{ margin: '4px 0 12px 0', fontSize: '0.8rem', color: '#aaa' }}>
                  Sua empresa possui aptidão dupla para operar em ambas as pontas do mercado de resíduos.
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(0, 255, 102, 0.05)',
                  border: '1.5px solid #00ff66',
                  borderRadius: '4px',
                  padding: '12px',
                  color: '#00ff66',
                  fontWeight: 'bold',
                  fontSize: '0.85rem'
                }}>
                  <CheckCircle size={18} />
                  <span>Dupla Aptidão Ativada com Sucesso (Fornecedor E Comprador)</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{
          background: 'rgba(8, 8, 8, 0.98)',
          border: '2px solid #ffd700',
          borderRadius: '8px',
          padding: '32px',
          boxShadow: '0 0 20px rgba(255, 215, 0, 0.15)',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', borderBottom: '1px solid rgba(255,215,0,0.15)', paddingBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffd700', marginBottom: '6px', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
                📤 Homologação Documental
              </h2>
              <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: 0 }}>
                Envie suas licenças e laudos operacionais para obter a certificação de Ficha Materra homologada.
              </p>
            </div>
            {profile.status_documentos === 'Verificado' || profile.status_documentos === 'Aprovado' ? (
              <div style={{ background: 'rgba(0, 255, 102, 0.1)', border: '1px solid #00ff66', color: '#00ff66', padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                ✓ Homologado
              </div>
            ) : (
              <div style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #ffd700', color: '#ffd700', padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                Status: {profile.status_documentos || 'Pendente'}
              </div>
            )}
          </div>

          {successMsg && (
            <div style={{ background: 'rgba(0, 255, 102, 0.1)', border: '1px solid #00ff66', color: '#00ff66', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '20px', fontWeight: 'bold' }}>
              {successMsg}
            </div>
          )}

          {/* Document list & upload items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* PRATA SECTION */}
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffd700', marginBottom: '12px', borderBottom: '1px solid rgba(255,215,0,0.2)', paddingBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                🥈 Requisitos Selo Prata
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {getRequiredDocsForUser().filter(d => d.level === 'Prata').map(doc => {
                  const uploadedDocs = (() => {
                    if (!profile?.documentos_recebidos) return {};
                    try {
                      return JSON.parse(profile.documentos_recebidos);
                    } catch (e) {
                      return {};
                    }
                  })();
                  const uploaded = uploadedDocs[doc.key];
                  const isSelected = activeDocType === doc.key;
                  return (
                    <div key={doc.key} style={{
                      background: 'rgba(15, 15, 15, 0.6)',
                      border: isSelected ? '1px solid #ffd700' : '1px solid #222',
                      borderRadius: '6px',
                      padding: '16px',
                      transition: 'all 0.2s'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.88rem', display: 'block' }}>{doc.label}</span>
                          <span style={{ color: '#888', fontSize: '0.78rem', marginTop: '2px', display: 'block' }}>{doc.description}</span>
                          {uploaded && (
                            <div style={{ marginTop: '8px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(0, 255, 102, 0.05)', borderLeft: '3px solid #00ff66', padding: '6px 10px', borderRadius: '0 4px 4px 0' }}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                                <span style={{ color: '#00ff66', fontWeight: 'bold' }}>✓ Enviado</span>
                                {uploaded.data_upload && <span style={{ color: '#666', fontSize: '0.72rem' }}>em {new Date(uploaded.data_upload).toLocaleDateString('pt-BR')}</span>}
                              </div>
                              <div style={{ color: '#ccc', display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontSize: '0.76rem' }}>
                                {uploaded.num && <span><strong>Número:</strong> {uploaded.num}</span>}
                                {uploaded.validade && <span><strong>Validade:</strong> {new Date(uploaded.validade + 'T00:00:00').toLocaleDateString('pt-BR')}</span>}
                                {uploaded.orgao && <span><strong>Órgão:</strong> {uploaded.orgao}</span>}
                                {uploaded.anoReferencia && <span><strong>Ano Ref:</strong> {uploaded.anoReferencia}</span>}
                                {uploaded.orgaoCertificador && <span><strong>Certificadora:</strong> {uploaded.orgaoCertificador}</span>}
                                {uploaded.seguradora && <span><strong>Seguradora:</strong> {uploaded.seguradora}</span>}
                                {uploaded.tipoAtividade && <span><strong>Tipo:</strong> {uploaded.tipoAtividade}</span>}
                                {uploaded.volumeMensal && <span><strong>Volume:</strong> {uploaded.volumeMensal}</span>}
                                {uploaded.tecnologia && <span><strong>Tecnologia:</strong> {uploaded.tecnologia}</span>}
                                {uploaded.placa && <span><strong>Placa:</strong> {uploaded.placa}</span>}
                                {uploaded.renavam && <span><strong>RENAVAM:</strong> {uploaded.renavam}</span>}
                                {uploaded.valorCobertura && <span><strong>Cobertura:</strong> {uploaded.valorCobertura}</span>}
                                {uploaded.mopp && <span style={{ color: '#ffd700' }}>⭐ CNH com MOPP ativo</span>}
                              </div>
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {uploaded && (
                            <a href={uploaded.url} target="_blank" rel="noreferrer" style={{ background: 'none', border: '1px solid #444', color: '#ccc', padding: '6px 12px', borderRadius: '4px', textDecoration: 'none', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center' }}>
                              Visualizar
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setActiveDocType('');
                                setDocFile(null);
                              } else {
                                setActiveDocType(doc.key);
                                setDocFile(null);
                                if (uploaded) {
                                  setDocNumber(uploaded.num || '');
                                  setDocValidity(uploaded.validade || '');
                                  setDocMoppChecked(!!uploaded.mopp);
                                  setDocOrgao(uploaded.orgao || '');
                                  setDocAnoReferencia(uploaded.anoReferencia || '');
                                  setDocOrgaoCertificador(uploaded.orgaoCertificador || '');
                                  setDocSeguradora(uploaded.seguradora || '');
                                  setDocTipoAtividade(uploaded.tipoAtividade || '');
                                  setDocVolumeMensal(uploaded.volumeMensal || '');
                                  setDocTecnologia(uploaded.tecnologia || '');
                                  setDocPlaca(uploaded.placa || '');
                                  setDocRenavam(uploaded.renavam || '');
                                  setDocValorCobertura(uploaded.valorCobertura || '');
                                } else {
                                  setDocNumber('');
                                  setDocValidity('');
                                  setDocMoppChecked(false);
                                  setDocOrgao('');
                                  setDocAnoReferencia('');
                                  setDocOrgaoCertificador('');
                                  setDocSeguradora('');
                                  setDocTipoAtividade('');
                                  setDocVolumeMensal('');
                                  setDocTecnologia('');
                                  setDocPlaca('');
                                  setDocRenavam('');
                                  setDocValorCobertura('');
                                }
                              }
                            }}
                            style={{
                              background: isSelected ? '#ffd700' : 'rgba(255, 215, 0, 0.1)',
                              border: '1px solid #ffd700',
                              color: isSelected ? '#000' : '#ffd700',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              fontSize: '0.78rem',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            {uploaded ? 'Atualizar' : 'Fazer Upload'}
                          </button>
                        </div>
                      </div>
                      
                      {renderUploadForm(doc.key)}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* OURO SECTION */}
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffd700', marginBottom: '12px', borderBottom: '1px solid rgba(255,215,0,0.2)', paddingBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                🥇 Requisitos Selo Ouro
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {getRequiredDocsForUser().filter(d => d.level === 'Ouro').map(doc => {
                  const uploadedDocs = (() => {
                    if (!profile?.documentos_recebidos) return {};
                    try {
                      return JSON.parse(profile.documentos_recebidos);
                    } catch (e) {
                      return {};
                    }
                  })();
                  const uploaded = uploadedDocs[doc.key];
                  const isSelected = activeDocType === doc.key;
                  return (
                    <div key={doc.key} style={{
                      background: 'rgba(15, 15, 15, 0.6)',
                      border: isSelected ? '1px solid #ffd700' : '1px solid #222',
                      borderRadius: '6px',
                      padding: '16px',
                      transition: 'all 0.2s'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.88rem', display: 'block' }}>{doc.label}</span>
                          <span style={{ color: '#888', fontSize: '0.78rem', marginTop: '2px', display: 'block' }}>{doc.description}</span>
                          {uploaded && (
                            <div style={{ marginTop: '8px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(0, 255, 102, 0.05)', borderLeft: '3px solid #00ff66', padding: '6px 10px', borderRadius: '0 4px 4px 0' }}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                                <span style={{ color: '#00ff66', fontWeight: 'bold' }}>✓ Enviado</span>
                                {uploaded.data_upload && <span style={{ color: '#666', fontSize: '0.72rem' }}>em {new Date(uploaded.data_upload).toLocaleDateString('pt-BR')}</span>}
                              </div>
                              <div style={{ color: '#ccc', display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontSize: '0.76rem' }}>
                                {uploaded.num && <span><strong>Número:</strong> {uploaded.num}</span>}
                                {uploaded.validade && <span><strong>Validade:</strong> {new Date(uploaded.validade + 'T00:00:00').toLocaleDateString('pt-BR')}</span>}
                                {uploaded.orgao && <span><strong>Órgão:</strong> {uploaded.orgao}</span>}
                                {uploaded.anoReferencia && <span><strong>Ano Ref:</strong> {uploaded.anoReferencia}</span>}
                                {uploaded.orgaoCertificador && <span><strong>Certificadora:</strong> {uploaded.orgaoCertificador}</span>}
                                {uploaded.seguradora && <span><strong>Seguradora:</strong> {uploaded.seguradora}</span>}
                                {uploaded.tipoAtividade && <span><strong>Tipo:</strong> {uploaded.tipoAtividade}</span>}
                                {uploaded.volumeMensal && <span><strong>Volume:</strong> {uploaded.volumeMensal}</span>}
                                {uploaded.tecnologia && <span><strong>Tecnologia:</strong> {uploaded.tecnologia}</span>}
                                {uploaded.placa && <span><strong>Placa:</strong> {uploaded.placa}</span>}
                                {uploaded.renavam && <span><strong>RENAVAM:</strong> {uploaded.renavam}</span>}
                                {uploaded.valorCobertura && <span><strong>Cobertura:</strong> {uploaded.valorCobertura}</span>}
                                {uploaded.mopp && <span style={{ color: '#ffd700' }}>⭐ CNH com MOPP ativo</span>}
                              </div>
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {uploaded && (
                            <a href={uploaded.url} target="_blank" rel="noreferrer" style={{ background: 'none', border: '1px solid #444', color: '#ccc', padding: '6px 12px', borderRadius: '4px', textDecoration: 'none', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center' }}>
                              Visualizar
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setActiveDocType('');
                                setDocFile(null);
                              } else {
                                setActiveDocType(doc.key);
                                setDocFile(null);
                                if (uploaded) {
                                  setDocNumber(uploaded.num || '');
                                  setDocValidity(uploaded.validade || '');
                                  setDocMoppChecked(!!uploaded.mopp);
                                  setDocOrgao(uploaded.orgao || '');
                                  setDocAnoReferencia(uploaded.anoReferencia || '');
                                  setDocOrgaoCertificador(uploaded.orgaoCertificador || '');
                                  setDocSeguradora(uploaded.seguradora || '');
                                  setDocTipoAtividade(uploaded.tipoAtividade || '');
                                  setDocVolumeMensal(uploaded.volumeMensal || '');
                                  setDocTecnologia(uploaded.tecnologia || '');
                                  setDocPlaca(uploaded.placa || '');
                                  setDocRenavam(uploaded.renavam || '');
                                  setDocValorCobertura(uploaded.valorCobertura || '');
                                } else {
                                  setDocNumber('');
                                  setDocValidity('');
                                  setDocMoppChecked(false);
                                  setDocOrgao('');
                                  setDocAnoReferencia('');
                                  setDocOrgaoCertificador('');
                                  setDocSeguradora('');
                                  setDocTipoAtividade('');
                                  setDocVolumeMensal('');
                                  setDocTecnologia('');
                                  setDocPlaca('');
                                  setDocRenavam('');
                                  setDocValorCobertura('');
                                }
                              }
                            }}
                            style={{
                              background: isSelected ? '#ffd700' : 'rgba(255, 215, 0, 0.1)',
                              border: '1px solid #ffd700',
                              color: isSelected ? '#000' : '#ffd700',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              fontSize: '0.78rem',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            {uploaded ? 'Atualizar' : 'Fazer Upload'}
                          </button>
                        </div>
                      </div>
                      
                      {renderUploadForm(doc.key)}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
