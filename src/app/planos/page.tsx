'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Check, X, RefreshCw, AlertTriangle, CheckCircle, ArrowLeft,
  CreditCard, Shield, HelpCircle, TrendingUp, TrendingDown, Minus, Award
} from 'lucide-react';

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

export default function PlanosPage() {
  const supabase = createClient();

  // Real Supabase User & Profile States
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Version control: 'anunciante' | 'transportadora'
  const [version, setVersion] = useState<'anunciante' | 'transportadora'>('anunciante');
  
  // Period control: 1 | 3 | 6 | 12 (months)
  const [period, setPeriod] = useState<1 | 3 | 6 | 12>(1);

  // Mock authentication toggle for testing both flows
  const [simulatedLoggedIn, setSimulatedLoggedIn] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  // Modal control states
  const [signupPromptModal, setSignupPromptModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [paymentStep, setPaymentStep] = useState<'idle' | 'confirm' | 'loading' | 'success' | 'error'>('idle');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao' | 'boleto'>('pix');
  const [autoBilling, setAutoBilling] = useState(true);

  // Load user data from Supabase
  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setSimulatedLoggedIn(true);
        const { data } = await supabase
          .from('cadastros')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (data) {
          setProfile(data);
          if (data.tipo_parte === 'Transportadora') {
            setVersion('transportadora');
          } else if (['Fornecedor', 'Comprador', 'Controlador'].includes(data.tipo_parte)) {
            setVersion('anunciante');
          }
          
          let activePlanName = null;
          if (data.plano && data.plano !== 'true' && data.plano !== 'false' && data.plano !== 'Pago' && data.plano !== 'Free') {
            activePlanName = data.plano;
          } else if (data.plano_ativo && data.plano_ativo !== 'true' && data.plano_ativo !== 'false') {
            activePlanName = data.plano_ativo;
          } else if (data.plano_ativo === true || data.plano_ativo === 'true') {
            activePlanName = data.tipo_parte === 'Transportadora' ? 'Intermediário' : 'Starter';
          }
          setCurrentPlan(activePlanName);
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Reset states when version changes
  useEffect(() => {
    setPaymentStep('idle');
    setSelectedPlan(null);
  }, [version]);

  // Transaction History State
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    // Generate combined history (Mock + LocalStorage + Supabase)
    const mockTx = version === 'anunciante' ? [
      {
        id: 'TX-98212',
        data: '2026-06-01 09:14',
        descricao: 'Assinatura Plano Starter (Mensal)',
        tipo: 'plano',
        cupom: 'B2B5',
        valor_original: 49,
        valor_desconto: 5,
        valor_pago: 44,
        status: 'EFETIVADO',
        metodo: 'Pix',
        link: null
      },
      {
        id: 'TX-97541',
        data: '2026-06-12 18:45',
        descricao: 'Taxa Lead - Sucata de Alumínio (#AL-201)',
        tipo: 'lead',
        cupom: 'PRATARECO',
        valor_original: 20,
        valor_desconto: 4,
        valor_pago: 16,
        status: 'EFETIVADO',
        metodo: 'Pix',
        link: '/sala?id=demo_room'
      },
      {
        id: 'TX-96872',
        data: '2026-06-18 10:30',
        descricao: 'Taxa Lead - Cobre Moído (#CO-440)',
        tipo: 'lead',
        cupom: null,
        valor_original: 20,
        valor_desconto: 0,
        valor_pago: 20,
        status: 'EFETIVADO',
        metodo: 'Pix',
        link: '/sala?id=demo_room'
      }
    ] : [
      {
        id: 'TX-88219',
        data: '2026-05-15 11:22',
        descricao: 'Assinatura Plano Intermediário (Mensal)',
        tipo: 'plano',
        cupom: 'LOGOUTUBRO',
        valor_original: 49,
        valor_desconto: 9,
        valor_pago: 40,
        status: 'EFETIVADO',
        metodo: 'Pix',
        link: null
      },
      {
        id: 'TX-87552',
        data: '2026-06-20 16:10',
        descricao: 'Taxa de Entrada Leilão de Frete - Rota SP -> Campinas (#FR-102)',
        tipo: 'frete',
        cupom: null,
        valor_original: 30,
        valor_desconto: 0,
        valor_pago: 30,
        status: 'EFETIVADO',
        metodo: 'Pix',
        link: '/frete?id=demo_freight'
      }
    ];

    // Load active negotiations from localStorage to dynamically insert them
    try {
      const activeRoomsStr = localStorage.getItem('materra_active_negotiations') || '[]';
      const activeRooms = JSON.parse(activeRoomsStr);
      const localTxs = activeRooms.map((room: any, index: number) => {
        const leadVal = room.taxa_lead_valor || 20;
        return {
          id: `TX-LOC${100 + index}`,
          data: new Date(room.created_at || Date.now()).toISOString().replace('T', ' ').substring(0, 16),
          descricao: `Taxa Lead - Sala de Negociação #${room.id.substring(0, 6)} (Anúncio #${room.id_anuncio || 'DEMO'})`,
          tipo: 'lead',
          cupom: null,
          valor_original: leadVal,
          valor_desconto: 0,
          valor_pago: leadVal,
          status: room.status === 'Rejeitada' ? 'ESTORNADO' : 'EFETIVADO',
          metodo: 'Pix',
          link: `/sala?id=${room.id}`
        };
      });

      let localFreightTxs: any[] = [];
      if (version === 'transportadora') {
        const activeAuctionsStr = localStorage.getItem('materra_freight_auctions') || '[]';
        const activeAuctions = JSON.parse(activeAuctionsStr);
        localFreightTxs = activeAuctions.map((auc: any, index: number) => {
          return {
            id: `TX-LOC-FR${100 + index}`,
            data: new Date(auc.data_inicio_leilao || Date.now()).toISOString().replace('T', ' ').substring(0, 16),
            descricao: `Participação em Leilão Reverso #${auc.id.substring(0, 6)} (${auc.origem_mun}, ${auc.origem_uf} → ${auc.destino_mun}, ${auc.destino_uf})`,
            tipo: 'frete',
            cupom: null,
            valor_original: 30,
            valor_desconto: 0,
            valor_pago: 30,
            status: 'EFETIVADO',
            metodo: 'Pix',
            link: `/frete?id=${auc.id}`
          };
        });
      }

      setHistory([...localTxs, ...localFreightTxs, ...mockTx]);
    } catch (e) {
      setHistory(mockTx);
    }
  }, [version]);

  // Discounts based on period
  const getDiscountMultiplier = (m: number) => {
    if (m === 3) return 0.95;  // 5% discount
    if (m === 6) return 0.92;  // 8% discount
    if (m === 12) return 0.88; // 12% discount
    return 1.0;
  };

  const getPrice = (base: number) => {
    if (base === 0) return 0;
    const discountedMonthly = base * getDiscountMultiplier(period);
    return Math.round(discountedMonthly);
  };

  const getPeriodLabel = () => {
    if (period === 3) return 'trimestral';
    if (period === 6) return 'semestral';
    if (period === 12) return 'anual';
    return 'mensal';
  };

  // Plan lists
  const PLANOS_ANUNCIANTE = [
    {
      id: 'anunciante_gratis',
      nome: 'Gratuito',
      anuncios: '1 Anúncio por mês',
      basePrice: 0,
      features: [
        { label: 'Publique 1 anúncio de oferta ou demanda para o seu negócio', included: true },
        { label: 'Buscar e visualizar anúncios na plataforma', included: true },
        { label: 'Taxa Lead: R$ 20 por sala de negociação de terceiros acessada', included: true },
        { label: 'Cotação de Transporte: R$ 30 por leilão reverso de frete iniciado', included: true },
        { label: 'Geração de Materra Score e Selos de Compliance nativos', included: true },
        { label: 'Histórico com trilha de Auditoria digital de suas operações', included: true },
        { label: 'Consulta de fichas corporativas no buscador', included: false },
        { label: 'Avaliações e histórico de reputação de terceiros', included: false }
      ],
      btnText: 'Usar Plano Gratuito',
      nota: 'Plano de entrada, ideal para testar a plataforma.',
      recommended: false
    },
    {
      id: 'anunciante_starter',
      nome: 'Starter',
      anuncios: '5 Anúncios por mês',
      basePrice: 49,
      features: [
        { label: 'Publique até 5 anúncios de oferta ou demanda por mês', included: true },
        { label: 'Permitido até 10 consultas de fichas corporativas no buscador', included: true },
        { label: 'Buscar e visualizar anúncios na plataforma', included: true },
        { label: 'Taxa Lead com Desconto: R$ 18 por sala de negociação de terceiros acessada', included: true },
        { label: 'Cotação de Transporte: R$ 30 por leilão reverso de frete iniciado', included: true },
        { label: 'Geração de Materra Score e Selos de Compliance nativos', included: true },
        { label: 'Histórico com trilha de Auditoria digital de suas operações', included: true },
        { label: 'Suporte por e-mail', included: true },
        { label: 'Avaliações e histórico de reputação de terceiros', included: false }
      ],
      btnText: 'Escolher Plano Starter',
      nota: 'Faça o levantamento de ofertas e/ou demandas de seu negócio e publique até 5 anúncios.',
      recommended: false
    },
    {
      id: 'anunciante_growth',
      nome: 'Growth',
      anuncios: '20 Anúncios por mês',
      basePrice: 129,
      features: [
        { label: 'Publique até 20 anúncios de oferta ou demanda por mês', included: true },
        { label: 'Permitido até 10 consultas de fichas corporativas no buscador', included: true },
        { label: 'Buscar e visualizar anúncios na plataforma', included: true },
        { label: 'Taxa Lead Otimizada: R$ 16 por sala de negociação de terceiros acessada', included: true },
        { label: 'Cotação de Transporte: R$ 30 por leilão reverso de frete iniciado', included: true },
        { label: 'Módulo Reputação: Veja avaliações reais de terceiros que já negociaram com o anunciante', included: true },
        { label: 'Módulo Logística: Veja a nota e o histórico da transportadora na hora da cotação', included: true },
        { label: 'Geração de Materra Score e Selos de Compliance nativos', included: true },
        { label: 'Histórico com trilha de Auditoria digital de suas operações', included: true },
        { label: 'Suporte por e-mail e WhatsApp', included: true }
      ],
      btnText: 'Escolher Plano Growth',
      nota: 'Faça o levantamento de ofertas e/ou demandas de seu negócio e publique até 20 anúncios.',
      recommended: true
    },
    {
      id: 'anunciante_business',
      nome: 'Business',
      anuncios: '100 Anúncios por mês',
      basePrice: 299,
      features: [
        { label: 'Publique até 100 anúncios de oferta ou demanda por mês', included: true },
        { label: 'Permitido até 10 consultas de fichas corporativas no buscador', included: true },
        { label: 'Buscar e visualizar anúncios na plataforma', included: true },
        { label: 'Taxa Lead Mínima: R$ 14 por sala de negociação de terceiros acessada', included: true },
        { label: 'Cotação de Transporte: R$ 30 por leilão reverso de frete iniciado', included: true },
        { label: 'Módulo Reputação: Veja avaliações reais de terceiros que já negociaram com o anunciante', included: true },
        { label: 'Módulo Logística: Veja a nota e o histórico da transportadora na hora da cotação', included: true },
        { label: 'Geração de Materra Score e Selos de Compliance nativos', included: true },
        { label: 'Histórico com trilha de Auditoria digital de suas operações', included: true },
        { label: 'Suporte prioritário (e-mail, WhatsApp e telefone)', included: true }
      ],
      btnText: 'Escolher Plano Business',
      nota: 'Faça o levantamento de ofertas e/ou demandas de seu negócio e publique até 100 anúncios.',
      recommended: false
    }
  ];

  const PLANOS_TRANSPORTADORA = [
    {
      id: 'trans_gratis',
      nome: 'Gratuito',
      convites: '1 Convite GRÁTIS',
      basePrice: 0,
      features: [
        { label: '1 convite grátis para Leilão Reverso', included: true },
        { label: 'Participar em leilões reversos', included: true },
        { label: 'Ver preços de concorrentes em tempo real', included: true },
        { label: 'Convites ilimitados', included: false },
        { label: 'Prioridade em leilões', included: false }
      ],
      btnText: 'Usar Plano Gratuito',
      nota: 'Você recebe 1 convite grátis até ser selecionada uma vez.',
      extraNota: 'IMPORTANTE: Este plano desaparece após primeira seleção!',
      recommended: false
    },
    {
      id: 'trans_intermediario',
      nome: 'Intermediário',
      convites: '5 Convites por mês',
      basePrice: 49,
      features: [
        { label: 'Até 5 convites por mês a Leilões', included: true },
        { label: 'Participar em leilões reversos', included: true },
        { label: 'Ver preços de concorrentes em tempo real', included: true },
        { label: 'Editar preço durante leilão', included: true },
        { label: 'Suporte por email', included: true },
        { label: 'Convites ilimitados', included: false },
        { label: 'Prioridade em leilões', included: false }
      ],
      btnText: 'Escolher Plano Intermediário',
      nota: 'Convites não usados expiram. Para transportadoras moderadas.',
      recommended: false
    },
    {
      id: 'trans_pro',
      nome: 'Pro',
      convites: 'Convites ILIMITADOS',
      basePrice: 89,
      features: [
        { label: 'Convites ilimitados por mês', included: true },
        { label: 'Participar em TODOS os leilões reversos', included: true },
        { label: 'Ver preços de concorrentes em tempo real', included: true },
        { label: 'Editar preço durante leilão', included: true },
        { label: 'Prioridade em leilões (primeira da lista)', included: true },
        { label: 'Suporte (email, WhatsApp e telefone)', included: true },
        { label: 'Relatórios avançados de desempenho', included: true },
        { label: '1º leilão do mês GRÁTIS', included: true }
      ],
      btnText: 'Escolher Plano Pro',
      nota: 'Melhor para máxima participação e crescimento.',
      recommended: true
    }
  ];

  const activePlans = version === 'anunciante' ? PLANOS_ANUNCIANTE : PLANOS_TRANSPORTADORA;

  const handlePlanSelection = (plano: any) => {
    if (!user && !simulatedLoggedIn) {
      setSignupPromptModal(true);
    } else {
      setSelectedPlan(plano);
      setPaymentStep('confirm');
    }
  };

  const executePayment = () => {
    setPaymentStep('loading');
    setTimeout(async () => {
      const isSuccess = Math.random() > 0.1; // 90% success
      if (isSuccess) {
        setCurrentPlan(selectedPlan.nome);
        setPaymentStep('success');

        // Update active plan on Supabase if the user is authenticated
        if (user) {
          try {
            await supabase
              .from('cadastros')
              .update({
                plano_ativo: selectedPlan.nome,
                plano: selectedPlan.nome
              })
              .eq('id', user.id);
          } catch (err) {
            console.error('Failed to sync plan with Supabase:', err);
          }
        }
      } else {
        setPaymentStep('error');
      }
    }, 2000);
  };

  if (loading) {
    return (
      <div style={{ justifyContent: 'center', alignItems: 'center', background: '#000', minHeight: '100vh', display: 'flex' }}>
        <p style={{ color: '#aaa', fontFamily: 'sans-serif' }}>Carregando planos...</p>
      </div>
    );
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
      <div className="ambient-glow-gold" style={{ top: '10%', left: '-10%' }} />
      <div className="ambient-glow-gold" style={{ bottom: '10%', right: '-10%', opacity: 0.3 }} />

      {/* Top Banner for Wireframe Controls */}
      <div style={{
        background: 'rgba(17, 17, 17, 0.95)',
        borderBottom: '1px solid rgba(255, 215, 0, 0.2)',
        color: '#fff',
        padding: '10px 24px',
        fontSize: '0.8rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1001,
        fontFamily: 'var(--font-mono)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontWeight: 'bold',
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid var(--primary)',
            color: 'var(--primary)',
            padding: '2px 8px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            fontSize: '0.7rem'
          }}>
            WIRE-PANEL
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>Configuração de teste:</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--accent)' }}>
            <input
              type="checkbox"
              checked={simulatedLoggedIn}
              onChange={e => setSimulatedLoggedIn(e.target.checked)}
              style={{ accentColor: 'var(--accent)' }}
            />
            Simular Usuário Logado
          </label>
          {simulatedLoggedIn && (
            <button
              onClick={() => setCurrentPlan(null)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'var(--primary)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.background = 'rgba(255, 215, 0, 0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              Resetar Plano Atual
            </button>
          )}
        </div>
      </div>

      {/* Header */}
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
            <ArrowLeft size={16} /> Voltar ao Início
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '40px auto 80px', padding: '0 24px', width: '100%', flex: 1, zIndex: 1 }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-heading)',
            marginBottom: '12px',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase'
          }}>
            Escolha o Plano Ideal para sua Operação
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Aumente sua produtividade, otimize seus custos de transporte e garanta conformidade ambiental com a infraestrutura Materra Elo.
          </p>
        </div>

        {/* Version Switcher (Tabs) */}
        {!profile && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              padding: '4px',
              display: 'flex',
              gap: '4px'
            }}>
              <button
                onClick={() => setVersion('anunciante')}
                style={{
                  border: 'none',
                  background: version === 'anunciante' ? 'var(--primary)' : 'transparent',
                  color: version === 'anunciante' ? '#000000' : 'var(--text-secondary)',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: version === 'anunciante' ? '0 0 10px rgba(255,215,0,0.15)' : 'none'
                }}
              >
                Anunciantes (Geradores e Compradores)
              </button>
              <button
                onClick={() => setVersion('transportadora')}
                style={{
                  border: 'none',
                  background: version === 'transportadora' ? 'var(--primary)' : 'transparent',
                  color: version === 'transportadora' ? '#000000' : 'var(--text-secondary)',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: version === 'transportadora' ? '0 0 10px rgba(255,215,0,0.15)' : 'none'
                }}
              >
                Transportadoras
              </button>
            </div>
          </div>
        )}

        {/* Period Switcher (Tabs) */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px', alignItems: 'center', gap: '16px', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Período de Assinatura:</span>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.01)',
            borderRadius: '8px',
            padding: '2px',
            display: 'inline-flex',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            {[
              { m: 1, label: '1 Mês' },
              { m: 3, label: '3 Meses (5% desc.)' },
              { m: 6, label: '6 Meses (8% desc.)' },
              { m: 12, label: '12 Meses (12% desc.)' }
            ].map(tab => (
              <button
                key={tab.m}
                onClick={() => setPeriod(tab.m as any)}
                style={{
                  border: 'none',
                  background: period === tab.m ? 'rgba(255, 215, 0, 0.08)' : 'transparent',
                  borderBottom: period === tab.m ? '2px solid var(--accent)' : 'none',
                  color: period === tab.m ? 'var(--accent)' : 'var(--text-secondary)',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-body)',
                  fontWeight: period === tab.m ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plans Grid layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: version === 'anunciante' 
            ? 'repeat(auto-fit, minmax(260px, 1fr))' 
            : 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px',
          alignItems: 'stretch',
          marginBottom: '60px'
        }}>
          {activePlans.map(plano => {
            const isSelectedPlanCurrent = currentPlan === plano.nome;
            const computedPrice = getPrice(plano.basePrice);

            return (
              <div
                key={plano.id}
                style={{
                  background: 'var(--surface)',
                  border: isSelectedPlanCurrent 
                    ? '1px solid #00FF66' 
                    : plano.recommended 
                      ? '1px solid var(--primary)' 
                      : '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '32px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isSelectedPlanCurrent 
                    ? '0 0 20px rgba(0, 255, 102, 0.08)' 
                    : plano.recommended 
                      ? '0 0 15px rgba(255, 215, 0, 0.15)' 
                      : 'none',
                  minHeight: '480px'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = isSelectedPlanCurrent
                    ? '#00FF66'
                    : 'var(--accent)';
                  e.currentTarget.style.boxShadow = isSelectedPlanCurrent
                    ? '0 0 25px rgba(0, 255, 102, 0.15)'
                    : '0 0 20px rgba(255, 215, 0, 0.25)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = isSelectedPlanCurrent
                    ? '#00FF66'
                    : plano.recommended 
                      ? 'var(--primary)' 
                      : 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.boxShadow = isSelectedPlanCurrent 
                    ? '0 0 20px rgba(0, 255, 102, 0.08)' 
                    : plano.recommended 
                      ? '0 0 15px rgba(255, 215, 0, 0.15)' 
                      : 'none';
                }}
              >
                {/* Recommended Badge */}
                {plano.recommended && (
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(255, 215, 0, 0.1)',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 'bold',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    RECOMENDADO
                  </span>
                )}

                {/* Plan header details */}
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)',
                    margin: 0
                  }}>
                    {plano.nome}
                  </h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{plano.nota}</div>
                </div>

                {/* Deliverables detail */}
                <div style={{
                  fontSize: '20px',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 'bold',
                  color: 'var(--accent)',
                  marginBottom: '16px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  paddingBottom: '16px',
                  letterSpacing: '-0.01em'
                }}>
                  {'anuncios' in plano ? plano.anuncios : plano.convites}
                </div>

                {/* Price block */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', color: 'var(--primary)' }}>
                    <span style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', marginRight: '4px' }}>R$</span>
                    <span style={{ fontSize: '44px', fontFamily: 'var(--font-mono)', fontWeight: 'bold', lineHeight: 1 }}>{computedPrice}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '6px' }}>/ mês</span>
                  </div>
                  {plano.basePrice > 0 && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      color: 'var(--accent)',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginTop: '6px',
                      marginBottom: '2px',
                      background: 'rgba(255, 215, 0, 0.05)',
                      border: '1px solid rgba(255, 215, 0, 0.2)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      ⚡ Exclusivo via Pix
                    </div>
                  )}
                  {period > 1 && plano.basePrice > 0 && (
                    <div style={{ fontSize: '12px', color: '#00FF66', fontWeight: 'bold', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                      Cobrado R$ {computedPrice * period} a cada {period} meses
                    </div>
                  )}
                </div>

                {/* Features List */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {plano.features.map((feat, fIdx) => (
                    <li key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px' }}>
                      {feat.included ? (
                        <Check size={14} style={{ color: '#00FF66', flexShrink: 0, marginTop: '2px' }} />
                      ) : (
                        <X size={14} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} />
                      )}
                      <span style={{ color: feat.included ? 'var(--text-primary)' : 'var(--text-secondary)', textDecoration: feat.included ? 'none' : 'line-through' }}>
                        {feat.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Extra warning message for specific plans */}
                {'extraNota' in plano && (
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--danger)',
                    fontWeight: 'bold',
                    marginBottom: '16px',
                    background: 'rgba(255, 77, 0, 0.05)',
                    border: '1px solid rgba(255, 77, 0, 0.1)',
                    padding: '8px 10px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {plano.extraNota}
                  </div>
                )}

                {/* Choose button */}
                <div style={{ marginTop: 'auto' }}>
                  {isSelectedPlanCurrent ? (
                    <div style={{
                      textAlign: 'center',
                      background: 'rgba(0, 255, 102, 0.03)',
                      border: '1px solid #00FF66',
                      color: '#00FF66',
                      padding: '12px 20px',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      fontFamily: 'var(--font-heading)',
                      letterSpacing: '0.05em'
                    }}>
                      SEU PLANO ATUAL
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePlanSelection(plano)}
                      style={{
                        width: '100%',
                        padding: '12px 20px',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        fontFamily: 'var(--font-heading)',
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: plano.recommended ? 'var(--primary)' : 'transparent',
                        border: plano.recommended ? '1px solid var(--primary)' : '1px solid var(--accent)',
                        color: plano.recommended ? '#000000' : 'var(--accent)',
                        boxShadow: plano.recommended ? '0 0 10px rgba(255,215,0,0.15)' : 'none',
                        textTransform: 'uppercase'
                      }}
                      onMouseEnter={e => {
                        if (plano.recommended) {
                          e.currentTarget.style.background = '#ffffff';
                          e.currentTarget.style.borderColor = '#ffffff';
                          e.currentTarget.style.boxShadow = '0 0 25px rgba(255,215,0,0.3)';
                        } else {
                          e.currentTarget.style.background = 'rgba(255, 215, 0, 0.05)';
                          e.currentTarget.style.boxShadow = '0 0 25px rgba(255,215,0,0.3)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (plano.recommended) {
                          e.currentTarget.style.background = 'var(--primary)';
                          e.currentTarget.style.borderColor = 'var(--primary)';
                          e.currentTarget.style.boxShadow = '0 0 10px rgba(255,215,0,0.15)';
                        } else {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = 'var(--accent)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {currentPlan ? 'Mudar Para Este Plano' : plano.btnText}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* LEDGER / TRANSACTIONS HISTORY TERMINAL */}
        <section style={{
          background: '#09090b',
          border: '1px solid rgba(255, 215, 0, 0.25)',
          padding: '24px',
          marginBottom: '60px',
          borderRadius: '2px',
          position: 'relative'
        }}>
          {/* Neon Glow Active Border Indicator */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--primary), transparent)'
          }} />

          {/* Header HUD */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'var(--primary)',
                fontFamily: 'var(--font-heading)',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#00FF66', boxShadow: '0 0 8px #00FF66' }} />
                LEDGER FINANCEIRO & CONTATOS LIBERADOS
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Histórico de pagamentos de planos, uso de cupons, taxas lead de negociação e leilões de logística.
              </p>
            </div>
            
            {/* Quick Stats Grid */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '2px', textAlign: 'right' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Transacionado</div>
                <div style={{ fontSize: '16px', color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                  R$ {history.reduce((acc, item) => acc + item.valor_pago, 0).toFixed(2)}
                </div>
              </div>
              <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '2px', textAlign: 'right' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Economia com Cupons</div>
                <div style={{ fontSize: '16px', color: '#00FF66', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                  R$ {history.reduce((acc, item) => acc + (item.valor_desconto || 0), 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="table-responsive" style={{ overflowX: 'auto', background: '#111', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '2px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 215, 0, 0.05)', borderBottom: '1px solid rgba(255, 215, 0, 0.15)' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--primary)', fontWeight: 'bold', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>Hash/ID</th>
                  <th style={{ padding: '12px 16px', color: 'var(--primary)', fontWeight: 'bold', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>Data</th>
                  <th style={{ padding: '12px 16px', color: 'var(--primary)', fontWeight: 'bold', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>Descrição / Origem</th>
                  <th style={{ padding: '12px 16px', color: 'var(--primary)', fontWeight: 'bold', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>Cupom</th>
                  <th style={{ padding: '12px 16px', color: 'var(--primary)', fontWeight: 'bold', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>Valor Pago</th>
                  <th style={{ padding: '12px 16px', color: 'var(--primary)', fontWeight: 'bold', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '12px 16px', color: 'var(--primary)', fontWeight: 'bold', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em', textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      NENHUMA TRANSAÇÃO REGISTRADA NO LEDGER DO USUÁRIO.
                    </td>
                  </tr>
                ) : (
                  history.map((tx) => (
                    <tr 
                      key={tx.id} 
                      className="border-b border-white/[0.03] hover:bg-yellow-400/[0.02] hover:text-white transition-colors"
                    >
                      {/* ID Hash */}
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        {tx.id}
                      </td>
                      {/* Date */}
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        {tx.data}
                      </td>
                      {/* Description */}
                      <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            fontSize: '9px', 
                            padding: '2px 6px', 
                            background: tx.tipo === 'plano' ? 'rgba(0, 150, 255, 0.1)' : tx.tipo === 'lead' ? 'rgba(255, 215, 0, 0.1)' : 'rgba(0, 255, 102, 0.1)', 
                            border: `1px solid ${tx.tipo === 'plano' ? 'rgba(0, 150, 255, 0.3)' : tx.tipo === 'lead' ? 'rgba(255, 215, 0, 0.3)' : 'rgba(0, 255, 102, 0.3)'}`,
                            color: tx.tipo === 'plano' ? '#0096ff' : tx.tipo === 'lead' ? 'var(--primary)' : '#00FF66',
                            textTransform: 'uppercase',
                            fontFamily: 'var(--font-mono)',
                            borderRadius: '1px'
                          }}>
                            {tx.tipo}
                          </span>
                          {tx.descricao}
                        </div>
                      </td>
                      {/* Coupon */}
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)' }}>
                        {tx.cupom ? (
                          <span style={{ color: 'var(--accent)', background: 'rgba(255, 215, 0, 0.05)', border: '1px solid rgba(255, 215, 0, 0.15)', padding: '2px 6px', borderRadius: '1px' }}>
                            {tx.cupom} (-R${tx.valor_desconto})
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      {/* Price */}
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                        R$ {tx.valor_pago.toFixed(2)}
                      </td>
                      {/* Status */}
                      <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                        <span style={{ 
                          color: tx.status === 'EFETIVADO' ? '#00FF66' : tx.status === 'ESTORNADO' ? 'var(--danger)' : 'var(--text-secondary)'
                        }}>
                          ● {tx.status}
                        </span>
                      </td>
                      {/* Action */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {tx.link ? (
                          <Link
                            href={tx.link}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'transparent',
                              border: '1px solid var(--primary)',
                              color: 'var(--primary)',
                              padding: '6px 12px',
                              borderRadius: '2px',
                              fontSize: '11px',
                              fontFamily: 'var(--font-heading)',
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              textDecoration: 'none',
                              letterSpacing: '0.05em',
                              transition: 'all 0.2s',
                              boxShadow: 'none'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'var(--primary)';
                              e.currentTarget.style.color = '#000';
                              e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.3)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = 'var(--primary)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            Entrar na Sala &rarr;
                          </Link>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Sem Ação Requerida</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Footnote details */}
        <section style={{
          background: 'var(--surface)',
          borderRadius: '12px',
          padding: '32px',
          border: '1px solid rgba(255, 255, 255, 0.04)'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: 'var(--primary)',
            fontFamily: 'var(--font-heading)',
            marginBottom: '20px',
            borderLeft: '3px solid var(--primary)',
            paddingLeft: '12px',
            textTransform: 'uppercase'
          }}>
            Informações importantes
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>

            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '6px', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>Política de cobrança</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Renovamos automaticamente todo mês na mesma data. Você pode cancelar a qualquer momento.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '6px', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>Sem contrato</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Faça upgrade ou downgrade quando quiser. Sem punições ou taxas de cancelamento.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '6px', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>Descontos Progressivos</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Assinaturas de 3, 6 ou 12 meses têm desconto progressivo (5% a 12%).
              </p>
              <button
                onClick={() => alert('Os descontos progressivos (5% trimestral, 8% semestral e 12% anual) são aplicados automaticamente na finalização do pedido.')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  padding: 0,
                  marginTop: '8px',
                  textDecoration: 'underline',
                  fontFamily: 'var(--font-body)'
                }}
              >
                Ver tabela completa de descontos
              </button>
            </div>
          </div>
        </section>

        {/* Botão de Retorno */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'var(--primary)',
            border: '1px solid var(--primary)',
            background: 'transparent',
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255, 215, 0, 0.05)';
            e.currentTarget.style.boxShadow = '0 0 15px rgba(255,215,0,0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <ArrowLeft size={16} /> Voltar ao Início
          </Link>
        </div>
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

      {/* ============================================================
         MODALS (Styled in Materra Elo Dark Mode)
         ============================================================ */}

      {/* Modal: Unlogged Signup Prompt */}
      {signupPromptModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div className="modal-content" style={{
            background: '#0a0a0a',
            border: '1px solid rgba(255, 215, 0, 0.15)',
            borderRadius: '8px',
            padding: '32px',
            maxWidth: '420px',
            width: '90%',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            zIndex: 100000,
            textAlign: 'center'
          }}>
            <button 
              onClick={() => setSignupPromptModal(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '24px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <LogoGlobe size={48} />
            </div>
            <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginTop: '16px', marginBottom: '8px' }}>
              Faça login para assinar
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
              Para selecionar e assinar um plano, ou aproveitar o período grátis, você precisa primeiro criar sua conta corporativa na Materra Elo.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/auth/cadastro" className="btn btn-primary" style={{ padding: '12px', textDecoration: 'none', display: 'block', fontSize: '13px', textAlign: 'center', color: '#000', fontWeight: 'bold' }}>
                Fazer Cadastro / Login
              </Link>
              <button
                onClick={() => setSignupPromptModal(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-secondary)',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-heading)'
                }}
              >
                Voltar aos Planos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmation payment workflow */}
      {selectedPlan && paymentStep === 'confirm' && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div className="modal-content" style={{
            background: '#0a0a0a',
            border: '1px solid rgba(255, 215, 0, 0.15)',
            borderRadius: '8px',
            padding: '32px',
            maxWidth: '480px',
            width: '90%',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            zIndex: 100000
          }}>
            <button 
              onClick={() => setSelectedPlan(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '24px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginBottom: '16px' }}>
              Confirmar Assinatura
            </h3>
            
            {/* Plan Summary */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '6px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Plano {selectedPlan.nome}</span>
                <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                  R$ {getPrice(selectedPlan.basePrice)} / mês
                </span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Ciclo de cobrança: <strong style={{ color: 'var(--text-primary)' }}>{getPeriodLabel()}</strong>
              </div>
              {period > 1 && (
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Valor total da fatura: <strong style={{ color: '#00FF66', fontFamily: 'var(--font-mono)' }}>R$ {getPrice(selectedPlan.basePrice) * period}</strong>
                </div>
              )}
            </div>

            {/* Payment Method Info */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>
                Forma de Pagamento
              </label>
              <div style={{
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid var(--accent)',
                background: 'rgba(255, 215, 0, 0.04)',
                color: 'var(--accent)',
                fontWeight: 'bold',
                fontSize: '13px',
                fontFamily: 'var(--font-heading)',
                textAlign: 'center',
                letterSpacing: '0.05em'
              }}>
                ⚡ Exclusivo via Pix
              </div>
            </div>

            {/* Automatic charge authorization */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={autoBilling}
                  onChange={e => setAutoBilling(e.target.checked)}
                  style={{ marginTop: '3px', accentColor: 'var(--accent)' }}
                />
                <span>Autorizo cobrança automática recorrente nas mesmas condições.</span>
              </label>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={executePayment}
                className="btn btn-primary"
                style={{ flex: 2, padding: '12px', fontSize: '13px' }}
              >
                Confirmar Pagamento
              </button>
              <button
                onClick={() => setSelectedPlan(null)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-secondary)',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-heading)'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Loading Spinner */}
      {paymentStep === 'loading' && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div className="modal-content" style={{
            background: '#0a0a0a',
            border: '1px solid rgba(255, 215, 0, 0.15)',
            borderRadius: '8px',
            padding: '32px',
            maxWidth: '320px',
            width: '90%',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            zIndex: 100000,
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <RefreshCw size={40} className="spin" style={{ color: 'var(--accent)', animation: 'spin 1.5s linear infinite' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-heading)', color: 'var(--accent)', margin: '0 0 8px 0' }}>
              Processando Pagamento
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Processando sua assinatura com segurança... Por favor, aguarde.
            </p>
          </div>
        </div>
      )}

      {/* Modal: Success State */}
      {paymentStep === 'success' && selectedPlan && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div className="modal-content" style={{
            background: '#0a0a0a',
            border: '1px solid rgba(255, 215, 0, 0.15)',
            borderRadius: '8px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            zIndex: 100000,
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <CheckCircle size={56} style={{ color: '#00FF66' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-heading)', color: '#00FF66', marginBottom: '8px' }}>
              Plano ativado com sucesso!
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
              Você agora tem acesso completo aos recursos do plano <strong style={{ color: 'var(--primary)' }}>{selectedPlan.nome}</strong>. 
              {version === 'anunciante' ? ' Você já pode publicar e negociar seus anúncios.' : ' Você já está habilitado a receber convites e cotar fretes.'}
            </p>
            <button
              onClick={() => setSelectedPlan(null)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '13px' }}
            >
              Ir para Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Modal: Error State */}
      {paymentStep === 'error' && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999
        }}>
          <div className="modal-content" style={{
            background: '#0a0a0a',
            border: '1px solid rgba(255, 215, 0, 0.15)',
            borderRadius: '8px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            zIndex: 100000,
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <AlertTriangle size={56} style={{ color: 'var(--danger)' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-heading)', color: 'var(--danger)', marginBottom: '8px' }}>
              Erro no processamento
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
              Não conseguimos validar a transação com os dados informados. Por favor, revise as informações ou tente outro método.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setPaymentStep('confirm')}
                className="btn btn-primary"
                style={{ flex: 1, padding: '12px', fontSize: '13px' }}
              >
                Tentar Novamente
              </button>
              <button
                onClick={() => setSelectedPlan(null)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-secondary)',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-heading)'
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Spin Animation Style */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
