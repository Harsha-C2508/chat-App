import { useState } from 'react';
import { C } from '../../config/themeColors';

const SecretKeyModal = ({
  open,
  title = 'Enter secret key',
  description = 'This action requires your secret key.',
  confirmLabel = 'Confirm',
  onConfirm,
  onClose,
}) => {
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!secret.trim()) {
      setError('Please enter your secret key');
      return;
    }
    setSubmitting(true);
    try {
      const ok = await onConfirm(secret.trim());
      if (ok === false) {
        setError('Incorrect secret key');
        return;
      }
      setSecret('');
      onClose();
    } catch (err) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        backgroundColor: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: '380px',
          backgroundColor: C.bgElevated,
          border: `1px solid ${C.border}`,
          borderRadius: '16px',
          padding: '24px',
          boxShadow: `0 24px 64px ${C.shadow}`,
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ color: C.textPrimary, fontSize: '17px', fontWeight: 700, margin: '0 0 8px' }}>{title}</h3>
        <p style={{ color: C.textMuted, fontSize: '13px', margin: '0 0 16px', lineHeight: 1.5 }}>{description}</p>

        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            type="password"
            value={secret}
            onChange={e => { setSecret(e.target.value); setError(''); }}
            placeholder="Secret key"
            style={{
              width: '100%', boxSizing: 'border-box',
              backgroundColor: C.bgBase,
              border: `1px solid ${error ? C.danger : C.border}`,
              borderRadius: '10px',
              padding: '11px 14px',
              color: C.textPrimary,
              fontSize: '14px',
              outline: 'none',
              marginBottom: error ? '8px' : '16px',
            }}
          />
          {error && (
            <p style={{ color: C.danger, fontSize: '12px', margin: '0 0 12px' }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '11px', borderRadius: '10px',
                border: `1px solid ${C.border}`, backgroundColor: 'transparent',
                color: C.textMuted, fontSize: '14px', fontWeight: 500, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1, padding: '11px', borderRadius: '10px',
                border: 'none', backgroundColor: C.accent,
                color: '#fff', fontSize: '14px', fontWeight: 600,
                cursor: submitting ? 'wait' : 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Checking…' : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecretKeyModal;
