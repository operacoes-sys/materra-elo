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

  // Filters State
  const [filterCategory, setFilterCategory] = useState('')
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

  // Audit trail for logged in user
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loadingAudit, setLoadingAudit] = useState(false)

  // Released contacts for logged in user
  const [releasedContacts, setReleasedContacts] = useState<any[]>([])
  const [loadingContacts, setLoadingContacts] = useState(false)

  // Carrier Bids on Freight (Reverse Auctions)
  const [freightAuctions, setFreightAuctions] = useState<any[]>([])
  const [loadingFreights, setLoadingFreights] = useState(false)

  const [dashboardTab, setDashboardTab] = useState<'geral' | 'meus_anuncios' | 'documentos' | 'auditoria' | 'representadas' | 'favoritos' | 'contatos_liberados'>('geral')
  const [activeMyListingId, setActiveMyListingId] = useState<string | null>(null)
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
        setFavorites([])
      }
    } else {
      setFavorites([])
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
    if (profile.subtipo === 'Corretor' || profile.subtipo === 'Corretor/Controlador') {
      const ads = myListings || []
      const hasOferta = ads.some(a => a.tipo_anuncio === 'Oferta' || a.tipo_anuncio?.toLowerCase().includes('oferta') || a.tipo_anuncio?.toLowerCase().includes('fornecedor'))
      const hasDemanda = ads.some(a => a.tipo_anuncio === 'Demanda' || a.tipo_anuncio?.toLowerCase().includes('demanda') || a.tipo_anuncio?.toLowerCase().includes('compra'))
      
      const initialRole = profile.tipo_parte
      if (initialRole === 'Fornecedor') {
        if (hasDemanda) {
          return 'Corretor Fornecedor / Comprador'
        }
        return 'Corretor Fornecedor'
      } else {
        if (hasOferta) {
          return 'Corretor Comprador / Fornecedor'
        }
        return 'Corretor Comprador'
      }
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

  // Load User Session & Profile
  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        const { data, error } = await supabase
          .from('cadastros')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (!error && data) {
          const hasOwnCarrier = !!data.transportadora_propria || data.subtipo === 'Transportadora própria'
          const normalized = { 
            ...data, 
            transportadora_propria: hasOwnCarrier,
            area_atuacao: data.area_atuacao || data.area_operacao || ''
          }
          setProfile(normalized)
          loadAuditLogs(session.user.id)
          fetchMyListings(session.user.id)
          loadReleasedContacts(session.user.id)
          if (data.subtipo === 'Corretor' || data.subtipo === 'Corretor/Controlador') {
            fetchRepCompanies(session.user.id)
          }
          if (data.tipo_parte === 'Transportadora' || hasOwnCarrier) {
            loadFreightAuctions(normalized.area_atuacao || '')
          }
        }
      }
      setLoading(false)
    }
    getSession()
    fetchListings()
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

  // Toggle Own Carrier Status
  const handleToggleOwnCarrier = async () => {
    if (!user || !profile) return
    const newVal = !profile.transportadora_propria
    try {
      const { error } = await supabase
        .from('cadastros')
        .update({ transportadora_propria: newVal })
        .eq('id', user.id)

      if (error) {
        // Fallback: update subtipo column instead
        const { error: fallbackErr } = await supabase
          .from('cadastros')
          .update({ subtipo: newVal ? 'Transportadora própria' : 'Empresa' })
          .eq('id', user.id)
        if (fallbackErr) throw fallbackErr
      }
      
      const updatedProfile = { 
        ...profile, 
        transportadora_propria: newVal,
        subtipo: newVal ? 'Transportadora própria' : 'Empresa'
      }
      setProfile(updatedProfile)
      if (newVal) {
        loadFreightAuctions(updatedProfile.area_atuacao || '')
      }
    } catch (err) {
      console.error('Erro ao alternar transportadora própria:', err)
      alert('Erro ao atualizar cadastro no banco de dados. Certifique se as colunas necessárias existem no Supabase.')
    }
  }

  // Bid Freight Reverse Auction via WhatsApp (Free plan restrictions apply)
  const handleBidFreight = (auc: any) => {
    const isInoperante = profile?.tipo_parte === 'Transportadora' && (profile?.status_documentos !== 'Verificado' || !profile?.area_atuacao)
    const isOwnCarrierInoperante = profile?.transportadora_propria && (profile?.status_documentos !== 'Verificado' || !profile?.area_atuacao)

    if (isInoperante || isOwnCarrierInoperante) {
      alert('Sua transportadora está INOPERANTE. Para dar lances em fretes, seus documentos devem ser validados pelo Administrador e a área de atuação preenchida.')
      return
    }

    if (!profile?.plano_active && !profile?.plano_ativo) {
      setPaywallModal('O Leilão Reverso de fretes com transportadoras credenciadas requer o plano Materra ProAtiva.')
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
    if (!profile?.plano_ativo) {
      setPaywallModal('Visualizar Fichas de terceiros no buscador requer o plano Materra ProAtiva.')
      return
    }
    setSelectedFicha(ficha)
  }

  // Search Ficha Materra
  const handleFichaSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchFichaQuery.trim()) return
    setSearchingFicha(true)
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
      cpf_cnpj: 'CPF ou CNPJ',
      rg_contrato_social: 'RG ou Contrato Social',
      comprovante_endereco: 'Comprovante de Endereço',
      regularidade_fiscal: 'Certidão Receita Federal',
      idoneidade_criminal: 'Certidão Criminal Negativa',
      crea_art_opcional: 'CREA + ART (Opcional)',
      qualificacao_gestao_opcional: 'Qualificação em Gestão de Resíduos (Opcional)',
      licenca_ambiental_residuo: 'Licença Ambiental do Resíduo',
      pgrs: 'PGRS',
      ctf_ibama: 'CTF IBAMA',
      inventario_residuos: 'Inventário de Resíduos',
      cadri_opcional: 'CADRI (Opcional)',
      licenca_recebimento: 'Licença de Recebimento',
      autorizacao_especifica: 'Autorização Específica',
      licenca_ambiental: 'Licença Ambiental',
      antt_rntrc: 'ANTT RNTRC',
      mopp: 'MOPP',
      civ: 'CIV',
      cipp: 'CIPP',
      seguro_transporte: 'Seguro de Transporte',
      ficha_emergencia: 'Ficha de Emergência'
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
      setPaywallModal('Você está registrado inicialmente como Fornecedor. Para publicar Demandas de Compra (ação de Comprador), você precisa assinar o plano Materra ProAtiva.')
      return
    }
    if (adRoleType === 'Oferta' && isComprador && !isPlanoActive) {
      setPaywallModal('Você está registrado inicialmente como Comprador. Para publicar Ofertas de Resíduo (ação de Fornecedor), você precisa assinar o plano Materra ProAtiva.')
      return
    }

    // Limits check
    const publicationsUsed = profile.publicacoes_usadas || 0
    if (publicationsUsed >= 1 && !isPlanoActive) {
      setPaywallModal('Você atingiu o limite gratuito de 1 publicação de anúncio do seu subtipo inicial. Assine o plano Materra ProAtiva para publicar sem limites.')
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
    if (!profile?.plano_ativo) {
      setPaywallModal('A homologação e auditoria de fechamento de negócios no Audit Trail requer o plano Materra ProAtiva.')
      return
    }
    router.push('/operacoes/fechamento')
  }

  const handleFreightSimulationTrigger = () => {
    if (!profile?.plano_ativo) {
      setPaywallModal('O Leilão Reverso e simulação de fretes com transportadoras credenciadas requer o plano Materra ProAtiva.')
      return
    }
    router.push('/frete')
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
          {/* Logo Brand */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LogoBrand />
          </Link>

          {user ? (
            <>
              {/* Ficha search bar inside the header */}
              <form onSubmit={handleFichaSearch} style={{ display: 'flex', gap: '8px', flex: '1', maxWidth: '350px' }}>
                <input
                  type="text"
                  placeholder="Buscar Ficha Materra..."
                  value={searchFichaQuery}
                  onChange={e => setSearchFichaQuery(e.target.value)}
                  className="form-input"
                  style={{ padding: '8px 12px', background: '#121212', color: '#fff', fontSize: '0.85rem', height: '38px', border: '1px solid #333' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 16px', height: '38px', fontSize: '0.85rem', color: '#000', fontWeight: 'bold' }}>
                  Buscar
                </button>
              </form>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#aaa' }}>
                  Olá, <strong style={{ color: 'var(--primary-500)' }}>{profile?.nome_ou_razao || user.email}</strong>
                </span>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#1c1c1c', border: '1px solid #333' }}>
                  Sair
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Link href="/auth/login" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#000', fontWeight: 'bold' }}>
                  Login / Cadastro
                </Link>
                <Link href="/auth/cadastro?role=transportadora" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', color: 'var(--primary-500)', border: '1px solid var(--primary-500)', background: 'transparent' }}>
                  Login / Cadastro de Transportadoras
                </Link>
              </div>

              {/* Ficha search bar inside the header */}
              <form onSubmit={handleFichaSearch} style={{ display: 'flex', gap: '8px', flex: '1', maxWidth: '350px' }}>
                <input
                  type="text"
                  placeholder="Buscar Fichas por nome de empresas..."
                  value={searchFichaQuery}
                  onChange={e => setSearchFichaQuery(e.target.value)}
                  className="form-input"
                  style={{ padding: '8px 12px', background: '#121212', color: '#fff', fontSize: '0.85rem', height: '38px', border: '1px solid #333' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 16px', height: '38px', fontSize: '0.85rem', color: '#000', fontWeight: 'bold' }}>
                  Buscar
                </button>
              </form>
            </>
          )}
        </div>
      </nav>

      {/* SEARCH RESULTS OVERLAY SECTION FOR FICHAS */}
      {fichaResults.length > 0 && (
        <div style={{ background: '#121212', borderBottom: '1px solid #333', padding: '20px 0' }}>
          <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ color: 'var(--primary-500)', fontSize: '1.1rem', fontWeight: 'bold' }}>Fichas Materra Encontradas</h3>
              <button onClick={() => { setFichaResults([]); setSearchFichaQuery(''); }} style={{ background: 'transparent', border: 'none', color: '#ff5353', cursor: 'pointer', textDecoration: 'underline' }}>Fechar Busca</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {fichaResults.map(f => (
                <div
                  key={f.id}
                  onClick={() => handleFichaClick(f)}
                  style={{
                    background: '#1c1c1c',
                    border: '1px solid #333',
                    padding: '16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'transform 100ms'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <strong style={{ color: '#fff', display: 'block', fontSize: '0.95rem' }}>{f.nome_ou_razao}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{f.cidade} - {f.uf}</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.75rem', color: 'var(--primary-500)' }}>
                    <span>Selo: {f.nivel_selo || 'Bronze'}</span>
                    <span>Pontuação: {getReputationDisplay(f)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* USER DASHBOARD PORTAL */}
      {user && profile && (
        <div style={{ background: '#0a0a0a', borderBottom: '1px solid #222', padding: '30px 20px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                  Painel de Controle - <span style={{ color: 'var(--primary-500)' }}>{getDynamicRoleLabel()}</span>
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
                  <strong style={{ fontSize: '1.1rem', color: profile.plano_ativo ? 'var(--primary-500)' : '#aaa' }}>
                    {profile.plano_ativo ? 'ProAtiva (R$35/mês)' : 'Gratuita'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Quick shortcuts grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '30px' }}>
              {/* Fornecedor specific shortcuts */}
              {profile.tipo_parte === 'Fornecedor' && (
                <>
                  <button onClick={() => handlePublishAdTrigger('Oferta')} className="btn btn-primary" style={{ padding: '14px', fontSize: '0.85rem', color: '#000', fontWeight: 'bold' }}>
                    Publicar Oferta de Resíduo
                  </button>
                  <button onClick={() => handlePublishAdTrigger('Demanda')} className="btn btn-secondary" style={{ padding: '14px', fontSize: '0.85rem', background: '#121212', border: '1px solid #333' }}>
                    Publicar Demanda de Compra
                  </button>
                  <button onClick={handleFreightSimulationTrigger} className="btn btn-secondary" style={{ padding: '14px', fontSize: '0.85rem', background: '#121212', border: '1px solid #333' }}>
                    Cotar Frete (Leilão Reverso)
                  </button>
                  <button onClick={handleClosingTrigger} className="btn btn-secondary" style={{ padding: '14px', fontSize: '0.85rem', background: '#121212', border: '1px solid #333' }}>
                    Registrar Fechamento Operação
                  </button>
                </>
              )}

              {/* Comprador specific shortcuts */}
              {profile.tipo_parte === 'Comprador' && (
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
                  <button onClick={handleClosingTrigger} className="btn btn-secondary" style={{ padding: '14px', fontSize: '0.85rem', background: '#121212', border: '1px solid #333' }}>
                    Registrar Fechamento Operação
                  </button>
                </>
              )}

              {/* Transportadora specific shortcuts */}
              {isCarrierUser && (
                <>
                  <button onClick={handleFreightSimulationTrigger} className="btn btn-primary" style={{ padding: '14px', fontSize: '0.85rem', color: '#000', fontWeight: 'bold' }}>
                    Sala de Leilões Públicos
                  </button>
                  <button onClick={handleClosingTrigger} className="btn btn-secondary" style={{ padding: '14px', fontSize: '0.85rem', background: '#121212', border: '1px solid #333' }}>
                    Registrar Fechamento e Auditoria
                  </button>
                </>
              )}

              <Link href="/planos" className="btn btn-secondary" style={{ padding: '14px', fontSize: '0.85rem', background: '#121212', border: '1px solid #333', color: 'var(--primary-500)' }}>
                Planos de Leads e Adesão
              </Link>
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
                Painel Geral
              </button>
              {profile.tipo_parte !== 'Transportadora' && (
                <button
                  onClick={() => setDashboardTab('meus_anuncios')}
                  style={{
                    padding: '12px 20px', background: 'none', border: 'none',
                    color: dashboardTab === 'meus_anuncios' ? 'var(--primary-500)' : '#aaa',
                    borderBottom: dashboardTab === 'meus_anuncios' ? '2px solid var(--primary-500)' : '2px solid transparent',
                    fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem'
                  }}
                >
                  Meus Anúncios ({myListings.length})
                </button>
              )}
              {profile.tipo_parte !== 'Transportadora' && (
                <button
                  onClick={() => setDashboardTab('favoritos')}
                  style={{
                    padding: '12px 20px', background: 'none', border: 'none',
                    color: dashboardTab === 'favoritos' ? 'var(--primary-500)' : '#aaa',
                    borderBottom: dashboardTab === 'favoritos' ? '2px solid var(--primary-500)' : '2px solid transparent',
                    fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem'
                  }}
                >
                  Favoritos ({favorites.length})
                </button>
              )}
              {profile.tipo_parte !== 'Transportadora' && (
                <button
                  onClick={() => setDashboardTab('contatos_liberados')}
                  style={{
                    padding: '12px 20px', background: 'none', border: 'none',
                    color: dashboardTab === 'contatos_liberados' ? 'var(--primary-500)' : '#aaa',
                    borderBottom: dashboardTab === 'contatos_liberados' ? '2px solid var(--primary-500)' : '2px solid transparent',
                    fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem'
                  }}
                >
                  Contatos Liberados
                </button>
              )}
              <button
                onClick={() => setDashboardTab('documentos')}
                style={{
                  padding: '12px 20px', background: 'none', border: 'none',
                  color: dashboardTab === 'documentos' ? 'var(--primary-500)' : '#aaa',
                  borderBottom: dashboardTab === 'documentos' ? '2px solid var(--primary-500)' : '2px solid transparent',
                  fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem'
                }}
              >
                Documentos & Homologação
              </button>
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
              <button
                onClick={() => setDashboardTab('auditoria')}
                style={{
                  padding: '12px 20px', background: 'none', border: 'none',
                  color: dashboardTab === 'auditoria' ? 'var(--primary-500)' : '#aaa',
                  borderBottom: dashboardTab === 'auditoria' ? '2px solid var(--primary-500)' : '2px solid transparent',
                  fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem'
                }}
              >
                Audit Trail Privado
              </button>
            </div>

            {/* TAB CONTENT: GERAL */}
            {dashboardTab === 'geral' && (
              <>
                {/* OWN CARRIER (TRANSPORTADORA PRÓPRIA/PARTICULAR) TOGGLE */}
                {(profile.tipo_parte === 'Fornecedor' || profile.tipo_parte === 'Comprador') && (
              <div style={{
                background: '#121212',
                border: '1px solid #222',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '30px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>Logística e Frota Própria</h3>
                    <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '2px' }}>
                      Se você possui caminhões ou realiza transporte próprio de resíduos, ative este módulo para dar lances em fretes públicos de terceiros.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleOwnCarrier}
                    className="btn"
                    style={{
                      background: profile.transportadora_propria ? '#ff5353' : 'var(--primary-500)',
                      color: '#000',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      padding: '8px 16px'
                    }}
                  >
                    {profile.transportadora_propria ? 'Desativar Frota Própria' : 'Ativar Frota Própria'}
                  </button>
                </div>

                {/* Own Carrier Dashboard Info */}
                {profile.transportadora_propria && (
                  <div style={{ marginTop: '20px', borderTop: '1px solid #222', paddingTop: '20px' }}>
                    <h4 style={{ color: 'var(--primary-500)', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '12px' }}>
                      Convites para Leilões de Frete (matching com sua área de atuação: {profile.area_atuacao || 'Todas'})
                    </h4>
                    {loadingFreights ? (
                      <p style={{ color: '#888', fontSize: '0.8rem' }}>Buscando leilões...</p>
                    ) : freightAuctions.length === 0 ? (
                      <p style={{ color: '#666', fontSize: '0.8rem' }}>Nenhum leilão de frete ativo correspondente no momento.</p>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                        {freightAuctions.map(auc => (
                          <div key={auc.id} style={{ background: '#1c1c1c', border: '1px solid #333', padding: '12px', borderRadius: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#888' }}>
                              <span>Leilão #{auc.id.substring(0,6)}</span>
                              <span style={{ color: 'var(--primary-500)' }}>Alvo: R$ {auc.valor_desejado}</span>
                            </div>
                            <strong style={{ color: '#fff', fontSize: '0.85rem', display: 'block', margin: '4px 0' }}>{auc.tipo_material || 'Resíduo'}</strong>
                            <span style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>{auc.origem} para {auc.destino}</span>
                            <button
                              onClick={() => handleBidFreight(auc)}
                              className="btn btn-primary"
                              style={{ width: '100%', padding: '6px', fontSize: '0.75rem', marginTop: '10px', color: '#000', fontWeight: 'bold' }}
                            >
                              Enviar Lance (Concierge)
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <div style={{ background: '#121212', border: '1px solid #222', borderRadius: '8px', padding: '24px', textAlign: 'center', marginTop: '20px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', marginTop: '4px', fontWeight: 'bold' }}>Bem-vindo ao seu Painel de Controle!</h3>
              <p style={{ color: '#aaa', fontSize: '0.85rem', maxWidth: '600px', margin: '8px auto 0', lineHeight: '1.5' }}>
                Use as abas acima para gerenciar seus resíduos anunciados, acompanhar a homologação de seus documentos ambientais e auditar transações fechadas com nossa assessoria.
              </p>
            </div>

            {/* INFORMAÇÕES CADASTRAIS CARD */}
            <div style={{ 
              background: '#121212', 
              border: '1px solid #222', 
              borderRadius: '8px', 
              padding: '24px', 
              marginTop: '20px' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ color: 'var(--primary-500)', fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>
                    Informações Cadastrais da Conta
                  </h3>
                  <p style={{ color: '#888', fontSize: '0.8rem', margin: '2px 0 0 0' }}>Estes dados são utilizados para faturamento e liberação de leads</p>
                </div>
                <button 
                  onClick={handleOpenEditProfile} 
                  className="btn btn-primary" 
                  style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#000', fontWeight: 'bold' }}
                >
                  Editar Meus Dados
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', textAlign: 'left' }}>
                <div>
                  <span style={{ color: '#888', fontSize: '0.75rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Nome / Razão Social</span>
                  <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block', marginTop: '2px' }}>{profile.nome_ou_razao || 'Não informado'}</strong>
                </div>
                <div>
                  <span style={{ color: '#888', fontSize: '0.75rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>CPF / CNPJ</span>
                  <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block', marginTop: '2px' }}>{profile.cpf_ou_cnpj || 'Não informado'}</strong>
                </div>
                <div>
                  <span style={{ color: '#888', fontSize: '0.75rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>E-mail de Contato</span>
                  <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block', marginTop: '2px' }}>{profile.email || 'Não informado'}</strong>
                </div>
                <div>
                  <span style={{ color: '#888', fontSize: '0.75rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>WhatsApp</span>
                  <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block', marginTop: '2px' }}>{profile.whatsapp || 'Não informado'}</strong>
                </div>
                <div>
                  <span style={{ color: '#888', fontSize: '0.75rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Endereço Completo</span>
                  <strong style={{ color: '#fff', fontSize: '0.9rem', display: 'block', marginTop: '2px' }}>{profile.endereco || 'Não informado'} {profile.cidade && `- ${profile.cidade}/${profile.uf || ''}`}</strong>
                </div>
                <div>
                  <span style={{ color: '#888', fontSize: '0.75rem', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Chave PIX Cadastrada</span>
                  <strong style={{ color: 'var(--primary-500)', fontSize: '0.95rem', display: 'block', marginTop: '2px', fontWeight: 'bold' }}>{profile.chave_pix || 'Nenhuma chave cadastrada'}</strong>
                </div>
              </div>
            </div>
          </>
        )}

            {/* TAB CONTENT: MEUS ANÚNCIOS */}
            {dashboardTab === 'meus_anuncios' && (
              <div style={{ background: '#121212', border: '1px solid #222', borderRadius: '8px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>Seus Anúncios Publicados</h3>
                    <p style={{ color: '#888', fontSize: '0.8rem' }}>Visualize métricas de performance e status dos seus lotes de resíduos</p>
                  </div>
                  <Link href="/anuncios/publicar" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#000', fontWeight: 'bold' }}>
                    Publicar Novo Anúncio
                  </Link>
                </div>

                {loadingMyListings ? (
                  <p style={{ color: '#888', fontSize: '0.85rem' }}>Carregando seus anúncios...</p>
                ) : myListings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '12px' }}>Você ainda não publicou nenhum anúncio.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {myListings.map(item => (
                      <div 
                        key={item.id} 
                        style={{ 
                          background: '#1c1c1c', 
                          border: activeMyListingId === item.id ? '1px solid var(--primary-500)' : '1px solid #333', 
                          padding: '16px', 
                          borderRadius: '8px', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '16px',
                          cursor: 'pointer'
                        }}
                        onClick={() => setActiveMyListingId(activeMyListingId === item.id ? null : item.id)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                          <div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                              <strong style={{ color: '#fff', fontSize: '1rem' }}>{item.residuo}</strong>
                              <span style={{ color: 'var(--primary-500)', fontSize: '0.75rem', fontWeight: 'bold', background: 'rgba(255,215,0,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                {item.codigo}
                              </span>
                              <span style={{
                                padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold',
                                background: item.status === 'Anunciado' ? 'rgba(67,160,71,0.1)' : 'rgba(255,167,38,0.1)',
                                color: item.status === 'Anunciado' ? 'var(--primary-400)' : 'var(--warning)'
                              }}>
                                {item.status || 'Pendente'}
                              </span>
                            </div>
                            <p style={{ color: '#aaa', fontSize: '0.8rem', margin: 0 }}>
                              Tipo: {item.tipo_anuncio} • Categoria: {item.categoria} • Quantidade: {item.quantidade} {item.unidade}
                            </p>
                            <p style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '4px', marginBottom: 0 }}>
                              Valor Desejado: R$ {item.valor_desejado?.toLocaleString('pt-BR')} • Publicado em: {new Date(item.data_publicacao).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => toggleListingActiveStatus(item)}
                              className="btn"
                              style={{
                                padding: '8px 12px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                background: (item.status === 'Inativo' || item.status === 'Suspenso') ? '#2e7d32' : '#c62828',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              {(item.status === 'Inativo' || item.status === 'Suspenso') ? 'Reativar' : 'Suspender'}
                            </button>

                            {/* EXPANSIONS COUNTER CARD */}
                            <div style={{
                              background: '#0d0d0d', border: '1px solid #222', padding: '10px 16px', borderRadius: '8px',
                              textAlign: 'center', minWidth: '150px'
                            }}>
                              <span style={{ fontSize: '0.65rem', color: '#777', textTransform: 'uppercase', display: 'block', fontWeight: 'bold' }}>
                                Visualizações Pró
                              </span>
                              <strong style={{ fontSize: '1.4rem', color: 'var(--primary-500)', display: 'block', margin: '2px 0' }}>
                                {item.leads_expandidos_plano || 0}
                              </strong>
                              <span style={{ fontSize: '0.65rem', color: '#555', display: 'block', maxWidth: '140px', margin: '0 auto', lineHeight: '1.2' }}>
                                Usuários ProAtiva que expandiram o anúncio
                              </span>
                            </div>
                          </div>
                        </div>

                        {activeMyListingId === item.id && (
                          <div style={{ borderTop: '1px solid #333', paddingTop: '16px', marginTop: '4px' }} onClick={e => e.stopPropagation()}>
                            <h4 style={{ color: 'var(--primary-500)', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Anúncios Recomendados para Match (Oportunidades Contrárias)
                            </h4>
                            {(() => {
                              const isItemOferta = item.tipo_anuncio?.toLowerCase().includes('oferta')
                              const matches = listings
                                .filter(l => {
                                  if (l.id === item.id) return false
                                  if (l.status !== 'Anunciado') return false
                                  if (l.categoria !== item.categoria) return false
                                  const isLOferta = l.tipo_anuncio?.toLowerCase().includes('oferta')
                                  return isItemOferta !== isLOferta
                                })
                                .sort((a, b) => {
                                  const distA = getDistanceBetweenCeps(item.cep || '74000-000', a.cep || '75000-000')
                                  const distB = getDistanceBetweenCeps(item.cep || '74000-000', b.cep || '75000-000')
                                  return distB - distA
                                })

                              if (matches.length === 0) {
                                return (
                                  <p style={{ color: '#777', fontSize: '0.8rem', fontStyle: 'italic', margin: 0 }}>
                                    Nenhum anúncio contrário ativo para match no momento.
                                  </p>
                                )
                              }

                              return (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                                  {matches.map(m => (
                                    <div 
                                      key={m.id} 
                                      onClick={() => handleListingClick(m)}
                                      style={{ background: '#0d0d0d', border: '1px solid #222', borderRadius: '8px', padding: '12px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-500)'}
                                      onMouseLeave={e => e.currentTarget.style.borderColor = '#222'}
                                    >
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '0.65rem', color: '#ffb300', fontWeight: 'bold' }}>CONFIDENCIAL</span>
                                        <span style={{ fontSize: '0.65rem', background: '#222', color: '#aaa', padding: '2px 6px', borderRadius: '4px' }}>
                                          {m.codigo}
                                        </span>
                                      </div>
                                      <h5 style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 'bold', margin: '0 0 4px 0' }}>{m.residuo}</h5>
                                      <p style={{ color: '#aaa', fontSize: '0.75rem', margin: 0 }}>
                                        Qtd: {m.quantidade} {m.unidade} • Disponível a {getDistanceBetweenCeps(item.cep || '74000-000', m.cep || '75000-000')} km de você
                                      </p>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem', borderTop: '1px solid #1a1a1a', paddingTop: '6px' }}>
                                        <span style={{ color: '#666' }}>Valor: R$ {m.valor_desejado}</span>
                                        <span style={{ color: 'var(--primary-500)' }}>Materra Index: R$ {m.valor_index || 'Calculando...'}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )
                            })()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                              Qtd: <strong>{item.quantidade} {item.unidade}</strong> • Freq: {item.frequencia} • UF: {item.uf}
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

          </div>
        </div>
      )}

      {/* VITRINE HERO AREA */}
      {!user && (
        <div style={{
          padding: '80px 20px 60px',
          background: 'radial-gradient(circle at center, #111111 0%, #000000 100%)',
          borderBottom: '1px solid #222'
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
            <span style={{
              display: 'inline-block',
              padding: '6px 16px',
              background: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid var(--primary-500)',
              borderRadius: '20px',
              fontSize: '0.8rem',
              color: 'var(--primary-500)',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              marginBottom: '24px',
              letterSpacing: '1px'
            }}>
              Quantidade e padronização para negociar em escala, com compliance e economia
            </span>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', marginBottom: '20px', lineHeight: '1.2' }}>
              Marketplace Materra Elo
            </h1>
            <p style={{ color: '#ccc', fontSize: '1.15rem', lineHeight: '1.6', maxWidth: '850px', margin: '0 auto 32px', textAlign: 'center' }}>
              Conectamos geradores, compradores e transportadoras credenciados, em total conformidade com a legislação ambiental e jurídica brasileira. Na Materra Elo você escolhe com quem negociar pela Ficha Materra, fecha com segurança e elimina o risco operacional.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '64px' }}>
              <Link href="/auth/cadastro?role=usuario" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '0.95rem', color: '#000', fontWeight: 'bold', borderRadius: '8px' }}>
                Cadastre-se gratuitamente
              </Link>
              <Link href="/auth/login" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '0.95rem', color: '#fff', background: '#1c1c1c', border: '1px solid #333', borderRadius: '8px' }}>
                Publique seu anúncio
              </Link>
            </div>

            {/* SEÇÃO MERCADO POTENCIAL */}
            <MercadoPotencialSection />

            {/* SEÇÃO POR QUE ESCOLHER */}
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '40px', position: 'relative' }}>
              Por que empresas líderes escolhem a Materra Elo
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', textAlign: 'left', marginBottom: '60px' }}>
              
              {/* Card 1 */}
              <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', padding: '24px', transition: 'border-color 0.2s' }}>
                <div style={{ fontSize: '2rem', color: 'var(--primary-500)', fontWeight: 'bold', marginBottom: '12px' }}>01</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', marginBottom: '12px' }}>
                  Ficha Materra: credibilidade antes do negócio
                </h3>
                <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  Todo participante passa por verificação documental completa e recebe:
                </p>
                <ul style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.5', margin: '8px 0', paddingLeft: '20px' }}>
                  <li>Selo de compliance ambiental e operacional: Bronze, Prata ou Ouro</li>
                  <li>Nota de operação de 0 a 100, baseada em histórico e desempenho</li>
                </ul>
                <p style={{ color: 'var(--primary-500)', fontSize: '0.9rem', fontWeight: 'bold', marginTop: '8px' }}>
                  Você negocia sabendo exatamente quem está do outro lado.
                </p>
              </div>

              {/* Card 2 */}
              <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '2rem', color: 'var(--primary-500)', fontWeight: 'bold', marginBottom: '12px' }}>02</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', marginBottom: '12px' }}>
                  Leilões que maximizam resultado
                </h3>
                <ul style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.5', margin: '8px 0', paddingLeft: '20px' }}>
                  <li><strong>Ascendente:</strong> para resíduos com valor de mercado</li>
                  <li><strong>Descendente:</strong> para passivos ambientais</li>
                  <li><strong>Reverso de frete:</strong> para contratar transporte</li>
                </ul>
                <p style={{ color: 'var(--primary-500)', fontSize: '0.9rem', fontWeight: 'bold', marginTop: '12px' }}>
                  Seu resíduo sai pelo melhor preço. Seu frete entra pelo menor custo.
                </p>
              </div>

              {/* Card 3 */}
              <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '2rem', color: 'var(--primary-500)', fontWeight: 'bold', marginBottom: '12px' }}>03</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', marginBottom: '12px' }}>
                  Buscador de Licenças e PGRS
                </h3>
                <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  Consulte qualquer empresa por nome ou CNPJ e acesse na hora a licença ambiental vigente, o PGRS e a avaliação pública. Due diligence real, antes de fechar.
                </p>
              </div>

              {/* Card 4 */}
              <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '2rem', color: 'var(--primary-500)', fontWeight: 'bold', marginBottom: '12px' }}>04</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', marginBottom: '12px' }}>
                  Audit Trail completo e privado
                </h3>
                <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  Geramos o histórico integral de cada transação: valores, quantidades, MTR, CDF e avaliações trilaterais. É a prova auditável da sua conformidade, pronta para auditorias e órgãos fiscalizadores.
                </p>
              </div>

              {/* Card 5 */}
              <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', padding: '24px' }}>
                <div style={{ fontSize: '2rem', color: 'var(--primary-500)', fontWeight: 'bold', marginBottom: '12px' }}>05</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', marginBottom: '12px' }}>
                  Selos de compliance no seu perfil
                </h3>
                <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  Exiba seus selos de documentação e operação na sua ficha pública. Empresas verificadas têm prioridade nas buscas, mais visibilidade e fecham mais rápido.
                </p>
              </div>

            </div>

            {/* CALL TO ACTION FINAL */}
            <div style={{ background: 'linear-gradient(135deg, #1c1c1c 0%, #0a0a0a 100%)', border: '1px solid var(--primary-500)', borderRadius: '16px', padding: '40px' }}>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
                Segurança jurídica para quem opera resíduo no Brasil
              </h3>
              <p style={{ color: '#ccc', fontSize: '1rem', lineHeight: '1.5', maxWidth: '750px', margin: '0 auto 24px' }}>
                A Materra Elo não é um classificado. É infraestrutura de confiança para um mercado regulado. Negocie apenas com empresas verificadas. Tenha rastreabilidade total. Opere em conformidade.
              </p>
              <Link href="/auth/cadastro?role=usuario" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem', color: '#000', fontWeight: 'bold', borderRadius: '8px' }}>
                Começar agora. É gratuito
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* STOCK TICKER MARQUEE */}
      <div style={{ background: '#000', padding: '10px 0', borderBottom: '1px solid #222' }}>
        
        {/* ROW 1: RESIDUOS */}
        <div className="ticker-container" style={{ borderBottom: '1px solid #111' }}>
          <Link href="/quotas" className="ticker-title" style={{ cursor: 'pointer', textDecoration: 'none', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Resíduos / Cotas</Link>
          <div className="ticker-wrap">
            <div className="ticker-content">
              {[1, 2].map((loopIdx) => (
                <div key={loopIdx} style={{ display: 'flex' }}>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Cobre (Metais)</span>
                    <span className="ticker-item-val">R$ 35.000 / t</span>
                    <span className="ticker-item-up">▲</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Alumínio (Metais)</span>
                    <span className="ticker-item-val">R$ 6.500 / t</span>
                    <span className="ticker-item-up">▲</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Latas de alumínio (Metais)</span>
                    <span className="ticker-item-val">R$ 5.500 / t</span>
                    <span className="ticker-item-up">▲</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Aço (Metais)</span>
                    <span className="ticker-item-val">R$ 600 / t</span>
                    <span className="ticker-item-up">▲</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Sucata ferrosa (Metais)</span>
                    <span className="ticker-item-val">R$ 634 / t</span>
                    <span className="ticker-item-up">▲</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">PP (Plásticos)</span>
                    <span className="ticker-item-val">R$ 2.500 / t</span>
                    <span className="ticker-item-up">▲</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">PET (Plásticos)</span>
                    <span className="ticker-item-val">R$ 1.900 / t</span>
                    <span className="ticker-item-up">▲</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">PEBD (Plásticos)</span>
                    <span className="ticker-item-val">R$ 1.800 / t</span>
                    <span className="ticker-item-up">▲</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">EPS isopor (Plásticos)</span>
                    <span className="ticker-item-val">R$ 1.500 / t</span>
                    <span className="ticker-item-up">▲</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Papelão ondulado (Papel/Papelão)</span>
                    <span className="ticker-item-val">R$ 600 / t</span>
                    <span className="ticker-item-up">▲</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Embalagem longa vida (Papel/Papelão)</span>
                    <span className="ticker-item-val">R$ 500 / t</span>
                    <span className="ticker-item-up">▲</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Caco de vidro (Vidro)</span>
                    <span className="ticker-item-val">R$ 120 / t</span>
                    <span className="ticker-item-up">▲</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Resíduo de abatedouro (Orgânicos)</span>
                    <span className="ticker-item-val">R$ 150 / t</span>
                    <span className="ticker-item-up">▲</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Bagaço (Orgânicos)</span>
                    <span className="ticker-item-val">R$ 50 / t</span>
                    <span className="ticker-item-up">▲</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Torta de filtro (Fertilizante)</span>
                    <span className="ticker-item-val">R$ 60 / t</span>
                    <span className="ticker-item-up">▲</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Cama de frango (Fertilizante)</span>
                    <span className="ticker-item-val">R$ 70 / t</span>
                    <span className="ticker-item-up">▲</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Vinhaça (Fertilizante)</span>
                    <span className="ticker-item-val">R$ 0 / m³ (doação/troca)</span>
                    <span className="ticker-item-up">▲</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Pallets (Madeira)</span>
                    <span className="ticker-item-val">R$ 0 / un (doação/troca)</span>
                    <span className="ticker-item-up">▲</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Pneus inservíveis (Borracha)</span>
                    <span className="ticker-item-val">R$ 0 / un (coleta)</span>
                    <span className="ticker-item-up">▲</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Óleo lubrificante (Óleos/graxas)</span>
                    <span className="ticker-item-val">R$ 0 / m³ (coleta)</span>
                    <span className="ticker-item-up">▲</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Lodo de ETE (Lodos)</span>
                    <span className="ticker-item-val">-R$ 200 / t (paga p/ destinar)</span>
                    <span className="ticker-item-down">▼</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Lodo industrial (Lodos)</span>
                    <span className="ticker-item-val">-R$ 350 / t (paga p/ destinar)</span>
                    <span className="ticker-item-down">▼</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Cinzas de caldeira (Outros)</span>
                    <span className="ticker-item-val">-R$ 100 / t (paga p/ destinar)</span>
                    <span className="ticker-item-down">▼</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Resíduo Classe II (Outros)</span>
                    <span className="ticker-item-val">-R$ 190 / t (paga p/ destinar)</span>
                    <span className="ticker-item-down">▼</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Tintas e borras (Químicos)</span>
                    <span className="ticker-item-val">-R$ 1.200 / t (paga p/ destinar)</span>
                    <span className="ticker-item-down">▼</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Produtos fora de especificação</span>
                    <span className="ticker-item-val">-R$ 900 / t (paga p/ destinar)</span>
                    <span className="ticker-item-down">▼</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Reagentes vencidos</span>
                    <span className="ticker-item-val">-R$ 5 / kg (paga p/ destinar)</span>
                    <span className="ticker-item-down">▼</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Resíduo de saúde RSS</span>
                    <span className="ticker-item-val">-R$ 4 / kg (paga p/ destinar)</span>
                    <span className="ticker-item-down">▼</span>
                  </div>
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
                  <div className="ticker-item">
                    <span className="ticker-item-name">Carga Geral (2 eixos)</span>
                    <span className="ticker-item-val">R$ 4,00</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Carga Geral (3 eixos)</span>
                    <span className="ticker-item-val">R$ 5,13</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Carga Geral (4 eixos)</span>
                    <span className="ticker-item-val">R$ 5,82</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Carga Geral (5 eixos)</span>
                    <span className="ticker-item-val">R$ 6,71</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Carga Geral (6 eixos)</span>
                    <span className="ticker-item-val">R$ 7,41</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Carga Geral (7 eixos)</span>
                    <span className="ticker-item-val">R$ 8,13</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Carga Geral (9 eixos)</span>
                    <span className="ticker-item-val">R$ 9,25</span>
                  </div>
                  <div className="ticker-item" style={{ borderRight: '2px solid #333', paddingRight: '20px' }}>
                    <span className="ticker-item-name">Média Geral</span>
                    <span className="ticker-item-val">R$ 6,64</span>
                  </div>

                  <div className="ticker-item">
                    <span className="ticker-item-name">Perigosa Geral (2 eixos)</span>
                    <span className="ticker-item-val">R$ 4,36</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Perigosa Geral (3 eixos)</span>
                    <span className="ticker-item-val">R$ 5,50</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Perigosa Geral (4 eixos)</span>
                    <span className="ticker-item-val">R$ 6,22</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Perigosa Geral (5 eixos)</span>
                    <span className="ticker-item-val">R$ 7,12</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Perigosa Geral (6 eixos)</span>
                    <span className="ticker-item-val">R$ 7,82</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Perigosa Geral (7 eixos)</span>
                    <span className="ticker-item-val">R$ 8,55</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Perigosa Geral (9 eixos)</span>
                    <span className="ticker-item-val">R$ 9,68</span>
                  </div>
                  <div className="ticker-item" style={{ borderRight: '2px solid #333', paddingRight: '20px' }}>
                    <span className="ticker-item-name">Média Perigosa</span>
                    <span className="ticker-item-val">R$ 7,04</span>
                  </div>

                  <div className="ticker-item">
                    <span className="ticker-item-name">Perigosa Granel Líquido (2 eixos)</span>
                    <span className="ticker-item-val">R$ 4,86</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Perigosa Granel Líquido (3 eixos)</span>
                    <span className="ticker-item-val">R$ 6,02</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Perigosa Granel Líquido (4 eixos)</span>
                    <span className="ticker-item-val">R$ 6,76</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Perigosa Granel Líquido (5 eixos)</span>
                    <span className="ticker-item-val">R$ 7,67</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Perigosa Granel Líquido (6 eixos)</span>
                    <span className="ticker-item-val">R$ 8,38</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Perigosa Granel Líquido (7 eixos)</span>
                    <span className="ticker-item-val">R$ 9,01</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Perigosa Granel Líquido (9 eixos)</span>
                    <span className="ticker-item-val">R$ 10,21</span>
                  </div>
                  <div className="ticker-item">
                    <span className="ticker-item-name">Média Granel</span>
                    <span className="ticker-item-val">R$ 7,38</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* MAIN VITRINE CONTAINER */}
      {(!profile || profile.tipo_parte !== 'Transportadora') && (
        <div style={{ background: '#000', padding: '30px 20px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            
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
                  }} style={{ background: 'none', border: 'none', color: '#ff5353', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>
                    Limpar
                  </button>
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
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
                    { label: 'Plásticos', value: 'PLÁSTICOS' },
                    { label: 'Metais Ferrosos', value: 'METAIS FERROSOS' },
                    { label: 'Metais Não Ferrosos', value: 'METAIS NÃO FERROSOS' },
                    { label: 'Papel e Papelão', value: 'PAPEL E PAPELÃO' },
                    { label: 'Coprodutos / Siderurgia', value: 'CO-PRODUTOS DE SIDERURGIA' }
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

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ color: '#aaa', fontSize: '0.9rem' }}>
                    Filtrados: <strong>{filteredListings.length}</strong> anúncios ativos
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {filteredListings.map(item => {
                      const deviation = item.percentual_desvio ? `${item.percentual_desvio}` : null
                      const advertiserSeal = item.cadastros?.nivel_selo || 'Bronze'
                      const isArrematado = item.status === 'Arrematado'

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleListingClick(item)}
                          style={{
                            background: '#121212',
                            border: '1px solid #222',
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
                            e.currentTarget.style.borderColor = '#222'
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
                                  <HeartIcon filled={favorites.some(f => f.id === item.id)} />
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
                            
                            <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '12px' }}>
                              Qtd: <strong>{item.quantidade} {item.unidade}</strong> • Freq: {item.frequencia} • {(() => {
                                const isOwner = user?.id === item.id_cadastro
                                if (isOwner) {
                                  return `UF: ${item.uf}`
                                }
                                const distance = getDistanceBetweenCeps(profile?.cep || '74000-000', item.cep || '75000-000')
                                return `Disponível a ~${distance} km de você`
                              })()}
                            </p>

                            {(item.tipo_leilao === 'Ascendente' || item.tipo_leilao === 'Descendente') && (() => {
                              const auctionStatus = getAuctionStatus(item);
                              return (
                                <div style={{
                                  background: 'rgba(255, 179, 0, 0.05)',
                                  border: '1px dashed rgba(255, 179, 0, 0.3)',
                                  padding: '8px 12px',
                                  borderRadius: '6px',
                                  marginTop: '8px',
                                  marginBottom: '8px',
                                  fontSize: '0.8rem',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}>
                                  <span style={{ color: 'var(--primary-500)', fontWeight: 'bold' }}>
                                    {auctionStatus.statusText}
                                  </span>
                                  <span style={{ color: '#888', fontSize: '0.7rem' }}>
                                    {item.visualizacoes || 0} visualizações
                                  </span>
                                </div>
                              )
                            })()}

                            {item.urgencia_admin && (
                              <div style={{
                                background: '#b71c1c',
                                color: '#fff',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                marginTop: '4px',
                                marginBottom: '10px',
                                display: 'inline-block',
                                letterSpacing: '0.5px',
                                border: '1px solid #ff5252',
                                textTransform: 'uppercase'
                              }}>
                                URGENTE: {item.urgencia_admin}
                              </div>
                            )}

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

                          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #222', paddingTop: '10px', marginTop: '10px' }}>
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
              </main>
            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ background: '#050505', borderTop: '1px solid #111', padding: '30px 20px', textAlign: 'center', marginTop: 'auto' }}>
        <p style={{ color: '#555', fontSize: '0.8rem', margin: 0 }}>
          &copy; 2026 Materra Elo Recursos - B2B Waste Platform Concierge. Todos os direitos reservados.
        </p>
        <div style={{ marginTop: '12px' }}>
          {!user && (
            <Link href="/admin" style={{ color: '#888', fontSize: '0.8rem', textDecoration: 'underline' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-500)'} onMouseLeave={(e) => e.currentTarget.style.color = '#888'}>
              Painel de Profissionais Materra (Acesso Restrito)
            </Link>
          )}
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
            <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '12px' }}>Recurso do Plano ProAtiva</h3>
            <p style={{ color: '#aaa', fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.5' }}>
              {paywallModal}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/planos" onClick={() => setPaywallModal(null)} className="btn btn-primary" style={{ color: '#000', fontWeight: 'bold' }}>
                Conhecer o Plano ProAtiva (R$35/mês)
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
                <p style={{ color: '#fff', margin: '2px 0 10px' }}>{selectedListing.quantidade} {selectedListing.unidade} ({selectedListing.frequencia})</p>
                
                <strong style={{ color: '#aaa' }}>Classe / Estado Físico:</strong>
                <p style={{ color: '#fff', margin: '2px 0 10px' }}>Classe {selectedListing.classe} • {selectedListing.estado_fisico || 'N/A'}</p>
                
                <strong style={{ color: '#aaa' }}>Acondicionamento:</strong>
                <p style={{ color: '#fff', margin: '2px 0 10px' }}>{selectedListing.acondicionamento}</p>
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

            {(selectedListing.tipo_leilao === 'Ascendente' || selectedListing.tipo_leilao === 'Descendente') && (() => {
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
                  border: '1px solid var(--primary-500)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px',
                  color: '#fff'
                }}>
                  <h4 style={{ color: 'var(--primary-500)', fontSize: '1rem', fontWeight: 'bold', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
                    Informações do Leilão
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#888', display: 'block' }}>Status:</span>
                      <strong style={{ fontSize: '1rem', color: '#fff' }}>{auctionStatus.statusText}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#888', display: 'block' }}>Visualizações:</span>
                      <strong style={{ fontSize: '1rem', color: '#fff' }}>{selectedListing.visualizacoes || 0} visualizações</strong>
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

    </div>
  )
}
