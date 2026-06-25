'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConfirmationPageContent() {
  const searchParams = useSearchParams()
  const anuncioId = searchParams.get('anuncio_id') || 'mock_1'
  const path = searchParams.get('path') || 'success'

  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    document.title = "Confirmação de Anúncio | Materra Elo"
    
    // Simulate lookup / API lag for realistic experience
    const timer = setTimeout(() => {
      if (path === 'success' && anuncioId) {
        try {
          const saved = localStorage.getItem('materra_email_confirmations')
          let confirmations = saved ? JSON.parse(saved) : {}
          
          confirmations[anuncioId] = {
            status: 'confirmed',
            sentAt: confirmations[anuncioId]?.sentAt || new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
            expiresAt: confirmations[anuncioId]?.expiresAt || new Date().toLocaleDateString('pt-BR'),
            confirmedAt: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
          }
          
          localStorage.setItem('materra_email_confirmations', JSON.stringify(confirmations))
          
          // Trigger a local storage event manually to notify the main tab if open
          window.dispatchEvent(new Event('storage'))
          
          setSuccess(true)
        } catch (e) {
          console.error(e)
          setSuccess(false)
        }
      } else {
        setSuccess(false)
      }
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [anuncioId, path])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '16px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 215, 0, 0.1)',
          borderTop: '4px solid #FFD700',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Processando sua confirmação...</p>
        <style jsx global>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (path === 'success' && success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '85vh', padding: '20px' }}>
        <div style={{
          background: '#111111',
          border: '1.5px solid #28A745',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 0 30px rgba(40, 167, 69, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px'
        }}>
          {/* Checkmark icon with animation */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(40, 167, 69, 0.1)',
            border: '2px solid #28A745',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#28A745',
            fontSize: '3rem',
            lineHeight: '1',
            boxShadow: '0 0 15px rgba(40, 167, 69, 0.2)'
          }}>
            ✓
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ✅ ANÚNCIO CONFIRMADO COM SUCESSO!
            </h1>
            <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: '1.4' }}>
              Você confirmou o anúncio:<br />
              <strong style={{ color: '#fff' }}>"Aparas de ferro limpas - São Paulo"</strong>
            </p>
          </div>

          <div style={{
            background: '#1A1A1A',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '16px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <span style={{ color: '#28A745', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              🎉 Você ganhou +20 pontos!
            </span>
            <span style={{ color: '#aaa', fontSize: '0.8rem' }}>
              Seu novo score de conformidade:<br />
              <strong style={{ color: '#fff' }}>45 &rarr; 65 (Selo Bronze ⭐)</strong>
            </span>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#888' }}>
            📧 E-mail de confirmação enviado para:<br />
            <span style={{ color: '#ccc' }}>joao@consultor.com</span>
          </div>

          <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
            <Link href="/" style={{
              flex: 1,
              padding: '12px',
              background: '#1A1A1A',
              border: '1px solid #333',
              color: '#fff',
              fontWeight: 'bold',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.85rem',
              textAlign: 'center',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}>
              Voltar
            </Link>
            <Link href="/?tab=meus_anuncios" style={{
              flex: 1.5,
              padding: '12px',
              background: 'linear-gradient(135deg, #ffd700 0%, #ffa500 100%)',
              color: '#000',
              fontWeight: 'bold',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.85rem',
              textAlign: 'center',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}>
              Ir para Meus Anúncios
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '85vh', padding: '20px' }}>
      <div style={{
        background: '#111111',
        border: '1.5px solid #DC3545',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 0 30px rgba(220, 53, 69, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        {/* Error icon with animation */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(220, 53, 69, 0.1)',
          border: '2px solid #DC3545',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#DC3545',
          fontSize: '3rem',
          lineHeight: '1',
          boxShadow: '0 0 15px rgba(220, 53, 69, 0.2)'
        }}>
          &times;
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ❌ LINK INVÁLIDO OU EXPIRADO
          </h1>
          <p style={{ color: '#ccc', fontSize: '0.85rem', lineHeight: '1.4' }}>
            Não foi possível processar a validação do anúncio.
          </p>
        </div>

        <div style={{
          background: '#1A1A1A',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '16px',
          width: '100%',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '0.8rem',
          color: '#ccc'
        }}>
          <strong style={{ color: '#fff' }}>Possíveis motivos:</strong>
          <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li>Link já foi confirmado anteriormente</li>
            <li>Link expirou (&gt;7 dias)</li>
            <li>Token de acesso inválido ou corrompido</li>
          </ul>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#888' }}>
          Solicite um novo link de confirmação ao Controlador ou entre em contato com nosso suporte técnico.
          <br />
          <span style={{ color: '#FFD700', fontWeight: 'bold' }}>📧 suporte@materra.com</span>
        </div>

        <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
          <Link href="/" style={{
            flex: 1,
            padding: '12px',
            background: '#1A1A1A',
            border: '1px solid #333',
            color: '#fff',
            fontWeight: 'bold',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.85rem',
            textAlign: 'center',
            transition: 'all 0.2s',
            cursor: 'pointer'
          }}>
            Voltar
          </Link>
          <a href="mailto:suporte@materra.com?subject=Erro%20Link%20Confirmacao%20Materra%20Elo" style={{
            flex: 1.5,
            padding: '12px',
            background: 'transparent',
            border: '1px solid #FFD700',
            color: '#FFD700',
            fontWeight: 'bold',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.85rem',
            textAlign: 'center',
            transition: 'all 0.2s',
            cursor: 'pointer'
          }}>
            Suporte
          </a>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      {/* Top Header */}
      <header style={{
        background: '#111111',
        borderBottom: '1px solid #333',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#FFD700" strokeWidth="2" />
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', letterSpacing: '1px' }}>MATERRA ELO</span>
        </div>
        <Link href="/" style={{ color: '#FFD700', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold' }}>
          Voltar ao Início
        </Link>
      </header>

      {/* Main Content */}
      <Suspense fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <p style={{ color: '#aaa' }}>Carregando dados da confirmação...</p>
        </div>
      }>
        <ConfirmationPageContent />
      </Suspense>
    </div>
  )
}
