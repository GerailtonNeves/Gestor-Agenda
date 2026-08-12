import React, { useState } from 'react';
import { Key, ShieldCheck, Copy, CheckCircle, Trash2, Edit, Ban, Unlock, Plus, Send, AlertTriangle, Users, Sparkles, RefreshCw, Clock } from 'lucide-react';
import { licenseApi } from '../utils/licenseUtils';
import { abrirWhatsapp } from '../utils/whatsapp';

export default function ModalLicenca({ isOpen, onClose, onUpdateLicense }) {
  const [licencaSistema, setLicencaSistema] = useState(() => licenseApi.getLicense());
  const [listaClientes, setListaClientes] = useState(() => licenseApi.getLicencasClientes());
  const [abaAtiva, setAbaAtiva] = useState('clientes'); // 'clientes', 'gerar', 'ativar'

  // Form de Criar / Editar Licença de Cliente
  const [editId, setEditId] = useState(null);
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [opcaoValidade, setOpcaoValidade] = useState('30'); // '5MIN', '24H', '30', '90', '365', '9999'

  // Form de Ativar Licença no Sistema
  const [inputChaveAtivar, setInputChaveAtivar] = useState('');
  const [mensagemStatus, setMensagemStatus] = useState(null);
  const [statusTipo, setStatusTipo] = useState('info'); // 'success', 'error', 'info'

  if (!isOpen) return null;

  const tempoRestanteTexto = licenseApi.getDaysRemainingText();

  const handleSalvarClienteLicenca = (e) => {
    e.preventDefault();
    if (!clienteNome.trim()) {
      alert('⚠️ Digite o nome do cliente.');
      return;
    }

    let tipoStr = 'Mensal (30 dias)';
    let diasNum = 30;

    if (opcaoValidade === '5MIN') {
      tipoStr = '⏱️ Licença Teste (5 Minutos)';
      diasNum = 0.0035;
    } else if (opcaoValidade === '24H') {
      tipoStr = '⏳ Licença Teste (24 Horas)';
      diasNum = 1;
    } else if (opcaoValidade === '90') {
      tipoStr = 'Trimestral (90 dias)';
      diasNum = 90;
    } else if (opcaoValidade === '365') {
      tipoStr = 'Anual (365 dias)';
      diasNum = 365;
    } else if (opcaoValidade === '9999') {
      tipoStr = 'Vitalício (Ilimitado ⭐)';
      diasNum = 9999;
    }

    if (editId) {
      const atualizados = listaClientes.map(item => {
        if (item.id === editId) {
          return {
            ...item,
            clienteNome: clienteNome.trim(),
            clienteTelefone: clienteTelefone.trim(),
            diasValidade: diasNum,
            opcaoValidade,
            tipo: tipoStr
          };
        }
        return item;
      });
      licenseApi.saveLicencasClientes(atualizados);
      setListaClientes(atualizados);
      setStatusTipo('success');
      setMensagemStatus(`✨ Licença do cliente "${clienteNome}" atualizada com sucesso!`);
    } else {
      const novaChave = licenseApi.generateKey(opcaoValidade);
      const novaLicencaCliente = {
        id: 'lic_cli_' + Date.now(),
        clienteNome: clienteNome.trim(),
        clienteTelefone: clienteTelefone.trim(),
        chave: novaChave,
        diasValidade: diasNum,
        opcaoValidade,
        tipo: tipoStr,
        dataCriacao: new Date().toISOString().split('T')[0],
        status: 'Ativo'
      };
      const novaLista = [novaLicencaCliente, ...listaClientes];
      licenseApi.saveLicencasClientes(novaLista);
      setListaClientes(novaLista);
      setStatusTipo('success');
      setMensagemStatus(`🎉 Licença "${novaChave}" gerada e cadastrada para ${clienteNome}!`);
    }

    // Reset Form
    setEditId(null);
    setClienteNome('');
    setClienteTelefone('');
    setOpcaoValidade('30');
    setAbaAtiva('clientes');
  };

  const handleEditarLicenca = (lic) => {
    setEditId(lic.id);
    setClienteNome(lic.clienteNome || '');
    setClienteTelefone(lic.clienteTelefone || '');
    setOpcaoValidade(lic.opcaoValidade || '30');
    setAbaAtiva('gerar');
  };

  const handleToggleBloqueio = (lic) => {
    const novoStatus = lic.status === 'Bloqueado' ? 'Ativo' : 'Bloqueado';
    const atualizados = listaClientes.map(item => item.id === lic.id ? { ...item, status: novoStatus } : item);
    licenseApi.saveLicencasClientes(atualizados);
    setListaClientes(atualizados);

    if (licencaSistema && licencaSistema.chave && licencaSistema.chave.trim().toUpperCase() === lic.chave.trim().toUpperCase()) {
      const licAtualizada = { ...licencaSistema, status: novoStatus };
      licenseApi.setLicense(licAtualizada);
      setLicencaSistema(licAtualizada);
    }

    window.dispatchEvent(new CustomEvent('licenca_status_alterado'));

    setStatusTipo(novoStatus === 'Bloqueado' ? 'error' : 'success');
    setMensagemStatus(`${novoStatus === 'Bloqueado' ? '🚫 Licença Bloqueada' : '🔓 Licença Desbloqueada'} para o cliente ${lic.clienteNome}!`);
  };

  const handleExcluirLicenca = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta licença do cadastro?')) {
      const atualizados = listaClientes.filter(item => item.id !== id);
      licenseApi.saveLicencasClientes(atualizados);
      setListaClientes(atualizados);
      setStatusTipo('info');
      setMensagemStatus('🗑️ Licença excluída do cadastro com sucesso.');
    }
  };

  const handleCopiarChave = (chave) => {
    navigator.clipboard.writeText(chave);
    alert(`📋 Chave "${chave}" copiada para a área de transferência!`);
  };

  const handleEnviarWhatsapp = (lic) => {
    const msg = `Olá ${lic.clienteNome}! Aqui está a sua chave de ativação da licença do Escritório de Bolso:\n\n🔑 *CHAVE DE LICENÇA:* ${lic.chave}\n⏱️ *TIPO:* ${lic.tipo}\n\nPara ativar no sistema, abra a opção de Licença e cole a sua chave exatamente como escrita acima.`;
    abrirWhatsapp(lic.clienteTelefone, msg);
  };

  // VALIDAÇÃO RÍGIDA NA ATIVAÇÃO DA LICENÇA
  const handleAtivarChave = (e) => {
    e.preventDefault();
    if (!inputChaveAtivar.trim()) return;

    const res = licenseApi.activateKey(inputChaveAtivar);

    if (res.success) {
      setLicencaSistema(res.license);
      setInputChaveAtivar('');
      setStatusTipo('success');
      setMensagemStatus(res.message);
      window.dispatchEvent(new CustomEvent('licenca_status_alterado'));
      if (onUpdateLicense) onUpdateLicense(res.license);
    } else {
      setStatusTipo('error');
      setMensagemStatus(res.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 3500 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px', border: '2px solid var(--orange-primary)' }}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--orange-primary)' }}>
            <Key size={22} /> Gerenciador de Licenças dos Clientes
          </h3>
          <button className="action-btn-circle" onClick={onClose}>✕</button>
        </div>

        {/* STATUS BAR DA LICENÇA ATIVA DO SISTEMA LOCAL */}
        <div style={{ background: 'var(--blue-ice-bg)', padding: '14px 18px', borderRadius: '12px', border: '2px solid var(--blue-primary)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--blue-primary)', fontWeight: 800 }}>LICENÇA ATIVA NESTE SISTEMA</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {licencaSistema.tipo} ({licencaSistema.clienteNome || 'Proprietário'})
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Chave: <code style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700 }}>{licencaSistema.chave}</code>
            </div>
          </div>

          <div>
            <span style={{ background: licencaSistema.status === 'Bloqueado' ? '#dc2626' : '#059669', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontWeight: 800, fontSize: '0.82rem' }}>
              {licencaSistema.status === 'Bloqueado' ? '🚫 SISTEMA BLOQUEADO' : tempoRestanteTexto}
            </span>
          </div>
        </div>

        {/* MENSAGEM DE FEEDBACK */}
        {mensagemStatus && (
          <div style={{
            background: statusTipo === 'error' ? '#fee2e2' : statusTipo === 'success' ? '#d1fae5' : '#e0f2fe',
            color: statusTipo === 'error' ? '#dc2626' : statusTipo === 'success' ? '#047857' : '#0284c7',
            padding: '12px 16px',
            borderRadius: '10px',
            border: `1.5px solid ${statusTipo === 'error' ? '#fca5a5' : statusTipo === 'success' ? '#6ee7b7' : '#7dd3fc'}`,
            fontWeight: 800,
            fontSize: '0.9rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {statusTipo === 'error' ? <AlertTriangle size={20} /> : <Sparkles size={20} />}
            <span>{mensagemStatus}</span>
          </div>
        )}

        {/* CONTROLE DE ABAS */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${abaAtiva === 'clientes' ? 'btn-orange' : 'btn-secondary'}`}
            onClick={() => setAbaAtiva('clientes')}
          >
            <Users size={16} /> Clientes Com Licença ({listaClientes.length})
          </button>
          <button
            className={`btn btn-sm ${abaAtiva === 'gerar' ? 'btn-orange' : 'btn-secondary'}`}
            onClick={() => {
              setEditId(null);
              setClienteNome('');
              setClienteTelefone('');
              setOpcaoValidade('30');
              setAbaAtiva('gerar');
            }}
          >
            <Plus size={16} /> Gerar Nova Licença (Inc. 5 Min e 24h)
          </button>
          <button
            className={`btn btn-sm ${abaAtiva === 'ativar' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setAbaAtiva('ativar')}
          >
            <ShieldCheck size={16} /> Ativar Chave no Sistema
          </button>
        </div>

        {/* ABA 1: LISTA E GERENCIAMENTO DOS CLIENTES QUE COMPRARAM LICENÇA */}
        {abaAtiva === 'clientes' && (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Cliente / Telefone</th>
                  <th>Chave de Licença (Exata)</th>
                  <th>Duração / Tipo</th>
                  <th>Data Criação</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {listaClientes.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      Nenhum cliente com licença cadastrado ainda.
                    </td>
                  </tr>
                ) : (
                  listaClientes.map(lic => (
                    <tr key={lic.id} style={{ background: lic.status === 'Bloqueado' ? '#fff1f2' : 'transparent' }}>
                      <td>
                        <strong>{lic.clienteNome}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{lic.clienteTelefone || '—'}</div>
                      </td>
                      <td>
                        <code style={{ background: '#f1f5f9', padding: '3px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 800, fontSize: '0.82rem' }}>
                          {lic.chave}
                        </code>
                      </td>
                      <td><span className="badge badge-orange">{lic.tipo}</span></td>
                      <td style={{ fontSize: '0.82rem' }}>{lic.dataCriacao}</td>
                      <td>
                        <span className={`badge ${lic.status === 'Bloqueado' ? 'badge-danger' : 'badge-success'}`}>
                          {lic.status === 'Bloqueado' ? '🚫 Bloqueado' : '✅ Ativo'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleCopiarChave(lic.chave)}
                            title="Copiar Chave de Licença"
                          >
                            <Copy size={13} />
                          </button>

                          <button
                            className="btn btn-sm btn-whatsapp"
                            onClick={() => handleEnviarWhatsapp(lic)}
                            title="Enviar Chave no WhatsApp do Cliente"
                          >
                            <Send size={13} />
                          </button>

                          <button
                            className={`btn btn-sm ${lic.status === 'Bloqueado' ? 'btn-orange' : 'btn-secondary'}`}
                            onClick={() => handleToggleBloqueio(lic)}
                            title={lic.status === 'Bloqueado' ? 'Desbloquear Licença' : 'Bloquear Licença'}
                          >
                            {lic.status === 'Bloqueado' ? <Unlock size={13} /> : <Ban size={13} style={{ color: '#dc2626' }} />}
                          </button>

                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleEditarLicenca(lic)}
                            title="Editar Cliente ou Validade"
                          >
                            <Edit size={13} />
                          </button>

                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleExcluirLicenca(lic.id)}
                            title="Excluir do Cadastro"
                          >
                            <Trash2 size={13} style={{ color: '#dc2626' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ABA 2: FORMULÁRIO PARA GERAR LICENÇA (INCLUINDO 5 MINUTOS E 24 HORAS) */}
        {abaAtiva === 'gerar' && (
          <form onSubmit={handleSalvarClienteLicenca} style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1.5px solid var(--orange-border)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--orange-primary)', margin: 0 }}>
              {editId ? '✏️ Editar Licença do Cliente' : '✨ Gerar Nova Licença para Cliente'}
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Nome do Cliente *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: João da Silva ou Cliente Teste"
                  value={clienteNome}
                  onChange={(e) => setClienteNome(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">WhatsApp / Telefone com DDD</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="(00) 00000-0000"
                  value={clienteTelefone}
                  onChange={(e) => setClienteTelefone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Duração da Licença *</label>
              <select className="form-select" value={opcaoValidade} onChange={(e) => setOpcaoValidade(e.target.value)} style={{ fontWeight: 800 }}>
                <option value="5MIN">⏱️ Licença Teste Rápido (5 Minutos)</option>
                <option value="24H">⏳ Licença Teste Demonstrativo (24 Horas)</option>
                <option value="30">Mensal (30 dias)</option>
                <option value="90">Trimestral (90 dias)</option>
                <option value="365">Anual (365 dias)</option>
                <option value="9999">Vitalício (Ilimitado ⭐)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setAbaAtiva('clientes')}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-orange" style={{ fontWeight: 800 }}>
                {editId ? 'Salvar Alterações' : '✨ Gerar & Cadastrar Licença'}
              </button>
            </div>
          </form>
        )}

        {/* ABA 3: ATIVAR CHAVE DE LICENÇA */}
        {abaAtiva === 'ativar' && (
          <form onSubmit={handleAtivarChave} style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1.5px solid var(--blue-border)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--blue-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} /> Ativar Chave de Licença neste Sistema
            </h4>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Digite ou cole a chave de licença exatamente como foi gerada (incluindo letras, números e traços).
            </p>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 800, color: 'var(--blue-primary)' }}>Chave de Licença Exata *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: EB-TESTE-5MIN-X7A1-M9K2 ou EB-TESTE-24H-B2V1-99A1"
                value={inputChaveAtivar}
                onChange={(e) => setInputChaveAtivar(e.target.value)}
                style={{ fontWeight: 800, letterSpacing: '1px', fontSize: '1.05rem', borderColor: 'var(--blue-primary)' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ fontWeight: 800, padding: '12px 24px' }}>
                <CheckCircle size={18} /> Ativar Licença Agora
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
