import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// ─── Config ───────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = 'lucassoutoalvespinto@gmail.com'
const OTP_TTL_MS  = 5 * 60 * 1000   // 5 minutos

// ─── In-memory store (por processo do servidor) ───────────────────────────────
const otpStore = new Map<string, { code: string; expiresAt: number }>()

function generateCode(): string {
  // 8 dígitos — igual ao padrão Supabase
  return String(Math.floor(10000000 + Math.random() * 90000000))
}

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER!,
      pass: process.env.GMAIL_APP_PASSWORD!,
    },
  })
}

// ─── POST: gera código e envia por email ──────────────────────────────────────
export async function POST() {
  // Se Gmail não está configurado, pula o envio (use bypass 00000000)
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('\n\x1b[33m[admin-otp] Gmail não configurado — use o bypass 00000000 no campo OTP\x1b[0m\n')
    return NextResponse.json({ ok: true })
  }

  const code = generateCode()
  otpStore.set(ADMIN_EMAIL, { code, expiresAt: Date.now() + OTP_TTL_MS })

  try {
    const transporter = createTransporter()
    await transporter.sendMail({
      from: `"Materra Elo" <${process.env.GMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: '🔐 Código de Acesso — Painel Administrativo',
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
          <div style="max-width:460px;margin:40px auto;background:#111;border:1px solid #1e1e1e;border-radius:14px;overflow:hidden;">

            <div style="background:linear-gradient(135deg,#151515,#0d0d0d);padding:28px 32px;border-bottom:2px solid #FFD700;">
              <div style="font-size:20px;font-weight:900;color:#FFD700;letter-spacing:0.06em;">MATERRA ELO</div>
              <div style="font-size:11px;color:#555;margin-top:3px;letter-spacing:0.2em;text-transform:uppercase;">Painel Administrativo</div>
            </div>

            <div style="padding:32px;">
              <p style="color:#888;font-size:14px;margin:0 0 24px;line-height:1.6;">
                Uma tentativa de acesso ao painel administrativo foi detectada. Use o código abaixo para continuar:
              </p>

              <div style="background:#000;border:1px solid rgba(255,215,0,0.25);border-radius:10px;padding:28px;text-align:center;margin:0 0 24px;">
                <div style="font-size:11px;color:#555;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:14px;">Código de Acesso</div>
                <div style="font-size:38px;font-weight:900;letter-spacing:0.3em;color:#FFD700;font-family:'Courier New',monospace;">
                  ${code.slice(0, 4)}&thinsp;${code.slice(4)}
                </div>
                <div style="font-size:11px;color:#444;margin-top:14px;">⏱&nbsp; Válido por 5 minutos</div>
              </div>

              <p style="color:#444;font-size:12px;margin:0;line-height:1.7;">
                Se você não solicitou este acesso, ignore este email. O código expira automaticamente.
              </p>
            </div>

            <div style="background:#0d0d0d;padding:14px 32px;border-top:1px solid #1a1a1a;">
              <div style="font-size:11px;color:#333;">© ${new Date().getFullYear()} Materra Elo · Plataforma de Resíduos Industriais B2B</div>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error('[admin-otp] Erro ao enviar email:', err)
    return NextResponse.json(
      { ok: false, error: 'Falha ao enviar email. Verifique GMAIL_APP_PASSWORD no .env.local' },
      { status: 500 }
    )
  }
}

// ─── PUT: valida código ───────────────────────────────────────────────────────
export async function PUT(req: Request) {
  const { code } = await req.json()

  // 🔓 Bypass de desenvolvimento — remove antes de ir para produção
  if (code === '00000000') {
    return NextResponse.json({ ok: true })
  }

  const entry = otpStore.get(ADMIN_EMAIL)

  if (!entry) {
    return NextResponse.json(
      { ok: false, error: 'Nenhum código ativo. Clique em Continuar novamente.' },
      { status: 400 }
    )
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(ADMIN_EMAIL)
    return NextResponse.json(
      { ok: false, error: 'Código expirado. Solicite um novo.' },
      { status: 400 }
    )
  }

  if (code !== entry.code) {
    return NextResponse.json({ ok: false, error: 'Código incorreto.' }, { status: 400 })
  }

  otpStore.delete(ADMIN_EMAIL)
  return NextResponse.json({ ok: true })
}
