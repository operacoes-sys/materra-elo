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
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotLoading(true)
    setErrorMsg('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/auth/redefinir-senha`
      })
      if (error) throw error
      setForgotSent(true)
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao enviar e-mail de recuperação.')
    } finally {
      setForgotLoading(false)
    }
  }

  // Lock: block new logins until after Tuesday 2026-06-03 00:00 BRT (UTC-3)
  const UNLOCK_DATE = new Date('2026-06-03T03:00:00Z') // 00:00 BRT = 03:00 UTC
  const isLocked = false

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
        // Query complete profile data
        const { data: profileData } = await supabase
          .from('cadastros')
          .select('*')
          .eq('id', data.user.id)
          .single()

        // Save session backups
        localStorage.setItem('materra_user', JSON.stringify(data.user));
        if (profileData) {
          localStorage.setItem('materra_profile', JSON.stringify(profileData));
        }

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
            <div style={{ textAlign: 'right', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => { setForgotMode(true); setForgotEmail(email); setErrorMsg('') }}
                style={{
                  background: 'none', border: 'none', padding: 0,
                  color: 'var(--primary-500)', fontSize: '0.8rem',
                  cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit'
                }}
              >
                Esqueci minha senha
              </button>
            </div>
          </div>

          <div className="form-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <Link
              href="/"
              className="btn btn-full"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#ccc',
                textDecoration: 'none',
                fontSize: '0.9rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                e.currentTarget.style.color = '#ccc';
              }}
            >
              Voltar ao Início
            </Link>
          </div>
        </form>

        {/* Forgot Password Modal */}
        {forgotMode && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 999, backdropFilter: 'blur(6px)'
          }}>
            <div style={{
              background: '#0f0f0f', border: '1px solid #2a2a2a',
              borderRadius: '16px', padding: '36px 32px',
              maxWidth: '420px', width: '90%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)'
            }}>
              {forgotSent ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <span style={{ fontSize: '2.5rem' }}>✉️</span>
                  </div>
                  <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, textAlign: 'center', marginBottom: '12px' }}>
                    E-mail enviado!
                  </h2>
                  <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: '1.6', textAlign: 'center', marginBottom: '24px' }}>
                    Enviamos um link de redefinição para <strong style={{ color: '#fff' }}>{forgotEmail}</strong>. O link expira em 24 horas. Verifique também sua caixa de spam.
                  </p>
                  <button
                    onClick={() => { setForgotMode(false); setForgotSent(false) }}
                    style={{
                      width: '100%', padding: '12px', background: '#1a1a1a',
                      border: '1px solid #333', borderRadius: '8px',
                      color: '#ccc', fontSize: '0.88rem', cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    Fechar
                  </button>
                </>
              ) : (
                <>
                  <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>
                    Recuperar acesso
                  </h2>
                  <p style={{ color: '#888', fontSize: '0.83rem', lineHeight: '1.6', marginBottom: '20px' }}>
                    Insira o e-mail corporativo cadastrado na plataforma. Enviaremos um link seguro de redefinição de senha.
                  </p>
                  {errorMsg && (
                    <div style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid #ff5050', borderRadius: '8px', padding: '10px 14px', color: '#ff8080', fontSize: '0.82rem', marginBottom: '16px' }}>
                      {errorMsg}
                    </div>
                  )}
                  <form onSubmit={handleForgotPassword}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '6px' }}>E-mail corporativo</label>
                      <input
                        type="email"
                        className="form-input"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        placeholder="seu@empresa.com.br"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary btn-full"
                      disabled={forgotLoading}
                      style={{ marginBottom: '12px' }}
                    >
                      {forgotLoading ? 'Enviando...' : 'Enviar link de recuperação'}
                    </button>
                  </form>
                  <button
                    onClick={() => { setForgotMode(false); setErrorMsg('') }}
                    style={{
                      width: '100%', padding: '10px', background: 'none',
                      border: '1px solid #222', borderRadius: '8px',
                      color: '#666', fontSize: '0.82rem', cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        )}

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
