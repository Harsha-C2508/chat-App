import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { notifications } from '@mantine/notifications'
import { getApiErrorMessage } from '../../config/getApiErrorMessage'
import { ChatState } from '../../Context/ChatContext'

const S = {
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: '#d1d5db', fontSize: '13px', fontWeight: 500 },
  input: {
    width: '100%', backgroundColor: '#1e1e2e',
    border: '1px solid #2e2e42', borderRadius: '10px',
    padding: '11px 14px', color: '#f0f0f5', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  passwordWrap: { position: 'relative' },
  showBtn: {
    position: 'absolute', right: '12px', top: '50%',
    transform: 'translateY(-50%)', background: 'none', border: 'none',
    color: '#6b7280', fontSize: '12px', cursor: 'pointer', fontWeight: 500,
  },
  forgotRow: { display: 'flex', justifyContent: 'flex-end', marginTop: '-8px' },
  forgotLink: {
    color: '#5b7cf6', fontSize: '13px', background: 'none',
    border: 'none', cursor: 'pointer', padding: 0,
  },
  signInBtn: {
    width: '100%', backgroundColor: '#2a2a3e',
    border: '1px solid #3a3a55', borderRadius: '10px',
    padding: '12px', color: '#f0f0f5', fontSize: '14px',
    fontWeight: 600, cursor: 'pointer', marginTop: '4px',
    transition: 'background 0.15s',
  },
  divider: {
    display: 'flex', alignItems: 'center', gap: '12px',
    margin: '4px 0',
  },
  dividerLine: { flex: 1, height: '1px', backgroundColor: '#2e2e42' },
  dividerText: { color: '#6b7280', fontSize: '12px', whiteSpace: 'nowrap' },
  socialRow: { display: 'flex', gap: '10px' },
  socialBtn: {
    flex: 1, backgroundColor: '#2a2a3e', border: '1px solid #3a3a55',
    borderRadius: '10px', padding: '10px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    color: '#d1d5db', fontSize: '13px', fontWeight: 500,
    transition: 'background 0.15s',
  },
  guestBtn: {
    width: '100%', backgroundColor: 'transparent',
    border: '1px solid #2e2e42', borderRadius: '10px',
    padding: '10px', color: '#6b7280', fontSize: '13px',
    cursor: 'pointer', marginTop: '4px',
  },
};

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID?.trim();

const GoogleLoginButton = ({ loading, setLoading, navigate, setUser }) => {
  const handleGoogleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      setLoading(true)
      try {
        const { data } = await axios.post('/api/user/google', { code: codeResponse.code }, {
          headers: { 'Content-type': 'application/json' },
        })
        notifications.show({ title: 'Login Successful', message: 'Welcome back!', color: 'green' })
        localStorage.setItem('userInfo', JSON.stringify(data))
        setUser(data)
        navigate('/chats')
      } catch (err) {
        notifications.show({
          title: 'Google sign-in failed',
          message: getApiErrorMessage(err, 'Could not sign in with Google'),
          color: 'red',
        })
      } finally {
        setLoading(false)
      }
    },
    onError: () => {
      notifications.show({
        title: 'Google sign-in cancelled',
        message: 'The Google sign-in popup was closed or failed.',
        color: 'yellow',
      })
    },
  })

  return (
    <button
      style={S.socialBtn}
      type="button"
      onClick={() => handleGoogleLogin()}
      disabled={loading}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#32324e'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2a2a3e'}
    >
      <GoogleIcon /> Google
    </button>
  )
};

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser } = ChatState()

  const handleLogin = async () => {
    setLoading(true)
    if (!email || !password) {
      notifications.show({ title: 'Missing fields', message: 'Please fill all the fields!', color: 'yellow' })
      setLoading(false)
      return
    }
    try {
      const { data } = await axios.post('/api/user/login', { email, password }, {
        headers: { 'Content-type': 'application/json' },
      })
      notifications.show({ title: 'Login Successful', message: 'Welcome back!', color: 'green' })
      localStorage.setItem('userInfo', JSON.stringify(data))
      setUser(data)
      setLoading(false)
      navigate('/chats')
    } catch (err) {
      notifications.show({
        title: 'Login failed',
        message: getApiErrorMessage(err, 'Something went wrong. Please try again.'),
        color: 'red',
      })
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleLogin() }

  const onGoogleUnavailable = () => {
    notifications.show({
      title: 'Google login unavailable',
      message: 'Set REACT_APP_GOOGLE_CLIENT_ID in client/.env and restart the dev server.',
      color: 'yellow',
    })
  }

  return (
    <div style={S.form}>
      {/* Email */}
      <div style={S.fieldWrap}>
        <label style={S.label}>Email</label>
        <input
          style={S.input}
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={e => e.target.style.borderColor = '#5b7cf6'}
          onBlur={e => e.target.style.borderColor = '#2e2e42'}
        />
      </div>

      {/* Password */}
      <div style={S.fieldWrap}>
        <label style={S.label}>Password</label>
        <div style={S.passwordWrap}>
          <input
            style={{ ...S.input, paddingRight: '52px' }}
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={e => e.target.style.borderColor = '#5b7cf6'}
            onBlur={e => e.target.style.borderColor = '#2e2e42'}
          />
          <button style={S.showBtn} type="button" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {/* Forgot password */}
      <div style={S.forgotRow}>
        <button style={S.forgotLink} type="button" onClick={() => navigate('/forgot-password')}>
          Forgot password?
        </button>
      </div>

      {/* Sign in */}
      <button
        style={{ ...S.signInBtn, opacity: loading ? 0.6 : 1 }}
        onClick={handleLogin}
        disabled={loading}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#32324e'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2a2a3e'}
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>

      {/* Divider */}
      <div style={S.divider}>
        <div style={S.dividerLine} />
        <span style={S.dividerText}>or continue with</span>
        <div style={S.dividerLine} />
      </div>

      {/* Social buttons */}
      <div style={S.socialRow}>
        {googleClientId ? (
          <GoogleLoginButton loading={loading} setLoading={setLoading} navigate={navigate} setUser={setUser} />
        ) : (
          <button
            style={S.socialBtn}
            type="button"
            onClick={onGoogleUnavailable}
            disabled={loading}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#32324e'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2a2a3e'}
          >
            <GoogleIcon /> Google
          </button>
        )}
        <button
          style={S.socialBtn}
          onClick={() => { setEmail('guest@new.com'); setPassword('guest123') }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#32324e'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2a2a3e'}
          title="Use guest credentials"
        >
          Guest
        </button>
      </div>
    </div>
  )
}

export default Login
