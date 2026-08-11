import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Agenda from './components/Agenda';
import Clientes from './components/Clientes';
import Produtos from './components/Produtos';
import HistoricoVendas from './components/HistoricoVendas';
import Financeiro from './components/Financeiro';
import Orcamentos from './components/Orcamentos';
import Recibos from './components/Recibos';
import EmpresaConfig from './components/EmpresaConfig';
import Calculator from './components/Calculator';
import GlobalSearch from './components/GlobalSearch';
import AgendamentoPublico from './components/AgendamentoPublico';
import ModalLicenca from './components/ModalLicenca';
import TelaBloqueioLicenca from './components/TelaBloqueioLicenca';
import { storageApi, safeFormatDate } from './utils/storage';
import { licenseApi } from './utils/licenseUtils';
import { playNotificationSound } from './utils/soundUtils';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Package,
  History,
  DollarSign,
  FileText,
  Receipt,
  Building,
  Bell,
  CheckCircle,
  AlertCircle,
  X,
  Volume2,
  Smartphone
} from 'lucide-react';

export default function App() {
  const [currentHash, setCurrentHash] = useState(() => window.location.hash);
  const [abaAtiva, setAbaAtiva] = useState('dashboard');
  
  const [calcOpen, setCalcOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [licenseOpen, setLicenseOpen] = useState(false);

  // Estado de Bloqueio Instantâneo de Segurança do Sistema
  const [sistemaBloqueado, setSistemaBloqueado] = useState(() => licenseApi.isSystemBlocked());

  // Banner Alerta de Novo Agendamento Online em Tempo Real
  const [novoAgendamentoBanner, setNovoAgendamentoBanner] = useState(null);

  // Evento de Instalação Nativa PWA do Aplicativo
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Estados Globais de Dados
  const [empresa, setEmpresa] = useState(() => storageApi.getEmpresa());
  const [clientes, setClientes] = useState(() => storageApi.getClientes());
  const [produtos, setProdutos] = useState(() => storageApi.getProdutos());
  const [agenda, setAgenda] = useState(() => storageApi.getAgenda());
  const [financeiro, setFinanceiro] = useState(() => storageApi.getFinanceiro());
  const [orcamentos, setOrcamentos] = useState(() => storageApi.getOrcamentos());
  const [recibos, setRecibos] = useState(() => storageApi.getRecibos());
  const [vendas, setVendas] = useState(() => storageApi.getVendas());

  // OUVINTE DO EVENTO DE INSTALAÇÃO DO APLICATIVO NATIVO PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Usuário instalou o aplicativo Escritório de Bolso!');
        }
        setDeferredPrompt(null);
      });
    } else {
      alert('📲 Para instalar o Aplicativo Escritório de Bolso no seu dispositivo:\n\n📱 No Android (Chrome): Clique no menu (⋮) no canto superior do navegador e escolha "Instalar Aplicativo" ou "Adicionar à Tela Inicial".\n\n🍎 No iPhone (Safari): Clique no botão Compartilhar (⎋) e escolha "Adicionar à Tela de Início".\n\n💻 No Computador (Chrome/Edge): Clique no ícone de tela/instalar na barra de endereços do navegador!');
    }
  };

  // Monitorar Alterações no Hash da URL (Navegação de Rota)
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // OUVINTE EM TEMPO REAL DE VERIFICAÇÃO DE LICENÇA BLOQUEADA
  useEffect(() => {
    const checarStatusLicenca = () => {
      const blocked = licenseApi.isSystemBlocked();
      setSistemaBloqueado(blocked);
    };

    window.addEventListener('licenca_status_alterado', checarStatusLicenca);
    window.addEventListener('storage', checarStatusLicenca);

    return () => {
      window.removeEventListener('licenca_status_alterado', checarStatusLicenca);
      window.removeEventListener('storage', checarStatusLicenca);
    };
  }, []);

  // OUVINTE EM TEMPO REAL DE NOVOS AGENDAMENTOS ONLINE (COM SOM + ALERTA NA TELA)
  useEffect(() => {
    const processarNovoAgendamento = (ag) => {
      setAgenda(storageApi.getAgenda());
      playNotificationSound();
      setNovoAgendamentoBanner(ag);
    };

    let channel;
    try {
      channel = new BroadcastChannel('eb_agendamento_channel');
      channel.onmessage = (event) => {
        if (event.data && event.data.type === 'NOVO_AGENDAMENTO') {
          processarNovoAgendamento(event.data.agendamento);
        }
      };
    } catch (e) {
      console.log(e);
    }

    const handleStorage = (e) => {
      if (e.key === 'eb_agenda_v1') {
        const novaAgenda = storageApi.getAgenda();
        setAgenda(novaAgenda);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Salvar no localStorage sempre que houver alterações
  useEffect(() => {
    storageApi.saveEmpresa(empresa);
  }, [empresa]);

  useEffect(() => {
    storageApi.saveClientes(clientes);
  }, [clientes]);

  useEffect(() => {
    storageApi.saveProdutos(produtos);
  }, [produtos]);

  useEffect(() => {
    storageApi.saveAgenda(agenda);
  }, [agenda]);

  useEffect(() => {
    storageApi.saveFinanceiro(financeiro);
  }, [financeiro]);

  useEffect(() => {
    storageApi.saveOrcamentos(orcamentos);
  }, [orcamentos]);

  useEffect(() => {
    storageApi.saveRecibos(recibos);
  }, [recibos]);

  useEffect(() => {
    storageApi.saveVendas(vendas);
  }, [vendas]);

  // Handlers para Atualizar Dados
  const handleSaveEmpresa = (novosDados) => setEmpresa(novosDados);
  const handleSaveClientes = (novos) => setClientes(novos);
  const handleDeleteCliente = (id) => setClientes(clientes.filter(c => c.id !== id));

  const handleSaveProdutos = (novos) => setProdutos(novos);
  const handleDeleteProduto = (id) => setProdutos(produtos.filter(p => p.id !== id));

  const handleSaveAgenda = (novos) => setAgenda(novos);
  const handleDeleteAgenda = (id) => setAgenda(agenda.filter(a => a.id !== id));

  const handleToggleConcluidoAgenda = (id, concluidoStatus) => {
    const agFound = agenda.find(a => a.id === id);
    if (!agFound) return;

    const novaAgenda = agenda.map(a => a.id === id ? { ...a, concluido: concluidoStatus } : a);
    setAgenda(novaAgenda);

    if (concluidoStatus && agFound.valor > 0) {
      const lancamentoExistente = financeiro.find(f => f.agendaRefId === id);
      if (!lancamentoExistente) {
        const novaReceita = {
          id: 'fin_ag_' + Date.now(),
          agendaRefId: id,
          tipo: 'receita',
          descricao: `Serviço Concluído: ${agFound.titulo} (${agFound.clienteNome || 'Cliente'})`,
          valor: parseFloat(agFound.valor),
          dataVencimento: agFound.data || new Date().toISOString().split('T')[0],
          status: 'Pago',
          categoria: 'Serviços / Agenda'
        };
        setFinanceiro([novaReceita, ...financeiro]);
      }
    }
  };

  const handleSaveFinanceiro = (novos) => setFinanceiro(novos);
  const handleDeleteFinanceiro = (id) => setFinanceiro(financeiro.filter(f => f.id !== id));

  const handleSaveOrcamentos = (novos) => setOrcamentos(novos);
  const handleDeleteOrcamento = (id) => setOrcamentos(orcamentos.filter(o => o.id !== id));

  const handleSaveRecibos = (novos) => setRecibos(novos);
  const handleDeleteRecibo = (id) => setRecibos(recibos.filter(r => r.id !== id));

  const handleDeleteVenda = (id) => setVendas(vendas.filter(v => v.id !== id));

  // Alertas da Central
  const estoqueBaixo = produtos.filter(p => p.estoque <= (p.estoqueMinimo || 5));
  const contasVencendo = financeiro.filter(f => f.status === 'Pendente');
  const compromissosPendentes = agenda.filter(a => !a.concluido);
  const notificationCount = estoqueBaixo.length + contasVencendo.length + compromissosPendentes.length;

  // ROTA 1: PÁGINA PÚBLICA DE AGENDAMENTO ONLINE (#/agendar ou ?agendar)
  if (currentHash === '#/agendar' || currentHash.includes('agendar')) {
    return <AgendamentoPublico />;
  }

  // BLOQUEIO TOTAL E INSTANTÂNEO SE LICENÇA ESTIVER BLOQUEADA OU EXPIRADA
  if (sistemaBloqueado) {
    return (
      <TelaBloqueioLicenca
        onUnlockSuccess={() => setSistemaBloqueado(false)}
      />
    );
  }

  // ROTA 2: APLICAÇÃO PRINCIPAL DE GESTÃO DO PROPRIETÁRIO
  return (
    <div className="app-container">
      {/* BANNER EM DESTAQUE DE NOVO AGENDAMENTO ONLINE REALIZADO (COM SOM E BOTÃO DE IR PARA AGENDA) */}
      {novoAgendamentoBanner && (
        <div style={{
          position: 'fixed',
          top: '70px',
          right: '20px',
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          color: '#ffffff',
          padding: '16px 20px',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(234, 88, 12, 0.4)',
          zIndex: 3000,
          maxWidth: '420px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          border: '2px solid #ffffff',
          animation: 'slideIn 0.3s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Volume2 size={22} /> 🔔 NOVO AGENDAMENTO ONLINE!
            </div>
            <button className="action-btn-circle" style={{ width: '28px', height: '28px' }} onClick={() => setNovoAgendamentoBanner(null)}>✕</button>
          </div>

          <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
            <strong>{novoAgendamentoBanner.clienteNome}</strong> agendou o serviço <strong>"{novoAgendamentoBanner.titulo}"</strong> para o dia <strong>{safeFormatDate(novoAgendamentoBanner.data)}</strong> às <strong>{novoAgendamentoBanner.horario}</strong>!
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button 
              className="btn btn-sm" 
              style={{ background: '#ffffff', color: '#ea580c', fontWeight: 800, width: '100%' }}
              onClick={() => {
                setAbaAtiva('agenda');
                setNovoAgendamentoBanner(null);
              }}
            >
              🗓️ Ver na Agenda
            </button>
          </div>
        </div>
      )}

      {/* Topbar / Cabeçalho */}
      <Header
        empresa={empresa}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenCalc={() => setCalcOpen(true)}
        onOpenNotifications={() => setNotifOpen(true)}
        onOpenEmpresa={() => setAbaAtiva('empresa')}
        onOpenLicense={() => setLicenseOpen(true)}
        onInstallPWA={handleInstallPWA}
        notificationCount={notificationCount}
      />

      <div className="app-layout">
        {/* Sidebar Lateral Organizada em Seções */}
        <aside className="sidebar">
          {/* Seção 1: Visão Geral */}
          <div className="nav-section">
            <div className="nav-section-title">📊 Visão Geral</div>
            <button className={`nav-btn ${abaAtiva === 'dashboard' ? 'active-orange' : ''}`} onClick={() => setAbaAtiva('dashboard')}>
              <LayoutDashboard size={20} /> Painel Principal
            </button>
          </div>

          {/* Seção 2: Operacional */}
          <div className="nav-section">
            <div className="nav-section-title">💼 Agenda & Clientes</div>
            <button className={`nav-btn ${abaAtiva === 'agenda' ? 'active-orange' : ''}`} onClick={() => setAbaAtiva('agenda')}>
              <Calendar size={20} /> Agenda & Compromissos
            </button>
            <button className={`nav-btn ${abaAtiva === 'clientes' ? 'active-blue' : ''}`} onClick={() => setAbaAtiva('clientes')}>
              <Users size={20} /> Clientes
            </button>
          </div>

          {/* Seção 3: Estoque & Registro */}
          <div className="nav-section">
            <div className="nav-section-title">📦 Produtos & Vendas</div>
            <button className={`nav-btn ${abaAtiva === 'produtos' ? 'active-blue' : ''}`} onClick={() => setAbaAtiva('produtos')}>
              <Package size={20} /> Produtos & Estoque
            </button>
            <button className={`nav-btn ${abaAtiva === 'historico_vendas' ? 'active-orange' : ''}`} onClick={() => setAbaAtiva('historico_vendas')}>
              <History size={20} /> Registro de Vendas
            </button>
          </div>

          {/* Seção 4: Financeiro & Documentos */}
          <div className="nav-section">
            <div className="nav-section-title">💵 Financeiro & Documentos</div>
            <button className={`nav-btn ${abaAtiva === 'financeiro' ? 'active-blue' : ''}`} onClick={() => setAbaAtiva('financeiro')}>
              <DollarSign size={20} /> Financeiro (Pagar/Receber)
            </button>
            <button className={`nav-btn ${abaAtiva === 'orcamentos' ? 'active-orange' : ''}`} onClick={() => setAbaAtiva('orcamentos')}>
              <FileText size={20} /> Orçamentos
            </button>
            <button className={`nav-btn ${abaAtiva === 'recibos' ? 'active-blue' : ''}`} onClick={() => setAbaAtiva('recibos')}>
              <Receipt size={20} /> Recibos
            </button>
          </div>

          {/* Seção 5: Configurações do Sistema */}
          <div className="nav-section" style={{ marginTop: 'auto' }}>
            <div className="nav-section-title">⚙️ Sistema</div>
            <button className={`nav-btn ${abaAtiva === 'empresa' ? 'active-blue' : ''}`} onClick={() => setAbaAtiva('empresa')}>
              <Building size={20} /> Minha Empresa (Logo / PIX)
            </button>
            <button className="nav-btn" onClick={handleInstallPWA} style={{ color: '#10b981', fontWeight: 800, background: '#ecfdf5' }}>
              <Smartphone size={20} /> Instalar Aplicativo
            </button>
          </div>
        </aside>

        {/* Conteúdo Principal */}
        <main className="main-content">
          {abaAtiva === 'dashboard' && (
            <Dashboard
              agenda={agenda}
              financeiro={financeiro}
              produtos={produtos}
              clientes={clientes}
              empresa={empresa}
              setAbaAtiva={setAbaAtiva}
              onNavigate={setAbaAtiva}
            />
          )}

          {abaAtiva === 'agenda' && (
            <Agenda
              agenda={agenda}
              clientes={clientes}
              produtos={produtos}
              empresa={empresa}
              onSaveAgenda={handleSaveAgenda}
              onDeleteAgenda={handleDeleteAgenda}
              onToggleConcluidoAgenda={handleToggleConcluidoAgenda}
            />
          )}

          {abaAtiva === 'clientes' && (
            <Clientes
              clientes={clientes}
              onSaveClientes={handleSaveClientes}
              onDeleteCliente={handleDeleteCliente}
            />
          )}

          {abaAtiva === 'produtos' && (
            <Produtos
              produtos={produtos}
              onSaveProdutos={handleSaveProdutos}
              onDeleteProduto={handleDeleteProduto}
            />
          )}

          {abaAtiva === 'historico_vendas' && (
            <HistoricoVendas
              vendas={vendas}
              empresa={empresa}
              onDeleteVenda={handleDeleteVenda}
            />
          )}

          {abaAtiva === 'financeiro' && (
            <Financeiro
              financeiro={financeiro}
              recibos={recibos}
              clientes={clientes}
              empresa={empresa}
              onSaveFinanceiro={handleSaveFinanceiro}
              onSaveRecibos={handleSaveRecibos}
              onDeleteFinanceiro={handleDeleteFinanceiro}
            />
          )}

          {abaAtiva === 'orcamentos' && (
            <Orcamentos
              orcamentos={orcamentos}
              clientes={clientes}
              produtos={produtos}
              empresa={empresa}
              onSaveOrcamentos={handleSaveOrcamentos}
              onDeleteOrcamento={handleDeleteOrcamento}
            />
          )}

          {abaAtiva === 'recibos' && (
            <Recibos
              recibos={recibos}
              clientes={clientes}
              produtos={produtos}
              empresa={empresa}
              onSaveRecibos={handleSaveRecibos}
              onDeleteRecibo={handleDeleteRecibo}
            />
          )}

          {abaAtiva === 'empresa' && (
            <EmpresaConfig
              empresa={empresa}
              onSaveEmpresa={handleSaveEmpresa}
            />
          )}
        </main>
      </div>

      {/* Menu Inferior Celular & Tablet */}
      <nav className="mobile-bottom-bar">
        <button className={`mobile-nav-btn ${abaAtiva === 'dashboard' ? 'active' : ''}`} onClick={() => setAbaAtiva('dashboard')}>
          <LayoutDashboard size={20} />
          <span>Painel</span>
        </button>

        <button className={`mobile-nav-btn ${abaAtiva === 'agenda' ? 'active' : ''}`} onClick={() => setAbaAtiva('agenda')}>
          <Calendar size={20} />
          <span>Agenda</span>
        </button>

        <button className={`mobile-nav-btn ${abaAtiva === 'produtos' ? 'active' : ''}`} onClick={() => setAbaAtiva('produtos')}>
          <Package size={20} />
          <span>Estoque</span>
        </button>

        <button className={`mobile-nav-btn ${abaAtiva === 'orcamentos' ? 'active' : ''}`} onClick={() => setAbaAtiva('orcamentos')}>
          <FileText size={20} />
          <span>Orçamentos</span>
        </button>

        <button className={`mobile-nav-btn ${abaAtiva === 'recibos' ? 'active' : ''}`} onClick={() => setAbaAtiva('recibos')}>
          <Receipt size={20} />
          <span>Recibos</span>
        </button>
      </nav>

      {/* Modais Globais */}
      {calcOpen && <Calculator isOpen={calcOpen} onClose={() => setCalcOpen(false)} />}

      {licenseOpen && (
        <ModalLicenca
          isOpen={licenseOpen}
          onClose={() => setLicenseOpen(false)}
          onUpdateLicense={() => setLicenseOpen(false)}
        />
      )}
      
      {searchOpen && (
        <GlobalSearch
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
          clientes={clientes}
          produtos={produtos}
          agenda={agenda}
          financeiro={financeiro}
          orcamentos={orcamentos}
          recibos={recibos}
          onNavigate={setAbaAtiva}
        />
      )}

      {/* MODAL DE NOTIFICAÇÕES E ALERTAS */}
      {notifOpen && (
        <div className="modal-overlay" onClick={() => setNotifOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--orange-primary)' }}>
                <Bell size={20} /> Central de Alertas e Notificações ({notificationCount})
              </h3>
              <button className="action-btn-circle" onClick={() => setNotifOpen(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Compromissos Pendentes da Agenda */}
              {compromissosPendentes.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--blue-primary)', marginBottom: '8px' }}>
                    🗓️ Compromissos Pendentes na Agenda ({compromissosPendentes.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {compromissosPendentes.map(ag => (
                      <div key={ag.id} style={{ background: '#fff7ed', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fed7aa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{ag.titulo}</strong> ({ag.clienteNome})
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            📅 {ag.data} às ⏰ {ag.horario} {ag.valor > 0 ? `• R$ ${Number(ag.valor).toFixed(2)}` : ''}
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-orange"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => {
                            handleToggleConcluidoAgenda(ag.id, true);
                            setNotifOpen(false);
                          }}
                        >
                          <CheckCircle size={14} /> Concluir
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Estoque Baixo */}
              {estoqueBaixo.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#dc2626', marginBottom: '8px' }}>
                    📦 Alerta de Estoque Mínimo ({estoqueBaixo.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {estoqueBaixo.map(p => (
                      <div key={p.id} style={{ background: '#fee2e2', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fca5a5', fontSize: '0.85rem' }}>
                        <strong>{p.nome}</strong> - Restam apenas <span style={{ color: '#dc2626', fontWeight: 800 }}>{p.estoque} un</span> (Mínimo: {p.estoqueMinimo || 5})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contas a Pagar / Receber Pendentes */}
              {contasVencendo.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--orange-primary)', marginBottom: '8px' }}>
                    💵 Contas a Pagar/Receber Pendentes ({contasVencendo.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {contasVencendo.map(f => (
                      <div key={f.id} style={{ background: '#fff7ed', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fed7aa', fontSize: '0.85rem' }}>
                        <strong>{f.descricao}</strong> - R$ {Number(f.valor).toFixed(2)} (Vencimento: {f.dataVencimento})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {notificationCount === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                  Nenhuma notificação no momento! Seu sistema está 100% em dia.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
