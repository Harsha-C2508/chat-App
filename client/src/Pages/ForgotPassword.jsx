import React, { useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { notifications } from '@mantine/notifications'
import { getApiErrorMessage } from '../config/getApiErrorMessage'

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
  logoDot: { width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#5b7cf6' },
  logoText: { color: '#f0f0f5', fontSize: '26px', fontWeight: 700, margin: 0 },
  subtitle: {
    color: '#9ca3af', fontSize: '14px', textAlign: 'center',
    lineHeight: 1.6, marginBottom: '28px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: '#d1d5db', fontSize: '13px', fontWeight: 500 },
  input: {
    width: '100%', backgroundColor: '#1e1e2e',
    border: '1px solid #2e2e42', borderRadius: '10px',
    padding: '11px 14px', color: '#f0f0f5', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
  },
  btn: {
    width: '100%', backgroundColor: '#2a2a3e',
    border: '1px solid #3a3a55', borderRadius: '10px',
    padding: '12px', color: '#f0f0f5', fontSize: '14px',
    fontWeight: 600, cursor: 'pointer',
  },
  backLink: {
    color: '#5b7cf6', fontSize: '13px', textAlign: 'center',
    textDecoration: 'none', marginTop: '4px',
  },
  successNote: {
    color: '#9ca3af', fontSize: '13px', textAlign: 'center',
    lineHeight: 1.5, margin: 0,
  },
};

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      notifications.show({ title: 'Missing email', message: 'Please enter your email address.', color: 'yellow' })
      return
    }

    setLoading(true)
    try {
      const { data } = await axios.post('/api/user/forgot-password', { email })
      setSubmitted(true)
      notifications.show({
        title: 'Check your email',
        message: data.message,
        color: 'green',
      })
    } catch (err) {
      notifications.show({
        title: 'Request failed',
        message: getApiErrorMessage(err, 'Could not send reset link.'),
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logoRow}>
          <div style={S.logoIcon}><div style={S.logoDot} /></div>
          <h1 style={S.logoText}>Halo</h1>
        </div>

        <p style={S.subtitle}>
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        <form style={S.form} onSubmit={handleSubmit}>
          <div style={S.fieldWrap}>
            <label style={S.label}>Email</label>
            <input
              style={S.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <button style={{ ...S.btn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading || submitted}>
            {loading ? 'Sending...' : submitted ? 'Email sent' : 'Send reset link'}
          </button>

          {submitted && (
            <p style={S.successNote}>
              If an account exists for that email, you&apos;ll receive a reset link shortly.
              Check your inbox and spam folder.
            </p>
          )}

          <Link to="/" style={S.backLink}>Back to sign in</Link>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword
