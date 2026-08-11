import React, { useState, useEffect } from 'react';
import { Clock, Search, Calculator, Bell, Building, Briefcase, Link as LinkIcon, Key, Copy, Check, Smartphone } from 'lucide-react';
import { licenseApi } from '../utils/licenseUtils';

export default function Header({ 
  empresa = {}, 
  onOpenSearch, 
  onOpenCalc, 
  onOpenNotifications, 
  onOpenEmpresa, 
  onOpenLicense,
  onInstallPWA,
  notificationCount = 0 
}) {
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setHoraAtual(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatHora = (date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatData = (date) => {
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  };

  const lic = licenseApi.getLicense();
  const diasRestantes = licenseApi.getDaysRemaining();

  const publicLink = `${window.location.origin}${window.location.pathname}#/agendar`;

  const handleCopiarLinkPublico = () => {
    navigator.clipboard.writeText(publicLink);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  return (
    <header className="topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {/* Marca & Logo Elegante da Empresa */}
        <div 
          onClick={onOpenEmpresa} 
          title="Clique para Configurar Minha Empresa e Logo"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            cursor: 'pointer',
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '6px 12px 6px 6px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ 
            width: '46px', 
            height: '46px', 
            borderRadius: '10px', 
            background: '#ffffff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '3px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            border: '1.5px solid var(--blue-border)',
            flexShrink: 0
          }}>
            {empresa.logo ? (
              <img 
                src={empresa.logo} 
                alt="Logo Empresa" 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
              />
            ) : (
              <Briefcase size={22} style={{ color: 'var(--blue-primary)' }} />
            )}
          </div>

          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
              <span>{empresa.nomeFantasia || 'Escritório de Bolso'}</span>
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ffedd5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <span>Gestão Empresarial</span>
            </div>
          </div>
        </div>

        {/* Relógio Digital */}
        <div 
          title="Relógio Digital Sincronizado"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(255, 255, 255, 0.12)', 
            padding: '8px 14px', 
            borderRadius: '10px', 
            border: '1px solid rgba(255, 255, 255, 0.2)' 
          }}
        >
          <Clock size={18} style={{ color: '#ffedd5' }} />
          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff', fontFamily: 'monospace' }}>{formatHora(horaAtual)}</span>
          <span style={{ fontSize: '0.78rem', color: '#e0f2fe', textTransform: 'capitalize' }}>({formatData(horaAtual)})</span>
        </div>

        {/* BOTÃO DE INSTALAÇÃO NATIVA DO APLICATIVO (PWA) */}
        {onInstallPWA && (
          <button
            type="button"
            onClick={onInstallPWA}
            title="Instalar Aplicativo na Tela Inicial do Celular ou Computador"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Smartphone size={16} />
            <span>📱 Instalar App</span>
          </button>
        )}

        {/* BOTÃO COPIAR LINK DE AGENDAMENTO PÚBLICO */}
        <button
          type="button"
          onClick={handleCopiarLinkPublico}
          title="Copiar Link Público de Agendamento Online para enviar aos clientes"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: copiado ? '#059669' : 'var(--orange-gradient)',
            color: '#ffffff',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-orange-btn)',
            transition: 'all 0.2s ease'
          }}
        >
          {copiado ? <Check size={16} /> : <LinkIcon size={16} />}
          <span>{copiado ? 'Link Copiado! 📋' : '🔗 Link Agendamento Público'}</span>
        </button>

        {/* BADGE DE LICENÇA DO SISTEMA */}
        <button
          type="button"
          onClick={onOpenLicense}
          title="Clique para Gerenciar / Ativar Licença do Sistema"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            padding: '8px 12px',
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          <Key size={16} style={{ color: '#ffedd5' }} />
          <span>Licença: {lic.diasValidade >= 9000 ? 'Vitalícia ⭐' : `${diasRestantes}d`}</span>
        </button>
      </div>

      {/* Trigger de Pesquisa Global */}
      <div 
        onClick={onOpenSearch} 
        title="Pesquisar Qualquer Coisa no Sistema"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          background: 'rgba(255, 255, 255, 0.18)', 
          padding: '8px 16px', 
          borderRadius: '20px', 
          border: '1px solid rgba(255, 255, 255, 0.3)',
          cursor: 'pointer',
          color: '#ffffff',
          minWidth: '200px'
        }}
      >
        <Search size={18} style={{ color: '#ffedd5' }} />
        <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Pesquisar no sistema...</span>
      </div>

      {/* Botões de Ação no Topo */}
      <div className="topbar-actions">
        <button type="button" className="action-btn-circle" onClick={onOpenCalc} title="Calculadora Comercial">
          <Calculator size={20} />
        </button>

        <button type="button" className="action-btn-circle" onClick={onOpenNotifications} title="Alertas & Notificações">
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="badge-count">
              {notificationCount}
            </span>
          )}
        </button>

        <button type="button" className="action-btn-circle" onClick={onOpenEmpresa} title="Dados da Minha Empresa">
          <Building size={20} />
        </button>
      </div>
    </header>
  );
}
