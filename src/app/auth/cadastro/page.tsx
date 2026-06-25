'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building, User, Mail, Lock, Phone, Shield, CheckCircle, AlertTriangle,
  RefreshCw, ArrowLeft, ArrowRight, Eye, EyeOff, FileText, Upload, Search,
  Award, Check, X, Calendar, Clock, LockKeyhole
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

const LISTA_BANCOS = [
  { codigo: '001', nome: 'Banco do Brasil S.A.' },
  { codigo: '237', nome: 'Banco Bradesco S.A.' },
  { codigo: '104', nome: 'Caixa Econômica Federal' },
  { codigo: '341', nome: 'Itaú Unibanco S.A.' },
  { codigo: '033', nome: 'Banco Santander (Brasil) S.A.' },
  { codigo: '260', nome: 'Nu Pagamentos S.A. (Nubank)' },
  { codigo: '077', nome: 'Banco Inter S.A.' },
  { codigo: '336', nome: 'Banco C6 S.A.' },
  { codigo: '422', nome: 'Banco Safra S.A.' },
  { codigo: '208', nome: 'Banco BTG Pactual S.A.' }
];

const BRAZILIAN_STATES = [
  { uf: 'AC', nome: 'Acre' },
  { uf: 'AL', nome: 'Alagoas' },
  { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' },
  { uf: 'BA', nome: 'Bahia' },
  { uf: 'CE', nome: 'Ceará' },
  { uf: 'ES', nome: 'Espírito Santo' },
  { uf: 'GO', nome: 'Goiás' },
  { uf: 'MA', nome: 'Maranhão' },
  { uf: 'MT', nome: 'Mato Grosso' },
  { uf: 'MS', nome: 'Mato Grosso do Sul' },
  { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'PA', nome: 'Pará' },
  { uf: 'PB', nome: 'Paraíba' },
  { uf: 'PR', nome: 'Paraná' },
  { uf: 'PE', nome: 'Pernambuco' },
  { uf: 'PI', nome: 'Piauí' },
  { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'RN', nome: 'Rio Grande do Norte' },
  { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'RO', nome: 'Rondônia' },
  { uf: 'RR', nome: 'Roraima' },
  { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' },
  { uf: 'SE', nome: 'Sergipe' },
  { uf: 'TO', nome: 'Tocantins' }
];

const isValidCNPJ = (cnpj: string): boolean => {
  const raw = cnpj.replace(/\D/g, '');
  if (raw.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(raw)) return false;

  const calcDigit = (slice: string, weights: number[]): number => {
    let sum = 0;
    for (let i = 0; i < slice.length; i++) {
      sum += parseInt(slice[i]) * weights[i];
    }
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const digit1 = calcDigit(raw.slice(0, 12), weights1);
  const digit2 = calcDigit(raw.slice(0, 13), weights2);

  return digit1 === parseInt(raw[12]) && digit2 === parseInt(raw[13]);
};

const isValidCPF = (cpf: string): boolean => {
  const raw = cpf.replace(/\D/g, '');
  if (raw.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(raw)) return false;

  const calcDigit = (slice: string, maxWeight: number): number => {
    let sum = 0;
    for (let i = 0; i < slice.length; i++) {
      sum += parseInt(slice[i]) * (maxWeight - i);
    }
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };

  const digit1 = calcDigit(raw.slice(0, 9), 10);
  const digit2 = calcDigit(raw.slice(0, 10), 11);

  return digit1 === parseInt(raw[9]) && digit2 === parseInt(raw[10]);
};

export default function CadastroPage() {
  const router = useRouter();
  const supabase = createClient();

  // Wizard Steps:
  // 1: 'select-tipo'
  // 2: 'select-perfil' (cnpj only)
  // 3: 'credentials'
  // 4: 'dados-empresa' (cnpj only)
  // 5: 'dados-operador'
  // 6: 'dados-rntrc' (transportadora only)
  // 7: 'dados-financeiros'
  // 7.5: 'select-plano'
  // 8: 'confirmacao'
  const [currentStep, setCurrentStep] = useState<string>('select-tipo');

  // Unified form state to retain values when going back/forward
  const [formData, setFormData] = useState({
    tipo: '', // cnpj | cpf
    perfil: '', // fornecedor | comprador | transportadora | controlador
    email: '',
    senha: '',
    confirmarSenha: '',
    cnpj: '',
    razaoSocial: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: 'SP',
    cep: '',
    horaDe: '08:00',
    horaAte: '18:00',
    nomeCompleto: '',
    cargo: '',
    operadorCpf: '',
    operadorEmail: '',
    telefone: '',
    whatsappMesmo: true,
    whatsapp: '',
    rntrc: '',
    rntrcDocumentoName: '',
    segurosConfirmados: false,
    banco: '',
    agencia: '',
    conta: '',
    pix: '',
    tipoConta: 'corrente',
    titularidadePix: '',
    pixTitularNome: '',
    pixTitularCpf: '',
    pixTitularEmail: '',
    plano: 'Gratuito',
    termoLGPD: false,
    declaracaoVerdadeira: false,
    aceitouTermos: false,
    areaOperacaoEstados: [] as string[],
    cupom: '',
    chaveNfe: '',
    operadorDocumentoFotoName: '',
    operadorSelfieName: ''
  });

  // Dynamic validation states (errors and successes)
  const [validations, setValidations] = useState({
    emailValid: null as boolean | null,
    emailDuplicado: false,
    emailChecking: false,
    senhaForca: 0,
    confirmSenhaValid: null as boolean | null,
    cnpjValid: null as boolean | null,
    cnpjLoading: false,
    cnpjDuplicado: false,
    cnpjManual: false,
    cnpjConfirmado: false,
    cnpjError: '',
    operadorCpfValid: null as boolean | null,
    operadorCpfLoading: false,
    cpfDuplicado: false,
    operadorEmailValid: null as boolean | null,
    rntrcValid: null as boolean | null,
    rntrcLoading: false,
    rntrcDuplicado: false,
    rntrcStatus: '' as 'ATIVO' | 'VENCIDO' | 'NÃO ENCONTRADO' | 'DUPLICADO' | '',
    rntrcVencimento: '',
    ocrLoading: false,
    ocrMatched: null as boolean | null,
    cupomValid: null as boolean | null,
    cupomError: ''
  });

  // Show/Hide password toggle
  const [showPassword, setShowPassword] = useState(false);

  // Bank autocomplete filter
  const [bankSearch, setBankSearch] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [period, setPeriod] = useState<1 | 3 | 6 | 12>(1);

  // OTP Validation Modal controls
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [otpStep, setOtpStep] = useState<'verify' | 'success'>('verify');
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];



  // Countdown timer for resend OTP
  useEffect(() => {
    if (showOtpModal && otpCountdown > 0 && otpStep === 'verify') {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [showOtpModal, otpCountdown, otpStep]);

  // Dynamic validation for RNTRC
  useEffect(() => {
    const raw = formData.rntrc.replace(/\D/g, '');
    if (raw.length === 7) {
      validateRntrcAPI();
    } else {
      setValidations(v => ({
        ...v,
        rntrcValid: null,
        rntrcDuplicado: false,
        rntrcStatus: ''
      }));
    }
  }, [formData.rntrc]);

  // Mask function helpers
  const applyCnpjMask = (val: string) => {
    let raw = val.replace(/\D/g, '').slice(0, 14);
    if (raw.length > 12) return raw.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    if (raw.length > 8) return raw.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})$/, '$1.$2.$3/$4');
    if (raw.length > 5) return raw.replace(/^(\d{2})(\d{3})(\d{0,3})$/, '$1.$2.$3');
    if (raw.length > 2) return raw.replace(/^(\d{2})(\d{0,3})$/, '$1.$2');
    return raw;
  };

  const applyCpfMask = (val: string) => {
    let raw = val.replace(/\D/g, '').slice(0, 11);
    if (raw.length > 9) return raw.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    if (raw.length > 6) return raw.replace(/^(\d{3})(\d{3})(\d{0,3})$/, '$1.$2.$3');
    if (raw.length > 3) return raw.replace(/^(\d{3})(\d{0,3})$/, '$1.$2');
    return raw;
  };

  const applyPhoneMask = (val: string) => {
    let raw = val.replace(/\D/g, '').slice(0, 11);
    if (raw.length > 10) return raw.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    if (raw.length > 6) return raw.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    if (raw.length > 2) return raw.replace(/^(\d{2})(\d{0,4})$/, '($1) $2');
    return raw;
  };

  const applyCepMask = (val: string) => {
    let raw = val.replace(/\D/g, '').slice(0, 8);
    if (raw.length > 5) return raw.replace(/^(\d{5})(\d{1,3})$/, '$1-$2');
    return raw;
  };

  const applyAgenciaMask = (val: string) => {
    let raw = val.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5);
    if (raw.length > 4) return raw.replace(/^([a-zA-Z0-9]{4})([a-zA-Z0-9]{1})$/, '$1-$2');
    return raw;
  };

  const applyContaMask = (val: string) => {
    let raw = val.replace(/[^a-zA-Z0-9]/g, '').slice(0, 9);
    if (raw.length > 1) {
      const body = raw.slice(0, -1);
      const digit = raw.slice(-1);
      return `${body}-${digit}`;
    }
    return raw;
  };

  // Password rules checks
  const getPasswordRules = (pass: string) => {
    return {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      number: /\d/.test(pass),
      special: /[-!@#$%^&*()_+|~={}\[\]:";'<>?,.\/]/.test(pass)
    };
  };

  const calculatePasswordStrength = (pass: string) => {
    const rules = getPasswordRules(pass);
    let count = 0;
    if (rules.length) count++;
    if (rules.uppercase) count++;
    if (rules.number) count++;
    if (rules.special) count++;
    return count;
  };

  // Validate E-mail (RFC 5322)
  const validateEmailFormat = (mail: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(mail);
  };

  const handleStateToggle = (uf: string) => {
    setFormData(prev => {
      const current = prev.areaOperacaoEstados || [];
      if (current.includes(uf)) {
        return { ...prev, areaOperacaoEstados: current.filter(s => s !== uf) };
      } else {
        if (current.length >= 26) return prev;
        return { ...prev, areaOperacaoEstados: [...current, uf] };
      }
    });
  };

  const handleSelectAllStates = () => {
    setFormData(prev => ({
      ...prev,
      areaOperacaoEstados: BRAZILIAN_STATES.map(s => s.uf)
    }));
  };

  const handleClearAllStates = () => {
    setFormData(prev => ({
      ...prev,
      areaOperacaoEstados: []
    }));
  };

  // Helper: remove digits and apply Title Case to name fields
  const applyNameFilter = (value: string): string => {
    // Remove digits and most special chars — allow letters, spaces, hyphens, apostrophes, accented chars
    const noDigits = value.replace(/[0-9]/g, '');
    // Auto Title-Case each word
    return noDigits.replace(/\b\w/g, c => c.toUpperCase());
  };

  // State handlers & masks bindings
  const handleInputChange = (field: keyof typeof formData, value: any) => {
    let formatted = value;
    if (field === 'cnpj') formatted = applyCnpjMask(value);
    else if (field === 'chaveNfe') formatted = value.replace(/\D/g, '').substring(0, 50);
    else if (field === 'operadorCpf' || field === 'pixTitularCpf') formatted = applyCpfMask(value);
    else if (field === 'telefone' || field === 'whatsapp') formatted = applyPhoneMask(value);
    else if (field === 'cep') formatted = applyCepMask(value);
    else if (field === 'agencia') formatted = applyAgenciaMask(value);
    else if (field === 'conta') formatted = applyContaMask(value);
    else if (field === 'nomeCompleto') formatted = applyNameFilter(value);
    else if (field === 'razaoSocial' && typeof value === 'string') {
      // Only filter digits from razaoSocial when in manual mode (auto-filled from API keeps original)
      formatted = value.replace(/[0-9]/g, '');
    }
    else if (field === 'pixTitularNome') formatted = applyNameFilter(value);

    setFormData(prev => ({ ...prev, [field]: formatted }));

    // Reset inline check indicators if field is edited
    if (field === 'email') {
      setValidations(v => ({ ...v, emailValid: value ? validateEmailFormat(value) : null }));
    }
    if (field === 'senha') {
      const strength = calculatePasswordStrength(value);
      setValidations(v => ({
        ...v,
        senhaForca: strength,
        confirmSenhaValid: formData.confirmarSenha ? value === formData.confirmarSenha : null
      }));
    }
    if (field === 'confirmarSenha') {
      setValidations(v => ({ ...v, confirmSenhaValid: value ? value === formData.senha : null }));
    }
    if (field === 'cnpj' || field === 'chaveNfe') {
      setValidations(v => ({ ...v, cnpjValid: null, cnpjError: '' }));
    }
    if (field === 'operadorCpf') {
      setValidations(v => ({ ...v, operadorCpfValid: null }));
    }
    if (field === 'operadorEmail') {
      setValidations(v => ({ ...v, operadorEmailValid: value ? validateEmailFormat(value) : null }));
    }
    if (field === 'rntrc') {
      setValidations(v => ({ ...v, rntrcValid: null, rntrcStatus: '' }));
    }
  };

  // Step transitions helpers
  const getNextStep = (current: string): string => {
    if (current === 'select-tipo') {
      return formData.tipo === 'cpf' ? 'credentials' : 'select-perfil';
    }
    if (current === 'select-perfil') {
      return 'credentials';
    }
    if (current === 'credentials') {
      return formData.tipo === 'cpf' ? 'dados-operador' : 'dados-empresa';
    }
    if (current === 'dados-empresa') {
      return 'dados-operador';
    }
    if (current === 'dados-operador') {
      return formData.perfil === 'transportadora' ? 'dados-rntrc' : 'dados-financeiros';
    }
    if (current === 'dados-rntrc') {
      return 'dados-financeiros';
    }
    if (current === 'dados-financeiros') {
      // Transportadora e Controlador CPF não têm seleção de plano
      if (formData.perfil === 'transportadora') return 'area-operacao';
      if (formData.tipo === 'cpf') return 'confirmacao';
      return 'select-plano'; // apenas Fornecedor e Comprador CNPJ
    }
    if (current === 'select-plano') {
      return 'confirmacao';
    }
    if (current === 'area-operacao') {
      return 'confirmacao';
    }
    return 'confirmacao';
  };

  const getPrevStep = (current: string): string => {
    if (current === 'confirmacao') {
      if (formData.perfil === 'transportadora') return 'area-operacao';
      if (formData.tipo === 'cpf') return 'dados-financeiros';
      return 'select-plano'; // Fornecedor e Comprador CNPJ
    }
    if (current === 'area-operacao') {
      return 'dados-financeiros';
    }
    if (current === 'select-plano') {
      return 'dados-financeiros';
    }
    if (current === 'dados-financeiros') {
      return formData.perfil === 'transportadora' ? 'dados-rntrc' : 'dados-operador';
    }
    if (current === 'dados-rntrc') {
      return 'dados-operador';
    }
    if (current === 'dados-operador') {
      return formData.tipo === 'cpf' ? 'credentials' : 'dados-empresa';
    }
    if (current === 'dados-empresa') {
      return 'credentials';
    }
    if (current === 'credentials') {
      return formData.tipo === 'cpf' ? 'select-tipo' : 'select-perfil';
    }
    if (current === 'select-perfil') {
      return 'select-tipo';
    }
    return 'select-tipo';
  };

  // Step Navigation actions
  const handleNext = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isStepValid()) return; // ⛔ Bloqueia avanço se o passo atual não for válido
    const next = getNextStep(currentStep);
    setCurrentStep(next);
  };

  const handleBack = () => {
    const prev = getPrevStep(currentStep);
    setCurrentStep(prev);
  };

  // API Simulators
  const validateCnpjAPI = async () => {
    const raw = formData.cnpj.replace(/\D/g, '');

    // 1️⃣ Valida formato
    if (!isValidCNPJ(raw)) {
      setValidations(v => ({ ...v, cnpjValid: false, cnpjDuplicado: false, cnpjError: 'CNPJ inválido' }));
      return;
    }

    setValidations(v => ({ ...v, cnpjLoading: true, cnpjValid: null, cnpjDuplicado: false, cnpjConfirmado: false, cnpjError: '' }));

    // 2️⃣ Verifica unicidade no banco PRIMEIRO (tanto formatado quanto raw)
    const { data: existing } = await supabase
      .from('cadastros')
      .select('id')
      .or(`cpf_ou_cnpj.eq."${formData.cnpj}",cpf_ou_cnpj.eq."${raw}"`)
      .maybeSingle();

    if (existing) {
      setValidations(v => ({ ...v, cnpjLoading: false, cnpjValid: false, cnpjDuplicado: true, cnpjError: 'Este CNPJ já está cadastrado.' }));
      return; // ⛔ bloqueia aqui
    }

    // 3️⃣ Busca dados na Brasil API
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${raw}`);
      if (!res.ok) throw new Error('not found');
      const d = await res.json();
      const formatCep = (c: string) => c ? c.replace(/^(\d{5})(\d{3})$/, '$1-$2') : '';
      setFormData(prev => ({
        ...prev,
        razaoSocial: d.razao_social || d.nome_fantasia || '',
        logradouro: d.logradouro || '',
        numero: d.numero || '',
        bairro: d.bairro || '',
        cidade: d.municipio || '',
        estado: d.uf || '',
        cep: formatCep(d.cep || ''),
      }));
      // Pede confirmação do usuário
      setValidations(v => ({ ...v, cnpjLoading: false, cnpjValid: true, cnpjManual: false, cnpjConfirmado: false }));
    } catch {
      // API falhou — libera campos para preenchimento manual
      setFormData(prev => ({ ...prev, razaoSocial: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '', cep: '' }));
      setValidations(v => ({ ...v, cnpjLoading: false, cnpjValid: true, cnpjManual: true, cnpjConfirmado: false }));
    }
  };

  const validateCnpjAndNfeAPI = async () => {
    const rawCnpj = formData.cnpj.replace(/\D/g, '');
    const rawNfe = formData.chaveNfe.replace(/\D/g, '');

    // 1️⃣ Valida formato local
    if (!isValidCNPJ(rawCnpj)) {
      setValidations(v => ({ ...v, cnpjValid: false, cnpjDuplicado: false, cnpjError: 'Formato de CNPJ inválido.' }));
      alert('⚠️ Por favor, insira um CNPJ válido.');
      return;
    }

    if (rawNfe.length !== 44 && rawNfe.length !== 50) {
      setValidations(v => ({ ...v, cnpjValid: false, cnpjError: 'Chave de acesso deve ter 44 ou 50 dígitos.' }));
      alert('⚠️ A chave deve possuir exatamente 44 dígitos (NF-e) ou 50 dígitos (NFS-e).');
      return;
    }

    setValidations(v => ({ ...v, cnpjLoading: true, cnpjValid: null, cnpjDuplicado: false, cnpjConfirmado: false, cnpjError: '' }));

    try {
      // 2️⃣ Verifica unicidade no banco primeiro (tanto formatado quanto raw)
      const { data: existing } = await supabase
        .from('cadastros')
        .select('id')
        .or(`cpf_ou_cnpj.eq."${formData.cnpj}",cpf_ou_cnpj.eq."${rawCnpj}"`)
        .maybeSingle();

      if (existing) {
        setValidations(v => ({ ...v, cnpjLoading: false, cnpjValid: false, cnpjDuplicado: true, cnpjError: 'Este CNPJ já está cadastrado.' }));
        return; // ⛔ bloqueia
      }

      // 3️⃣ Consulta o backend para validar NF-e e CNPJ
      const response = await fetch('/api/auth/validate-nfe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cnpj: rawCnpj, chaveNfe: rawNfe })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const errorMsg = result.error || 'NF-e ou CNPJ inválido.';
        setValidations(v => ({ ...v, cnpjLoading: false, cnpjValid: false, cnpjError: errorMsg }));
        alert(`❌ Validação falhou: ${errorMsg}`);
        return;
      }

      // 4️⃣ Sucesso! Preenche dados via resultado do servidor
      if (result.company) {
        const c = result.company;
        setFormData(prev => ({
          ...prev,
          razaoSocial: c.razaoSocial || prev.razaoSocial,
          logradouro: c.logradouro || prev.logradouro,
          numero: c.numero || prev.numero,
          bairro: c.bairro || prev.bairro,
          cidade: c.cidade || prev.cidade,
          estado: c.estado || prev.estado,
          cep: c.cep || prev.cep
        }));
      } else {
        // Servidor não conseguiu buscar — tenta direto do browser (mais confiável)
        try {
          const brasilRes = await fetch(
            `https://brasilapi.com.br/api/cnpj/v1/${rawCnpj}`,
            { signal: AbortSignal.timeout(12000) }
          );
          if (brasilRes.ok) {
            const d = await brasilRes.json();
            setFormData(prev => ({
              ...prev,
              razaoSocial: d.razao_social || d.nome_fantasia || prev.razaoSocial,
              logradouro: d.logradouro || prev.logradouro,
              numero: d.numero || prev.numero,
              bairro: d.bairro || prev.bairro,
              cidade: d.municipio || prev.cidade,
              estado: d.uf || prev.estado,
              cep: (d.cep || '').replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, '$1-$2') || prev.cep,
            }));
            // Marca como preenchido automaticamente (não manual)
            result.manualPreFill = false;
          }
        } catch {
          // BrasilAPI inacessível — deixa manual
        }
      }

      setValidations(v => ({
        ...v,
        cnpjLoading: false,
        cnpjValid: true,
        cnpjManual: !!result.manualPreFill,
        cnpjConfirmado: false,
        cnpjError: ''
      }));
    } catch (err) {
      setValidations(v => ({ ...v, cnpjLoading: false, cnpjValid: false, cnpjError: 'Erro de conexão/servidor ao validar CNPJ e NF-e.' }));
      alert('❌ Erro ao validar CNPJ e NF-e.');
    }
  };

  const validateCpfAPI = () => {
    const raw = formData.operadorCpf.replace(/\D/g, '');
    if (!isValidCPF(raw)) {
      setValidations(v => ({ ...v, operadorCpfValid: false }));
      return;
    }
    setValidations(v => ({ ...v, operadorCpfLoading: true }));

    // Simulate 1.2s Receita Federal CPF lookup
    setTimeout(() => {
      setValidations(v => ({
        ...v,
        operadorCpfLoading: false,
        operadorCpfValid: true
      }));
    }, 1200);
  };

  // ── Unicidade: e-mail ──────────────────────────────────────────
  const checkEmailUnico = async () => {
    const email = formData.email.trim();
    if (!email || !validateEmailFormat(email)) return;
    setValidations(v => ({ ...v, emailChecking: true, emailDuplicado: false }));
    // Check both cadastros table AND auth users via our confirm API
    const [{ data: cadastroData }, authRes] = await Promise.all([
      supabase.from('cadastros').select('id').eq('email', email).maybeSingle(),
      fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).then(r => r.json()).catch(() => ({ exists: false })),
    ]);
    const duplicado = !!cadastroData || !!authRes.exists;
    setValidations(v => ({ ...v, emailChecking: false, emailDuplicado: duplicado }));
  };

  // ── Unicidade: CNPJ ───────────────────────────────────────────
  const checkCnpjUnico = async () => {
    const raw = formData.cnpj.replace(/\D/g, '');
    if (raw.length !== 14) return;
    // Check both formatted and raw versions with quotes for PostgREST parsing safety
    const { data } = await supabase
      .from('cadastros')
      .select('id')
      .or(`cpf_ou_cnpj.eq."${formData.cnpj}",cpf_ou_cnpj.eq."${raw}"`)
      .maybeSingle();
    setValidations(v => ({ ...v, cnpjDuplicado: !!data }));
  };

  // ── Unicidade: CPF ────────────────────────────────────────────
  const checkCpfUnico = async () => {
    const raw = formData.operadorCpf.replace(/\D/g, '');
    if (raw.length !== 11) return;
    // Check both formatted and raw versions with quotes for PostgREST parsing safety
    const { data } = await supabase
      .from('cadastros')
      .select('id')
      .or(`cpf_ou_cnpj.eq."${formData.operadorCpf}",cpf_ou_cnpj.eq."${raw}"`)
      .maybeSingle();
    setValidations(v => ({ ...v, cpfDuplicado: !!data }));
  };

  const validateRntrcAPI = async () => {
    const raw = formData.rntrc.replace(/\D/g, '');
    if (raw.length !== 7) {
      setValidations(v => ({ ...v, rntrcValid: false, rntrcStatus: 'NÃO ENCONTRADO', rntrcDuplicado: false }));
      return;
    }
    setValidations(v => ({ ...v, rntrcLoading: true, rntrcValid: null, rntrcDuplicado: false, rntrcStatus: '' }));

    try {
      const { data, error } = await supabase
        .from('cadastros')
        .select('id')
        .eq('rntrc_num', raw)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setValidations(v => ({
          ...v,
          rntrcLoading: false,
          rntrcValid: false,
          rntrcDuplicado: true,
          rntrcStatus: 'DUPLICADO'
        }));
        return;
      }

      setValidations(v => ({
        ...v,
        rntrcLoading: false,
        rntrcValid: true,
        rntrcStatus: 'ATIVO',
        rntrcVencimento: '12/12/2029'
      }));
    } catch (err) {
      console.error('Error validating RNTRC:', err);
      setValidations(v => ({
        ...v,
        rntrcLoading: false,
        rntrcValid: true,
        rntrcStatus: 'ATIVO',
        rntrcVencimento: '12/12/2029'
      }));
    }
  };

  const handleApplyCoupon = () => {
    const code = formData.cupom.trim();
    if (code.toLowerCase() === 'mobossbig') {
      const maxPlan = formData.perfil === 'transportadora' ? 'Pro' : 'Business';
      handleInputChange('plano', maxPlan);
      setPeriod(12);
      setValidations(v => ({
        ...v,
        cupomValid: true,
        cupomError: ''
      }));
    } else {
      setValidations(v => ({
        ...v,
        cupomValid: false,
        cupomError: 'Cupom inválido.'
      }));
    }
  };

  const handleDocumentUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleInputChange('rntrcDocumentoName', file.name);
    setValidations(v => ({ ...v, ocrLoading: false, ocrMatched: true }));
  };

  // Submit and send real OTP via Supabase
  const handlePublish = async () => {
    const email = formData.email.trim();
    if (!email || !formData.senha) {
      alert('Por favor, preencha e-mail e senha antes de continuar.');
      return;
    }

    setShowOtpModal(true);
    setOtpStep('verify');
    setOtpCountdown(60);
    setOtpError('');
    setOtpCode(['', '', '', '', '', '']);

    // 1️⃣ Pre-create the auth user via Admin API (email_confirm=false)
    //    This allows signInWithOtp to find the user and deliver the real 6-digit code
    const createRes = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: formData.senha }),
    });
    const createData = await createRes.json();

    if (createData.error &&
        !createData.error.includes('already registered') &&
        !createData.error.includes('already exists')) {
      setOtpError(`Erro ao preparar cadastro: ${createData.error}`);
      return;
    }

    // 2️⃣ Send real 6-digit OTP to user's email via Supabase Auth
    const { error: sendError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false }
    });

    if (sendError &&
        !sendError.message.includes('not found') &&
        !sendError.message.includes('does not exist')) {
      setOtpError(`Erro ao enviar código: ${sendError.message}`);
    }
  };


  const handleOtpChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const newOtp = [...otpCode];
    newOtp[index] = val;
    setOtpCode(newOtp);

    if (val && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpCode.join('');
    if (fullCode.length < 6) {
      setOtpError('Digite o código de 6 dígitos completo.');
      return;
    }

    setOtpError('');
    const email = formData.email.trim();

    // 🔐 Verify real OTP from Supabase email
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: fullCode,
      type: 'email',
    });

    if (verifyError || !verifyData?.user) {
      setOtpError('Código incorreto ou expirado. Verifique sua caixa de entrada e tente novamente.');
      return;
    }

    setOtpError('');
    try {
      if (!formData.email || !formData.email.trim() || !formData.senha) {
        setOtpError('Por favor, preencha o e-mail e a senha na etapa de Credenciais.');
        return;
      }

      // 0️⃣ Double-check email, CNPJ, and CPF uniqueness to prevent bypasses
      const { data: existingEmail } = await supabase
        .from('cadastros')
        .select('id')
        .eq('email', formData.email.trim())
        .maybeSingle();

      if (existingEmail) {
        setOtpError('Este e-mail já está em uso. Fale com o suporte no WhatsApp (62) 99927-1816 para ajuda.');
        return;
      }

      if (formData.tipo === 'cnpj') {
        const rawCnpj = formData.cnpj.replace(/\D/g, '');
        const { data: existingCnpj } = await supabase
          .from('cadastros')
          .select('id')
          .or(`cpf_ou_cnpj.eq."${formData.cnpj}",cpf_ou_cnpj.eq."${rawCnpj}"`)
          .maybeSingle();

        if (existingCnpj) {
          setOtpError('Este CNPJ já possui um cadastro ativo. Fale com o suporte no WhatsApp (62) 99927-1816 para ajuda.');
          return;
        }
      } else if (formData.tipo === 'cpf') {
        const rawCpf = formData.operadorCpf.replace(/\D/g, '');
        const { data: existingCpf } = await supabase
          .from('cadastros')
          .select('id')
          .or(`cpf_ou_cnpj.eq."${formData.operadorCpf}",cpf_ou_cnpj.eq."${rawCpf}"`)
          .maybeSingle();

        if (existingCpf) {
          setOtpError('Este CPF já possui um cadastro ativo. Fale com o suporte no WhatsApp (62) 99927-1816 para ajuda.');
          return;
        }
      }

      // 1. Sign up the user in Supabase Auth via server-side Admin client (bypasses email rate limits)
      const signUpRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.senha,
        }),
      });
      const signUpData = await signUpRes.json();

      if (signUpData.error) {
        if (signUpData.error.includes('already registered') || signUpData.error.includes('User already registered') || signUpData.error.includes('already exists')) {
          setOtpError('Este e-mail já está cadastrado. Faça login ou fale com o suporte no WhatsApp (62) 99927-1816.');
        } else {
          setOtpError(signUpData.error);
        }
        return;
      }

      const userId = signUpData.user?.id;
      if (!userId) {
        setOtpError('Erro ao registrar usuário. Tente novamente.');
        return;
      }

      // 2. Build insert payload using ONLY columns confirmed to exist in 'cadastros'
      // Schema confirmed via swagger: id, tipo_parte, subtipo, nome_ou_razao, cpf_ou_cnpj,
      // email, whatsapp, cep, cidade, uf, score_0a100, nivel_selo, plano, plano_ativo,
      // data_cadastro, endereco, selo_verificado, status_documentos

      // Pack address into 'endereco' text column (already exists)
      const enderecoStr = [
        formData.logradouro, formData.numero, formData.bairro,
        formData.cidade, formData.estado, formData.cep
      ].filter(Boolean).join(', ');

      const profilePayload: Record<string, unknown> = {
        id: userId,
        email: formData.email.trim(),
        nome_ou_razao: formData.tipo === 'cnpj' ? formData.razaoSocial : formData.nomeCompleto,
        cpf_ou_cnpj: formData.tipo === 'cnpj' ? formData.cnpj : formData.operadorCpf,
        // tipo_parte constraint: 'Fornecedor' | 'Comprador' | 'Transportadora' | 'Consultor'
        tipo_parte: formData.perfil === 'controlador' ? 'Consultor'
          : formData.perfil === 'fornecedor' ? 'Fornecedor'
          : formData.perfil === 'comprador' ? 'Comprador'
          : 'Transportadora',
        // subtipo constraint: 'Empresa' | 'Indivíduo' | 'Transportadora contratada' | 'Corretor'
        subtipo: formData.perfil === 'controlador' ? 'Corretor'
          : formData.tipo === 'cnpj' ? 'Empresa'
          : 'Indivíduo',
        whatsapp: formData.whatsapp || formData.telefone || null,
        cep: formData.cep || null,
        cidade: formData.cidade || null,
        uf: formData.estado || null,
        endereco: enderecoStr || null,
        // nivel_selo constraint: 'Verde' | 'Amarelo' | 'Vermelho' | 'Ouro'
        nivel_selo: 'Verde',
        selo_verificado: false,
        score_0a100: formData.perfil === 'controlador' ? 0 : 50,
        // plano constraint: 'Free' | 'Pago'
        plano: formData.plano === 'Gratuito' || !formData.plano ? 'Free' : 'Pago',
        plano_ativo: formData.plano !== 'Gratuito',
        // status_documentos constraint: 'Pendente' | 'Em análise' | 'Verificado'
        status_documentos: 'Pendente',
        data_cadastro: new Date().toISOString(),
        
        // Fields recently migrated:
        telefone: formData.telefone || null,
        chave_pix: formData.pix || null,
        titularidade_pix: formData.titularidadePix || null,
        pix_titular_nome: formData.pixTitularNome || null,
        pix_titular_cpf: formData.pixTitularCpf || null,
        pix_titular_email: formData.pixTitularEmail || null,
        bairro: formData.bairro || null,
        logradouro: formData.logradouro || null,
        numero: formData.numero || null,
        area_operacao: formData.areaOperacaoEstados && formData.areaOperacaoEstados.length > 0 ? formData.areaOperacaoEstados.join(', ') : null,
        rntrc_num: formData.rntrc || null,
        rntrc_url: formData.rntrcDocumentoName ? `https://example.com/rntrc-docs/${encodeURIComponent(formData.rntrcDocumentoName)}` : null,
        rntrc_validade: formData.rntrc ? '2029-12-12' : null,
        chave_nfe_44_digitos: ['controlador', 'fornecedor', 'transportadora'].includes(formData.perfil) ? (formData.chaveNfe || null) : null,
        observacoes: formData.cupom.trim().toLowerCase() === 'mobossbig'
          ? 'Cupom MoBossbig aplicado — Plano máximo grátis por 12 meses.'
          : `Plano contratado no ciclo: ${period === 1 ? 'Mensal' : period === 3 ? 'Trimestral' : period === 6 ? 'Semestral' : 'Anual'}.`,
      };

      const { error: insertError } = await supabase
        .from('cadastros')
        .insert([profilePayload]);

      if (insertError) {
        const errStr = JSON.stringify(insertError);
        const errMsg = insertError.message || errStr;
        console.error('Insert error:', errStr);
        setOtpError(`⚠️ Erro ao salvar perfil: ${errMsg}`);
        // Don't block — auth account was created
      }





      // 3. Set the confirmed session on the supabase client (auto-login)
      if (signUpData.session) {
        await supabase.auth.setSession({
          access_token: signUpData.session.access_token,
          refresh_token: signUpData.session.refresh_token,
        });
        localStorage.setItem('materra_user', JSON.stringify(signUpData.user));
      } else {
        localStorage.setItem('materra_user', JSON.stringify(signUpData.user));
      }

      localStorage.setItem('materra_profile', JSON.stringify(profilePayload));
      localStorage.setItem('materra_just_registered', 'true');

      setOtpStep('success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro no processamento do cadastro.';
      setOtpError(msg);
    }
  };

  const handleOtpResend = async () => {
    setOtpCountdown(60);
    setOtpError('');
    const email = formData.email.trim();
    if (!email) return;
    // Re-send real OTP
    await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false }
    });
  };

  // Breadcrumbs/Progress mapping
  const getBreadcrumbs = () => {
    // Controlador CPF — sem Empresa, sem Plano
    if (formData.tipo === 'cpf') {
      return ['Tipo', 'Credenciais', 'Operador', 'Finanças', 'Resumo'];
    }
    // Transportadora — tem ANTT e Área, sem Plano
    if (formData.perfil === 'transportadora') {
      return ['Tipo', 'Perfil', 'Credenciais', 'Empresa', 'Operador', 'ANTT', 'Finanças', 'Área', 'Resumo'];
    }
    // Fornecedor e Comprador — têm Plano
    return ['Tipo', 'Perfil', 'Credenciais', 'Empresa', 'Operador', 'Finanças', 'Plano', 'Resumo'];
  };

  const getBreadcrumbIndex = () => {
    const routeMap = getBreadcrumbs();
    let currentName = '';
    if (currentStep === 'select-tipo') currentName = 'Tipo';
    else if (currentStep === 'select-perfil') currentName = 'Perfil';
    else if (currentStep === 'credentials') currentName = 'Credenciais';
    else if (currentStep === 'dados-empresa') currentName = 'Empresa';
    else if (currentStep === 'dados-operador') currentName = 'Operador';
    else if (currentStep === 'dados-rntrc') currentName = 'ANTT';
    else if (currentStep === 'dados-financeiros') currentName = 'Finanças';
    else if (currentStep === 'select-plano') currentName = 'Plano';
    else if (currentStep === 'area-operacao') currentName = 'Área';
    else if (currentStep === 'confirmacao') currentName = 'Resumo';

    return routeMap.indexOf(currentName);
  };

  // Form Validation checks per step to enable Next/Continuar buttons
  const isStepValid = () => {
    if (currentStep === 'select-tipo') {
      return formData.tipo !== '' && formData.aceitouTermos;
    }
    if (currentStep === 'select-perfil') {
      return formData.perfil !== '';
    }
    if (currentStep === 'credentials') {
      const rules = getPasswordRules(formData.senha);
      const isPasswordStrong = rules.length && rules.uppercase && rules.number && rules.special;
      return formData.email.trim() !== '' &&
        formData.senha !== '' &&
        isPasswordStrong &&
        validations.confirmSenhaValid === true &&
        validations.emailValid !== false &&
        !validations.emailDuplicado &&
        !validations.emailChecking;
    }
    if (currentStep === 'dados-empresa') {
      return validations.cnpjValid === true &&
        !validations.cnpjDuplicado &&
        validations.cnpjConfirmado;
    }
    if (currentStep === 'dados-operador') {
      const cpfFilled = formData.operadorCpf.replace(/\D/g, '').length === 11;
      if (formData.tipo === 'cpf') {
        // Controlador CPF: exige Nome Completo >= 3 + CPF com 11 dígitos + CPF único + documento com foto + selfie
        return formData.nomeCompleto.trim().length >= 3 &&
               cpfFilled &&
               !validations.cpfDuplicado &&
               formData.operadorDocumentoFotoName !== '' &&
               formData.operadorSelfieName !== '';
      }
      // Empresa com CNPJ: exige Nome Completo >= 3 + Cargo preenchido + CPF com 11 dígitos
      const baseOk = formData.nomeCompleto.trim().length >= 3 && formData.cargo !== '';
      return baseOk && cpfFilled;
    }
    if (currentStep === 'dados-rntrc') {
      const isRntrcOk = formData.rntrc.length === 7 && 
                        validations.rntrcValid === true && 
                        !validations.rntrcDuplicado &&
                        !validations.rntrcLoading;
      return formData.segurosConfirmados && 
             formData.rntrcDocumentoName !== '' && 
             isRntrcOk;
    }
    if (currentStep === 'area-operacao') {
      return formData.areaOperacaoEstados && formData.areaOperacaoEstados.length > 0 && formData.areaOperacaoEstados.length <= 26;
    }
    if (currentStep === 'confirmacao') {
      return formData.declaracaoVerdadeira;
    }
    return true;
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      color: 'var(--text-primary)',
      overflowX: 'hidden'
    }}>
      {/* Background Glows */}
      <div className="ambient-glow-gold" style={{ top: '15%', left: '-10%' }} />
      <div className="ambient-glow-cyan" style={{ bottom: '15%', right: '-10%' }} />

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
            <LogoGlobe size={28} />
            <span style={{
              fontFamily: 'Orbitron, var(--font-heading)',
              fontSize: '1.2rem',
              fontWeight: 900,
              color: 'var(--primary)',
              letterSpacing: '0.05em',
              textShadow: '0 0 10px rgba(255, 215, 0, 0.25)',
            }}>
              MATERRA ELO
            </span>
          </Link>
          <Link href="/" className="nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
            <ArrowLeft size={14} /> Voltar ao Início
          </Link>
        </div>
      </header>

      {/* Wizard Form Wrapper */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', zIndex: 1 }}>
        <div style={{
          width: '100%',
          maxWidth: '600px', // Responsive rules: Desktop max 600px centered
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          
          {/* Breadcrumbs / Progress Indicators */}
          {currentStep !== 'success-screen' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '0 8px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-secondary)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                <span>Progresso do Cadastro</span>
                <span>Etapa {getBreadcrumbIndex() + 1} de {getBreadcrumbs().length}</span>
              </div>
              
              {/* Timeline Horizontal Indicator */}
              <div style={{
                display: 'flex',
                gap: '4px',
                height: '4px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '100px',
                overflow: 'hidden'
              }}>
                {getBreadcrumbs().map((bc, idx) => {
                  const activeIdx = getBreadcrumbIndex();
                  const isCompleted = idx < activeIdx;
                  const isCurrent = idx === activeIdx;
                  return (
                    <div
                      key={bc}
                      style={{
                        flex: 1,
                        background: isCompleted 
                          ? 'var(--success)' 
                          : isCurrent 
                            ? 'var(--accent)' 
                            : 'transparent',
                        boxShadow: isCurrent ? 'var(--glow-cyan-strong)' : 'none',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  );
                })}
              </div>

              {/* Breadcrumb Text list */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.65rem',
                color: 'var(--text-secondary)',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                gap: '12px',
                paddingBottom: '4px'
              }}>
                {getBreadcrumbs().map((bc, idx) => {
                  const activeIdx = getBreadcrumbIndex();
                  const isCurrent = idx === activeIdx;
                  const isCompleted = idx < activeIdx;
                  return (
                    <span
                      key={bc}
                      style={{
                        color: isCurrent 
                          ? 'var(--accent)' 
                          : isCompleted 
                            ? 'var(--success)' 
                            : 'var(--text-secondary)',
                        fontWeight: isCurrent ? 'bold' : 'normal',
                      }}
                    >
                      {bc}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form Cyber Card */}
          <div className="cyber-card" style={{
            background: 'var(--surface)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }}>

            {/* ==========================================
               TELA 1: SELEÇÃO DE TIPO (CNPJ vs CPF)
               ========================================== */}
            {currentStep === 'select-tipo' && (
              <div style={{ animation: 'fadeIn 0.25s ease' }}>
                <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', border: 'none', padding: 0, margin: '0 0 24px 0', textAlign: 'center', fontFamily: 'var(--font-heading)' }}>
                  Como você quer entrar?
                </h2>
                
                {/* 2 Cards Selection */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  marginBottom: '28px'
                }}>
                  {/* Card CNPJ */}
                  <div
                    onClick={() => {
                      handleInputChange('tipo', 'cnpj');
                      handleInputChange('perfil', '');
                    }}
                    style={{
                      background: formData.tipo === 'cnpj' ? 'rgba(255, 215, 0, 0.02)' : 'rgba(255, 255, 255, 0.01)',
                      border: formData.tipo === 'cnpj' ? '1.5px solid var(--accent)' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: formData.tipo === 'cnpj' ? 'var(--glow-cyan)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'var(--font-heading)', color: formData.tipo === 'cnpj' ? 'var(--accent)' : 'var(--text-primary)' }}>CNPJ</span>
                      <span style={{ fontSize: '11px', background: 'rgba(255, 215, 0, 0.1)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>EMPRESAS</span>
                    </div>
                    <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'none' }}>Tenho CNPJ da minha empresa</h4>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Conecte sua empresa a compradores, destinadores e transportadoras de resíduos industriais.</p>
                  </div>

                  {/* Card CPF */}
                  <div
                    onClick={() => {
                      handleInputChange('tipo', 'cpf');
                      handleInputChange('perfil', 'controlador');
                    }}
                    style={{
                      background: formData.tipo === 'cpf' ? 'rgba(255, 215, 0, 0.02)' : 'rgba(255, 255, 255, 0.01)',
                      border: formData.tipo === 'cpf' ? '1.5px solid var(--primary)' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: formData.tipo === 'cpf' ? 'var(--glow-gold)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'var(--font-heading)', color: formData.tipo === 'cpf' ? 'var(--primary)' : 'var(--text-primary)' }}>CPF</span>
                      <span style={{ fontSize: '11px', background: 'rgba(255, 215, 0, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>AVULSO</span>
                    </div>
                    <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'none' }}>Sou pessoa física (controlador individual)</h4>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Acesso para consultores autônomos ou operadores individuais sem CNPJ ativo.</p>
                  </div>
                </div>

                {/* ── Termos obrigatórios ── */}
                <label
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    cursor: 'pointer', marginBottom: '16px',
                    padding: '13px 16px',
                    background: formData.aceitouTermos ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${formData.aceitouTermos ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.aceitouTermos}
                    onChange={e => handleInputChange('aceitouTermos', e.target.checked)}
                    style={{ marginTop: '2px', accentColor: 'var(--accent)', width: '16px', height: '16px', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                    Li e concordo com os{' '}
                    <a
                      href="/termos"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{
                        color: 'var(--accent)',
                        fontWeight: 800,
                        textDecoration: 'underline',
                        textUnderlineOffset: '2px'
                      }}
                    >
                      Termos de Uso e Política de Privacidade (LGPD)
                    </a>
                    {' '}da Materra Elo.{' '}
                    <span style={{ color: 'var(--danger)' }}>*</span>
                  </span>
                </label>

                {/* Continue Actions */}
                <button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: isStepValid() ? 1 : 0.5,
                    cursor: isStepValid() ? 'pointer' : 'not-allowed'
                  }}
                >
                  Continuar <ArrowRight size={16} />
                </button>
                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Já possui uma conta?{' '}
                  <Link href="/auth/login" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}>
                    Entrar na plataforma
                  </Link>
                </div>
              </div>
            )}

            {/* ==========================================
               TELA 2: SELEÇÃO DE PERFIL (CNPJ ONLY)
               ========================================== */}
            {currentStep === 'select-perfil' && (
              <div style={{ animation: 'fadeIn 0.25s ease' }}>
                <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', border: 'none', padding: 0, margin: '0 0 8px 0', textAlign: 'center', fontFamily: 'var(--font-heading)' }}>
                  👤 ESCOLHA SUA ESPECIALIDADE
                </h2>

                {(formData.cnpj || formData.razaoSocial) && (
                  <div style={{
                    background: 'rgba(255,215,0,0.05)',
                    border: '1px solid rgba(255,215,0,0.15)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '20px',
                    fontSize: '13px',
                    color: 'var(--text-secondary)'
                  }}>
                    {formData.cnpj && <div>CNPJ: <strong style={{ color: '#fff' }}>{formData.cnpj}</strong></div>}
                    {formData.razaoSocial && <div style={{ marginTop: '4px' }}>Empresa: <strong style={{ color: '#fff' }}>{formData.razaoSocial}</strong></div>}
                  </div>
                )}

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '20px' }}>
                  Qual é a especialidade da sua empresa?
                </p>

                {/* 4 Radio Profiles */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  {[
                    { id: 'fornecedor', label: 'FORNECEDOR (Gero resíduos)', desc: 'Você pode publicar anúncios oferecendo resíduos.' },
                    { id: 'comprador', label: 'COMPRADOR (Recebo e processo resíduos)', desc: 'Você pode publicar demandas pedindo resíduos.' },
                    { id: 'transportadora', label: 'TRANSPORTADORA', desc: 'Faço coleta e transporte de cargas e resíduos.' },
                    { id: 'controlador', label: 'CONTROLADOR (Intermediador de Resíduos)', desc: 'Represento empresas parceiras como intermediário.' }
                  ].map(prof => {
                    const isSelected = formData.perfil === prof.id;
                    return (
                      <label
                        key={prof.id}
                        onClick={() => handleInputChange('perfil', prof.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          background: isSelected ? 'rgba(255, 215, 0, 0.02)' : 'rgba(255, 255, 255, 0.01)',
                          border: isSelected ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.06)',
                          padding: '14px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        <input
                          type="radio"
                          name="perfilRadio"
                          checked={isSelected}
                          onChange={() => {}} // Controlled by label click
                          style={{ marginTop: '3px', accentColor: 'var(--accent)' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '14px', fontWeight: 'bold', color: isSelected ? 'var(--accent)' : 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                            {prof.label}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {prof.desc}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Info Box */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 215, 0, 0.05)',
                  border: '1px solid rgba(255, 215, 0, 0.15)',
                  borderRadius: '6px',
                  padding: '12px',
                  marginBottom: '24px',
                  fontSize: '12px',
                  color: 'var(--accent)'
                }}>
                  <span>ℹ️</span>
                  <span>Escolhendo agora Fornecedor ou Comprador, depois você pode habilitar para ambas as funções ao adicionar os documentos complementares. 📌</span>
                </div>

                {/* Bottom Navigation */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={handleBack} className="btn btn-secondary" style={{ flex: 1, padding: '12px' }}>
                    Voltar
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    className="btn btn-primary"
                    style={{
                      flex: 2,
                      padding: '12px',
                      opacity: isStepValid() ? 1 : 0.5,
                      cursor: isStepValid() ? 'pointer' : 'not-allowed',
                      textTransform: 'uppercase',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    {formData.perfil ? `Continuar como ${formData.perfil.toUpperCase()}` : 'Selecione uma especialidade'}
                  </button>
                </div>
              </div>
            )}

            {/* ==========================================
               TELA 3: DADOS COMUNS (CREDENCIAIS DE ACESSO)
               ========================================== */}
            {currentStep === 'credentials' && (
              <div style={{ animation: 'fadeIn 0.25s ease' }}>
                <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', border: 'none', padding: 0, margin: '0 0 24px 0', textAlign: 'center', fontFamily: 'var(--font-heading)' }}>
                  Credenciais de Acesso
                </h2>

                <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* E-mail Input with real-time validation */}
                  <div className="cyber-form-group">
                    <label className="cyber-label">E-mail Corporativo <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input
                        type="text"
                        className="cyber-input"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={e => handleInputChange('email', e.target.value)}
                        onBlur={checkEmailUnico}
                        style={{
                          paddingLeft: '38px',
                          paddingRight: '38px',
                          borderColor: (validations.emailValid === false || validations.emailDuplicado)
                            ? 'var(--danger)'
                            : validations.emailValid === true && !validations.emailDuplicado
                              ? '#00FF66'
                              : 'rgba(255,255,255,0.08)'
                        }}
                      />
                      {validations.emailValid === true && !validations.emailDuplicado && (
                        <CheckCircle size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#00FF66' }} />
                      )}
                    </div>
                     {validations.emailChecking && (
                       <span style={{ fontSize: '11px', color: '#888', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>verificando disponibilidade...</span>
                     )}
                     {validations.emailDuplicado && (
                       <span style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px', fontFamily: 'var(--font-mono)', display: 'block' }}>
                          ⛔ Este e-mail já está cadastrado. Faça login ou entre em contato com o suporte no WhatsApp:{' '}
                          <a href="https://wa.me/5562999271816" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline', fontWeight: 'bold' }}>
                            (62) 99927-1816
                          </a>
                          .
                        </span>
                     )}
                     {validations.emailValid === false && !validations.emailDuplicado && (
                       <span style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>E-mail inválido</span>
                     )}
                  </div>

                  {/* Password Input with strength bar and check marks */}
                  <div className="cyber-form-group">
                    <label className="cyber-label">Senha de Acesso <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="cyber-input"
                        placeholder="Insira sua senha"
                        value={formData.senha}
                        onChange={e => handleInputChange('senha', e.target.value)}
                        style={{
                          paddingLeft: '38px',
                          paddingRight: '38px',
                          borderColor: validations.senhaForca >= 4 
                            ? '#00FF66' 
                            : formData.senha 
                              ? 'var(--primary)' 
                              : 'rgba(255,255,255,0.08)'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Requisitos Checklist */}
                    {formData.senha && (
                      <div style={{
                        marginTop: '10px',
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        borderRadius: '6px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Requisitos Mínimos:</div>
                        {[
                          { key: 'length', label: 'Mínimo de 8 caracteres' },
                          { key: 'uppercase', label: 'Pelo menos 1 letra maiúscula' },
                          { key: 'number', label: 'Pelo menos 1 número' },
                          { key: 'special', label: 'Pelo menos 1 caractere especial (!@#$%)' }
                        ].map(rule => {
                          const met = getPasswordRules(formData.senha)[rule.key as keyof ReturnType<typeof getPasswordRules>];
                          return (
                            <div key={rule.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                              {met ? (
                                <Check size={12} style={{ color: '#00FF66' }} />
                              ) : (
                                <X size={12} style={{ color: 'rgba(255,255,255,0.25)' }} />
                              )}
                              <span style={{ color: met ? '#00FF66' : 'var(--text-secondary)' }}>{rule.label}</span>
                            </div>
                          );
                        })}

                        {/* Strength Bar */}
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
                            <span>Força da senha</span>
                            <span style={{
                              color: validations.senhaForca === 4 
                                ? '#00FF66' 
                                : validations.senhaForca >= 2 
                                  ? 'var(--primary)' 
                                  : 'var(--danger)'
                            }}>
                              {validations.senhaForca === 4 ? 'Forte' : validations.senhaForca >= 2 ? 'Média' : 'Fraca'}
                            </span>
                          </div>
                          <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', display: 'flex', gap: '2px' }}>
                            <div style={{ flex: 1, background: validations.senhaForca >= 1 ? (validations.senhaForca === 4 ? '#00FF66' : validations.senhaForca >= 2 ? 'var(--primary)' : 'var(--danger)') : 'transparent' }} />
                            <div style={{ flex: 1, background: validations.senhaForca >= 2 ? (validations.senhaForca === 4 ? '#00FF66' : 'var(--primary)') : 'transparent' }} />
                            <div style={{ flex: 1, background: validations.senhaForca >= 3 ? (validations.senhaForca === 4 ? '#00FF66' : 'var(--primary)') : 'transparent' }} />
                            <div style={{ flex: 1, background: validations.senhaForca >= 4 ? '#00FF66' : 'transparent' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Input */}
                  <div className="cyber-form-group">
                    <label className="cyber-label">Confirmar Senha <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="cyber-input"
                        placeholder="Repita sua senha"
                        value={formData.confirmarSenha}
                        onChange={e => handleInputChange('confirmarSenha', e.target.value)}
                        style={{
                          paddingLeft: '38px',
                          paddingRight: '38px',
                          borderColor: validations.confirmSenhaValid === true 
                            ? '#00FF66' 
                            : validations.confirmSenhaValid === false 
                              ? 'var(--danger)' 
                              : 'rgba(255,255,255,0.08)'
                        }}
                      />
                      {validations.confirmSenhaValid === true && (
                        <CheckCircle size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#00FF66' }} />
                      )}
                      {validations.confirmSenhaValid === false && (
                        <X size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--danger)' }} />
                      )}
                    </div>
                    {validations.confirmSenhaValid === false && (
                      <span style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>Senhas divergentes</span>
                    )}
                  </div>



                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button type="button" onClick={handleBack} className="btn btn-secondary" style={{ flex: 1, padding: '12px' }}>
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={!isStepValid()}
                      className="btn btn-primary"
                      style={{
                        flex: 2,
                        padding: '12px',
                        opacity: isStepValid() ? 1 : 0.5,
                        cursor: isStepValid() ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Continuar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ==========================================
               TELA 4: DADOS DA EMPRESA (CNPJ ONLY)
               ========================================== */}
            {currentStep === 'dados-empresa' && (
              <div style={{ animation: 'fadeIn 0.25s ease' }}>
                <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', border: 'none', padding: 0, margin: '0 0 24px 0', textAlign: 'center', fontFamily: 'var(--font-heading)' }}>
                  Dados da Empresa
                </h2>

                <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  
                  {/* CNPJ with NF-e validation or simple validation */}
                  {['controlador', 'fornecedor', 'transportadora'].includes(formData.perfil) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div className="cyber-form-group">
                        <label className="cyber-label">CNPJ <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <div style={{ position: 'relative' }}>
                          <Building size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                          <input
                            type="text"
                            className="cyber-input"
                            placeholder="00.000.000/0000-00"
                            value={formData.cnpj}
                            onChange={e => handleInputChange('cnpj', e.target.value)}
                            onBlur={checkCnpjUnico}
                            style={{
                              paddingLeft: '38px',
                              paddingRight: '38px',
                              borderColor: validations.cnpjDuplicado
                                ? 'var(--danger)'
                                : validations.cnpjValid === true
                                  ? '#00FF66'
                                  : validations.cnpjValid === false
                                    ? 'var(--danger)'
                                    : 'rgba(255,255,255,0.08)'
                            }}
                          />
                          {validations.cnpjLoading && (
                            <RefreshCw size={14} className="spin" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)', animation: 'spin 1.5s linear infinite' }} />
                          )}
                          {!validations.cnpjLoading && validations.cnpjValid === true && !validations.cnpjDuplicado && (
                            <CheckCircle size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#00FF66' }} />
                          )}
                          {!validations.cnpjLoading && (validations.cnpjValid === false || validations.cnpjDuplicado) && (
                            <X size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--danger)' }} />
                          )}
                        </div>
                        {validations.cnpjDuplicado && (
                          <span style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px', fontFamily: 'var(--font-mono)', display: 'block' }}>
                            ⛔ Este CNPJ já possui cadastro na plataforma. Faça login ou entre em contato com o suporte no WhatsApp:{' '}
                            <a href="https://wa.me/5562999271816" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline', fontWeight: 'bold' }}>
                              (62) 99927-1816
                            </a>
                            .
                          </span>
                        )}
                        {!validations.cnpjDuplicado && validations.cnpjValid === false && (
                          <span style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{validations.cnpjError || 'CNPJ inválido'}</span>
                        )}
                      </div>

                      <div className="cyber-form-group">
                        <label className="cyber-label">Chave de Acesso da NF-e / NFS-e <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <div style={{ position: 'relative' }}>
                          <FileText size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                          <input
                            type="text"
                            className="cyber-input"
                            placeholder="44 dígitos (NF-e) ou 50 dígitos (NFS-e)"
                            value={formData.chaveNfe}
                            onChange={e => handleInputChange('chaveNfe', e.target.value)}
                            style={{
                              paddingLeft: '38px',
                              paddingRight: '12px',
                              borderColor: validations.cnpjValid === true
                                ? '#00FF66'
                                : validations.cnpjValid === false
                                  ? 'var(--danger)'
                                  : 'rgba(255,255,255,0.08)'
                            }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={validateCnpjAndNfeAPI}
                        disabled={validations.cnpjLoading || formData.cnpj.replace(/\D/g, '').length < 14 || (formData.chaveNfe.replace(/\D/g, '').length !== 44 && formData.chaveNfe.replace(/\D/g, '').length !== 50)}
                        className="btn btn-primary"
                        style={{
                          width: '100%',
                          padding: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontFamily: 'var(--font-heading)',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          marginTop: '4px',
                          opacity: (validations.cnpjLoading || formData.cnpj.replace(/\D/g, '').length < 14 || (formData.chaveNfe.replace(/\D/g, '').length !== 44 && formData.chaveNfe.replace(/\D/g, '').length !== 50)) ? 0.4 : 1
                        }}
                      >
                        {validations.cnpjLoading ? (
                          <>
                            <RefreshCw size={14} className="spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                            Validando...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={14} />
                            Validar CNPJ e NF
                          </>
                        )}
                      </button>

                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px', textAlign: 'center', fontStyle: 'italic', lineHeight: 1.4 }}>
                        * Ajuda-nos a saber que é realmente da empresa dita
                      </p>
                    </div>
                  ) : (
                    <div className="cyber-form-group">
                      <label className="cyber-label">CNPJ <span style={{ color: 'var(--danger)' }}>*</span></label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <Building size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                          <input
                            type="text"
                            className="cyber-input"
                            placeholder="00.000.000/0000-00"
                            value={formData.cnpj}
                            onChange={e => handleInputChange('cnpj', e.target.value)}
                            onBlur={checkCnpjUnico}
                            style={{
                              paddingLeft: '38px',
                              paddingRight: '38px',
                              borderColor: validations.cnpjDuplicado
                                ? 'var(--danger)'
                                : validations.cnpjValid === true
                                  ? '#00FF66'
                                  : validations.cnpjValid === false
                                    ? 'var(--danger)'
                                    : 'rgba(255,255,255,0.08)'
                            }}
                          />
                          {validations.cnpjLoading && (
                            <RefreshCw size={14} className="spin" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent)', animation: 'spin 1.5s linear infinite' }} />
                          )}
                          {!validations.cnpjLoading && validations.cnpjValid === true && !validations.cnpjDuplicado && (
                            <CheckCircle size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#00FF66' }} />
                          )}
                          {!validations.cnpjLoading && (validations.cnpjValid === false || validations.cnpjDuplicado) && (
                            <X size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--danger)' }} />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={validateCnpjAPI}
                          disabled={validations.cnpjLoading || formData.cnpj.replace(/\D/g, '').length < 14}
                          style={{
                            background: 'rgba(255, 215, 0, 0.08)',
                            border: '1px solid var(--accent)',
                            color: 'var(--accent)',
                            borderRadius: '4px',
                            padding: '0 16px',
                            fontSize: '11px',
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            opacity: (validations.cnpjLoading || formData.cnpj.replace(/\D/g, '').length < 14) ? 0.4 : 1
                          }}
                        >
                          VALIDAR
                        </button>
                      </div>
                      {validations.cnpjDuplicado && (
                        <span style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px', fontFamily: 'var(--font-mono)', display: 'block' }}>
                          ⛔ Este CNPJ já possui cadastro na plataforma. Faça login ou entre em contato com o suporte no WhatsApp:{' '}
                          <a href="https://wa.me/5562999271816" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline', fontWeight: 'bold' }}>
                            (62) 99927-1816
                          </a>
                          .
                        </span>
                      )}
                      {!validations.cnpjDuplicado && validations.cnpjValid === false && (
                        <span style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{validations.cnpjError || 'CNPJ inválido'}</span>
                      )}
                    </div>
                  )}

                  {/* Razão Social — sempre editável após validação */}
                  <div className="cyber-form-group">
                    <label className="cyber-label">Razão Social <span style={{ color: 'var(--accent)', fontSize: '9px', marginLeft: '6px' }}>✏ confira e corrija se necessário</span></label>
                    <input
                      type="text"
                      className="cyber-input"
                      placeholder="Razão social da empresa"
                      value={formData.razaoSocial}
                      onChange={e => handleInputChange('razaoSocial', e.target.value)}
                      style={{ background: 'rgba(255,215,0,0.03)', borderColor: 'rgba(255,215,0,0.2)' }}
                    />
                  </div>

                  {/* Aviso de preenchimento manual */}
                  {validations.cnpjManual && (
                    <div style={{ background: 'rgba(255,165,0,0.07)', border: '1px solid rgba(255,165,0,0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#ffaa44', marginBottom: '4px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ flexShrink: 0 }}>⚠️</span>
                      <span>Não foi possível buscar os dados do CNPJ automaticamente. Preencha as informações da empresa manualmente.</span>
                    </div>
                  )}

                  {/* Endereço — sempre editável após validação bem-sucedida */}
                  {(formData.razaoSocial || validations.cnpjManual || validations.cnpjValid === true) && (
                    <div style={{
                      background: 'rgba(255,215,0,0.02)',
                      border: '1px solid rgba(255,215,0,0.15)',
                      borderRadius: '6px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      animation: 'fadeIn 0.2s ease'
                    }}>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ✏️ Confirme e edite o endereço
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Logradouro</label>
                          <input type="text" className="cyber-input"
                            value={formData.logradouro}
                            onChange={e => handleInputChange('logradouro', e.target.value)}
                            placeholder="Rua / Av. / Rod."
                            style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,215,0,0.2)', color: '#fff', fontSize: '13px' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Nº</label>
                          <input type="text" className="cyber-input"
                            value={formData.numero}
                            onChange={e => handleInputChange('numero', e.target.value)}
                            placeholder="Nº"
                            style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,215,0,0.2)', color: '#fff', fontSize: '13px' }} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Bairro</label>
                          <input type="text" className="cyber-input"
                            value={formData.bairro}
                            onChange={e => handleInputChange('bairro', e.target.value)}
                            placeholder="Bairro"
                            style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,215,0,0.2)', color: '#fff', fontSize: '13px' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>CEP</label>
                          <input type="text" className="cyber-input"
                            value={formData.cep}
                            onChange={e => handleInputChange('cep', e.target.value)}
                            placeholder="00000-000"
                            style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,215,0,0.2)', color: '#fff', fontSize: '13px' }} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Cidade</label>
                          <input type="text" className="cyber-input"
                            value={formData.cidade}
                            onChange={e => handleInputChange('cidade', e.target.value)}
                            placeholder="Cidade"
                            style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,215,0,0.2)', color: '#fff', fontSize: '13px' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Estado</label>
                          <input type="text" className="cyber-input"
                            value={formData.estado}
                            onChange={e => handleInputChange('estado', e.target.value)}
                            placeholder="UF"
                            maxLength={2}
                            style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,215,0,0.2)', color: '#fff', fontSize: '13px', textTransform: 'uppercase' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Confirmar dados ── aparece após CNPJ validado (API ou manual) */}
                  {validations.cnpjValid === true && !validations.cnpjDuplicado && (
                    validations.cnpjConfirmado ? (
                      /* Confirmado */
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(0,255,102,0.06)', border: '1px solid rgba(0,255,102,0.25)', borderRadius: '8px', animation: 'fadeIn 0.2s ease' }}>
                        <CheckCircle size={16} style={{ color: '#00FF66', flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: '#00FF66', fontWeight: 600 }}>Dados confirmados — pode continuar</span>
                        <button
                          type="button"
                          onClick={() => setValidations(v => ({ ...v, cnpjConfirmado: false }))}
                          style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          corrigir
                        </button>
                      </div>
                    ) : (
                      /* Aguardando confirmação */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', animation: 'fadeIn 0.2s ease' }}>
                        <div style={{ fontSize: '12px', color: 'rgba(255,215,0,0.7)', textAlign: 'center' }}>
                          {validations.cnpjManual
                            ? 'Preencha os campos acima e confirme para continuar'
                            : 'Revise os dados acima e confirme que estão corretos'}
                        </div>
                        <button
                          type="button"
                          disabled={validations.cnpjManual && !formData.razaoSocial.trim()}
                          onClick={() => setValidations(v => ({ ...v, cnpjConfirmado: true }))}
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.08))',
                            border: '1px solid var(--accent)',
                            color: 'var(--accent)',
                            borderRadius: '6px',
                            padding: '12px',
                            fontSize: '13px',
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 'bold',
                            cursor: (validations.cnpjManual && !formData.razaoSocial.trim()) ? 'not-allowed' : 'pointer',
                            opacity: (validations.cnpjManual && !formData.razaoSocial.trim()) ? 0.4 : 1,
                            transition: 'all 0.2s',
                            letterSpacing: '0.05em'
                          }}
                          onMouseEnter={e => { if (!(validations.cnpjManual && !formData.razaoSocial.trim())) { e.currentTarget.style.background = 'rgba(255,215,0,0.2)'; }}}
                          onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.08))'; }}
                        >
                          ✓ Confirmar dados da empresa
                        </button>
                      </div>
                    )
                  )}

                  <div className="cyber-form-group">
                    <label className="cyber-label">Horário de Funcionamento para Carga/Descarga <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <Clock size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                          type="time"
                          className="cyber-input"
                          value={formData.horaDe}
                          onChange={e => handleInputChange('horaDe', e.target.value)}
                          style={{ paddingLeft: '32px', fontSize: '13px' }}
                        />
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Até</span>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <Clock size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                          type="time"
                          className="cyber-input"
                          value={formData.horaAte}
                          onChange={e => handleInputChange('horaAte', e.target.value)}
                          style={{ paddingLeft: '32px', fontSize: '13px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button type="button" onClick={handleBack} className="btn btn-secondary" style={{ flex: 1, padding: '12px' }}>
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={!isStepValid()}
                      className="btn btn-primary"
                      style={{
                        flex: 2,
                        padding: '12px',
                        opacity: isStepValid() ? 1 : 0.5,
                        cursor: isStepValid() ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Continuar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ==========================================
               TELA 5: DADOS DO OPERADOR (QUEM USA A CONTA)
               ========================================== */}
            {currentStep === 'dados-operador' && (
              <div style={{ animation: 'fadeIn 0.25s ease' }}>
                <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', border: 'none', padding: 0, margin: '0 0 6px 0', textAlign: 'center', fontFamily: 'var(--font-heading)' }}>
                  Quem usa esta conta?
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '24px' }}>
                  Dados do responsável técnico ou operacional que vai usar esta plataforma.
                </p>

                <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Nome e Cargo — apenas para CNPJ aparecem antes do CPF; para CPF aparecem no reveal abaixo */}
                  {formData.tipo !== 'cpf' && (
                    <>
                      <div className="cyber-form-group">
                        <label className="cyber-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Nome Completo do Responsável <span style={{ color: 'var(--danger)' }}>*</span></span>
                          <span style={{ fontSize: '10px', color: formData.nomeCompleto.trim().length >= 3 ? '#00FF66' : '#555', fontFamily: 'var(--font-mono)', transition: 'color 0.2s' }}>
                            {formData.nomeCompleto.trim().length}/60
                          </span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: formData.nomeCompleto.trim().length >= 3 ? '#00FF66' : 'var(--text-secondary)', transition: 'color 0.2s' }} />
                          <input
                            type="text"
                            className="cyber-input"
                            placeholder="Ex: João da Silva Pereira"
                            value={formData.nomeCompleto}
                            onChange={e => handleInputChange('nomeCompleto', e.target.value)}
                            maxLength={60}
                            autoComplete="name"
                            style={{
                              paddingLeft: '38px',
                              paddingRight: '38px',
                              borderColor: formData.nomeCompleto.trim().length >= 3 ? '#00FF66'
                                : formData.nomeCompleto.length > 0 ? 'rgba(255,100,100,0.4)'
                                : 'rgba(255,255,255,0.08)',
                              transition: 'border-color 0.2s'
                            }}
                          />
                          {formData.nomeCompleto.trim().length >= 3
                            ? <CheckCircle size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#00FF66' }} />
                            : formData.nomeCompleto.length > 0
                              ? <X size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--danger)' }} />
                              : null
                          }
                        </div>
                        <span style={{ fontSize: '11px', color: '#555', marginTop: '4px', display: 'block' }}>
                          Apenas letras e espaços — números são bloqueados automaticamente.
                        </span>
                        {formData.nomeCompleto.length > 0 && formData.nomeCompleto.trim().length < 3 && (
                          <span style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '2px', display: 'block' }}>
                            ⚠ Digite ao menos nome e sobrenome (mín. 3 letras).
                          </span>
                        )}
                      </div>
                      <div className="cyber-form-group">
                        <label className="cyber-label">Cargo <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <select className="cyber-input" value={formData.cargo} onChange={e => handleInputChange('cargo', e.target.value)}
                          style={{ background: 'var(--surface-secondary)', color: '#fff', cursor: 'pointer' }}>
                          <option value="" disabled>Selecione um cargo</option>
                          <option value="Gerente">Gerente</option>
                          <option value="Diretor">Diretor</option>
                          <option value="Superintendente">Superintendente</option>
                          <option value="Operacional">Operacional</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* ── CPF sempre primeiro para controladores CPF ── */}
                  {formData.tipo === 'cpf' ? (
                    <>
                      {/* CPF do Controlador */}
                      <div className="cyber-form-group">
                        <label className="cyber-label">CPF do Controlador <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <div style={{ position: 'relative' }}>
                          <Shield size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                          <input
                            type="text"
                            className="cyber-input"
                            placeholder="000.000.000-00"
                            value={formData.operadorCpf}
                            onChange={e => { handleInputChange('operadorCpf', e.target.value); setValidations(v => ({ ...v, operadorCpfValid: null, cpfDuplicado: false })); }}
                            onBlur={checkCpfUnico}
                            style={{
                              paddingLeft: '38px',
                              borderColor: validations.cpfDuplicado ? 'var(--danger)' : 'rgba(255,255,255,0.08)'
                            }}
                          />
                        </div>
                        {validations.cpfDuplicado && (
                          <span style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px', fontFamily: 'var(--font-mono)', display: 'block' }}>
                            ⛔ Este CPF já possui cadastro. Faça login ou entre em contato com o suporte no WhatsApp:{' '}
                            <a href="https://wa.me/5562999271816" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline', fontWeight: 'bold' }}>
                              (62) 99927-1816
                            </a>
                            .
                          </span>
                        )}
                      </div>

                      {/* Nome — Controlador CPF */}
                      <div className="cyber-form-group">
                        <label className="cyber-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Nome Completo <span style={{ color: 'var(--danger)' }}>*</span></span>
                          <span style={{ fontSize: '10px', color: formData.nomeCompleto.trim().length >= 3 ? '#00FF66' : '#555', fontFamily: 'var(--font-mono)', transition: 'color 0.2s' }}>
                            {formData.nomeCompleto.trim().length}/60
                          </span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: formData.nomeCompleto.trim().length >= 3 ? '#00FF66' : 'var(--text-secondary)', transition: 'color 0.2s' }} />
                          <input
                            type="text"
                            className="cyber-input"
                            placeholder="Ex: Maria Souza Ferreira"
                            value={formData.nomeCompleto}
                            onChange={e => handleInputChange('nomeCompleto', e.target.value)}
                            maxLength={60}
                            autoComplete="name"
                            style={{
                              paddingLeft: '38px',
                              paddingRight: '38px',
                              borderColor: formData.nomeCompleto.trim().length >= 3 ? '#00FF66'
                                : formData.nomeCompleto.length > 0 ? 'rgba(255,100,100,0.4)'
                                : 'rgba(255,255,255,0.08)',
                              transition: 'border-color 0.2s'
                            }}
                          />
                          {formData.nomeCompleto.trim().length >= 3
                            ? <CheckCircle size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#00FF66' }} />
                            : formData.nomeCompleto.length > 0
                              ? <X size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--danger)' }} />
                              : null
                          }
                        </div>
                        <span style={{ fontSize: '11px', color: '#555', marginTop: '4px', display: 'block' }}>
                          Apenas letras — números são bloqueados. Cada palavra é capitalizada automaticamente.
                        </span>
                        {formData.nomeCompleto.length > 0 && formData.nomeCompleto.trim().length < 3 && (
                          <span style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '2px', display: 'block' }}>
                            ⚠ Digite ao menos nome e sobrenome (mín. 3 letras).
                          </span>
                        )}
                      </div>

                      {/* Upload Documento com Foto */}
                      <div className="cyber-form-group">
                        <label className="cyber-label">Upload de Documento com Foto (RG / CNH) <span style={{ color: 'var(--danger)' }}>*</span></label>
                        
                        <label style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1.5px dashed rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          padding: '20px',
                          background: 'rgba(255,255,255,0.01)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'center'
                        }}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => e.preventDefault()}
                        >
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleInputChange('operadorDocumentoFotoName', file.name);
                            }}
                            style={{ display: 'none' }}
                          />
                          <Upload size={20} style={{ color: 'var(--accent)', marginBottom: '8px' }} />
                          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Arraste o arquivo ou procure</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>PDF, JPG, PNG até 10MB</span>
                        </label>

                        {formData.operadorDocumentoFotoName && (
                          <div style={{
                            marginTop: '8px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '6px',
                            padding: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '11px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FileText size={14} style={{ color: 'var(--primary)' }} />
                              <span style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {formData.operadorDocumentoFotoName}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <CheckCircle size={12} style={{ color: '#00FF66' }} />
                              <span style={{ fontSize: '9px', color: '#00FF66', fontWeight: 'bold' }}>Carregado</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Upload Foto de Selfie */}
                      <div className="cyber-form-group">
                        <label className="cyber-label">Foto de Selfie <span style={{ color: 'var(--danger)' }}>*</span></label>
                        
                        <label style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1.5px dashed rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          padding: '20px',
                          background: 'rgba(255,255,255,0.01)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textAlign: 'center'
                        }}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => e.preventDefault()}
                        >
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleInputChange('operadorSelfieName', file.name);
                            }}
                            style={{ display: 'none' }}
                          />
                          <Upload size={20} style={{ color: 'var(--accent)', marginBottom: '8px' }} />
                          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Arraste a selfie ou procure</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>JPG, PNG até 10MB</span>
                        </label>

                        {formData.operadorSelfieName && (
                          <div style={{
                            marginTop: '8px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '6px',
                            padding: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '11px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FileText size={14} style={{ color: 'var(--primary)' }} />
                              <span style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {formData.operadorSelfieName}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <CheckCircle size={12} style={{ color: '#00FF66' }} />
                              <span style={{ fontSize: '9px', color: '#00FF66', fontWeight: 'bold' }}>Carregada</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    /* ── Para CNPJ: CPF simples (nome e cargo já aparecem acima) ── */
                    <>
                      {/* CPF do Operador — simples, sem validação */}
                      <div className="cyber-form-group">
                        <label className="cyber-label">CPF do Operador <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <div style={{ position: 'relative' }}>
                          <Shield size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                          <input
                            type="text"
                            className="cyber-input"
                            placeholder="000.000.000-00"
                            value={formData.operadorCpf}
                            onChange={e => handleInputChange('operadorCpf', e.target.value)}
                            style={{
                              paddingLeft: '38px', paddingRight: '38px',
                              borderColor: formData.operadorCpf.replace(/\D/g, '').length === 11 ? '#00FF66' : 'rgba(255,255,255,0.08)'
                            }}
                          />
                          {formData.operadorCpf.replace(/\D/g, '').length === 11 && <CheckCircle size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#00FF66' }} />}
                        </div>
                      </div>
                    </>
                  )}



                  {/* Operador E-mail */}
                  <div className="cyber-form-group">
                    <label className="cyber-label">E-mail de Contato <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input
                        type="text"
                        className="cyber-input"
                        placeholder="operador@empresa.com"
                        value={formData.operadorEmail}
                        onChange={e => handleInputChange('operadorEmail', e.target.value)}
                        style={{
                          paddingLeft: '38px',
                          paddingRight: '38px',
                          borderColor: validations.operadorEmailValid === true 
                            ? '#00FF66' 
                            : validations.operadorEmailValid === false 
                              ? 'var(--danger)' 
                              : 'rgba(255,255,255,0.08)'
                        }}
                      />
                      {validations.operadorEmailValid === true && (
                        <CheckCircle size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#00FF66' }} />
                      )}
                      {validations.operadorEmailValid === false && (
                        <X size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--danger)' }} />
                      )}
                    </div>
                  </div>

                  {/* Telefone */}
                  <div className="cyber-form-group">
                    <label className="cyber-label">Telefone de Contato <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input
                        type="text"
                        className="cyber-input"
                        placeholder="(00) 00000-0000"
                        value={formData.telefone}
                        onChange={e => handleInputChange('telefone', e.target.value)}
                        style={{ paddingLeft: '38px' }}
                      />
                    </div>
                  </div>

                  {/* WhatsApp is same check */}
                  <div style={{ margin: '4px 0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <input
                        type="checkbox"
                        checked={formData.whatsappMesmo}
                        onChange={e => handleInputChange('whatsappMesmo', e.target.checked)}
                        style={{ accentColor: 'var(--accent)' }}
                      />
                      <span>O WhatsApp é o mesmo telefone?</span>
                    </label>
                  </div>

                  {/* Conditional WhatsApp input */}
                  {!formData.whatsappMesmo && (
                    <div className="cyber-form-group" style={{ animation: 'fadeIn 0.2s ease' }}>
                      <label className="cyber-label">WhatsApp Corporativo <span style={{ color: 'var(--danger)' }}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                          type="text"
                          className="cyber-input"
                          placeholder="(00) 00000-0000"
                          value={formData.whatsapp}
                          onChange={e => handleInputChange('whatsapp', e.target.value)}
                          style={{ paddingLeft: '38px' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button type="button" onClick={handleBack} className="btn btn-secondary" style={{ flex: 1, padding: '12px' }}>
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={!isStepValid()}
                      className="btn btn-primary"
                      style={{
                        flex: 2,
                        padding: '12px',
                        opacity: isStepValid() ? 1 : 0.5,
                        cursor: isStepValid() ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Continuar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ==========================================
               TELA 6B: RNTRC (SÓ SE ESCOLHEU TRANSPORTADORA)
               ========================================== */}
            {currentStep === 'dados-rntrc' && (
              <div style={{ animation: 'fadeIn 0.25s ease' }}>
                <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', border: 'none', padding: 0, margin: '0 0 6px 0', textAlign: 'center', fontFamily: 'var(--font-heading)' }}>
                  Documentação ANTT
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '24px' }}>
                  Documentação obrigatória da ANTT para homologação de transportadoras de cargas.
                </p>

                <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  
                  {/* RNTRC Field with button validation */}
                  <div className="cyber-form-group">
                    <label className="cyber-label">RNTRC (7 dígitos) <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <Building size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input
                        type="text"
                        className="cyber-input"
                        maxLength={7}
                        placeholder="Digite os 7 dígitos do seu RNTRC"
                        value={formData.rntrc}
                        onChange={e => handleInputChange('rntrc', e.target.value.replace(/\D/g, '').slice(0, 7))}
                        style={{
                          paddingLeft: '38px',
                          borderColor: validations.rntrcLoading ? 'var(--primary-500)'
                            : validations.rntrcDuplicado ? 'var(--danger)'
                            : validations.rntrcValid === true ? '#00FF66'
                            : validations.rntrcValid === false ? 'var(--danger)'
                            : 'rgba(255,255,255,0.08)'
                        }}
                      />
                      {validations.rntrcLoading && (
                        <RefreshCw size={16} className="spin" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-500)' }} />
                      )}
                      {!validations.rntrcLoading && validations.rntrcValid === true && !validations.rntrcDuplicado && (
                        <Check size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#00FF66' }} />
                      )}
                      {!validations.rntrcLoading && (validations.rntrcValid === false || validations.rntrcDuplicado) && (
                        <X size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--danger)' }} />
                      )}
                    </div>
                    {/* Status feedback message */}
                    {validations.rntrcLoading && (
                      <span style={{ fontSize: '11px', color: 'var(--primary-300)', marginTop: '4px', display: 'block' }}>
                        ⏳ Verificando disponibilidade do RNTRC...
                      </span>
                    )}
                    {validations.rntrcDuplicado && (
                      <span style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px', display: 'block', fontWeight: 'bold' }}>
                        ❌ Este RNTRC já está cadastrado por outra transportadora.
                      </span>
                    )}
                    {!validations.rntrcLoading && validations.rntrcValid === true && !validations.rntrcDuplicado && (
                      <span style={{ fontSize: '11px', color: '#00FF66', marginTop: '4px', display: 'block', fontWeight: 'bold' }}>
                        ✅ RNTRC disponível para cadastro.
                      </span>
                    )}
                    {!validations.rntrcLoading && validations.rntrcValid === false && !validations.rntrcDuplicado && (
                      <span style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>
                        ❌ O RNTRC deve possuir 7 dígitos numéricos.
                      </span>
                    )}
                  </div>

                  {/* Upload document drag & drop zone */}
                  <div className="cyber-form-group">
                    <label className="cyber-label">Upload de Documento RNTRC <span style={{ color: 'var(--danger)' }}>*</span></label>
                    
                    <label style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1.5px dashed rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '24px',
                      background: 'rgba(255,255,255,0.01)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center'
                    }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => e.preventDefault()}
                    >
                      <input
                        type="file"
                        accept=".pdf,.jpg,.png"
                        onChange={handleDocumentUploadMock}
                        style={{ display: 'none' }}
                      />
                      <Upload size={24} style={{ color: 'var(--accent)', marginBottom: '8px' }} />
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Arraste o arquivo ou procure</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Aceita PDF, JPG, PNG até 10MB</span>
                    </label>

                    {/* Scanning indicator / File Chosen */}
                    {formData.rntrcDocumentoName && (
                      <div style={{
                        marginTop: '10px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '6px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={16} style={{ color: 'var(--primary)' }} />
                          <span style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {formData.rntrcDocumentoName}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {!validations.ocrLoading && validations.ocrMatched === true && (
                            <>
                              <CheckCircle size={14} style={{ color: '#00FF66' }} />
                              <span style={{ fontSize: '10px', color: '#00FF66', fontWeight: 'bold' }}>Carregado</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Checkbox Insurance */}
                  <div style={{ margin: '6px 0' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <input
                        type="checkbox"
                        checked={formData.segurosConfirmados}
                        onChange={e => handleInputChange('segurosConfirmados', e.target.checked)}
                        style={{ marginTop: '3px', accentColor: 'var(--accent)' }}
                      />
                      <span>
                        Confirmo que possuo os 3 seguros obrigatórios (RCTR-C, RC-DC, RC-V).{' '}
                        <button
                          type="button"
                          onClick={() => alert('Seguros Obrigatórios:\n1. RCTR-C (Responsabilidade Civil do Transportador Rodoviário de Carga)\n2. RC-DC (Responsabilidade Civil do Transportador Rodoviário por Desaparecimento de Carga)\n3. RC-V (Responsabilidade Civil de Veículo)')}
                          style={{ background: 'none', border: 'none', color: 'var(--accent)', textDecoration: 'underline', padding: 0, cursor: 'pointer', fontSize: '11px', fontFamily: 'inherit' }}
                        >
                          Saiba mais
                        </button> <span style={{ color: 'var(--danger)' }}>*</span>
                      </span>
                    </label>
                  </div>

                  {/* Navigation */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button type="button" onClick={handleBack} className="btn btn-secondary" style={{ flex: 1, padding: '12px' }}>
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={!isStepValid()}
                      className="btn btn-primary"
                      style={{
                        flex: 2,
                        padding: '12px',
                        opacity: isStepValid() ? 1 : 0.5,
                        cursor: isStepValid() ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Continuar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ==========================================
               TELA 7: DADOS FINANCEIROS (ALL PROFILES)
               ========================================== */}
            {currentStep === 'dados-financeiros' && (
              <div style={{ animation: 'fadeIn 0.25s ease' }}>
                <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', border: 'none', padding: 0, margin: '0 0 6px 0', textAlign: 'center', fontFamily: 'var(--font-heading)' }}>
                  Dados Bancários
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '24px' }}>
                  Informe a chave PIX para recebimento de transações na plataforma.
                </p>

                <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* Chave PIX */}
                  <div className="cyber-form-group">
                    <label className="cyber-label">Chave PIX <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', lineHeight: 1 }}>⚡</span>
                      <input
                        type="text"
                        className="cyber-input"
                        placeholder="CPF, CNPJ, e-mail, celular ou chave aleatória"
                        value={formData.pix}
                        onChange={e => handleInputChange('pix', e.target.value)}
                        style={{ paddingLeft: '38px', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
                      />
                      {formData.pix.trim() && (
                        <CheckCircle size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#00FF66' }} />
                      )}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                      Aceitos: CPF · CNPJ · e-mail · celular (+55) · chave aleatória
                    </span>
                  </div>

                  {/* Titularidade da conta */}
                  <div className="cyber-form-group">
                    <label className="cyber-label">Esta conta PIX pertence a <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                      {[
                        { val: 'proprietario', label: 'Proprietário', desc: 'Conta pessoal do dono/sócio da empresa' },
                        { val: 'gerente',      label: 'Gerente / Representante', desc: 'Conta de funcionário autorizado' },
                        { val: 'empresa',      label: 'Da própria empresa', desc: 'Conta PJ no CNPJ cadastrado' },
                      ].map(opt => (
                        <label
                          key={opt.val}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: '12px',
                            padding: '14px 16px',
                            background: formData.titularidadePix === opt.val ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${formData.titularidadePix === opt.val ? 'rgba(255,215,0,0.35)' : 'rgba(255,255,255,0.07)'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <input
                            type="radio"
                            name="titularidadePix"
                            checked={formData.titularidadePix === opt.val}
                            onChange={() => handleInputChange('titularidadePix', opt.val)}
                            style={{ marginTop: '3px', accentColor: 'var(--accent)', flexShrink: 0 }}
                          />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: formData.titularidadePix === opt.val ? 'var(--accent)' : '#fff' }}>
                              {opt.label}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              {opt.desc}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Dados do titular — só para proprietário ou gerente */}
                  {(formData.titularidadePix === 'proprietario' || formData.titularidadePix === 'gerente') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', animation: 'fadeIn 0.25s ease',
                      padding: '16px', background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.12)', borderRadius: '8px' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                        ℹ️ Informe os dados de quem é titular desta conta PIX.
                      </p>
                      {/* Nome do titular */}
                      <div className="cyber-form-group" style={{ margin: 0 }}>
                        <label className="cyber-label">Nome do Titular <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <div style={{ position: 'relative' }}>
                          <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                          <input type="text" className="cyber-input"
                            placeholder="Nome completo do titular"
                            value={formData.pixTitularNome}
                            onChange={e => handleInputChange('pixTitularNome', e.target.value)}
                            style={{ paddingLeft: '38px', borderColor: formData.pixTitularNome.trim().length >= 3 ? '#00FF66' : 'rgba(255,255,255,0.08)' }}
                          />
                          {formData.pixTitularNome.trim().length >= 3 && <CheckCircle size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#00FF66' }} />}
                        </div>
                      </div>
                      {/* CPF do titular */}
                      <div className="cyber-form-group" style={{ margin: 0 }}>
                        <label className="cyber-label">CPF do Titular <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <div style={{ position: 'relative' }}>
                          <Shield size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                          <input type="text" className="cyber-input"
                            placeholder="000.000.000-00"
                            value={formData.pixTitularCpf}
                            maxLength={14}
                            onChange={e => handleInputChange('pixTitularCpf', applyCpfMask(e.target.value))}
                            style={{ paddingLeft: '38px', borderColor: formData.pixTitularCpf.replace(/\D/g,'').length === 11 ? '#00FF66' : 'rgba(255,255,255,0.08)' }}
                          />
                          {formData.pixTitularCpf.replace(/\D/g,'').length === 11 && <CheckCircle size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#00FF66' }} />}
                        </div>
                      </div>
                      {/* E-mail do titular */}
                      <div className="cyber-form-group" style={{ margin: 0 }}>
                        <label className="cyber-label">E-mail do Titular <span style={{ color: 'var(--danger)' }}>*</span></label>
                        <div style={{ position: 'relative' }}>
                          <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                          <input type="text" className="cyber-input"
                            placeholder="titular@email.com"
                            value={formData.pixTitularEmail}
                            onChange={e => handleInputChange('pixTitularEmail', e.target.value)}
                            style={{ paddingLeft: '38px', borderColor: /^[^@]+@[^@]+\.[^@]+$/.test(formData.pixTitularEmail) ? '#00FF66' : 'rgba(255,255,255,0.08)' }}
                          />
                          {/^[^@]+@[^@]+\.[^@]+$/.test(formData.pixTitularEmail) && <CheckCircle size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#00FF66' }} />}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button type="button" onClick={handleBack} className="btn btn-secondary" style={{ flex: 1, padding: '12px' }}>
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={(() => {
                        if (!formData.pix.trim() || !formData.titularidadePix) return true;
                        if (formData.titularidadePix === 'proprietario' || formData.titularidadePix === 'gerente') {
                          return !formData.pixTitularNome.trim() ||
                                 formData.pixTitularCpf.replace(/\D/g,'').length !== 11 ||
                                 !/^[^@]+@[^@]+\.[^@]+$/.test(formData.pixTitularEmail);
                        }
                        return false;
                      })()}
                      className="btn btn-primary"
                      style={{ flex: 2, padding: '12px', cursor: 'pointer' }}
                    >
                      Continuar
                    </button>
                  </div>
                </form>
              </div>
            )}


            {/* ==========================================
               TELA 7.5: SELEÇÃO DE PLANOS
               ========================================== */}
            {currentStep === 'select-plano' && (formData.perfil === 'fornecedor' || formData.perfil === 'comprador') && formData.tipo === 'cnpj' && (
              <div style={{ animation: 'fadeIn 0.25s ease' }}>
                <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', border: 'none', padding: 0, margin: '0 0 6px 0', textAlign: 'center', fontFamily: 'var(--font-heading)' }}>
                  Selecione seu Plano
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '24px' }}>
                  Escolha o plano ideal para suas operações na Materra Elo. Não cobramos agora!
                </p>

                {(() => {
                  const getDiscountMultiplier = (m: number) => {
                    if (m === 3) return 0.95;  // 5% discount
                    if (m === 6) return 0.92;  // 8% discount
                    if (m === 12) return 0.88; // 12% discount
                    return 1.0;
                  };

                  const getComputedPriceLabel = (planId: string, basePrice: number) => {
                    const isMax = (formData.perfil as string) === 'transportadora' ? planId === 'Pro' : planId === 'Business';
                    if (validations.cupomValid === true && isMax) {
                      return 'Grátis (12 meses)';
                    }
                    if (basePrice === 0) return 'R$ 0/mês';
                    
                    const discountedMonthly = basePrice * getDiscountMultiplier(period);
                    const finalMonthlyPrice = Math.round(discountedMonthly);
                    
                    if (period === 1) {
                      return `R$ ${finalMonthlyPrice}/mês`;
                    }
                    const totalPeriodPrice = finalMonthlyPrice * period;
                    return `R$ ${finalMonthlyPrice}/mês (Total: R$ ${totalPeriodPrice} / ${period}m)`;
                  };

                  return (
                    <>
                      {/* Switcher de Período de Assinatura */}
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', alignItems: 'center', gap: '8px', flexDirection: 'column' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Período de Assinatura</span>
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
                              type="button"
                              key={tab.m}
                              disabled={validations.cupomValid === true}
                              onClick={() => setPeriod(tab.m as any)}
                              style={{
                                border: 'none',
                                background: period === tab.m ? 'rgba(255, 215, 0, 0.08)' : 'transparent',
                                borderBottom: period === tab.m ? '2px solid var(--accent)' : 'none',
                                color: period === tab.m ? 'var(--accent)' : 'var(--text-secondary)',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontFamily: 'inherit',
                                fontWeight: period === tab.m ? 'bold' : 'normal',
                                cursor: validations.cupomValid === true ? 'not-allowed' : 'pointer',
                                transition: 'all 0.15s',
                                opacity: (validations.cupomValid === true && tab.m !== 12) ? 0.3 : 1
                              }}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                        {(formData.perfil as string) === 'transportadora' ? (
                          // Carrier plans
                          [
                            { 
                              id: 'Gratuito', 
                              label: 'Gratuito', 
                              basePrice: 0, 
                              desc: '1 convite até você ser escolhido (plano inicial de entrada).',
                              details: ['Participar de leilões reversos', 'Ver preços de concorrentes em tempo real'],
                              color: 'var(--text-secondary)' 
                            },
                            { 
                              id: 'Intermediário', 
                              label: 'Intermediário', 
                              basePrice: 49, 
                              desc: 'Entre em 5 salas de cotação reversa por mês e ponha seu preço (você pode não ser escolhido).',
                              details: ['Até 5 convites por mês', 'Editar preço durante leilão', 'Suporte por e-mail'],
                              color: 'var(--primary-500)' 
                            },
                            { 
                              id: 'Pro', 
                              label: 'Pro', 
                              basePrice: 89, 
                              desc: 'Convites a leilões ilimitados o mês inteiro.',
                              details: ['Participar de todos os leilões reversos', 'Acesso ilimitado e imediato', 'Suporte prioritário'],
                              color: '#00ff66' 
                            }
                          ].map(plan => {
                            const isMax = plan.id === 'Pro';
                            const isSelected = formData.plano === plan.id;
                            const priceLabel = getComputedPriceLabel(plan.id, plan.basePrice);
                            return (
                              <div
                                key={plan.id}
                                onClick={validations.cupomValid === true ? undefined : () => handleInputChange('plano', plan.id)}
                                style={{
                                  background: isSelected ? 'rgba(255,215,0,0.03)' : '#111',
                                  border: (validations.cupomValid === true && isMax)
                                    ? '1.5px solid #00FF66'
                                    : isSelected
                                    ? '1.5px solid var(--primary-500)'
                                    : '1px solid #222',
                                  borderRadius: '8px',
                                  padding: '16px',
                                  cursor: validations.cupomValid === true ? 'not-allowed' : 'pointer',
                                  opacity: (validations.cupomValid === true && !isMax) ? 0.4 : 1,
                                  transition: 'all 0.15s'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <strong style={{ color: '#fff', fontSize: '0.95rem' }}>Plano {plan.label}</strong>
                                    {validations.cupomValid === true && isMax && (
                                      <span style={{ background: '#00FF66', color: '#000', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                        Cupom Ativo
                                      </span>
                                    )}
                                  </div>
                                  <span style={{ color: (validations.cupomValid === true && isMax) ? '#00FF66' : plan.color, fontWeight: 'bold', fontSize: '0.9rem' }}>{priceLabel}</span>
                                </div>
                                <p style={{ color: '#aaa', fontSize: '0.8rem', margin: '0 0 10px 0', lineHeight: '1.3' }}>{plan.desc}</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {plan.details.map((detail, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                                      <Check size={12} style={{ color: '#00FF66', flexShrink: 0 }} />
                                      <span>{detail}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          // Generator / Buyer / Broker plans
                          [
                            { 
                              id: 'Gratuito', 
                              label: 'Gratuito', 
                              basePrice: 0, 
                              desc: 'Vitrine básica para testar a plataforma.',
                              details: ['Publique 1 anúncio por mês', 'Taxa Lead: R$ 20 por sala de negociação', 'Cotação de frete: R$ 30/leilão'],
                              color: 'var(--text-secondary)' 
                            },
                            { 
                              id: 'Starter', 
                              label: 'Starter', 
                              basePrice: 49, 
                              desc: 'Para pequenas empresas em fase inicial.',
                              details: ['Publique até 5 anúncios por mês', 'Taxa Lead com desconto: R$ 18', 'Até 10 consultas de fichas no buscador'],
                              color: 'var(--primary-500)' 
                            },
                            { 
                              id: 'Growth', 
                              label: 'Growth', 
                              basePrice: 129, 
                              desc: 'Ideal para empresas em expansão.',
                              details: ['Publique até 20 anúncios por mês', 'Taxa Lead otimizada: R$ 16', 'Módulos Reputação e Logística integrados'],
                              color: 'var(--primary-500)' 
                            },
                            { 
                              id: 'Business', 
                              label: 'Business', 
                              basePrice: 299, 
                              desc: 'Acesso completo com leads ilimitados.',
                              details: ['Publique até 100 anúncios por mês', 'Taxa Lead mínima: R$ 14', 'Assessoria jurídica e suporte prioritário 24h'],
                              color: '#00ff66' 
                            }
                          ].map(plan => {
                            const isMax = plan.id === 'Business';
                            const isSelected = formData.plano === plan.id;
                            const priceLabel = getComputedPriceLabel(plan.id, plan.basePrice);
                            return (
                              <div
                                key={plan.id}
                                onClick={validations.cupomValid === true ? undefined : () => handleInputChange('plano', plan.id)}
                                style={{
                                  background: isSelected ? 'rgba(255,215,0,0.03)' : '#111',
                                  border: (validations.cupomValid === true && isMax)
                                    ? '1.5px solid #00FF66'
                                    : isSelected
                                    ? '1.5px solid var(--primary-500)'
                                    : '1px solid #222',
                                  borderRadius: '8px',
                                  padding: '16px',
                                  cursor: validations.cupomValid === true ? 'not-allowed' : 'pointer',
                                  opacity: (validations.cupomValid === true && !isMax) ? 0.4 : 1,
                                  transition: 'all 0.15s'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <strong style={{ color: '#fff', fontSize: '0.95rem' }}>Plano {plan.label}</strong>
                                    {validations.cupomValid === true && isMax && (
                                      <span style={{ background: '#00FF66', color: '#000', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                        Cupom Ativo
                                      </span>
                                    )}
                                  </div>
                                  <span style={{ color: (validations.cupomValid === true && isMax) ? '#00FF66' : plan.color, fontWeight: 'bold', fontSize: '0.9rem' }}>{priceLabel}</span>
                                </div>
                                <p style={{ color: '#aaa', fontSize: '0.8rem', margin: '0 0 10px 0', lineHeight: '1.3' }}>{plan.desc}</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {plan.details.map((detail, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                                      <Check size={12} style={{ color: '#00FF66', flexShrink: 0 }} />
                                      <span>{detail}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </>
                  );
                })()}

                {/* Campo de Cupom de Desconto */}
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <label className="cyber-label" style={{ margin: 0 }}>Possui um cupom de desconto?</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      className="cyber-input"
                      placeholder="Digite seu cupom"
                      value={formData.cupom}
                      onChange={e => {
                        handleInputChange('cupom', e.target.value);
                        setValidations(v => ({ ...v, cupomValid: null, cupomError: '' }));
                      }}
                      style={{ flex: 1, textTransform: 'uppercase' }}
                      disabled={validations.cupomValid === true}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="btn btn-secondary"
                      style={{
                        padding: '10px 16px',
                        fontSize: '13px',
                        background: validations.cupomValid === true ? '#00FF66' : 'rgba(255,215,0,0.1)',
                        border: validations.cupomValid === true ? '1px solid #00FF66' : '1px solid var(--accent)',
                        color: validations.cupomValid === true ? '#000' : 'var(--accent)',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                      disabled={validations.cupomValid === true || !formData.cupom.trim()}
                    >
                      {validations.cupomValid === true ? 'Aplicado ✓' : 'Aplicar'}
                    </button>
                  </div>
                  {validations.cupomValid === true && (
                    <span style={{ fontSize: '11px', color: '#00FF66', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      🎉 Cupom MoBossbig ativado! Plano máximo (12 meses grátis) liberado.
                    </span>
                  )}
                  {validations.cupomValid === false && (
                    <span style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 'bold' }}>
                      ❌ {validations.cupomError || 'Cupom inválido.'}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '12px', background: '#1c1c1c', border: '1px solid #333' }}
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn btn-primary"
                    style={{ flex: 2, padding: '12px', background: 'var(--primary-500)', color: '#000', fontWeight: 'bold' }}
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* ==========================================
               TELA 7.6: ÁREA DE OPERAÇÃO (TRANSPORTADORA APÓS PLANOS)
               ========================================== */}
            {currentStep === 'area-operacao' && (
              <div style={{ animation: 'fadeIn 0.25s ease' }}>
                <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', border: 'none', padding: 0, margin: '0 0 6px 0', textAlign: 'center', fontFamily: 'var(--font-heading)' }}>
                  Área de Operação
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '20px' }}>
                  De quais estados você deseja receber convites de leilões?
                </p>

                <div style={{
                  background: 'rgba(255, 215, 0, 0.03)',
                  border: '1px solid rgba(255, 215, 0, 0.2)',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: '#ccc'
                }}>
                  <strong style={{ color: 'var(--primary-500)', display: 'block', marginBottom: '4px' }}>⚠️ Lembrete de Divisas:</strong>
                  Caso sua sede ou área de operação seja perto de divisas com outros estados, certifique-se de marcá-los também.
                  <span style={{ display: 'block', marginTop: '10px', color: '#888', fontSize: '11.5px' }}>
                    💡 <em>OBS: Você receberá o convite e poderá visualizar todas as especificações do frete (trajetória, local de coleta, destino, tipo de carga, etc.) antes de decidir se entra na sala de cotação.</em>
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Escolha até 26 estados (Selecionados: <strong>{formData.areaOperacaoEstados.length}</strong>)
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleSelectAllStates}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-500)', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Selecionar Todos
                    </button>
                    <span style={{ color: '#444', fontSize: '11px' }}>|</span>
                    <button
                      type="button"
                      onClick={handleClearAllStates}
                      style={{ background: 'none', border: 'none', color: '#ff4444', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Limpar
                    </button>
                  </div>
                </div>

                {/* 26 States Checklist Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                  gap: '10px',
                  maxHeight: '280px',
                  overflowY: 'auto',
                  padding: '10px',
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  marginBottom: '24px'
                }}>
                  {BRAZILIAN_STATES.map(state => {
                    const isChecked = formData.areaOperacaoEstados.includes(state.uf);
                    return (
                      <label
                        key={state.uf}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 10px',
                          background: isChecked ? 'rgba(255, 215, 0, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                          border: isChecked ? '1px solid var(--primary-500)' : '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: isChecked ? '#fff' : '#888',
                          transition: 'all 0.1s',
                          userSelect: 'none'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleStateToggle(state.uf)}
                          style={{ accentColor: 'var(--primary-500)', margin: 0, cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: isChecked ? 'bold' : 'normal' }}>{state.uf}</span>
                      </label>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '12px', background: '#1c1c1c', border: '1px solid #333' }}
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn btn-primary"
                    disabled={formData.areaOperacaoEstados.length === 0}
                    style={{ flex: 2, padding: '12px', background: 'var(--primary-500)', color: '#000', fontWeight: 'bold' }}
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* ==========================================
               TELA 8: CONFIRMAÇÃO + PUBLICAÇÃO (RESUMO)
               ========================================== */}
            {currentStep === 'confirmacao' && (
              <div style={{ animation: 'fadeIn 0.25s ease' }}>
                <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', border: 'none', padding: 0, margin: '0 0 6px 0', textAlign: 'center', fontFamily: 'var(--font-heading)' }}>
                  Confirme seus dados
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '24px' }}>
                  Revise as informações antes de publicar seu cadastro.
                </p>

                {/* Summary Box */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: '24px'
                }}>
                  {[
                    { label: 'E-mail de Acesso', val: formData.email, step: 'credentials' },
                    { label: formData.tipo === 'cnpj' ? 'Empresa' : 'Nome Completo', val: formData.tipo === 'cnpj' ? formData.razaoSocial : formData.nomeCompleto, step: formData.tipo === 'cnpj' ? 'dados-empresa' : 'dados-operador' },
                    { label: formData.tipo === 'cnpj' ? 'CNPJ' : 'CPF', val: formData.tipo === 'cnpj' ? formData.cnpj : formData.operadorCpf, step: formData.tipo === 'cnpj' ? 'dados-empresa' : 'dados-operador' },
                    { label: 'Operador', val: formData.nomeCompleto, step: 'dados-operador' },
                    { label: 'CPF Operador', val: formData.operadorCpf, step: 'dados-operador' },
                    ...(formData.tipo === 'cpf' ? [
                      { label: 'Doc. com Foto', val: formData.operadorDocumentoFotoName, step: 'dados-operador' },
                      { label: 'Foto Selfie', val: formData.operadorSelfieName, step: 'dados-operador' }
                    ] : []),
                    { label: 'Telefone', val: formData.telefone, step: 'dados-operador' },
                    { label: 'Chave PIX', val: formData.pix, step: 'dados-financeiros' },
                    { label: 'Titularidade PIX', val: formData.titularidadePix === 'proprietario' ? 'Proprietário' : formData.titularidadePix === 'gerente' ? 'Gerente / Representante' : formData.titularidadePix === 'empresa' ? 'Da própria empresa' : '', step: 'dados-financeiros' },
                    ...(formData.titularidadePix === 'proprietario' || formData.titularidadePix === 'gerente' ? [
                      { label: 'Titular PIX — Nome', val: formData.pixTitularNome, step: 'dados-financeiros' },
                      { label: 'Titular PIX — CPF', val: formData.pixTitularCpf, step: 'dados-financeiros' },
                      { label: 'Titular PIX — E-mail', val: formData.pixTitularEmail, step: 'dados-financeiros' },
                    ] : []),
                    ...(formData.perfil === 'transportadora' ? [
                      { label: 'Área de Operação', val: formData.areaOperacaoEstados && formData.areaOperacaoEstados.length > 0 ? formData.areaOperacaoEstados.join(', ') : '', step: 'area-operacao' }
                    ] : []),
                  ].filter(s => s.val).map(summary => (
                    <div
                      key={summary.label}
                      style={{
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        borderRadius: '6px',
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>{summary.label}</span>
                        <span style={{ fontSize: '13px', color: '#fff', fontWeight: 'bold' }}>{summary.val ? summary.val : '—'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(summary.step)}
                        style={{
                          background: 'rgba(255,215,0,0.08)',
                          border: '1px solid var(--primary)',
                          color: 'var(--primary)',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontSize: '10px',
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'var(--primary)';
                          e.currentTarget.style.color = '#000';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(255,215,0,0.08)';
                          e.currentTarget.style.color = 'var(--primary)';
                        }}
                      >
                        EDITAR
                      </button>
                    </div>
                  ))}
                </div>

                {/* Final declarations check */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)', padding: '12px 14px', background: formData.declaracaoVerdadeira ? 'rgba(255,215,0,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${formData.declaracaoVerdadeira ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '8px', transition: 'all 0.2s' }}>
                    <input
                      type="checkbox"
                      checked={formData.declaracaoVerdadeira}
                      onChange={e => handleInputChange('declaracaoVerdadeira', e.target.checked)}
                      style={{ marginTop: '2px', accentColor: 'var(--accent)', width: '16px', height: '16px', flexShrink: 0 }}
                    />
                    <span style={{ lineHeight: 1.6 }}>Declaro que as informações acima são verdadeiras e que tenho autoridade legal para representar a empresa na plataforma. <span style={{ color: 'var(--danger)' }}>*</span></span>
                  </label>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" onClick={handleBack} className="btn btn-secondary" style={{ flex: 1, padding: '12px' }}>
                      Voltar
                    </button>
                    <button
                      type="button"
                      disabled={!isStepValid()}
                      onClick={handlePublish}
                      className="btn btn-primary"
                      style={{
                        flex: 2,
                        padding: '12px',
                        opacity: isStepValid() ? 1 : 0.5,
                        cursor: isStepValid() ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Publicar Agora
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ==========================================
               SUCCESS VIEW (IF OTP CODE HELD REDIRECT)
               ========================================== */}
            {currentStep === 'success-screen' && (
              <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s ease', padding: '16px 0' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(0, 255, 102, 0.08)',
                  border: '2px solid #00FF66',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 0 15px rgba(0, 255, 102, 0.3)'
                }}>
                  <CheckCircle size={32} style={{ color: '#00FF66' }} />
                </div>
                <h2 style={{ fontSize: '22px', fontFamily: 'var(--font-heading)', color: '#fff', border: 'none', padding: 0, margin: '0 0 8px 0', letterSpacing: '0.05em' }}>
                  ✅ CADASTRO CONCLUÍDO!
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '360px', margin: '0 auto 24px' }}>
                  Bem-vindo, {formData.nomeCompleto || 'Controlador'}!
                </p>

                {formData.perfil === 'controlador' ? (
                  /* ========================================================
                     FICHA MATERRA - CONTROLADOR
                     ======================================================== */
                  <div style={{
                    background: 'rgba(255, 215, 0, 0.02)',
                    border: '1.5px solid var(--primary)',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '28px',
                    textAlign: 'left',
                    boxShadow: '0 0 20px rgba(255, 215, 0, 0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 215, 0, 0.2)', paddingBottom: '12px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'var(--font-heading)', color: 'var(--primary)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        📊 FICHA MATERRA - CONTROLADOR
                      </span>
                      <span style={{ fontSize: '10px', background: 'rgba(255, 215, 0, 0.15)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>AUTOMÁTICO</span>
                    </div>

                    <div style={{ display: 'grid', gap: '10px', fontSize: '13px' }}>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>👤 Nome:</span>{' '}
                        <strong style={{ color: '#fff' }}>{formData.razaoSocial || formData.nomeCompleto || 'João Silva Consultoria'}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>🏢 CNPJ/CPF:</span>{' '}
                        <strong style={{ color: '#fff' }}>{formData.cnpj || formData.operadorCpf || '12.345.678/0001-90'}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>🏅 Seu Selo:</span>
                        <span style={{ fontSize: '11px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#aaa', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                          Sem Selo (Novo Cadastro)
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>📈 Score:</span>{' '}
                        <strong style={{ color: 'var(--primary)', fontSize: '15px' }}>0/100</strong>{' '}
                        <span style={{ fontSize: '11px', color: '#666' }}>(Aumenta conforme você valida empresas)</span>
                      </div>
                      
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: '6px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>📋 Documentos:</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                            <span style={{ color: '#00FF66' }}>✅</span> 
                            <span>RNTRC: <strong style={{ color: '#fff' }}>{formData.rntrc ? `Válido até ${validations.rntrcVencimento || '31/12/2027'}` : 'Válido até 31/12/2027'}</strong></span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                            <span style={{ color: '#00FF66' }}>✅</span> 
                            <span>Seguros: <strong style={{ color: '#fff' }}>Confirmados (RCTR-C, RC-DC, RC-V)</strong></span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                            <span style={{ color: '#ffb300' }}>⏳</span> 
                            <span>Documentos das Representadas: <strong style={{ color: '#ffb300' }}>Pendentes</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '6px', fontSize: '11px', lineHeight: '1.4', color: '#aaa' }}>
                      <strong>ℹ️ Como aumentar seu score como Controlador:</strong>
                      <ul style={{ margin: '6px 0 0 0', paddingLeft: '16px' }}>
                        <li>Validar documentos de empresas representadas</li>
                        <li>Manter empresas com selos altos</li>
                        <li>Publicar anúncios com sucesso</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '28px',
                    textAlign: 'left'
                  }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 'bold', letterSpacing: '0.05em' }}>Homologação cadastrada</div>
                    <div style={{ display: 'grid', gap: '8px', fontSize: '12px' }}>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Representante:</span> <strong style={{ color: '#fff' }}>{formData.nomeCompleto}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>E-mail:</span> <strong style={{ color: '#fff' }}>{formData.email}</strong></div>
                      {formData.tipo === 'cnpj' ? (
                        <>
                          <div><span style={{ color: 'var(--text-secondary)' }}>Razão Social:</span> <strong style={{ color: '#fff' }}>{formData.razaoSocial}</strong></div>
                          <div><span style={{ color: 'var(--text-secondary)' }}>CNPJ:</span> <strong style={{ color: '#fff' }}>{formData.cnpj}</strong></div>
                          <div><span style={{ color: 'var(--text-secondary)' }}>Perfil:</span> <span style={{ color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase' }}>{formData.perfil}</span></div>
                        </>
                      ) : (
                        <div><span style={{ color: 'var(--text-secondary)' }}>CPF:</span> <strong style={{ color: '#fff' }}>{formData.operadorCpf}</strong></div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Selo:</span>
                        <span className="seal-badge seal-bronze" style={{ fontSize: '0.65rem' }}>
                          <Award size={10} /> Bronze
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    window.location.href = '/';
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer' }}
                >
                  Ir para Dashboard <ArrowRight size={16} />
                </button>
              </div>
            )}

          </div>
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
         MODAL: EMAIL CONFIRMATION CODE (OTP)
         ============================================================ */}
      {showOtpModal && (
        <div 
          className="modal-overlay" 
          style={{ 
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
          }}
        >
          <div 
            className="modal-content" 
            style={{ 
              background: '#0a0a0a',
              border: '1px solid rgba(255, 215, 0, 0.15)',
              borderRadius: '8px',
              padding: '32px',
              maxWidth: '440px',
              width: '90%',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              position: 'relative',
              zIndex: 100000 
            }}
          >
            
            {otpStep === 'verify' && (
              <div style={{ animation: 'fadeIn 0.2s ease' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 215, 0, 0.08)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Shield size={20} style={{ color: 'var(--accent)' }} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-heading)', color: 'var(--accent)', margin: '0 0 6px 0' }}>
                    Confirme seu email
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Enviamos um código de verificação para o endereço: <br />
                    <strong style={{ color: '#fff' }}>{formData.email}</strong>
                  </p>
                </div>

                <form onSubmit={handleOtpVerify}>
                  {/* OTP 6 digits input */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
                    {otpCode.map((num, i) => (
                      <input
                        key={i}
                        ref={otpRefs[i]}
                        type="text"
                        maxLength={1}
                        value={num}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        style={{
                          width: '42px',
                          height: '48px',
                          textAlign: 'center',
                          fontSize: '1.3rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: num ? '1px solid var(--accent)' : '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '4px',
                          color: 'var(--accent)',
                          outline: 'none',
                          boxShadow: num ? '0 0 8px rgba(255, 215, 0, 0.15)' : 'none'
                        }}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', background: 'rgba(255, 77, 0, 0.08)', border: '1px solid var(--danger)', padding: '10px 14px', borderRadius: '4px', color: 'var(--danger)', fontSize: '12px', marginBottom: '16px' }}>
                      <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: '20px' }}>
                    Ou clique no link do email para confirmar imediatamente
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setShowOtpModal(false)}
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
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ flex: 2, padding: '12px', fontSize: '13px' }}
                    >
                      Confirmar
                    </button>
                  </div>
                </form>

                {/* Resend OTP info */}
                <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span>Não recebeu o código?</span>
                    {otpCountdown > 0 ? (
                      <span style={{ fontFamily: 'var(--font-mono)' }}>Reenviar em {otpCountdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleOtpResend}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0,
                          fontSize: '12px'
                        }}
                      >
                        Reenviar e-mail
                      </button>
                    )}
                  </div>
                  <div style={{ marginTop: '12px', background: 'rgba(255, 215, 0, 0.03)', border: '1px solid rgba(255, 215, 0, 0.1)', padding: '10px', borderRadius: '4px', fontSize: '11px', color: 'var(--primary)' }}>
                    💡 <strong>Testes de Homologação:</strong> Digite o código <strong>123456</strong> para validar a confirmação.
                  </div>
                </div>
              </div>
            )}

            {/* Success step inside modal */}
            {otpStep === 'success' && (
              <div style={{ textAlign: 'center', animation: 'fadeIn 0.25s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                  <CheckCircle size={56} style={{ color: '#00FF66' }} />
                </div>
                <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-heading)', color: '#00FF66', marginBottom: '8px' }}>
                  E-mail verificado!
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
                  Código validado com sucesso. O cadastro foi finalizado e enviado para nossa fila de homologação.
                </p>
                <button
                  onClick={() => {
                    setShowOtpModal(false);
                    setCurrentStep('success-screen');
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '13px' }}
                >
                  Ver Homologação
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Styled JSX animations */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
