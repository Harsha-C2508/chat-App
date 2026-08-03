import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Login from '../components/Authentication/Login'
import Signup from '../components/Authentication/Signup'

const S = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', backgroundColor: '#111118', padding: '24px 16px',
  },
  card: {
    width: '100%', maxWidth: '420px',
    backgroundColor: '#252535', borderRadius: '20px',
    padding: '40px 36px 36px',
    boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
  },
  logoRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '10px', marginBottom: '16px',
  },
  logoIcon: {
    width: '36px', height: '36px', borderRadius: '50%',
    border: '2px solid #5b7cf6', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  logoDot: {
    width: '12px', height: '12px', borderRadius: '50%',
    backgroundColor: '#5b7cf6',
  },
  logoText: {
    color: '#f0f0f5', fontSize: '26px', fontWeight: 700,
    letterSpacing: '-0.3px', margin: 0,
  },
  subtitle: {
    color: '#9ca3af', fontSize: '14px', textAlign: 'center',
    lineHeight: 1.6, marginBottom: '32px',
  },
  tabs: {
    display: 'flex', gap: '0', marginBottom: '28px',
    backgroundColor: '#1e1e2e', borderRadius: '10px', padding: '3px',
  },
  tab: (active) => ({
    flex: 1, padding: '8px 0', fontSize: '14px', fontWeight: 500,
    border: 'none', cursor: 'pointer', borderRadius: '8px',
    backgroundColor: active ? '#252535' : 'transparent',
    color: active ? '#f0f0f5' : '#6b7280',
    transition: 'all 0.15s',
  }),
};

const HomePage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('login')

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo'))
    if (user) navigate('/chats')
  }, [navigate])

  return (
    <div style={S.page}>
      <div style={S.card}>
        {/* Logo */}
        <div style={S.logoRow}>
          <div style={S.logoIcon}>
            <div style={S.logoDot} />
          </div>
          <h1 style={S.logoText}>Halo</h1>
        </div>

        {/* Subtitle */}
        <p style={S.subtitle}>
          {activeTab === 'login'
            ? 'Welcome back — your conversations\nare waiting for you.'
            : 'Create an account and start chatting\nwith anyone, anywhere.'}
        </p>

        {/* Tabs */}
        <div style={S.tabs}>
          <button style={S.tab(activeTab === 'login')} onClick={() => setActiveTab('login')}>Sign in</button>
          <button style={S.tab(activeTab === 'signup')} onClick={() => setActiveTab('signup')}>Sign up</button>
        </div>

        {/* Form */}
        {activeTab === 'login' ? <Login /> : <Signup />}
      </div>
    </div>
  )
}

export default HomePage
