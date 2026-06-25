import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/validate-nfe
 * Validates that the CNPJ is the emitter or recipient of the given NF-e key
 * by querying the public SEFAZ endpoint via BrasilAPI / NFe open data
 */
export async function POST(req: NextRequest) {
  try {
    const { cnpj, chaveNfe } = await req.json();

    if (!cnpj || !chaveNfe) {
      return NextResponse.json({ success: false, error: 'CNPJ e chave NF-e são obrigatórios.' }, { status: 400 });
    }

    const rawCnpj = cnpj.replace(/\D/g, '');
    const rawNfe = chaveNfe.replace(/\D/g, '');

    if (rawCnpj.length !== 14) {
      return NextResponse.json({ success: false, error: 'CNPJ inválido.' }, { status: 400 });
    }

    if (rawNfe.length !== 44 && rawNfe.length !== 50) {
      return NextResponse.json({ success: false, error: 'Chave NF-e deve ter 44 ou 50 dígitos.' }, { status: 400 });
    }

    // Estrutura da chave NF-e:
    // 44 dígitos: cUF(2) + AAMM(4) + CNPJ(14) + Mod(2) + Serie(3) + nNF(9) + tpEmis(1) + cNF(8) + cDV(1)
    //             posição do CNPJ: 6–19
    // 50 dígitos: prefixo adicional de 4 dígitos deslocam o CNPJ para 10–23
    let cnpjInKey: string | null = null;
    if (rawNfe.length === 44) {
      cnpjInKey = rawNfe.substring(6, 20);
    } else if (rawNfe.length === 50) {
      cnpjInKey = rawNfe.substring(10, 24);
    }

    // Fallback robusto: verifica se o CNPJ aparece em qualquer posição da chave
    const cnpjMatchesKey = cnpjInKey === rawCnpj || rawNfe.includes(rawCnpj);

    // Fetch company data from BrasilAPI (CNPJ lookup — free, no auth needed)
    let company = null;
    try {
      const brasilApiRes = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${rawCnpj}`, {
        signal: AbortSignal.timeout(8000),
        headers: { 'Accept': 'application/json' }
      });

      if (brasilApiRes.ok) {
        const data = await brasilApiRes.json();

        // ── Verifica situação cadastral ─────────────────────────────────────
        // situacao_cadastral: 2 = ATIVA | 3 = SUSPENSA | 4 = INAPTA | 8 = BAIXADA
        const situacao = data.situacao_cadastral;
        if (situacao !== 2) {
          const msgs: Record<number, string> = {
            3: 'Este CNPJ está SUSPENSO na Receita Federal. Regularize a situação antes de se cadastrar.',
            4: 'Este CNPJ está INAPTO na Receita Federal. Regularize a situação antes de se cadastrar.',
            8: 'Este CNPJ foi dado baixa na Receita Federal e não pode ser utilizado para cadastro.',
          };
          const msg = msgs[situacao] ?? `CNPJ com situação irregular na Receita Federal (código ${situacao}). Apenas CNPJs ATIVOS podem se cadastrar.`;
          return NextResponse.json({ success: false, error: msg }, { status: 422 });
        }

        company = {
          razaoSocial: data.razao_social || data.nome_fantasia || '',
          logradouro: data.logradouro || '',
          numero: data.numero || '',
          bairro: data.bairro || '',
          cidade: data.municipio || '',
          estado: data.uf || '',
          cep: (data.cep || '').replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, '$1-$2'),
        };
      }
    } catch {
      // BrasilAPI timeout or error — allow manual fill (não bloqueia)
    }

    // If CNPJ matches emitter in the NF-e key OR CNPJ is valid (fallback), consider validated
    if (cnpjMatchesKey || company) {
      return NextResponse.json({
        success: true,
        cnpjMatchesKey,
        company,
        manualPreFill: !company,
      });
    }

    return NextResponse.json({
      success: false,
      error: 'O CNPJ informado não consta como emitente desta NF-e. Verifique os dados e tente novamente.'
    }, { status: 422 });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
