import React, { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'
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
  passwordWrap: { position: 'relative' },
  showBtn: {
    position: 'absolute', right: '12px', top: '50%',
    transform: 'translateY(-50%)', background: 'none', border: 'none',
    color: '#6b7280', fontSize: '12px', cursor: 'pointer', fontWeight: 500,
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
};

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      notifications.show({ title: 'Missing fields', message: 'Please fill all fields.', color: 'yellow' })
      return
    }
    if (password !== confirmPassword) {
      notifications.show({ title: 'Password mismatch', message: 'Passwords do not match.', color: 'yellow' })
      return
    }
    if (password.length < 6) {
      notifications.show({ title: 'Too short', message: 'Password must be at least 6 characters.', color: 'yellow' })
      return
    }

    setLoading(true)
    try {
      const { data } = await axios.put(`/api/user/reset-password/${token}`, { password })
      notifications.show({ title: 'Password updated', message: data.message, color: 'green' })
      navigate('/')
    } catch (err) {
      notifications.show({
        title: 'Reset failed',
        message: getApiErrorMessage(err, 'Could not reset password.'),
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

        <p style={S.subtitle}>Choose a new password for your account.</p>

        <form style={S.form} onSubmit={handleSubmit}>
          <div style={S.fieldWrap}>
            <label style={S.label}>New password</label>
            <div style={S.passwordWrap}>
              <input
                style={{ ...S.input, paddingRight: '52px' }}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button style={S.showBtn} type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div style={S.fieldWrap}>
            <label style={S.label}>Confirm password</label>
            <input
              style={S.input}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>

          <button style={{ ...S.btn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update password'}
          </button>

          <Link to="/" style={S.backLink}>Back to sign in</Link>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
