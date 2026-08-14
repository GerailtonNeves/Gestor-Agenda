import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  CheckCircle, 
  Clock, 
  Send, 
  Trash2, 
  Filter, 
  AlertCircle, 
  Edit, 
  DollarSign, 
  Layers, 
  PlusCircle, 
  X,
  ChevronLeft,
  ChevronRight,
  List,
  Grid,
  ThumbsUp,
  MessageSquare,
  Sun,
  Mic,
  CalendarCheck,
  Smartphone,
  User
} from 'lucide-react';
import { abrirWhatsapp, msgWhatsapp } from '../utils/whatsapp';
import { safeFormatDate, formatMoney } from '../utils/storage';
import { playNotificationSound } from '../utils/soundUtils';

const parseVal = (val) => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  let str = String(val).replace(/[^0-9.,]/g, '');
  if (str.includes(',') && str.includes('.')) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes(',')) {
    str = str.replace(',', '.');
  }
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
};

export default function Agenda({ agenda = [], clientes = [], produtos = [], empresa = {}, onSaveAgenda, onDeleteAgenda, onToggleConcluidoAgenda, esconderValores = false }) {
  const [modoVisao, setModoVisao] = useState('calendario'); // 'calendario' ou 'lista'
  const [dataMesAtual, setDataMesAtual] = useState(new Date());

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMultiploOpen, setModalMultiploOpen] = useState(false);
  const [diaDetalhesDate, setDiaDetalhesDate] = useState(null);

  const [editId, setEditId] = useState(null);
  const [filtro, setFiltro] = useState('todos'); // 'todos', 'pendentes', 'concluidos', 'amanha'
  const [dataFiltro, setDataFiltro] = useState('');
  const [toastAlert, setToastAlert] = useState(null);

  // Form State Simples
  const [titulo, setTitulo] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [clienteNomeCustom, setClienteNomeCustom] = useState('');
  const [clienteTelefoneCustom, setClienteTelefoneCustom] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [horario, setHorario] = useState('09:00');
  const [diaInteiro, setDiaInteiro] = useState(false);
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState('Normal');

  // Form State Agendamento Múltiplo
  const [multiTitulo, setMultiTitulo] = useState('');
  const [multiClienteId, setMultiClienteId] = useState('');
  const [multiClienteNomeCustom, setMultiClienteNomeCustom] = useState('');
  const [multiClienteTelefoneCustom, setMultiClienteTelefoneCustom] = useState('');
  const [multiHorario, setMultiHorario] = useState('09:00');
  const [multiValor, setMultiValor] = useState('');
  const [multiDescricao, setMultiDescricao] = useState('');
  const [multiPrioridade, setMultiPrioridade] = useState('Normal');
  
  const [tipoSelecaoDias, setTipoSelecaoDias] = useState('manual');
  const [dataInputAdicionar, setDataInputAdicionar] = useState(new Date().toISOString().split('T')[0]);
  const [listaDatasEscolhidas, setListaDatasEscolhidas] = useState([]);

  const [dataInicioRec, setDataInicioRec] = useState(new Date().toISOString().split('T')[0]);
  const [dataFimRec, setDataFimRec] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });
  const [diasSemana, setDiasSemana] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    0: false
  });

  const triggerToast = (msg) => {
    setToastAlert(msg);
    setTimeout(() => setToastAlert(null), 4000);
  };

  // EXCLUIR COMPROMISSO COM CONFIRMAÇÃO SEGURA
  const handleExcluirCompromisso = (id, tituloCompromisso = '') => {
    if (window.confirm(`Tem certeza que deseja excluir o compromisso "${tituloCompromisso || 'selecionado'}"?`)) {
      onDeleteAgenda(id);
      if (modalOpen) setModalOpen(false);
      triggerToast(`🗑️ Compromisso "${tituloCompromisso || 'Removido'}" excluído da agenda!`);
    }
  };

  // SELEÇÃO DE SERVIÇO / PRODUTO CADASTRADO PARA AGENDAMENTO ÚNICO
  const selecionarServicoParaAgenda = (e) => {
    const prodId = e.target.value;
    if (!prodId) return;
    const prod = produtos.find(p => String(p.id) === String(prodId));
    if (prod) {
      setTitulo(prod.nome || '');
      const valNum = parseVal(prod.precoVenda ?? prod.preco ?? prod.valorUnitario ?? 0);
      if (valNum > 0) setValor(String(valNum));
    }
  };

  // SELEÇÃO DE SERVIÇO / PRODUTO CADASTRADO PARA AGENDAMENTO MÚLTIPLO
  const selecionarServicoParaMultiAgenda = (e) => {
    const prodId = e.target.value;
    if (!prodId) return;
    const prod = produtos.find(p => String(p.id) === String(prodId));
    if (prod) {
      setMultiTitulo(prod.nome || '');
      const valNum = parseVal(prod.precoVenda ?? prod.preco ?? prod.valorUnitario ?? 0);
      if (valNum > 0) setMultiValor(String(valNum));
    }
  };

  const abrirModalNovoParaData = (dataTarget) => {
    setEditId(null);
    setTitulo('');
    setClienteId('');
    setClienteNomeCustom('');
    setClienteTelefoneCustom('');
    setData(dataTarget || new Date().toISOString().split('T')[0]);
    setHorario('09:00');
    setDiaInteiro(false);
    setValor('');
    setDescricao('');
    setPrioridade('Normal');
    setModalOpen(true);
  };

  const abrirModalNovo = () => abrirModalNovoParaData(new Date().toISOString().split('T')[0]);

  const abrirModalMultiplo = () => {
    setMultiTitulo('');
    setMultiClienteId('');
    setMultiClienteNomeCustom('');
    setMultiClienteTelefoneCustom('');
    setMultiHorario('09:00');
    setMultiValor('');
    setMultiDescricao('');
    setMultiPrioridade('Normal');
    setTipoSelecaoDias('manual');
    setDataInputAdicionar(new Date().toISOString().split('T')[0]);
    setListaDatasEscolhidas([new Date().toISOString().split('T')[0]]);
    setModalMultiploOpen(true);
  };

  const abrirModalEditar = (ag) => {
    setEditId(ag.id);
    setTitulo(ag.titulo || '');
    setClienteId(ag.clienteId || '');
    setClienteNomeCustom(ag.clienteNome || '');
    setClienteTelefoneCustom(ag.clienteTelefone || '');
    setData(ag.data || new Date().toISOString().split('T')[0]);
    setHorario(ag.horario || '09:00');
    setDiaInteiro(!!ag.diaInteiro || ag.horario === 'Dia Inteiro');
    setValor(ag.valor ? String(ag.valor) : '');
    setDescricao(ag.descricao || '');
    setPrioridade(ag.prioridade || 'Normal');
    setModalOpen(true);
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    // VERIFICAÇÃO DE CONFLITO DE DATA E HORÁRIO
    if (!editId) {
      const conflitoDiaInteiro = agenda.find(a => a.data === data && a.diaInteiro);
      if (conflitoDiaInteiro) {
        alert(`❌ A data ${safeFormatDate(data)} já possui um compromisso de DIA INTEIRO ("${conflitoDiaInteiro.titulo}"). Escolha outra data.`);
        return;
      }

      if (diaInteiro) {
        const existeCompromisso = agenda.find(a => a.data === data);
        if (existeCompromisso) {
          alert(`❌ A data ${safeFormatDate(data)} já possui compromissos agendados. Não é possível marcar o dia inteiro.`);
          return;
        }
      } else {
        const conflitoHorario = agenda.find(a => a.data === data && a.horario === horario);
        if (conflitoHorario) {
          alert(`❌ A data ${safeFormatDate(data)} às ${horario} já se encontra OCUPADA por outro agendamento ("${conflitoHorario.titulo}"). Escolha outro horário.`);
          return;
        }
      }
    }

    let nomeClienteFinal = clienteNomeCustom;
    let telCliente = clienteTelefoneCustom;

    if (clienteId) {
      const cliFound = clientes.find(c => String(c.id) === String(clienteId));
      if (cliFound) {
        nomeClienteFinal = cliFound.nome;
        telCliente = cliFound.whatsapp || cliFound.telefone || telCliente;
      }
    }

    const valorNum = parseFloat(valor) || 0;

    if (editId) {
      const atualizados = agenda.map(a => {
        if (a.id === editId) {
          return {
            ...a,
            titulo,
            clienteId,
            clienteNome: nomeClienteFinal || 'Cliente Não Especificado',
            clienteTelefone: telCliente || a.clienteTelefone || '',
            data,
            horario: diaInteiro ? 'Dia Inteiro' : horario,
            diaInteiro: !!diaInteiro,
            valor: valorNum,
            descricao,
            prioridade
          };
        }
        return a;
      });
      onSaveAgenda(atualizados);
      triggerToast(`✏️ Agendamento "${titulo}" atualizado!`);
    } else {
      const novoAgendamento = {
        id: 'ag_' + Date.now(),
        titulo,
        clienteId,
        clienteNome: nomeClienteFinal || 'Cliente Não Especificado',
        clienteTelefone: telCliente || '',
        data,
        horario: diaInteiro ? 'Dia Inteiro' : horario,
        diaInteiro: !!diaInteiro,
        valor: valorNum,
        descricao,
        concluido: false,
        prioridade
      };
      onSaveAgenda([...agenda, novoAgendamento]);
      playNotificationSound();

      if (window.confirm(`✨ Agendamento registrado com sucesso!\n\nDeseja enviar a mensagem de confirmação diretamente para o WhatsApp de ${nomeClienteFinal || 'Cliente'} agora?`)) {
        abrirWhatsapp(telCliente || empresa.whatsapp, msgWhatsapp.confirmacaoNovoAgendamento(novoAgendamento, empresa));
      }

      triggerToast(`✨ Agendamento "${titulo}" adicionado para ${safeFormatDate(data)} ${diaInteiro ? '(Dia Inteiro)' : 'às ' + horario}!`);
    }

    setModalOpen(false);
  };

  const adicionarDataManual = () => {
    if (!dataInputAdicionar) return;
    if (listaDatasEscolhidas.includes(dataInputAdicionar)) {
      alert('⚠️ Esta data já foi adicionada na lista.');
      return;
    }
    const novaLista = [...listaDatasEscolhidas, dataInputAdicionar].sort();
    setListaDatasEscolhidas(novaLista);
  };

  const removerDataManual = (dataParaRemover) => {
    setListaDatasEscolhidas(prev => prev.filter(d => d !== dataParaRemover));
  };

  const gerarDatasRecorrentes = () => {
    const datasGeradas = [];
    const inicio = new Date(dataInicioRec + 'T00:00:00');
    const fim = new Date(dataFimRec + 'T00:00:00');

    if (inicio > fim) {
      alert('⚠️ A data inicial não pode ser posterior à data final.');
      return;
    }

    const curr = new Date(inicio);
    while (curr <= fim) {
      const dayOfWeek = curr.getDay();
      if (diasSemana[dayOfWeek]) {
        const dateStr = curr.toISOString().split('T')[0];
        datasGeradas.push(dateStr);
      }
      curr.setDate(curr.getDate() + 1);
    }

    if (datasGeradas.length === 0) {
      alert('⚠️ Nenhuma data foi gerada. Marque ao menos um dia da semana (ex: Segunda, Quarta).');
      return;
    }

    setListaDatasEscolhidas(datasGeradas);
    setTipoSelecaoDias('manual');
    triggerToast(`✨ ${datasGeradas.length} datas geradas no período!`);
  };

  const handleSalvarMultiplos = (e) => {
    e.preventDefault();
    if (!multiTitulo.trim()) {
      alert('⚠️ Digite o título do serviço/compromisso.');
      return;
    }
    if (listaDatasEscolhidas.length === 0) {
      alert('⚠️ Escolha ao menos uma data para agendar.');
      return;
    }

    let nomeClienteFinal = multiClienteNomeCustom;
    let telCliente = multiClienteTelefoneCustom;
    if (multiClienteId) {
      const cliFound = clientes.find(c => String(c.id) === String(multiClienteId));
      if (cliFound) {
        nomeClienteFinal = cliFound.nome;
        telCliente = cliFound.whatsapp || cliFound.telefone || telCliente;
      }
    }

    const valorNum = parseFloat(multiValor) || 0;
    const novosAgendamentos = listaDatasEscolhidas.map((d, index) => ({
      id: 'ag_' + (Date.now() + index),
      titulo: multiTitulo.trim(),
      clienteId: multiClienteId,
      clienteNome: nomeClienteFinal || 'Cliente Não Especificado',
      clienteTelefone: telCliente || '',
      data: d,
      horario: multiHorario,
      valor: valorNum,
      descricao: multiDescricao,
      concluido: false,
      prioridade: multiPrioridade
    }));

    onSaveAgenda([...agenda, ...novosAgendamentos]);
    playNotificationSound();
    triggerToast(`🎉 Sucesso! ${novosAgendamentos.length} agendamentos criados de uma só vez!`);
    setModalMultiploOpen(false);

    if (window.confirm(`🎉 Sucesso! ${novosAgendamentos.length} agendamentos criados de uma só vez!\n\nDeseja enviar a mensagem de confirmação do Agendamento Múltiplo para o WhatsApp de ${nomeClienteFinal || 'Cliente'} agora?`)) {
      abrirWhatsapp(
        telCliente || empresa.whatsapp,
        msgWhatsapp.confirmacaoAgendamentoMultiplo(
          nomeClienteFinal || 'Cliente',
          multiTitulo.trim(),
          multiHorario,
          listaDatasEscolhidas,
          empresa
        )
      );
    }
  };

  const handleConcluir = (ag) => {
    const novoStatus = !ag.concluido;
    if (onToggleConcluidoAgenda) {
      onToggleConcluidoAgenda(ag.id, novoStatus);
    } else {
      const atualizada = agenda.map(a => a.id === ag.id ? { ...a, concluido: novoStatus } : a);
      onSaveAgenda(atualizada);
    }

    if (novoStatus) {
      const valStr = ag.valor > 0 ? ` (R$ ${Number(ag.valor).toFixed(2)} lançado nas Receitas!)` : '';
      triggerToast(`✅ Compromisso "${ag.titulo}" Concluído com Sucesso!${valStr}`);
    } else {
      triggerToast(`🔄 Compromisso reaberto.`);
    }
  };

  // NAVEGAÇÃO DO CALENDÁRIO MENSAL
  const handleMesAnterior = () => {
    const d = new Date(dataMesAtual);
    d.setMonth(d.getMonth() - 1);
    setDataMesAtual(d);
  };

  const handleMesProximo = () => {
    const d = new Date(dataMesAtual);
    d.setMonth(d.getMonth() + 1);
    setDataMesAtual(d);
  };

  const handleHoje = () => {
    setDataMesAtual(new Date());
  };

  const nomeMes = dataMesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const anoAtual = dataMesAtual.getFullYear();
  const mesIndex = dataMesAtual.getMonth();

  // Calcular Data de Amanhã
  const amanhaObj = new Date();
  amanhaObj.setDate(amanhaObj.getDate() + 1);
  const dataAmanhaStr = amanhaObj.toISOString().split('T')[0];

  const getDiasCalendario = () => {
    const primeiroDia = new Date(anoAtual, mesIndex, 1);
    const ultimoDia = new Date(anoAtual, mesIndex + 1, 0);

    const diaSemanaInicio = primeiroDia.getDay();
    const totalDiasMes = ultimoDia.getDate();

    const hojeStr = new Date().toISOString().split('T')[0];

    const celulas = [];

    const mesAnteriorUltimoDia = new Date(anoAtual, mesIndex, 0).getDate();
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      const diaNum = mesAnteriorUltimoDia - i;
      const dataObj = new Date(anoAtual, mesIndex - 1, diaNum);
      const dateStr = dataObj.toISOString().split('T')[0];
      celulas.push({
        diaNum,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === hojeStr
      });
    }

    for (let d = 1; d <= totalDiasMes; d++) {
      const dateStr = `${anoAtual}-${String(mesIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      celulas.push({
        diaNum: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === hojeStr
      });
    }

    const totalCelulasNecessarias = celulas.length > 35 ? 42 : 35;
    const faltam = totalCelulasNecessarias - celulas.length;
    for (let i = 1; i <= faltam; i++) {
      const dataObj = new Date(anoAtual, mesIndex + 1, i);
      const dateStr = dataObj.toISOString().split('T')[0];
      celulas.push({
        diaNum: i,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === hojeStr
      });
    }

    return celulas;
  };

  const celulasCalendario = getDiasCalendario();

  let agendaFiltrada = agenda.filter(a => {
    if (filtro === 'pendentes') return !a.concluido;
    if (filtro === 'concluidos') return a.concluido;
    if (filtro === 'amanha') return a.data === dataAmanhaStr;
    return true;
  });

  if (dataFiltro) {
    agendaFiltrada = agendaFiltrada.filter(a => a.data === dataFiltro);
  }

  agendaFiltrada.sort((a, b) => {
    if (a.data !== b.data) return a.data.localeCompare(b.data);
    return a.horario.localeCompare(b.horario);
  });

  const compromissosDiaSelecionado = diaDetalhesDate ? agenda.filter(a => a.data === diaDetalhesDate) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Alert Banner */}
      {toastAlert && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          background: 'var(--orange-gradient)',
          color: '#fff',
          padding: '14px 20px',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-orange-btn)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 3500,
          fontWeight: 700,
          animation: 'slideIn 0.3s ease'
        }}>
          <AlertCircle size={20} />
          <span>{toastAlert}</span>
        </div>
      )}

      {/* Cabeçalho do Módulo */}
      <div className="card card-orange" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--orange-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mic size={26} /> Agenda de Locução & Compromissos
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Envie mensagens de confirmação e lembretes de gravação direto no WhatsApp do cliente!
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={abrirModalMultiplo} style={{ background: '#ffffff', borderColor: 'var(--orange-primary)', color: 'var(--orange-primary)' }}>
            <Layers size={18} /> Agendamento Múltiplo (Vários Dias)
          </button>
          <button className="btn btn-orange" onClick={abrirModalNovo}>
            <Plus size={18} /> Novo Agendamento
          </button>
        </div>
      </div>

      {/* BARRA DE CONTROLE DE VISÃO & FILTROS INTELIGENTES */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: '#ffffff', padding: '12px 18px', borderRadius: '14px', border: '1.5px solid var(--blue-border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className={`btn btn-sm ${modoVisao === 'calendario' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setModoVisao('calendario')}
          >
            <Grid size={16} /> Visão Calendário Mensal
          </button>
          <button 
            className={`btn btn-sm ${modoVisao === 'lista' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setModoVisao('lista')}
          >
            <List size={16} /> Visão em Lista ({agenda.length})
          </button>
        </div>

        {modoVisao === 'calendario' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn btn-sm btn-secondary" onClick={handleMesAnterior} title="Mês Anterior">
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--blue-primary)', textTransform: 'capitalize', minWidth: '160px', textAlign: 'center' }}>
              {nomeMes}
            </span>
            <button className="btn btn-sm btn-secondary" onClick={handleMesProximo} title="Próximo Mês">
              <ChevronRight size={16} />
            </button>
            <button className="btn btn-sm btn-orange" onClick={handleHoje} style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
              Hoje
            </button>
          </div>
        )}

        {modoVisao === 'lista' && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className={`btn btn-sm ${filtro === 'todos' ? 'btn-orange' : 'btn-secondary'}`} onClick={() => setFiltro('todos')}>
              Todos
            </button>

            {/* FILTRO ESPECIAL: LEMBRETE 1 DIA ANTES (AMANHÃ) */}
            <button 
              className={`btn btn-sm ${filtro === 'amanha' ? 'btn-whatsapp' : 'btn-secondary'}`} 
              onClick={() => setFiltro('amanha')}
              title="Filtrar compromissos de amanhã para enviar lembretes"
              style={{ fontWeight: 800 }}
            >
              <ThumbsUp size={14} /> ⏰ Amanhã ({agenda.filter(a => a.data === dataAmanhaStr).length})
            </button>

            <button className={`btn btn-sm ${filtro === 'pendentes' ? 'btn-orange' : 'btn-secondary'}`} onClick={() => setFiltro('pendentes')}>
              Pendentes ({agenda.filter(a => !a.concluido).length})
            </button>
            <button className={`btn btn-sm ${filtro === 'concluidos' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltro('concluidos')}>
              Concluídos ({agenda.filter(a => a.concluido).length})
            </button>
          </div>
        )}
      </div>

      {/* VISÃO 1: CALENDÁRIO INTERATIVO MENSAL OTIMIZADO PARA CELULAR E TABLET (SEM CORTE DE SEXTA/SÁBADO) */}
      {modoVisao === 'calendario' && (
        <div className="calendar-responsive-container">
          <div className="calendar-grid-wrapper">
            {/* Cabeçalho dos 7 Dias da Semana (Destaque Especial para Sexta e Sábado) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '8px' }}>
              {[
                { label: 'Dom', color: 'var(--orange-primary)' },
                { label: 'Seg', color: 'var(--blue-primary)' },
                { label: 'Ter', color: 'var(--blue-primary)' },
                { label: 'Qua', color: 'var(--blue-primary)' },
                { label: 'Qui', color: 'var(--blue-primary)' },
                { label: 'Sex 🔥', color: '#ea580c' },
                { label: 'Sáb 🌟', color: '#059669' }
              ].map((diaObj, index) => (
                <div 
                  key={diaObj.label} 
                  style={{ 
                    padding: '10px 4px', 
                    fontWeight: 800, 
                    fontSize: '0.85rem', 
                    color: diaObj.color,
                    background: index === 5 || index === 6 ? '#fff7ed' : 'var(--blue-ice-bg)',
                    borderRadius: '8px',
                    textTransform: 'uppercase',
                    border: `1.5px solid ${index === 5 || index === 6 ? '#fed7aa' : 'var(--blue-border)'}`
                  }}
                >
                  {diaObj.label}
                </div>
              ))}
            </div>

            {/* Grid dos Dias do Mês */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
              {celulasCalendario.map((celula, i) => {
                const compromissosDoDia = agenda.filter(a => a.data === celula.dateStr);

                return (
                  <div
                    key={i}
                    onClick={() => {
                      if (compromissosDoDia.length > 0) {
                        setDiaDetalhesDate(celula.dateStr);
                      } else {
                        abrirModalNovoParaData(celula.dateStr);
                      }
                    }}
                    style={{
                      minHeight: '105px',
                      background: celula.isToday 
                        ? '#fff7ed' 
                        : celula.isCurrentMonth 
                          ? '#ffffff' 
                          : '#f8fafc',
                      border: celula.isToday 
                        ? '2px solid var(--orange-primary)' 
                        : '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      justify: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: celula.isCurrentMonth ? 1 : 0.35,
                      boxShadow: celula.isToday ? 'var(--shadow-md)' : 'none'
                    }}
                    className="calendar-day-cell"
                    title={`Clique para ver ou agendar compromissos no dia ${safeFormatDate(celula.dateStr)}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ 
                        fontSize: '0.88rem', 
                        fontWeight: 800, 
                        color: celula.isToday ? '#ea580c' : celula.isCurrentMonth ? 'var(--text-main)' : 'var(--text-muted)',
                        background: celula.isToday ? '#fed7aa' : 'transparent',
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'center'
                      }}>
                        {celula.diaNum}
                      </span>

                      {compromissosDoDia.length > 0 && (
                        <span className="badge badge-orange" style={{ padding: '2px 6px', fontSize: '0.7rem', fontWeight: 800 }}>
                          {compromissosDoDia.length} ag.
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', overflowY: 'auto', maxHeight: '72px' }}>
                      {compromissosDoDia.map(ag => {
                        const primeiroNome = ag.clienteNome && ag.clienteNome !== 'Cliente Não Especificado'
                          ? ag.clienteNome.trim().split(' ')[0]
                          : ag.titulo;

                        return (
                          <div
                            key={ag.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              abrirModalEditar(ag);
                            }}
                            style={{
                              background: ag.concluido ? '#d1fae5' : ag.diaInteiro ? '#ffedd5' : 'var(--blue-light-bg)',
                              border: `1px solid ${ag.concluido ? '#6ee7b7' : ag.diaInteiro ? '#fed7aa' : 'var(--blue-border)'}`,
                              color: ag.concluido ? '#047857' : ag.diaInteiro ? '#ea580c' : 'var(--blue-primary)',
                              padding: '3px 5px',
                              borderRadius: '6px',
                              fontSize: '0.73rem',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title={`${ag.diaInteiro ? 'Dia Inteiro' : ag.horario} - ${ag.titulo} (${ag.clienteNome})`}
                          >
                            <span style={{ fontSize: '0.68rem', fontWeight: 800 }}>{ag.diaInteiro ? '☀️' : ag.horario}</span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{primeiroNome}</span>
                            <Trash2
                              size={12}
                              style={{ color: '#ef4444', marginLeft: 'auto', cursor: 'pointer', flexShrink: 0 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExcluirCompromisso(ag.id, ag.titulo);
                              }}
                              title="Excluir compromisso"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VISÃO 2: LISTA DE AGENDAMENTOS COMPLETA COM CARD REDESENHADO DE ALTO NÍVEL PROFISSIONAL */}
      {modoVisao === 'lista' && (
        <>
          {agendaFiltrada.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <CalendarIcon size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p>Nenhum agendamento encontrado.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {agendaFiltrada.map((ag) => (
                <div
                  key={ag.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    padding: '18px 20px',
                    borderRadius: '16px',
                    border: '2px solid var(--blue-border)',
                    borderLeft: `6px solid ${ag.concluido ? 'var(--success)' : ag.diaInteiro ? '#f97316' : 'var(--blue-primary)'}`,
                    background: ag.concluido ? 'var(--success-bg)' : '#ffffff',
                    boxShadow: '0 4px 15px rgba(2, 132, 199, 0.05)',
                    position: 'relative'
                  }}
                >
                  {/* 1. CABEÇALHO DO CARD: TÍTULO, BADGES E DESTAQUE DE VALOR */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, textDecoration: ag.concluido ? 'line-through' : 'none', color: 'var(--text-main)' }}>
                          {ag.titulo}
                        </h3>
                        <span className={`badge ${ag.concluido ? 'badge-success' : 'badge-orange'}`} style={{ fontSize: '0.75rem' }}>
                          {ag.concluido ? 'Concluído ✅' : ag.prioridade || 'Normal'}
                        </span>
                        {ag.diaInteiro && (
                          <span className="badge badge-orange" style={{ background: '#fff7ed', color: '#ea580c', fontSize: '0.75rem' }}>☀️ Dia Inteiro</span>
                        )}
                        {ag.data === dataAmanhaStr && !ag.concluido && (
                          <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>🗓️ Amanhã</span>
                        )}
                      </div>

                      {/* DETALHES DE DATA, HORÁRIO, CLIENTE E WHATSAPP EM BLOCOS MODERNOS */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '8px', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', fontWeight: 700, border: '1px solid #cbd5e1' }}>
                          <CalendarIcon size={14} style={{ color: 'var(--blue-primary)' }} /> {safeFormatDate(ag.data)}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', fontWeight: 700, border: '1px solid #cbd5e1' }}>
                          <Clock size={14} style={{ color: '#ea580c' }} /> {ag.diaInteiro ? '☀️ Dia Inteiro' : ag.horario}
                        </span>
                        {ag.clienteNome && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: 'var(--text-main)', background: '#f8fafc', padding: '4px 10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                            <User size={14} style={{ color: 'var(--blue-primary)' }} /> {ag.clienteNome}
                          </span>
                        )}
                        {ag.clienteTelefone && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '4px 10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                            <Smartphone size={14} /> {ag.clienteTelefone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* DESTAQUE DE VALOR DO SERVIÇO */}
                    {ag.valor > 0 && (
                      <div style={{ background: '#ecfdf5', padding: '6px 14px', borderRadius: '10px', border: '1.5px solid #6ee7b7', textAlign: 'right' }}>
                        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>VALOR</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#065f46' }}>R$ {Number(ag.valor).toFixed(2)}</div>
                      </div>
                    )}
                  </div>

                  {/* ROTEIRO / OBSERVAÇÕES SE HOUVER */}
                  {ag.descricao && (
                    <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', borderLeft: '3.5px solid var(--blue-primary)', fontSize: '0.84rem', color: '#475569', fontStyle: 'italic' }}>
                      "{ag.descricao}"
                    </div>
                  )}

                  {/* 2. BARRA DE BOTÕES ORGANIZADA EM LAYOUT EXECUTIVO */}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* LINHA 1: MARCAR CONCLUÍDO (STATUS PRINCIPAL) */}
                    <button
                      className="btn"
                      onClick={() => handleConcluir(ag)}
                      title={ag.concluido ? "Reabrir compromisso" : "Marcar como Concluído e Lançar nas Receitas"}
                      style={{
                        width: '100%',
                        background: ag.concluido ? 'var(--success)' : 'var(--orange-gradient)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'center',
                        gap: '8px',
                        boxShadow: ag.concluido ? 'none' : 'var(--shadow-orange-btn)'
                      }}
                    >
                      <CheckCircle size={18} /> {ag.concluido ? 'Compromisso Concluído ✅ (Clique p/ Reabrir)' : 'Marcar Como Concluído ✅'}
                    </button>

                    {/* LINHA 2: GRID DE AUTOMAÇÕES WHATSAPP & GERENCIAMENTO */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                      {/* Botão Confirmação WhatsApp */}
                      <button
                        className="btn btn-sm btn-whatsapp"
                        onClick={() => abrirWhatsapp(ag.clienteTelefone || empresa.whatsapp, msgWhatsapp.confirmacaoNovoAgendamento(ag, empresa))}
                        title="Enviar Mensagem de Confirmação no WhatsApp do Cliente"
                        style={{ justifyContent: 'center', padding: '8px 10px', fontSize: '0.82rem', fontWeight: 800 }}
                      >
                        <MessageSquare size={14} /> Confirmação
                      </button>

                      {/* Botão Lembrete Amanhã */}
                      <button
                        className="btn btn-sm"
                        onClick={() => abrirWhatsapp(ag.clienteTelefone || empresa.whatsapp, msgWhatsapp.lembretePreVencimentoAmanha(ag, empresa))}
                        title="Enviar Lembrete de Amanhã no WhatsApp do Cliente"
                        style={{ background: '#0284c7', color: '#ffffff', fontWeight: 800, justifyContent: 'center', padding: '8px 10px', fontSize: '0.82rem' }}
                      >
                        <ThumbsUp size={14} /> Lembrete Amanhã 👍
                      </button>

                      {/* Botão Editar */}
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => abrirModalEditar(ag)}
                        title="Editar Agendamento"
                        style={{ justifyContent: 'center', padding: '8px 10px', fontSize: '0.82rem', fontWeight: 800 }}
                      >
                        <Edit size={14} /> Editar
                      </button>

                      {/* Botão Excluir */}
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleExcluirCompromisso(ag.id, ag.titulo)}
                        title="Excluir compromisso"
                        style={{ color: '#dc2626', borderColor: '#fca5a5', justifyContent: 'center', padding: '8px 10px', fontSize: '0.82rem', fontWeight: 800 }}
                      >
                        <Trash2 size={14} /> Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* MODAL ESPECIAL: VER AGENDAMENTOS DO DIA SELECIONADO NO CELULAR/TABLET */}
      {diaDetalhesDate && (
        <div className="modal-overlay" onClick={() => setDiaDetalhesDate(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarCheck size={22} style={{ color: 'var(--orange-primary)' }} /> Agendamentos de {safeFormatDate(diaDetalhesDate)} ({compromissosDiaSelecionado.length})
              </h3>
              <button className="action-btn-circle" onClick={() => setDiaDetalhesDate(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '60vh', overflowY: 'auto', marginBottom: '16px' }}>
              {compromissosDiaSelecionado.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                  Nenhum agendamento neste dia.
                </p>
              ) : (
                compromissosDiaSelecionado.map(ag => (
                  <div key={ag.id} style={{ background: '#ffffff', padding: '14px', borderRadius: '12px', border: '1.5px solid var(--blue-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{ag.titulo}</strong>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          ⏰ <strong>{ag.diaInteiro ? '☀️ Dia Inteiro' : ag.horario}</strong> • 👤 {ag.clienteNome} {ag.clienteTelefone ? `(${ag.clienteTelefone})` : ''}
                        </div>
                      </div>
                      {ag.valor > 0 && (
                        <span style={{ fontWeight: 800, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px', border: '1px solid #10b981', fontSize: '0.88rem' }}>
                          R$ {Number(ag.valor).toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '6px' }}>
                      <button
                        className="btn btn-sm btn-whatsapp"
                        onClick={() => abrirWhatsapp(ag.clienteTelefone || empresa.whatsapp, msgWhatsapp.confirmacaoNovoAgendamento(ag, empresa))}
                        style={{ justifyContent: 'center' }}
                      >
                        <MessageSquare size={13} /> Confirmação
                      </button>

                      <button
                        className="btn btn-sm"
                        onClick={() => abrirWhatsapp(ag.clienteTelefone || empresa.whatsapp, msgWhatsapp.lembretePreVencimentoAmanha(ag, empresa))}
                        style={{ background: '#0284c7', color: '#fff', fontWeight: 800, justifyContent: 'center' }}
                      >
                        <ThumbsUp size={13} /> Lembrete 👍
                      </button>

                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          setDiaDetalhesDate(null);
                          abrirModalEditar(ag);
                        }}
                        style={{ justifyContent: 'center' }}
                      >
                        <Edit size={13} /> Editar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn btn-orange" 
                onClick={() => {
                  const targetDate = diaDetalhesDate;
                  setDiaDetalhesDate(null);
                  abrirModalNovoParaData(targetDate);
                }}
                style={{ width: '100%' }}
              >
                <Plus size={18} /> Novo Agendamento neste dia ({safeFormatDate(diaDetalhesDate)})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: AGENDAMENTO ÚNICO / EDITAR */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editId ? 'Editar Agendamento de Locução' : 'Novo Agendamento na Agenda'}</h3>
              <button className="action-btn-circle" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSalvar}>
              <div className="form-group" style={{ background: 'var(--blue-ice-bg)', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--blue-border)' }}>
                <label className="form-label" style={{ color: 'var(--orange-primary)', fontSize: '0.85rem' }}>
                  Puxar de um Serviço / Produto Cadastrado (Opcional):
                </label>
                <select className="form-select" onChange={selecionarServicoParaAgenda}>
                  <option value="">-- Selecionar da Lista ({produtos.length} cadastrados) --</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} (R$ {parseVal(p.precoVenda ?? p.preco ?? 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Título do Serviço / Locução *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Locução Comercial 30s ou Vinheta Rádio"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Selecione o Cliente Cadastrado (Opcional)</label>
                <select
                  className="form-select"
                  value={clienteId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setClienteId(id);
                    if (id) {
                      const cFound = clientes.find(c => String(c.id) === String(id));
                      if (cFound) {
                        setClienteNomeCustom(cFound.nome);
                        setClienteTelefoneCustom(cFound.whatsapp || cFound.telefone || '');
                      }
                    }
                  }}
                >
                  <option value="">-- Selecionar Cliente Cadastrado --</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nome} {c.whatsapp ? `(${c.whatsapp})` : ''}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Nome do Cliente *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nome do cliente"
                    value={clienteNomeCustom}
                    onChange={(e) => setClienteNomeCustom(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp / Celular do Cliente *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="(00) 00000-0000"
                    value={clienteTelefoneCustom}
                    onChange={(e) => setClienteTelefoneCustom(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Data *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    required
                  />
                </div>

                {!diaInteiro && (
                  <div className="form-group">
                    <label className="form-label">Horário *</label>
                    <input
                      type="time"
                      className="form-input"
                      value={horario}
                      onChange={(e) => setHorario(e.target.value)}
                      required={!diaInteiro}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--orange-primary)', fontWeight: 800 }}>
                    Valor Serviço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="0.00"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    style={{ fontWeight: 800, borderColor: 'var(--orange-bright)' }}
                  />
                </div>
              </div>

              {/* Checkbox Dia Inteiro */}
              <div style={{ background: '#fff7ed', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #fed7aa', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="modalCheckDiaInteiro"
                  checked={diaInteiro}
                  onChange={(e) => setDiaInteiro(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="modalCheckDiaInteiro" style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--orange-primary)', cursor: 'pointer' }}>
                  ☀️ Compromisso de DIA INTEIRO (Bloqueia a data completa para novos agendamentos)
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Prioridade</label>
                <select
                  className="form-select"
                  value={prioridade}
                  onChange={(e) => setPrioridade(e.target.value)}
                >
                  <option value="Normal">Normal</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta 🔥</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Observações / Texto do Roteiro de Locução</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Instruções da voz, estilo, tom, observações..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px', flexWrap: 'wrap' }}>
                {editId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleExcluirCompromisso(editId, titulo)}
                    style={{ color: '#dc2626', borderColor: '#fca5a5', marginRight: 'auto' }}
                  >
                    <Trash2 size={16} /> Excluir Compromisso
                  </button>
                )}
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-orange">{editId ? 'Salvar Alterações' : 'Agendar e Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: AGENDAMENTO MÚLTIPLO */}
      {modalMultiploOpen && (
        <div className="modal-overlay" onClick={() => setModalMultiploOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={20} style={{ color: 'var(--orange-primary)' }} /> Agendamento Múltiplo (Vários Dias)
              </h3>
              <button className="action-btn-circle" onClick={() => setModalMultiploOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSalvarMultiplos} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ background: 'var(--blue-ice-bg)', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--blue-border)', marginBottom: 0 }}>
                <label className="form-label" style={{ color: 'var(--orange-primary)', fontSize: '0.85rem' }}>
                  Puxar de um Serviço / Produto Cadastrado (Opcional):
                </label>
                <select className="form-select" onChange={selecionarServicoParaMultiAgenda}>
                  <option value="">-- Selecionar da Lista ({produtos.length} cadastrados) --</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} (R$ {parseVal(p.precoVenda ?? p.preco ?? 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Título do Serviço / Compromisso *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Manutenção Semanal ou Pacote de Locução"
                  value={multiTitulo}
                  onChange={(e) => setMultiTitulo(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Selecione o Cliente Cadastrado (Opcional)</label>
                <select
                  className="form-select"
                  value={multiClienteId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setMultiClienteId(id);
                    if (id) {
                      const cFound = clientes.find(c => String(c.id) === String(id));
                      if (cFound) {
                        setMultiClienteNomeCustom(cFound.nome);
                        setMultiClienteTelefoneCustom(cFound.whatsapp || cFound.telefone || '');
                      }
                    }
                  }}
                >
                  <option value="">-- Selecionar Cliente Cadastrado --</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nome} {c.whatsapp ? `(${c.whatsapp})` : ''}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nome do Cliente *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nome do cliente"
                    value={multiClienteNomeCustom}
                    onChange={(e) => setMultiClienteNomeCustom(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">WhatsApp do Cliente *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="(00) 00000-0000"
                    value={multiClienteTelefoneCustom}
                    onChange={(e) => setMultiClienteTelefoneCustom(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Horário Padrão *</label>
                  <input
                    type="time"
                    className="form-input"
                    value={multiHorario}
                    onChange={(e) => setMultiHorario(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: 'var(--orange-primary)' }}>Valor p/ Sessão (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="0.00"
                    value={multiValor}
                    onChange={(e) => setMultiValor(e.target.value)}
                    style={{ fontWeight: 700 }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Prioridade</label>
                  <select
                    className="form-select"
                    value={multiPrioridade}
                    onChange={(e) => setMultiPrioridade(e.target.value)}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta 🔥</option>
                  </select>
                </div>
              </div>

              <div style={{ background: 'var(--blue-ice-bg)', padding: '14px', borderRadius: '12px', border: '1.5px solid var(--blue-border)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--blue-primary)', marginBottom: '10px' }}>
                  <span>🗓️ ESCOLHA COMO AGENDAR OS DIAS:</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${tipoSelecaoDias === 'manual' ? 'btn-orange' : 'btn-secondary'}`}
                    onClick={() => setTipoSelecaoDias('manual')}
                  >
                    1. Escolher Datas Manuais
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${tipoSelecaoDias === 'recorrente' ? 'btn-orange' : 'btn-secondary'}`}
                    onClick={() => setTipoSelecaoDias('recorrente')}
                  >
                    2. Gerar Dias da Semana (Ex: Toda Seg/Qua)
                  </button>
                </div>

                {tipoSelecaoDias === 'manual' && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="date"
                      className="form-input"
                      style={{ width: 'auto', padding: '6px 12px' }}
                      value={dataInputAdicionar}
                      onChange={(e) => setDataInputAdicionar(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-orange"
                      onClick={adicionarDataManual}
                    >
                      <PlusCircle size={16} /> Adicionar Esta Data à Lista
                    </button>
                  </div>
                )}

                {tipoSelecaoDias === 'recorrente' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Data Inicial</label>
                        <input
                          type="date"
                          className="form-input"
                          value={dataInicioRec}
                          onChange={(e) => setDataInicioRec(e.target.value)}
                          style={{ padding: '6px' }}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Data Final</label>
                        <input
                          type="date"
                          className="form-input"
                          value={dataFimRec}
                          onChange={(e) => setDataFimRec(e.target.value)}
                          style={{ padding: '6px' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Marque os Dias da Semana desejados:</label>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                        {[
                          { key: 1, label: 'Seg' },
                          { key: 2, label: 'Ter' },
                          { key: 3, label: 'Qua' },
                          { key: 4, label: 'Qui' },
                          { key: 5, label: 'Sex' },
                          { key: 6, label: 'Sáb' },
                          { key: 0, label: 'Dom' }
                        ].map(d => (
                          <button
                            key={d.key}
                            type="button"
                            className={`btn btn-sm ${diasSemana[d.key] ? 'btn-orange' : 'btn-secondary'}`}
                            onClick={() => setDiasSemana(prev => ({ ...prev, [d.key]: !prev[d.key] }))}
                            style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                          >
                            {d.label} {diasSemana[d.key] ? '✓' : ''}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={gerarDatasRecorrentes}
                      style={{ marginTop: '6px' }}
                    >
                      ✨ Gerar Datas no Período
                    </button>
                  </div>
                )}
              </div>

              <div style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--orange-border)' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--orange-primary)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>📋 LISTA DE DATAS QUE SERÃO AGENDADAS ({listaDatasEscolhidas.length} dias)</span>
                  {listaDatasEscolhidas.length > 0 && (
                    <button type="button" className="btn btn-sm btn-secondary" style={{ padding: '2px 6px', fontSize: '0.7rem' }} onClick={() => setListaDatasEscolhidas([])}>
                      Limpar Lista
                    </button>
                  )}
                </div>

                {listaDatasEscolhidas.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>
                    Nenhuma data selecionada ainda. Escolha ou gere as datas acima.
                  </p>
                ) : (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxHeight: '110px', overflowY: 'auto' }}>
                    {listaDatasEscolhidas.map(d => (
                      <span key={d} className="badge badge-orange" style={{ padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                        🗓 {safeFormatDate(d)}
                        <X size={14} style={{ cursor: 'pointer' }} onClick={() => removerDataManual(d)} title="Remover esta data" />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalMultiploOpen(false)}>Cancelar</button>
                <button 
                  type="submit" 
                  className="btn btn-orange" 
                  disabled={listaDatasEscolhidas.length === 0}
                  style={{ fontWeight: 800, padding: '12px 24px' }}
                >
                  <CheckCircle size={20} /> Salvar {listaDatasEscolhidas.length} Agendamentos de Uma Só Vez!
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
