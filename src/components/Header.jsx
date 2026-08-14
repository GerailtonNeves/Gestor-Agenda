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
  ChevronRight,
  ExternalLink
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

  const handleAbrirPaginaPublica = () => {
    window.open(publicLink, '_blank');
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
          <div>
            <h1 className="topbar-title" style={{ fontSize: '1.05rem', margin: 0, lineHeight: '1.1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {empresa.razaoSocial || empresa.nomeFantasia || 'Escritório de Bolso'}
            </h1>
            <span className="topbar-subtitle" style={{ fontSize: '0.68rem', opacity: 0.9 }}>
              {empresa.ramoAtividade || 'Gestão Inteligente ERP'}
            </span>
          </div>
        </div>

        {/* Ações Rápidas no Topo */}
        <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* BOTÃO COMPACTO OPÇÕES ⚙️ (ABRE O MENU DROPDOWN ELEGANTE) */}
          <button 
            className="btn btn-sm btn-orange mobile-only-btn" 
            onClick={() => setMenuRapidoOpen(true)}
            style={{ fontWeight: 800, padding: '6px 12px', borderRadius: '10px', fontSize: '0.85rem' }}
          >
            Opções ⚙️
          </button>

          {/* BOTÃO LINK PÚBLICO RAPIDO (DESKTOP) */}
          <button 
            className="action-btn-circle desktop-only-search" 
            onClick={handleAbrirPaginaPublica} 
            title="Abrir Página Pública de Agendamentos em Nova Aba"
            style={{ background: 'var(--orange-gradient)' }}
          >
            <ExternalLink size={18} />
          </button>

          <button className="action-btn-circle desktop-only-search" onClick={onOpenSearch} title="Busca Global no Sistema (Ctrl + K)">
            <Search size={18} />
          </button>

          <button className="action-btn-circle" onClick={onOpenNotifications} title="Central de Alertas e Notificações">
            <Bell size={18} />
            {notificationCount > 0 && <span className="badge-count">{notificationCount}</span>}
          </button>

          <button 
            className="action-btn-circle desktop-only-search" 
            onClick={() => setMenuRapidoOpen(true)} 
            title="Abrir Todas as Opções do Sistema ⚙️"
          >
            <MenuIcon size={20} />
          </button>
        </div>
      </header>

      {/* MODAL DROPDOWN ELEGANTE DE TODAS AS OPÇÕES ⚙️ */}
      {menuRapidoOpen && (
        <div className="modal-overlay" onClick={() => setMenuRapidoOpen(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '440px', padding: '20px', borderRadius: '20px', border: '2px solid var(--orange-primary)' }}
          >
            <div className="modal-header" style={{ marginBottom: '16px', paddingBottom: '10px' }}>
              <h3 className="modal-title" style={{ color: 'var(--orange-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={22} /> Opções & Ferramentas ⚙️
              </h3>
              <button className="action-btn-circle" onClick={() => setMenuRapidoOpen(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* 1. INSTALAR APLICATIVO NATIVO PWA */}
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
                  background: '#ecfdf5',
                  color: '#047857',
                  border: '1.5px solid #6ee7b7',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Smartphone size={22} style={{ color: '#10b981' }} />
                  <span>📱 Instalar Aplicativo no Dispositivo</span>
                </div>
                <ChevronRight size={18} />
              </button>

              {/* 2. ABRIR PAGINA PUBLICA EM NOVA ABA */}
              <button
                type="button"
                onClick={() => {
                  setMenuRapidoOpen(false);
                  handleAbrirPaginaPublica();
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
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ExternalLink size={20} style={{ color: 'var(--blue-primary)' }} />
                  <span>🌐 Abrir Página Pública de Agendamento</span>
                </div>
                <ChevronRight size={18} />
              </button>

              {/* 3. COPIAR LINK PÚBLICO */}
              <button
                type="button"
                onClick={handleCopiarLinkPublico}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  background: 'var(--orange-gradient)',
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
                  <span>{copiado ? 'Link Copiado! 📋' : '🔗 Copiar Link de Agendamento'}</span>
                </div>
                <ChevronRight size={18} />
              </button>

              {/* 4. GERENCIADOR DE LICENÇA */}
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
                  <span>Chave de Licença: <strong>{lic.diasValidade >= 9000 ? 'Vitalícia ⭐' : `${diasRestantes} dias`}</strong></span>
                </div>
                <ChevronRight size={18} />
              </button>

              {/* 5. RELÓGIO DIGITAL & DATA */}
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

              {/* 6. CALCULADORA COMERCIAL */}
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
                  border: '1.5px solid var(--border-color)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calculator size={18} style={{ color: 'var(--blue-primary)' }} />
                  <span>Calculadora Comercial</span>
                </div>
                <ChevronRight size={18} />
              </button>

              {/* 7. CONFIGURAR MINHA EMPRESA */}
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
                  border: '1.5px solid var(--border-color)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Building size={18} style={{ color: 'var(--orange-primary)' }} />
                  <span>Minha Empresa (Logo / Dados)</span>
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
