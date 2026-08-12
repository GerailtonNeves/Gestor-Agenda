import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, CheckCircle, Briefcase, Send, AlertCircle, FileText, MessageSquare, Package, Check, XCircle } from 'lucide-react';
import { storageApi, safeFormatDate } from '../utils/storage';
import { playNotificationSound } from '../utils/soundUtils';
import { abrirWhatsapp, msgWhatsapp } from '../utils/whatsapp';

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
  const [diaInteiro, setDiaInteiro] = useState(false);
  const [observacoes, setObservacoes] = useState('');

  const [erroBloqueio, setErroBloqueio] = useState(null);
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

  const selecionarCardServico = (prod) => {
    setProdutoId(String(prod.id));
    setTituloServico(prod.nome);
    const preco = prod.precoVenda ?? prod.preco ?? prod.valorUnitario ?? 0;
    setValorServico(preco);
    setErroBloqueio(null);
  };

  const handleConfirmarAgendamento = (e) => {
    e.preventDefault();
    setErroBloqueio(null);

    if (!tituloServico.trim() || !clienteNome.trim() || !clienteTelefone.trim() || !data || (!diaInteiro && !horario)) {
      setErroBloqueio('⚠️ Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    // VERIFICAÇÃO RÍGIDA DE CONFLITO DE DATA E HORÁRIO NA AGENDA GLOBAL
    const agendaAtual = storageApi.getAgenda();

    // 1. Verifica se já existe um compromisso de "Dia Inteiro" cadastrado nesta data
    const conflitoDiaInteiroExistente = agendaAtual.find(a => a.data === data && a.diaInteiro);
    if (conflitoDiaInteiroExistente) {
      setErroBloqueio(`❌ A data ${safeFormatDate(data)} já se encontra TOTALMENTE OCUPADA por um compromisso de dia inteiro ("${conflitoDiaInteiroExistente.titulo}"). Por favor, selecione outra data!`);
      return;
    }

    // 2. Se o cliente está solicitando agendamento de "Dia Inteiro", verifica se a data já possui algum compromisso
    if (diaInteiro) {
      const possuiCompromissoNaData = agendaAtual.find(a => a.data === data);
      if (possuiCompromissoNaData) {
        setErroBloqueio(`❌ A data ${safeFormatDate(data)} já possui agendamentos marcados. Não é possível reservar o dia inteiro nesta data. Escolha outra data livre!`);
        return;
      }
    } else {
      // 3. Se é um agendamento por horário específico, verifica se o mesmo horário já está ocupado
      const conflitoHorario = agendaAtual.find(a => a.data === data && a.horario === horario);
      if (conflitoHorario) {
        setErroBloqueio(`❌ O dia ${safeFormatDate(data)} no horário às ${horario} já se encontra OCUPADO por outro agendamento ("${conflitoHorario.titulo}"). Por favor, escolha outro horário livre!`);
        return;
      }
    }

    const novoAgendamento = {
      id: 'ag_pub_' + Date.now(),
      titulo: tituloServico.trim(),
      clienteId: '',
      clienteNome: clienteNome.trim(),
      clienteTelefone: clienteTelefone.trim(),
      data,
      horario: diaInteiro ? 'Dia Inteiro' : horario,
      diaInteiro: !!diaInteiro,
      valor: parseFloat(valorServico) || 0,
      descricao: observacoes ? `Agendado Online pelo Cliente: ${observacoes}` : 'Agendado Online pelo Cliente via Link Público',
      concluido: false,
      prioridade: 'Normal',
      origem: 'Online'
    };

    // 1. Salva na lista global de agendamentos no LocalStorage
    const novaAgenda = [novoAgendamento, ...agendaAtual];
    storageApi.saveAgenda(novaAgenda);

    // 2. Toca o som de aviso e dispara a notificação para a aba do sistema do proprietário
    playNotificationSound();

    try {
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
    const textoMsg = msgWhatsapp.confirmacaoNovoAgendamento(confirmado, empresa);

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: '#ffffff', border: '2px solid var(--blue-border)', borderRadius: '20px', padding: '32px', maxWidth: '520px', width: '100%', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
          <div style={{ width: '70px', height: '70px', background: '#dcfce7', color: '#166534', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <CheckCircle size={40} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--blue-primary)', marginBottom: '8px' }}>
            Seu agendamento foi realizado com sucesso! 🎉
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px' }}>
            Seus dados foram enviados com sucesso para a empresa <strong>{empresa.razaoSocial || empresa.nomeFantasia || 'Escritório de Bolso'}</strong>.
          </p>

          <div style={{ background: 'var(--blue-ice-bg)', padding: '16px', borderRadius: '12px', border: '1.5px solid var(--blue-border)', textAlign: 'left', marginBottom: '24px', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>📌 <strong>Serviço:</strong> {confirmado.titulo}</div>
            <div>🗓️ <strong>Data:</strong> {safeFormatDate(confirmado.data)}</div>
            <div>⏰ <strong>Horário:</strong> {confirmado.diaInteiro ? '☀️ Dia Inteiro' : confirmado.horario}</div>
            <div>👤 <strong>Seu Nome:</strong> {confirmado.clienteNome}</div>
            <div>📱 <strong>Seu WhatsApp:</strong> {confirmado.clienteTelefone}</div>
            {confirmado.valor > 0 && (
              <div style={{ fontWeight: 800, color: '#047857', marginTop: '4px' }}>💰 <strong>Valor:</strong> R$ {Number(confirmado.valor).toFixed(2)}</div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              className="btn btn-whatsapp" 
              style={{ width: '100%', fontWeight: 800 }}
              onClick={() => abrirWhatsapp(empresa.whatsapp || confirmado.clienteTelefone, textoMsg)}
            >
              <MessageSquare size={18} /> Enviar Mensagem de Confirmação no WhatsApp
            </button>

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
      <div style={{ maxWidth: '780px', width: '100%' }}>
        {/* Cabeçalho da Empresa no Topo do Agendamento */}
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '2px solid var(--blue-border)', boxShadow: 'var(--shadow-md)', marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '14px', background: '#f8fafc', border: '1.5px solid var(--blue-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', overflow: 'hidden', padding: '4px' }}>
            {empresa.logo ? (
              <img src={empresa.logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : (
              <Briefcase size={32} style={{ color: 'var(--blue-primary)' }} />
            )}
          </div>

          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--blue-primary)' }}>
            {empresa.razaoSocial || empresa.nomeFantasia || 'Escritório de Bolso'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {empresa.endereco ? `📍 ${empresa.endereco}` : 'Agendamento Online de Serviços'} {empresa.telefone ? `• 📞 ${empresa.telefone}` : ''}
          </p>
        </div>

        {/* VITRINE VISUAL DE SERVIÇOS CADASTRADOS */}
        {produtos.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--blue-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={20} style={{ color: 'var(--orange-primary)' }} /> Nossos Serviços Cadastrados (Clique para Selecionar):
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
              {produtos.map(p => {
                const precoVal = p.precoVenda ?? p.preco ?? p.valorUnitario ?? 0;
                const isSelected = String(p.id) === String(produtoId);

                return (
                  <div
                    key={p.id}
                    onClick={() => selecionarCardServico(p)}
                    style={{
                      background: isSelected ? 'var(--blue-light-bg)' : '#ffffff',
                      border: `2px solid ${isSelected ? 'var(--orange-primary)' : 'var(--blue-border)'}`,
                      borderRadius: '14px',
                      padding: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      justify: 'space-between',
                      position: 'relative'
                    }}
                  >
                    {isSelected && (
                      <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--orange-primary)', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={14} />
                      </span>
                    )}

                    {p.foto && (
                      <div style={{ width: '100%', height: '100px', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px', background: '#f8fafc' }}>
                        <img src={p.foto} alt={p.nome} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                    )}

                    <div>
                      <strong style={{ fontSize: '0.98rem', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                        {p.nome}
                      </strong>
                      {p.descricao && (
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {p.descricao}
                        </p>
                      )}
                    </div>

                    <div style={{ marginTop: '10px', fontWeight: 800, color: '#047857', fontSize: '0.95rem' }}>
                      R$ {Number(precoVal).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ALERTA DE ERRO DE CONFLITO DE DATA / HORÁRIO */}
        {erroBloqueio && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', border: '2px solid #fca5a5', padding: '16px', borderRadius: '14px', fontWeight: 800, fontSize: '0.92rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <XCircle size={24} style={{ flexShrink: 0 }} />
            <span>{erroBloqueio}</span>
          </div>
        )}

        {/* Form de Agendamento */}
        <div className="card card-blue" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--blue-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={22} style={{ color: 'var(--orange-primary)' }} /> Preencha e Confirme seu Agendamento
          </h2>

          <form onSubmit={handleConfirmarAgendamento}>
            {/* Escolher Produto / Serviço na Lista */}
            <div className="form-group">
              <label className="form-label">Serviço Desejado *</label>
              <select className="form-select" value={produtoId} onChange={handleSelectProduto} required>
                <option value="">-- Selecionar Serviço ({produtos.length} disponíveis) --</option>
                {produtos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nome} {p.precoVenda > 0 ? `- R$ ${Number(p.precoVenda).toFixed(2)}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {!produtoId && (
              <div className="form-group">
                <label className="form-label">Ou Digite o Nome do Serviço Desejado *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Corte de Cabelo, Consultoria ou Instalação"
                  value={tituloServico}
                  onChange={(e) => setTituloServico(e.target.value)}
                  required
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
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

              <div className="form-group">
                <label className="form-label">Seu WhatsApp / Telefone *</label>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Data Preferida *</label>
                <input
                  type="date"
                  className="form-input"
                  value={data}
                  onChange={(e) => {
                    setData(e.target.value);
                    setErroBloqueio(null);
                  }}
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
                    onChange={(e) => {
                      setHorario(e.target.value);
                      setErroBloqueio(null);
                    }}
                    required={!diaInteiro}
                  />
                </div>
              )}
            </div>

            {/* Checkbox Compromisso Dia Inteiro */}
            <div style={{ background: '#fff7ed', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #fed7aa', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="checkDiaInteiro"
                checked={diaInteiro}
                onChange={(e) => {
                  setDiaInteiro(e.target.checked);
                  setErroBloqueio(null);
                }}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="checkDiaInteiro" style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--orange-primary)', cursor: 'pointer' }}>
                ☀️ Desejo reservar o DIA INTEIRO nesta data (Bloqueia a data completa)
              </label>
            </div>

            {valorServico > 0 && (
              <div style={{ background: '#ecfdf5', padding: '12px 16px', borderRadius: '10px', border: '1px solid #6ee7b7', marginBottom: '16px', color: '#047857', fontWeight: 800, fontSize: '0.95rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Valor Estimado do Serviço:</span>
                <span style={{ fontSize: '1.2rem' }}>R$ {Number(valorServico).toFixed(2)}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Observações ou Preferências (Opcional)</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Ex: Prefiro atendimento pela manhã, levar amostra..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-orange" style={{ width: '100%', padding: '14px', fontSize: '1.05rem', fontWeight: 800 }}>
              <CheckCircle size={20} /> Confirmar Agendamento Online
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
