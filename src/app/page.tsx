'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ESTADOS_BRASIL, ACONDICIONAMENTOS, WHATSAPP_NUM } from '@/lib/constants'
import { CATALOGO_MATERRA_ELO } from '@/lib/catalogo'

// Typographic Logo component
const LogoBrand = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
    <img src="/logo.png" alt="Logo" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
    <span style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.03em' }}>
      <span style={{ fontSize: '1.9rem', color: 'var(--primary-500)' }}>MA</span>
      <span style={{ color: 'var(--primary-500)' }}>terra</span>{' '}
      <span style={{ color: '#fff', fontWeight: 300, fontSize: '1.1rem' }}>elo</span>
    </span>
  </span>
)

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
    <span style={{ color: 'var(--primary-500)', fontWeight: 'bold', fontFamily: 'monospace' }}>
      {timeLeft}
    </span>
  )
}

const IMPOSTOMETRO_DADOS = [
  { t: 170000000, r: 12000000000, u: 't', flow: 'Bagaço de cana → Bioeletricidade', meta: '~170 milhões t/ano · ~R$ 12 bi/ano · UNICA', rate: '≈ 19.406 t/h · R$ 1,37 milhão/h' },
  { t: 360000000, r: 4000000000, u: 'm³', flow: 'Vinhaça → Fertirrigação', meta: '~360 bilhões L/ano · ~R$ 4 bi/ano · UNICA', rate: '≈ 41.096 m³/h · R$ 457 mil/h' },
  { t: 4000000, r: 6000000000, u: 't', flow: 'DDGS milho → Ração animal', meta: '~4 milhões t/ano · ~R$ 6 bi/ano · UNEM', rate: '≈ 457 t/h · R$ 685 mil/h' },
  { t: 12000000, r: 3000000000, u: 't', flow: 'Cama de frango → Fertilizante organomineral', meta: '~12 milhões t/ano · ~R$ 3 bi/ano · ABPA', rate: '≈ 1.370 t/h · R$ 342 mil/h' },
  { t: 7000000, r: 2000000000, u: 't', flow: 'Bagaço de laranja → Ração e pectina', meta: '~7 milhões t/ano · ~R$ 2 bi/ano · CitrusBR', rate: '≈ 799 t/h · R$ 228 mil/h' },
  { t: 800000, r: 4000000000, u: 't', flow: 'Sebo bovino → Biodiesel', meta: '~800 mil t/ano · ~R$ 4 bi/ano · ANP (Boletim do Biodiesel)', rate: '≈ 91 t/h · R$ 457 mil/h' },
  { t: 100000000, r: 2000000000, u: 'm³', flow: 'Dejeto suíno → Biogás e energia', meta: '~100 milhões m³/ano · ~R$ 2 bi/ano · CIBiogás / Embrapa', rate: '≈ 11.416 m³/h · R$ 228 mil/h' },
  { t: 100000000, r: 4000000000, u: 't', flow: 'RCC (entulho) → Agregado reciclado', meta: '~100 milhões t/ano · ~R$ 4 bi/ano · ABRECON / Conama 307', rate: '≈ 11.416 t/h · R$ 457 mil/h' },
  { t: 2800000, r: 1200000000, u: 't', flow: 'Casca de arroz → Energia + sílica para cimento', meta: '~2,8 milhões t/ano · ~R$ 1,2 bi/ano · IRGA', rate: '≈ 320 t/h · R$ 137 mil/h' }
]

const SEG_ANO = 31536000;
const fmt2 = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtR = (v: number) => 'R$ ' + Math.floor(v).toLocaleString('pt-BR');

const MercadoPotencialSection = () => {
  const [sessionStartTime] = useState(() => Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - sessionStartTime);
    }, 100);
    return () => clearInterval(timer);
  }, [sessionStartTime]);

  const dtSec = elapsedTime / 1000;
  let totalVolume = 0;
  let totalValue = 0;

  return (
    <section id="mercado-potencial" style={{
      maxWidth: '1100px',
      margin: '60px auto',
      padding: '40px 20px',
      background: '#0a0a0a',
      border: '1px solid #222',
      borderRadius: '16px',
      boxShadow: 'var(--shadow-lg)'
    }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '8px', textAlign: 'center' }}>
        O Brasil é a maior fazenda do planeta — e a maior pilha de coprodutos também
      </h2>
      <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '32px', textAlign: 'center', maxWidth: '800px', margin: '0 auto 32px' }}>
        Sete fluxos do agro e da pecuária, todos com dados publicados por entidade setorial.
        Os contadores começam em zero ao abrir a página.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {IMPOSTOMETRO_DADOS.map((item, idx) => {
          const generated = (item.t / SEG_ANO) * dtSec;
          const value = (item.r / SEG_ANO) * dtSec;
          totalVolume += generated;
          totalValue += value;

          return (
            <div key={idx} className="imp-card" style={{
              background: '#121212',
              border: '1px solid #222',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#fff', marginBottom: '4px' }}>
                  {item.flow}
                </div>
                <div style={{ color: '#888', fontSize: '0.75rem', marginBottom: '12px', lineHeight: '1.4' }}>
                  {item.meta}
                </div>
              </div>
              
              <div style={{ borderTop: '1px solid #222', paddingTop: '12px' }}>
                <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  Gerado desde que você abriu
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--primary-500)', marginBottom: '8px' }}>
                  {fmt2(generated)} {item.u}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  Valor reciclável
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '1.3rem', fontWeight: 'bold', color: '#4caf50', marginBottom: '8px' }}>
                  {fmtR(value)}
                </div>
              </div>
              
              <div style={{ fontSize: '0.75rem', color: '#888', background: '#0a0a0a', padding: '6px 10px', borderRadius: '4px', textAlign: 'center', marginTop: '8px' }}>
                {item.rate}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(76, 175, 80, 0.04) 100%)',
        border: '1px solid var(--primary-500)',
        borderRadius: '12px',
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>
            Total acumulado nesta sessão (t + m³)
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 900, color: 'var(--primary-500)' }}>
            {fmt2(totalVolume)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#aaa', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>
            Valor reciclável total acumulado
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 900, color: '#4caf50' }}>
            {fmtR(totalValue)}
          </div>
        </div>
      </div>

      <p style={{ color: '#666', fontSize: '0.75rem', lineHeight: '1.5', marginTop: '16px', textAlign: 'center', margin: '16px 0 0' }}>
        Estimativas com base em dados públicos da UNICA, UNEM, ABPA, CitrusBR, ANP, CIBiogás, ABRECON e IRGA. Cada fornecedor que entra na Materra Elo é um pedaço desse fluxo.
      </p>
    </section>
  );
};

// Goiânia/Goiás Seed Advertisements (from PDF)
const MOCK_SEED_ANUNCIOS = [
  // --- OFERTAS (19 items) ---
  {
    id: "seed-off-01",
    codigo: "MAT-OFF01",
    tipo_anuncio: "Oferta",
    categoria: "Orgânicos",
    residuo: "Resíduo de abatedouro (sebo e ossos)",
    classe: "IIA",
    quantidade: 40,
    unidade: "t",
    frequencia: "Semanal",
    acondicionamento: "Caçamba",
    uf: "GO",
    municipio: "Anápolis",
    forma_cobranca: "Recebo pelo resíduo",
    valor_desejado: 150,
    valor_index: 150,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-20",
    cadastros: { nome_ou_razao: "JBS", nivel_selo: "Ouro", selo_verificado: true }
  },
  {
    id: "seed-off-02",
    codigo: "MAT-OFF02",
    tipo_anuncio: "Oferta",
    categoria: "Lodos",
    residuo: "Lodo de ETE de frigorífico",
    classe: "IIA",
    quantidade: 50,
    unidade: "t",
    frequencia: "Mensal",
    acondicionamento: "Tambor",
    uf: "GO",
    municipio: "Anápolis",
    forma_cobranca: "Pago pela destinação",
    valor_desejado: 200,
    valor_index: 200,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Descendente",
    data_publicacao: "2026-05-21",
    cadastros: { nome_ou_razao: "JBS", nivel_selo: "Ouro", selo_verificado: true }
  },
  {
    id: "seed-off-03",
    codigo: "MAT-OFF03",
    tipo_anuncio: "Oferta",
    categoria: "Fertilizante/organomineral",
    residuo: "Cama de frango e resíduo de abate de aves",
    classe: "IIA",
    quantidade: 100,
    unidade: "t",
    frequencia: "Semanal",
    acondicionamento: "A granel",
    uf: "GO",
    municipio: "Rio Verde",
    forma_cobranca: "Recebo pelo resíduo",
    valor_desejado: 70,
    valor_index: 70,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-22",
    cadastros: { nome_ou_razao: "BRF", nivel_selo: "Ouro", selo_verificado: true }
  },
  {
    id: "seed-off-04",
    codigo: "MAT-OFF04",
    tipo_anuncio: "Oferta",
    categoria: "Orgânicos",
    residuo: "Bagaço de cana",
    classe: "IIA",
    quantidade: 300,
    unidade: "t",
    frequencia: "Diária",
    acondicionamento: "A granel",
    uf: "GO",
    municipio: "Jataí",
    forma_cobranca: "Recebo pelo resíduo",
    valor_desejado: 50,
    valor_index: 50,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-22",
    cadastros: { nome_ou_razao: "Raízen", nivel_selo: "Ouro", selo_verificado: true }
  },
  {
    id: "seed-off-05",
    codigo: "MAT-OFF05",
    tipo_anuncio: "Oferta",
    categoria: "Fertilizante/organomineral",
    residuo: "Torta de filtro",
    classe: "IIA",
    quantidade: 200,
    unidade: "t",
    frequencia: "Semanal",
    acondicionamento: "A granel",
    uf: "GO",
    municipio: "Jataí",
    forma_cobranca: "Recebo pelo resíduo",
    valor_desejado: 40,
    valor_index: 60,
    percentual_desvio: "-33.3% do Index",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-23",
    cadastros: { nome_ou_razao: "Raízen", nivel_selo: "Ouro", selo_verificado: true }
  },
  {
    id: "seed-off-06",
    codigo: "MAT-OFF06",
    tipo_anuncio: "Oferta",
    categoria: "Fertilizante/organomineral",
    residuo: "Vinhaça para fertirrigação",
    classe: "IIA",
    quantidade: 500,
    unidade: "m³",
    frequencia: "Diária",
    acondicionamento: "A granel",
    uf: "GO",
    municipio: "Jataí",
    forma_cobranca: "Recebo pelo resíduo",
    valor_desejado: 0,
    valor_index: 0,
    percentual_desvio: "Doação",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-23",
    cadastros: { nome_ou_razao: "Raízen", nivel_selo: "Ouro", selo_verificado: true }
  },
  {
    id: "seed-off-07",
    codigo: "MAT-OFF07",
    tipo_anuncio: "Oferta",
    categoria: "Outros",
    residuo: "Cinzas de caldeira a biomassa",
    classe: "IIA",
    quantidade: 30,
    unidade: "t",
    frequencia: "Mensal",
    acondicionamento: "Caçamba",
    uf: "GO",
    municipio: "Goianésia",
    forma_cobranca: "Pago pela destinação",
    valor_desejado: 100,
    valor_index: 100,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Descendente",
    data_publicacao: "2026-05-24",
    cadastros: { nome_ou_razao: "Jalles Machado", nivel_selo: "Ouro", selo_verificado: true }
  },
  {
    id: "seed-off-08",
    codigo: "MAT-OFF08",
    tipo_anuncio: "Oferta",
    categoria: "Papel/Papelão",
    residuo: "Embalagens longa vida",
    classe: "IIB",
    quantidade: 5,
    unidade: "t",
    frequencia: "Mensal",
    acondicionamento: "Fardos",
    uf: "GO",
    municipio: "Corumbaíba",
    forma_cobranca: "Recebo pelo resíduo",
    valor_desejado: 500,
    valor_index: 500,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-24",
    cadastros: { nome_ou_razao: "Italac", nivel_selo: "Prata", selo_verificado: true }
  },
  {
    id: "seed-off-09",
    codigo: "MAT-OFF09",
    tipo_anuncio: "Oferta",
    categoria: "Lodos",
    residuo: "Lodo de ETE de laticínio",
    classe: "IIA",
    quantidade: 20,
    unidade: "t",
    frequencia: "Mensal",
    acondicionamento: "Caçamba",
    uf: "GO",
    municipio: "Corumbaíba",
    forma_cobranca: "Pago pela destinação",
    valor_desejado: 200,
    valor_index: 200,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Descendente",
    data_publicacao: "2026-05-24",
    cadastros: { nome_ou_razao: "Italac", nivel_selo: "Prata", selo_verificado: true }
  },
  {
    id: "seed-off-10",
    codigo: "MAT-OFF10",
    tipo_anuncio: "Oferta",
    categoria: "Plásticos",
    residuo: "Filme plástico PEBD",
    classe: "IIB",
    quantidade: 4,
    unidade: "t",
    frequencia: "Semanal",
    acondicionamento: "Fardos",
    uf: "GO",
    municipio: "Bela Vista de Goiás",
    forma_cobranca: "Recebo pelo resíduo",
    valor_desejado: 1800,
    valor_index: 1800,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-25",
    cadastros: { nome_ou_razao: "Laticínios Bela Vista (Piracanjuba)", nivel_selo: "Prata", selo_verificado: true }
  },
  {
    id: "seed-off-11",
    codigo: "MAT-OFF11",
    tipo_anuncio: "Oferta",
    categoria: "Metais",
    residuo: "Sucata metálica de linha automotiva",
    classe: "IIB",
    quantidade: 30,
    unidade: "t",
    frequencia: "Diária",
    acondicionamento: "Caçamba",
    uf: "GO",
    municipio: "Anápolis",
    forma_cobranca: "Recebo pelo resíduo",
    valor_desejado: 650,
    valor_index: 634,
    percentual_desvio: "+2.5% do Index",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-25",
    cadastros: { nome_ou_razao: "Caoa", nivel_selo: "Ouro", selo_verificado: true }
  },
  {
    id: "seed-off-12",
    codigo: "MAT-OFF12",
    tipo_anuncio: "Oferta",
    categoria: "Químicos",
    residuo: "Borra de tinta de pintura automotiva",
    classe: "I",
    quantidade: 3,
    unidade: "t",
    frequencia: "Semanal",
    acondicionamento: "Tambores",
    uf: "GO",
    municipio: "Anápolis",
    forma_cobranca: "Pago pela destinação",
    valor_desejado: 1200,
    valor_index: 1200,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Descendente",
    data_publicacao: "2026-05-25",
    cadastros: { nome_ou_razao: "Caoa", nivel_selo: "Ouro", selo_verificado: true }
  },
  {
    id: "seed-off-13",
    codigo: "MAT-OFF13",
    tipo_anuncio: "Oferta",
    categoria: "Madeira",
    residuo: "Pallets de madeira",
    classe: "IIB",
    quantidade: 300,
    unidade: "unidade",
    frequencia: "Semanal",
    acondicionamento: "A granel",
    uf: "GO",
    municipio: "Anápolis",
    forma_cobranca: "Recebo pelo resíduo",
    valor_desejado: 0,
    valor_index: 0,
    percentual_desvio: "Doação",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-26",
    cadastros: { nome_ou_razao: "Caoa", nivel_selo: "Ouro", selo_verificado: true }
  },
  {
    id: "seed-off-14",
    codigo: "MAT-OFF14",
    tipo_anuncio: "Oferta",
    categoria: "Químicos",
    residuo: "Medicamentos vencidos para incineração",
    classe: "I",
    quantidade: 2,
    unidade: "t",
    frequencia: "Mensal",
    acondicionamento: "Caixas",
    uf: "GO",
    municipio: "Anápolis",
    forma_cobranca: "Pago pela destinação",
    valor_desejado: 5000,
    valor_index: 5000,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Descendente",
    data_publicacao: "2026-05-26",
    cadastros: { nome_ou_razao: "Teuto", nivel_selo: "Ouro", selo_verificado: true }
  },
  {
    id: "seed-off-15",
    codigo: "MAT-OFF15",
    tipo_anuncio: "Oferta",
    categoria: "Papel/Papelão",
    residuo: "Aparas de papelão",
    classe: "IIB",
    quantidade: 8,
    unidade: "t",
    frequencia: "Semanal",
    acondicionamento: "Fardos",
    uf: "GO",
    municipio: "Anápolis",
    forma_cobranca: "Recebo pelo resíduo",
    valor_desejado: 600,
    valor_index: 600,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-26",
    cadastros: { nome_ou_razao: "Teuto", nivel_selo: "Ouro", selo_verificado: true }
  },
  {
    id: "seed-off-16",
    codigo: "MAT-OFF16",
    tipo_anuncio: "Oferta",
    categoria: "Metais",
    residuo: "Sucata metálica de mineração",
    classe: "IIB",
    quantidade: 20,
    unidade: "t",
    frequencia: "Mensal",
    acondicionamento: "Caçamba",
    uf: "GO",
    municipio: "Catalão",
    forma_cobranca: "Recebo pelo resíduo",
    valor_desejado: 650,
    valor_index: 634,
    percentual_desvio: "+2.5% do Index",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-26",
    cadastros: { nome_ou_razao: "Mosaic Fertilizantes", nivel_selo: "Ouro", selo_verificado: true }
  },
  {
    id: "seed-off-17",
    codigo: "MAT-OFF17",
    tipo_anuncio: "Oferta",
    categoria: "Óleos e graxas",
    residuo: "Óleo lubrificante usado",
    classe: "I",
    quantidade: 5,
    unidade: "m³",
    frequencia: "Mensal",
    acondicionamento: "Tambores",
    uf: "GO",
    municipio: "Catalão",
    forma_cobranca: "Pago pela destinação",
    valor_desejado: 0,
    valor_index: 0,
    percentual_desvio: "Doação",
    status: "Anunciado",
    tipo_leilao: "Descendente",
    data_publicacao: "2026-05-27",
    cadastros: { nome_ou_razao: "Mosaic Fertilizantes", nivel_selo: "Ouro", selo_verificado: true }
  },
  {
    id: "seed-off-18",
    codigo: "MAT-OFF18",
    tipo_anuncio: "Oferta",
    categoria: "Borracha",
    residuo: "Pneus OTR inservíveis",
    classe: "IIB",
    quantidade: 50,
    unidade: "unidade",
    frequencia: "Mensal",
    acondicionamento: "A granel",
    uf: "GO",
    municipio: "Barro Alto",
    forma_cobranca: "Pago pela destinação",
    valor_desejado: 0,
    valor_index: 0,
    percentual_desvio: "Doação",
    status: "Anunciado",
    tipo_leilao: "Descendente",
    data_publicacao: "2026-05-27",
    cadastros: { nome_ou_razao: "Anglo American", nivel_selo: "Ouro", selo_verificado: true }
  },
  {
    id: "seed-off-19",
    codigo: "MAT-OFF19",
    tipo_anuncio: "Oferta",
    categoria: "Metais",
    residuo: "Sucata metálica de mineração (Barro Alto)",
    classe: "IIB",
    quantidade: 40,
    unidade: "t",
    frequencia: "Mensal",
    acondicionamento: "Caçamba",
    uf: "GO",
    municipio: "Barro Alto",
    forma_cobranca: "Recebo pelo resíduo",
    valor_desejado: 600,
    valor_index: 634,
    percentual_desvio: "-5.4% do Index",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-27",
    cadastros: { nome_ou_razao: "Anglo American", nivel_selo: "Ouro", selo_verificado: true }
  },

  // --- DEMANDAS (21 items) ---
  {
    id: "seed-dem-01",
    codigo: "MAT-DEM01",
    tipo_anuncio: "Demanda",
    categoria: "Metais",
    residuo: "Compro cobre",
    classe: "IIB",
    quantidade: 2,
    unidade: "t",
    frequencia: "Diária",
    acondicionamento: "Fardos",
    uf: "GO",
    municipio: "Goiânia",
    forma_cobranca: "Pago pelo resíduo",
    valor_desejado: 35000,
    valor_index: 35000,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-23",
    cadastros: { nome_ou_razao: "Sucatas Edilson", nivel_selo: "Bronze", selo_verificado: true }
  },
  {
    id: "seed-dem-02",
    codigo: "MAT-DEM02",
    tipo_anuncio: "Demanda",
    categoria: "Metais",
    residuo: "Compro sucata ferrosa",
    classe: "IIB",
    quantidade: 40,
    unidade: "t",
    frequencia: "Mensal",
    acondicionamento: "Caçamba",
    uf: "GO",
    municipio: "Goiânia",
    forma_cobranca: "Pago pelo resíduo",
    valor_desejado: 650,
    valor_index: 634,
    percentual_desvio: "+2.5% do Index",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-24",
    cadastros: { nome_ou_razao: "Sucatas Edilson", nivel_selo: "Bronze", selo_verificado: true }
  },
  {
    id: "seed-dem-03",
    codigo: "MAT-DEM03",
    tipo_anuncio: "Demanda",
    categoria: "Metais",
    residuo: "Compro sucata de alumínio",
    classe: "IIB",
    quantidade: 5,
    unidade: "t",
    frequencia: "Mensal",
    acondicionamento: "Fardos",
    uf: "GO",
    municipio: "Goiânia",
    forma_cobranca: "Pago pelo resíduo",
    valor_desejado: 6500,
    valor_index: 6500,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-24",
    cadastros: { nome_ou_razao: "Sucatas Edilson", nivel_selo: "Bronze", selo_verificado: true }
  },
  {
    id: "seed-dem-04",
    codigo: "MAT-DEM04",
    tipo_anuncio: "Demanda",
    categoria: "Plásticos",
    residuo: "Compro plástico PP",
    classe: "IIB",
    quantidade: 8,
    unidade: "t",
    frequencia: "Diária",
    acondicionamento: "Fardos",
    uf: "GO",
    municipio: "Aparecida de Goiânia",
    forma_cobranca: "Pago pelo resíduo",
    valor_desejado: 2500,
    valor_index: 2500,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-24",
    cadastros: { nome_ou_razao: "Aparas Macedo", nivel_selo: "Prata", selo_verificado: true }
  },
  {
    id: "seed-dem-05",
    codigo: "MAT-DEM05",
    tipo_anuncio: "Demanda",
    categoria: "Plásticos",
    residuo: "Compro filme PEBD (Macedo)",
    classe: "IIB",
    quantidade: 6,
    unidade: "t",
    frequencia: "Diária",
    acondicionamento: "Fardos",
    uf: "GO",
    municipio: "Goiânia",
    forma_cobranca: "Pago pelo resíduo",
    valor_desejado: 1800,
    valor_index: 1800,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-25",
    cadastros: { nome_ou_razao: "Aparas Macedo", nivel_selo: "Prata", selo_verificado: true }
  },
  {
    id: "seed-dem-06",
    codigo: "MAT-DEM06",
    tipo_anuncio: "Demanda",
    categoria: "Papel/Papelão",
    residuo: "Compro papelão (Goiânia Rec.)",
    classe: "IIB",
    quantidade: 20,
    unidade: "t",
    frequencia: "Diária",
    acondicionamento: "Fardos",
    uf: "GO",
    municipio: "Goiânia",
    forma_cobranca: "Pago pelo resíduo",
    valor_desejado: 600,
    valor_index: 600,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-25",
    cadastros: { nome_ou_razao: "Reciclagem Goiânia", nivel_selo: "Bronze", selo_verificado: true }
  },
  {
    id: "seed-dem-07",
    codigo: "MAT-DEM07",
    tipo_anuncio: "Demanda",
    categoria: "Metais",
    residuo: "Compro ferro e aço",
    classe: "IIB",
    quantidade: 30,
    unidade: "t",
    frequencia: "Diária",
    acondicionamento: "Caçamba",
    uf: "GO",
    municipio: "Goiânia",
    forma_cobranca: "Pago pelo resíduo",
    valor_desejado: 600,
    valor_index: 600,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-25",
    cadastros: { nome_ou_razao: "Reciclagem Goiânia", nivel_selo: "Bronze", selo_verificado: true }
  },
  {
    id: "seed-dem-08",
    codigo: "MAT-DEM08",
    tipo_anuncio: "Demanda",
    categoria: "Metais",
    residuo: "Compro latas de alumínio",
    classe: "IIB",
    quantidade: 3,
    unidade: "t",
    frequencia: "Diária",
    acondicionamento: "Fardos",
    uf: "GO",
    municipio: "Goiânia",
    forma_cobranca: "Pago pelo resíduo",
    valor_desejado: 5500,
    valor_index: 5500,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-26",
    cadastros: { nome_ou_razao: "Reciclagem Goiânia", nivel_selo: "Bronze", selo_verificado: true }
  },
  {
    id: "seed-dem-09",
    codigo: "MAT-DEM09",
    tipo_anuncio: "Demanda",
    categoria: "Plásticos",
    residuo: "Compro PET pós-consumo",
    classe: "IIB",
    quantidade: 10,
    unidade: "t",
    frequencia: "Diária",
    acondicionamento: "Fardos",
    uf: "GO",
    municipio: "Goiânia",
    forma_cobranca: "Pago pelo resíduo",
    valor_desejado: 1900,
    valor_index: 1900,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-26",
    cadastros: { nome_ou_razao: "Copel Recicláveis", nivel_selo: "Prata", selo_verificado: true }
  },
  {
    id: "seed-dem-10",
    codigo: "MAT-DEM10",
    tipo_anuncio: "Demanda",
    categoria: "Vidro",
    residuo: "Compro caco de vidro",
    classe: "IIB",
    quantidade: 15,
    unidade: "t",
    frequencia: "Mensal",
    acondicionamento: "Caçamba",
    uf: "GO",
    municipio: "Goiânia",
    forma_cobranca: "Pago pelo resíduo",
    valor_desejado: 120,
    valor_index: 120,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-26",
    cadastros: { nome_ou_razao: "Copel Recicláveis", nivel_selo: "Prata", selo_verificado: true }
  },
  {
    id: "seed-dem-11",
    codigo: "MAT-DEM11",
    tipo_anuncio: "Demanda",
    categoria: "Plásticos",
    residuo: "Compro EPS isopor",
    classe: "IIB",
    quantidade: 1,
    unidade: "t",
    frequencia: "Mensal",
    acondicionamento: "Fardos",
    uf: "GO",
    municipio: "Goiânia",
    forma_cobranca: "Pago pelo resíduo",
    valor_desejado: 1500,
    valor_index: 1500,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-26",
    cadastros: { nome_ou_razao: "Copel Recicláveis", nivel_selo: "Prata", selo_verificado: true }
  },
  {
    id: "seed-dem-12",
    codigo: "MAT-DEM12",
    tipo_anuncio: "Demanda",
    categoria: "Metais",
    residuo: "Compro sucata ferro velho",
    classe: "IIB",
    quantidade: 25,
    unidade: "t",
    frequencia: "Semanal",
    acondicionamento: "Caçamba",
    uf: "GO",
    municipio: "Anápolis",
    forma_cobranca: "Pago pelo resíduo",
    valor_desejado: 620,
    valor_index: 634,
    percentual_desvio: "-2.2% do Index",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-26",
    cadastros: { nome_ou_razao: "Recicláveis Anápolis", nivel_selo: "Bronze", selo_verificado: true }
  },
  {
    id: "seed-dem-13",
    codigo: "MAT-DEM13",
    tipo_anuncio: "Demanda",
    categoria: "Químicos",
    residuo: "Recebo Classe I para coprocessamento",
    classe: "I",
    quantidade: 50,
    unidade: "t",
    frequencia: "Semanal",
    acondicionamento: "Caçamba",
    uf: "GO",
    municipio: "Edealina",
    forma_cobranca: "Cobro pela destinação",
    valor_desejado: 900,
    valor_index: 900,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Descendente",
    data_publicacao: "2026-05-26",
    cadastros: { nome_ou_razao: "Votorantim Cimentos - Verdera", nivel_selo: "Ouro", selo_verificado: true }
  },
  {
    id: "seed-dem-14",
    codigo: "MAT-DEM14",
    tipo_anuncio: "Demanda",
    categoria: "Químicos",
    residuo: "Recebo borra de tinta Classe I",
    classe: "I",
    quantidade: 10,
    unidade: "t",
    frequencia: "Semanal",
    acondicionamento: "Tambores",
    uf: "GO",
    municipio: "Goiânia",
    forma_cobranca: "Cobro pela destinação",
    valor_desejado: 1200,
    valor_index: 1200,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Descendente",
    data_publicacao: "2026-05-26",
    cadastros: { nome_ou_razao: "Brasil Nutri Ambiental", nivel_selo: "Prata", selo_verificado: true }
  },
  {
    id: "seed-dem-15",
    codigo: "MAT-DEM15",
    tipo_anuncio: "Demanda",
    categoria: "Lodos",
    residuo: "Recebo lodo industrial",
    classe: "I",
    quantidade: 20,
    unidade: "t",
    frequencia: "Semanal",
    acondicionamento: "Caçamba",
    uf: "GO",
    municipio: "Goiânia",
    forma_cobranca: "Cobro pela destinação",
    valor_desejado: 350,
    valor_index: 350,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Descendente",
    data_publicacao: "2026-05-26",
    cadastros: { nome_ou_razao: "Brasil Nutri Ambiental", nivel_selo: "Prata", selo_verificado: true }
  },
  {
    id: "seed-dem-16",
    codigo: "MAT-DEM16",
    tipo_anuncio: "Demanda",
    categoria: "Outros",
    residuo: "Recebo resíduo de saúde (RSS)",
    classe: "I",
    quantidade: 2,
    unidade: "t",
    frequencia: "Diária",
    acondicionamento: "Bombonas",
    uf: "GO",
    municipio: "Goiânia",
    forma_cobranca: "Cobro pela destinação",
    valor_desejado: 4000,
    valor_index: 4000,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Descendente",
    data_publicacao: "2026-05-27",
    cadastros: { nome_ou_razao: "Bio Resíduos Ambiental", nivel_selo: "Ouro", selo_verificado: true }
  },
  {
    id: "seed-dem-17",
    codigo: "MAT-DEM17",
    tipo_anuncio: "Demanda",
    categoria: "Químicos",
    residuo: "Recebo resíduo perigoso para incineração",
    classe: "I",
    quantidade: 1,
    unidade: "t",
    frequencia: "Semanal",
    acondicionamento: "Bombonas",
    uf: "GO",
    municipio: "Goiânia",
    forma_cobranca: "Cobro pela destinação",
    valor_desejado: 5000,
    valor_index: 5000,
    percentual_desvio: "0.0% do Index",
    status: "Anunciado",
    tipo_leilao: "Descendente",
    data_publicacao: "2026-05-27",
    cadastros: { nome_ou_razao: "Bio Resíduos Ambiental", nivel_selo: "Ouro", selo_verificado: true }
  },
  {
    id: "seed-dem-18",
    codigo: "MAT-DEM18",
    tipo_anuncio: "Demanda",
    categoria: "Outros",
    residuo: "Recebo Classe IIA para aterro",
    classe: "IIA",
    quantidade: 60,
    unidade: "t",
    frequencia: "Diária",
    acondicionamento: "Caçamba",
    uf: "GO",
    municipio: "Goiânia",
    forma_cobranca: "Cobro pela destinação",
    valor_desejado: 200,
    valor_index: 190,
    percentual_desvio: "+5.3% do Index",
    status: "Anunciado",
    tipo_leilao: "Descendente",
    data_publicacao: "2026-05-27",
    cadastros: { nome_ou_razao: "Goyazes Ambiental", nivel_selo: "Prata", selo_verificado: true }
  },
  {
    id: "seed-dem-19",
    codigo: "MAT-DEM19",
    tipo_anuncio: "Demanda",
    categoria: "Outros",
    residuo: "Recebo resíduo industrial Classe II",
    classe: "IIA",
    quantidade: 80,
    unidade: "t",
    frequencia: "Diária",
    acondicionamento: "Caçamba",
    uf: "GO",
    municipio: "Goiânia",
    forma_cobranca: "Cobro pela destinação",
    valor_desejado: 180,
    valor_index: 190,
    percentual_desvio: "-5.3% do Index",
    status: "Anunciado",
    tipo_leilao: "Descendente",
    data_publicacao: "2026-05-27",
    cadastros: { nome_ou_razao: "Recom Resíduos", nivel_selo: "Prata", selo_verificado: true }
  },
  {
    id: "seed-dem-20",
    codigo: "MAT-DEM20",
    tipo_anuncio: "Demanda",
    categoria: "Fertilizante/organomineral",
    residuo: "Compro torta de filtro e cama de frango",
    classe: "IIA",
    quantidade: 200,
    unidade: "t",
    frequencia: "Mensal",
    acondicionamento: "A granel",
    uf: "GO",
    municipio: "Rio Verde",
    forma_cobranca: "Pago pelo resíduo",
    valor_desejado: 80,
    valor_index: 60,
    percentual_desvio: "+33.3% do Index",
    status: "Anunciado",
    tipo_leilao: "Ascendente",
    data_publicacao: "2026-05-27",
    cadastros: { nome_ou_razao: "Indústria de fertilizante organomineral", nivel_selo: "Prata", selo_verificado: true }
  },
  {
    id: "seed-dem-21",
    codigo: "MAT-DEM21",
    tipo_anuncio: "Demanda",
    categoria: "Borracha",
    residuo: "Recebo pneus inservíveis para coprocessamento",
    classe: "IIB",
    quantidade: 1000,
    unidade: "unidade",
    frequencia: "Mensal",
    acondicionamento: "A granel",
    uf: "GO",
    municipio: "Edealina",
    forma_cobranca: "Pago pelo resíduo",
    valor_desejado: 0,
    valor_index: 0,
    percentual_desvio: "Doação",
    status: "Anunciado",
    tipo_leilao: "Sem leilão",
    data_publicacao: "2026-05-27",
    cadastros: { nome_ou_razao: "Votorantim Cimentos - Verdera", nivel_selo: "Ouro", selo_verificado: true }
  }
]

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? '#ef5350' : 'none'}
    stroke={filled ? '#ef5350' : '#888'}
    strokeWidth="2"
    style={{ width: '20px', height: '20px', transition: 'transform 0.2s', cursor: 'pointer' }}
    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
)

const RESIDUOS_INDEX_DATA = [
  { name: 'Cobre (Metais)', val: 'R$ 34.800 / t', dir: 'down', pct: '-0.5%' },
  { name: 'Alumínio (Metais)', val: 'R$ 6.350 / t', dir: 'down', pct: '-2.3%' },
  { name: 'Latas de alumínio (Metais)', val: 'R$ 5.600 / t', dir: 'up', pct: '+1.8%' },
  { name: 'Aço (Metais)', val: 'R$ 615 / t', dir: 'up', pct: '+2.5%' },
  { name: 'Sucata ferrosa (Metais)', val: 'R$ 620 / t', dir: 'down', pct: '-2.2%' },
  { name: 'PP (Plásticos)', val: 'R$ 2.450 / t', dir: 'down', pct: '-2.0%' },
  { name: 'PET (Plásticos)', val: 'R$ 1.950 / t', dir: 'up', pct: '+2.6%' },
  { name: 'PEBD (Plásticos)', val: 'R$ 1.780 / t', dir: 'down', pct: '-1.1%' },
  { name: 'EPS isopor (Plásticos)', val: 'R$ 1.500 / t', dir: 'flat', pct: '0.0%' },
  { name: 'Papelão ondulado (Papel/Papelão)', val: 'R$ 620 / t', dir: 'up', pct: '+3.3%' },
  { name: 'Embalagem longa vida (Papel/Papelão)', val: 'R$ 500 / t', dir: 'flat', pct: '0.0%' },
  { name: 'Caco de vidro (Vidro)', val: 'R$ 190 / t', dir: 'down', pct: '-5.0%' },
  { name: 'Garrafas inteiras (Vidro)', val: 'R$ 0,25 / un', dir: 'flat', pct: '0.0%' },
  { name: 'Paletes de madeira (Madeira)', val: 'R$ 18,50 / un', dir: 'up', pct: '+2.7%' },
  { name: 'Serragem (Madeira)', val: 'R$ 85 / t', dir: 'down', pct: '-5.5%' },
  { name: 'Resíduo orgânico compostável (Orgânicos)', val: 'R$ 45 / t', dir: 'flat', pct: '0.0%' },
  { name: 'Óleo vegetal usado (Orgânicos)', val: 'R$ 2,20 / L', dir: 'up', pct: '+4.7%' },
  { name: 'Bagaço de cana (Biomassa)', val: 'R$ 95 / t', dir: 'up', pct: '+5.5%' },
  { name: 'Casca de arroz (Biomassa)', val: 'R$ 70 / t', dir: 'down', pct: '-2.8%' },
  { name: 'Cavaco de eucalipto (Biomassa)', val: 'R$ 145 / t', dir: 'up', pct: '+1.3%' },
  { name: 'Solvente recuperado (Químicos)', val: 'R$ 3,80 / L', dir: 'down', pct: '-1.2%' },
  { name: 'Lama galvânica (Químicos)', val: 'R$ -180 / t (Custo)', dir: 'flat', pct: '0.0%' },
  { name: 'Cinzas de caldeira (Cinzas)', val: 'R$ 35 / t', dir: 'flat', pct: '0.0%' },
  { name: 'Gesso acartonado (Construção)', val: 'R$ -90 / t (Custo)', dir: 'flat', pct: '0.0%' },
  { name: 'Resíduo de gesso limpo (Construção)', val: 'R$ -45 / t (Custo)', dir: 'flat', pct: '0.0%' },
  { name: 'Pneu inservível inteiro (Borracha)', val: 'R$ -1,50 / un (Custo)', dir: 'flat', pct: '0.0%' },
  { name: 'Pneu triturado (Borracha)', val: 'R$ 120 / t', dir: 'up', pct: '+4.3%' },
  { name: 'Pó de couro (Couro/Têxtil)', val: 'R$ -210 / t (Custo)', dir: 'flat', pct: '0.0%' },
  { name: 'Retalho têxtil algodão (Couro/Têxtil)', val: 'R$ 380 / t', dir: 'up', pct: '+1.0%' },
  { name: 'Cinzas de caldeira orgânica (Cinzas)', val: 'R$ 40 / t', dir: 'flat', pct: '0.0%' },
  { name: 'Gesso de fundição (Construção)', val: 'R$ -110 / t (Custo)', dir: 'flat', pct: '0.0%' },
  { name: 'Resíduo de cerâmica vermelha (Construção)', val: 'R$ 25 / t', dir: 'flat', pct: '0.0%' },
  { name: 'Solvente sujo (Químicos)', val: 'R$ -0,80 / L (Custo)', dir: 'flat', pct: '0.0%' },
  { name: 'Varredura de adubo (Químicos)', val: 'R$ 480 / t', dir: 'up', pct: '+1.6%' },
  { name: 'Pilha e bateria (Eletroeletrônicos)', val: 'R$ -4.500 / t (Custo)', dir: 'flat', pct: '0.0%' },
  { name: 'Sucata eletrônica mista (Eletroeletrônicos)', val: 'R$ 1.800 / t', dir: 'up', pct: '+0.5%' },
  { name: 'Lâmpada fluorescente (Eletroeletrônicos)', val: 'R$ -1,20 / un (Custo)', dir: 'flat', pct: '0.0%' },
  { name: 'Óleo lubrificante usado (Lubrificantes)', val: 'R$ 1,60 / L', dir: 'up', pct: '+6.6%' },
  { name: 'Embalagem plástica de óleo (Lubrificantes)', val: 'R$ -0,90 / kg (Custo)', dir: 'flat', pct: '0.0%' },
  { name: 'Filtro de óleo automotivo (Lubrificantes)', val: 'R$ -0,75 / un (Custo)', dir: 'flat', pct: '0.0%' },
  { name: 'Areia de fundição fenólica (Fundição)', val: 'R$ -65 / t (Custo)', dir: 'flat', pct: '0.0%' },
  { name: 'Areia de fundição bentonítica (Fundição)', val: 'R$ 15 / t', dir: 'flat', pct: '0.0%' },
  { name: 'Escória de aciaria (Siderurgia)', val: 'R$ 12 / t', dir: 'flat', pct: '0.0%' },
  { name: 'Escória de alto forno (Siderurgia)', val: 'R$ 38 / t', dir: 'flat', pct: '0.0%' },
  { name: 'Poeira de aciaria elétrica (Siderurgia)', val: 'R$ -380 / t (Custo)', dir: 'flat', pct: '0.0%' },
  { name: 'Lodo de ETE industrial (Saneamento)', val: 'R$ -220 / t (Custo)', dir: 'flat', pct: '0.0%' },
  { name: 'Lodo de ETE biológico (Saneamento)', val: 'R$ -110 / t (Custo)', dir: 'flat', pct: '0.0%' },
  { name: 'Cinza de casca de arroz (Cinzas)', val: 'R$ 55 / t', dir: 'up', pct: '+2.8%' },
  { name: 'Esterco de galinha seco (Agronegócio)', val: 'R$ 120 / t', dir: 'up', pct: '+4.3%' },
  { name: 'Cama de aviário (Agronegócio)', val: 'R$ 90 / t', dir: 'up', pct: '+2.2%' },
  { name: 'Esterco bovino curtido (Agronegócio)', val: 'R$ 60 / t', dir: 'flat', pct: '0.0%' },
  { name: 'Cinza de biomassa florestal (Cinzas)', val: 'R$ 30 / t', dir: 'flat', pct: '0.0%' },
  { name: 'Lama cal (Celulose)', val: 'R$ 15 / t', dir: 'flat', pct: '0.0%' },
  { name: 'Dreg e grits (Celulose)', val: 'R$ -85 / t (Custo)', dir: 'flat', pct: '0.0%' },
  { name: 'Casca de pinus (Biomassa)', val: 'R$ 80 / t', dir: 'down', pct: '-3.6%' }
]

const TRANSPORTE_INDEX_DATA = [
  { name: 'Caçamba Brooks 5m³ (Logística)', val: 'R$ 350 - R$ 550 / viagem', dir: 'up', pct: '+1.5%' },
  { name: 'Caçamba Brooks 7m³ (Logística)', val: 'R$ 450 - R$ 700 / viagem', dir: 'up', pct: '+2.2%' },
  { name: 'Roll-on Roll-off 30m³ (Logística)', val: 'R$ 950 - R$ 1.600 / viagem', dir: 'down', pct: '-1.0%' },
  { name: 'Roll-on Roll-off 38m³ (Logística)', val: 'R$ 1.100 - R$ 1.800 / viagem', dir: 'down', pct: '-0.8%' },
  { name: 'Carreta Graneleira 32t (Logística)', val: 'R$ 8,50 - R$ 12,00 / km', dir: 'up', pct: '+3.1%' },
  { name: 'Carreta Caçamba 30m³ (Logística)', val: 'R$ 9,00 - R$ 13,50 / km', dir: 'up', pct: '+4.0%' },
  { name: 'Tanque Inox 25-30m³ (Logística)', val: 'R$ 11,50 - R$ 16,00 / km', dir: 'up', pct: '+2.5%' },
  { name: 'Caminhão Baú Simples (Logística)', val: 'R$ 6,00 - R$ 8,50 / km', dir: 'flat', pct: '0.0%' },
  { name: 'Caminhão Truck Baú (Logística)', val: 'R$ 7,50 - R$ 10,50 / km', dir: 'up', pct: '+1.8%' },
  { name: 'Carreta Sider 28t (Logística)', val: 'R$ 8,00 - R$ 11,00 / km', dir: 'flat', pct: '0.0%' },
  { name: 'Caminhão Poliguindaste Simples (Logística)', val: 'R$ 400 - R$ 600 / viagem', dir: 'up', pct: '+2.5%' },
  { name: 'Caminhão Poliguindaste Duplo (Logística)', val: 'R$ 600 - R$ 900 / viagem', dir: 'up', pct: '+1.2%' }
]

const getDeterministicViews = (itemId: string) => {
  if (!itemId) return 12
  let hash = 0
  for (let i = 0; i < itemId.length; i++) {
    hash = itemId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % 56
}

const getPrazoRecorrencia = (item: any) => {
  if (item.prazo_recorrencia) return item.prazo_recorrencia
  if (item.observacoes) {
    const match = item.observacoes.match(/Recorrência:\s*([^|]+)/)
    if (match) return match[1].trim()
  }
  return null
}

const getValidadeProposta = (item: any) => {
  if (item.observacoes) {
    const match = item.observacoes.match(/Validade proposta:\s*([^|]+)/)
    if (match) return match[1].trim()
  }
  return 'Indefinido'
}

const GRANDES_EMPRESAS = [
  { id: 'mock-veolia', nome: 'Veolia Brasil', cidade: 'São Paulo', uf: 'SP', selo: 'Ouro', score: '98/100', licenca: 'LO nº 1249/2026' },
  { id: 'mock-ambipar', nome: 'Ambipar Group', cidade: 'Nova Odessa', uf: 'SP', selo: 'Ouro', score: '97/100', licenca: 'LO nº 9938/2026' },
  { id: 'mock-orizon', nome: 'Orizon Valorização de Resíduos', cidade: 'Rio de Janeiro', uf: 'RJ', selo: 'Ouro', score: '96/100', licenca: 'LO nº 8871/2026' },
  { id: 'mock-solvi', nome: 'Grupo Solví', cidade: 'São Paulo', uf: 'SP', selo: 'Prata', score: '94/100', licenca: 'LO nº 4567/2026' },
  { id: 'mock-vale', nome: 'Vale S.A.', cidade: 'Belo Horizonte', uf: 'MG', selo: 'Ouro', score: '99/100', licenca: 'LO nº 3022/2026' },
  { id: 'mock-gerdau', nome: 'Gerdau S.A.', cidade: 'Porto Alegre', uf: 'RS', selo: 'Ouro', score: '98/100', licenca: 'LO nº 7712/2026' },
  { id: 'mock-brf', nome: 'BRF S.A.', cidade: 'Curitiba', uf: 'PR', selo: 'Prata', score: '93/100', licenca: 'LO nº 5543/2026' },
  { id: 'mock-suzano', nome: 'Suzano S.A.', cidade: 'Salvador', uf: 'BA', selo: 'Ouro', score: '99/100', licenca: 'LO nº 2210/2026' }
]

// Component for carrier invites in "O Radar"
const CarrierInviteCard = ({ item, onEnter }: { item: any; onEnter: (item: any) => void }) => {
  return (
    <div style={{
      background: '#121212', border: '1px solid #222', padding: '16px',
      borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '12px',
      justifyContent: 'space-between', minHeight: '190px', textAlign: 'left'
    }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#888', marginBottom: '6px' }}>
          <span>CONVITE #{item.id?.substring(0, 6)}</span>
          <span style={{ color: 'var(--primary-500)', fontWeight: 'bold' }}>
            Alvo: R$ {item.valor_desejado?.toLocaleString('pt-BR') || '---'}
          </span>
        </div>
        <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>
          {item.tipo_material || item.residuo || 'Frete de Resíduo'}
        </strong>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: '#ccc' }}>
          <div>📍 <strong>Rota:</strong> {item.origem} → {item.destino}</div>
          <div>🚚 <strong>Veículo:</strong> {item.tipo_caminhao || 'Caçamba/Sider'}</div>
          <div>⚖️ <strong>Peso:</strong> {item.quantidade} {item.unidade || 't'}</div>
        </div>
      </div>
      
      <button
        onClick={() => onEnter(item)}
        className="btn btn-primary"
        style={{
          width: '100%', padding: '10px', fontSize: '0.8rem', color: '#000',
          fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', border: 'none'
        }}
      >
        📩 Entrar na Disputa
      </button>
    </div>
  )
}

// Real-time ticking Negotiation Card specifically for Transportadoras to prevent parent re-renders
const CarrierNegotiationCard = ({ item, onLeave, onUpdateBid, onExpire }: {
  item: any;
  onLeave: (id: string) => void;
  onUpdateBid: (id: string, newPrice: number) => void;
  onExpire: (id: string) => void;
}) => {
  const [timeLeft, setTimeLeft] = useState('Calculando...')
  const [editing, setEditing] = useState(false)
  const [newPriceVal, setNewPriceVal] = useState(item.lance_atual || item.valor_desejado || '')
  const [expired, setExpired] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const updateTimer = () => {
      if (!item.data_fim_leilao) {
        setTimeLeft('Sem data')
        return
      }
      const diff = new Date(item.data_fim_leilao).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('Finalizado')
        if (!expired) {
          setExpired(true)
          onExpire(item.id)
        }
        return
      }
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff / 1000 / 60) % 60)
      const seconds = Math.floor((diff / 1000) % 60)
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [item.data_fim_leilao, expired])

  const handleSave = () => {
    onUpdateBid(item.id, parseFloat(newPriceVal) || 0)
    setEditing(false)
  }

  return (
    <div style={{
      background: '#1c1c1c', border: '1px solid #333', padding: '16px',
      borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '12px',
      justifyContent: 'space-between', minHeight: '210px', textAlign: 'left'
    }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#888', marginBottom: '6px' }}>
          <span>DISPUTA #{item.id?.substring(0, 6)}</span>
          <span style={{ color: 'var(--primary-500)', fontWeight: 'bold' }}>
            Alvo: R$ {item.valor_desejado?.toLocaleString('pt-BR') || '---'}
          </span>
        </div>
        <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>
          {item.tipo_material || item.residuo || 'Frete de Resíduo'}
        </strong>
        <span style={{ display: 'block', fontSize: '0.78rem', color: '#aaa', lineHeight: '1.4' }}>
          <strong>Origem:</strong> {item.origem}
        </span>
        <span style={{ display: 'block', fontSize: '0.78rem', color: '#aaa', lineHeight: '1.4' }}>
          <strong>Destino:</strong> {item.destino}
        </span>
        <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#fff' }}>
          {editing ? (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ color: '#aaa' }}>R$</span>
              <input
                type="number"
                value={newPriceVal}
                onChange={(e) => setNewPriceVal(e.target.value)}
                style={{ width: '90px', background: '#09090b', border: '1px solid #444', color: '#fff', padding: '3px 6px', fontSize: '0.8rem', borderRadius: '4px' }}
              />
              <button onClick={handleSave} style={{ background: 'var(--primary-500)', color: '#000', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>✓</button>
              <button onClick={() => setEditing(false)} style={{ background: '#333', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Seu Lance: <strong style={{ color: 'var(--primary-500)' }}>R$ {item.lance_atual?.toLocaleString('pt-BR') || item.valor_desejado?.toLocaleString('pt-BR')}</strong></span>
              <button onClick={() => setEditing(true)} style={{ background: 'none', border: 'none', color: '#ffd700', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>Alterar</button>
            </div>
          )}
        </div>
      </div>

      <div style={{
        borderTop: '1px solid #2a2a2a', paddingTop: '10px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.62rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Tempo Restante
          </span>
          <span style={{ fontFamily: 'monospace', color: 'var(--primary-500)', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '2px' }}>
            ⏳ {timeLeft}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => onLeave(item.id)}
            style={{
              padding: '6px 10px', fontSize: '0.7rem', color: '#aaa',
              background: '#222', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer'
            }}
          >
            Sair
          </button>
          <button
            onClick={() => router.push(`/frete?id=${item.id}`)}
            className="btn btn-primary"
            style={{
              padding: '6px 12px', fontSize: '0.7rem', fontWeight: 'bold',
              color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer'
            }}
          >
            Entrar na Sala
          </button>
        </div>
      </div>
    </div>
  )
}

// Real-time ticking Negotiation Card component to isolate state re-renders and countdown timers
const NegotiationCard = ({ item, type, onPaySuperTaxa }: {
  item: any
  type: 'oferta' | 'demanda' | 'frete'
  onPaySuperTaxa: (item: any) => void
}) => {
  const [timeLeft, setTimeLeft] = useState('Calculando...')

  useEffect(() => {
    const pubTime = item.data_publicacao ? new Date(item.data_publicacao).getTime() : Date.now()
    const targetMs = pubTime + 172800000 // 48 hours

    const updateTimer = () => {
      const diff = targetMs - Date.now()
      if (diff <= 0) {
        setTimeLeft('Finalizado')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff / 1000 / 60) % 60)
      const seconds = Math.floor((diff / 1000) % 60)
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [item.id, item.data_publicacao])

  return (
    <div style={{
      background: '#1c1c1c', border: '1px solid #333', padding: '16px',
      borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px',
      justifyContent: 'space-between', minHeight: '190px', position: 'relative'
    }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#888', marginBottom: '6px' }}>
          <span>{type === 'frete' ? `LEILÃO #${item.id.substring(0, 6)}` : `LOTE #${item.codigo || item.id.substring(0, 6)}`}</span>
          <span style={{ color: 'var(--primary-500)', fontWeight: 'bold' }}>
            R$ {item.valor_desejado?.toLocaleString('pt-BR') || '---'}
          </span>
        </div>
        <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>
          {item.residuo || item.tipo_material || 'Resíduo/Serviço'}
        </strong>
        {type === 'frete' ? (
          <>
            <span style={{ display: 'block', fontSize: '0.78rem', color: '#aaa', lineHeight: '1.4' }}>
              <strong>Origem:</strong> {item.origem || 'Não informada'}
            </span>
            <span style={{ display: 'block', fontSize: '0.78rem', color: '#aaa', lineHeight: '1.4' }}>
              <strong>Destino:</strong> {item.destino || 'Não informado'}
            </span>
          </>
        ) : (
          <span style={{ display: 'block', fontSize: '0.78rem', color: '#aaa', lineHeight: '1.4' }}>
            <strong>Quantidade:</strong> {item.quantidade} {item.unidade}
          </span>
        )}
      </div>

      <div style={{
        borderTop: '1px solid #2a2a2a', paddingTop: '10px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.62rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Tempo Restante
          </span>
          <span style={{ fontFamily: 'monospace', color: 'var(--primary-500)', fontWeight: 'bold', fontSize: '0.95rem', marginTop: '2px' }}>
            ⏳ {timeLeft}
          </span>
        </div>
        
        {type !== 'frete' && timeLeft !== 'Finalizado' && (
          <button
            onClick={() => onPaySuperTaxa(item)}
            className="btn btn-primary"
            style={{
              padding: '6px 12px', fontSize: '0.75rem', fontWeight: 'bold',
              background: 'linear-gradient(90deg, #ffd700, #ffb300)', color: '#000',
              border: 'none', borderRadius: '4px', cursor: 'pointer'
            }}
          >
            ⚡ Super Taxa
          </button>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const supabase = createClient()

  // Authentication Context
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Vitrine State
  const [activeTab, setActiveTab] = useState<'Oferta' | 'Demanda'>('Oferta')
  const [listings, setListings] = useState<any[]>([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [tickerExpanded, setTickerExpanded] = useState(false)
  const [tickerSecondsSince, setTickerSecondsSince] = useState(0)

  // Filters State
  const [filterCategory, setFilterCategory] = useState('')
  const [marketBalanceRatio, setMarketBalanceRatio] = useState(50)
  const [filterResiduo, setFilterResiduo] = useState('')
  const [filterClasse, setFilterClasse] = useState('')
  const [filterEstadoFisico, setFilterEstadoFisico] = useState('')
  const [filterAcondicionamento, setFilterAcondicionamento] = useState('')
  const [filterUf, setFilterUf] = useState('')
  const [filterMunicipio, setFilterMunicipio] = useState('')
  const [filterBusinessType, setFilterBusinessType] = useState('') // Paga, Recebe, Doação
  const [filterRadius, setFilterRadius] = useState('') // Raio em km
  const [sortBy, setSortBy] = useState('Mais recente')

  // Modals / Paywall states
  const [selectedListing, setSelectedListing] = useState<any>(null)
  const [blockModal, setBlockModal] = useState<string | null>(null) // 'anuncio' | 'ficha'
  const [paywallModal, setPaywallModal] = useState<string | null>(null) // feature message
  const [activeView, setActiveView] = useState<'anuncios' | 'negocios'>('anuncios')
  const [matchingAdModal, setMatchingAdModal] = useState<any>(null)
  const [quickEditAd, setQuickEditAd] = useState<any>(null)

  const isNegotiationExpired = (item: any) => {
    if (item.status === 'Finalizado' || item.status === 'Fechado' || item.status === 'Arrematado') return true
    const pubTime = item.data_publicacao ? new Date(item.data_publicacao).getTime() : Date.now()
    const targetMs = pubTime + 172800000 // 48 hours
    return targetMs <= Date.now()
  }

  const handlePaySuperTaxa = async (item: any) => {
    try {
      const { error: errAd } = await supabase
        .from('anuncios')
        .update({ status: 'Finalizado' })
        .eq('id', item.id)

      if (errAd) throw errAd

      alert('Super Taxa paga! Operação finalizada e movida para o Histórico de Auditoria / Cofre.')
      if (user) {
        fetchMyListings(user.id)
        fetchListings()
        loadReleasedContacts(user.id)
      }
    } catch (e: any) {
      alert('Erro ao processar Super Taxa: ' + e.message)
    }
  }

  // Document Upload States
  const [activeDocType, setActiveDocType] = useState('')
  const [docFile, setDocFile] = useState<File | null>(null)
  const [docNumber, setDocNumber] = useState('')
  const [docValidity, setDocValidity] = useState('')
  const [docMoppChecked, setDocMoppChecked] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)

  // Ficha Materra Lookup State
  const [searchFichaQuery, setSearchFichaQuery] = useState('')
  const [fichaResults, setFichaResults] = useState<any[]>([])
  const [searchingFicha, setSearchingFicha] = useState(false)
  const [selectedFicha, setSelectedFicha] = useState<any>(null)
  const [hasSearchedFicha, setHasSearchedFicha] = useState(false)
  const [selectedGrandeEmpresa, setSelectedGrandeEmpresa] = useState<any>(null)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Audit trail for logged in user
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loadingAudit, setLoadingAudit] = useState(false)

  // Released contacts for logged in user
  const [releasedContacts, setReleasedContacts] = useState<any[]>([])
  const [loadingContacts, setLoadingContacts] = useState(false)

  // Carrier Bids on Freight (Reverse Auctions)
  const [freightAuctions, setFreightAuctions] = useState<any[]>([])
  const [loadingFreights, setLoadingFreights] = useState(false)

  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false)
  const [activeMenuModal, setActiveMenuModal] = useState<'dados' | 'ficha' | 'documentos' | null>(null)
  
  // Vitrine quick filter search & favorites toggles
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false)
  const [filterSearchQuery, setFilterSearchQuery] = useState('')
  const [inNegotiationCount, setInNegotiationCount] = useState(0)
  
  // Document checklist local mapping
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, any>>({})
  const [selectedDocType, setSelectedDocType] = useState('')
  const [docFormNumber, setDocFormNumber] = useState('')
  const [docFormValidity, setDocFormValidity] = useState('')
  const [docFormOrgao, setDocFormOrgao] = useState('')
  const [docFormTipoAtividade, setDocFormTipoAtividade] = useState('')
  const [docFormVolumeMensal, setDocFormVolumeMensal] = useState('')
  const [docFormTecnologia, setDocFormTecnologia] = useState('')
  const [docFormOrgaoCertificador, setDocFormOrgaoCertificador] = useState('')
  const [docFormSeguradora, setDocFormSeguradora] = useState('')
  const [docFormValorCobertura, setDocFormValorCobertura] = useState('')
  const [docFormPlaca, setDocFormPlaca] = useState('')
  const [docFormRenavam, setDocFormRenavam] = useState('')
  const [docFormMoppChecked, setDocFormMoppChecked] = useState(false)
  const [docFormAnoReferencia, setDocFormAnoReferencia] = useState('')
  const [docFileLabel, setDocFileLabel] = useState('')

  // Load profile states when profile is fetched
  useEffect(() => {
    if (profile && profile.documentos_recebidos) {
      try {
        setUploadedDocs(JSON.parse(profile.documentos_recebidos))
      } catch (e) {
        // ignore
      }
    }
  }, [profile])

  const handleDocFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedDocType) return
    const newDocs = {
      ...uploadedDocs,
      [selectedDocType]: {
        url: docFileLabel ? `/uploads/${docFileLabel}` : 'https://example.com/documento_enviado.pdf',
        num: docFormNumber || null,
        validade: docFormValidity || null,
        orgao: docFormOrgao || null,
        anoReferencia: selectedDocType === 'inventario_anual_rapp' ? docFormAnoReferencia : null,
        orgaoCertificador: ['iso_14001_forn', 'iso_14001_comp'].includes(selectedDocType) ? docFormOrgaoCertificador : null,
        seguradora: ['apolice_ambiental_forn', 'apolice_ambiental_comp', 'apolice_seguro_rc'].includes(selectedDocType) ? docFormSeguradora : null,
        tipoAtividade: selectedDocType === 'licenca_ambiental_operacao_comp' ? docFormTipoAtividade : null,
        volumeMensal: selectedDocType === 'capacidade_instalada' ? docFormVolumeMensal : null,
        tecnologia: selectedDocType === 'capacidade_instalada' ? docFormTecnologia : null,
        placa: selectedDocType === 'crlv_veiculos' ? docFormPlaca : null,
        renavam: selectedDocType === 'crlv_veiculos' ? docFormRenavam : null,
        valorCobertura: selectedDocType === 'apolice_seguro_rc' ? docFormValorCobertura : null,
        mopp: selectedDocType === 'mopp' ? docFormMoppChecked : null,
        file: docFileLabel || 'documento_enviado.pdf',
        data_upload: new Date().toISOString()
      }
    }
    setUploadedDocs(newDocs)
    try {
      const { error } = await supabase
        .from('cadastros')
        .update({
          documentos_recebidos: JSON.stringify(newDocs)
        })
        .eq('id', user.id)
      if (error) throw error
      setSelectedDocType('')
      setDocFormNumber('')
      setDocFormValidity('')
      setDocFormOrgao('')
      setDocFormTipoAtividade('')
      setDocFormVolumeMensal('')
      setDocFormTecnologia('')
      setDocFormOrgaoCertificador('')
      setDocFormSeguradora('')
      setDocFormValorCobertura('')
      setDocFormPlaca('')
      setDocFormRenavam('')
      setDocFormMoppChecked(false)
      setDocFormAnoReferencia('')
      setDocFileLabel('')
    } catch (err: any) {
      alert('Erro ao salvar documento: ' + err.message)
    }
  }

  const [dashboardTab, setDashboardTab] = useState<'geral' | 'meus_anuncios' | 'documentos' | 'auditoria' | 'representadas' | 'favoritos' | 'contatos_liberados' | 'planos'>('geral')
  const [couponCode, setCouponCode] = useState('')

  // Transportadora (Carrier) specific states
  const [carrierView, setCarrierView] = useState<'convites' | 'negociacoes'>('convites')
  const [joinedFreights, setJoinedFreights] = useState<any[]>([])

  // Load and initialize joined freights from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedJoined = localStorage.getItem('materra_freight_auctions')
      if (savedJoined) {
        try {
          setJoinedFreights(JSON.parse(savedJoined))
        } catch (e) {}
      } else {
        // Pre-populate with mock disputes (1 active, 1 won, 1 lost)
        const initialFreights = [
          {
            id: 'mock-active-1',
            tipo_material: 'Papelão Ondulado Enfardado',
            origem: 'Goiânia, GO',
            destino: 'Anápolis, GO',
            tipo_caminhao: 'Truck Sider',
            quantidade: 15,
            unidade: 't',
            valor_desejado: 1200,
            lance_atual: 1200,
            status: 'Em Negociação',
            data_fim_leilao: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
            auditTrail: [
              { data: new Date(Date.now() - 30 * 60 * 1000).toISOString(), acao: 'Convite recebido e aceito' }
            ]
          },
          {
            id: 'mock-won-1',
            tipo_material: 'Sucata Metálica de Mineração',
            origem: 'Catalão, GO',
            destino: 'Goiânia, GO',
            tipo_caminhao: 'Carreta Caçamba',
            quantidade: 30,
            unidade: 't',
            valor_desejado: 3500,
            lance_atual: 3400,
            status: 'Finalizado',
            result: 'won',
            data_fim_leilao: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
            auditTrail: [
              { data: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), acao: 'Leilão Iniciado pelo Gerador' },
              { data: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), acao: 'Lance inicial enviado: R$ 3.500' },
              { data: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(), acao: 'Lance reduzido para: R$ 3.450' },
              { data: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), acao: 'Lance final estabelecido: R$ 3.400' },
              { data: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), acao: 'Leilão Finalizado - Seu lance venceu' }
            ],
            contato: {
              razao_social: 'Mineração Catalão Ltda',
              email: 'logistica@mineracaocatalao.com.br',
              whatsapp: '(64) 99888-7766'
            }
          },
          {
            id: 'mock-lost-1',
            tipo_material: 'Lodo de ETE',
            origem: 'Rio Verde, GO',
            destino: 'Itumbiara, GO',
            tipo_caminhao: 'Tanque',
            quantidade: 25,
            unidade: 't',
            valor_desejado: 4000,
            lance_atual: 4200,
            status: 'Finalizado',
            result: 'lost',
            data_fim_leilao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            auditTrail: [
              { data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 4 * 3600 * 1000).toISOString(), acao: 'Leilão Iniciado pelo Gerador' },
              { data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 3 * 3600 * 1000).toISOString(), acao: 'Lance inicial enviado: R$ 4.000' },
              { data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 2 * 3600 * 1000).toISOString(), acao: 'Lance reajustado para: R$ 4.200' },
              { data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), acao: 'Leilão Finalizado - Outra transportadora foi selecionada' }
            ],
            contato: null
          }
        ]
        localStorage.setItem('materra_freight_auctions', JSON.stringify(initialFreights))
        setJoinedFreights(initialFreights)
      }
    }
  }, [])

  // Callbacks for carrier disputes
  const handleJoinDispute = (item: any) => {
    const exists = joinedFreights.some(f => f.id === item.id)
    if (exists) {
      setCarrierView('negociacoes')
      return
    }
    const newItem = {
      ...item,
      status: 'Em Negociação',
      lance_atual: item.valor_desejado,
      data_fim_leilao: item.data_fim_leilao || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      auditTrail: [
        { data: new Date().toISOString(), acao: `Inscrição na disputa - Lance inicial enviado: R$ ${item.valor_desejado?.toLocaleString('pt-BR') || '---'}` }
      ]
    }
    const updated = [...joinedFreights, newItem]
    setJoinedFreights(updated)
    localStorage.setItem('materra_freight_auctions', JSON.stringify(updated))
    setCarrierView('negociacoes')
    alert(`Inscrito com sucesso no leilão de frete! Acompanhe na aba 'Em Negociação'.`)
  }

  const handleLeaveDispute = (id: string) => {
    const updated = joinedFreights.filter(f => f.id !== id)
    setJoinedFreights(updated)
    localStorage.setItem('materra_freight_auctions', JSON.stringify(updated))
  }

  const handleUpdateBid = (id: string, newPrice: number) => {
    const updated = joinedFreights.map(f => {
      if (f.id === id) {
        return {
          ...f,
          lance_atual: newPrice,
          auditTrail: [
            ...(f.auditTrail || []),
            { data: new Date().toISOString(), acao: `Lance ajustado para R$ ${newPrice.toLocaleString('pt-BR')}` }
          ]
        }
      }
      return f
    })
    setJoinedFreights(updated)
    localStorage.setItem('materra_freight_auctions', JSON.stringify(updated))
  }

  const handleExpireDispute = (id: string) => {
    setJoinedFreights(prev => {
      const updated = prev.map(f => {
        if (f.id === id && f.status !== 'Finalizado') {
          const won = Math.random() > 0.4
          const result = won ? 'won' : 'lost'
          return {
            ...f,
            status: 'Finalizado',
            result,
            finalizado_em: new Date().toISOString(),
            auditTrail: [
              ...(f.auditTrail || []),
              { data: new Date().toISOString(), acao: won ? 'Leilão Finalizado - Seu lance venceu' : 'Leilão Finalizado - Outra transportadora venceu' }
            ],
            contato: won ? {
              razao_social: 'Vale do Rio Verde S.A.',
              email: 'logistica@valerioverde.com.br',
              whatsapp: '(64) 99123-4567'
            } : null
          }
        }
        return f
      })
      localStorage.setItem('materra_freight_auctions', JSON.stringify(updated))
      return updated
    })
  }
  const [couponMsg, setCouponMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [activeMyListingId, setActiveMyListingId] = useState<string | null>(null)
  // Card system state
  const [showLoginGate, setShowLoginGate] = useState(false)
  const [fichaModal, setFichaModal] = useState<any>(null)
  const [seloModal, setSeloModal] = useState(false)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<any[]>([])
  const [myListings, setMyListings] = useState<any[]>([])
  const [loadingMyListings, setLoadingMyListings] = useState(false)
  const [repCompanies, setRepCompanies] = useState<any[]>([])
  const [loadingRepCompanies, setLoadingRepCompanies] = useState(false)

  // Profile editing states
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [editNomeOuRazao, setEditNomeOuRazao] = useState('')
  const [editCpfOuCnpj, setEditCpfOuCnpj] = useState('')
  const [editEndereco, setEditEndereco] = useState('')
  const [editCidade, setEditCidade] = useState('')
  const [editUf, setEditUf] = useState('')
  const [editWhatsapp, setEditWhatsapp] = useState('')
  const [editChavePix, setEditChavePix] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Double Habilitation states
  const [showHabilitacaoModal, setShowHabilitacaoModal] = useState(false)
  const [doubleHabilitationStep, setDoubleHabilitationStep] = useState(1)


  const handleOpenEditProfile = () => {
    if (!profile) return
    setEditNomeOuRazao(profile.nome_ou_razao || '')
    setEditCpfOuCnpj(profile.cpf_ou_cnpj || '')
    setEditEndereco(profile.endereco || '')
    setEditCidade(profile.cidade || '')
    setEditUf(profile.uf || '')
    setEditWhatsapp(profile.whatsapp || '')
    setEditChavePix(profile.chave_pix || '')
    setShowEditProfileModal(true)
  }

  const handleSaveProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return
    setSavingProfile(true)
    try {
      const { error } = await supabase
        .from('cadastros')
        .update({
          nome_ou_razao: editNomeOuRazao,
          cpf_ou_cnpj: editCpfOuCnpj,
          endereco: editEndereco,
          cidade: editCidade,
          uf: editUf,
          whatsapp: editWhatsapp,
          chave_pix: editChavePix
        })
        .eq('id', user.id)

      if (error) throw error

      setProfile({
        ...profile,
        nome_ou_razao: editNomeOuRazao,
        cpf_ou_cnpj: editCpfOuCnpj,
        endereco: editEndereco,
        cidade: editCidade,
        uf: editUf,
        whatsapp: editWhatsapp,
        chave_pix: editChavePix
      })
      alert('Informações de cadastro atualizadas com sucesso!')
      setShowEditProfileModal(false)
    } catch (err: any) {
      console.error(err)
      alert('Erro ao salvar cadastro: ' + err.message)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleDoubleHabilitation = async () => {
    if (!user || !profile) return
    
    try {
      const { error } = await supabase
        .from('cadastros')
        .update({ tipo_parte: 'Fornecedor / Comprador' })
        .eq('id', user.id)
        
      if (error) throw error
      
      const updatedProfile = { ...profile, tipo_parte: 'Fornecedor / Comprador' }
      setProfile(updatedProfile)
      localStorage.setItem('materra_profile', JSON.stringify(updatedProfile))
      
      // Log in compliance audit trail
      const auditTrail = JSON.parse(localStorage.getItem('materra_compliance_audit_trail') || '[]')
      auditTrail.unshift({
        event_type: 'USER_DOUBLE_SPECIALTY_ENABLED',
        event_category: 'Compliance',
        action: 'ENABLE_DOUBLE_SPECIALTY',
        entity_type: 'Perfil',
        entity_id: user.id,
        actor: profile.nome_ou_razao,
        details: `Usuário habilitou perfil duplo (Fornecedor / Comprador) sob o CNPJ ${profile.cpf_ou_cnpj}.`,
        timestamp: new Date().toISOString(),
        status: 'Íntegro',
        hash: 'SHA256-HAB-' + Math.random().toString(36).substring(2, 10)
      })
      localStorage.setItem('materra_compliance_audit_trail', JSON.stringify(auditTrail))
      
      setShowHabilitacaoModal(false)
      setDoubleHabilitationStep(1)
      alert('Especialidade Dupla habilitada com sucesso! Você já pode comprar e vender.')
    } catch (err: any) {
      console.error(err)
      alert('Erro ao habilitar especialidade dupla: ' + err.message)
    }
  }


  // Effect to increment ticker seconds since last update
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerSecondsSince(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Effect to calculate and animate Offer vs Demand market balance
  useEffect(() => {
    if (filterCategory) {
      const catListings = listings.filter(item => item.categoria === filterCategory)
      const oCount = catListings.filter(item => item.tipo_anuncio === 'Oferta' || item.tipo_anuncio === 'Oferta de resíduo').length
      const dCount = catListings.filter(item => item.tipo_anuncio === 'Demanda' || item.tipo_anuncio === 'Pedido de compra').length
      
      const finalO = oCount || 3
      const finalD = dCount || 2
      const total = finalO + finalD
      const targetRatio = Math.round((finalO / total) * 100)
      
      setMarketBalanceRatio(50)
      const timer = setTimeout(() => {
        setMarketBalanceRatio(targetRatio)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setMarketBalanceRatio(prev => prev === 50 ? prev : 50)
    }
  }, [filterCategory, listings])

  // Load favorites from local storage
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const stored = localStorage.getItem(`materra_favorites_${user.id}`)
      if (stored) {
        try {
          setFavorites(JSON.parse(stored))
        } catch (e) {
          console.error(e)
        }
      } else {
        setFavorites(prev => prev.length === 0 ? prev : [])
      }
    } else {
      setFavorites(prev => prev.length === 0 ? prev : [])
    }
  }, [user])

  const toggleFavorite = (listing: any) => {
    if (!user) {
      setBlockModal('anuncio')
      return
    }
    let updated
    if (favorites.some(f => f.id === listing.id)) {
      updated = favorites.filter(f => f.id !== listing.id)
    } else {
      updated = [...favorites, listing]
    }
    setFavorites(updated)
    localStorage.setItem(`materra_favorites_${user.id}`, JSON.stringify(updated))
  }

  const toggleListingActiveStatus = async (item: any) => {
    try {
      const newStatus = (item.status === 'Inativo' || item.status === 'Suspenso') ? 'Anunciado' : 'Inativo'
      const { error } = await supabase
        .from('anuncios')
        .update({ status: newStatus })
        .eq('id', item.id)

      if (error) throw error

      alert(`Anúncio atualizado para: ${newStatus === 'Anunciado' ? 'Ativo/Anunciado' : 'Suspenso/Inativo'}`)
      
      // Update myListings local state
      setMyListings(prev => prev.map(a => a.id === item.id ? { ...a, status: newStatus } : a))
      // Update listings main vitrine state
      setListings(prev => prev.map(a => a.id === item.id ? { ...a, status: newStatus } : a))

    } catch (e: any) {
      console.error(e)
      alert('Erro ao atualizar status do anúncio: ' + e.message)
    }
  }

  const getDynamicRoleLabel = () => {
    if (!profile) return ''
    if (
      profile.tipo_parte === 'Consultor' ||
      profile.tipo_parte === 'Controlador' ||
      profile.subtipo === 'Corretor' ||
      profile.subtipo === 'Corretor/Controlador'
    ) {
      return 'Controlador'
    }
    return profile.tipo_parte
  }

  const getAdvertiserRoleLabel = (item: any) => {
    if (!item) return ''
    const tipo = item.cadastros?.tipo_parte || (item.tipo_anuncio?.toLowerCase().includes('compra') || item.tipo_anuncio?.toLowerCase().includes('demanda') ? 'Comprador' : 'Fornecedor')
    const sub = item.cadastros?.subtipo || 'Empresa'
    
    if (sub === 'Corretor' || sub === 'Corretor/Controlador') {
      return 'Corretor / Controlador'
    }
    return `Empresa ${tipo === 'Fornecedor' ? 'Fornecedora' : tipo === 'Comprador' ? 'Compradora' : tipo}`
  }

  async function fetchMyListings(userId: string) {
    setLoadingMyListings(true)
    try {
      const { data, error } = await supabase
        .from('anuncios')
        .select('*, propostas(id, valor_proposto, status, created_at)')
        .eq('id_cadastro', userId)
        .order('data_publicacao', { ascending: false })

      if (!error && data) {
        setMyListings(data)
      }
    } catch (e) {
      console.error('Erro ao buscar meus anúncios:', e)
    } finally {
      setLoadingMyListings(false)
    }
  }

  async function fetchRepCompanies(userId: string) {
    setLoadingRepCompanies(true)
    try {
      const { data, error } = await supabase
        .from('fichas_empresa_representada')
        .select('*')
        .eq('id_corretor', userId)
        .order('created_at', { ascending: false })
      if (!error && data) {
        setRepCompanies(data)
      }
    } catch (e) {
      console.error('Erro ao buscar empresas representadas:', e)
    } finally {
      setLoadingRepCompanies(false)
    }
  }

  async function loadUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('cadastros')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        const hasOwnCarrier = !!data.transportadora_propria || data.subtipo === 'Transportadora própria'
        const normalized = { 
          ...data, 
          transportadora_propria: hasOwnCarrier,
          area_atuacao: data.area_atuacao || data.area_operacao || ''
        }
        setProfile(normalized)
        loadAuditLogs(userId)
        fetchMyListings(userId)
        loadReleasedContacts(userId)
        if (data.subtipo === 'Corretor' || data.subtipo === 'Corretor/Controlador') {
          fetchRepCompanies(userId)
        }
        if (data.tipo_parte === 'Transportadora' || hasOwnCarrier) {
          loadFreightAuctions(normalized.area_atuacao || '')
        }
      }
    } catch (err: any) {
      console.error('Erro ao buscar perfil do usuário:', err)
    }
  }

  // Load User Session & Profile
  useEffect(() => {
    async function getSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          if (!session.user.email_confirmed_at && !session.user.confirmed_at) {
            supabase.auth.signOut() // async, don't await
            setUser(null)
            setProfile(null)
            setLoading(false)
            router.push('/auth/login')
            return
          }
          setUser(session.user)
          setLoading(false)
          loadUserProfile(session.user.id)
        } else {
          setLoading(false)
        }
      } catch (e: any) {
        console.error('Erro em getSession:', e)
        setLoading(false)
      }
    }
    getSession()
    fetchListings()
    if (typeof window !== 'undefined') {
      const activeRooms = JSON.parse(localStorage.getItem('materra_active_negotiations') || '[]')
      setInNegotiationCount(activeRooms.length)
    }
  }, [])

  // Fetch all active ads for the Vitrine
  async function fetchListings() {
    setLoadingListings(true)
    try {
      const { data, error } = await supabase
        .from('anuncios')
        .select(`
          *,
          cadastros (
            nome_ou_razao,
            nivel_selo,
            selo_verificado,
            score_0a100,
            subtipo,
            tipo_parte
          ),
          propostas (
            id,
            valor_proposto,
            status,
            created_at
          )
        `)
        .eq('status', 'Anunciado')

      if (error) throw error

      // Merge database records with Goiânia/Goiás seeds to ensure they are always present
      const dbList = data || []
      const merged = [...MOCK_SEED_ANUNCIOS]
      dbList.forEach((dbItem: any) => {
        if (!merged.some(m => m.codigo === dbItem.codigo)) {
          merged.push(dbItem)
        }
      })
      setListings(merged)
    } catch (err) {
      console.error('Erro ao buscar anúncios:', err)
      setListings(MOCK_SEED_ANUNCIOS) // Fallback to seeds only if DB fails
    } finally {
      setLoadingListings(false)
    }
  }

  // Fetch Audit Trail of transactions the logged-in user participated in
  async function loadAuditLogs(userId: string) {
    setLoadingAudit(true)
    try {
      const { data: auditData, error: auditErr } = await supabase
        .from('operacoes_audit')
        .select(`
          *,
          fornecedor_cad:fornecedor(nome_ou_razao),
          comprador_cad:comprador(nome_ou_razao),
          transportadora_cad:transportadora(nome_ou_razao),
          anuncio_cad:id_anuncio(codigo, residuo)
        `)
        .or(`fornecedor.eq.${userId},comprador.eq.${userId},transportadora.eq.${userId}`)
        .order('data_hora', { ascending: false })

      if (auditErr) throw auditErr

      const { data: propData, error: propErr } = await supabase
        .from('propostas')
        .select(`
          *,
          anuncio:id_anuncio(codigo, residuo, id_cadastro),
          proponente:id_proponente(nome_ou_razao)
        `)
        .or(`id_proponente.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (propErr) throw propErr

      const mappedProps = (propData || []).map(p => ({
        id: p.id,
        isProposal: true,
        data_hora: p.created_at || new Date().toISOString(),
        mtr_numero: p.status === 'Enviada' ? 'Confirmação Pendente' : (p.status === 'Confirmada' ? 'Lead Confirmado' : 'Recusada'),
        cdf_numero: 'Bilateral',
        nivel_audit: p.status === 'Enviada' ? 'Confirmação Pendente' : (p.status === 'Confirmada' ? 'Alto (verificado por nós)' : 'Recusada'),
        valor_residuo_rs: p.valor_proposto,
        valor_frete_rs: 0,
        anuncio_cad: p.anuncio,
        fornecedor_cad: p.papel_proponente === 'Fornecedor' ? p.proponente : null,
        comprador_cad: p.papel_proponente === 'Comprador' ? p.proponente : null
      }))

      const combined = [...(auditData || []), ...mappedProps].sort((a, b) => 
        new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime()
      )

      setAuditLogs(combined)
    } catch (err) {
      console.error('Erro ao buscar logs de auditoria:', err)
    } finally {
      setLoadingAudit(false)
    }
  }

  async function loadReleasedContacts(userId: string) {
    setLoadingContacts(true)
    try {
      const { data, error } = await supabase
        .from('contatos')
        .select(`
          *,
          contraparte:id_contraparte (
            id,
            nome_ou_razao,
            whatsapp,
            email,
            cpf_ou_cnpj,
            uf,
            cidade,
            tipo_parte,
            subtipo
          ),
          anuncio:id_anuncio (
            id,
            codigo,
            residuo,
            categoria,
            classe,
            quantidade,
            unidade,
            valor_desejado,
            valor_index
          )
        `)
        .eq('id_usuario', userId)
        .eq('liberado', true)

      if (error) throw error
      setReleasedContacts(data || [])
    } catch (err) {
      console.error('Erro ao buscar contatos liberados:', err)
    } finally {
      setLoadingContacts(false)
    }
  }

  // Fetch reverse auctions matching carrier's operating area
  async function loadFreightAuctions(areaAtuacion: string) {
    setLoadingFreights(true)
    try {
      let query = supabase.from('frete').select('*').eq('status', 'Aberto')
      const { data, error } = await query
      if (error) throw error

      if (areaAtuacion) {
        const states = areaAtuacion.split(',').map(s => s.trim().toUpperCase())
        const filtered = (data || []).filter(auc => {
          const destUf = auc.destino?.split('-').pop()?.trim().toUpperCase() || ''
          const origUf = auc.origem?.split('-').pop()?.trim().toUpperCase() || ''
          return states.includes(destUf) || states.includes(origUf) || states.length === 0
        })
        setFreightAuctions(filtered)
      } else {
        setFreightAuctions(data || [])
      }
    } catch (err) {
      console.error('Erro ao carregar leilões de frete:', err)
    } finally {
      setLoadingFreights(false)
    }
  }

   const checkHasPaidPlan = () => {
    if (!profile) return false
    if (profile.plano_ativo === true || profile.plano_ativo === 'true') return true
    const planoName = String(profile.plano || '').toLowerCase()
    const planoAtivoName = String(profile.plano_ativo || '').toLowerCase()
    return (
      planoAtivoName.includes('mercado') ||
      planoAtivoName.includes('enterprise') ||
      planoAtivoName.includes('mercado') ||
      planoAtivoName.includes('pago') ||
      planoName.includes('mercado') ||
      planoName.includes('enterprise') ||
      planoName.includes('mercado') ||
      planoName.includes('pago')
    )
  }

  // Toggle Own Carrier Status
  const handleToggleOwnCarrier = async () => {
    if (!user || !profile) return
    setPaywallModal('A funcionalidade de Frota Própria está bloqueada nesta versão da plataforma.')
  }

  const handleFreightSimulationTrigger = () => {
    setPaywallModal('A funcionalidade de Cotação de Frete (Leilão Reverso) está bloqueada nesta versão da plataforma.')
  }

  // Bid Freight Reverse Auction via WhatsApp (Free plan restrictions apply)
  const handleBidFreight = (auc: any) => {
    const isInoperante = profile?.tipo_parte === 'Transportadora' && (profile?.status_documentos !== 'Verificado' || !profile?.area_atuacao)
    const isOwnCarrierInoperante = profile?.transportadora_propria && (profile?.status_documentos !== 'Verificado' || !profile?.area_atuacao)

    if (isInoperante || isOwnCarrierInoperante) {
      alert('Sua transportadora está INOPERANTE. Para dar lances em fretes, seus documentos devem ser validados pelo Administrador e a área de atuação preenchida.')
      return
    }

    if (!profile?.plano_ativo) {
      setPaywallModal('O Leilão Reverso de fretes com transportadoras credenciadas requer o plano Materra Mercado.')
      return
    }
    const text = `Olá Concierge Materra, sou a transportadora *${profile?.nome_ou_razao || 'Membro'}* e tenho interesse no Leilão de Frete #${auc.id.substring(0,6)} (${auc.tipo_material || 'Resíduo'}). Rota: ${auc.origem} para ${auc.destino}. Quero enviar meu lance de frete.`
    const url = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.refresh()
  }

  const handleListingClick = async (listing: any) => {
    if (!user) {
      setBlockModal('anuncio')
    } else {
      // Fetch represented company Ficha if needed
      if (!listing.fichas_empresa_representada) {
        let repData = null
        if (listing.id_ficha_empresa) {
          const { data } = await supabase
            .from('fichas_empresa_representada')
            .select('*')
            .eq('id', listing.id_ficha_empresa)
            .maybeSingle()
          repData = data
        }
        if (!repData) {
          const { data } = await supabase
            .from('fichas_empresa_representada')
            .select('*')
            .eq('id_anuncio', listing.id)
            .maybeSingle()
          repData = data
        }
        if (repData) {
          listing.fichas_empresa_representada = repData
        }
      }

      // Increment view counter
      try {
        const currentViews = listing.visualizacoes || 0
        await supabase
          .from('anuncios')
          .update({ visualizacoes: currentViews + 1 })
          .eq('id', listing.id)
        listing.visualizacoes = currentViews + 1
        setListings(prev => prev.map(l => l.id === listing.id ? { ...l, visualizacoes: currentViews + 1 } : l))
      } catch (e) {
        console.error('Erro ao incrementar visualizações:', e)
      }

      setSelectedListing(listing)
      if (profile?.plano_ativo && listing.id_cadastro !== user.id) {
        try {
          const currentCount = listing.leads_expandidos_plano || 0
          await supabase
            .from('anuncios')
            .update({ leads_expandidos_plano: currentCount + 1 })
            .eq('id', listing.id)
          listing.leads_expandidos_plano = currentCount + 1
        } catch (e) {
          console.error('Erro ao registrar expansão de plano:', e)
        }
      }
    }
  }

  const handleFichaClick = (ficha: any) => {
    if (!user) {
      setBlockModal('ficha')
      return
    }
    setPaywallModal('O Buscador de Fichas de terceiros não está incluso nos planos disponíveis nesta versão da plataforma.')
    return
  }

  // Search Ficha Materra
  const handleFichaSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchFichaQuery.trim()) return
    setSearchingFicha(true)
    setHasSearchedFicha(true)
    try {
      const { data, error } = await supabase
        .from('cadastros')
        .select('*')
        .ilike('nome_ou_razao', `%${searchFichaQuery}%`)
        .limit(10)

      if (error) throw error
      setFichaResults(data || [])
    } catch (err) {
      console.error('Erro ao buscar Fichas:', err)
    } finally {
      setSearchingFicha(false)
    }
  }

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
    }
    return names[type] || type.replace(/_/g, ' ').toUpperCase()
  }

  // Check if general user has uploaded any docs
  const hasUploadedDocs = (p: any): boolean => {
    if (!p || !p.documentos_recebidos) return false
    try {
      const parsed = JSON.parse(p.documentos_recebidos)
      return Object.keys(parsed).length > 0
    } catch (e) {
      return false
    }
  }

  // Seal Badge Style Helper
  const getSealBadgeStyle = (seal: string) => {
    const s = (seal || 'Bronze').toLowerCase()
    if (s.includes('ouro') || s.includes('gold')) {
      return {
        background: 'rgba(255, 215, 0, 0.15)',
        border: '1px solid rgba(255, 215, 0, 0.4)',
        color: '#ffd700'
      }
    }
    if (s.includes('prata') || s.includes('silver')) {
      return {
        background: 'rgba(192, 192, 192, 0.15)',
        border: '1px solid rgba(192, 192, 192, 0.4)',
        color: '#e0e0e0'
      }
    }
    if (s.includes('verde') || s.includes('green')) {
      return {
        background: 'rgba(76, 175, 80, 0.15)',
        border: '1px solid rgba(76, 175, 80, 0.4)',
        color: '#81c784'
      }
    }
    if (s.includes('bronze')) {
      return {
        background: 'rgba(205, 127, 50, 0.15)',
        border: '1px solid rgba(205, 127, 50, 0.4)',
        color: '#cd7f32'
      }
    }
    if (s.includes('amarelo') || s.includes('yellow')) {
      return {
        background: 'rgba(255, 235, 59, 0.15)',
        border: '1px solid rgba(255, 235, 59, 0.4)',
        color: '#ffeb3b'
      }
    }
    if (s.includes('vermelho') || s.includes('red')) {
      return {
        background: 'rgba(244, 67, 54, 0.15)',
        border: '1px solid rgba(244, 67, 54, 0.4)',
        color: '#ef5350'
      }
    }
    return {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#aaa'
    }
  }

  // Reputation Score Helper
  const getReputationDisplay = (p: any) => {
    if (!p) return '0/0'
    const docsExist = hasUploadedDocs(p) || p.licenca_ambiental_url || p.rntrc_url

    if (p.tipo_parte === 'Transportadora') {
      if (p.status_documentos !== 'Verificado' && !p.score_0a100) {
        return '0/0 (Inoperante)'
      }
      return `${p.score_0a100 || 50}/100 (Operante)`
    }

    if (!docsExist && !p.score_0a100) {
      return '0/0'
    }
    return `${p.score_0a100 || 50}/100`
  }

  // Handle Document Upload
  const handleUploadDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile || !activeDocType || !docFile) {
      alert('Selecione um arquivo de documento válido.')
      return
    }

    setUploadingDoc(true)
    try {
      const fileExt = docFile.name.split('.').pop()
      const fileName = `${user.id}/docs/${activeDocType}_${Date.now()}.${fileExt}`

      const { data, error: uploadErr } = await supabase.storage
        .from('documentos')
        .upload(fileName, docFile, { cacheControl: '3600', upsert: true })

      if (uploadErr) throw uploadErr

      const { data: { publicUrl } } = supabase.storage
        .from('documentos')
        .getPublicUrl(fileName)

      let docsObj: any = {}
      if (profile.documentos_recebidos) {
        try {
          docsObj = JSON.parse(profile.documentos_recebidos)
        } catch (e) {
          docsObj = {}
        }
      }

      docsObj[activeDocType] = {
        url: publicUrl,
        num: docNumber || null,
        validade: docValidity || null,
        mopp: docMoppChecked,
        data_upload: new Date().toISOString()
      }

      const jsonStr = JSON.stringify(docsObj)
      const { error: dbError } = await supabase
        .from('cadastros')
        .update({
          documentos_recebidos: jsonStr,
          status_documentos: 'Em análise' // Lucas checks documents manually
        })
        .eq('id', user.id)

      if (dbError) throw dbError

      // Update state locally
      setProfile({
        ...profile,
        documentos_recebidos: jsonStr,
        status_documentos: 'Em análise'
      })

      alert('Documento enviado com sucesso para análise!')
      
      // Reset inputs
      setDocFile(null)
      setDocNumber('')
      setDocValidity('')
      setDocMoppChecked(false)
      setActiveDocType('')
    } catch (err: any) {
      console.error(err)
      alert('Erro ao enviar documento: ' + err.message)
    } finally {
      setUploadingDoc(false)
    }
  }

  // Interest trigger
  const handleInterest = async (listing: any) => {
    if (!user) {
      setBlockModal('anuncio')
      return
    }
    try {
      await supabase
        .from('propostas')
        .insert([{
          id_anuncio: listing.id,
          id_proponente: user.id,
          papel_proponente: profile?.tipo_parte === 'Comprador' ? 'Comprador' : 'Fornecedor',
          valor_proposto: listing.valor_desejado,
          status: 'Enviada',
          observacoes: 'Interesse manifestado via Vitrine Materra Elo.'
        }])

      const text = `Olá Lucas, sou ${profile?.nome_ou_razao || user.email} e tenho interesse no anúncio [${listing.codigo}] (${listing.residuo}). Vamos negociar.`
      const url = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(text)}`
      window.open(url, '_blank')
    } catch (err) {
      console.error(err)
    }
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
    if (diff1 === 0) {
      return 120 + (diff2 * 15)
    }

    return 300 + (diff1 * 180)
  }

  const getAuctionStatus = (ad: any) => {
    if (!ad || !ad.data_inicio_leilao || !ad.data_fim_leilao) {
      return { statusText: '', isWaiting: false, isOpen: false, isEnded: false };
    }
    const now = new Date().getTime();
    const end = new Date(ad.data_fim_leilao).getTime();
    if (now >= end) {
      return { statusText: 'Leilão Encerrado', isWaiting: false, isOpen: false, isEnded: true };
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
      statusText: `Leilão aberto — ${timeText}`,
      timeRemainingText: timeText,
      isWaiting: false,
      isOpen: true,
      isEnded: false
    };
  };

  const isAuctionActive = (ad: any) => {
    const status = getAuctionStatus(ad);
    return status.isOpen;
  };



  // Business Action Triggers & Redirects
  const handlePublishAdTrigger = (adRoleType: 'Oferta' | 'Demanda') => {
    if (!user) {
      setBlockModal('anuncio')
      return
    }

    // Role constraints
    const isFornecedor = profile.tipo_parte === 'Fornecedor'
    const isComprador = profile.tipo_parte === 'Comprador'
    const isPlanoActive = profile.plano_ativo || false

    if (adRoleType === 'Demanda' && isFornecedor && !isPlanoActive) {
      setPaywallModal('Você está registrado inicialmente como Fornecedor. Para publicar Demandas de Compra (ação de Comprador), você precisa assinar o plano Materra Mercado.')
      return
    }
    if (adRoleType === 'Oferta' && isComprador && !isPlanoActive) {
      setPaywallModal('Você está registrado inicialmente como Comprador. Para publicar Ofertas de Resíduo (ação de Fornecedor), você precisa assinar o plano Materra Mercado.')
      return
    }

    // Limits check
    const publicationsUsed = profile.publicacoes_usadas || 0
    if (publicationsUsed >= 1 && !isPlanoActive) {
      setPaywallModal('Você atingiu o limite gratuito de 1 publicação de anúncio do seu subtipo inicial. Assine o plano Materra Mercado para publicar sem limites.')
      return
    }

    // Warning about empty documents
    const docVerified = hasUploadedDocs(profile)
    if (!docVerified) {
      alert('Atenção: Você não enviou documentos para homologar sua Ficha Materra. Seu anúncio será publicado, mas ficará com reputação 0/0 até que envie a documentação.')
    }

    router.push('/anuncios/publicar')
  }

  const handleClosingTrigger = () => {
    if (!checkHasPaidPlan()) {
      setPaywallModal('A homologação e auditoria de fechamento de negócios no Audit Trail requer no mínimo o plano Materra Mercado. Acesse a aba Planos para ativar com um cupom ou contratar.')
      return
    }
    router.push('/operacoes/fechamento')
  }

  // Filter Logic in-memory
  const filteredListings = listings
    .filter(item => {
      // Handle legacy database mappings smoothly
      const matchesOffer = activeTab === 'Oferta' && (item.tipo_anuncio === 'Oferta' || item.tipo_anuncio === 'Oferta de resíduo')
      const matchesDemand = activeTab === 'Demanda' && (item.tipo_anuncio === 'Demanda' || item.tipo_anuncio === 'Pedido de compra')
      if (!matchesOffer && !matchesDemand) return false

      if (filterCategory && item.categoria !== filterCategory) return false
      if (filterResiduo && item.residuo !== filterResiduo) return false
      
      if (filterClasse && filterClasse !== 'Todas') {
        const itemClass = item.classe || ''
        if (filterClasse === 'I' && !itemClass.includes('I –') && itemClass !== 'I') return false
        if (filterClasse === 'IIA' && !itemClass.includes('IIA') && itemClass !== 'IIA') return false
        if (filterClasse === 'IIB' && !itemClass.includes('IIB') && itemClass !== 'IIB') return false
      }
      
      if (filterEstadoFisico && item.estado_fisico !== filterEstadoFisico) return false
      if (filterUf && item.uf !== filterUf) return false
      if (filterMunicipio && !item.municipio?.toLowerCase().includes(filterMunicipio.toLowerCase())) return false

      // Business Model filter (Paga, Recebe, Doação)
      if (filterBusinessType) {
        const valueText = (item.forma_cobranca || '').toLowerCase()
        if (filterBusinessType === 'paga' && !valueText.includes('pago') && !valueText.includes('cobro')) return false
        if (filterBusinessType === 'recebe' && !valueText.includes('recebo') && !valueText.includes('pago pelo')) return false
        if (filterBusinessType === 'doacao' && !valueText.includes('doação') && !valueText.includes('sem cobrança') && item.valor_desejado !== 0 && String(item.valor_desejado).toLowerCase() !== 'doação') return false
      }

      // Radius filter
      if (filterRadius) {
        if (!profile?.cep || !item.cep) return false
        const distance = getDistanceBetweenCeps(profile.cep, item.cep)
        if (distance > parseInt(filterRadius)) return false
      }

      // Favorites filter
      if (filterFavoritesOnly) {
        if (!favorites.some(f => f.id === item.id)) return false
      }

      // Search Query filter (nome/codigo)
      if (filterSearchQuery) {
        const q = filterSearchQuery.toLowerCase().trim()
        const residuoMatch = (item.residuo || '').toLowerCase().includes(q)
        const idMatch = (item.id || '').toLowerCase().includes(q)
        const codigoMatch = (item.codigo || '').toLowerCase().includes(q)
        if (!residuoMatch && !idMatch && !codigoMatch) return false
      }

      return true
    })
    .sort((a, b) => {
      const isAActive = (a.tipo_leilao === 'Ascendente' || a.tipo_leilao === 'Descendente') && a.data_inicio_leilao && (!a.data_fim_leilao || new Date().getTime() < new Date(a.data_fim_leilao).getTime()) && a.status !== 'Arrematado' && a.status !== 'Suspenso' && a.status !== 'Fechado';
      const isBActive = (b.tipo_leilao === 'Ascendente' || b.tipo_leilao === 'Descendente') && b.data_inicio_leilao && (!b.data_fim_leilao || new Date().getTime() < new Date(b.data_fim_leilao).getTime()) && b.status !== 'Arrematado' && b.status !== 'Suspenso' && b.status !== 'Fechado';
      
      const aVal = isAActive ? 1 : 0;
      const bVal = isBActive ? 1 : 0;
      if (aVal !== bVal) {
        return bVal - aVal;
      }

      if (sortBy === 'Mais recente') return new Date(b.data_publicacao).getTime() - new Date(a.data_publicacao).getTime()
      if (sortBy === 'Maior quantidade') return b.quantidade - a.quantidade
      if (sortBy === 'Menor preço') return a.valor_desejado - b.valor_desejado
      return 0
    })

  const hasActiveFilters = !!(
    filterCategory ||
    filterResiduo ||
    (filterClasse && filterClasse !== 'Todas') ||
    filterEstadoFisico ||
    filterUf ||
    filterMunicipio ||
    filterBusinessType ||
    filterRadius ||
    filterFavoritesOnly ||
    filterSearchQuery
  )

  if (loading) {
    return (
      <div className="main-layout" style={{ justifyContent: 'center', alignItems: 'center', background: '#000' }}>
        <p style={{ color: 'var(--primary-500)', fontSize: '1.2rem', fontWeight: 'bold' }}>Carregando Materra Elo...</p>
      </div>
    )
  }

  // Check if logged in user is carrier
  const isCarrierUser = profile?.tipo_parte === 'Transportadora'

  return (
    <div className="main-layout" style={{ background: '#000', color: '#f5f5f5', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <nav style={{
        background: 'rgba(10, 10, 10, 0.95)',
        borderBottom: '2px solid var(--primary-500)',
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Logo Brand & Menu Trigger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {user && profile && (
              <button
                type="button"
                onClick={() => setMenuDrawerOpen(true)}
                style={{
                  background: 'rgba(8, 8, 8, 0.92)',
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
                  boxShadow: '0 0 10px rgba(255, 215, 0, 0.3)',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ width: '18px', height: '2px', background: '#ffd700', borderRadius: '1px' }}></div>
                <div style={{ width: '18px', height: '2px', background: '#ffd700', borderRadius: '1px' }}></div>
                <div style={{ width: '18px', height: '2px', background: '#ffd700', borderRadius: '1px' }}></div>
                <div style={{ width: '18px', height: '2px', background: '#ffd700', borderRadius: '1px' }}></div>
                <div style={{ width: '18px', height: '2px', background: '#ffd700', borderRadius: '1px' }}></div>
                <div style={{ width: '18px', height: '2px', background: '#ffd700', borderRadius: '1px' }}></div>
              </button>
            )}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LogoBrand />
            </Link>
          </div>

          {/* Ficha search bar inside the header - Always visible */}
          <form onSubmit={handleFichaSearch} style={{ display: 'flex', gap: '8px', flex: '1', maxWidth: '300px' }}>
            <input
              type="text"
              placeholder="Buscar Ficha por Nome..."
              value={searchFichaQuery}
              onChange={e => setSearchFichaQuery(e.target.value)}
              onFocus={() => { if (!user) setIsSearchFocused(true); }}
              className="form-input"
              style={{ padding: '8px 12px', background: '#121212', color: '#fff', fontSize: '0.85rem', height: '38px', border: '1px solid #333', borderRadius: '4px', width: '100%' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 16px', height: '38px', fontSize: '0.85rem', color: '#000', fontWeight: 'bold', borderRadius: '4px' }}>
              Buscar
            </button>
          </form>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            {!user ? (
              <>
                <Link href="/sobre" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-500)'} onMouseLeave={e => e.currentTarget.style.color = '#aaa'}>O Que Fazemos</Link>
                <Link href="/jornadas" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-500)'} onMouseLeave={e => e.currentTarget.style.color = '#aaa'}>Como funciona</Link>
                <Link href="/planos" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-500)'} onMouseLeave={e => e.currentTarget.style.color = '#aaa'}>Planos</Link>
                <Link href="/quotas" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-500)'} onMouseLeave={e => e.currentTarget.style.color = '#aaa'}>Cotações</Link>
                <Link href="/mercado-potencial" style={{ color: '#aaa', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-500)'} onMouseLeave={e => e.currentTarget.style.color = '#aaa'}>Mercado Potencial / Controladores</Link>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginLeft: '10px' }}>
                  <Link href="/auth/login" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#000', fontWeight: 'bold', textDecoration: 'none', borderRadius: '4px' }}>
                    Acessar
                  </Link>
                  <Link href="/auth/cadastro?role=usuario" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', color: 'var(--primary-500)', border: '1px solid var(--primary-500)', background: 'transparent', textDecoration: 'none', borderRadius: '4px' }}>
                    Cadastrar
                  </Link>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#aaa' }}>
                  Olá, <strong style={{ color: 'var(--primary-500)' }}>{profile?.nome_ou_razao || user.email}</strong>
                </span>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#1c1c1c', border: '1px solid #333', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* SEARCH RESULTS — sticky just below the nav, independent of page scroll */}
      {(fichaResults.length > 0 || (!user && (hasSearchedFicha || isSearchFocused)) || (user && hasSearchedFicha)) && (
        <div style={{
          position: 'sticky',
          top: '62px',          /* height of the nav bar */
          zIndex: 99,
          background: 'rgba(14,14,14,0.98)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,215,0,0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 20px' }}>

            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ color: 'var(--primary-500)', fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                  Fichas Materra Encontradas
                </h3>
                {fichaResults.length > 0 && (
                  <span style={{ fontSize: '11px', background: 'rgba(255,215,0,0.1)', color: 'var(--primary-500)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '20px', padding: '2px 10px', fontWeight: 700 }}>
                    {fichaResults.length} resultado{fichaResults.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <button
                onClick={() => { setFichaResults([]); setHasSearchedFicha(false); setIsSearchFocused(false); setSearchFichaQuery(''); }}
                style={{ background: 'rgba(255,83,83,0.08)', border: '1px solid rgba(255,83,83,0.25)', color: '#ff5353', cursor: 'pointer', borderRadius: '6px', padding: '4px 12px', fontSize: '12px', fontWeight: 700 }}
              >
                ✕ Fechar Busca
              </button>
            </div>

            {/* Real search results */}
            {fichaResults.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px', marginBottom: user ? 0 : '20px' }}>
                {fichaResults.map(f => (
                  <div
                    key={f.id}
                    onClick={() => handleFichaClick(f)}
                    style={{
                      background: '#1c1c1c',
                      border: '1px solid #2a2a2a',
                      padding: '14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'transform 100ms, border-color 100ms',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(255,215,0,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#2a2a2a'; }}
                  >
                    <strong style={{ color: '#fff', display: 'block', fontSize: '0.9rem' }}>{f.nome_ou_razao}</strong>
                    <span style={{ fontSize: '0.78rem', color: '#888' }}>{f.cidade} — {f.uf}</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.72rem', color: 'var(--primary-500)' }}>
                      <span>Selo: {f.nivel_selo || 'Bronze'}</span>
                      <span>Pontuação: {getReputationDisplay(f)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : hasSearchedFicha ? (
              <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: user ? 0 : '20px' }}>
                Nenhuma ficha pública encontrada para &quot;{searchFichaQuery}&quot;.
              </p>
            ) : null}

            {/* Grandes Empresas — ONLY for visitors (not logged in) */}
            {!user && (
              <div style={{ borderTop: fichaResults.length > 0 || hasSearchedFicha ? '1px solid #1e1e1e' : 'none', paddingTop: fichaResults.length > 0 || hasSearchedFicha ? '16px' : 0, marginTop: fichaResults.length > 0 || hasSearchedFicha ? '16px' : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 800, margin: 0 }}>
                    Grandes Geradores &amp; Indústrias Cadastradas
                  </h4>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(255,179,0,0.1)', color: 'var(--primary-500)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, border: '1px solid rgba(255,179,0,0.2)' }}>
                    Requer Assinatura Premium
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                  {GRANDES_EMPRESAS.map(emp => (
                    <div
                      key={emp.id}
                      onClick={() => setSelectedGrandeEmpresa(emp)}
                      style={{
                        background: '#151515',
                        border: '1px solid #222',
                        padding: '14px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'transform 100ms, border-color 100ms',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--primary-500)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#222'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                        <div>
                          <strong style={{ color: '#fff', display: 'block', fontSize: '0.9rem' }}>{emp.nome}</strong>
                          <span style={{ fontSize: '0.78rem', color: '#666' }}>{emp.cidade} - {emp.uf}</span>
                        </div>
                        <span style={{ fontSize: '0.62rem', background: '#222', color: 'var(--primary-500)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, border: '1px solid rgba(255,179,0,0.15)', flexShrink: 0 }}>
                          🔒 BLOQUEADO
                        </span>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '10px', border: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#666' }}>Selo de Compliance:</span>
                          <span style={{ color: '#fff', filter: 'blur(4px)', userSelect: 'none', fontWeight: 700, background: 'rgba(255,179,0,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                            Selo {emp.selo}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#666' }}>Avaliação de Operação:</span>
                          <span style={{ color: 'var(--primary-500)', filter: 'blur(4px)', userSelect: 'none', fontWeight: 700 }}>
                            {emp.score}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #222', paddingTop: '6px', marginTop: '2px' }}>
                          <span style={{ color: '#666' }}>Licença Ambiental:</span>
                          <span style={{ color: 'var(--primary-500)', textDecoration: 'underline', fontSize: '0.72rem', filter: 'blur(4px)', userSelect: 'none' }}>
                            Visualizar Licença
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}


      {/* USER DASHBOARD PORTAL */}
      {user && profile && (() => {
        // Perfis que precisam aguardar liberação manual da plataforma
        const needsApproval =
          (profile.tipo_parte === 'Transportadora' || profile.subtipo === 'Indivíduo') &&
          profile.status_documentos !== 'Verificado' &&
          profile.status_documentos !== 'Aprovado';

        const tipoLabel = profile.tipo_parte === 'Transportadora' ? 'Transportadora' : 'Controlador';
        const zapMsg = encodeURIComponent(`Olá! Sou ${profile.nome_ou_razao || 'um usuário'} cadastrado como ${tipoLabel} na Materra Elo e estou aguardando liberação de acesso. Meu e-mail: ${profile.email || ''}`);
        const zapUrl = `https://wa.me/${WHATSAPP_NUM}?text=${zapMsg}`;

        return (
          <>
            {/* ══ OVERLAY: AGUARDANDO LIBERAÇÃO (não fechável) ══ */}
            {needsApproval && (
              <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                background: 'rgba(0,0,0,0.97)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                textAlign: 'center',
              }}>
                {/* Animated clock icon */}
                <div style={{
                  width: '96px', height: '96px', borderRadius: '50%',
                  background: 'rgba(255,215,0,0.06)',
                  border: '2px solid rgba(255,215,0,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '28px',
                  animation: 'pulse-ring 2.5s ease-in-out infinite',
                }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                    stroke="var(--primary-500)" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>

                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255,215,0,0.08)',
                  border: '1px solid rgba(255,215,0,0.2)',
                  borderRadius: '20px',
                  padding: '4px 14px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--primary-500)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '24px',
                }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--primary-500)', display: 'inline-block', animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
                  Em análise
                </div>

                <h1 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.8rem, 5vw, 3rem)',
                  fontWeight: 900,
                  color: '#fff',
                  letterSpacing: '0.02em',
                  marginBottom: '16px',
                  lineHeight: 1.15,
                }}>
                  Aguardando<br/>
                  <span style={{ color: 'var(--primary-500)' }}>Liberação da Plataforma</span>
                </h1>

                <p style={{
                  fontSize: '1rem',
                  color: '#888',
                  maxWidth: '520px',
                  lineHeight: 1.7,
                  marginBottom: '36px',
                }}>
                  Seu cadastro como <strong style={{ color: '#fff' }}>{tipoLabel}</strong> foi recebido e está
                  em processo de homologação pela equipe Materra Elo. Em breve você receberá
                  um contato por e-mail confirmando a liberação do seu acesso completo.
                </p>

                {/* Info card */}
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '12px',
                  padding: '20px 28px',
                  maxWidth: '460px',
                  width: '100%',
                  marginBottom: '32px',
                  textAlign: 'left',
                }}>
                  {[
                    { icon: '📄', label: 'Análise de documentos', desc: 'Verificação de licenças e credenciais enviadas' },
                    { icon: '🔍', label: 'Validação cadastral', desc: 'Conferência dos dados da empresa e responsável' },
                    { icon: '✅', label: 'Aprovação e acesso', desc: 'Liberação do painel completo por e-mail' },
                  ].map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: i < 2 ? '16px' : 0 }}>
                      <div style={{ fontSize: '1.2rem', marginTop: '2px', flexShrink: 0 }}>{step.icon}</div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>{step.label}</div>
                        <div style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.4 }}>{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* WhatsApp CTA */}
                <a
                  href={zapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: '#25D366',
                    color: '#000',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    padding: '14px 28px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    letterSpacing: '0.02em',
                    boxShadow: '0 4px 20px rgba(37,211,102,0.25)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,211,102,0.35)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.25)'; }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Falar com o Suporte — (62) 99927-1816
                </a>

                <p style={{ fontSize: '11px', color: '#444', marginTop: '20px' }}>
                  Prazo médio de análise: <strong style={{ color: '#666' }}>1 a 2 dias úteis</strong>
                </p>

                <style>{`
                  @keyframes pulse-ring {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(255,215,0,0.15); }
                    50% { box-shadow: 0 0 0 16px rgba(255,215,0,0); }
                  }
                `}</style>
              </div>
            )}

        <div style={{ background: '#0a0a0a', borderBottom: '1px solid #222', padding: '30px 20px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                  {(profile.tipo_parte === 'Fornecedor / Comprador' || profile.tipo_parte === 'Fornecedor e Comprador') 
                    ? <>Painel de Controle de <span style={{ color: 'var(--primary-500)' }}>Fornecedor e Comprador</span></>
                    : <>Painel de Controle - <span style={{ color: 'var(--primary-500)' }}>{getDynamicRoleLabel()}</span></>
                  }
                </h2>
                <p style={{ color: '#888', fontSize: '0.85rem' }}>
                  Gerencie suas operações e documentos de resíduos industriais
                </p>
              </div>

              {/* Verified Badge / Score status */}
              <div style={{ display: 'flex', gap: '16px', background: '#121212', padding: '10px 16px', borderRadius: '8px', border: '1px solid #333' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#777', textTransform: 'uppercase', display: 'block' }}>Pontuação Ficha Materra</span>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--primary-500)' }}>{getReputationDisplay(profile)}</strong>
                </div>
                <div style={{ borderLeft: '1px solid #333', paddingLeft: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#777', textTransform: 'uppercase', display: 'block' }}>Selo de Habilitação</span>
                  <strong style={{ fontSize: '1.1rem', color: '#fff' }}>Selo {profile.nivel_selo || 'Bronze'}</strong>
                </div>
                <div style={{ borderLeft: '1px solid #333', paddingLeft: '16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#777', textTransform: 'uppercase', display: 'block' }}>Assinatura</span>
                  <strong style={{ fontSize: '1.1rem', color: checkHasPaidPlan() ? 'var(--primary-500)' : '#aaa' }}>
                    {checkHasPaidPlan() ? (profile.plano || 'Mercado') : 'Gratuita'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Quick shortcuts grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '30px' }}>
              {/* Fornecedor / Comprador (Perfil Duplo) specific shortcuts */}
              {(profile.tipo_parte === 'Fornecedor / Comprador' || profile.tipo_parte === 'Fornecedor e Comprador') ? (
                <>
                  <button onClick={() => handlePublishAdTrigger('Oferta')} className="btn btn-primary" style={{ padding: '14px', fontSize: '0.85rem', color: '#000', fontWeight: 'bold' }}>
                    Publicar Oferta de Resíduo
                  </button>
                  <button onClick={() => handlePublishAdTrigger('Demanda')} className="btn btn-primary" style={{ padding: '14px', fontSize: '0.85rem', color: '#000', fontWeight: 'bold', background: 'var(--primary-500)', borderColor: 'var(--primary-500)' }}>
                    Publicar Demanda de Resíduo
                  </button>
                  <button onClick={handleFreightSimulationTrigger} className="btn btn-secondary" style={{ padding: '14px', fontSize: '0.85rem', background: '#121212', border: '1px solid #333' }}>
                    Cotar Frete (Leilão Reverso)
                  </button>
                </>
              ) : (profile.tipo_parte === 'Fornecedor' || profile.subtipo === 'Corretor' || profile.subtipo === 'Corretor/Controlador') ? (
                <>
                  <button onClick={() => handlePublishAdTrigger('Oferta')} className="btn btn-primary" style={{ padding: '14px', fontSize: '0.85rem', color: '#000', fontWeight: 'bold' }}>
                    Anunciar
                  </button>
                  <button onClick={handleFreightSimulationTrigger} className="btn btn-secondary" style={{ padding: '14px', fontSize: '0.85rem', background: '#121212', border: '1px solid #333' }}>
                    Cotar Frete (Leilão Reverso)
                  </button>
                </>
              ) : (
                /* Comprador specific shortcuts */
                profile.tipo_parte === 'Comprador' && (
                  <>
                    <button onClick={() => handlePublishAdTrigger('Demanda')} className="btn btn-primary" style={{ padding: '14px', fontSize: '0.85rem', color: '#000', fontWeight: 'bold' }}>
                      Publicar Necessidade de Compra
                    </button>
                    <button onClick={() => handlePublishAdTrigger('Oferta')} className="btn btn-secondary" style={{ padding: '14px', fontSize: '0.85rem', background: '#121212', border: '1px solid #333' }}>
                      Publicar Oferta de Resíduo
                    </button>
                    <button onClick={handleFreightSimulationTrigger} className="btn btn-secondary" style={{ padding: '14px', fontSize: '0.85rem', background: '#121212', border: '1px solid #333' }}>
                      Cotar Frete (Leilão Reverso)
                    </button>
                  </>
                )
              )}

              {/* Transportadora specific shortcuts */}
              {isCarrierUser && (
                <>
                  <button onClick={handleFreightSimulationTrigger} className="btn btn-primary" style={{ padding: '14px', fontSize: '0.85rem', color: '#000', fontWeight: 'bold' }}>
                    Sala de Leilões Públicos
                  </button>
                </>
              )}
            </div>


            {/* DASHBOARD TABS */}
            <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #222', marginBottom: '24px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setDashboardTab('geral')}
                style={{
                  padding: '12px 20px', background: 'none', border: 'none',
                  color: dashboardTab === 'geral' ? 'var(--primary-500)' : '#aaa',
                  borderBottom: dashboardTab === 'geral' ? '2px solid var(--primary-500)' : '2px solid transparent',
                  fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem'
                }}
              >
                Geral
              </button>
              {/* Meus Anúncios removido desta barra - agora integrado no painel Geral */}
               {/* Broker represented companies tab */}
              {(profile.subtipo === 'Corretor' || profile.subtipo === 'Corretor/Controlador') && (
                <button
                  onClick={() => setDashboardTab('representadas')}
                  style={{
                    padding: '12px 20px', background: 'none', border: 'none',
                    color: dashboardTab === 'representadas' ? 'var(--primary-500)' : '#aaa',
                    borderBottom: dashboardTab === 'representadas' ? '2px solid var(--primary-500)' : '2px solid transparent',
                    fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem'
                  }}
                >
                  Empresas que Represento
                </button>
              )}
            </div>

            {/* TAB CONTENT: GERAL */}
            {dashboardTab === 'geral' && (
              isCarrierUser ? (
                  /* --- SE isCarrierUser FOR TRUE (Carrier Workspace) --- */
                  <div>
                    {/* Switch/Toggle at the top */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
                      <div style={{
                        display: 'flex', background: '#121212', border: '1px solid #333',
                        borderRadius: '30px', padding: '4px', width: '360px'
                      }}>
                        <button
                          onClick={() => setCarrierView('convites')}
                          style={{
                            flex: 1, padding: '10px 16px', border: 'none', borderRadius: '26px',
                            background: carrierView === 'convites' ? 'var(--primary-500)' : 'transparent',
                            color: carrierView === 'convites' ? '#000' : '#888',
                            fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease',
                            fontSize: '0.85rem'
                          }}
                        >
                          📩 Convites Recebidos
                        </button>
                        <button
                          onClick={() => setCarrierView('negociacoes')}
                          style={{
                            flex: 1, padding: '10px 16px', border: 'none', borderRadius: '26px',
                            background: carrierView === 'negociacoes' ? 'var(--primary-500)' : 'transparent',
                            color: carrierView === 'negociacoes' ? '#000' : '#888',
                            fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease',
                            fontSize: '0.85rem'
                          }}
                        >
                          🤝 Em Negociação
                        </button>
                      </div>
                    </div>

                    {/* Área Dinâmica */}
                    {carrierView === 'convites' ? (
                      <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '8px', padding: '24px', marginBottom: '30px' }}>
                        <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px', textAlign: 'left' }}>
                          📡 O Radar - Convites de Frete Disponíveis
                        </h4>
                        {(() => {
                          const fallbackInvites = [
                            {
                              id: 'mock-invite-1',
                              tipo_material: 'Bagaço de Cana-de-Açúcar',
                              origem: 'Jataí, GO',
                              destino: 'Rio Verde, GO',
                              tipo_caminhao: 'Carreta Graneleira',
                              quantidade: 45,
                              unidade: 't',
                              valor_desejado: 2200,
                              data_fim_leilao: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
                            },
                            {
                              id: 'mock-invite-2',
                              tipo_material: 'Torta de Filtro',
                              origem: 'Goianésia, GO',
                              destino: 'Anápolis, GO',
                              tipo_caminhao: 'Caçamba Basculante',
                              quantidade: 28,
                              unidade: 't',
                              valor_desejado: 1400,
                              data_fim_leilao: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
                            },
                            {
                              id: 'mock-invite-3',
                              tipo_material: 'Cama de Frango',
                              origem: 'Rio Verde, GO',
                              destino: 'Goiânia, GO',
                              tipo_caminhao: 'Truck Graneleiro',
                              quantidade: 18,
                              unidade: 't',
                              valor_desejado: 950,
                              data_fim_leilao: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString()
                            }
                          ];

                          const mergedInvites = [...freightAuctions, ...fallbackInvites];
                          const filteredInvites = mergedInvites.filter(
                            invite => !joinedFreights.some(jf => jf.id === invite.id)
                          );

                          if (filteredInvites.length === 0) {
                            return (
                              <div style={{ padding: '40px', background: '#121212', border: '1px solid #222', borderRadius: '6px', textAlign: 'center' }}>
                                <p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>Nenhum novo convite disponível no radar no momento.</p>
                              </div>
                            );
                          }

                          return (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                              {filteredInvites.map(item => (
                                <CarrierInviteCard
                                  key={item.id}
                                  item={item}
                                  onEnter={handleJoinDispute}
                                />
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      /* carrierView === 'negociacoes' */
                      <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '8px', padding: '24px', marginBottom: '30px' }}>
                        <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px', textAlign: 'left' }}>
                          🤝 A Mesa de Lances - Negociações Ativas
                        </h4>
                        {(() => {
                          const activeDisputes = joinedFreights.filter(
                            item => new Date(item.data_fim_leilao).getTime() > Date.now() && item.status !== 'Finalizado'
                          );

                          if (activeDisputes.length === 0) {
                            return (
                              <div style={{ padding: '40px', background: '#121212', border: '1px solid #222', borderRadius: '6px', textAlign: 'center' }}>
                                <p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>Nenhuma disputa de frete activa no momento.</p>
                              </div>
                            );
                          }

                          return (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                              {activeDisputes.map(item => (
                                <CarrierNegotiationCard
                                  key={item.id}
                                  item={item}
                                  onLeave={handleLeaveDispute}
                                  onUpdateBid={handleUpdateBid}
                                  onExpire={handleExpireDispute}
                                />
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* O Cofre (HISTÓRICO | AUDIT TRAIL | CONTATOS) */}
                    <div style={{
                      marginTop: '40px', background: '#0d0d0d',
                      border: '2px dashed rgba(255, 215, 0, 0.3)', borderRadius: '8px', padding: '24px'
                    }}>
                      <h3 style={{ color: '#ffd700', fontSize: '1.15rem', fontWeight: 800, marginBottom: '6px', letterSpacing: '1px', textAlign: 'left' }}>
                        🔒 HISTÓRICO | AUDIT TRAIL | CONTATOS
                      </h3>
                      <p style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '20px', textAlign: 'left' }}>
                        Abaixo estão listadas as disputas concluídas ou que expiraram no prazo regulamentar.
                      </p>

                      {(() => {
                        const expiredDisputes = joinedFreights.filter(
                          item => new Date(item.data_fim_leilao).getTime() <= Date.now() || item.status === 'Finalizado'
                        );

                        if (expiredDisputes.length === 0) {
                          return (
                            <div style={{ textAlign: 'center', padding: '30px', border: '1px dashed #333', borderRadius: '6px' }}>
                              <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>Nenhuma disputa finalizada no cofre até o momento.</p>
                            </div>
                          );
                        }

                        return (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                            {expiredDisputes.map(item => {
                              const won = item.result === 'won';
                              return (
                                <div key={item.id} style={{
                                  background: '#121212',
                                  border: won ? '1px solid #ffd700' : '1px solid #333',
                                  padding: '16px',
                                  borderRadius: '6px',
                                  textAlign: 'left',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '12px'
                                }}>
                                  <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                      <span style={{ fontSize: '0.7rem', color: '#888' }}>DISPUTA #{item.id?.substring(0, 6)}</span>
                                      {won ? (
                                        <span style={{ fontSize: '0.75rem', background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #ffd700', color: '#ffd700', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                          🏆 VOCÊ VENCEU A DISPUTA!
                                        </span>
                                      ) : (
                                        <span style={{ fontSize: '0.75rem', background: '#222', border: '1px solid #444', color: '#888', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                          ❌ DISPUTA ENCERRADA
                                        </span>
                                      )}
                                    </div>
                                    <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>
                                      {item.tipo_material || item.residuo || 'Frete de Resíduo'}
                                    </strong>
                                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>📍 Rota: {item.origem} → {item.destino}</span>
                                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>⚖️ Peso: {item.quantidade} {item.unidade || 't'}</span>
                                  </div>

                                  {won && item.contato && (
                                    <div style={{ background: '#0a0a0a', border: '1px solid #ffd700', padding: '10px 12px', borderRadius: '4px', fontSize: '0.8rem', color: '#ccc' }}>
                                      <strong style={{ color: '#ffd700', display: 'block', marginBottom: '4px' }}>👤 Contato do Anunciante:</strong>
                                      <div>🏢 Razão Social: {item.contato.razao_social}</div>
                                      <div>📧 E-mail: {item.contato.email}</div>
                                      <div>📞 WhatsApp: {item.contato.whatsapp}</div>
                                    </div>
                                  )}

                                  <div style={{ fontSize: '0.72rem', color: '#777', borderTop: '1px solid #222', paddingTop: '8px' }}>
                                    <div style={{ fontWeight: 'bold', color: '#666', textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                      Audit Trail (Lance final: R$ {item.lance_atual?.toLocaleString('pt-BR')})
                                    </div>
                                    {item.auditTrail && item.auditTrail.map((log: any, idx: number) => {
                                      const logText = typeof log === 'string' ? log : log.acao;
                                      const logDate = typeof log === 'string' ? null : log.data;
                                      return (
                                        <div key={idx}>
                                          • {logDate ? `[${new Date(logDate).toLocaleDateString('pt-BR')}] ` : ''}{logText}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  /* --- SE isCarrierUser FOR FALSE (Keep existing layout exactly) --- */
                  <>
                    {/* DOUBLE SPECIALTY ALERT BANNER */}
                    {(profile.tipo_parte === 'Fornecedor' || profile.tipo_parte === 'Comprador') && (
                      <div style={{
                        background: 'rgba(255, 215, 0, 0.05)',
                        border: '1px solid rgba(255, 215, 0, 0.25)',
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '30px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                          <div>
                            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                              <span style={{ color: 'var(--primary-500)' }}>⚡ Habilitar Especialidade Dupla</span>
                            </h3>
                            <p style={{ color: '#ccc', fontSize: '0.8rem', marginTop: '6px', lineHeight: '1.4', margin: 0 }}>
                              Seu perfil atual está configurado apenas como <strong>{profile.tipo_parte}</strong>. Desbloqueie a capacidade de <strong>Comprar e Vender simultaneamente</strong> (Fornecedor e Comprador) para publicar tanto ofertas quanto demandas sob a mesma conta.
                            </p>
                          </div>
                          <button
                            onClick={() => { setShowHabilitacaoModal(true); setDoubleHabilitationStep(1); }}
                            className="btn"
                            style={{
                              background: 'var(--primary-500)',
                              color: '#000',
                              fontWeight: 'bold',
                              fontSize: '0.85rem',
                              padding: '10px 20px',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            Ativar Perfil Duplo
                          </button>
                        </div>
                      </div>
                    )}

                {/* WORKSPACE DE OPERAÇÕES */}
                <div style={{ marginTop: '20px' }}>
                  {/* SWITCH / TOGGLE SIDE-TO-SIDE */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
                    <div style={{
                      display: 'flex', background: '#121212', border: '1px solid #333',
                      borderRadius: '30px', padding: '4px', width: '320px'
                    }}>
                      <button
                        onClick={() => setActiveView('anuncios')}
                        style={{
                          flex: 1, padding: '10px 16px', border: 'none', borderRadius: '26px',
                          background: activeView === 'anuncios' ? 'var(--primary-500)' : 'transparent',
                          color: activeView === 'anuncios' ? '#000' : '#888',
                          fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease',
                          fontSize: '0.85rem'
                        }}
                      >
                        💼 Meus Anúncios
                      </button>
                      <button
                        onClick={() => setActiveView('negocios')}
                        style={{
                          flex: 1, padding: '10px 16px', border: 'none', borderRadius: '26px',
                          background: activeView === 'negocios' ? 'var(--primary-500)' : 'transparent',
                          color: activeView === 'negocios' ? '#000' : '#888',
                          fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease',
                          fontSize: '0.85rem'
                        }}
                      >
                        🤝 Meus Negócios
                      </button>
                    </div>
                  </div>

                  {/* ÁREA DINÂMICA */}
                  {activeView === 'anuncios' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                      {/* Coluna 1 (Ofertas) */}
                      <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '8px', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', paddingBottom: '10px', marginBottom: '16px' }}>
                          <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 'bold', margin: 0 }}>📦 Minhas Ofertas</h4>
                          <Link href="/anuncios/publicar" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#000', fontWeight: 'bold' }}>
                            + Novo
                          </Link>
                        </div>
                        
                        {loadingMyListings ? (
                          <p style={{ color: '#888', fontSize: '0.85rem' }}>Buscando ofertas...</p>
                        ) : myListings.filter(a => a.tipo_anuncio === 'Oferta' && !isNegotiationExpired(a)).length === 0 ? (
                          <p style={{ color: '#666', fontSize: '0.8rem', fontStyle: 'italic', padding: '20px 0' }}>Nenhuma oferta ativa publicada.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {myListings.filter(a => a.tipo_anuncio === 'Oferta' && !isNegotiationExpired(a)).map(item => {
                              const isLocked = item.status === 'Em Negociação' || item.status === 'Em_Negociacao' || item.status === 'Em negociação' || item.taxa_paga
                              return (
                                <div key={item.id} style={{ background: '#121212', border: '1px solid #222', padding: '14px', borderRadius: '6px', textAlign: 'left' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <strong style={{ color: '#fff', fontSize: '0.88rem' }}>{item.residuo}</strong>
                                    <span style={{ fontSize: '0.65rem', background: '#222', color: 'var(--primary-500)', padding: '2px 6px', borderRadius: '4px' }}>{item.codigo}</span>
                                  </div>
                                  <p style={{ color: '#aaa', fontSize: '0.78rem', margin: '4px 0' }}>
                                    Qtd: {item.quantidade} {item.unidade} • Valor: R$ {item.valor_desejado?.toLocaleString('pt-BR')}
                                  </p>
                                  
                                  {isLocked ? (
                                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--primary-500)', background: 'rgba(255,215,0,0.05)', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(255,215,0,0.15)' }}>
                                      <span>🔒 Lock de Segurança (Lote sob negociação)</span>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                      <button
                                        onClick={() => setQuickEditAd(item)}
                                        className="btn btn-secondary"
                                        style={{ flex: 1, padding: '6px 8px', fontSize: '0.72rem', background: '#1c1c1c', border: '1px solid #333' }}
                                      >
                                        Editar
                                      </button>
                                      <button
                                        onClick={() => toggleListingActiveStatus(item)}
                                        className="btn btn-secondary"
                                        style={{ flex: 1, padding: '6px 8px', fontSize: '0.72rem', background: '#1c1c1c', border: '1px solid #333' }}
                                      >
                                        {item.status === 'Inativo' ? 'Reativar' : 'Suspender'}
                                      </button>
                                      <button
                                        onClick={() => setMatchingAdModal(item)}
                                        className="btn btn-primary"
                                        style={{ flex: 1, padding: '6px 8px', fontSize: '0.72rem', fontWeight: 'bold', color: '#000' }}
                                      >
                                        Recomendados
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {/* Coluna 2 (Demandas) */}
                      <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '8px', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', paddingBottom: '10px', marginBottom: '16px' }}>
                          <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 'bold', margin: 0 }}>📥 Minhas Demandas</h4>
                          <Link href="/anuncios/publicar" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#000', fontWeight: 'bold' }}>
                            + Novo
                          </Link>
                        </div>

                        {loadingMyListings ? (
                          <p style={{ color: '#888', fontSize: '0.85rem' }}>Buscando demandas...</p>
                        ) : myListings.filter(a => a.tipo_anuncio === 'Demanda' && !isNegotiationExpired(a)).length === 0 ? (
                          <p style={{ color: '#666', fontSize: '0.8rem', fontStyle: 'italic', padding: '20px 0' }}>Nenhuma demanda activa publicada.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {myListings.filter(a => a.tipo_anuncio === 'Demanda' && !isNegotiationExpired(a)).map(item => {
                              const isLocked = item.status === 'Em Negociação' || item.status === 'Em_Negociacao' || item.status === 'Em negociação' || item.taxa_paga
                              return (
                                <div key={item.id} style={{ background: '#121212', border: '1px solid #222', padding: '14px', borderRadius: '6px', textAlign: 'left' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <strong style={{ color: '#fff', fontSize: '0.88rem' }}>{item.residuo}</strong>
                                    <span style={{ fontSize: '0.65rem', background: '#222', color: 'var(--primary-500)', padding: '2px 6px', borderRadius: '4px' }}>{item.codigo}</span>
                                  </div>
                                  <p style={{ color: '#aaa', fontSize: '0.78rem', margin: '4px 0' }}>
                                    Qtd: {item.quantidade} {item.unidade} • Valor: R$ {item.valor_desejado?.toLocaleString('pt-BR')}
                                  </p>

                                  {isLocked ? (
                                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--primary-500)', background: 'rgba(255,215,0,0.05)', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(255,215,0,0.15)' }}>
                                      <span>🔒 Lock de Segurança (Lote sob negociação)</span>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                      <button
                                        onClick={() => setQuickEditAd(item)}
                                        className="btn btn-secondary"
                                        style={{ flex: 1, padding: '6px 8px', fontSize: '0.72rem', background: '#1c1c1c', border: '1px solid #333' }}
                                      >
                                        Editar
                                      </button>
                                      <button
                                        onClick={() => toggleListingActiveStatus(item)}
                                        className="btn btn-secondary"
                                        style={{ flex: 1, padding: '6px 8px', fontSize: '0.72rem', background: '#1c1c1c', border: '1px solid #333' }}
                                      >
                                        {item.status === 'Inativo' ? 'Reativar' : 'Suspender'}
                                      </button>
                                      <button
                                        onClick={() => setMatchingAdModal(item)}
                                        className="btn btn-primary"
                                        style={{ flex: 1, padding: '6px 8px', fontSize: '0.72rem', fontWeight: 'bold', color: '#000' }}
                                      >
                                        Recomendados
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                      {/* Coluna 1 (Ofertas em Negociação) */}
                      <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '8px', padding: '20px' }}>
                        <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold', borderBottom: '1px solid #222', paddingBottom: '10px', marginBottom: '16px', textAlign: 'left' }}>
                          💼 Ofertas em Negociação
                        </h4>
                        {myListings.filter(a => a.tipo_anuncio === 'Oferta' && (a.status === 'Em Negociação' || a.status === 'Em_Negociacao' || a.status === 'Em negociação' || a.taxa_paga) && !isNegotiationExpired(a)).length === 0 ? (
                          <p style={{ color: '#666', fontSize: '0.8rem', fontStyle: 'italic', padding: '20px 0' }}>Nenhuma oferta em negociação.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {myListings.filter(a => a.tipo_anuncio === 'Oferta' && (a.status === 'Em Negociação' || a.status === 'Em_Negociacao' || a.status === 'Em negociação' || a.taxa_paga) && !isNegotiationExpired(a)).map(item => (
                              <NegotiationCard key={item.id} item={item} type="oferta" onPaySuperTaxa={handlePaySuperTaxa} />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Coluna 2 (Demandas em Negociação) */}
                      <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '8px', padding: '20px' }}>
                        <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold', borderBottom: '1px solid #222', paddingBottom: '10px', marginBottom: '16px', textAlign: 'left' }}>
                          🤝 Demandas em Negociação
                        </h4>
                        {myListings.filter(a => a.tipo_anuncio === 'Demanda' && (a.status === 'Em Negociação' || a.status === 'Em_Negociacao' || a.status === 'Em negociação' || a.taxa_paga) && !isNegotiationExpired(a)).length === 0 ? (
                          <p style={{ color: '#666', fontSize: '0.8rem', fontStyle: 'italic', padding: '20px 0' }}>Nenhuma demanda em negociação.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {myListings.filter(a => a.tipo_anuncio === 'Demanda' && (a.status === 'Em Negociação' || a.status === 'Em_Negociacao' || a.status === 'Em negociação' || a.taxa_paga) && !isNegotiationExpired(a)).map(item => (
                              <NegotiationCard key={item.id} item={item} type="demanda" onPaySuperTaxa={handlePaySuperTaxa} />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Coluna 3 (Cotações de Frete) */}
                      <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '8px', padding: '20px' }}>
                        <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold', borderBottom: '1px solid #222', paddingBottom: '10px', marginBottom: '16px', textAlign: 'left' }}>
                          🚚 Cotações de Frete
                        </h4>
                        {freightAuctions.length === 0 ? (
                          <p style={{ color: '#666', fontSize: '0.8rem', fontStyle: 'italic', padding: '20px 0' }}>Nenhum leilão de frete activo.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {freightAuctions.map(item => (
                              <NegotiationCard key={item.id} item={item} type="frete" onPaySuperTaxa={handlePaySuperTaxa} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* O COFRE (CONTAINER FIXO INFERIOR) */}
                  <div style={{
                    marginTop: '40px', background: '#0d0d0d',
                    border: '2px dashed rgba(255, 215, 0, 0.3)', borderRadius: '8px', padding: '24px'
                  }}>
                    <h3 style={{ color: '#ffd700', fontSize: '1.15rem', fontWeight: 800, marginBottom: '6px', letterSpacing: '1px', textAlign: 'left' }}>
                      🔒 HISTÓRICO | AUDIT TRAIL | CONTATOS
                    </h3>
                    <p style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '20px', textAlign: 'left' }}>
                      Abaixo estão listadas as transações cujas negociações foram concluídas (via Super Taxa) ou que expiraram no prazo regulamentar.
                    </p>

                    {(() => {
                      const finalizedAds = myListings.filter(a => isNegotiationExpired(a) || a.status === 'Finalizado' || a.status === 'Fechado' || a.status === 'Arrematado')

                      if (finalizedAds.length === 0 && releasedContacts.length === 0) {
                        return (
                          <div style={{ textAlign: 'center', padding: '30px', border: '1px dashed #333', borderRadius: '6px' }}>
                            <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>Nenhuma transação no cofre até o momento.</p>
                          </div>
                        )
                      }

                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                          {/* Render direct released contacts */}
                          {releasedContacts.map((c: any, idx: number) => {
                            const an = c.anuncio || { codigo: 'N/A', residuo: 'Desconhecido', quantidade: 0, unidade: 't', valor_desejado: 0 }
                            const cp = c.contraparte || { nome_ou_razao: 'Empresa Parceira', email: 'N/A', whatsapp: 'N/A', tipo_parte: 'Parceiro', nivel_selo: 'Bronze', score_0a100: 80 }
                            return (
                              <div key={`contact-${idx}`} style={{ background: '#121212', border: '1px solid #333', padding: '16px', borderRadius: '6px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#ffb300', marginBottom: '4px' }}>
                                    <span>Operação Concluída</span>
                                    <span>[{an.codigo}]</span>
                                  </div>
                                  <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{an.residuo}</strong>
                                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#888', marginTop: '2px' }}>
                                    Qtd: {an.quantidade} {an.unidade} • Valor Acordado: R$ {an.valor_desejado?.toLocaleString('pt-BR')}
                                  </span>
                                </div>

                                <div style={{ background: '#0a0a0a', border: '1px solid #222', padding: '10px 12px', borderRadius: '4px', fontSize: '0.8rem', color: '#ccc' }}>
                                  <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>👤 {cp.nome_ou_razao}</strong>
                                  <div>📧 E-mail: {cp.email || 'N/A'}</div>
                                  <div>📞 WhatsApp: {cp.whatsapp || cp.telefone || 'N/A'}</div>
                                </div>

                                <div style={{ fontSize: '0.72rem', color: '#777' }}>
                                  <div style={{ fontWeight: 'bold', color: '#666', textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: '0.5px', marginBottom: '4px' }}>Audit Trail (Lances & Compliance)</div>
                                  <div>• [2026-06-22] Anúncio publicado e verificado no blockchain Materra.</div>
                                  <div>• [2026-06-23] Taxa de negociação PIX confirmada.</div>
                                  <div>• [2026-06-24] Auditoria de compliance finalizada com sucesso.</div>
                                </div>

                                <button
                                  onClick={() => setFichaModal({
                                    tipo: cp.tipo_parte || 'Fornecedor',
                                    nome: cp.nome_ou_razao || 'Empresa Parceira',
                                    perfil: cp.tipo_parte || 'Fornecedor',
                                    regiao: cp.cidade ? `${cp.cidade} - ${cp.uf}` : 'Região de Origem',
                                    chips: [{
                                      label: cp.tipo_parte || 'Fornecedor',
                                      selo: cp.nivel_selo || 'Bronze',
                                      score: cp.score_0a100 || 85
                                    }],
                                    docs: ['LO de Geração', 'CTF/APP-IBAMA', 'PGRS', 'Alvará de Funcionamento']
                                  })}
                                  className="btn btn-secondary"
                                  style={{ width: '100%', padding: '8px', fontSize: '0.75rem', background: '#1c1c1c', border: '1px solid #333' }}
                                >
                                  🛡️ Fichas na Terra
                                </button>
                              </div>
                            )
                          })}

                          {/* Render other finalized ads not in released contacts */}
                          {finalizedAds.filter(a => !releasedContacts.some(c => c.id_anuncio === a.id)).map((an: any, idx: number) => {
                            return (
                              <div key={`ad-${idx}`} style={{ background: '#121212', border: '1px solid #333', padding: '16px', borderRadius: '6px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#ffb300', marginBottom: '4px' }}>
                                    <span>Operação Concluída</span>
                                    <span>[{an.codigo}]</span>
                                  </div>
                                  <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{an.residuo}</strong>
                                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#888', marginTop: '2px' }}>
                                    Qtd: {an.quantidade} {an.unidade} • Valor: R$ {an.valor_desejado?.toLocaleString('pt-BR')}
                                  </span>
                                </div>

                                <div style={{ background: '#0a0a0a', border: '1px solid #222', padding: '10px 12px', borderRadius: '4px', fontSize: '0.8rem', color: '#ccc' }}>
                                  <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>👤 Contraparte Geral</strong>
                                  <div>📧 E-mail: comercial@materraelo.com.br</div>
                                  <div>📞 WhatsApp: (62) 99999-9999</div>
                                </div>

                                <div style={{ fontSize: '0.72rem', color: '#777' }}>
                                  <div style={{ fontWeight: 'bold', color: '#666', textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: '0.5px', marginBottom: '4px' }}>Audit Trail (Lances & Compliance)</div>
                                  <div>• [2026-06-22] Anúncio publicado e verificado no blockchain Materra.</div>
                                  <div>• [2026-06-24] Negociação encerrada por expiração de tempo ou Super Taxa.</div>
                                </div>

                                <button
                                  onClick={() => setFichaModal({
                                    tipo: 'Empresa',
                                    nome: 'Contraparte Geral',
                                    perfil: 'Fornecedor',
                                    regiao: 'Goiânia - GO',
                                    chips: [{
                                      label: 'Fornecedor',
                                      selo: 'Prata',
                                      score: 90
                                    }],
                                    docs: ['LO de Geração', 'PGRS']
                                  })}
                                  className="btn btn-secondary"
                                  style={{ width: '100%', padding: '8px', fontSize: '0.75rem', background: '#1c1c1c', border: '1px solid #333' }}
                                >
                                  🛡️ Fichas na Terra
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()}
                  </div>
                </div>

                {/* QUICK EDIT AD OVERLAY MODAL */}
                {quickEditAd && (
                  <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100001, padding: '20px'
                  }}>
                    <div style={{
                      background: '#121212', border: '2px solid #ffd700', borderRadius: '8px',
                      width: '100%', maxWidth: '450px', padding: '24px', position: 'relative',
                      boxShadow: '0 0 20px rgba(255, 215, 0, 0.2)'
                    }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffd700', marginBottom: '16px' }}>
                        ✏️ Editar Anúncio ({quickEditAd.codigo})
                      </h3>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          const { error } = await supabase
                            .from('anuncios')
                            .update({
                              residuo: quickEditAd.residuo,
                              quantidade: parseFloat(quickEditAd.quantidade),
                              unidade: quickEditAd.unidade,
                              valor_desejado: parseFloat(quickEditAd.valor_desejado)
                            })
                            .eq('id', quickEditAd.id);

                          if (error) throw error;
                          alert('Anúncio atualizado com sucesso!');
                          fetchMyListings(user.id);
                          fetchListings();
                          setQuickEditAd(null);
                        } catch (err: any) {
                          alert('Erro ao atualizar anúncio: ' + err.message);
                        }
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', marginBottom: '20px' }}>
                          <div>
                            <label style={{ fontSize: '0.75rem', color: '#aaa', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Resíduo</label>
                            <input
                              type="text"
                              value={quickEditAd.residuo}
                              onChange={(ev) => setQuickEditAd({ ...quickEditAd, residuo: ev.target.value })}
                              required
                              style={{ width: '100%', background: '#1c1c1c', border: '1px solid #333', padding: '8px', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                            />
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                              <label style={{ fontSize: '0.75rem', color: '#aaa', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Quantidade</label>
                              <input
                                type="number"
                                step="any"
                                value={quickEditAd.quantidade}
                                onChange={(ev) => setQuickEditAd({ ...quickEditAd, quantidade: ev.target.value })}
                                required
                                style={{ width: '100%', background: '#1c1c1c', border: '1px solid #333', padding: '8px', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.75rem', color: '#aaa', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Unidade</label>
                              <input
                                type="text"
                                value={quickEditAd.unidade}
                                onChange={(ev) => setQuickEditAd({ ...quickEditAd, unidade: ev.target.value })}
                                required
                                style={{ width: '100%', background: '#1c1c1c', border: '1px solid #333', padding: '8px', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                              />
                            </div>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.75rem', color: '#aaa', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Valor Desejado (R$)</label>
                            <input
                              type="number"
                              step="any"
                              value={quickEditAd.valor_desejado}
                              onChange={(ev) => setQuickEditAd({ ...quickEditAd, valor_desejado: ev.target.value })}
                              required
                              style={{ width: '100%', background: '#1c1c1c', border: '1px solid #333', padding: '8px', borderRadius: '4px', color: '#fff', fontSize: '0.85rem' }}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                          <button type="button" onClick={() => setQuickEditAd(null)} style={{ background: '#222', border: '1px solid #444', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Cancelar</button>
                          <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '4px' }}>Salvar</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* RECOMENDADOS CROSSTABS OVERLAY MODAL */}
                {matchingAdModal && (
                  <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100002, padding: '20px'
                  }}>
                    <div style={{
                      background: '#121212', border: '2px solid #ffd700', borderRadius: '8px',
                      width: '100%', maxWidth: '600px', padding: '24px', position: 'relative',
                      boxShadow: '0 0 20px rgba(255, 215, 0, 0.2)', maxHeight: '80vh', overflowY: 'auto'
                    }}>
                      <button
                        onClick={() => setMatchingAdModal(null)}
                        style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#aaa', fontSize: '1.2rem', cursor: 'pointer' }}
                      >
                        &times;
                      </button>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffd700', marginBottom: '4px' }}>
                        🔍 Cruzamentos Recomendados para Match
                      </h3>
                      <p style={{ color: '#aaa', fontSize: '0.78rem', marginBottom: '16px' }}>
                        Anúncio de referência: <strong>[{matchingAdModal.codigo}] {matchingAdModal.residuo}</strong>
                      </p>

                      {(() => {
                        const isItemOferta = matchingAdModal.tipo_anuncio?.toLowerCase().includes('oferta')
                        const matches = listings.filter(l => {
                          if (l.id === matchingAdModal.id) return false
                          if (l.status !== 'Anunciado') return false
                          if (l.categoria !== matchingAdModal.categoria) return false
                          const isLOferta = l.tipo_anuncio?.toLowerCase().includes('oferta')
                          return isItemOferta !== isLOferta
                        })

                        if (matches.length === 0) {
                          return (
                            <p style={{ color: '#777', fontSize: '0.85rem', padding: '20px 0', textAlign: 'center' }}>
                              Nenhum anúncio contrário ativo encontrado na mesma categoria ({matchingAdModal.categoria || 'Geral'}) no momento.
                            </p>
                          )
                        }

                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {matches.map(m => (
                              <div key={m.id} style={{ background: '#1c1c1c', border: '1px solid #333', borderRadius: '6px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                <div style={{ textAlign: 'left' }}>
                                  <span style={{ fontSize: '0.65rem', background: '#333', color: 'var(--primary-500)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                    {m.codigo}
                                  </span>
                                  <h4 style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 'bold', margin: '4px 0 2px' }}>{m.residuo}</h4>
                                  <p style={{ color: '#aaa', fontSize: '0.75rem', margin: 0 }}>
                                    Qtd: {m.quantidade} {m.unidade} • Valor: R$ {m.valor_desejado?.toLocaleString('pt-BR')}
                                  </p>
                                  <p style={{ color: '#888', fontSize: '0.7rem', margin: '2px 0 0 0' }}>
                                    Anunciante: {getAdvertiserRoleLabel(m)}
                                  </p>
                                </div>

                                <button
                                  onClick={async () => {
                                    try {
                                      const { error: errAd } = await supabase
                                        .from('anuncios')
                                        .update({ status: 'Em negociação', taxa_paga: true })
                                        .eq('id', matchingAdModal.id)

                                      if (errAd) throw errAd

                                      const { error: errCp } = await supabase
                                        .from('contatos')
                                        .insert([{
                                          id_usuario: user.id,
                                          id_contraparte: m.id_cadastro || 'mock-contraparte-id',
                                          id_anuncio: matchingAdModal.id,
                                          liberado: true,
                                          valor_real: matchingAdModal.valor_desejado,
                                          valor_index: matchingAdModal.valor_index || matchingAdModal.valor_desejado * 0.95
                                        }])

                                      alert('Taxa lead paga com sucesso! A negociação foi iniciada e está disponível na aba Meus Negócios.')
                                      fetchMyListings(user.id)
                                      fetchListings()
                                      loadReleasedContacts(user.id)
                                      setMatchingAdModal(null)
                                    } catch (err: any) {
                                      alert('Erro ao pagar taxa: ' + err.message)
                                    }
                                  }}
                                  className="btn btn-primary"
                                  style={{
                                    padding: '8px 12px', fontSize: '0.75rem', fontWeight: 'bold', color: '#000',
                                    background: 'var(--primary-500)', border: 'none', borderRadius: '4px', cursor: 'pointer'
                                  }}
                                >
                                  ⚡ Pagar Taxa (R$ 50)
                                </button>
                              </div>
                            ))}
                          </div>
                        )
                      })()}
                </div>
              </div>
            )}

          </>
        )
      )}

            {/* TAB CONTENT: FAVORITOS */}
            {dashboardTab === 'favoritos' && (
              <div style={{ background: '#121212', border: '1px solid #222', borderRadius: '8px', padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>Seus Anúncios Salvos</h3>
                  <p style={{ color: '#888', fontSize: '0.8rem' }}>Visualize e acompanhe rapidamente os lotes que você favoritou na vitrine</p>
                </div>

                {favorites.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <span style={{ color: 'var(--primary-500)', display: 'inline-block', transform: 'scale(2)', marginBottom: '16px' }}>
                      <HeartIcon filled={true} />
                    </span>
                    <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '12px' }}>Você ainda não favoritou nenhum anúncio.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {favorites.map(item => {
                      const deviation = item.percentual_desvio ? `${item.percentual_desvio}` : null
                      const advertiserSeal = item.cadastros?.nivel_selo || 'Bronze'
                      const isArrematado = item.status === 'Arrematado'

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleListingClick(item)}
                          style={{
                            background: '#1c1c1c',
                            border: '1px solid #333',
                            borderRadius: '12px',
                            padding: '20px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            minHeight: '230px',
                            transition: 'transform 100ms, border-color 100ms',
                            opacity: isArrematado ? 0.65 : 1,
                            filter: isArrematado ? 'grayscale(30%)' : 'none'
                          }}
                          onMouseEnter={e => {
                            if (!isArrematado) {
                              e.currentTarget.style.transform = 'translateY(-2px)'
                              e.currentTarget.style.borderColor = 'var(--primary-500)'
                            }
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'none'
                            e.currentTarget.style.borderColor = '#333'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '0.7rem', color: '#ffb300', fontWeight: 'bold' }}>CONFIDENCIAL</span>
                                <span style={{ fontSize: '0.65rem', color: '#aaa' }}>{getAdvertiserRoleLabel(item)}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleFavorite(item)
                                  }}
                                  style={{ display: 'flex', alignItems: 'center', padding: '4px' }}
                                >
                                  <HeartIcon filled={true} />
                                </div>
                                {isArrematado ? (
                                  <span style={{ fontSize: '0.75rem', background: 'rgba(239,83,80,0.2)', padding: '2px 8px', borderRadius: '4px', color: '#ef5350', fontWeight: 'bold', border: '1px solid #ef5350' }}>
                                    OCUPADO
                                  </span>
                                ) : (() => {
                                  const badgeStyle = getSealBadgeStyle(advertiserSeal)
                                  return (
                                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', ...badgeStyle }}>
                                      Selo: {advertiserSeal}
                                    </span>
                                  )
                                })()}
                              </div>
                            </div>

                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
                              {item.residuo}
                            </h3>
                            
                            <p style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '12px' }}>
                              Qtd: <strong>{item.quantidade} {item.unidade}</strong> • Freq: {item.frequencia}{(() => {
                                const prazo = getPrazoRecorrencia(item)
                                return (item.frequencia !== 'Única' && prazo) ? ` (${prazo})` : ''
                              })()} • UF: {item.uf} • {getDeterministicViews(item.id)} visualizações
                            </p>

                            {deviation && (
                              <span style={{
                                display: 'inline-block',
                                background: 'rgba(255, 215, 0, 0.1)',
                                border: '1px solid var(--primary-500)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                color: 'var(--primary-500)',
                                fontWeight: 'bold',
                                marginBottom: '10px'
                              }}>
                                Desvio: {deviation}
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #333', paddingTop: '10px', marginTop: '10px' }}>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#666', display: 'block' }}>VALOR REFERÊNCIA</span>
                              <strong style={{ color: '#fff', fontSize: '0.95rem' }}>R$ {item.valor_desejado}</strong>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#666', display: 'block' }}>MATERRA INDEX</span>
                              <strong style={{ color: 'var(--primary-500)', fontSize: '0.95rem' }}>
                                {item.valor_index ? `R$ ${item.valor_index}` : 'Calculando...'}
                              </strong>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: DOCUMENTOS */}
            {dashboardTab === 'documentos' && (
              // DOCUMENTS MANAGER UPLOAD AREA
              <div style={{
              background: '#121212',
              border: '1px solid #222',
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '30px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '16px' }}>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '6px' }}>
                    Homologação de Ficha Materra - Upload de Licenças e Laudos
                  </h3>
                  <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: 0 }}>
                    Envie seus documentos regulatórios. Usuários que enviarem toda a documentação ganham a liberação de 1 Lead de Contato gratuito!
                  </p>
                </div>
                {profile.status_documentos === 'Verificado' || profile.status_documentos === 'Aprovado' ? (
                  <div style={{
                    background: 'rgba(76, 175, 80, 0.1)',
                    border: '1px solid #4caf50',
                    color: '#4caf50',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span>✓</span> Homologado e Aprovado
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(255, 179, 0, 0.1)',
                    border: '1px solid #ffb300',
                    color: '#ffb300',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                  }}>
                    Status: {profile.status_documentos || 'Pendente'}
                  </div>
                )}
              </div>

              {/* Show uploaded docs overview */}
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '0.85rem', color: '#aaa', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Seus Documentos Atuais:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {(() => {
                    const docList: React.ReactNode[] = []
                    
                    if (profile.licenca_ambiental_url) {
                      docList.push(
                        <div key="licenca_ambiental" style={{ background: '#1c1c1c', border: '1px solid #333', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem' }}>
                          <span style={{ color: 'var(--primary-500)', fontWeight: 'bold' }}>LICENÇA AMBIENTAL DE TRANSPORTE</span>:{' '}
                          <a href={profile.licenca_ambiental_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: '#fff' }}>Ver Arquivo</a>
                          {profile.licenca_ambiental_num && <span style={{ color: '#888', marginLeft: '6px' }}>(Nº {profile.licenca_ambiental_num})</span>}
                        </div>
                      )
                    }

                    if (profile.rntrc_url) {
                      docList.push(
                        <div key="rntrc" style={{ background: '#1c1c1c', border: '1px solid #333', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem' }}>
                          <span style={{ color: 'var(--primary-500)', fontWeight: 'bold' }}>RNTRC ANTT</span>:{' '}
                          <a href={profile.rntrc_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: '#fff' }}>Ver Arquivo</a>
                          {profile.rntrc_num && <span style={{ color: '#888', marginLeft: '6px' }}>(Nº {profile.rntrc_num})</span>}
                        </div>
                      )
                    }

                    if (profile.documentos_recebidos) {
                      try {
                        const docs = JSON.parse(profile.documentos_recebidos)
                        Object.keys(docs).forEach(k => {
                          docList.push(
                            <div key={k} style={{ background: '#1c1c1c', border: '1px solid #333', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem' }}>
                              <span style={{ color: 'var(--primary-500)', fontWeight: 'bold' }}>{k.toUpperCase().replace(/_/g, ' ')}</span>:{' '}
                              <a href={docs[k].url} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', color: '#fff' }}>Ver Arquivo</a>
                              {docs[k].num && <span style={{ color: '#888', marginLeft: '6px' }}>(Nº {docs[k].num})</span>}
                            </div>
                          )
                        })
                      } catch (e) {
                        console.error('Error parsing documentos_recebidos', e)
                      }
                    }

                    if (docList.length === 0) {
                      return <span style={{ fontSize: '0.8rem', color: '#666' }}>Nenhum documento enviado ainda.</span>
                    }

                    return docList
                  })()}
                </div>
              </div>

              {/* Select doc type and form */}
              <div style={{ borderTop: '1px solid #222', paddingTop: '20px' }}>
                <label className="form-label" style={{ color: '#fff', fontSize: '0.9rem' }}>Selecione o Documento para Enviar:</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  
                  {/* CORRETOR DOC TYPES */}
                  {(profile.subtipo === 'Corretor' || profile.subtipo === 'Corretor/Controlador') && (
                    <>
                      {['cpf_cnpj', 'rg_contrato_social', 'comprovante_endereco', 'regularidade_fiscal', 'idoneidade_criminal', 'crea_art_opcional', 'qualificacao_gestao_opcional'].map(type => (
                        <button
                          key={type}
                          onClick={() => { setActiveDocType(type); setDocFile(null); }}
                          style={{
                            padding: '8px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #333',
                            background: activeDocType === type ? 'var(--primary-500)' : '#1c1c1c',
                            color: activeDocType === type ? '#000' : '#ccc', cursor: 'pointer'
                          }}
                        >
                          {getDocNameFriendly(type)}
                        </button>
                      ))}
                    </>
                  )}

                  {/* FORNECEDOR / COMPRADOR (PERFIL DUPLO) DOC TYPES */}
                  {(profile.tipo_parte === 'Fornecedor / Comprador' || profile.tipo_parte === 'Fornecedor e Comprador') && profile.subtipo !== 'Corretor' && profile.subtipo !== 'Corretor/Controlador' && (
                    <>
                      {['licenca_ambiental_residuo', 'pgrs', 'ctf_ibama', 'inventario_residuos', 'cadri_opcional', 'licenca_recebimento', 'autorizacao_especifica'].map(type => (
                        <button
                          key={type}
                          onClick={() => { setActiveDocType(type); setDocFile(null); }}
                          style={{
                            padding: '8px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #333',
                            background: activeDocType === type ? 'var(--primary-500)' : '#1c1c1c',
                            color: activeDocType === type ? '#000' : '#ccc', cursor: 'pointer'
                          }}
                        >
                          {getDocNameFriendly(type)}
                        </button>
                      ))}
                    </>
                  )}

                  {/* FORNECEDOR DOC TYPES */}
                  {profile.tipo_parte === 'Fornecedor' && profile.subtipo !== 'Corretor' && profile.subtipo !== 'Corretor/Controlador' && (
                    <>
                      {['licenca_ambiental_residuo', 'pgrs', 'ctf_ibama', 'inventario_residuos', 'cadri_opcional'].map(type => (
                        <button
                          key={type}
                          onClick={() => { setActiveDocType(type); setDocFile(null); }}
                          style={{
                            padding: '8px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #333',
                            background: activeDocType === type ? 'var(--primary-500)' : '#1c1c1c',
                            color: activeDocType === type ? '#000' : '#ccc', cursor: 'pointer'
                          }}
                        >
                          {getDocNameFriendly(type)}
                        </button>
                      ))}
                    </>
                  )}

                  {/* COMPRADOR DOC TYPES */}
                  {profile.tipo_parte === 'Comprador' && profile.subtipo !== 'Corretor' && profile.subtipo !== 'Corretor/Controlador' && (
                    <>
                      {['licenca_recebimento', 'ctf_ibama', 'autorizacao_especifica', 'cadri_opcional', 'pgrs'].map(type => (
                        <button
                          key={type}
                          onClick={() => { setActiveDocType(type); setDocFile(null); }}
                          style={{
                            padding: '8px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #333',
                            background: activeDocType === type ? 'var(--primary-500)' : '#1c1c1c',
                            color: activeDocType === type ? '#000' : '#ccc', cursor: 'pointer'
                          }}
                        >
                          {getDocNameFriendly(type)}
                        </button>
                      ))}
                    </>
                  )}

                  {/* TRANSPORTADORA (EXCLUSIVE OR OWN) DOC TYPES */}
                  {(isCarrierUser || profile.transportadora_propria) && (
                    <>
                      {['licenca_ambiental', 'antt_rntrc', 'ctf_ibama', 'mopp', 'civ', 'cipp', 'seguro_transporte', 'ficha_emergencia'].map(type => (
                        <button
                          key={type}
                          onClick={() => { setActiveDocType(type); setDocFile(null); }}
                          style={{
                            padding: '8px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #333',
                            background: activeDocType === type ? 'var(--primary-500)' : '#1c1c1c',
                            color: activeDocType === type ? '#000' : '#ccc', cursor: 'pointer'
                          }}
                        >
                          {getDocNameFriendly(type)}
                        </button>
                      ))}
                    </>
                  )}
                </div>

                {activeDocType && (
                  <form onSubmit={handleUploadDocumentSubmit} style={{ background: '#1c1c1c', padding: '16px', borderRadius: '8px', border: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '500px' }}>
                    <h4 style={{ color: 'var(--primary-500)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      Enviando: {getDocNameFriendly(activeDocType)}
                    </h4>

                    {/* Number input if applicable */}
                    {['licenca_ambiental_residuo', 'licenca_recebimento', 'ctf_ibama', 'licenca_ambiental', 'antt_rntrc', 'civ', 'cipp', 'seguro_transporte', 'cpf_cnpj', 'rg_contrato_social', 'crea_art_opcional'].includes(activeDocType) && (
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Número do Documento / Registro</label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ background: '#000', color: '#fff', border: '1px solid #333', fontSize: '0.8rem', padding: '6px' }}
                          value={docNumber}
                          onChange={e => setDocNumber(e.target.value)}
                          required
                        />
                      </div>
                    )}

                    {/* Validity validity if applicable */}
                    {['licenca_ambiental_residuo', 'licenca_recebimento', 'ctf_ibama', 'licenca_ambiental', 'antt_rntrc', 'civ', 'cipp', 'seguro_transporte', 'mopp', 'regularidade_fiscal', 'idoneidade_criminal'].includes(activeDocType) && (
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Data de Validade</label>
                        <input
                          type="date"
                          className="form-input"
                          style={{ background: '#000', color: '#fff', border: '1px solid #333', fontSize: '0.8rem', padding: '6px' }}
                          value={docValidity}
                          onChange={e => setDocValidity(e.target.value)}
                          required
                        />
                      </div>
                    )}

                    {/* Special Mopp Checkbox */}
                    {activeDocType === 'mopp' && (
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={docMoppChecked}
                          onChange={e => setDocMoppChecked(e.target.checked)}
                        />
                        Possui credenciamento MOPP ativo?
                      </label>
                    )}

                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Selecionar Arquivo PDF / Imagem</label>
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={e => setDocFile(e.target.files?.[0] || null)}
                        required
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.8rem', color: '#000', fontWeight: 'bold' }} disabled={uploadingDoc}>
                        {uploadingDoc ? 'Enviando...' : 'Salvar Documento'}
                      </button>
                      <button type="button" onClick={() => setActiveDocType('')} className="btn btn-secondary" style={{ padding: '8px', fontSize: '0.8rem', background: '#333', border: 'none' }}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
            )}

            {/* TAB CONTENT: AUDITORIA */}
            {dashboardTab === 'auditoria' && (
            <div style={{ background: '#121212', border: '1px solid #222', borderRadius: '8px', padding: '20px' }}>
              <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold', marginBottom: '16px' }}>
                Transações Homologadas e Rastreabilidade (Audit Trail Privado)
              </h3>
              {loadingAudit ? (
                <p style={{ color: '#888', fontSize: '0.8rem' }}>Buscando histórico...</p>
              ) : auditLogs.length === 0 ? (
                <p style={{ color: '#666', fontSize: '0.8rem' }}>Nenhuma transação fechada e auditada ainda.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {auditLogs.map(log => (
                    <div key={log.id} style={{ background: '#1c1c1c', border: '1px solid #333', padding: '16px', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid #2a2a2a', paddingBottom: '8px', marginBottom: '8px' }}>
                        <span style={{ color: 'var(--primary-500)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                          MTR: {log.mtr_numero || 'Pendente'} | CDF: {log.cdf_numero || 'Pendente'}
                        </span>
                        <span style={{ color: '#777', fontSize: '0.8rem' }}>
                          {new Date(log.data_hora).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.85rem' }}>
                        <div>
                          <strong style={{ color: '#aaa', display: 'block' }}>Resíduo:</strong>
                          <span style={{ color: '#fff' }}>{log.anuncio_cad?.residuo || 'Mapeado'} (Cod: {log.anuncio_cad?.codigo || 'N/A'})</span>
                        </div>
                        <div>
                          <strong style={{ color: '#aaa', display: 'block' }}>Partes Envolvidas:</strong>
                          <span style={{ color: '#fff' }}>
                            Fornecedor: {log.fornecedor_cad?.nome_ou_razao || 'N/A'}<br />
                            Comprador: {log.comprador_cad?.nome_ou_razao || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <strong style={{ color: '#aaa', display: 'block' }}>Valores Registrados:</strong>
                          <span style={{ color: '#fff' }}>
                            Resíduo: R$ {log.valor_residuo_rs?.toLocaleString('pt-BR') || '0'}<br />
                            Frete: R$ {log.valor_frete_rs?.toLocaleString('pt-BR') || '0'}
                          </span>
                        </div>
                        <div>
                          <strong style={{ color: '#aaa', display: 'block' }}>Classificação de Segurança:</strong>
                          <span style={{ color: 'var(--primary-500)', fontWeight: 'bold' }}>
                            Audit: {log.nivel_audit}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}

            {/* TAB CONTENT: REPRESENTADAS */}
            {dashboardTab === 'representadas' && (
              <div style={{ background: '#121212', border: '1px solid #222', borderRadius: '8px', padding: '24px' }}>
                <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '6px' }}>
                  Fichas de Empresas Representadas
                </h3>
                <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '20px' }}>
                  Lista das empresas que você representa vinculadas aos seus anúncios publicados. A homologação e o selo são validados pelo time Materra.
                </p>

                {loadingRepCompanies ? (
                  <p style={{ color: '#888', fontSize: '0.85rem' }}>Carregando empresas...</p>
                ) : repCompanies.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed #333', borderRadius: '8px' }}>
                    <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '12px' }}>
                      Você ainda não preencheu nenhuma ficha de empresa representada.
                    </p>
                    <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '4px' }}>
                      Ao publicar um novo anúncio, preencha a seção opcional de dados da representada.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {repCompanies.map(comp => (
                      <div key={comp.id} style={{ background: '#1c1c1c', border: '1px solid #333', borderRadius: '8px', padding: '20px', position: 'relative' }}>
                        
                        {/* Metal Seal Badge */}
                        <div style={{
                          position: 'absolute',
                          top: '16px',
                          right: '16px',
                          background: comp.selo_metal === 'Ouro' ? 'linear-gradient(135deg, #ffd700 0%, #ffa500 100%)' : (comp.selo_metal === 'Prata' ? '#c0c0c0' : '#cd7f32'),
                          color: '#000',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {comp.selo_metal || 'Bronze'}
                        </div>

                        <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 'bold', margin: '0 0 10px', paddingRight: '60px' }}>
                          {comp.razao_social}
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', fontSize: '0.8rem', color: '#ccc' }}>
                          <div>
                            <strong style={{ color: '#777' }}>CNPJ:</strong> {comp.cnpj || 'Não fornecido'}
                          </div>
                          <div>
                            <strong style={{ color: '#777' }}>Licença:</strong> {comp.licenca_url ? (
                              <a href={comp.licenca_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-500)', textDecoration: 'underline' }}>
                                Ver Anexo
                              </a>
                            ) : 'Nenhuma licença anexada'}
                          </div>
                          <div>
                            <strong style={{ color: '#777' }}>CADRI:</strong> {comp.cadri || 'Não fornecido'}
                          </div>
                          <div>
                            <strong style={{ color: '#777' }}>Status Ficha:</strong>{' '}
                            <span style={{
                              color: comp.status_documentos === 'Verificado' ? 'var(--primary-500)' : '#ffb300',
                              fontWeight: 'bold'
                            }}>
                              {comp.status_documentos || 'Pendente'}
                            </span>
                          </div>
                          <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: '8px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: '#777' }}>Ficha Materra Score:</span>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--primary-500)' }}>
                              {comp.score_0a100 || 50}/100
                            </strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: CONTATOS LIBERADOS */}
            {dashboardTab === 'contatos_liberados' && (() => {
              const grouped = releasedContacts.reduce((acc: any, c: any) => {
                const adId = c.id_anuncio || 'sem_anuncio'
                if (!acc[adId]) {
                  acc[adId] = {
                    anuncio: c.anuncio || { codigo: 'N/A', residuo: 'Desconhecido' },
                    contrapartes: [],
                    transportadoras: [],
                    valor_index: c.valor_index,
                    valor_real: c.valor_real,
                    premiacao_percent: c.premiacao_percent,
                    data_liberacao: c.data_liberacao
                  }
                }
                if (c.contraparte) {
                  if (c.contraparte.tipo_parte === 'Transportadora') {
                    acc[adId].transportadoras.push(c.contraparte)
                  } else {
                    acc[adId].contrapartes.push(c.contraparte)
                  }
                }
                return acc;
              }, {});

              return (
                <div style={{ background: '#121212', border: '1px solid #222', borderRadius: '8px', padding: '24px' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '6px' }}>
                    Contatos & Transportadoras Liberados
                  </h3>
                  <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '20px' }}>
                    Abaixo estão os contatos e transportadoras liberados para cada anúncio arrematado.
                  </p>

                  {loadingContacts ? (
                    <p style={{ color: '#888', fontSize: '0.85rem' }}>Buscando contatos...</p>
                  ) : Object.keys(grouped).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed #333', borderRadius: '8px' }}>
                      <p style={{ color: '#888', fontSize: '0.9rem' }}>
                        Nenhum contato liberado até o momento para suas negociações.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {Object.values(grouped).map((group: any, idx: number) => {
                        const an = group.anuncio
                        return (
                          <div key={idx} style={{ background: '#1c1c1c', border: '1px solid #333', padding: '20px', borderRadius: '8px' }}>
                            {/* Ad Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2a2a2a', paddingBottom: '12px', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                              <div>
                                <span style={{ color: 'var(--primary-500)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Operação Concluída</span>
                                <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold', marginTop: '2px' }}>
                                  [{an.codigo || 'N/A'}] {an.residuo || 'Resíduo'}
                                </h4>
                                <span style={{ fontSize: '0.8rem', color: '#888' }}>
                                  Qtd: {an.quantidade} {an.unidade} • Categoria: {an.categoria || 'Geral'}
                                </span>
                              </div>
                              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#aaa' }}>
                                {group.valor_index > 0 && <div>Materra Index: R$ {group.valor_index.toLocaleString('pt-BR')}</div>}
                                {group.valor_real > 0 && <div style={{ color: 'var(--primary-500)', fontWeight: 'bold' }}>Valor Fechado: R$ {group.valor_real.toLocaleString('pt-BR')}</div>}
                                {group.premiacao_percent > 0 && <div style={{ color: '#25D366' }}>Economia: {group.premiacao_percent}%</div>}
                              </div>
                            </div>

                            {/* Contacts info grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                              {/* Counterparties */}
                              <div style={{ background: '#121212', border: '1px solid #222', padding: '16px', borderRadius: '6px' }}>
                                <h5 style={{ color: 'var(--primary-500)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '12px' }}>
                                  Contato da Contraparte
                                </h5>
                                {group.contrapartes.length === 0 ? (
                                  <p style={{ color: '#666', fontSize: '0.8rem' }}>Nenhum contato de contraparte.</p>
                                ) : (
                                  group.contrapartes.map((cp: any, cidx: number) => (
                                    <div key={cidx} style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: '#ccc' }}>
                                      <div>
                                        <strong style={{ color: '#fff' }}>{cp.nome_ou_razao}</strong>
                                      </div>
                                      {cp.cpf_ou_cnpj && <div>Documento: {cp.cpf_ou_cnpj}</div>}
                                      {cp.email && <div>E-mail: {cp.email}</div>}
                                      {cp.cidade && <div>Cidade: {cp.cidade} - {cp.uf}</div>}
                                      {cp.whatsapp && (
                                        <button
                                          onClick={() => {
                                            const cleanNum = cp.whatsapp.replace(/\D/g, '')
                                            const text = `Olá, nosso contato foi liberado na Materra Elo para o anúncio *[${an.codigo}]*.`
                                            window.open(`https://wa.me/55${cleanNum}?text=${encodeURIComponent(text)}`, '_blank')
                                          }}
                                          className="btn"
                                          style={{ background: '#25D366', color: '#000', fontWeight: 'bold', padding: '6px 12px', fontSize: '0.75rem', marginTop: '8px', width: 'fit-content' }}
                                        >
                                          Chamar no WhatsApp
                                        </button>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>

                              {/* Transporters */}
                              <div style={{ background: '#121212', border: '1px solid #222', padding: '16px', borderRadius: '6px' }}>
                                <h5 style={{ color: '#ffd700', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '12px' }}>
                                  Transportadora Vinculada
                                </h5>
                                {group.transportadoras.length === 0 ? (
                                  <p style={{ color: '#666', fontSize: '0.8rem' }}>Nenhuma transportadora vinculada para frete.</p>
                                ) : (
                                  group.transportadoras.map((tp: any, tidx: number) => (
                                    <div key={tidx} style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: '#ccc' }}>
                                      <div>
                                        <strong style={{ color: '#fff' }}>{tp.nome_ou_razao}</strong>
                                      </div>
                                      {tp.email && <div>E-mail: {tp.email}</div>}
                                      {tp.cidade && <div>Cidade: {tp.cidade} - {tp.uf}</div>}
                                      {tp.whatsapp && (
                                        <button
                                          onClick={() => {
                                            const cleanNum = tp.whatsapp.replace(/\D/g, '')
                                            const text = `Olá, você foi selecionado como transportadora do anúncio *[${an.codigo}]* no Materra Elo.`
                                            window.open(`https://wa.me/55${cleanNum}?text=${encodeURIComponent(text)}`, '_blank')
                                          }}
                                          className="btn"
                                          style={{ background: '#25D366', color: '#000', fontWeight: 'bold', padding: '6px 12px', fontSize: '0.75rem', marginTop: '8px', width: 'fit-content' }}
                                        >
                                          Chamar no WhatsApp
                                        </button>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
            {dashboardTab === 'planos' && (
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '20px' }}>
                  Planos & Assinaturas
                </h3>

                {/* Current Plan */}
                <div style={{ background: '#121212', border: '1px solid #222', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <span style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Plano Atual</span>
                      <div style={{ marginTop: '4px' }}>
                        <strong style={{ fontSize: '1.3rem', color: checkHasPaidPlan() ? 'var(--primary-500)' : '#aaa' }}>
                          {checkHasPaidPlan() ? (profile.plano || 'Materra Mercado') : 'Materra Gratuito'}
                        </strong>
                      </div>
                    </div>
                    <Link href="/planos" className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.85rem', background: '#1c1c1c', border: '1px solid #333', color: 'var(--primary-500)', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
                      Ver Todos os Planos
                    </Link>
                  </div>
                </div>

                {/* Coupon Input */}
                <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                  <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold', marginBottom: '8px' }}>
                    Ativar Cupom Promocional
                  </h4>
                  <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '16px' }}>
                    Se você recebeu um cupom, insira-o abaixo para ativar seu plano automaticamente.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Código do cupom"
                      value={couponCode}
                      onChange={e => { setCouponCode(e.target.value); setCouponMsg(null) }}
                      className="form-input"
                      style={{ flex: '1', padding: '12px 16px', background: '#121212', color: '#fff', fontSize: '0.95rem', border: '1px solid #333', borderRadius: '8px', minWidth: '200px' }}
                    />
                    <button
                      onClick={async () => {
                        const code = couponCode.trim()
                        if (!code) {
                          setCouponMsg({ text: 'Insira um código de cupom válido.', ok: false })
                          return
                        }
                        // Validate known coupons
                        if (code === 'GRATIS@20p') {
                          // Activate Materra Mercado
                          try {
                            const { error } = await supabase
                              .from('cadastros')
                              .update({ plano_ativo: true, plano: 'Materra Mercado' })
                              .eq('id', user.id)
                            if (error) {
                              // Fallback: try updating plano column only
                              await supabase
                                .from('cadastros')
                                .update({ plano: 'Pago' })
                                .eq('id', user.id)
                            }
                            setProfile({ ...profile, plano_ativo: true, plano: 'Materra Mercado' })
                            setCouponMsg({ text: 'Cupom ativado com sucesso! Seu plano Materra Mercado está ativo. Você pode anunciar e consultar sem limites.', ok: true })
                            setCouponCode('')
                          } catch (err) {
                            setCouponMsg({ text: 'Erro ao ativar cupom. Tente novamente.', ok: false })
                          }
                        } else if (code === 'MATERRA10' || code === 'CONCIERGE' || code === 'COMPLIANCE') {
                          setCouponMsg({ text: `Cupom "${code}" reconhecido. Entre em contato via WhatsApp para confirmar a ativação.`, ok: true })
                        } else {
                          setCouponMsg({ text: 'Cupom inválido ou expirado. Verifique o código e tente novamente.', ok: false })
                        }
                      }}
                      className="btn"
                      style={{ background: 'var(--primary-500)', color: '#000', fontWeight: 'bold', fontSize: '0.9rem', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', border: 'none' }}
                    >
                      Ativar Cupom
                    </button>
                  </div>
                  {couponMsg && (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      background: couponMsg.ok ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 83, 83, 0.1)',
                      border: `1px solid ${couponMsg.ok ? '#4caf50' : '#ff5353'}`,
                      color: couponMsg.ok ? '#4caf50' : '#ff5353'
                    }}>
                      {couponMsg.text}
                    </div>
                  )}
                </div>

                {/* Plan Features Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', maxWidth: '700px' }}>
                  <div style={{ background: '#121212', border: (!checkHasPaidPlan()) ? '1px solid var(--primary-500)' : '1px solid #222', borderRadius: '12px', padding: '20px' }}>
                    <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold', marginBottom: '12px' }}>Materra Gratuito</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#bbb', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <li><span style={{ color: 'var(--primary-500)' }}>✓</span> 1 Publicação ativa simultânea</li>
                      <li><span style={{ color: 'var(--primary-500)' }}>✓</span> Consulta à Vitrine Pública</li>
                      <li><span style={{ color: 'var(--primary-500)' }}>✓</span> Homologação documental básica</li>
                      <li><span style={{ color: '#ff5353' }}>✗</span> Recomendados / Negociação especial</li>
                      <li><span style={{ color: '#ff5353' }}>✗</span> Audit Trail de transações</li>
                    </ul>
                  </div>
                  <div style={{ background: '#121212', border: checkHasPaidPlan() ? '1px solid var(--primary-500)' : '1px solid #222', borderRadius: '12px', padding: '20px' }}>
                    <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold', marginBottom: '12px' }}>Materra Mercado <span style={{ fontSize: '0.75rem', color: '#888' }}>R$ 150/mês</span></h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#bbb', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <li><span style={{ color: 'var(--primary-500)' }}>✓</span> Publicação ilimitada (anunciar)</li>
                      <li><span style={{ color: 'var(--primary-500)' }}>✓</span> Consultar Vitrine & Recomendados</li>
                      <li><span style={{ color: 'var(--primary-500)' }}>✓</span> Negociar lances via assessoria</li>
                      <li><span style={{ color: 'var(--primary-500)' }}>✓</span> Audit Trail (fechamento verificado)</li>
                      <li><span style={{ color: '#ff5353' }}>✗</span> Buscador de Fichas / Licenças / Frete</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
          </>
        )
      })()}

      {/* VITRINE HERO AREA REMOVED */}

      {/* STOCK TICKER MARQUEE */}
      <div style={{ background: '#000', padding: '10px 0 0', borderBottom: tickerExpanded ? 'none' : '1px solid #222' }}>
        
        {/* ROW 1: RESIDUOS */}
        <div className="ticker-container" style={{ borderBottom: '1px solid #111' }}>
          <Link href="/quotas" className="ticker-title" style={{ cursor: 'pointer', textDecoration: 'none', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Resíduos / Cotas</Link>
          <div className="ticker-wrap">
            <div className="ticker-content">
              {[1, 2].map((loopIdx) => (
                <div key={loopIdx} style={{ display: 'flex' }}>
                  {RESIDUOS_INDEX_DATA.map((item, idx) => (
                    <div key={`${loopIdx}-${idx}`} className="ticker-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="ticker-item-name" style={{ color: '#fff' }}>{item.name}</span>
                      <span className="ticker-item-val" style={{ color: '#aaa' }}>{item.val}</span>
                      <span style={{ 
                        color: item.dir === 'up' ? '#4caf50' : item.dir === 'down' ? '#ef5350' : '#888',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        {item.dir === 'up' ? '▲' : item.dir === 'down' ? '▼' : '■'} {item.pct}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROW 2: TRANSPORTE */}
        <div className="ticker-container">
          <Link href="/quotas" className="ticker-title" style={{ background: '#1c1c1c', color: 'var(--primary-500)', borderRight: '1px solid #333', cursor: 'pointer', textDecoration: 'none', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Transporte km (ANTT)</Link>
          <div className="ticker-wrap">
            <div className="ticker-content" style={{ animationDuration: '110s' }}>
              {[1, 2].map((loopIdx) => (
                <div key={loopIdx} style={{ display: 'flex' }}>
                  {TRANSPORTE_INDEX_DATA.map((item, idx) => (
                    <div key={`${loopIdx}-${idx}`} className="ticker-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="ticker-item-name" style={{ color: '#fff' }}>{item.name}</span>
                      <span className="ticker-item-val" style={{ color: '#aaa' }}>{item.val}</span>
                      <span style={{ 
                        color: item.dir === 'up' ? '#4caf50' : item.dir === 'down' ? '#ef5350' : '#888',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        {item.dir === 'up' ? '▲' : item.dir === 'down' ? '▼' : '■'} {item.pct}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STATUS BAR: última atualização + toggle expandir */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 16px',
          background: '#080808',
          borderTop: '1px solid #1a1a1a',
          borderBottom: tickerExpanded ? 'none' : '1px solid #1a1a1a',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Dot pulsante */}
            <span style={{
              display: 'inline-block',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#4caf50',
              boxShadow: '0 0 6px #4caf50',
              animation: 'pulse-dot 2s ease-in-out infinite'
            }} />
            <span style={{ fontSize: '0.72rem', color: '#666', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.03em' }}>
              Materra Index — Última atualização:
              <strong style={{ color: '#888', marginLeft: '4px' }}>
                {(() => {
                  const mins = Math.floor(tickerSecondsSince / 60)
                  const hrs = Math.floor(mins / 60)
                  if (hrs > 0) return `há ${hrs}h${mins % 60 > 0 ? ` ${mins % 60}min` : ''}`
                  if (mins > 0) return `há ${mins} min`
                  return `agora mesmo`
                })()}
              </strong>
              <span style={{ marginLeft: '8px', color: '#444' }}>• {RESIDUOS_INDEX_DATA.length + TRANSPORTE_INDEX_DATA.length} índices ativos</span>
            </span>
          </div>
          <button
            onClick={() => setTickerExpanded(prev => !prev)}
            style={{
              background: 'none',
              border: '1px solid #2a2a2a',
              color: '#888',
              fontSize: '0.7rem',
              padding: '3px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-mono, monospace)',
              letterSpacing: '0.02em'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-500)'; e.currentTarget.style.color = 'var(--primary-500)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#888' }}
          >
            {tickerExpanded ? 'Recolher ▲' : 'Ver índices completos ▼'}
          </button>
        </div>

        {/* PAINEL EXPANDIDO */}
        {tickerExpanded && (
          <div style={{
            background: '#040404',
            borderBottom: '1px solid #222',
            padding: '20px 20px 24px',
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

              {/* Cabeçalho do painel */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--primary-500)', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Materra Index — Tabela Completa</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: '#555' }}>
                    Baliza de preço crowdsourced. Atualizado há
                    <strong style={{ color: '#777', marginLeft: '4px' }}>
                      {(() => {
                        const mins = Math.floor(tickerSecondsSince / 60)
                        const hrs = Math.floor(mins / 60)
                        if (hrs > 0) return `${hrs}h${mins % 60 > 0 ? ` ${mins % 60}min` : ''}`
                        if (mins > 0) return `${mins} min`
                        return `agora mesmo`
                      })()}
                    </strong>.
                    Fonte: negociações internas + CT-e homologados + Piso ANTT.
                  </p>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#555', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)' }}>
                  <div style={{ color: '#4caf50' }}>{RESIDUOS_INDEX_DATA.filter(i => i.dir === 'up').length} em alta</div>
                  <div style={{ color: '#ef5350' }}>{RESIDUOS_INDEX_DATA.filter(i => i.dir === 'down').length} em baixa</div>
                  <div style={{ color: '#555' }}>{RESIDUOS_INDEX_DATA.filter(i => i.dir === 'flat').length} estáveis</div>
                </div>
              </div>

              {/* Grid de índices de resíduos */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '0.68rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid #1a1a1a' }}>Resíduos &amp; Coprodutos</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '4px' }}>
                  {RESIDUOS_INDEX_DATA.map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      background: '#0c0c0c',
                      border: '1px solid #141414',
                      transition: 'border-color 0.15s'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#141414')}
                    >
                      <span style={{ fontSize: '0.72rem', color: '#aaa', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '8px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#ccc', fontFamily: 'var(--font-mono, monospace)', whiteSpace: 'nowrap' }}>{item.val}</span>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 'bold',
                          color: item.dir === 'up' ? '#4caf50' : item.dir === 'down' ? '#ef5350' : '#555',
                          minWidth: '42px',
                          textAlign: 'right'
                        }}>
                          {item.dir === 'up' ? '▲' : item.dir === 'down' ? '▼' : '■'} {item.pct}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid de índices de transporte */}
              <div>
                <div style={{ fontSize: '0.68rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid #1a1a1a' }}>Transporte &amp; Fretes (ANTT)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '4px' }}>
                  {TRANSPORTE_INDEX_DATA.map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      background: '#0c0c0c',
                      border: '1px solid #141414',
                      transition: 'border-color 0.15s'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#141414')}
                    >
                      <span style={{ fontSize: '0.72rem', color: '#aaa', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '8px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--primary-500)', fontFamily: 'var(--font-mono, monospace)', whiteSpace: 'nowrap' }}>{item.val}</span>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 'bold',
                          color: item.dir === 'up' ? '#4caf50' : item.dir === 'down' ? '#ef5350' : '#555',
                          minWidth: '42px',
                          textAlign: 'right'
                        }}>
                          {item.dir === 'up' ? '▲' : item.dir === 'down' ? '▼' : '■'} {item.pct}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rodapé do painel */}
              <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.65rem', color: '#444' }}>
                  ⚠️ Os índices acima são referencias de mercado, não ofertas vinculantes. Utilize-os como balizadores em suas negociações.
                </p>
                <Link href="/quotas" style={{ fontSize: '0.7rem', color: 'var(--primary-500)', textDecoration: 'none', whiteSpace: 'nowrap', marginLeft: '16px' }}>Ver histórico completo →</Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EXPLANATORY BANNER BELOW TICKER */}
      <div style={{ background: '#0a0a0a', borderBottom: '1px solid #222', padding: '10px 20px', fontSize: '0.78rem', color: '#666', lineHeight: '1.4' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><strong style={{ color: '#888' }}>Índices de Resíduos:</strong> Baliza de preço crowdsourced — negociações internas + parceiros externos.</span>
          <span><strong style={{ color: '#888' }}>Fretes:</strong> Baseado em CT-e, propostas homologadas, transportadoras integradas e Piso ANTT.</span>
        </div>
      </div>
      {/* MAIN VITRINE CONTAINER */}
      {(!profile || profile.tipo_parte !== 'Transportadora') && (
        <div style={{ background: '#000', padding: '30px 20px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            
            {/* Title / Header */}
            <div style={{ marginBottom: '36px' }}>
              {/* Platform tag */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                padding: '6px 14px',
                background: 'rgba(255,179,0,0.1)',
                border: '1px solid rgba(255,179,0,0.25)',
                borderRadius: '20px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary-500)', display: 'inline-block', boxShadow: '0 0 8px var(--primary-500)' }} />
                <span style={{ color: 'var(--primary-500)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Plataforma B2B
                </span>
              </div>

              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                lineHeight: '1.25',
                color: '#fff',
                margin: '0 0 16px 0',
                letterSpacing: '-0.02em',
                width: '100%',
                maxWidth: '100%'
              }}>
                A <span style={{ color: '#ffd700' }}>infraestrutura digital</span> para compra e venda de <span style={{ color: '#ffd700' }}>resíduos e coprodutos</span>. Gerencie sua <span style={{ color: '#ffd700' }}>documentação ambiental</span>, ganhe <span style={{ color: '#ffd700' }}>selos e pontuações</span>, e <span style={{ color: '#ffd700' }}>cote fretes simultaneamente</span> com todas as transportadoras cadastradas para encontrar a melhor opção. Ao final, receba um <span style={{ color: '#ffd700' }}>histórico trilateral</span> de suas transações como <span style={{ color: '#ffd700' }}>prova de conformidade ambiental.</span>
              </h1>

              {/* Subtitle */}
              <p style={{ fontSize: '1.15rem', color: '#888', margin: 0, fontWeight: 400, maxWidth: '800px' }}>
                Conectando geradores, compradores e transportadoras em um ambiente inteligente com mais de <strong style={{ color: '#fff', fontWeight: 600 }}>1.000 tipos de resíduos e coprodutos</strong>.
              </p>
            </div>

            {/* VITRINE TABS */}
            <div style={{ display: 'flex', borderBottom: '2px solid #222', marginBottom: '24px' }}>
              <button
                onClick={() => { setActiveTab('Oferta'); }}
                style={{
                  padding: '16px 24px',
                  border: 'none',
                  background: 'none',
                  color: activeTab === 'Oferta' ? 'var(--primary-500)' : '#777',
                  borderBottom: activeTab === 'Oferta' ? '3px solid var(--primary-500)' : '3px solid transparent',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '1.1rem'
                }}
              >
                Ofertas (Quem Vende)
              </button>
              <button
                onClick={() => { setActiveTab('Demanda'); }}
                style={{
                  padding: '16px 24px',
                  border: 'none',
                  background: 'none',
                  color: activeTab === 'Demanda' ? 'var(--primary-500)' : '#777',
                  borderBottom: activeTab === 'Demanda' ? '3px solid var(--primary-500)' : '3px solid transparent',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '1.1rem'
                }}
              >
                Demandas (Quem Compra)
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '280px 1fr',
              gap: '24px',
              alignItems: 'start'
            }}>
              {/* VITRINE SIDEBAR FILTERS */}
              <aside style={{
                background: '#121212',
                border: '1px solid #222',
                borderRadius: '12px',
                padding: '20px',
                position: 'sticky',
                top: '90px'
              }}>
                <h2 style={{ fontSize: '1rem', color: '#fff', fontWeight: 800, marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Filtros Rápidos</span>
                  <button onClick={() => {
                    setFilterCategory(''); setFilterResiduo(''); setFilterClasse('');
                    setFilterEstadoFisico(''); setFilterAcondicionamento(''); setFilterUf('');
                    setFilterMunicipio(''); setFilterBusinessType('');
                    setFilterFavoritesOnly(false); setFilterSearchQuery('');
                  }} style={{ background: 'none', border: 'none', color: '#ff5353', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>
                    Limpar
                  </button>
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* SEARCH BY NAME / CODE */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#888' }}>Buscar por nome/código</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: Sucata, #123"
                      style={{ padding: '8px', background: '#000', color: '#fff', border: '1px solid #333', borderRadius: '4px', width: '100%', fontSize: '0.85rem' }}
                      value={filterSearchQuery}
                      onChange={e => setFilterSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* FAVORITES TOGGLE */}
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label 
                      htmlFor="filterFavoritesOnly" 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        cursor: 'pointer', 
                        userSelect: 'none', 
                        margin: 0,
                        padding: '10px 14px',
                        background: filterFavoritesOnly ? 'rgba(255, 215, 0, 0.05)' : '#0a0a0a',
                        border: filterFavoritesOnly ? '1px solid #ffd700' : '1px solid #222',
                        borderRadius: '4px',
                        transition: 'all 0.2s ease-in-out',
                        boxShadow: filterFavoritesOnly ? '0 0 10px rgba(255, 215, 0, 0.1)' : 'none'
                      }}
                    >
                      <input
                        type="checkbox"
                        id="filterFavoritesOnly"
                        checked={filterFavoritesOnly}
                        onChange={e => setFilterFavoritesOnly(e.target.checked)}
                        style={{ display: 'none' }}
                      />
                      <div style={{
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '3px',
                        border: filterFavoritesOnly ? '1px solid #ffd700' : '1px solid #555',
                        background: filterFavoritesOnly ? '#ffd700' : 'transparent',
                        color: filterFavoritesOnly ? '#000' : '#555',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s ease-in-out'
                      }}>
                        {filterFavoritesOnly ? '★' : '☆'}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: filterFavoritesOnly ? '#ffd700' : '#aaa', fontWeight: 'bold', transition: 'all 0.2s' }}>
                        Apenas Favoritos
                      </span>
                    </label>
                  </div>
                  
                  {/* BUSINESS TYPE FILTER */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#888' }}>Tipo de Negócio</label>
                    <select
                      className="form-select"
                      style={{ padding: '8px', background: '#000', color: '#fff', border: '1px solid #333' }}
                      value={filterBusinessType}
                      onChange={e => setFilterBusinessType(e.target.value)}
                    >
                      <option value="">Todos</option>
                      <option value="paga">Paga para destinar</option>
                      <option value="recebe">Recebe pelo resíduo</option>
                      <option value="doacao">Doação</option>
                    </select>
                    <span style={{ fontSize: '0.65rem', color: '#ffd700', marginTop: '4px', display: 'block', lineHeight: '1.2' }}>
                      * Anúncios de doação podem virar leilões ascendentes se houver alta disputa.
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#888' }}>Categoria</label>
                    <select className="form-select" style={{ padding: '8px', background: '#000', color: '#fff', border: '1px solid #333' }} value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setFilterResiduo(''); }}>
                      <option value="">Todas</option>
                      {Object.keys(CATALOGO_MATERRA_ELO).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {filterCategory && (
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem', color: '#888' }}>Resíduo específico</label>
                      <select className="form-select" style={{ padding: '8px', background: '#000', color: '#fff', border: '1px solid #333' }} value={filterResiduo} onChange={e => setFilterResiduo(e.target.value)}>
                        <option value="">Todos</option>
                        {(CATALOGO_MATERRA_ELO[filterCategory]?.subcategorias || []).map(res => (
                          <option key={res} value={res}>{res}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#888' }}>Classe</label>
                    <select className="form-select" style={{ padding: '8px', background: '#000', color: '#fff', border: '1px solid #333' }} value={filterClasse} onChange={e => setFilterClasse(e.target.value)}>
                      <option value="Todas">Todas</option>
                      <option value="I">Classe I (Perigoso)</option>
                      <option value="IIA">Classe IIA (Não Inerte)</option>
                      <option value="IIB">Classe IIB (Inerte)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#888' }}>Estado Físico</label>
                    <select className="form-select" style={{ padding: '8px', background: '#000', color: '#fff', border: '1px solid #333' }} value={filterEstadoFisico} onChange={e => setFilterEstadoFisico(e.target.value)}>
                      <option value="">Todos</option>
                      <option value="Sólido">Sólido</option>
                      <option value="Líquido">Líquido</option>
                      <option value="Semissólido">Semissólido</option>
                      <option value="Pastoso">Pastoso</option>
                      <option value="Gasoso">Gasoso</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#888' }}>UF Localização</label>
                    <select className="form-select" style={{ padding: '8px', background: '#000', color: '#fff', border: '1px solid #333' }} value={filterUf} onChange={e => setFilterUf(e.target.value)}>
                      <option value="">Todos</option>
                      {ESTADOS_BRASIL.map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.75rem', color: '#888' }}>Raio de Distância</label>
                    <select
                      className="form-select"
                      style={{ padding: '8px', background: '#000', color: '#fff', border: '1px solid #333' }}
                      value={filterRadius}
                      onChange={e => setFilterRadius(e.target.value)}
                    >
                      <option value="">Qualquer distância</option>
                      <option value="10">Até 10 km</option>
                      <option value="25">Até 25 km</option>
                      <option value="50">Até 50 km</option>
                      <option value="100">Até 100 km</option>
                      <option value="200">Até 200 km</option>
                      <option value="500">Até 500 km</option>
                    </select>
                    {!profile?.cep && (
                      <span style={{ fontSize: '0.65rem', color: '#888', marginTop: '4px', display: 'block', lineHeight: '1.2' }}>
                        * Faça login com CEP cadastrado para usar filtro de raio.
                      </span>
                    )}
                  </div>
                </div>
              </aside>

              {/* VITRINE MAIN GRID */}
              <main>
                {/* Quick Filter Chips */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px', scrollbarWidth: 'none' }}>
                  {[
                    { label: 'Co-produtos Agrícolas', value: 'AGRÍCOLAS VEGETAIS — PALHADAS, CASCAS E COPRODUTOS' },
                    { label: 'Adubos e Fertilizantes', value: 'FERTILIZANTES E CORRETIVOS RECICLADOS' },
                    { label: 'Siderurgia e Fundição', value: 'CO-PRODUTOS DE SIDERURGIA' },
                    { label: 'Sucatas e Metais', value: 'METAIS FERROSOS' },
                    { label: 'Plásticos e Resíduos', value: 'PLÁSTICOS' },
                    { label: 'Papel e Papelão', value: 'PAPEL E PAPELÃO' },
                    { label: 'RCC', value: 'CONSTRUÇÃO CIVIL — RCC' }
                  ].map(chip => {
                    const isActive = filterCategory === chip.value;
                    return (
                      <button
                        key={chip.value}
                        onClick={() => {
                          if (filterCategory === chip.value) {
                            setFilterCategory('');
                          } else {
                            setFilterCategory(chip.value);
                          }
                          setFilterResiduo('');
                        }}
                        style={{
                          whiteSpace: 'nowrap',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          background: isActive ? 'var(--primary-500)' : 'rgba(255, 255, 255, 0.05)',
                          color: isActive ? '#000' : '#ccc',
                          border: isActive ? '1px solid var(--primary-500)' : '1px solid rgba(255, 255, 255, 0.1)',
                          boxShadow: isActive ? '0 0 10px rgba(255, 215, 0, 0.3)' : 'none'
                        }}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>

                {/* MARKET BALANCE ANIMATION BANNER */}
                <div style={{
                  maxHeight: filterCategory ? '350px' : '0px',
                  opacity: filterCategory ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  marginBottom: filterCategory ? '24px' : '0px',
                }}>
                  {filterCategory && (() => {
                    const catListings = listings.filter(item => item.categoria === filterCategory);
                    const oCount = catListings.filter(item => item.tipo_anuncio === 'Oferta' || item.tipo_anuncio === 'Oferta de resíduo').length;
                    const dCount = catListings.filter(item => item.tipo_anuncio === 'Demanda' || item.tipo_anuncio === 'Pedido de compra').length;
                    
                    return (
                      <div style={{
                        background: 'rgba(10, 10, 10, 0.75)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 215, 0, 0.15)',
                        borderRadius: '16px',
                        padding: '20px 24px',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        position: 'relative'
                      }}>
                        {/* Title Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'rgba(255, 215, 0, 0.1)',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              border: '1px solid rgba(255, 215, 0, 0.3)'
                            }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="2" y1="12" x2="22" y2="12"/>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                              </svg>
                            </div>
                            <div>
                              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#fff', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                                Balanço do Mercado
                              </h3>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>
                                Categoria activa: <span style={{ color: 'var(--primary-500)', fontWeight: 600 }}>{filterCategory}</span>
                              </p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '12px',
                            background: 'rgba(0, 229, 255, 0.1)',
                            border: '1px solid rgba(0, 229, 255, 0.3)',
                            color: '#00E5FF',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                          }}>
                            Prospecção 72h Ativa
                          </div>
                        </div>

                        {/* Stats Info */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ofertas</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFD700', fontFamily: 'var(--font-mono)' }}>
                              {oCount} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#888' }}>anúncios ativos</span>
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                            <span style={{ fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Demandas</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#00E5FF', fontFamily: 'var(--font-mono)' }}>
                              {dCount} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#888' }}>anúncios ativos</span>
                            </span>
                          </div>
                        </div>

                        {/* Animated Visual Balance Bar */}
                        <div style={{ position: 'relative', height: '12px', width: '100%', borderRadius: '6px', background: '#222', overflow: 'hidden' }}>
                          {/* Offer Side (Gold Gradient) */}
                          <div style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${marketBalanceRatio}%`,
                            background: 'linear-gradient(90deg, #b8860b 0%, #FFD700 100%)',
                            transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderRadius: '6px 0 0 6px',
                            boxShadow: '0 0 10px rgba(255, 215, 0, 0.3)'
                          }} />
                          {/* Demand Side (Cyan Gradient) */}
                          <div style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: `${100 - marketBalanceRatio}%`,
                            background: 'linear-gradient(90deg, #00E5FF 0%, #008b8b 100%)',
                            transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderRadius: '0 6px 6px 0',
                            boxShadow: '0 0 10px rgba(0, 229, 255, 0.3)'
                          }} />
                          
                          {/* Center Divider Indicator */}
                          <div style={{
                            position: 'absolute',
                            left: `${marketBalanceRatio}%`,
                            top: '-2px',
                            bottom: '-2px',
                            width: '4px',
                            background: '#fff',
                            transform: 'translateX(-50%)',
                            transition: 'left 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderRadius: '2px',
                            boxShadow: '0 0 6px rgba(255,255,255,0.8)',
                            zIndex: 10
                          }} />
                        </div>

                        {/* Footer footnote */}
                        <div style={{
                          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                          paddingTop: '12px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px'
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="16" x2="12" y2="12"/>
                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                          </svg>
                          <span style={{ fontSize: '0.72rem', color: '#999', lineHeight: '1.4' }}>
                            Nota: Mesmo se não houver anúncios ativos nesta categoria hoje, a equipe Materra Elo prospectará e trará interessados qualificados para a sua operação muito rápido.
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ color: '#aaa', fontSize: '0.9rem' }}>
                    {hasActiveFilters ? (
                      <>Filtrados: <strong>{filteredListings.length}</strong> anúncios ativos</>
                    ) : (
                      <>Todos os anúncios</>
                    )}
                  </span>
                  <select
                    className="form-select"
                    style={{ width: '180px', padding: '6px', background: '#121212', color: '#fff', border: '1px solid #333' }}
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                  >
                    <option value="Mais recente">Mais recente</option>
                    <option value="Maior quantidade">Maior quantidade</option>
                    <option value="Menor preço">Menor preço</option>
                  </select>
                </div>

                {loadingListings ? (
                  <p style={{ color: '#aaa', textAlign: 'center', marginTop: '40px' }}>Carregando anúncios...</p>
                ) : filteredListings.length === 0 ? (
                  <div style={{ background: '#121212', padding: '40px', borderRadius: '12px', border: '1px solid #222', textAlign: 'center' }}>
                    <p style={{ color: '#888' }}>Nenhum anúncio ativo com os filtros selecionados.</p>
                  </div>
                ) : (
                  <>
                      {/* ─── LOGIN GATE MODAL ─── */}
                      {showLoginGate && (
                        <div
                          onClick={() => setShowLoginGate(false)}
                          style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
                            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          <div
                            onClick={e => e.stopPropagation()}
                            style={{
                              background: '#0f0f0f', border: '1px solid #2a2a2a',
                              borderTop: '3px solid var(--primary-500)',
                              borderRadius: '16px', padding: '36px 32px',
                              maxWidth: '420px', width: '90%',
                              boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
                            }}
                          >
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                              <span style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.5))' }}>🔒</span>
                            </div>
                            <h2 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 800, textAlign: 'center', marginBottom: '8px' }}>
                              Acesso restrito
                            </h2>
                            <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: '1.6', textAlign: 'center', marginBottom: '24px' }}>
                              Faça login para ver detalhes, fichas e negociar na plataforma.
                            </p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <Link href="/auth/login" style={{
                                flex: 1, padding: '12px', background: 'var(--primary-500)',
                                color: '#000', fontWeight: 800, fontSize: '0.88rem',
                                borderRadius: '8px', textDecoration: 'none', textAlign: 'center', display: 'block'
                              }}>Acessar</Link>
                              <Link href="/auth/cadastro" style={{
                                flex: 1, padding: '12px', background: 'transparent',
                                color: 'var(--primary-500)', fontWeight: 700, fontSize: '0.88rem',
                                border: '1px solid var(--primary-500)', borderRadius: '8px',
                                textDecoration: 'none', textAlign: 'center', display: 'block'
                              }}>Criar conta</Link>
                            </div>
                            <button
                              onClick={() => setShowLoginGate(false)}
                              style={{
                                width: '100%', marginTop: '10px', padding: '8px', background: 'none',
                                border: 'none', color: '#555', fontSize: '0.78rem', cursor: 'pointer',
                                fontFamily: 'inherit'
                              }}
                            >Fechar</button>
                          </div>
                        </div>
                      )}

                      {/* ─── FICHA MATERRA MODAL ─── */}
                      {fichaModal && (
                        <div
                          onClick={() => setFichaModal(null)}
                          style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)',
                            zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                            backdropFilter: 'blur(6px)'
                          }}
                        >
                          <div
                            onClick={e => e.stopPropagation()}
                            style={{
                              width: '100%', maxWidth: '480px', height: '100vh',
                              background: '#0d0d0d', borderLeft: '1px solid #2a2a2a',
                              overflowY: 'auto', display: 'flex', flexDirection: 'column'
                            }}
                          >
                            {/* Ficha header */}
                            <div style={{
                              background: 'linear-gradient(135deg, #111, #1a1a1a)',
                              borderBottom: '3px solid var(--primary-500)',
                              padding: '20px 20px 16px'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <div style={{
                                  display: 'inline-block', background: 'var(--primary-500)', color: '#000',
                                  fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '3px',
                                  textTransform: 'uppercase', letterSpacing: '0.6px'
                                }}>
                                  {fichaModal.tipo === 'controlador' ? 'Controlador' : fichaModal.tipo === 'empresa' ? 'Fornecedor · Empresa' : fichaModal.perfil || 'Fornecedor'}
                                </div>
                                <button onClick={() => setFichaModal(null)} style={{
                                  background: '#222', border: 'none', color: '#fff', width: '28px', height: '28px',
                                  borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', fontFamily: 'inherit'
                                }}>×</button>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '1.1rem', filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.4))' }}>🛡️</span>
                                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>Anunciante anônimo</span>
                              </div>
                              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                                📍 {fichaModal.regiao || 'Região Centro-Oeste'}
                              </div>
                            </div>

                            {/* Perfil chips */}
                            <div style={{
                              padding: '12px 20px', background: 'rgba(255,215,0,0.06)',
                              borderBottom: '1px solid rgba(255,215,0,0.15)',
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {(fichaModal.chips || [{ label: fichaModal.perfil || 'Fornecedor', selo: fichaModal.selo || 'Bronze', score: fichaModal.score || 35 }]).map((chip: any, i: number) => (
                                  <div key={i} style={{
                                    background: '#fff', border: '1px solid var(--primary-500)',
                                    borderRadius: '6px', padding: '6px 10px', fontSize: '0.78rem'
                                  }}>
                                    <div style={{ fontWeight: 700, color: '#111', marginBottom: '3px' }}>{chip.label}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '3px',
                                        padding: '1px 6px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700,
                                        background: chip.selo === 'Ouro' ? '#FFF1B3' : chip.selo === 'Prata' ? '#ECECEC' : '#F7E5D2',
                                        color: chip.selo === 'Ouro' ? '#6A5000' : chip.selo === 'Prata' ? '#444' : '#7A4A20',
                                        border: chip.selo === 'Ouro' ? '1px solid #D4B000' : chip.selo === 'Prata' ? '1px solid #B8B8B8' : '1px solid #C68A4A'
                                      }}>
                                        ⭐ {chip.selo} · {chip.score}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <button
                                onClick={() => setSeloModal(true)}
                                style={{
                                  width: '20px', height: '20px', borderRadius: '50%',
                                  background: '#111', color: 'var(--primary-500)',
                                  border: '1px solid var(--primary-500)', cursor: 'pointer',
                                  fontSize: '0.72rem', fontWeight: 700, fontFamily: 'inherit',
                                  flexShrink: 0
                                }}
                              >?</button>
                            </div>

                            {/* Documentos */}
                            {fichaModal.tipo !== 'controlador' && (fichaModal.docs || []).length > 0 && (
                              <div style={{ padding: '14px 20px', borderBottom: '1px solid #1a1a1a' }}>
                                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>
                                  Tipos de documento em posse
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                  {(fichaModal.docs || ['LO de Geração', 'CTF/APP-IBAMA', 'PGRS']).map((doc: string, i: number) => (
                                    <span key={i} style={{
                                      padding: '3px 10px', background: 'rgba(16,128,48,0.15)',
                                      border: '1px solid rgba(16,128,48,0.4)', borderRadius: '12px',
                                      fontSize: '0.75rem', color: '#4ade80', fontWeight: 600
                                    }}>{doc}</span>
                                  ))}
                                </div>
                                <div style={{ fontSize: '0.68rem', color: '#555', marginTop: '8px', fontStyle: 'italic' }}>
                                  Apenas tipos de documento. Números, validades e arquivos só aparecem no Buscador de Licenças.
                                </div>
                              </div>
                            )}

                            {/* Avaliações */}
                            <div style={{ padding: '14px 20px', borderBottom: '1px solid #1a1a1a' }}>
                              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>
                                Avaliações anônimas recentes
                              </div>
                              {[
                                { stars: 5, text: 'Material conforme descrição, pesagem ok.', date: '12/06/2026' },
                                { stars: 4, text: 'Pequeno atraso na disponibilização, no resto tudo ok.', date: '03/05/2026' }
                              ].map((av, i) => (
                                <div key={i} style={{ padding: '8px 0', borderBottom: i === 0 ? '1px solid #1a1a1a' : 'none', fontSize: '0.8rem', color: '#999' }}>
                                  <span style={{ color: '#ffd700', fontWeight: 700, marginRight: '6px' }}>
                                    {'★'.repeat(av.stars)}{'☆'.repeat(5 - av.stars)}
                                  </span>
                                  "{av.text}"
                                  <span style={{ color: '#555', fontSize: '0.7rem', marginLeft: '6px', fontStyle: 'italic' }}>— anônimo</span>
                                  <span style={{ color: '#444', fontSize: '0.68rem', marginLeft: '6px' }}>{av.date}</span>
                                </div>
                              ))}
                            </div>

                            {/* Disclaimer */}
                            <div style={{
                              padding: '12px 20px', background: '#0a0a0a',
                              borderTop: '1px solid #1a1a1a', marginTop: 'auto',
                              fontSize: '0.72rem', color: '#555', fontStyle: 'italic', textAlign: 'center', lineHeight: '1.6'
                            }}>
                              Selo Materra reflete documentação verificada; não substitui due diligence própria do usuário.<br/>
                              Identificação completa do anunciante só após pagamento da Taxa Lead.
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ─── SELO SCORE MODAL ─── */}
                      {seloModal && (
                        <div
                          onClick={() => setSeloModal(false)}
                          style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
                            zIndex: 1002, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          <div onClick={e => e.stopPropagation()} style={{
                            background: '#0f0f0f', border: '2px solid var(--primary-500)',
                            borderRadius: '14px', maxWidth: '480px', width: '92%',
                            boxShadow: '0 16px 48px rgba(0,0,0,0.8)', overflow: 'hidden'
                          }}>
                            <div style={{
                              background: 'var(--primary-500)', color: '#000',
                              padding: '14px 18px', fontWeight: 800, fontSize: '1rem',
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                              O que selo e score significam?
                              <button onClick={() => setSeloModal(false)} style={{
                                width: '24px', height: '24px', borderRadius: '50%', background: '#000',
                                color: 'var(--primary-500)', border: 'none', fontSize: '0.9rem', cursor: 'pointer',
                                fontFamily: 'inherit', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>×</button>
                            </div>
                            <div style={{ padding: '18px 20px', fontSize: '0.82rem', color: '#ccc' }}>
                              <div style={{ fontWeight: 700, color: '#888', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px', marginBottom: '8px' }}>Selo Materra</div>
                              <p style={{ marginBottom: '10px', color: '#999' }}>Faixa de confiabilidade com base nos documentos verificados e no histórico:</p>
                              {[
                                { label: 'Sem selo', bg: '#1a1a1a', color: '#666', desc: 'Score 0–19. Conta nova ou sem documentos validados.' },
                                { label: 'Bronze', bg: '#3d2010', color: '#cd7f32', desc: 'Score 20–49. Documentação básica em ordem.' },
                                { label: 'Prata', bg: '#1e1e1e', color: '#aaa', desc: 'Score 50–74. Documentação completa e histórico positivo.' },
                                { label: 'Ouro', bg: '#2a2000', color: '#ffd700', desc: 'Score 75–100. Padrão máximo de documentação, histórico e avaliação.' },
                              ].map(s => (
                                <div key={s.label} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '7px' }}>
                                  <span style={{
                                    display: 'inline-block', padding: '2px 8px', borderRadius: '8px',
                                    background: s.bg, color: s.color, fontWeight: 700, fontSize: '0.72rem',
                                    flexShrink: 0, width: '64px', textAlign: 'center', border: `1px solid ${s.color}40`
                                  }}>{s.label}</span>
                                  <span style={{ color: '#888', fontSize: '0.78rem' }}>{s.desc}</span>
                                </div>
                              ))}

                              <div style={{ marginTop: '16px', fontWeight: 700, color: '#888', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px', marginBottom: '8px' }}>Score Materra</div>
                              <div style={{
                                background: '#0a0a0a', border: '1px solid #222',
                                borderLeft: '3px solid var(--primary-500)',
                                padding: '10px 14px', borderRadius: '6px', fontFamily: 'monospace',
                                fontSize: '0.75rem', color: '#ccc', lineHeight: '1.9', marginBottom: '10px'
                              }}>
                                Score = (Documentos × <strong style={{ color: '#ffd700' }}>0,30</strong>)<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;+ (Taxa de Confirmação × <strong style={{ color: '#ffd700' }}>0,40</strong>)<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;+ (Histórico de Operação × <strong style={{ color: '#ffd700' }}>0,20</strong>)<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;+ (Qualificação × <strong style={{ color: '#ffd700' }}>0,10</strong>)
                              </div>
                              <div style={{
                                padding: '10px 14px', background: 'rgba(255,80,80,0.06)',
                                border: '1px solid rgba(255,80,80,0.2)', borderRadius: '6px',
                                fontSize: '0.75rem', color: '#999', fontStyle: 'italic'
                              }}>
                                Selo Materra reflete documentação verificada; <strong style={{ color: '#ccc' }}>não substitui due diligence própria do usuário</strong>. A Materra Elo atua como marketplace de aproximação — não garante qualquer aspecto da operação entre as partes.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ─── CARDS GRID ─── */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '20px' }}>
                        {filteredListings.map((item, idx) => {
                          const isOferta = item.tipo_anuncio === 'Oferta'
                          const isControlador = item.tipo_parte === 'Controlador' || item.cadastros?.tipo_parte === 'Controlador'
                          const isUrgente = item.urgencia_admin
                          const isArrematado = item.status === 'Arrematado'
                          const isEmNegociacao = (item.status === 'Em Negociação' || item.status === 'Em_Negociacao') && !isArrematado
                          const advertiserSeal = item.cadastros?.nivel_selo || 'Prata'
                          const deviation = item.percentual_desvio ? `${item.percentual_desvio}` : null
                          const isExpanded = expandedCard === item.id
                          const negociantesCount = 2 + (idx % 4)

                          // Seal style helper
                          const getSelo = (s: string) => {
                            if (s === 'Ouro') return { bg: 'rgba(255,215,0,0.1)', color: 'var(--primary-500)', border: 'var(--primary-500)' }
                            if (s === 'Prata') return { bg: 'rgba(200,200,200,0.1)', color: '#ccc', border: '#888' }
                            return { bg: 'rgba(198,138,74,0.1)', color: '#e5a86a', border: '#C68A4A' } // Bronze
                          }
                          const seloStyle = getSelo(advertiserSeal)

                          const businessLabel = item.negocio_tipo === 'paga' ? 'Paga pela destinação'
                            : item.negocio_tipo === 'recebe' ? 'Recebe pelo resíduo'
                            : item.negocio_tipo === 'doacao' ? 'Doação'
                            : item.valor_desejado ? 'Recebe pelo resíduo' : 'Paga pela destinação'

                          const distKm = user ? (() => {
                            try { return getDistanceBetweenCeps(profile?.cep || '74000-000', item.cep || '75000-000') } catch { return '?' }
                          })() : '?'

                          const totalCalc = (() => {
                            const v = parseFloat(String(item.valor_desejado || '0').replace(/[^\d.,]/g, '').replace(',', '.'))
                            const q = parseFloat(String(item.quantidade || '1').replace(/[^\d.,]/g, '').replace(',', '.'))
                            if (!v || !q) return null
                            return (v * q).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          })()

                          return (
                            <div
                              key={item.id}
                              style={{
                                background: '#0d0d0d',
                                border: isUrgente ? '2px solid #C01010' : isExpanded ? '2px solid var(--primary-500)' : '1px solid #222',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: isExpanded ? '0 4px 24px rgba(255,215,0,0.15)' : '0 2px 8px rgba(0,0,0,0.5)',
                                color: '#fff',
                                fontSize: '13px',
                                position: 'relative',
                                transition: 'box-shadow 0.2s, border-color 0.2s'
                              }}
                            >
                              {/* CARD HEADER */}
                              <div style={{
                                padding: '10px 14px 8px',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px',
                                borderBottom: '1px solid #1c1c1c'
                              }}>
                                <div>
                                  {/* Badge tipo */}
                                  <span style={{
                                    display: 'inline-block', padding: '3px 9px', fontSize: '10.5px', fontWeight: 700,
                                    letterSpacing: '0.7px', borderRadius: '4px', textTransform: 'uppercase',
                                    background: isOferta ? 'var(--primary-500)' : '#000', color: isOferta ? '#000' : 'var(--primary-500)', border: isOferta ? 'none' : '1px solid var(--primary-500)'
                                  }}>
                                    {isOferta ? 'Oferta' : 'Demanda'}
                                  </span>
                                  {isControlador && (
                                    <div style={{ fontSize: '9px', color: '#888', marginTop: '3px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                      VIA CONTROLADOR
                                    </div>
                                  )}
                                  {isArrematado && (
                                    <div style={{ fontSize: '9px', color: '#108030', marginTop: '3px', letterSpacing: '0.5px', fontWeight: 700 }}>
                                      ✓ NEGÓCIO FECHADO
                                    </div>
                                  )}
                                  {isUrgente && !isArrematado && (
                                    <span style={{
                                      display: 'inline-block', marginLeft: '6px',
                                      padding: '3px 8px', fontSize: '10px', fontWeight: 700,
                                      borderRadius: '4px', textTransform: 'uppercase',
                                      background: '#C01010', color: '#fff',
                                      animation: 'pulse 1.6s infinite'
                                    }}>🚨 URGENTE</span>
                                  )}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                  {/* Selos */}
                                  {isControlador ? (
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '8px', color: '#888' }}>
                                        <span>Controlador</span>
                                        <span style={{
                                          display: 'inline-flex', alignItems: 'center', gap: '3px',
                                          padding: '1px 6px', borderRadius: '10px', fontSize: '9.5px', fontWeight: 700, marginTop: '2px',
                                          background: 'rgba(198,138,74,0.1)', color: '#e5a86a', border: '1px solid #C68A4A'
                                        }}>⭐ Bronze · 35</span>
                                      </div>
                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '8px', color: '#888' }}>
                                        <span>Empresa</span>
                                        <span style={{
                                          display: 'inline-flex', alignItems: 'center', gap: '3px',
                                          padding: '1px 6px', borderRadius: '10px', fontSize: '9.5px', fontWeight: 700, marginTop: '2px',
                                          background: seloStyle.bg, color: seloStyle.color, border: `1px solid ${seloStyle.border}`
                                        }}>⭐ {advertiserSeal} · {advertiserSeal === 'Ouro' ? '78' : advertiserSeal === 'Prata' ? '62' : '45'}</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '10px', color: '#777', lineHeight: '1.1' }}>
                                      <span style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: 600 }}>
                                        {isOferta ? 'Fornecedor' : 'Comprador'}
                                      </span>
                                      <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                        padding: '2px 7px', borderRadius: '10px', fontSize: '10.5px', fontWeight: 700, marginTop: '2px',
                                        background: seloStyle.bg, color: seloStyle.color, border: `1px solid ${seloStyle.border}`
                                      }}>⭐ {advertiserSeal} · {advertiserSeal === 'Ouro' ? '81' : advertiserSeal === 'Prata' ? '62' : '35'}</span>
                                    </div>
                                  )}
                                  {/* Fav */}
                                  <button
                                    onClick={e => { e.stopPropagation(); if (!user) { setShowLoginGate(true); return; } toggleFavorite(item) }}
                                    style={{
                                      width: '28px', height: '28px', borderRadius: '50%', background: '#1c1c1c',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontSize: '14px', border: '1px solid #333', cursor: 'pointer', flexShrink: 0,
                                      color: favorites.some(f => f.id === item.id) ? 'var(--primary-500)' : '#aaa'
                                    }}
                                  >
                                    {favorites.some(f => f.id === item.id) ? '♥' : '♡'}
                                  </button>
                                </div>
                              </div>

                              {/* TITLE + SUBTITLE */}
                              <div style={{ padding: '10px 14px 4px', fontSize: '15px', fontWeight: 700, color: '#fff', lineHeight: '1.25' }}>
                                {item.residuo}
                              </div>
                              <div style={{ padding: '0 14px 8px', fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                {item.categoria} · {item.codigo_ibama || 'N/A'} · {item.classe_residuo || 'Classe IIB'}
                              </div>

                              {/* INFO GRID */}
                              <div style={{
                                padding: '8px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr',
                                gap: '5px 12px', background: '#090909', fontSize: '12px', color: '#ccc'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>⚖️</span>
                                  <strong style={{ color: '#fff' }}>{item.quantidade} {item.unidade}</strong>/{item.frequencia === 'Única' ? 'única' : 'mês'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>📅</span>
                                  <span>{item.frequencia}{item.frequencia !== 'Única' ? ` · ${getPrazoRecorrencia(item) || '12 meses'}` : ''}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>📍</span>
                                  <span>{user ? `${distKm} km de você` : `${item.municipio_origem || item.municipio || 'N/A'}/${item.uf || 'GO'}`}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>🏷️</span>
                                  <span>{businessLabel}</span>
                                </div>
                              </div>

                              {/* PRICE BAR */}
                              {!isArrematado && (
                                <div style={{
                                  padding: '9px 14px', background: isEmNegociacao ? 'rgba(192, 16, 16, 0.12)' : 'rgba(255, 215, 0, 0.05)',
                                  borderTop: `1px solid ${isEmNegociacao ? '#C01010' : 'rgba(255, 215, 0, 0.25)'}`,
                                  borderBottom: `1px solid ${isEmNegociacao ? '#C01010' : 'rgba(255, 215, 0, 0.25)'}`,
                                  fontSize: '13px', fontWeight: 700, color: '#fff',
                                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                  <span>💰 R$ {item.valor_desejado || '–'} / {item.unidade || 't'}</span>
                                  <span style={{ fontSize: '10.5px', fontWeight: 500, color: '#aaa' }}>
                                    {isEmNegociacao ? `Lance atual: R$ ${item.valor_index || item.valor_desejado}` : `Índice Materra: R$ ${item.valor_index || '–'}`}
                                  </span>
                                </div>
                              )}

                              {/* NEGOTIATION STATE */}
                              {isEmNegociacao && !isArrematado && (
                                <div style={{
                                  padding: '9px 14px', background: 'rgba(192, 16, 16, 0.1)', borderTop: '1px solid #C01010',
                                  fontSize: '12px', color: '#ef5350', fontWeight: 700,
                                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                  <span>🔥 {negociantesCount} interessados negociando</span>
                                  <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                                    ⏱ <LeilaoTimer dias={idx % 3 === 0 ? 4 : idx % 3 === 1 ? 9 : 14} />
                                  </span>
                                </div>
                              )}

                              {/* CLOSED STATE */}
                              {isArrematado && (
                                <>
                                  <div style={{
                                    padding: '10px 14px', background: 'rgba(16, 128, 48, 0.1)', borderTop: '1px solid #108030',
                                    fontSize: '12px', color: '#4ade80', fontWeight: 700, textAlign: 'center'
                                  }}>
                                    R$ {item.valor_desejado} fechado em {new Date().toLocaleDateString('pt-BR')}
                                  </div>
                                  {user && (
                                    <div style={{ padding: '8px 14px', fontSize: '11.5px', color: '#888', textAlign: 'center' }}>
                                      ⭐⭐⭐⭐⭐ Avaliação trilateral em aberto
                                    </div>
                                  )}
                                </>
                              )}

                              {/* METRICS (sem negociação) */}
                              {!isEmNegociacao && !isArrematado && (
                                <div style={{
                                  padding: '7px 14px', fontSize: '11.5px', color: '#aaa',
                                  background: '#0d0d0d', borderTop: '1px solid #1a1a1a',
                                  display: 'flex', gap: '12px'
                                }}>
                                  <span>👁 {getDeterministicViews(item.id)} visualizações</span>
                                  <span>🔍 {Math.floor(getDeterministicViews(item.id) * 0.2)} viram detalhes</span>
                                </div>
                              )}

                              {/* FOOTER TOTAL */}
                              {!isArrematado && (
                                <div style={{
                                  padding: '8px 14px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                  background: '#0d0d0d', fontSize: '11px', color: '#888'
                                }}>
                                  <div>
                                    Preço × quantidade{item.frequencia !== 'Única' ? ' × período' : ''}
                                    {totalCalc && <div style={{ color: 'var(--primary-500)', fontSize: '13px', fontWeight: 700 }}>{totalCalc}</div>}
                                  </div>
                                </div>
                              )}

                              {/* ACTION BUTTONS */}
                              <div style={{ padding: '8px 14px 12px', display: 'flex', gap: '8px', background: '#0d0d0d' }}>
                                {isArrematado ? (
                                  user && (
                                    <button
                                      onClick={() => handleListingClick(item)}
                                      style={{
                                        flex: 1, padding: '9px 12px', borderRadius: '6px', fontSize: '12px',
                                        fontWeight: 700, border: '1px solid #333', background: '#1c1c1c',
                                        color: '#ccc', cursor: 'pointer', fontFamily: 'inherit'
                                      }}
                                    >Ver minha Audit Trail</button>
                                  )
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        if (!user) { setShowLoginGate(true); return; }
                                        setExpandedCard(isExpanded ? null : item.id)
                                      }}
                                      style={{
                                        flex: 1, padding: '9px 12px', borderRadius: '6px', fontSize: '12px',
                                        fontWeight: 700, border: '1px solid #333', background: '#1c1c1c',
                                        color: '#ccc', cursor: 'pointer', fontFamily: 'inherit'
                                      }}
                                    >{isExpanded ? 'Minimizar' : 'Ver detalhes'}</button>
                                    <button
                                      onClick={() => { if (!user) { setShowLoginGate(true); return; } handleListingClick(item) }}
                                      style={{
                                        flex: 1, padding: '9px 12px', borderRadius: '6px', fontSize: '12px',
                                        fontWeight: 700,
                                        background: isEmNegociacao ? '#000' : 'var(--primary-500)',
                                        color: isEmNegociacao ? 'var(--primary-500)' : '#000',
                                        border: isEmNegociacao ? '1px solid var(--primary-500)' : 'none',
                                        cursor: 'pointer', fontFamily: 'inherit'
                                      }}
                                    >{isEmNegociacao ? 'Entrar na sala' : 'Negociar'}</button>
                                  </>
                                )}
                              </div>

                              {/* ── EXPANDED VIEW (logado) ── */}
                              {isExpanded && user && (
                                <div style={{
                                  borderTop: '2px solid var(--primary-500)',
                                  background: '#121212',
                                  animation: 'fadeSlideIn 0.2s ease'
                                }}>
                                  <style>{`@keyframes fadeSlideIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }`}</style>

                                  {/* Frete block */}
                                  <div style={{
                                    padding: '10px 14px', background: 'rgba(16, 64, 160, 0.15)',
                                    borderBottom: '1px solid #1040A0', borderTop: '1px solid #1040A0',
                                    fontSize: '12px', color: '#60a5fa', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                  }}>
                                    <span style={{ fontSize: '16px' }}>🚚</span>
                                    <span><b>Frete:</b> {item.frete_responsavel === 'anunciante' ? 'Anunciante arca — sem leilão reverso' : 'Contraparte arca (leilão reverso será aberto após arremate)'}</span>
                                  </div>

                                  {/* Ficha links */}
                                  <div
                                    onClick={() => setFichaModal({
                                      tipo: isControlador ? 'empresa' : 'empresa',
                                      perfil: isOferta ? 'Fornecedor' : 'Comprador',
                                      selo: advertiserSeal, score: advertiserSeal === 'Ouro' ? 81 : advertiserSeal === 'Prata' ? 62 : 35,
                                      regiao: `Região de ${item.municipio_origem || item.municipio || 'Centro-Oeste'}`,
                                      docs: ['LO de Geração', 'CTF/APP-IBAMA', 'PGRS'],
                                      chips: [{ label: isOferta ? 'Fornecedor de resíduo' : 'Comprador / Destinador', selo: advertiserSeal, score: advertiserSeal === 'Ouro' ? 81 : 62 }]
                                    })}
                                    style={{
                                      padding: '10px 14px', background: '#161616',
                                      borderTop: '1px solid #222', borderBottom: '1px solid #222',
                                      fontSize: '12px', fontWeight: 700, color: '#fff', cursor: 'pointer',
                                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}
                                  >
                                    <span>📋 Ver Ficha Materra anônima do anunciante</span>
                                    <span style={{ color: '#888', fontSize: '16px' }}>→</span>
                                  </div>
                                  {isControlador && (
                                    <div
                                      onClick={() => setFichaModal({
                                        tipo: 'controlador', perfil: 'Controlador',
                                        selo: 'Bronze', score: 35,
                                        chips: [{ label: 'Controlador (intermediador)', selo: 'Bronze', score: 35 }]
                                      })}
                                      style={{
                                        padding: '10px 14px', background: '#161616',
                                        borderBottom: '1px solid #222',
                                        fontSize: '12px', fontWeight: 700, color: '#fff', cursor: 'pointer',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                      }}
                                    >
                                      <span>🏭 Ver Ficha anônima da empresa representada (Ouro · 78)</span>
                                      <span style={{ color: '#888', fontSize: '16px' }}>→</span>
                                    </div>
                                  )}

                                  {/* Detalhes da negociação */}
                                  <div style={{ padding: '8px 14px 4px', fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.6px', background: '#121212', borderTop: '1px solid #222' }}>
                                    Detalhes da negociação
                                  </div>
                                  <div style={{ padding: '4px 14px 10px', fontSize: '12px', color: '#ccc', lineHeight: '1.6', background: '#121212' }}>
                                    Leilão <strong>{item.tipo_leilao || (businessLabel.includes('Recebe') ? 'Ascendente' : 'Descendente')}</strong>
                                    {businessLabel.includes('Recebe') ? ' — compradores dão lances acima do preço base. Vence o maior lance.' : ' — destinadores ofertam abaixo do preço base. Vence o menor cobrado.'}<br/>
                                    Duração: <strong>48h após primeiro lance</strong>. Anti-snipe ativo (prorroga 2 min se houver lance nos últimos 2 min).
                                  </div>

                                  {/* Descrição */}
                                  <div style={{ padding: '8px 14px 4px', fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.6px', background: '#121212', borderTop: '1px solid #222' }}>
                                    Descrição do material
                                  </div>
                                  <div style={{ padding: '4px 14px 10px', fontSize: '12px', color: '#aaa', lineHeight: '1.6', background: '#121212', fontStyle: 'italic' }}>
                                    "{item.descricao_material || item.descricao || 'Material gerado em processo industrial. Entre em contato para mais informações sobre acondicionamento, umidade e disponibilidade.'}"
                                  </div>

                                  {/* Requisitos */}
                                  <div style={{ padding: '8px 14px 4px', fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.6px', background: '#121212', borderTop: '1px solid #222' }}>
                                    Requisitos do interessado
                                  </div>
                                  <div style={{ padding: '4px 14px 10px', background: '#121212' }}>
                                    <ul style={{ margin: '0', paddingLeft: '18px', fontSize: '12px', color: '#ccc', lineHeight: '1.7' }}>
                                      <li>Selo mínimo: <strong style={{ color: '#fff' }}>{item.selo_minimo_exigido || 'Bronze'}</strong></li>
                                      <li>Score mínimo: <strong style={{ color: '#fff' }}>{item.score_minimo_exigido || '20'}</strong></li>
                                      <li>Distância máxima: <strong style={{ color: '#fff' }}>{item.distancia_maxima_km || '300'} km</strong></li>
                                    </ul>
                                  </div>

                                  {/* Avaliações */}
                                  <div style={{ padding: '8px 14px 4px', fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.6px', background: '#121212', borderTop: '1px solid #222' }}>
                                    Avaliações anônimas do anunciante
                                  </div>
                                  {[
                                    { stars: 5, text: 'Cumpriu prazo, sem surpresas no material.', date: '12/06/2026' },
                                    { stars: 4, text: 'Tudo certo, pequena divergência de peso na primeira coleta.', date: '03/05/2026' }
                                  ].map((av, i) => (
                                    <div key={i} style={{
                                      padding: '8px 14px', fontSize: '11.5px', color: '#aaa',
                                      borderTop: i === 0 ? '1px solid #222' : '1px dashed #222', background: '#121212'
                                    }}>
                                      <span style={{ color: '#E6C200', fontWeight: 700, marginRight: '6px' }}>
                                        {'★'.repeat(av.stars)}{'☆'.repeat(5 - av.stars)}
                                      </span>
                                      "{av.text}"
                                      <span style={{ color: '#aaa', fontSize: '10.5px', marginLeft: '6px', fontStyle: 'italic' }}>— anônimo</span>
                                      <span style={{ color: '#bbb', fontSize: '10.5px', marginLeft: '6px' }}>{av.date}</span>
                                    </div>
                                  ))}

                                  {deviation && (
                                    <div style={{ padding: '6px 14px', background: 'rgba(255,215,0,0.06)', borderTop: '1px solid rgba(255,215,0,0.2)', fontSize: '11.5px', color: '#ccc' }}>
                                      📊 Desvio do índice Materra: <strong style={{ color: '#fff' }}>{deviation}</strong>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                  </>
                )}
              </main>
            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ background: '#050505', borderTop: '1px solid #111', padding: '40px 20px', textAlign: 'center', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <p style={{ color: '#aaa', fontSize: '0.85rem', margin: 0, lineHeight: '1.6', maxWidth: '800px' }}>
            <strong>Materra Elo Recursos</strong><br />
            CNPJ: 64.354.716/0001-70 | Endereço: Av. C-231, 247 - Qd.500, Lt.11 - Jardim América, Goiânia - GO, 74290-030<br />
            Contato WhatsApp: <a href="https://wa.me/5562999271816" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-500)', textDecoration: 'none', fontWeight: 'bold' }}>+55 (62) 99927-1816</a>
          </p>
          <p style={{ color: '#555', fontSize: '0.78rem', margin: 0 }}>
            &copy; 2026 Materra Elo Recursos - B2B Waste Platform Concierge. Todos os direitos reservados.
          </p>
          <div style={{ marginTop: '4px' }}>
            {!user && (
              <Link href="/admin" style={{ color: '#888', fontSize: '0.8rem', textDecoration: 'underline' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-500)'} onMouseLeave={(e) => e.currentTarget.style.color = '#888'}>
                Painel de Profissionais Materra (Acesso Restrito)
              </Link>
            )}
          </div>
        </div>
      </footer>

      {/* EDIT PROFILE MODAL */}
      {showEditProfileModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px'
        }}>
          <form onSubmit={handleSaveProfileSubmit} style={{
            background: '#121212', border: '1px solid #333', padding: '32px', borderRadius: '16px',
            width: '500px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', borderBottom: '1px solid #222', paddingBottom: '12px' }}>
              Editar Informações Cadastrais
            </h3>
            
            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Nome / Razão Social</label>
              <input
                type="text"
                required
                className="form-input"
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                value={editNomeOuRazao}
                onChange={e => setEditNomeOuRazao(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>CPF / CNPJ</label>
              <input
                type="text"
                required
                className="form-input"
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                value={editCpfOuCnpj}
                onChange={e => setEditCpfOuCnpj(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>Endereço Completo</label>
              <input
                type="text"
                required
                className="form-input"
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                value={editEndereco}
                onChange={e => setEditEndereco(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#fff' }}>Cidade</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                  value={editCidade}
                  onChange={e => setEditCidade(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: '#fff' }}>UF</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  className="form-input"
                  style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                  value={editUf}
                  onChange={e => setEditUf(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#fff' }}>WhatsApp (com DDD)</label>
              <input
                type="text"
                required
                className="form-input"
                style={{ background: '#000', color: '#fff', border: '1px solid #333' }}
                value={editWhatsapp}
                onChange={e => setEditWhatsapp(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--primary-500)', fontWeight: 'bold' }}>Chave PIX para Recebimentos</label>
              <input
                type="text"
                placeholder="E-mail, CPF, Celular ou Chave Aleatória"
                className="form-input"
                style={{ background: '#000', color: '#fff', border: '1px solid #222' }}
                value={editChavePix}
                onChange={e => setEditChavePix(e.target.value)}
              />
              <small style={{ color: '#888', display: 'block', marginTop: '4px', fontSize: '0.75rem' }}>
                Forneça sua chave PIX para facilitar recebimentos em transações intermediadas.
              </small>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button
                type="submit"
                disabled={savingProfile}
                className="btn btn-primary"
                style={{ flex: 1, color: '#000', fontWeight: 'bold' }}
              >
                {savingProfile ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="btn btn-secondary"
                style={{ background: '#1c1c1c', border: '1px solid #333' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DOUBLE HABILITATION MODAL */}
      {showHabilitacaoModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100000, padding: '20px'
        }}>
          <div style={{
            background: '#121212', border: '2px solid #ffd700', borderRadius: '8px',
            width: '100%', maxWidth: '500px', padding: '32px', position: 'relative',
            boxShadow: '0 0 25px rgba(255, 215, 0, 0.2)'
          }}>
            <button
              onClick={() => setShowHabilitacaoModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#aaa', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              &times;
            </button>
            
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffd700', marginBottom: '8px' }}>
              ⚡ Habilitar Especialidade Dupla
            </h3>
            <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.5' }}>
              Ao ativar o perfil duplo, sua conta passará a operar tanto como <strong>Fornecedor (Gerador)</strong> quanto <strong>Comprador (Destinador)</strong> de resíduos.
            </p>

            <div style={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: '4px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <span style={{ color: '#ffd700', fontWeight: 'bold' }}>1.</span>
                <span style={{ color: '#eee', fontSize: '0.85rem' }}>Você poderá publicar ofertas e demandas simultaneamente.</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <span style={{ color: '#ffd700', fontWeight: 'bold' }}>2.</span>
                <span style={{ color: '#eee', fontSize: '0.85rem' }}>Ambas as checklists de documentos de conformidade serão exigidas para o Selo Prata/Ouro.</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ color: '#ffd700', fontWeight: 'bold' }}>3.</span>
                <span style={{ color: '#eee', fontSize: '0.85rem' }}>Sua empresa estará visível tanto para compradores quanto vendedores da plataforma.</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleDoubleHabilitation}
                className="btn btn-primary"
                style={{ flex: 1, color: '#000', fontWeight: 'bold', padding: '12px' }}
              >
                Confirmar Ativação
              </button>
              <button
                onClick={() => setShowHabilitacaoModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1, background: '#1c1c1c', border: '1px solid #333', color: '#fff', padding: '12px' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BLOCKED ACCESS MODAL */}
      {blockModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#121212', border: '2px solid var(--primary-500)', padding: '32px', borderRadius: '16px', maxWidth: '450px', textAlign: 'center' }}>
            <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold', margin: '16px 0 8px' }}>
              {blockModal === 'anuncio' ? 'Visualizar Detalhes e Negociar' : 'Visualizar Ficha Materra'}
            </h3>
            <p style={{ color: '#aaa', fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.5' }}>
              {blockModal === 'anuncio'
                ? 'Para ver as fotos, anexo de licenças do resíduo e iniciar a negociação, você precisa realizar o cadastro gratuito na plataforma.'
                : 'A Ficha Materra completa de homologação de empresas é exclusiva para usuários cadastrados na plataforma.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/auth/cadastro?role=usuario" onClick={() => setBlockModal(null)} className="btn btn-primary" style={{ color: '#000', fontWeight: 'bold' }}>
                Criar Conta Grátis
              </Link>
              <Link href="/auth/cadastro?role=transportadora" onClick={() => setBlockModal(null)} className="btn btn-secondary" style={{ border: '1px solid var(--primary-500)', color: 'var(--primary-500)', background: 'transparent' }}>
                Cadastrar Transportadora Exclusiva
              </Link>
              <Link href="/auth/login" onClick={() => setBlockModal(null)} style={{ color: '#aaa', fontSize: '0.9rem', textDecoration: 'underline', marginTop: '4px' }}>
                Já tenho conta. Fazer Login
              </Link>
              <button onClick={() => setBlockModal(null)} style={{ background: 'none', border: 'none', color: '#ff5353', cursor: 'pointer', marginTop: '10px' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYWALL RESTRICTION MODAL */}
      {paywallModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#121212', border: '2px solid var(--primary-500)', padding: '32px', borderRadius: '16px', maxWidth: '480px', textAlign: 'center' }}>
            <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '12px' }}>Recurso Indisponível no Seu Plano</h3>
            <p style={{ color: '#aaa', fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.5' }}>
              {paywallModal}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => { setPaywallModal(null); setDashboardTab('planos'); }} className="btn btn-primary" style={{ color: '#000', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>
                Ir para Planos & Cupons
              </button>
              <Link href="/planos" onClick={() => setPaywallModal(null)} style={{ color: 'var(--primary-500)', fontSize: '0.9rem', textDecoration: 'underline' }}>
                Ver Detalhes Completos dos Planos
              </Link>
              <button onClick={() => setPaywallModal(null)} style={{ background: 'none', border: 'none', color: '#ff5353', cursor: 'pointer', marginTop: '8px' }}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AD DETAILS MODAL */}
      {selectedListing && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{ background: '#121212', border: '1px solid #333', borderRadius: '16px', width: '100%', maxWidth: '650px', padding: '32px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setSelectedListing(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#aaa', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary-500)', fontWeight: 'bold' }}>
              Cod: {selectedListing.codigo} • {selectedListing.tipo_anuncio}
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginTop: '6px', marginBottom: '16px' }}>
              {selectedListing.residuo}
            </h2>

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
                {(() => {
                  const seal = selectedListing.cadastros?.nivel_selo || 'Bronze'
                  const badgeStyle = getSealBadgeStyle(seal)
                  return (
                    <span style={{
                      borderRadius: '20px',
                      padding: '4px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      ...badgeStyle
                    }}>
                      {selectedListing.cadastros?.selo_verificado || selectedListing.cadastros?.nivel_selo ? `SELO ${seal}` : 'Pendente de Documentação'}
                    </span>
                  )
                })()}
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
                    Anúncio intermediado por Corretor
                  </p>
                  <div style={{ display: 'flex', gap: '12px', background: '#0d0d0d', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ flex: 1, borderRight: '1px solid #222', paddingRight: '8px' }}>
                      <span style={{ fontSize: '0.65rem', color: '#777', display: 'block', textTransform: 'uppercase' }}>Ficha do Corretor</span>
                      {(() => {
                        const seal = selectedListing.cadastros?.nivel_selo || 'Bronze'
                        const color = getSealBadgeStyle(seal).color
                        return (
                          <strong style={{ fontSize: '0.8rem', color: color }}>
                            Selo {seal}
                          </strong>
                        )
                      })()}
                      <span style={{ fontSize: '0.7rem', color: '#aaa', display: 'block' }}>Score: {selectedListing.cadastros?.score_0a100 ?? 85}/100</span>
                    </div>
                    <div style={{ flex: 1, paddingLeft: '8px' }}>
                      <span style={{ fontSize: '0.65rem', color: '#777', display: 'block', textTransform: 'uppercase' }}>Empresa Representada</span>
                      {selectedListing.fichas_empresa_representada ? (
                        <>
                          {(() => {
                            const seal = selectedListing.fichas_empresa_representada.selo_metal || 'Bronze'
                            const color = getSealBadgeStyle(seal).color
                            return (
                              <strong style={{ fontSize: '0.8rem', color: color }}>
                                Selo {seal} (Confidencial)
                              </strong>
                            )
                          })()}
                          <span style={{ fontSize: '0.7rem', color: '#aaa', display: 'block' }}>
                            Score: {selectedListing.fichas_empresa_representada.score_0a100 || 50}/100
                          </span>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#777', fontStyle: 'italic', display: 'block', marginTop: '4px' }}>
                          Empresa representada — informação não fornecida
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', fontSize: '0.85rem' }}>
              <div>
                <strong style={{ color: '#aaa' }}>Quantidade:</strong>
                <p style={{ color: '#fff', margin: '2px 0 10px' }}>
                  {selectedListing.quantidade} {selectedListing.unidade} ({selectedListing.frequencia}{(() => {
                    const prazo = getPrazoRecorrencia(selectedListing)
                    return (selectedListing.frequencia !== 'Única' && prazo) ? ` - ${prazo}` : ''
                  })()})
                </p>
                
                <strong style={{ color: '#aaa' }}>Classe / Estado Físico:</strong>
                <p style={{ color: '#fff', margin: '2px 0 10px' }}>Classe {selectedListing.classe} • {selectedListing.estado_fisico || 'N/A'}</p>
                
                <strong style={{ color: '#aaa' }}>Acondicionamento:</strong>
                <p style={{ color: '#fff', margin: '2px 0 10px' }}>{selectedListing.acondicionamento}</p>

                <strong style={{ color: '#aaa' }}>Validade da Proposta:</strong>
                <p style={{ color: '#fff', margin: '2px 0 10px' }}>{getValidadeProposta(selectedListing)}</p>
              </div>
              <div>
                <strong style={{ color: '#aaa' }}>Localização:</strong>
                {(() => {
                  const isOwner = user?.id === selectedListing.id_cadastro
                  const isReleased = releasedContacts.some((c: any) => c.id_anuncio === selectedListing.id)
                  if (isOwner || isReleased) {
                    return <p style={{ color: '#fff', margin: '2px 0 10px' }}>{selectedListing.municipio} - {selectedListing.uf}</p>
                  }
                  const distance = getDistanceBetweenCeps(profile?.cep || '74000-000', selectedListing.cep || '75000-000')
                  return (
                    <p style={{ color: 'var(--primary-500)', margin: '2px 0 10px', fontWeight: 'bold' }}>
                      Oculto até liberação de lead (~{distance} km de você)
                    </p>
                  )
                })()}

                <strong style={{ color: '#aaa' }}>Cobrança:</strong>
                <p style={{ color: '#fff', margin: '2px 0 10px' }}>{selectedListing.forma_cobranca}</p>

                <strong style={{ color: '#aaa' }}>Leilão:</strong>
                <p style={{ color: '#fff', margin: '2px 0 10px' }}>{selectedListing.tipo_leilao || 'Sem leilão'}</p>
              </div>
            </div>

            {(() => {
              const selectedIndex = filteredListings.findIndex(l => l.id === selectedListing.id);
              const isModalHighlighted = selectedIndex !== -1 && selectedIndex < 3;
              const days = selectedIndex === 0 ? 4 : selectedIndex === 1 ? 9 : selectedIndex === 2 ? 14 : null;
              
              if (!isModalHighlighted && selectedListing.tipo_leilao !== 'Ascendente' && selectedListing.tipo_leilao !== 'Descendente') {
                return null;
              }

              const auctionStatus = getAuctionStatus(selectedListing);
              const validPropostas = (selectedListing.propostas || []).filter((p: any) => p.status !== 'Recusada');
              const hasBids = validPropostas.length > 0;
              
              let currentLeadingBid = selectedListing.valor_desejado;
              if (hasBids) {
                currentLeadingBid = selectedListing.tipo_leilao === 'Ascendente'
                  ? Math.max(...validPropostas.map((p: any) => p.valor_proposto))
                  : Math.min(...validPropostas.map((p: any) => p.valor_proposto));
              }

              return (
                <div style={{
                  background: '#161616',
                  border: '2px solid var(--primary-500)',
                  boxShadow: '0 0 15px rgba(255, 215, 0, 0.15)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px',
                  color: '#fff'
                }}>
                  <h4 style={{ color: 'var(--primary-500)', fontSize: '1rem', fontWeight: 'bold', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
                    ⚡ Informações do Leilão
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#888', display: 'block' }}>Status:</span>
                      {days !== null ? (
                        <div style={{ marginTop: '2px' }}>
                          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>Leilão Iniciado — </span>
                          <LeilaoTimer dias={days} />
                        </div>
                      ) : (
                        <strong style={{ fontSize: '1rem', color: '#fff' }}>{auctionStatus.statusText}</strong>
                      )}
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#888', display: 'block' }}>Visualizações:</span>
                      <strong style={{ fontSize: '1rem', color: '#fff' }}>{getDeterministicViews(selectedListing.id)} visualizações</strong>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', borderTop: '1px solid #333', paddingTop: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#888', display: 'block' }}>Valor de Referência:</span>
                      <strong style={{ fontSize: '1.1rem', color: '#fff' }}>R$ {selectedListing.valor_desejado.toLocaleString('pt-BR')}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#888', display: 'block' }}>
                        {selectedListing.tipo_leilao === 'Ascendente' ? 'Maior Lance Atual:' : 'Menor Lance Atual:'}
                      </span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--primary-500)' }}>
                        {hasBids ? `R$ ${currentLeadingBid.toLocaleString('pt-BR')}` : 'Nenhum lance ainda'}
                      </strong>
                    </div>
                  </div>

                  {selectedListing.urgencia_admin && (
                    <div style={{
                      background: '#b71c1c',
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      marginBottom: '16px',
                      border: '1px solid #ff5252',
                      textTransform: 'uppercase',
                      textAlign: 'center'
                    }}>
                      URGÊNCIA: {selectedListing.urgencia_admin}
                    </div>
                  )}

                  {!auctionStatus.isEnded ? (
                    <div style={{ borderTop: '1px solid #333', paddingTop: '16px', marginTop: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#ffb300', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                        LEILÃO ATIVO NO WHATSAPP
                      </span>
                      <p style={{ fontSize: '0.8rem', color: '#aaa', margin: 0 }}>
                        As propostas e lances deste lote são intermediados diretamente pelo Concierge Materra Elo no WhatsApp. Clique no botão de interesse abaixo para negociar!
                      </p>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#ef5350', fontWeight: 'bold', fontSize: '0.9rem', borderTop: '1px solid #333', paddingTop: '12px' }}>
                      Este leilão está encerrado.
                    </div>
                  )}
                </div>
              )
            })()}

            {selectedListing.caracteristicas && (
              <div style={{ marginBottom: '24px' }}>
                <strong style={{ color: '#aaa', fontSize: '0.85rem' }}>Características Adicionais:</strong>
                <p style={{ color: '#ccc', fontSize: '0.9rem', margin: '4px 0 0', lineHeight: '1.5' }}>{selectedListing.caracteristicas}</p>
              </div>
            )}

            {/* Media previews if available */}
            {(selectedListing.foto_url || selectedListing.video_url || selectedListing.licenca_anexo_url) && (
              <div style={{ background: '#1c1c1c', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #333' }}>
                <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginBottom: '10px' }}>Anexos e Mídias:</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  {selectedListing.foto_url && (
                    <a href={selectedListing.foto_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-500)', textDecoration: 'underline' }}>
                      Visualizar Foto do Resíduo
                    </a>
                  )}
                  {selectedListing.video_url && (
                    <a href={selectedListing.video_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-500)', textDecoration: 'underline' }}>
                      Visualizar Vídeo Demonstrativo
                    </a>
                  )}
                  {selectedListing.licenca_anexo_url && (
                    <a href={selectedListing.licenca_anexo_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-500)', textDecoration: 'underline' }}>
                      Baixar Licença / Laudo do Resíduo
                    </a>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => { handleInterest(selectedListing); setSelectedListing(null); }}
                className="btn btn-primary"
                style={{ flex: 2, padding: '12px', fontSize: '0.95rem', color: '#000', fontWeight: 'bold' }}
              >
                Demonstrar Interesse (Falar no WhatsApp)
              </button>
              <button
                onClick={() => setSelectedListing(null)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '12px', fontSize: '0.95rem', background: '#1c1c1c', border: '1px solid #333' }}
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FICHA MATERRA LOOKUP DETAILS MODAL */}
      {selectedFicha && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{ background: '#121212', border: '1px solid #333', borderRadius: '16px', width: '100%', maxWidth: '600px', padding: '32px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setSelectedFicha(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#aaa', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary-500)', fontWeight: 'bold' }}>
              Ficha Materra Oficial
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginTop: '6px', marginBottom: '8px' }}>
              {selectedFicha.nome_ou_razao}
            </h2>
            <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '20px' }}>
              {selectedFicha.tipo_parte} ({selectedFicha.subtipo || 'Membro'}) • {selectedFicha.cidade} - {selectedFicha.uf}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#1c1c1c', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid #333' }}>
                <span style={{ fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase' }}>Reputação Ficha Materra</span>
                <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-500)', fontWeight: 900, margin: '6px 0' }}>
                  {getReputationDisplay(selectedFicha)}
                </h3>
              </div>
              <div style={{ background: '#1c1c1c', padding: '16px', borderRadius: '8px', textAlign: 'center', border: '1px solid #333' }}>
                <span style={{ fontSize: '0.75rem', color: '#aaa', textTransform: 'uppercase' }}>Selo Habilitação</span>
                <h3 style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 900, margin: '6px 0' }}>
                  Selo {selectedFicha.nivel_selo || 'Bronze'}
                </h3>
              </div>
            </div>

            {/* Document checklist verified status */}
            <div style={{ background: '#121212', border: '1px solid #333', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
              <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginBottom: '10px' }}>Situação de Documentos:</strong>
              <div style={{ marginBottom: '12px' }}>
                <span style={{
                  padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                  background: selectedFicha.status_documentos === 'Verificado' ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedFicha.status_documentos === 'Verificado' ? 'var(--primary-500)' : '#aaa'
                }}>
                  Documentos: {selectedFicha.status_documentos || 'Pendente'}
                </span>
              </div>

              <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginBottom: '10px', marginTop: '16px' }}>Documentação Ambiental Homologada:</strong>
              {(() => {
                let licenca = null;

                if (selectedFicha.tipo_parte === 'Transportadora' || selectedFicha.transportadora_propria) {
                  if (selectedFicha.licenca_ambiental_url) {
                    licenca = {
                      nome: 'Licença Ambiental de Transporte',
                      num: selectedFicha.licenca_ambiental_num,
                      validade: selectedFicha.licenca_ambiental_validade,
                      url: selectedFicha.licenca_ambiental_url
                    };
                  }
                }

                if (!licenca && selectedFicha.documentos_recebidos) {
                  try {
                    const docs = JSON.parse(selectedFicha.documentos_recebidos);
                    const key = Object.keys(docs).find(k => k === 'licenca_ambiental_residuo' || k === 'licenca_recebimento' || k === 'licenca_ambiental');
                    if (key) {
                      licenca = {
                        nome: key === 'licenca_recebimento' ? 'Licença Ambiental de Recebimento' : 'Licença Ambiental de Resíduos',
                        num: docs[key].num,
                        validade: docs[key].validade,
                        url: docs[key].url
                      };
                    }
                  } catch (e) {
                    console.error('Erro ao ler documentos da ficha:', e);
                  }
                }

                if (licenca) {
                  return (
                    <div style={{ background: '#1c1c1c', border: '1px solid #333', padding: '12px', borderRadius: '6px', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--primary-500)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{licenca.nome}</span>
                      {licenca.num && <span style={{ color: '#aaa', display: 'block' }}>Nº da Licença: {licenca.num}</span>}
                      {licenca.validade && <span style={{ color: '#aaa', display: 'block' }}>Validade: {new Date(licenca.validade).toLocaleDateString('pt-BR')}</span>}
                      <a href={licenca.url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '10px', padding: '6px 12px', fontSize: '0.8rem', color: '#000', fontWeight: 'bold', textDecoration: 'none' }}>
                        Visualizar Licença Ambiental
                      </a>
                    </div>
                  );
                } else {
                  return (
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>
                      Nenhuma Licença Ambiental homologada para visualização pública no momento.
                    </span>
                  );
                }
              })()}
            </div>

            <button
              onClick={() => setSelectedFicha(null)}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem', background: '#1c1c1c', border: '1px solid #333' }}
            >
              Fechar Visualização
            </button>
          </div>
        </div>
      )}

      {/* GRANDE EMPRESA BLOCKED PLAN MODAL */}
      {selectedGrandeEmpresa && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '20px'
        }}>
          <div style={{
            background: '#121212',
            border: '2px solid var(--primary-500)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '450px',
            padding: '32px',
            textAlign: 'center',
            position: 'relative',
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.15)'
          }}>
            <button onClick={() => setSelectedGrandeEmpresa(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#aaa', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
            
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
              Ficha Bloqueada para {selectedGrandeEmpresa.nome}
            </h3>
            
            <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '24px' }}>
              As fichas de grandes geradores e indústrias nacionais exigem homologação avançada de compliance. 
              Para visualizar o selo real, histórico de auditoria reputacional e a licença ambiental verificada ({selectedGrandeEmpresa.licenca}), ative um plano pago.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link
                href="/planos"
                onClick={() => setSelectedGrandeEmpresa(null)}
                className="btn btn-primary"
                style={{
                  display: 'block',
                  background: 'var(--primary-500)',
                  color: '#000',
                  fontWeight: 'bold',
                  padding: '12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  textAlign: 'center'
                }}
              >
                Conhecer Planos Materra
              </Link>
              <button
                onClick={() => setSelectedGrandeEmpresa(null)}
                className="btn btn-secondary"
                style={{
                  background: '#1c1c1c',
                  border: '1px solid #333',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MENU DRAWER SIDEBAR */}
      {menuDrawerOpen && (
        <>
          {/* Backdrop overlay */}
          <div 
            onClick={() => setMenuDrawerOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              zIndex: 99998,
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)'
            }}
          />
          {/* Drawer Panel */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: '320px',
            background: '#0a0a0a',
            borderRight: '2px solid #ffd700',
            boxShadow: '0 0 30px rgba(255,215,0,0.2)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Inter, sans-serif'
          }}>
            <div style={{
              padding: '24px 20px',
              borderBottom: '1px solid rgba(255,215,0,0.15)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(255,215,0,0.02)'
            }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>
                Materra <span style={{ color: 'var(--primary-500)' }}>Menu</span>
              </span>
              <button 
                onClick={() => setMenuDrawerOpen(false)}
                style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer', outline: 'none' }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '16px 20px', fontSize: '0.72rem', color: '#ffd700', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Painel do Usuário
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '0 8px' }}>
              {[
                { key: 'planos', label: '💳 Planos e Pagamentos' },
                { key: 'ajuda', label: '❓ Ajuda / FAQ' },
                { key: 'dados', label: '👤 Meus Dados Cadastrais' },
                { key: 'ficha', label: '📋 Minha Ficha Materra' },
                { key: 'documentos', label: '📤 Upload de Documentos' }
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => {
                    if (item.key === 'planos') {
                      router.push('/planos');
                      setMenuDrawerOpen(false);
                      return;
                    }
                    if (item.key === 'ajuda') {
                      router.push('/ajuda');
                      setMenuDrawerOpen(false);
                      return;
                    }
                    if (!user && ['dados', 'ficha', 'documentos'].includes(item.key)) {
                      alert('Atenção: Por favor, faça login ou cadastre-se para acessar esta funcionalidade.');
                      setMenuDrawerOpen(false);
                      return;
                    }
                    setActiveMenuModal(item.key as any);
                    setMenuDrawerOpen(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '14px 16px',
                    color: '#ccc',
                    fontSize: '0.88rem',
                    fontWeight: 'bold',
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    transition: 'all 0.15s',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,215,0,0.08)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.color = '#ccc';
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid #1a1a1a', fontSize: '0.75rem', color: '#666' }}>
              <div>Logado como:</div>
              <strong style={{ color: '#aaa', display: 'block', wordBreak: 'break-all' }}>{profile?.nome_ou_razao || user?.email}</strong>
            </div>
          </div>
        </>
      )}

      {/* MEUS DADOS CADASTRAIS MODAL */}
      {activeMenuModal === 'dados' && profile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100000, padding: '20px'
        }}>
          <div style={{
            background: '#121212', border: '2px solid #ffd700', borderRadius: '8px',
            width: '100%', maxWidth: '750px', padding: '32px', position: 'relative',
            boxShadow: '0 0 25px rgba(255, 215, 0, 0.2)', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <button
              onClick={() => setActiveMenuModal(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#aaa', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              &times;
            </button>
            
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffd700', marginBottom: '4px' }}>
              👤 Meus Dados Cadastrais
            </h3>
            <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '24px' }}>
              Consulte todas as informações do seu cadastro. Para atualizações, utilize o botão de edição abaixo.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left', marginBottom: '24px' }}>
              
              {/* Seção 1: Identificação */}
              <div>
                <div style={{ fontSize: '0.82rem', color: '#ffd700', fontWeight: 'bold', borderBottom: '1px solid rgba(255, 215, 0, 0.15)', paddingBottom: '4px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  👤 Identificação e Perfil
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Nome / Razão Social</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px' }}>{profile.nome_ou_razao || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>CPF / CNPJ</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px' }}>{profile.cpf_ou_cnpj || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Tipo de Perfil</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px' }}>{profile.tipo_parte || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Subtipo de Conta</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px' }}>{profile.subtipo || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Data de Cadastro</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px' }}>
                      {profile.data_cadastro ? new Date(profile.data_cadastro).toLocaleDateString('pt-BR') : 'Não informado'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Nome do Operador</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px' }}>{profile.operador_nome || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>CPF do Operador</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px' }}>{profile.operador_cpf || 'Não informado'}</strong>
                  </div>
                </div>
              </div>

              {/* Seção 2: Localização */}
              <div>
                <div style={{ fontSize: '0.82rem', color: '#ffd700', fontWeight: 'bold', borderBottom: '1px solid rgba(255, 215, 0, 0.15)', paddingBottom: '4px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📍 Endereço e Localização
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Endereço Formatado</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px' }}>{profile.endereco || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Logradouro</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px' }}>{profile.logradouro || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Número</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px' }}>{profile.numero || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Bairro</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px' }}>{profile.bairro || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>CEP</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px' }}>{profile.cep || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Cidade</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px' }}>{profile.cidade || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>UF</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px' }}>{profile.uf || 'Não informado'}</strong>
                  </div>
                </div>
              </div>

              {/* Seção 3: Contatos */}
              <div>
                <div style={{ fontSize: '0.82rem', color: '#ffd700', fontWeight: 'bold', borderBottom: '1px solid rgba(255, 215, 0, 0.15)', paddingBottom: '4px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📞 Canais de Contato
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>WhatsApp (Principal)</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px' }}>{profile.whatsapp || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Telefone Comercial</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px' }}>{profile.telefone || 'Não informado'}</strong>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>E-mail cadastrado</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px' }}>{profile.email || 'Não informado'}</strong>
                  </div>
                </div>
              </div>

              {/* Seção 4: Fiscal/Logística */}
              <div>
                <div style={{ fontSize: '0.82rem', color: '#ffd700', fontWeight: 'bold', borderBottom: '1px solid rgba(255, 215, 0, 0.15)', paddingBottom: '4px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🚚 Fiscal & Logística
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Registro ANTT (RNTRC)</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px' }}>{profile.rntrc_num || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Chave NF-e Cadastrada</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px', fontFamily: 'monospace' }}>{profile.chave_nfe_44_digitos || 'Não informado'}</strong>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Estados de Atuação</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px' }}>{profile.area_operacao || profile.area_atuacao || 'Não informado'}</strong>
                  </div>
                </div>
              </div>

              {/* Seção 5: PIX */}
              <div>
                <div style={{ fontSize: '0.82rem', color: '#ffd700', fontWeight: 'bold', borderBottom: '1px solid rgba(255, 215, 0, 0.15)', paddingBottom: '4px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  💳 Chave PIX e Repasses Financeiros
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Chave PIX</span>
                    <strong style={{ color: 'var(--primary-500)', fontSize: '0.85rem', display: 'block', marginTop: '2px', fontWeight: 'bold' }}>{profile.chave_pix || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Titularidade</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px' }}>{profile.titularidade_pix || 'Não informado'}</strong>
                  </div>
                  {(profile.pix_titular_nome || profile.pix_titular_cpf || profile.pix_titular_email) && (
                    <>
                      <div>
                        <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Nome do Titular</span>
                        <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px' }}>{profile.pix_titular_nome || 'Não informado'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>CPF/CNPJ do Titular</span>
                        <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px' }}>{profile.pix_titular_cpf || 'Não informado'}</strong>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>E-mail Notificações PIX</span>
                        <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px' }}>{profile.pix_titular_email || 'Não informado'}</strong>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Seção 6: Compliance */}
              <div>
                <div style={{ fontSize: '0.82rem', color: '#ffd700', fontWeight: 'bold', borderBottom: '1px solid rgba(255, 215, 0, 0.15)', paddingBottom: '4px', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🎖️ Compliance & Assinatura
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Selo de Conformidade</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', marginTop: '2px' }}>🏅 {profile.nivel_selo || 'Bronze'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Materra Score</span>
                    <strong style={{ color: '#00ff66', fontSize: '0.85rem', display: 'block', marginTop: '2px', fontWeight: 'bold' }}>📈 {profile.score_0a100 || '50'} / 100</strong>
                  </div>
                  <div>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Plano Ativo</span>
                    <strong style={{ color: '#ffd700', fontSize: '0.85rem', display: 'block', marginTop: '2px', fontWeight: 'bold' }}>💎 {profile.plano || 'Free'}</strong>
                  </div>
                  <div style={{ gridColumn: 'span 3' }}>
                    <span style={{ color: '#666', fontSize: '0.7rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Observações / Notas Onboarding</span>
                    <p style={{ color: '#aaa', fontSize: '0.78rem', margin: '4px 0 0 0', lineHeight: '1.4' }}>{profile.observacoes || 'Sem notas adicionais.'}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* DOUBLE SPECIALTY BANNER INSIDE DADOS MODAL */}
            {(profile.tipo_parte === 'Fornecedor' || profile.tipo_parte === 'Comprador') && (
              <div style={{
                background: 'rgba(255, 215, 0, 0.05)',
                border: '1px solid rgba(255, 215, 0, 0.25)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'left'
              }}>
                <h4 style={{ color: '#ffd700', fontSize: '0.9rem', fontWeight: 'bold', margin: '0 0 6px 0' }}>
                  ⚡ Ativar Especialidade Dupla
                </h4>
                <p style={{ color: '#ccc', fontSize: '0.78rem', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                  Você está cadastrado como <strong>{profile.tipo_parte}</strong>. Habilite a função de <strong>Comprar e Vender simultaneamente</strong>.
                </p>
                <button
                  onClick={() => { setShowHabilitacaoModal(true); setDoubleHabilitationStep(1); }}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '8px', fontSize: '0.8rem', color: '#000', fontWeight: 'bold' }}
                >
                  Ativar Perfil Duplo
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { router.push('/dados-cadastrais'); setActiveMenuModal(null); }}
                className="btn btn-primary"
                style={{ flex: 1, color: '#000', fontWeight: 'bold', padding: '12px' }}
              >
                Editar Meus Dados
              </button>
              <button
                onClick={() => setActiveMenuModal(null)}
                className="btn btn-secondary"
                style={{ flex: 1, background: '#1c1c1c', border: '1px solid #333', color: '#fff', padding: '12px' }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}



      {/* MINHA FICHA MATERRA MODAL */}
      {activeMenuModal === 'ficha' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100000, padding: '20px'
        }}>
          <div style={{ background: '#121212', border: '2px solid #ffd700', borderRadius: '8px', width: '100%', maxWidth: '600px', padding: '32px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 0 25px rgba(255, 215, 0, 0.2)' }}>
            <button onClick={() => setActiveMenuModal(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#aaa', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffd700', marginBottom: '4px' }}>📋 Minha Ficha Materra</h3>
            <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '24px' }}>Reputação, selos de conformidade e avaliações.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '4px', padding: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#888', textTransform: 'uppercase', display: 'block' }}>Score de Reputação</span>
                <strong style={{ fontSize: '2rem', color: 'var(--primary-500)', display: 'block', margin: '6px 0' }}>{getReputationDisplay(profile)}</strong>
                <span style={{ fontSize: '0.65rem', color: '#555' }}>Calculado com base em transações</span>
              </div>
              <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '4px', padding: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#888', textTransform: 'uppercase', display: 'block' }}>Selo de Habilitação</span>
                <strong style={{ fontSize: '2rem', color: '#fff', display: 'block', margin: '6px 0' }}>Selo {profile?.nivel_selo || 'Bronze'}</strong>
                <span style={{ fontSize: '0.65rem', color: '#555' }}>Nível de conformidade ativa</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '4px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: '#aaa', textAlign: 'center' }}>Anúncios Ativos</span>
                <strong style={{ color: 'var(--primary-500)', fontSize: '1.2rem' }}>{myListings.filter(l => l.status === 'Anunciado').length}</strong>
              </div>
              <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '4px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: '#aaa', textAlign: 'center' }}>Em Negociação</span>
                <strong style={{ color: 'var(--primary-500)', fontSize: '1.2rem' }}>{inNegotiationCount}</strong>
              </div>
              <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '4px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: '#aaa', textAlign: 'center' }}>Negócios Fechados</span>
                <strong style={{ color: 'var(--primary-500)', fontSize: '1.2rem' }}>{releasedContacts.length}</strong>
              </div>
            </div>

            <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block', marginBottom: '12px' }}>Avaliações de Terceiros (Anônimo)</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { stars: 5, comment: 'Carregamento extremamente rápido e documentação 100% em dia.', date: '15/06/2026' },
                { stars: 4, comment: 'Transação tranquila, comunicação ótima via assessoria.', date: '28/05/2026' }
              ].map((av, idx) => (
                <div key={idx} style={{ background: '#0a0a0a', border: '1px solid #222', padding: '12px', borderRadius: '4px', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#ffd700' }}>{'★'.repeat(av.stars)}{'☆'.repeat(5-av.stars)}</span>
                    <span style={{ color: '#555', fontSize: '0.72rem' }}>{av.date}</span>
                  </div>
                  <p style={{ color: '#ccc', margin: 0 }}>"{av.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD DE DOCUMENTOS MODAL */}
      {activeMenuModal === 'documentos' && (() => {
        const isFornecedor = profile?.tipo_parte === 'Fornecedor' || profile?.tipo_parte === 'Fornecedor / Comprador' || profile?.tipo_parte === 'Fornecedor e Comprador'
        const isComprador = profile?.tipo_parte === 'Comprador' || profile?.tipo_parte === 'Fornecedor / Comprador' || profile?.tipo_parte === 'Fornecedor e Comprador'
        const isCarrier = profile?.tipo_parte === 'Transportadora'
        const isControlador = profile?.subtipo === 'Corretor' || profile?.subtipo === 'Corretor/Controlador'
        const isDuplaAptidao = profile?.tipo_parte === 'Fornecedor / Comprador' || profile?.tipo_parte === 'Fornecedor e Comprador'

        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100000, padding: '20px'
          }}>
            <div style={{ background: '#121212', border: '2px solid #ffd700', borderRadius: '8px', width: '100%', maxWidth: '650px', padding: '32px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 0 25px rgba(255, 215, 0, 0.2)' }}>
              <button onClick={() => setActiveMenuModal(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#aaa', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
              
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffd700', marginBottom: '4px' }}>📤 Central de Upload de Documentos</h3>
              <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '24px' }}>Faça o upload da documentação de compliance exigida pelo regulamento Materra.</p>

              {selectedDocType && (
                <form onSubmit={handleDocFormSubmit} style={{ background: '#0a0a0a', border: '1.5px solid #ffd700', padding: '20px', borderRadius: '6px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <strong style={{ color: '#ffd700', fontSize: '0.9rem', display: 'block' }}>
                    📤 Enviar: {getDocNameFriendly(selectedDocType)}
                  </strong>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', color: '#aaa', fontSize: '0.72rem', marginBottom: '4px', fontWeight: 'bold' }}>Número do Documento / Registro</label>
                      <input type="text" value={docFormNumber} onChange={e => setDocFormNumber(e.target.value)} style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }} placeholder="Ex: LO nº 123/2026" />
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', color: '#aaa', fontSize: '0.72rem', marginBottom: '4px', fontWeight: 'bold' }}>Data de Validade</label>
                      <input type="date" value={docFormValidity} onChange={e => setDocFormValidity(e.target.value)} style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }} />
                    </div>
                  </div>

                  {/* Form fields for custom document metadata */}
                  {selectedDocType === 'licenca_ambiental_operacao_forn' && (
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', color: '#aaa', fontSize: '0.72rem', marginBottom: '4px', fontWeight: 'bold' }}>Órgão Ambiental Emissor</label>
                      <input type="text" value={docFormOrgao} onChange={e => setDocFormOrgao(e.target.value)} style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }} placeholder="Ex: CETESB, FEAM, INEA" />
                    </div>
                  )}

                  {selectedDocType === 'licenca_ambiental_operacao_comp' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', color: '#aaa', fontSize: '0.72rem', marginBottom: '4px', fontWeight: 'bold' }}>Órgão Emissor</label>
                        <input type="text" value={docFormOrgao} onChange={e => setDocFormOrgao(e.target.value)} style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }} placeholder="Ex: CETESB, FEPAM" />
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', color: '#aaa', fontSize: '0.72rem', marginBottom: '4px', fontWeight: 'bold' }}>Tipo de Atividade Autorizada</label>
                        <input type="text" value={docFormTipoAtividade} onChange={e => setDocFormTipoAtividade(e.target.value)} style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }} placeholder="Ex: Coprocessamento, Triagem" />
                      </div>
                    </div>
                  )}

                  {selectedDocType === 'cadri_aaf' && (
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', color: '#aaa', fontSize: '0.72rem', marginBottom: '4px', fontWeight: 'bold' }}>Órgão Emissor</label>
                      <input type="text" value={docFormOrgao} onChange={e => setDocFormOrgao(e.target.value)} style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }} placeholder="Ex: CETESB, FATMA" />
                    </div>
                  )}

                  {selectedDocType === 'capacidade_instalada' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', color: '#aaa', fontSize: '0.72rem', marginBottom: '4px', fontWeight: 'bold' }}>Volume Mensal Autorizado (t/m³)</label>
                        <input type="text" value={docFormVolumeMensal} onChange={e => setDocFormVolumeMensal(e.target.value)} style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }} placeholder="Ex: 500 t/m³" />
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', color: '#aaa', fontSize: '0.72rem', marginBottom: '4px', fontWeight: 'bold' }}>Tecnologia Empregada</label>
                        <input type="text" value={docFormTecnologia} onChange={e => setDocFormTecnologia(e.target.value)} style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }} placeholder="Ex: Triagem Mecânica" />
                      </div>
                    </div>
                  )}

                  {(selectedDocType === 'iso_14001_forn' || selectedDocType === 'iso_14001_comp') && (
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', color: '#aaa', fontSize: '0.72rem', marginBottom: '4px', fontWeight: 'bold' }}>Organismo Certificador</label>
                      <input type="text" value={docFormOrgaoCertificador} onChange={e => setDocFormOrgaoCertificador(e.target.value)} style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }} placeholder="Ex: SGS, Bureau Veritas" />
                    </div>
                  )}

                  {(selectedDocType === 'apolice_ambiental_forn' || selectedDocType === 'apolice_ambiental_comp') && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', color: '#aaa', fontSize: '0.72rem', marginBottom: '4px', fontWeight: 'bold' }}>Seguradora</label>
                        <input type="text" value={docFormSeguradora} onChange={e => setDocFormSeguradora(e.target.value)} style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }} placeholder="Ex: Allianz, Porto" />
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', color: '#aaa', fontSize: '0.72rem', marginBottom: '4px', fontWeight: 'bold' }}>Valor de Cobertura (R$)</label>
                        <input type="text" value={docFormValorCobertura} onChange={e => setDocFormValorCobertura(e.target.value)} style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }} placeholder="Ex: R$ 500.000,00" />
                      </div>
                    </div>
                  )}

                  {selectedDocType === 'crlv_veiculos' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', color: '#aaa', fontSize: '0.72rem', marginBottom: '4px', fontWeight: 'bold' }}>Placa do Veículo</label>
                        <input type="text" value={docFormPlaca} onChange={e => setDocFormPlaca(e.target.value)} style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }} placeholder="Ex: ABC-1234" />
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'block', color: '#aaa', fontSize: '0.72rem', marginBottom: '4px', fontWeight: 'bold' }}>RENAVAM</label>
                        <input type="text" value={docFormRenavam} onChange={e => setDocFormRenavam(e.target.value)} style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }} placeholder="Ex: 123456789" />
                      </div>
                    </div>
                  )}

                  {selectedDocType === 'mopp' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0' }}>
                      <input type="checkbox" checked={docFormMoppChecked} onChange={e => setDocFormMoppChecked(e.target.checked)} id="modal-mopp-check" />
                      <label htmlFor="modal-mopp-check" style={{ color: '#fff', fontSize: '0.78rem', cursor: 'pointer' }}>Possui certificação MOPP averbada na CNH?</label>
                    </div>
                  )}

                  {selectedDocType === 'inventario_anual_rapp' && (
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', color: '#aaa', fontSize: '0.72rem', marginBottom: '4px', fontWeight: 'bold' }}>Ano de Referência</label>
                      <input type="number" min="2000" max="2100" value={docFormAnoReferencia} onChange={e => setDocFormAnoReferencia(e.target.value)} style={{ width: '100%', padding: '8px', background: '#111', border: '1px solid #333', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }} placeholder="Ex: 2025" />
                    </div>
                  )}

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', color: '#aaa', fontSize: '0.72rem', marginBottom: '4px', fontWeight: 'bold' }}>Anexar Arquivo PDF *</label>
                    <input type="file" required accept=".pdf" onChange={e => setDocFileLabel(e.target.files?.[0]?.name || '')} style={{ display: 'block', color: '#ccc', fontSize: '0.8rem' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '10px', color: '#000', fontWeight: 'bold', fontSize: '0.8rem' }}>Enviar PDF</button>
                    <button type="button" onClick={() => setSelectedDocType('')} className="btn btn-secondary" style={{ flex: 1, padding: '10px', background: '#333', border: 'none', color: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}>Cancelar</button>
                  </div>
                </form>
              )}

              {/* Dupla Aptidão Notice */}
              {isDuplaAptidao && (
                <div style={{ background: 'rgba(255, 215, 0, 0.05)', border: '1.5px solid #ffd700', borderRadius: '6px', padding: '14px', marginBottom: '20px' }}>
                  <strong style={{ color: '#ffd700', fontSize: '0.88rem', display: 'block', marginBottom: '4px' }}>⚡ DUPLA APTIDÃO ATIVADA (Fornecedor + Comprador)</strong>
                  <span style={{ fontSize: '0.78rem', color: '#ccc', lineHeight: '1.4', display: 'block' }}>
                    Sua empresa atua nas duas pontas do mercado. Para obter a homologação e os respectivos selos de compliance, é exigido o envio e aprovação dos documentos de ambas as checklists abaixo.
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {isDuplaAptidao ? (
                  <div>
                    <strong style={{ color: '#ffd700', fontSize: '0.9rem', display: 'block', borderBottom: '1px solid #333', paddingBottom: '6px', marginBottom: '10px' }}>
                      📋 Checklist Fornecedor (Gerador) & Comprador (Destinador)
                    </strong>
                    
                    <span style={{ fontSize: '0.72rem', color: '#aaa', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>🥈 Nível Prata</span>
                    {[
                      { key: 'licenca_ambiental_operacao_forn', label: 'Licença Ambiental de Operação (LO) - Atividade Geradora' },
                      { key: 'licenca_ambiental_operacao_comp', label: 'Licença Ambiental de Operação (LO) - Atividade de Recebimento' },
                      { key: 'pgrs', label: 'PGRS (Plano de Gerenciamento de Resíduos Sólidos)' },
                      { key: 'cadri_aaf', label: 'CADRI / AAF / Autorização Estadual para receber' },
                      { key: 'capacidade_instalada', label: 'Capacidade Instalada (Volume e tecnologia)' },
                      { key: 'alvara_municipal_forn', label: 'Alvará de Funcionamento Municipal (Forn.)' },
                      { key: 'alvara_municipal_comp', label: 'Alvará de Funcionamento Municipal (Comp.)' },
                      { key: 'avcb_forn', label: 'AVCB (Corpo de Bombeiros - Forn.)' },
                      { key: 'avcb_comp', label: 'AVCB (Corpo de Bombeiros - Comp.)' }
                    ].map(doc => (
                      <div key={doc.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0a0a', padding: '10px 12px', border: '1px solid #222', borderRadius: '4px', marginBottom: '6px' }}>
                        <span style={{ color: '#fff', fontSize: '0.82rem' }}>{doc.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.72rem', color: uploadedDocs[doc.key] ? '#25D366' : '#ff5353', fontWeight: 'bold' }}>
                            {uploadedDocs[doc.key] ? '✓ Enviado' : 'Pendente'}
                          </span>
                          <button type="button" onClick={() => setSelectedDocType(doc.key)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}>Upload</button>
                        </div>
                      </div>
                    ))}

                    <span style={{ fontSize: '0.72rem', color: '#ffd700', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginTop: '14px', marginBottom: '6px' }}>🥇 Nível Ouro</span>
                    {[
                      { key: 'inventario_anual_rapp', label: 'Inventário Anual (RAPP) entregue SINIR/CTF' },
                      { key: 'iso_14001_forn', label: 'Certificação ISO 14001 (Forn.)' },
                      { key: 'iso_14001_comp', label: 'Certificação ISO 14001 (Comp.)' },
                      { key: 'apolice_ambiental_forn', label: 'Apólice de Seguro de Responsabilidade Ambiental (Forn.)' },
                      { key: 'apolice_ambiental_comp', label: 'Apólice de Seguro de Responsabilidade Ambiental (Comp.)' },
                      { key: 'anvisa_rss', label: 'ANVISA (Apenas para RSS)' },
                      { key: 'export_mtr_cdf_forn', label: 'Export do histórico de MTR/CDF emitidos (Forn.)' },
                      { key: 'export_cdf_comp', label: 'Export do histórico de CDF emitidos (Comp.)' }
                    ].map(doc => (
                      <div key={doc.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0a0a', padding: '10px 12px', border: '1px solid #222', borderRadius: '4px', marginBottom: '6px' }}>
                        <span style={{ color: '#fff', fontSize: '0.82rem' }}>{doc.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.72rem', color: uploadedDocs[doc.key] ? '#25D366' : '#ff5353', fontWeight: 'bold' }}>
                            {uploadedDocs[doc.key] ? '✓ Enviado' : 'Pendente'}
                          </span>
                          <button type="button" onClick={() => setSelectedDocType(doc.key)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}>Upload</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {isFornecedor && (
                      <div>
                        <strong style={{ color: '#ffd700', fontSize: '0.9rem', display: 'block', borderBottom: '1px solid #333', paddingBottom: '6px', marginBottom: '10px' }}>
                          📋 Checklist Fornecedor (Gerador)
                        </strong>
                        
                        <span style={{ fontSize: '0.72rem', color: '#aaa', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>🥈 Nível Prata</span>
                        {[
                          { key: 'licenca_ambiental_operacao_forn', label: 'Licença Ambiental de Operação (LO) - Atividade Geradora' },
                          { key: 'pgrs', label: 'PGRS (Plano de Gerenciamento de Resíduos Sólidos)' },
                          { key: 'alvara_municipal_forn', label: 'Alvará de Funcionamento Municipal' },
                          { key: 'avcb_forn', label: 'AVCB (Corpo de Bombeiros)' }
                        ].map(doc => (
                          <div key={doc.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0a0a', padding: '10px 12px', border: '1px solid #222', borderRadius: '4px', marginBottom: '6px' }}>
                            <span style={{ color: '#fff', fontSize: '0.82rem' }}>{doc.label}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '0.72rem', color: uploadedDocs[doc.key] ? '#25D366' : '#ff5353', fontWeight: 'bold' }}>
                                {uploadedDocs[doc.key] ? '✓ Enviado' : 'Pendente'}
                              </span>
                              <button type="button" onClick={() => setSelectedDocType(doc.key)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}>Upload</button>
                            </div>
                          </div>
                        ))}

                        <span style={{ fontSize: '0.72rem', color: '#ffd700', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginTop: '14px', marginBottom: '6px' }}>🥇 Nível Ouro</span>
                        {[
                          { key: 'inventario_anual_rapp', label: 'Inventário Anual (RAPP) entregue SINIR/CTF' },
                          { key: 'iso_14001_forn', label: 'Certificação ISO 14001' },
                          { key: 'apolice_ambiental_forn', label: 'Apólice de Seguro de Responsabilidade Ambiental' },
                          { key: 'export_mtr_cdf_forn', label: 'Export do histórico de MTR/CDF emitidos' }
                        ].map(doc => (
                          <div key={doc.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0a0a', padding: '10px 12px', border: '1px solid #222', borderRadius: '4px', marginBottom: '6px' }}>
                            <span style={{ color: '#fff', fontSize: '0.82rem' }}>{doc.label}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '0.72rem', color: uploadedDocs[doc.key] ? '#25D366' : '#ff5353', fontWeight: 'bold' }}>
                                {uploadedDocs[doc.key] ? '✓ Enviado' : 'Pendente'}
                              </span>
                              <button type="button" onClick={() => setSelectedDocType(doc.key)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}>Upload</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {isComprador && (
                      <div>
                        <strong style={{ color: '#ffd700', fontSize: '0.9rem', display: 'block', borderBottom: '1px solid #333', paddingBottom: '6px', marginBottom: '10px', marginTop: '10px' }}>
                          📋 Checklist Comprador (Destinador)
                        </strong>
                        
                        <span style={{ fontSize: '0.72rem', color: '#aaa', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>🥈 Nível Prata</span>
                        {[
                          { key: 'licenca_ambiental_operacao_comp', label: 'Licença Ambiental de Operação (LO) - Atividade de Recebimento' },
                          { key: 'cadri_aaf', label: 'CADRI / AAF / Autorização Estadual para receber' },
                          { key: 'capacidade_instalada', label: 'Capacidade Instalada (Volume e tecnologia)' },
                          { key: 'alvara_municipal_comp', label: 'Alvará de Funcionamento Municipal' },
                          { key: 'avcb_comp', label: 'AVCB (Corpo de Bombeiros)' }
                        ].map(doc => (
                          <div key={doc.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0a0a', padding: '10px 12px', border: '1px solid #222', borderRadius: '4px', marginBottom: '6px' }}>
                            <span style={{ color: '#fff', fontSize: '0.82rem' }}>{doc.label}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '0.72rem', color: uploadedDocs[doc.key] ? '#25D366' : '#ff5353', fontWeight: 'bold' }}>
                                {uploadedDocs[doc.key] ? '✓ Enviado' : 'Pendente'}
                              </span>
                              <button type="button" onClick={() => setSelectedDocType(doc.key)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}>Upload</button>
                            </div>
                          </div>
                        ))}

                        <span style={{ fontSize: '0.72rem', color: '#ffd700', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginTop: '14px', marginBottom: '6px' }}>🥇 Nível Ouro</span>
                        {[
                          { key: 'iso_14001_comp', label: 'Certificação ISO 14001' },
                          { key: 'apolice_ambiental_comp', label: 'Apólice de Seguro de Responsabilidade Ambiental' },
                          { key: 'anvisa_rss', label: 'ANVISA (Apenas para RSS)' },
                          { key: 'export_cdf_comp', label: 'Export do histórico de CDF emitidos' }
                        ].map(doc => (
                          <div key={doc.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0a0a', padding: '10px 12px', border: '1px solid #222', borderRadius: '4px', marginBottom: '6px' }}>
                            <span style={{ color: '#fff', fontSize: '0.82rem' }}>{doc.label}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '0.72rem', color: uploadedDocs[doc.key] ? '#25D366' : '#ff5353', fontWeight: 'bold' }}>
                                {uploadedDocs[doc.key] ? '✓ Enviado' : 'Pendente'}
                              </span>
                              <button type="button" onClick={() => setSelectedDocType(doc.key)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}>Upload</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {isCarrier && (
                  <div>
                    <strong style={{ color: '#ffd700', fontSize: '0.9rem', display: 'block', borderBottom: '1px solid #333', paddingBottom: '6px', marginBottom: '10px' }}>
                      📋 Checklist Transportadora
                    </strong>
                    
                    <span style={{ fontSize: '0.72rem', color: '#aaa', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>🥈 Nível Prata</span>
                    {[
                      { key: 'licenca_transporte', label: 'Licença Ambiental de Coleta e Transporte' },
                      { key: 'crlv_veiculos', label: 'CRLV dos Veículos Cadastrados' },
                      { key: 'civ_veiculos', label: 'CIV (Certificado de Inspeção Veicular)' },
                      { key: 'mopp', label: 'MOPP do Motorista (Carga Classe I)' },
                      { key: 'cipp', label: 'CIPP do Veículo (Carga Classe I)' }
                    ].map(doc => (
                      <div key={doc.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0a0a', padding: '10px 12px', border: '1px solid #222', borderRadius: '4px', marginBottom: '6px' }}>
                        <span style={{ color: '#fff', fontSize: '0.82rem' }}>{doc.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.72rem', color: uploadedDocs[doc.key] ? '#25D366' : '#ff5353', fontWeight: 'bold' }}>
                            {uploadedDocs[doc.key] ? '✓ Enviado' : 'Pendente'}
                          </span>
                          <button type="button" onClick={() => setSelectedDocType(doc.key)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}>Upload</button>
                        </div>
                      </div>
                    ))}

                    <span style={{ fontSize: '0.72rem', color: '#ffd700', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginTop: '14px', marginBottom: '6px' }}>🥇 Nível Ouro</span>
                    {[
                      { key: 'apolice_seguro_rc', label: 'Apólice de Seguro RC + RCFDC' },
                      { key: 'pae_transporte', label: 'Plano de Atendimento Emergencial (PAE)' },
                      { key: 'export_mtr_trans', label: 'Export do histórico de MTR como transportadora' },
                      { key: 'iso_9001_14001', label: 'Certificação ISO 9001 / 14001' }
                    ].map(doc => (
                      <div key={doc.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0a0a', padding: '10px 12px', border: '1px solid #222', borderRadius: '4px', marginBottom: '6px' }}>
                        <span style={{ color: '#fff', fontSize: '0.82rem' }}>{doc.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.72rem', color: uploadedDocs[doc.key] ? '#25D366' : '#ff5353', fontWeight: 'bold' }}>
                            {uploadedDocs[doc.key] ? '✓ Enviado' : 'Pendente'}
                          </span>
                          <button type="button" onClick={() => setSelectedDocType(doc.key)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}>Upload</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isControlador && (
                  <div>
                    <strong style={{ color: '#ffd700', fontSize: '0.9rem', display: 'block', borderBottom: '1px solid #333', paddingBottom: '6px', marginBottom: '10px' }}>
                      📋 Checklist Controlador
                    </strong>
                    
                    <span style={{ fontSize: '0.72rem', color: '#aaa', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>🥈 Nível Prata</span>
                    {[
                      { key: 'procuracao_simples', label: 'Procuração ou Carta de Autorização Simples' }
                    ].map(doc => (
                      <div key={doc.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0a0a', padding: '10px 12px', border: '1px solid #222', borderRadius: '4px', marginBottom: '6px' }}>
                        <span style={{ color: '#fff', fontSize: '0.82rem' }}>{doc.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.72rem', color: uploadedDocs[doc.key] ? '#25D366' : '#ff5353', fontWeight: 'bold' }}>
                            {uploadedDocs[doc.key] ? '✓ Enviado' : 'Pendente'}
                          </span>
                          <button type="button" onClick={() => setSelectedDocType(doc.key)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}>Upload</button>
                        </div>
                      </div>
                    ))}

                    <span style={{ fontSize: '0.72rem', color: '#ffd700', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginTop: '14px', marginBottom: '6px' }}>🥇 Nível Ouro</span>
                    {[
                      { key: 'procuracao_eletronica', label: 'Procuração Eletrônica / Assinatura Digital GOV.BR' },
                      { key: 'carteira_conselho_art', label: 'Carteira do Conselho RT + ART de Cargo/Função' }
                    ].map(doc => (
                      <div key={doc.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0a0a', padding: '10px 12px', border: '1px solid #222', borderRadius: '4px', marginBottom: '6px' }}>
                        <span style={{ color: '#fff', fontSize: '0.82rem' }}>{doc.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.72rem', color: uploadedDocs[doc.key] ? '#25D366' : '#ff5353', fontWeight: 'bold' }}>
                            {uploadedDocs[doc.key] ? '✓ Enviado' : 'Pendente'}
                          </span>
                          <button type="button" onClick={() => setSelectedDocType(doc.key)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}>Upload</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  )
}
