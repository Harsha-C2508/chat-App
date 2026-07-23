import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { notifications } from '@mantine/notifications'
import { getApiErrorMessage } from '../../config/getApiErrorMessage'
import { ChatState } from '../../Context/ChatContext'
import { isSupportedImage, fileToBase64 } from '../../config/imageUtils'

const S = {
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
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
  signUpBtn: {
    width: '100%', backgroundColor: '#2a2a3e',
    border: '1px solid #3a3a55', borderRadius: '10px',
    padding: '12px', color: '#f0f0f5', fontSize: '14px',
    fontWeight: 600, cursor: 'pointer', marginTop: '4px',
  },
  fileInput: {
    width: '100%', backgroundColor: '#1e1e2e',
    border: '1px solid #2e2e42', borderRadius: '10px',
    padding: '9px 14px', color: '#6b7280', fontSize: '13px',
    outline: 'none', boxSizing: 'border-box', cursor: 'pointer',
  },
};

const Signup = () => {
  const [show, setShow] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [picBase64, setPicBase64] = useState(null)
  const [picFileName, setPicFileName] = useState('')
  const [picPreview, setPicPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser } = ChatState()

  const profilePhoto = async (file) => {
    if (!file) {
      notifications.show({ title: 'No file', message: 'Please select an image!', color: 'yellow' })
      return
    }
    if (!isSupportedImage(file)) {
      notifications.show({
        title: 'Unsupported image',
        message: 'Please use JPG, PNG, WEBP, or GIF. Phone photos with mismatched extensions are also supported.',
        color: 'yellow',
      })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      notifications.show({ title: 'Too large', message: 'Image must be under 5 MB', color: 'yellow' })
      return
    }

    setLoading(true)
    try {
      const base64 = await fileToBase64(file)
      setPicBase64(base64)
      setPicFileName(file.name)
      setPicPreview(URL.createObjectURL(file))
      notifications.show({ title: 'Photo selected', message: 'Profile picture ready to upload', color: 'green' })
    } catch {
      notifications.show({ title: 'Upload failed', message: 'Could not read the image file', color: 'red' })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    setLoading(true)
    if (!name || !email || !password || !confirmPassword) {
      notifications.show({ title: 'Missing fields', message: 'Please fill all the fields!', color: 'yellow' }); setLoading(false); return
    }
    if (password !== confirmPassword) {
      notifications.show({ title: 'Password mismatch', message: 'Passwords do not match!', color: 'yellow' }); setLoading(false); return
    }
    try {
      const payload = { name, email, password }
      if (picBase64) {
        payload.picBase64 = picBase64
        payload.picFileName = picFileName
      }
      const { data } = await axios.post('/api/user', payload, { headers: { 'Content-type': 'application/json' } })
      notifications.show({ title: 'Registration Successful', message: 'Welcome to Halo!', color: 'green' })
      localStorage.setItem('userInfo', JSON.stringify(data)); setUser(data); setLoading(false); navigate('/chats')
    } catch (err) {
      notifications.show({
        title: 'Registration failed',
        message: getApiErrorMessage(err, 'Something went wrong. Please try again.'),
        color: 'red',
      })
      setLoading(false)
    }
  }

  const focusStyle = (e) => e.target.style.borderColor = '#5b7cf6'
  const blurStyle = (e) => e.target.style.borderColor = '#2e2e42'

  return (
    <div style={S.form}>
      <div style={S.fieldWrap}>
        <label style={S.label}>Name</label>
        <input style={S.input} placeholder="Your full name" onChange={e => setName(e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
      </div>

      <div style={S.fieldWrap}>
        <label style={S.label}>Email</label>
        <input style={S.input} type="email" placeholder="you@example.com" onChange={e => setEmail(e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
      </div>

      <div style={S.fieldWrap}>
        <label style={S.label}>Password</label>
        <div style={S.passwordWrap}>
          <input
            style={{ ...S.input, paddingRight: '52px' }}
            type={show ? 'text' : 'password'}
            placeholder="••••••••"
            onChange={e => setPassword(e.target.value)}
            onFocus={focusStyle} onBlur={blurStyle}
          />
          <button style={S.showBtn} type="button" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button>
        </div>
      </div>

      <div style={S.fieldWrap}>
        <label style={S.label}>Confirm Password</label>
        <div style={S.passwordWrap}>
          <input
            style={{ ...S.input, paddingRight: '52px' }}
            type={show ? 'text' : 'password'}
            placeholder="••••••••"
            onChange={e => setConfirmPassword(e.target.value)}
            onFocus={focusStyle} onBlur={blurStyle}
          />
          <button style={S.showBtn} type="button" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button>
        </div>
      </div>

      <div style={S.fieldWrap}>
        <label style={S.label}>Profile Picture <span style={{ color: '#6b7280', fontWeight: 400 }}>(optional)</span></label>
        {picPreview && (
          <img
            src={picPreview}
            alt="Profile preview"
            style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', marginBottom: 8 }}
          />
        )}
        <input style={S.fileInput} type="file" accept="image/*" onChange={e => profilePhoto(e.target.files[0])} />
      </div>

      <button
        style={{ ...S.signUpBtn, opacity: loading ? 0.6 : 1 }}
        onClick={handleSignUp}
        disabled={loading}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#32324e'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2a2a3e'}
      >
        {loading ? 'Creating account...' : 'Create account'}
      </button>
    </div>
  )
}

export default Signup
