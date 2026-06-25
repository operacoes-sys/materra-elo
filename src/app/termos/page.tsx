import Link from "next/link";

export const metadata = {
  title: "Termos de Uso e Política de Privacidade | Materra Elo",
  description:
    "Termos de Uso e Política de Privacidade (LGPD) da Materra Elo — Plataforma B2B de Resíduos Industriais. Versão 1.0, junho de 2025.",
};

export default function TermosPage() {
  return (
    <>
      <style>{`
        .termos-body {
          background: #000;
          color: #ccc;
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
        }
        .termos-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(0,0,0,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 0 2rem;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .termos-logo {
          font-size: 1.15rem;
          font-weight: 700;
          color: #FFD700;
          letter-spacing: 0.04em;
          text-decoration: none;
        }
        .termos-nav-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .termos-nav-link {
          color: #888;
          font-size: 0.85rem;
          text-decoration: none;
          transition: color 0.2s;
        }
        .termos-nav-link:hover {
          color: #FFD700;
        }
        .termos-main {
          max-width: 900px;
          margin: 0 auto;
          padding: 3rem 2rem 5rem;
        }
        .termos-header {
          text-align: center;
          margin-bottom: 3rem;
          padding-bottom: 2.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .termos-header-badge {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #FFD700;
          background: rgba(255,215,0,0.08);
          border: 1px solid rgba(255,215,0,0.2);
          border-radius: 99px;
          padding: 0.35rem 1rem;
          margin-bottom: 1.25rem;
        }
        .termos-header h1 {
          font-size: 2rem;
          font-weight: 800;
          color: #fff;
          margin: 0 0 0.5rem;
          line-height: 1.2;
        }
        .termos-header-sub {
          font-size: 1rem;
          color: #FFD700;
          font-weight: 500;
          margin: 0 0 0.75rem;
        }
        .termos-header-meta {
          font-size: 0.82rem;
          color: #888;
        }
        .btn-gold {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #FFD700;
          color: #000;
          font-weight: 700;
          font-size: 0.88rem;
          padding: 0.65rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.2s, transform 0.15s;
          letter-spacing: 0.02em;
        }
        .btn-gold:hover {
          background: #ffe033;
          transform: translateY(-1px);
        }
        .termos-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        .termos-actions-bottom {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .parte-block {
          background: #0a0a0a;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 2.5rem;
          margin-bottom: 2rem;
        }
        .parte-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #FFD700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin: 0 0 0.4rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .parte-title-desc {
          font-size: 1.05rem;
          font-weight: 600;
          color: #fff;
          margin: 0 0 1.75rem;
        }
        .clause {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .clause:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .clause-title {
          font-size: 1rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 1rem;
          display: flex;
          align-items: baseline;
          gap: 0.6rem;
        }
        .clause-num {
          color: #FFD700;
          font-weight: 800;
          font-size: 1rem;
          flex-shrink: 0;
        }
        .clause-sub {
          font-size: 0.875rem;
          color: #FFD700;
          font-weight: 700;
          margin: 0.9rem 0 0.35rem;
        }
        .clause p, .clause-item {
          font-size: 0.92rem;
          color: #ccc;
          line-height: 1.75;
          margin: 0 0 0.6rem;
        }
        .clause ul {
          list-style: none;
          padding: 0;
          margin: 0.5rem 0;
        }
        .clause ul li {
          font-size: 0.92rem;
          color: #ccc;
          line-height: 1.75;
          padding: 0.2rem 0 0.2rem 1.3rem;
          position: relative;
        }
        .clause ul li::before {
          content: '—';
          position: absolute;
          left: 0;
          color: #FFD700;
          font-weight: 700;
        }
        .def-grid {
          display: grid;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }
        .def-item {
          display: grid;
          grid-template-columns: max-content 1fr;
          gap: 0.5rem 1rem;
          font-size: 0.9rem;
          line-height: 1.65;
          padding: 0.4rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          align-items: baseline;
        }
        .def-item:last-child { border-bottom: none; }
        .def-term {
          color: #FFD700;
          font-weight: 700;
          white-space: nowrap;
        }
        .def-desc {
          color: #ccc;
        }
        .warning-block {
          background: rgba(255,215,0,0.04);
          border: 1px solid rgba(255,215,0,0.15);
          border-radius: 10px;
          padding: 1.25rem 1.5rem;
          margin: 0.75rem 0;
        }
        .warning-block p {
          margin: 0;
          font-size: 0.9rem;
          color: #e0c060;
          line-height: 1.7;
        }
        .termos-footer {
          text-align: center;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255,255,255,0.07);
          font-size: 0.82rem;
          color: #888;
        }
        @media print {
          .termos-nav, .btn-gold, .termos-actions, .termos-actions-bottom { display: none !important; }
          .termos-main { padding: 1rem; }
          .parte-block { background: #fff; border: 1px solid #ddd; color: #000; border-radius: 0; }
          .clause p, .clause ul li, .def-desc, .clause-item { color: #222; }
          .clause-num, .def-term, .parte-title { color: #996600; }
          .termos-body { background: #fff; }
        }
        @media (max-width: 640px) {
          .termos-main { padding: 1.5rem 1rem 4rem; }
          .parte-block { padding: 1.5rem 1.25rem; }
          .termos-header h1 { font-size: 1.4rem; }
          .def-item { grid-template-columns: 1fr; gap: 0; }
        }
      `}</style>

      <div className="termos-body">
        {/* NAV */}
        <nav className="termos-nav">
          <Link href="/" className="termos-logo">MATERRA ELO</Link>
          <div className="termos-nav-links">
            <Link href="/" className="termos-nav-link">← Início</Link>
            <Link href="/auth/cadastro" className="termos-nav-link">Cadastro</Link>
          </div>
        </nav>

        <main className="termos-main">
          {/* HEADER */}
          <div className="termos-header">
            <div className="termos-header-badge">Documento Legal</div>
            <h1>Termos de Uso &amp; Política de Privacidade</h1>
            <p className="termos-header-sub">Materra Elo — Plataforma de Resíduos Industriais</p>
            <p className="termos-header-meta">Versão 1.0 · Goiânia, junho de 2025 · LP Soluções (Materra Elo)</p>
          </div>

          {/* TOP ACTION */}
          <div className="termos-actions">
            <Link href="/auth/cadastro" className="btn-gold">
              ← Voltar ao cadastro
            </Link>
          </div>

          {/* ═══════════════════ PARTE A ═══════════════════ */}
          <div className="parte-block" id="parte-a">
            <div className="parte-title">
              <span>PARTE A</span>
            </div>
            <div className="parte-title-desc">Termos de Uso</div>

            {/* 1 */}
            <div className="clause" id="clausula-1">
              <div className="clause-title">
                <span className="clause-num">1.</span> Definições
              </div>
              <div className="def-grid">
                {[
                  ['"Plataforma"', 'o ambiente digital da Materra Elo acessado via navegador ou aplicativo.'],
                  ['"Usuário"', 'toda pessoa física ou jurídica que se cadastrar e operar na Plataforma.'],
                  ['"Fornecedor"', 'Usuário que anuncia resíduos, subprodutos ou coprodutos disponíveis.'],
                  ['"Comprador"', 'Usuário que demanda resíduos, subprodutos ou coprodutos.'],
                  ['"Transportadora"', 'Usuário habilitado a cotar e executar o transporte de resíduos.'],
                  ['"Controlador" (ou Representante Empresarial)', 'intermediário ou consultor que opera em nome de empresas representadas.'],
                  ['"Operação"', 'conjunto de atos desde o anúncio até o fechamento do negócio na Plataforma.'],
                  ['"Índice Materra"', 'preço de referência de mercado calculado e publicado periodicamente pela Plataforma.'],
                  ['"Ficha Materra"', 'perfil público e anônimo de cada Usuário, exibindo selos, score e histórico.'],
                  ['"Score"', 'pontuação de 0 a 100 atribuída pela Plataforma a cada Usuário com base em histórico.'],
                  ['"Selos"', 'classificações de desempenho e conformidade: Bronze, Prata e Ouro.'],
                  ['"Audit Trail"', 'registro imutável e encadeado de todos os atos praticados na Plataforma.'],
                  ['"Taxa Lead"', 'valor cobrado para liberação de contato bilateral entre as partes após arremate.'],
                  ['"MTR"', 'Manifesto de Transporte de Resíduos exigido pela legislação ambiental.'],
                  ['"CDF"', 'Certificado de Destinação Final.'],
                ].map(([term, desc]) => (
                  <div key={String(term)} className="def-item">
                    <span className="def-term">{term}</span>
                    <span className="def-desc">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2 */}
            <div className="clause" id="clausula-2">
              <div className="clause-title"><span className="clause-num">2.</span> Aceite e vinculação</div>
              <p className="clause-sub">2.1.</p>
              <p>Ao criar conta, o Usuário aceita integralmente estes Termos, incluindo a Política de Privacidade (Parte B), a Tabela de Preços e as demais regras publicadas na Plataforma, que formam parte integrante deste instrumento.</p>
              <p className="clause-sub">2.2.</p>
              <p>Se o Usuário for pessoa jurídica, a pessoa física que realizar o cadastro declara ter poderes para representá-la e vinculá-la.</p>
            </div>

            {/* 3 */}
            <div className="clause" id="clausula-3">
              <div className="clause-title"><span className="clause-num">3.</span> Cadastro e acesso</div>
              <p className="clause-sub">3.1.</p>
              <p>Para usar a Plataforma, o Usuário deve fornecer informações verdadeiras, completas e atualizadas. O cadastro é pessoal e intransferível.</p>
              <p className="clause-sub">3.2.</p>
              <p>A Materra Elo poderá, a qualquer tempo e a seu critério, verificar, suspender ou cancelar cadastros com informações incorretas, incompletas ou suspeitas de fraude, sem necessidade de aviso prévio.</p>
              <p className="clause-sub">3.3.</p>
              <p>O Usuário é responsável por manter a confidencialidade de suas credenciais de acesso.</p>
            </div>

            {/* 4 */}
            <div className="clause" id="clausula-4">
              <div className="clause-title"><span className="clause-num">4.</span> Modelo de negócio e remuneração</div>
              <p className="clause-sub">4.1.</p>
              <p>A Materra Elo cobra Assinatura e/ou Taxa Lead conforme plano contratado, detalhados na Tabela de Preços.</p>
              <p className="clause-sub">4.2.</p>
              <p>As transações comerciais (compra, venda, transporte) ocorrem direta e exclusivamente entre os Usuários. A Materra Elo não é parte das Operações, não recebe valores de nenhuma Operação e não processa pagamentos entre Usuários.</p>
              <p className="clause-sub">4.3.</p>
              <p>A Taxa Lead é cobrada no momento da liberação do contato bilateral entre as partes após o arremate, independentemente de as partes virem a fechar negócio fora da Plataforma.</p>
            </div>

            {/* 5 */}
            <div className="clause" id="clausula-5">
              <div className="clause-title"><span className="clause-num">5.</span> Leilões</div>
              <p className="clause-sub">5.1.</p>
              <p>A Plataforma oferece leilões ascendente (para resíduos com valor positivo), descendente (para resíduos passivos) e reverso de frete. Os parâmetros de duração, incremento e regra anti-snipe (prorrogação automática de 2 minutos quando há lance nos últimos 2 minutos) são definidos pela Materra Elo.</p>
              <p className="clause-sub">5.2.</p>
              <p>O arremate gera obrigação de pagamento da Taxa Lead. O negócio em si é celebrado diretamente entre as partes, fora da Plataforma.</p>
              <p className="clause-sub">5.3.</p>
              <p>A Materra Elo não garante o cumprimento do valor arrematado ou das condições negociadas pelas partes.</p>
            </div>

            {/* 6 */}
            <div className="clause" id="clausula-6">
              <div className="clause-title"><span className="clause-num">6.</span> Limitação de responsabilidade</div>
              <p className="clause-sub">6.1.</p>
              <p>A Materra Elo é exclusivamente uma plataforma tecnológica de intermediação. Não é geradora, transportadora ou destinadora de resíduos e não integra a cadeia de responsabilidade prevista na PNRS.</p>
              <p className="clause-sub">6.2.</p>
              <div className="warning-block">
                <p>A Materra Elo NÃO é geradora, transportadora ou destinadora de resíduos. Não detém, manuseia, transporta, armazena ou destina qualquer resíduo ou subproduto. Em consequência, não integra a cadeia de responsabilidade prevista no artigo 25 da Política Nacional de Resíduos Sólidos (Lei 12.305/2010, PNRS), nem compõe a chamada responsabilidade solidária estabelecida pelo artigo 27, §§ 1º e 2º da PNRS.</p>
              </div>
              <p className="clause-sub">6.3.</p>
              <p>A Materra Elo NÃO se responsabiliza por:</p>
              <ul>
                <li>emissão, validade, veracidade ou cumprimento de MTR, CDF, CT-e, Licença Ambiental, CADRI ou qualquer outro documento ambiental ou regulatório;</li>
                <li>destinação inadequada, despejo irregular, contaminação ambiental ou dano ecológico;</li>
                <li>divergências de peso, qualidade, classe ou composição do resíduo;</li>
                <li>atrasos, perdas, avarias ou acidentes no transporte;</li>
                <li>inadimplência de uma parte perante a outra;</li>
                <li>descumprimento contratual ou tributário das partes entre si.</li>
              </ul>
              <p className="clause-sub">6.4.</p>
              <p>A Materra Elo não confere, por meio de seus selos (Bronze, Prata, Ouro), Score e Audit Trail, garantia de qualidade, regularidade ambiental, capacidade técnica ou solvência dos Usuários.</p>
              <p className="clause-sub">6.5.</p>
              <p>A Materra Elo, seus sócios, administradores, prepostos e prestadores de serviço não responderão, em nenhuma hipótese, por danos diretos, indiretos, emergentes, lucros cessantes, danos morais, ambientais, à imagem ou reputacionais que decorram das Operações ou da utilização da Plataforma.</p>
              <p className="clause-sub">6.6.</p>
              <p>Caso a Materra Elo seja eventualmente acionada judicial ou administrativamente em razão de Operação realizada entre os Usuários, o Usuário causador do dano fica obrigado, desde já, a defendê-la, indenizá-la e mantê-la integralmente indene de quaisquer condenações, custas, honorários, despesas e prejuízos.</p>
            </div>

            {/* 6-A */}
            <div className="clause" id="clausula-6a">
              <div className="clause-title"><span className="clause-num">6-A.</span> Leilões e Transportadora — ausência de garantia</div>
              <p>Os leilões ascendente, descendente e reverso de frete são ferramentas de descoberta de preço e de seleção de contraparte. NÃO constituem contrato entre os Usuários e a Materra Elo, nem geram qualquer obrigação financeira ou operacional para a Plataforma.</p>
              <p className="clause-sub">6-A.1.</p>
              <p>O resultado do leilão é apenas indicação de melhor proposta. A formalização do negócio depende exclusivamente da vontade das partes.</p>
              <p className="clause-sub">6-A.2.</p>
              <p>A Materra Elo NÃO garante que o valor arrematado será efetivamente pago, que o resíduo será entregue, retirado ou recebido, nem que as quantidades, classe ou qualidade declaradas serão cumpridas.</p>
              <p className="clause-sub">6-A.3.</p>
              <p>A Materra Elo NÃO se responsabiliza pelo serviço prestado pela transportadora, pela regularidade da frota, cumprimento de rota e prazo, emissão de CT-e, cumprimento de obrigações regulatórias (ANTT, MOPP, RNTRC, CIPP, CIV), existência ou cobertura de apólice de seguro, conduta do motorista, perdas, avarias, atrasos, extravios, contaminação durante o transporte ou acidentes ambientais.</p>
            </div>

            {/* 6-B */}
            <div className="clause" id="clausula-6b">
              <div className="clause-title"><span className="clause-num">6-B.</span> Declarações expressas de não responsabilidade</div>
              <p className="clause-sub">6-B.1.</p>
              <p><strong style={{color:'#fff'}}>Não garantimos que o anúncio é real.</strong> A veracidade do anúncio é responsabilidade exclusiva do anunciante, sob as penas da lei.</p>
              <p className="clause-sub">6-B.2.</p>
              <p><strong style={{color:'#fff'}}>Não garantimos resultado após pagamento da Taxa Lead.</strong> O pagamento da Taxa Lead libera contato bilateral. A Taxa Lead não é devolvida em nenhuma hipótese, ainda que o negócio não se concretize.</p>
              <p className="clause-sub">6-B.3.</p>
              <p><strong style={{color:'#fff'}}>A Audit Trail é apenas o registro do que você fez e declarou de boa-fé.</strong> Não atesta veracidade dos fatos declarados, não substitui MTR, CDF, laudo técnico ou perícia.</p>
              <p className="clause-sub">6-B.4.</p>
              <p><strong style={{color:'#fff'}}>Selos e Score não tiram a sua responsabilidade.</strong> Cabe ao Usuário verificar, por seus próprios meios, a idoneidade, capacidade técnica e regularidade documental de quem ele negocia.</p>
              <p className="clause-sub">6-B.5.</p>
              <p><strong style={{color:'#fff'}}>Não somos responsáveis pelo frete.</strong> O contrato de transporte é firmado direta e exclusivamente entre as partes, fora da Plataforma.</p>
              <p className="clause-sub">6-B.6.</p>
              <p><strong style={{color:'#fff'}}>Não somos responsáveis por inadimplência entre as partes.</strong> Qualquer disputa financeira entre Fornecedor, Comprador e Transportadora é resolvida diretamente entre elas, sem participação da Materra Elo.</p>
            </div>

            {/* 7 */}
            <div className="clause" id="clausula-7">
              <div className="clause-title"><span className="clause-num">7.</span> Responsabilidade do Usuário</div>
              <p className="clause-sub">7.1.</p>
              <p>O Usuário declara e garante, sob as penas da lei, que:</p>
              <ul>
                <li>possui plena capacidade jurídica;</li>
                <li>cumpre toda a legislação ambiental, fiscal, trabalhista e de transporte aplicável;</li>
                <li>os resíduos, subprodutos ou coprodutos oferecidos ou demandados são verdadeiros, legais e disponíveis;</li>
                <li>está em dia com MTR, CDF e demais documentos exigidos pelos órgãos ambientais;</li>
                <li>responde isoladamente pela conformidade ambiental, regulatória, fiscal e contratual das Operações.</li>
              </ul>
              <p className="clause-sub">7.2.</p>
              <p>O Usuário é o único responsável pela emissão e veracidade dos documentos fiscais e ambientais relativos às Operações, bem como pelo pagamento de tributos incidentes sobre elas.</p>
            </div>

            {/* 8 */}
            <div className="clause" id="clausula-8">
              <div className="clause-title"><span className="clause-num">8.</span> PNRS, responsabilidade solidária e boa-fé</div>
              <p className="clause-sub">8.1.</p>
              <p>A Materra Elo registra, na Audit Trail, todas as ações praticadas pelos Usuários, com hash em cadeia e selo temporal, sob princípio de imutabilidade.</p>
              <p className="clause-sub">8.2.</p>
              <p>A Materra Elo opera sob presunção de boa-fé dos Usuários. Não cabe à Plataforma fiscalizar ou auditar a regularidade ambiental real das Operações.</p>
              <p className="clause-sub">8.3.</p>
              <p>A responsabilidade solidária prevista no artigo 27 da PNRS recai sobre geradores, transportadores e destinadores efetivos do resíduo. A Materra Elo, por não exercer nenhuma dessas atividades, está dela excluída.</p>
            </div>

            {/* 9 */}
            <div className="clause" id="clausula-9">
              <div className="clause-title"><span className="clause-num">9.</span> Disputas entre as partes</div>
              <p className="clause-sub">9.1.</p>
              <p>Divergências entre Usuários decorrentes de Operação devem ser resolvidas diretamente entre as partes.</p>
              <p className="clause-sub">9.2.</p>
              <p>A Materra Elo não atua como mediadora, árbitra ou conciliadora em disputas comerciais. Por cortesia operacional, poderá fornecer extratos da Audit Trail sem que isso signifique tomada de posição.</p>
              <p className="clause-sub">9.3.</p>
              <p>Quando configurada má-fé comprovada, a Materra Elo poderá registrar Ocorrência Grave no Score do Usuário infrator e aplicar as medidas da cláusula 11.</p>
            </div>

            {/* 10 */}
            <div className="clause" id="clausula-10">
              <div className="clause-title"><span className="clause-num">10.</span> Condutas vedadas</div>
              <p>Constituem infração contratual:</p>
              <ul>
                <li>informações falsas ou alteração de documentos;</li>
                <li>tentar contornar a Taxa Lead por desintermediação;</li>
                <li>anunciar resíduo ou serviço inexistente ou ilegal;</li>
                <li>usar a Plataforma para fins ilícitos;</li>
                <li>tentar acessar vulnerabilidades do sistema;</li>
                <li>compartilhar credenciais ou criar múltiplas contas para o mesmo CNPJ;</li>
                <li>descumprir reiteradamente a obrigação de emitir MTR ou CDF;</li>
                <li>usar a Plataforma para destinação irregular de resíduo perigoso.</li>
              </ul>
            </div>

            {/* 11 */}
            <div className="clause" id="clausula-11">
              <div className="clause-title"><span className="clause-num">11.</span> Suspensão, exclusão e penalizações</div>
              <p className="clause-sub">11.1.</p>
              <p>Constatada qualquer infração, a Materra Elo poderá:</p>
              <ul>
                <li>bloquear o Usuário;</li>
                <li>suspender o acesso e os anúncios;</li>
                <li>rebaixar selo e Score;</li>
                <li>registrar Ocorrência Grave na Audit Trail;</li>
                <li>excluir o Usuário, com perda de saldo, planos e direitos correlatos;</li>
                <li>reportar a conduta às autoridades competentes;</li>
                <li>cobrar judicialmente os valores devidos.</li>
              </ul>
            </div>

            {/* 12 */}
            <div className="clause" id="clausula-12">
              <div className="clause-title"><span className="clause-num">12.</span> Propriedade intelectual</div>
              <p className="clause-sub">12.1.</p>
              <p>A marca, o logotipo, a denominação Materra Elo, a arquitetura de informação, os fluxos, o catálogo padronizado, o método de score e selos, a Audit Trail e o software da Plataforma são de propriedade exclusiva da Materra Elo.</p>
              <p className="clause-sub">12.2.</p>
              <p>O Usuário concede à Materra Elo licença não exclusiva, gratuita e em âmbito mundial para tratar e exibir as informações e os documentos por ele submetidos, exclusivamente para fins de operação da Plataforma.</p>
            </div>

            {/* 13 */}
            <div className="clause" id="clausula-13">
              <div className="clause-title"><span className="clause-num">13.</span> Modificação e vigência</div>
              <p className="clause-sub">13.1.</p>
              <p>A Materra Elo poderá alterar estes Termos a qualquer tempo, mediante publicação da nova versão na Plataforma e notificação aos Usuários. A continuidade do uso após a publicação implica aceite tácito.</p>
              <p className="clause-sub">13.2.</p>
              <p>Estes Termos vigem por prazo indeterminado a partir da data de aceite pelo Usuário, registrada na Audit Trail.</p>
            </div>

            {/* 14 */}
            <div className="clause" id="clausula-14">
              <div className="clause-title"><span className="clause-num">14.</span> Foro e legislação aplicável</div>
              <p className="clause-sub">14.1.</p>
              <p>Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de Goiânia–GO.</p>
            </div>
          </div>

          {/* ═══════════════════ PARTE B ═══════════════════ */}
          <div className="parte-block" id="parte-b">
            <div className="parte-title">
              <span>PARTE B</span>
            </div>
            <div className="parte-title-desc">Política de Privacidade e LGPD</div>

            {/* B1 */}
            <div className="clause" id="b-clausula-1">
              <div className="clause-title"><span className="clause-num">1.</span> Quem somos</div>
              <p>A Materra Elo trata dados pessoais no contexto da prestação do serviço descrito nestes Termos. Esta Política regula o tratamento de dados pessoais pela LP Soluções (Materra Elo), atuando como Controladora, em conformidade com a Lei nº 13.709/2018 (LGPD).</p>
            </div>

            {/* B2 */}
            <div className="clause" id="b-clausula-2">
              <div className="clause-title"><span className="clause-num">2.</span> Definições</div>
              <div className="def-grid">
                {[
                  ['Dado pessoal', 'informação relacionada a pessoa natural identificada ou identificável.'],
                  ['Tratamento', 'qualquer operação realizada com dado pessoal.'],
                  ['Titular', 'pessoa natural a quem os dados se referem.'],
                  ['ANPD', 'Autoridade Nacional de Proteção de Dados.'],
                  ['Encarregado (DPO)', 'canal de comunicação entre Controlador, titulares e ANPD.'],
                ].map(([term, desc]) => (
                  <div key={String(term)} className="def-item">
                    <span className="def-term">{term}</span>
                    <span className="def-desc">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* B3 */}
            <div className="clause" id="b-clausula-3">
              <div className="clause-title"><span className="clause-num">3.</span> Quais dados coletamos</div>
              <p>Coletamos:</p>
              <ul>
                <li><strong style={{color:'#fff'}}>dados cadastrais:</strong> nome, CPF ou CNPJ, razão social, endereço, e-mail, WhatsApp;</li>
                <li><strong style={{color:'#fff'}}>dados de credenciais:</strong> senha em hash criptográfico;</li>
                <li><strong style={{color:'#fff'}}>dados de documentos:</strong> licenças, certificações, certidões;</li>
                <li><strong style={{color:'#fff'}}>dados de operação:</strong> anúncios, propostas, lances, contatos liberados, números de MTR e CDF, registros financeiros;</li>
                <li><strong style={{color:'#fff'}}>dados técnicos:</strong> IP, dispositivo, logs de acesso, registros de Audit Trail;</li>
                <li><strong style={{color:'#fff'}}>cookies</strong> conforme item 7.</li>
              </ul>
            </div>

            {/* B4 */}
            <div className="clause" id="b-clausula-4">
              <div className="clause-title"><span className="clause-num">4.</span> Bases legais para o tratamento</div>
              <p>Tratamos dados com fundamento em:</p>
              <ul>
                <li>execução de contrato (art. 7º, V);</li>
                <li>cumprimento de obrigação legal (art. 7º, II);</li>
                <li>exercício regular de direitos (art. 7º, VI);</li>
                <li>legítimo interesse para prevenção a fraude e segurança (art. 7º, IX);</li>
                <li>consentimento do titular, quando aplicável (art. 7º, I).</li>
              </ul>
            </div>

            {/* B5 */}
            <div className="clause" id="b-clausula-5">
              <div className="clause-title"><span className="clause-num">5.</span> Finalidades</div>
              <p>Os dados são tratados para:</p>
              <ul>
                <li>criação e manutenção da conta;</li>
                <li>verificação documental;</li>
                <li>cálculo de Score e geração da Audit Trail;</li>
                <li>publicação anônima de anúncios e exibição da Ficha Materra pública;</li>
                <li>comunicação transacional;</li>
                <li>emissão de Nota Fiscal de Serviço;</li>
                <li>cumprimento de obrigações legais;</li>
                <li>prevenção de fraude e abuso.</li>
              </ul>
            </div>

            {/* B6 */}
            <div className="clause" id="b-clausula-6">
              <div className="clause-title"><span className="clause-num">6.</span> Compartilhamento com terceiros</div>
              <p>Compartilhamos dados apenas com:</p>
              <ul>
                <li>prestadores de infraestrutura (Supabase, Vercel, provedores de e-mail e WhatsApp);</li>
                <li>gateway de pagamento (Asaas/Iugu);</li>
                <li>ferramentas de verificação documental (Brasil API, IBAMA, ANTT, SEFAZ, OCR);</li>
                <li>autoridades competentes mediante requisição legal;</li>
                <li>parceiros contratados sob obrigação de confidencialidade.</li>
              </ul>
              <div className="warning-block" style={{marginTop:'0.75rem'}}>
                <p>Em nenhuma hipótese vendemos dados pessoais.</p>
              </div>
            </div>

            {/* B7 */}
            <div className="clause" id="b-clausula-7">
              <div className="clause-title"><span className="clause-num">7.</span> Cookies</div>
              <p>Usamos cookies estritamente necessários ao funcionamento e cookies analíticos para mensurar uso. O Usuário pode gerenciar cookies nas configurações do navegador.</p>
            </div>

            {/* B8 */}
            <div className="clause" id="b-clausula-8">
              <div className="clause-title"><span className="clause-num">8.</span> Direitos do titular</div>
              <p>Nos termos do art. 18 da LGPD, o titular pode:</p>
              <ul>
                <li>confirmar a existência de tratamento;</li>
                <li>acessar os dados;</li>
                <li>corrigir dados incompletos ou inexatos;</li>
                <li>solicitar anonimização ou eliminação de dados tratados em desconformidade;</li>
                <li>portabilidade;</li>
                <li>revogar o consentimento.</li>
              </ul>
              <p style={{marginTop:'0.75rem'}}>Respondemos em até 15 dias.</p>
            </div>

            {/* B9 */}
            <div className="clause" id="b-clausula-9">
              <div className="clause-title"><span className="clause-num">9.</span> Segurança e armazenamento</div>
              <p>Aplicamos criptografia em trânsito (TLS) e em repouso quando aplicável, controle de acesso por função, logs de auditoria, hash em cadeia da Audit Trail e backup periódico. Conservamos os dados pelo tempo necessário ao cumprimento das finalidades e obrigações legais, especialmente obrigações fiscais (5 anos) e ambientais.</p>
            </div>

            {/* B10 */}
            <div className="clause" id="b-clausula-10">
              <div className="clause-title"><span className="clause-num">10.</span> Transferência internacional</div>
              <p>Eventuais transferências internacionais ocorrem apenas para prestadores essenciais, em países com grau adequado de proteção ou mediante cláusulas contratuais padrão (art. 33 da LGPD).</p>
            </div>

            {/* B11 */}
            <div className="clause" id="b-clausula-11">
              <div className="clause-title"><span className="clause-num">11.</span> Encarregado de Dados (DPO)</div>
              <p>Para exercer direitos, esclarecer dúvidas ou enviar reclamações: <a href="mailto:dpo@materraelo.com.br" style={{color:'#FFD700', textDecoration:'underline'}}>dpo@materraelo.com.br</a>. O titular também pode peticionar à Autoridade Nacional de Proteção de Dados (ANPD).</p>
            </div>

            {/* B12 */}
            <div className="clause" id="b-clausula-12">
              <div className="clause-title"><span className="clause-num">12.</span> Atualizações desta Política</div>
              <p>Esta Política poderá ser atualizada periodicamente. A versão vigente está sempre disponível na Plataforma, com indicação da data da última revisão. Alterações materiais serão comunicadas pelos canais cadastrados.</p>
            </div>
          </div>

          {/* BOTTOM ACTION */}
          <div className="termos-actions-bottom">
            <Link href="/auth/cadastro" className="btn-gold">
              ← Voltar ao cadastro
            </Link>
          </div>

          {/* FOOTER */}
          <div className="termos-footer">
            Versão 1.0 · Goiânia, junho de 2025 · LP Soluções (Materra Elo)<br />
            <span style={{marginTop:'0.4rem', display:'block'}}>
              Dúvidas? <a href="mailto:dpo@materraelo.com.br" style={{color:'#FFD700'}}>dpo@materraelo.com.br</a>
            </span>
          </div>
        </main>
      </div>
    </>
  );
}
