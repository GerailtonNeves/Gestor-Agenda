import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, CheckCircle, Briefcase, Send, AlertCircle, FileText } from 'lucide-react';
import { storageApi, safeFormatDate } from '../utils/storage';
import { playNotificationSound } from '../utils/soundUtils';

export default function AgendamentoPublico() {
  const [empresa] = useState(() => storageApi.getEmpresa());
  const [produtos] = useState(() => storageApi.getProdutos());
  
  const [produtoId, setProdutoId] = useState('');
  const [tituloServico, setTituloServico] = useState('');
  const [valorServico, setValorServico] = useState(0);
  
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [horario, setHorario] = useState('09:00');
  const [observacoes, setObservacoes] = useState('');

  const [confirmado, setConfirmado] = useState(null);

  const handleSelectProduto = (e) => {
    const id = e.target.value;
    setProdutoId(id);
    if (!id) {
      setTituloServico('');
      setValorServico(0);
      return;
    }
    const prod = produtos.find(p => String(p.id) === String(id));
    if (prod) {
      setTituloServico(prod.nome);
      const preco = prod.precoVenda ?? prod.preco ?? prod.valorUnitario ?? 0;
      setValorServico(preco);
    }
  };

  const handleConfirmarAgendamento = (e) => {
    e.preventDefault();
    if (!tituloServico.trim() || !clienteNome.trim() || !clienteTelefone.trim() || !data || !horario) {
      alert('⚠️ Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    const novoAgendamento = {
      id: 'ag_pub_' + Date.now(),
      titulo: tituloServico.trim(),
      clienteId: '',
      clienteNome: clienteNome.trim(),
      clienteTelefone: clienteTelefone.trim(),
      data,
      horario,
      valor: parseFloat(valorServico) || 0,
      descricao: observacoes ? `Agendado Online pelo Cliente: ${observacoes}` : 'Agendado Online pelo Cliente via Link Público',
      concluido: false,
      prioridade: 'Normal',
      origem: 'Online'
    };

    // 1. Salva na lista global de agendamentos no LocalStorage
    const agendaAtual = storageApi.getAgenda();
    const novaAgenda = [novoAgendamento, ...agendaAtual];
    storageApi.saveAgenda(novaAgenda);

    // 2. Toca o som de aviso e dispara a notificação para a aba do sistema do proprietário
    playNotificationSound();

    try {
      // Notificação via BroadcastChannel (comunicação em tempo real entre abas do mesmo navegador)
      const channel = new BroadcastChannel('eb_agendamento_channel');
      channel.postMessage({ type: 'NOVO_AGENDAMENTO', agendamento: novoAgendamento });
      channel.close();
    } catch (err) {
      console.log('BroadcastChannel não suportado:', err);
    }

    // 3. Exibe tela de confirmação de sucesso para o cliente
    setConfirmado(novoAgendamento);
  };

  if (confirmado) {
    const linkWa = empresa.whatsapp 
      ? `https://wa.me/${empresa.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Olá! Acabei de realizar o agendamento online de "${confirmado.titulo}" para o dia ${safeFormatDate(confirmado.data)} às ${confirmado.horario}.`)}`
      : null;

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: '#ffffff', border: '2px solid var(--blue-border)', borderRadius: '20px', padding: '32px', maxWidth: '520px', width: '100%', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
          <div style={{ width: '70px', height: '70px', background: '#dcfce7', color: '#166534', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <CheckCircle size={40} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--blue-primary)', marginBottom: '8px' }}>
            Agendamento Confirmado! 🎉
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px' }}>
            Seu agendamento foi enviado com sucesso para a empresa <strong>{empresa.nomeFantasia || 'Escritório de Bolso'}</strong>.
          </p>

          <div style={{ background: 'var(--blue-ice-bg)', padding: '16px', borderRadius: '12px', border: '1.5px solid var(--blue-border)', textAlign: 'left', marginBottom: '24px', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>📌 <strong>Serviço:</strong> {confirmado.titulo}</div>
            <div>🗓️ <strong>Data:</strong> {safeFormatDate(confirmado.data)}</div>
            <div>⏰ <strong>Horário:</strong> {confirmado.horario}</div>
            <div>👤 <strong>Seu Nome:</strong> {confirmado.clienteNome}</div>
            <div>📱 <strong>Seu WhatsApp:</strong> {confirmado.clienteTelefone}</div>
            {confirmado.valor > 0 && (
              <div style={{ fontWeight: 800, color: '#047857', marginTop: '4px' }}>💰 <strong>Valor:</strong> R$ {Number(confirmado.valor).toFixed(2)}</div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {linkWa && (
              <a href={linkWa} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp" style={{ width: '100%', textDecoration: 'none' }}>
                <Send size={18} /> Avisar no WhatsApp da Empresa
              </a>
            )}
            <button className="btn btn-secondary" onClick={() => setConfirmado(null)} style={{ width: '100%' }}>
              Fazer Outro Agendamento
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', padding: '30px 16px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '620px', width: '100%' }}>
        {/* Cabeçalho da Empresa no Topo do Agendamento */}
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '2px solid var(--blue-border)', boxShadow: 'var(--shadow-md)', marginBottom: '20px', textAlign: 'center' }}>
          {empresa.logo ? (
            <img src={empresa.logo} alt="Logo Empresa" style={{ maxHeight: '80px', maxWidth: '200px', objectFit: 'contain', marginBottom: '12px' }} />
          ) : (
            <div style={{ width: '60px', height: '60px', background: 'var(--blue-primary)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
              <Briefcase size={32} />
            </div>
          )}

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--blue-primary)', margin: 0 }}>
            {empresa.nomeFantasia || 'Agendamento Online'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            {empresa.endereco || 'Selecione o serviço, data e horário desejados para agendar a sua sessão'}
          </p>
        </div>

        {/* Formulário de Agendamento Público */}
        <form onSubmit={handleConfirmarAgendamento} style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '2px solid var(--orange-border)', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--orange-primary)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid var(--orange-border)', paddingBottom: '10px', margin: 0 }}>
            <Calendar size={20} /> Preencha seus Dados para Agendar
          </h3>

          {/* Selecionar Serviço Cadastrado */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Selecione o Serviço Desejado *</label>
            <select className="form-select" value={produtoId} onChange={handleSelectProduto} required>
              <option value="">-- Escolha um Serviço / Produto --</option>
              {produtos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome} {p.precoVenda > 0 ? `- R$ ${Number(p.precoVenda).toFixed(2)}` : ''}
                </option>
              ))}
            </select>
          </div>

          {!produtoId && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Ou Digite o Nome do Serviço *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Corte de Cabelo, Consultoria ou Manutenção"
                value={tituloServico}
                onChange={(e) => setTituloServico(e.target.value)}
                required={!produtoId}
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Data Preferida *</label>
              <input
                type="date"
                className="form-input"
                value={data}
                onChange={(e) => setData(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Horário Desejado *</label>
              <input
                type="time"
                className="form-input"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Seu Nome Completo *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Digite seu nome"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Seu WhatsApp com DDD *</label>
              <input
                type="text"
                className="form-input"
                placeholder="(00) 00000-0000"
                value={clienteTelefone}
                onChange={(e) => setClienteTelefone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Observações Adicionais (Opcional)</label>
            <textarea
              className="form-textarea"
              rows="2"
              placeholder="Ex: Preferência por atendimento no período da manhã."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-orange" style={{ fontWeight: 800, padding: '14px', fontSize: '1rem', marginTop: '8px' }}>
            <CheckCircle size={20} /> Confirmar Meu Agendamento Online
          </button>
        </form>
      </div>
    </div>
  );
}
