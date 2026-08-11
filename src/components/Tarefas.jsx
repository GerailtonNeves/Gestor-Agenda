import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  CheckCircle, 
  Clock, 
  Trash2, 
  Edit, 
  AlertCircle, 
  Calendar as CalendarIcon, 
  Tag, 
  Sparkles,
  Filter,
  Check
} from 'lucide-react';
import { safeFormatDate } from '../utils/storage';
import { playNotificationSound } from '../utils/soundUtils';

export default function Tarefas({ tarefas = [], onSaveTarefas, onDeleteTarefa }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filtro, setFiltro] = useState('todos'); // 'todos', 'pendentes', 'concluidas', 'alta'
  const [toastAlert, setToastAlert] = useState(null);

  // Form State
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('Geral');
  const [dataLimite, setDataLimite] = useState(new Date().toISOString().split('T')[0]);
  const [horario, setHorario] = useState('10:00');
  const [prioridade, setPrioridade] = useState('Normal');
  const [observacoes, setObservacoes] = useState('');

  const triggerToast = (msg) => {
    setToastAlert(msg);
    setTimeout(() => setToastAlert(null), 3500);
  };

  const abrirModalNova = () => {
    setEditId(null);
    setTitulo('');
    setCategoria('Geral');
    setDataLimite(new Date().toISOString().split('T')[0]);
    setHorario('10:00');
    setPrioridade('Normal');
    setObservacoes('');
    setModalOpen(true);
  };

  const abrirModalEditar = (t) => {
    setEditId(t.id);
    setTitulo(t.titulo || '');
    setCategoria(t.categoria || 'Geral');
    setDataLimite(t.dataLimite || new Date().toISOString().split('T')[0]);
    setHorario(t.horario || '10:00');
    setPrioridade(t.prioridade || 'Normal');
    setObservacoes(t.observacoes || '');
    setModalOpen(true);
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    const tarefaData = {
      titulo: titulo.trim(),
      categoria,
      dataLimite,
      horario,
      prioridade,
      observacoes: observacoes.trim()
    };

    if (editId) {
      const atualizadas = tarefas.map(t => t.id === editId ? { ...t, ...tarefaData } : t);
      onSaveTarefas(atualizadas);
      triggerToast(`✏️ Tarefa "${titulo}" atualizada!`);
    } else {
      const novaTarefa = {
        id: 'tar_' + Date.now(),
        ...tarefaData,
        concluida: false,
        dataCriacao: new Date().toISOString().split('T')[0]
      };
      onSaveTarefas([...tarefas, novaTarefa]);
      playNotificationSound();
      triggerToast(`✨ Nova Tarefa "${titulo}" cadastrada com sucesso!`);
    }

    setModalOpen(false);
  };

  // DAR BAIXA / FINALIZAR TAREFA
  const toggleDarBaixa = (t) => {
    const novoStatus = !t.concluida;
    const atualizadas = tarefas.map(item => item.id === t.id ? { ...item, concluida: novoStatus } : item);
    onSaveTarefas(atualizadas);

    if (novoStatus) {
      playNotificationSound();
      triggerToast(`✅ Dar Baixa Concluído! Tarefa "${t.titulo}" finalizada!`);
    } else {
      triggerToast(`🔄 Tarefa "${t.titulo}" reaberta como pendente.`);
    }
  };

  const handleExcluir = (id, tituloTarefa) => {
    if (window.confirm(`Tem certeza que deseja excluir a tarefa "${tituloTarefa}"?`)) {
      onDeleteTarefa(id);
      triggerToast(`🗑️ Tarefa "${tituloTarefa}" excluída!`);
    }
  };

  // Filtragem de Lista
  const tarefasFiltradas = tarefas.filter(t => {
    if (filtro === 'pendentes') return !t.concluida;
    if (filtro === 'concluidas') return t.concluida;
    if (filtro === 'alta') return t.prioridade === 'Alta';
    return true;
  });

  tarefasFiltradas.sort((a, b) => {
    if (a.concluida !== b.concluida) return a.concluida ? 1 : -1;
    return a.dataLimite.localeCompare(b.dataLimite);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Alert */}
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
          zIndex: 3000,
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
            <CheckSquare size={24} /> Tarefas & Compromissos
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Cadastre suas tarefas diárias, <strong>dê baixa quando concluídas</strong>, edite e exclua facilmente.
          </p>
        </div>

        <button className="btn btn-orange" onClick={abrirModalNova}>
          <Plus size={18} /> Nova Tarefa
        </button>
      </div>

      {/* Barra de Filtros */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button className={`btn btn-sm ${filtro === 'todos' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltro('todos')}>
          Todas ({tarefas.length})
        </button>
        <button className={`btn btn-sm ${filtro === 'pendentes' ? 'btn-orange' : 'btn-secondary'}`} onClick={() => setFiltro('pendentes')}>
          Pendentes ({tarefas.filter(t => !t.concluida).length})
        </button>
        <button className={`btn btn-sm ${filtro === 'concluidas' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltro('concluidas')}>
          Concluídas / Baixas ({tarefas.filter(t => t.concluida).length})
        </button>
        <button className={`btn btn-sm ${filtro === 'alta' ? 'btn-orange' : 'btn-secondary'}`} onClick={() => setFiltro('alta')}>
          Alta Prioridade 🔥 ({tarefas.filter(t => t.prioridade === 'Alta').length})
        </button>
      </div>

      {/* Lista de Tarefas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {tarefasFiltradas.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <CheckSquare size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p>Nenhuma tarefa ou compromisso encontrado nesta categoria.</p>
          </div>
        ) : (
          tarefasFiltradas.map(t => (
            <div
              key={t.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                padding: '16px 20px',
                borderLeft: `6px solid ${t.concluida ? 'var(--success)' : t.prioridade === 'Alta' ? '#dc2626' : 'var(--orange-primary)'}`,
                background: t.concluida ? 'var(--success-bg)' : 'var(--card-bg)',
                opacity: t.concluida ? 0.85 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '260px' }}>
                {/* Botão Dar Baixa */}
                <button
                  className="btn"
                  onClick={() => toggleDarBaixa(t)}
                  title={t.concluida ? "Reabrir tarefa" : "Dar Baixa / Concluir Tarefa"}
                  style={{
                    background: t.concluida ? 'var(--success)' : 'var(--orange-gradient)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <CheckCircle size={18} /> {t.concluida ? 'Concluída ✅' : 'Dar Baixa'}
                </button>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, textDecoration: t.concluida ? 'line-through' : 'none', color: 'var(--text-main)' }}>
                      {t.titulo}
                    </h3>
                    <span className={`badge ${t.concluida ? 'badge-success' : t.prioridade === 'Alta' ? 'badge-danger' : 'badge-blue'}`}>
                      {t.concluida ? 'Finalizada' : t.categoria || 'Geral'}
                    </span>
                    {t.prioridade === 'Alta' && !t.concluida && (
                      <span className="badge badge-orange">Alta Prioridade 🔥</span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '4px' }}>
                    <span>🗓️ Limite: {safeFormatDate(t.dataLimite)}</span>
                    <span>⏰ Horário: {t.horario}</span>
                  </div>

                  {t.observacoes && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                      "{t.observacoes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Botões de Ação */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => abrirModalEditar(t)}
                  title="Editar Tarefa"
                >
                  <Edit size={14} /> Editar
                </button>

                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleExcluir(t.id, t.titulo)}
                  title="Excluir Tarefa"
                  style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                >
                  <Trash2 size={14} /> Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Criar / Editar Tarefa */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editId ? 'Editar Tarefa / Compromisso' : 'Nova Tarefa / Compromisso'}</h3>
              <button className="action-btn-circle" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSalvar}>
              <div className="form-group">
                <label className="form-label">Título da Tarefa / Compromisso *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Comprar suprimentos, ligar para fornecedor..."
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Categoria</label>
                  <select className="form-select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                    <option value="Geral">Geral</option>
                    <option value="Compromisso">Compromisso</option>
                    <option value="Atendimento">Atendimento</option>
                    <option value="Lembrete">Lembrete</option>
                    <option value="Compra">Compra / Suprimentos</option>
                    <option value="Manutenção">Manutenção</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Prioridade</label>
                  <select className="form-select" value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
                    <option value="Normal">Normal</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta 🔥</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Data Limite *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dataLimite}
                    onChange={(e) => setDataLimite(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Horário *</label>
                  <input
                    type="time"
                    className="form-input"
                    value={horario}
                    onChange={(e) => setHorario(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Observações / Detalhes</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Detalhes adicionais da tarefa..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-orange">{editId ? 'Salvar Alterações' : 'Cadastrar Tarefa'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
