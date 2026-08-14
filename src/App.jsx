import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Agenda from './components/Agenda';
import Tarefas from './components/Tarefas';
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
import { firebaseApi } from './utils/firebaseClient';
import { licenseApi } from './utils/licenseUtils';
import { playNotificationSound } from './utils/soundUtils';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
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
  Smartphone,
  Calculator as CalcIcon
} from 'lucide-react';

export default function App() {
  const checkIsPublicRoute = () => {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const pathname = window.location.pathname || '';
    return hash.includes('agendar') || search.includes('agendar') || pathname.includes('agendar');
  };

  const [isPublicRoute, setIsPublicRoute] = useState(checkIsPublicRoute);
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
  const [tarefas, setTarefas] = useState(() => storageApi.getTarefas());
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

  // Monitorar Alterações na URL (Navegação de Rota Pública e Privada)
  useEffect(() => {
    const handleUrlChange = () => {
      setIsPublicRoute(checkIsPublicRoute());
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
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
    storageApi.saveTarefas(tarefas);
  }, [tarefas]);

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

  // Sincronização Periódica com a Nuvem Google Firebase (Computador <-> Celular)
  useEffect(() => {
    const syncFromCloud = async () => {
      const cfg = firebaseApi.getConfig();
      if (!cfg.ativo) return;

      try {
        const remoteAgenda = await firebaseApi.fetchTable('eb_agenda');
        if (remoteAgenda && Array.isArray(remoteAgenda) && remoteAgenda.length > 0) {
          setAgenda(remoteAgenda);
        }

        const remoteClientes = await firebaseApi.fetchTable('eb_clientes');
        if (remoteClientes && Array.isArray(remoteClientes) && remoteClientes.length > 0) {
          setClientes(remoteClientes);
        }

        const remoteProdutos = await firebaseApi.fetchTable('eb_produtos');
        if (remoteProdutos && Array.isArray(remoteProdutos) && remoteProdutos.length > 0) {
          setProdutos(remoteProdutos);
        }

        const remoteTarefas = await firebaseApi.fetchTable('eb_tarefas');
        if (remoteTarefas && Array.isArray(remoteTarefas) && remoteTarefas.length > 0) {
          setTarefas(remoteTarefas);
        }

        const remoteFinanceiro = await firebaseApi.fetchTable('eb_financeiro');
        if (remoteFinanceiro && Array.isArray(remoteFinanceiro) && remoteFinanceiro.length > 0) {
          setFinanceiro(remoteFinanceiro);
        }

        const remoteEmpresa = await firebaseApi.fetchTable('eb_empresa');
        if (remoteEmpresa && Array.isArray(remoteEmpresa) && remoteEmpresa.length > 0) {
          const empObj = Array.isArray(remoteEmpresa) ? remoteEmpresa[0] : remoteEmpresa;
          if (empObj && typeof empObj === 'object') {
            setEmpresa(prev => ({ ...prev, ...empObj }));
          }
        }
      } catch (err) {
        console.warn('[CloudSync] Erro na sincronização com Firebase:', err);
      }
    };

    syncFromCloud();
    const interval = setInterval(syncFromCloud, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handlers para Atualizar Dados
  const handleSaveEmpresa = (novosDados) => setEmpresa(novosDados);
  const handleSaveClientes = (novos) => setClientes(novos);
  const handleDeleteCliente = (id) => setClientes(clientes.filter(c => c.id !== id));

  const handleSaveProdutos = (novos) => setProdutos(novos);
  const handleDeleteProduto = (id) => setProdutos(produtos.filter(p => p.id !== id));

  const handleSaveAgenda = (novos) => setAgenda(novos);
  const handleDeleteAgenda = (id) => setAgenda(agenda.filter(a => a.id !== id));

  const handleSaveTarefas = (novas) => setTarefas(novas);
  const handleDeleteTarefa = (id) => setTarefas(tarefas.filter(t => t.id !== id));

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
  const tarefasPendentes = tarefas.filter(t => !t.concluida);
  const notificationCount = estoqueBaixo.length + contasVencendo.length + compromissosPendentes.length + tarefasPendentes.length;

  // ROTA 1: PÁGINA PÚBLICA DE AGENDAMENTO ONLINE (#/agendar ou ?agendar ou /agendar)
  if (isPublicRoute) {
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
      {/* BANNER EM DESTAQUE DE NOVO AGENDAMENTO ONLINE REALIZADO */}
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
        {/* Sidebar Lateral Executiva Reformulada e Organizada */}
        <aside className="sidebar">
          {/* CARTÃO DE PERFIL DA EMPRESA E ATENDENTE NO TOPO DA SIDEBAR */}
          <div 
            onClick={() => setAbaAtiva('empresa')}
            style={{ 
              background: 'linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%)', 
              padding: '14px 16px', 
              borderRadius: '14px', 
              border: '2px solid var(--blue-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.06)'
            }}
            title="Clique para configurar dados da Empresa e Atendente"
          >
            {empresa.logo ? (
              <div style={{ width: '45px', height: '45px', borderRadius: '10px', overflow: 'hidden', background: '#fff', padding: '3px', border: '1.5px solid var(--blue-border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={empresa.logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
            ) : (
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--blue-gradient)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800 }}>
                <Building size={22} />
              </div>
            )}
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--blue-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {empresa.razaoSocial || empresa.nomeFantasia || 'Estúdio de Locução'}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}></span>
                <span>{empresa.nomeFuncionario ? `Atendente: ${empresa.nomeFuncionario.split(' ')[0]}` : 'Sistema Conectado'}</span>
              </div>
            </div>
          </div>

          {/* SEÇÃO 1: VISÃO GERAL */}
          <div className="nav-section">
            <div className="nav-section-title">📊 Visão Geral</div>
            <button className={`nav-btn ${abaAtiva === 'dashboard' ? 'active' : ''}`} onClick={() => setAbaAtiva('dashboard')}>
              <LayoutDashboard size={19} />
              <span style={{ flex: 1 }}>Painel Principal</span>
            </button>
          </div>

          {/* SEÇÃO 2: AGENDA & ATENDIMENTO */}
          <div className="nav-section">
            <div className="nav-section-title">💼 Agenda & Atendimento</div>
            <button className={`nav-btn ${abaAtiva === 'agenda' ? 'active' : ''}`} onClick={() => setAbaAtiva('agenda')}>
              <Calendar size={19} />
              <span style={{ flex: 1 }}>Agenda & Compromissos</span>
              {compromissosPendentes.length > 0 && (
                <span style={{ background: 'var(--orange-primary)', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                  {compromissosPendentes.length}
                </span>
              )}
            </button>
            <button className={`nav-btn ${abaAtiva === 'tarefas' ? 'active' : ''}`} onClick={() => setAbaAtiva('tarefas')}>
              <CheckSquare size={19} />
              <span style={{ flex: 1 }}>Tarefas & Afazeres</span>
              {tarefasPendentes.length > 0 && (
                <span style={{ background: '#0284c7', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                  {tarefasPendentes.length}
                </span>
              )}
            </button>
            <button className={`nav-btn ${abaAtiva === 'clientes' ? 'active' : ''}`} onClick={() => setAbaAtiva('clientes')}>
              <Users size={19} />
              <span style={{ flex: 1 }}>Gestão de Clientes</span>
            </button>
          </div>

          {/* SEÇÃO 3: PRODUTOS & VENDAS */}
          <div className="nav-section">
            <div className="nav-section-title">📦 Produtos & Vendas</div>
            <button className={`nav-btn ${abaAtiva === 'produtos' ? 'active' : ''}`} onClick={() => setAbaAtiva('produtos')}>
              <Package size={19} />
              <span style={{ flex: 1 }}>Produtos & Estoque</span>
              {estoqueBaixo.length > 0 && (
                <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                  {estoqueBaixo.length} alerta
                </span>
              )}
            </button>
            <button className={`nav-btn ${abaAtiva === 'historico_vendas' ? 'active' : ''}`} onClick={() => setAbaAtiva('historico_vendas')}>
              <History size={19} />
              <span style={{ flex: 1 }}>Registro de Vendas</span>
            </button>
          </div>

          {/* SEÇÃO 4: FINANCEIRO & DOCUMENTOS */}
          <div className="nav-section">
            <div className="nav-section-title">💵 Financeiro & Documentos</div>
            <button className={`nav-btn ${abaAtiva === 'financeiro' ? 'active' : ''}`} onClick={() => setAbaAtiva('financeiro')}>
              <DollarSign size={19} />
              <span style={{ flex: 1 }}>Financeiro (Caixa)</span>
              {contasVencendo.length > 0 && (
                <span style={{ background: '#f59e0b', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                  {contasVencendo.length}
                </span>
              )}
            </button>
            <button className={`nav-btn ${abaAtiva === 'orcamentos' ? 'active' : ''}`} onClick={() => setAbaAtiva('orcamentos')}>
              <FileText size={19} />
              <span style={{ flex: 1 }}>Orçamentos</span>
            </button>
            <button className={`nav-btn ${abaAtiva === 'recibos' ? 'active' : ''}`} onClick={() => setAbaAtiva('recibos')}>
              <Receipt size={19} />
              <span style={{ flex: 1 }}>Emissor de Recibos</span>
            </button>
            <button className="nav-btn" onClick={() => setCalcOpen(true)} style={{ color: '#ca8a04', background: '#fefce8', border: '1.5px solid #fde047', fontWeight: 800 }}>
              <CalcIcon size={19} />
              <span style={{ flex: 1 }}>🧮 Calculadora Rápida</span>
            </button>
          </div>

          {/* SEÇÃO 5: CONFIGURAÇÕES DO SISTEMA */}
          <div className="nav-section" style={{ marginTop: 'auto', paddingTop: '10px' }}>
            <div className="nav-section-title">⚙️ Sistema</div>
            <button className={`nav-btn ${abaAtiva === 'empresa' ? 'active' : ''}`} onClick={() => setAbaAtiva('empresa')}>
              <Building size={19} />
              <span style={{ flex: 1 }}>Minha Empresa & Logo</span>
            </button>
            <button className="nav-btn" onClick={handleInstallPWA} style={{ color: '#16a34a', fontWeight: 800, background: '#f0fdf4', border: '1.5px solid #bbf7d0' }}>
              <Smartphone size={19} />
              <span style={{ flex: 1 }}>Instalar App no Celular</span>
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

          {abaAtiva === 'tarefas' && (
            <Tarefas
              tarefas={tarefas}
              onSaveTarefas={handleSaveTarefas}
              onDeleteTarefa={handleDeleteTarefa}
            />
          )}

          {abaAtiva === 'clientes' && (
            <Clientes
              clientes={clientes}
              empresa={empresa}
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

      {/* Menu Inferior Celular & Tablet (INCLUINDO FINANCEIRO E TAREFAS) */}
      <nav className="mobile-bottom-bar" style={{ overflowX: 'auto', flexWrap: 'nowrap', justifyContent: 'flex-start', padding: '6px 8px' }}>
        <button className={`mobile-nav-btn ${abaAtiva === 'dashboard' ? 'active' : ''}`} onClick={() => setAbaAtiva('dashboard')}>
          <LayoutDashboard size={20} />
          <span>Painel</span>
        </button>

        <button className={`mobile-nav-btn ${abaAtiva === 'financeiro' ? 'active' : ''}`} onClick={() => setAbaAtiva('financeiro')}>
          <DollarSign size={20} />
          <span>Financeiro</span>
        </button>

        <button className={`mobile-nav-btn ${abaAtiva === 'agenda' ? 'active' : ''}`} onClick={() => setAbaAtiva('agenda')}>
          <Calendar size={20} />
          <span>Agenda</span>
        </button>

        <button className={`mobile-nav-btn ${abaAtiva === 'tarefas' ? 'active' : ''}`} onClick={() => setAbaAtiva('tarefas')}>
          <CheckSquare size={20} />
          <span>Tarefas</span>
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
              {/* Tarefas Pendentes */}
              {tarefasPendentes.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--orange-primary)', marginBottom: '8px' }}>
                    ☑️ Tarefas Pendentes ({tarefasPendentes.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {tarefasPendentes.map(t => (
                      <div key={t.id} style={{ background: '#fff7ed', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fed7aa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{t.titulo}</strong> ({t.categoria})
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            📅 Data Limite: {safeFormatDate(t.dataLimite)} às {t.horario}
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-orange"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => {
                            const at = tarefas.map(item => item.id === t.id ? { ...item, concluida: true } : item);
                            setTarefas(at);
                            playNotificationSound();
                            setNotifOpen(false);
                          }}
                        >
                          <CheckCircle size={14} /> Dar Baixa
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
