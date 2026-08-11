import React, { useState } from 'react';
import { Lock, ShieldCheck, Key, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { licenseApi } from '../utils/licenseUtils';

export default function TelaBloqueioLicenca({ onUnlockSuccess }) {
  const [chaveInput, setChaveInput] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTentarDesbloquear = (e) => {
    e.preventDefault();
    setMensagemErro('');

    if (!chaveInput.trim()) {
      setMensagemErro('❌ Digite todos os caracteres da sua Chave de Licença.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = licenseApi.activateKey(chaveInput);

      if (res.success) {
        setChaveInput('');
        setMensagemErro('');
        if (onUnlockSuccess) onUnlockSuccess(res.license);
      } else {
        setMensagemErro(res.message);
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(15, 23, 42, 0.96)',
      backdropFilter: 'blur(10px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        border: '3px solid #dc2626',
        borderRadius: '24px',
        padding: '36px 28px',
        maxWidth: '540px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(220, 38, 38, 0.4)',
        textAlign: 'center',
        animation: 'slideIn 0.3s ease'
      }}>
        {/* Ícone de Bloqueio em Destaque */}
        <div style={{
          width: '80px',
          height: '80px',
          background: '#fee2e2',
          color: '#dc2626',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)'
        }}>
          <Lock size={44} />
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
          🔒 SISTEMA BLOQUEADO
        </h2>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '24px' }}>
          O acesso ao sistema encontra-se temporariamente suspenso. Para desbloquear instantaneamente, digite todos os caracteres da sua <strong>Chave de Licença</strong>.
        </p>

        {mensagemErro && (
          <div style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '14px',
            borderRadius: '12px',
            border: '1.5px solid #fca5a5',
            fontWeight: 800,
            fontSize: '0.88rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textAlign: 'left'
          }}>
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
            <span>{mensagemErro}</span>
          </div>
        )}

        <form onSubmit={handleTentarDesbloquear} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0, textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 800, color: '#1e293b' }}>
              🔑 Digite a Chave de Licença (Validação Exata):
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: EB-VIT-9999D-X7A1-M9K2"
              value={chaveInput}
              onChange={(e) => setChaveInput(e.target.value)}
              style={{
                fontWeight: 800,
                fontSize: '1.1rem',
                letterSpacing: '1px',
                textAlign: 'center',
                borderColor: mensagemErro ? '#dc2626' : 'var(--blue-primary)',
                padding: '14px'
              }}
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="btn btn-orange"
            disabled={loading}
            style={{
              fontWeight: 800,
              padding: '16px',
              fontSize: '1.05rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: 'var(--shadow-orange-btn)'
            }}
          >
            <ShieldCheck size={22} /> {loading ? 'Validando Licença...' : '🔓 Desbloquear Sistema Agora'}
          </button>
        </form>
      </div>
    </div>
  );
}
