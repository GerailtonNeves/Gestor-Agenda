import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Search, 
  Calculator, 
  Bell, 
  Building, 
  Briefcase, 
  Link as LinkIcon, 
  Key, 
  Check, 
  Smartphone, 
  Menu as MenuIcon, 
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';
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
  const [menuRapidoOpen, setMenuRapidoOpen] = useState(false);

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
    <>
      <header className="topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', gap: '12px' }}>
        {/* Marca & Logo Elegante da Empresa */}
        <div 
          onClick={onOpenEmpresa} 
          title="Clique para Configurar Minha Empresa e Logo"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            cursor: 'pointer',
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '4px 10px 4px 4px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            transition: 'all 0.2s ease',
            maxWidth: '65%'
          }}
        >
          <div style={{ 
            width: '40px', 
            height: '40px', 
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
              <Briefcase size={20} style={{ color: 'var(--blue-primary)' }} />
            )}
          </div>

          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <span>{empresa.nomeFantasia || 'Escritório de Bolso'}</span>
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#ffedd5', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
              <span>Gestão Empresarial</span>
            </div>
          </div>
        </div>

        {/* Relógio Digital Visible (Apenas em telas de computador maiores) */}
        <div 
          className="desktop-only-clock"
          title="Relógio Digital Sincronizado"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(255, 255, 255, 0.12)', 
            padding: '6px 12px', 
            borderRadius: '10px', 
            border: '1px solid rgba(255, 255, 255, 0.2)' 
          }}
        >
          <Clock size={16} style={{ color: '#ffedd5' }} />
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff', fontFamily: 'monospace' }}>{formatHora(horaAtual)}</span>
        </div>

        {/* Pesquisa Global Trigger */}
        <div 
          className="desktop-only-search"
          onClick={onOpenSearch} 
          title="Pesquisar Qualquer Coisa no Sistema"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(255, 255, 255, 0.18)', 
            padding: '6px 14px', 
            borderRadius: '20px', 
            border: '1px solid rgba(255, 255, 255, 0.3)',
            cursor: 'pointer',
            color: '#ffffff',
            fontSize: '0.85rem'
          }}
        >
          <Search size={16} style={{ color: '#ffedd5' }} />
          <span>Pesquisar...</span>
        </div>

        {/* Botões de Ação Direta no Topo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Lupa em Celular */}
          <button 
            type="button" 
            className="action-btn-circle mobile-only-btn" 
            onClick={onOpenSearch} 
            title="Pesquisar"
          >
            <Search size={18} />
          </button>

          {/* Alertas & Notificações */}
          <button 
            type="button" 
            className="action-btn-circle" 
            onClick={onOpenNotifications} 
            title="Alertas & Notificações"
          >
            <Bell size={18} />
            {notificationCount > 0 && (
              <span className="badge-count">
                {notificationCount}
              </span>
            )}
          </button>

          {/* BOTÃO PRINCIPAL DE MENU RÁPIDO COM TODAS AS OPÇÕES DENTRO */}
          <button 
            type="button" 
            className="btn btn-orange" 
            onClick={() => setMenuRapidoOpen(true)}
            style={{ 
              padding: '6px 12px', 
              fontSize: '0.85rem', 
              fontWeight: 800, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              borderRadius: '10px',
              boxShadow: 'var(--shadow-orange-btn)'
            }}
            title="Abrir Menu com Instalar App, Link Público, Licença e Mais"
          >
            <MenuIcon size={18} />
            <span style={{ display: 'inline' }}>Opções ⚙️</span>
          </button>
        </div>
      </header>

      {/* MODAL / MENU DROPDOWN DE OPÇÕES ESCONDIDAS */}
      {menuRapidoOpen && (
        <div className="modal-overlay" onClick={() => setMenuRapidoOpen(false)} style={{ zIndex: 3500 }}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: '480px', 
              padding: '20px', 
              borderRadius: '20px', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              background: '#ffffff'
            }}
          >
            <div className="modal-header" style={{ marginBottom: '16px' }}>
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--blue-primary)', fontSize: '1.15rem' }}>
                <Sparkles size={22} style={{ color: 'var(--orange-primary)' }} /> Opções Rápidas do Sistema
              </h3>
              <button className="action-btn-circle" onClick={() => setMenuRapidoOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Lista de Opções Organizadas em Botões Elegantes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* 1. INSTALAR APPLICATIVO NO CELULAR OU PC */}
              {onInstallPWA && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuRapidoOpen(false);
                    onInstallPWA();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Smartphone size={20} />
                    <span>📱 Instalar Aplicativo no Celular / PC</span>
                  </div>
                  <ChevronRight size={18} />
                </button>
              )}

              {/* 2. LINK DE AGENDAMENTO PÚBLICO */}
              <button
                type="button"
                onClick={() => {
                  handleCopiarLinkPublico();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  background: copiado ? '#059669' : 'var(--orange-gradient)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-orange-btn)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {copiado ? <Check size={20} /> : <LinkIcon size={20} />}
                  <span>{copiado ? 'Link Copiado para a Área de Transferência! 📋' : '🔗 Copiar Link de Agendamento Público'}</span>
                </div>
                <ChevronRight size={18} />
              </button>

              {/* 3. GERENCIADOR DE LICENÇA */}
              <button
                type="button"
                onClick={() => {
                  setMenuRapidoOpen(false);
                  onOpenLicense();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  background: 'var(--blue-ice-bg)',
                  color: 'var(--blue-primary)',
                  border: '1.5px solid var(--blue-border)',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Key size={20} style={{ color: 'var(--orange-primary)' }} />
                  <span>Chave de Licença: <strong>{lic.diasValidade >= 9000 ? 'Vitalícia ⭐' : `${diasRestantes} dias restantes`}</strong></span>
                </div>
                <ChevronRight size={18} />
              </button>

              {/* 4. RELÓGIO DIGITAL & DATA */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: '#f8fafc',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
              >
                <Clock size={20} style={{ color: 'var(--blue-primary)' }} />
                <div>
                  <div style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '1rem', color: 'var(--blue-primary)' }}>
                    {formatHora(horaAtual)}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {formatData(horaAtual)}
                  </div>
                </div>
              </div>

              {/* 5. CALCULADORA COMERCIAL */}
              <button
                type="button"
                onClick={() => {
                  setMenuRapidoOpen(false);
                  onOpenCalc();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  background: '#ffffff',
                  color: 'var(--text-main)',
                  border: '1.5px solid #cbd5e1',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calculator size={18} style={{ color: 'var(--orange-primary)' }} />
                  <span>Calculadora Comercial</span>
                </div>
                <ChevronRight size={18} />
              </button>

              {/* 6. DADOS DA MINHA EMPRESA */}
              <button
                type="button"
                onClick={() => {
                  setMenuRapidoOpen(false);
                  onOpenEmpresa();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  background: '#ffffff',
                  color: 'var(--text-main)',
                  border: '1.5px solid #cbd5e1',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Building size={18} style={{ color: 'var(--blue-primary)' }} />
                  <span>Minha Empresa (Logo, CNPJ & Chave PIX)</span>
                </div>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
