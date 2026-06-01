'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Lock: block new logins until after Tuesday 2026-06-03 00:00 BRT (UTC-3)
  const UNLOCK_DATE = new Date('2026-06-03T03:00:00Z') // 00:00 BRT = 03:00 UTC
  const isLocked = new Date() < UNLOCK_DATE

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Redireciona para o portal principal
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao fazer login. Verifique suas credenciais.')
    } finally {
      setLoading(false)
    }
  }

  if (isLocked) {
    return (
      <div className="main-layout" style={{ justifyContent: 'center', alignItems: 'center', background: '#000', flexDirection: 'column', gap: '20px', padding: '40px', minHeight: '100vh' }}>
        <div style={{ background: '#0f0f0f', border: '1px solid #222', borderRadius: '16px', padding: '48px 40px', maxWidth: '460px', width: '100%', textAlign: 'center' }}>
          <img src="/logo.png" alt="Materra Elo" style={{ height: '52px', objectFit: 'contain', marginBottom: '20px' }} />
          <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900, marginBottom: '12px' }}>Plataforma em fase de abertura</h1>
          <div style={{ background: 'rgba(255,215,0,0.07)', border: '1px solid var(--primary-500)', borderRadius: '10px', padding: '18px', marginBottom: '20px' }}>
            <p style={{ color: 'var(--primary-500)', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
              Login e novos cadastros disponíveis a partir de terça-feira.
            </p>
          </div>
          <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
            A Materra Elo está nos preparativos finais para o lançamento. Volte na terça-feira para acessar o marketplace de resíduos industriais.
          </p>
          <Link href="/" style={{ display: 'inline-block', marginTop: '24px', color: 'var(--primary-500)', fontSize: '0.9rem', textDecoration: 'none' }}>
            Voltar para a Landing Page
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="main-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="form-container">
        <h1 className="form-title">Materra Elo</h1>
        <p className="form-subtitle">Faça login para acessar o marketplace</p>

        {errorMsg && <div className="form-error">{errorMsg}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>

        <p className="text-center mt-lg" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Ainda não tem uma conta?{' '}
          <Link href="/auth/cadastro" className="btn-link">
            Cadastrar-se
          </Link>
        </p>
      </div>
    </div>
  )
}
