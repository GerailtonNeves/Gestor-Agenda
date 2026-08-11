import React, { useState } from 'react';
import { DollarSign, Plus, ArrowUpCircle, ArrowDownCircle, CheckCircle, Trash2, Edit, Receipt, Send, Eye, Sparkles } from 'lucide-react';
import { safeFormatDate } from '../utils/storage';
import { numeroParaExtenso } from './Recibos';
import ModalDocumento from './ModalDocumento';
import { abrirWhatsapp, msgWhatsapp } from '../utils/whatsapp';

export default function Financeiro({ 
  financeiro = [], 
  recibos = [], 
  clientes = [], 
  empresa = {}, 
  onSaveFinanceiro, 
  onSaveRecibos, 
  onDeleteFinanceiro 
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos', 'receita', 'despesa', 'vencidos'
  
  // Modal de Recibo Gerado na Baixa
  const [docVisualizar, setDocVisualizar] = useState(null);
  const [reciboAlertPopup, setReciboAlertPopup] = useState(null);

  // Form State
  const [tipo, setTipo] = useState('despesa'); // 'receita' ou 'despesa'
  const [descricao, setDescricao] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [valor, setValor] = useState('');
  const [dataVencimento, setDataVencimento] = useState(new Date().toISOString().split('T')[0]);
  const [categoria, setCategoria] = useState('Geral');
  const [status, setStatus] = useState('pendente');

  const abrirModalNovo = () => {
    setEditId(null);
    setTipo('despesa');
    setDescricao('');
    setClienteNome('');
    setValor('');
    setDataVencimento(new Date().toISOString().split('T')[0]);
    setCategoria('Geral');
    setStatus('pendente');
    setModalOpen(true);
  };

  const abrirModalEditar = (item) => {
    setEditId(item.id);
    setTipo(item.tipo || 'despesa');
    setDescricao(item.descricao || '');
    setClienteNome(item.clienteNome || '');
    setValor(String(item.valor || ''));
    setDataVencimento(item.dataVencimento || new Date().toISOString().split('T')[0]);
    setCategoria(item.categoria || 'Geral');
    setStatus(item.status || 'pendente');
    setModalOpen(true);
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    if (!descricao.trim() || !valor) return;

    const lancamentoData = {
      tipo,
      descricao,
      clienteNome: clienteNome || 'Não informado',
      valor: parseFloat(valor),
      dataVencimento,
      categoria,
      status
    };

    if (editId) {
      const atualizados = financeiro.map(f => f.id === editId ? { ...f, ...lancamentoData } : f);
      onSaveFinanceiro(atualizados);
    } else {
      const novoLancamento = {
        id: 'fin_' + Date.now(),
        ...lancamentoData
      };
      onSaveFinanceiro([...financeiro, novoLancamento]);
    }

    setModalOpen(false);
  };

  // DAR BAIXA AUTOMÁTICA E CRIAR RECIBO PROFISSIONAL NO SISTEMA
  const toggleStatusPago = (itemTarget) => {
    const novoStatus = itemTarget.status === 'pago' ? 'pendente' : 'pago';
    
    const atualizado = financeiro.map(item => {
      if (item.id === itemTarget.id) {
        return { ...item, status: novoStatus };
      }
      return item;
    });

    onSaveFinanceiro(atualizado);

    // Se a ação for "DAR BAIXA" (Marcar como Pago/Recebido):
    if (novoStatus === 'pago') {
      const valorNum = parseFloat(itemTarget.valor) || 0;
      
      // Tenta encontrar dados de contato do cliente cadastrado
      let telCliente = '';
      let idCliente = '';
      if (itemTarget.clienteNome) {
        const cliFound = clientes.find(c => c.nome.toLowerCase() === itemTarget.clienteNome.toLowerCase());
        if (cliFound) {
          idCliente = cliFound.id;
          telCliente = cliFound.whatsapp || cliFound.telefone || '';
        }
      }

      // Cria o Recibo Oficial no Banco de Recibos
      const novoRecibo = {
        id: 'rec_fin_' + Date.now(),
        financeiroRefId: itemTarget.id,
        numero: 'REC-2026-' + String(recibos.length + 1).padStart(3, '0'),
        dataEmissao: new Date().toISOString().split('T')[0],
        clienteId: idCliente,
        clienteNome: itemTarget.clienteNome || 'Cliente',
        clienteTelefone: telCliente,
        valor: valorNum,
        valorExtenso: numeroParaExtenso(valorNum),
        referenteA: `Pagamento / Quitação de: ${itemTarget.descricao}`,
        formaPagamento: 'PIX',
        cidadeUf: 'São Paulo - SP',
        observacoes: 'Recibo emitido automaticamente via Baixa no Módulo Financeiro.'
      };

      if (onSaveRecibos) {
        onSaveRecibos([novoRecibo, ...recibos]);
      }

      // Abre popup/banner em destaque para o usuário com botões de Ver PDF e Enviar WhatsApp!
      setReciboAlertPopup({
        recibo: novoRecibo,
        financeiroItem: itemTarget
      });
    }
  };

  // Encontrar ou gerar recibo correspondente a uma conta paga
  const getReciboDaConta = (itemFin) => {
    let rec = recibos.find(r => r.financeiroRefId === itemFin.id || (r.referenteA && r.referenteA.includes(itemFin.descricao)));
    if (!rec) {
      rec = {
        id: 'rec_fin_view_' + itemFin.id,
        numero: 'REC-2026-FIN',
        dataEmissao: itemFin.dataVencimento || new Date().toISOString().split('T')[0],
        clienteNome: itemFin.clienteNome || 'Cliente',
        clienteTelefone: '',
        valor: itemFin.valor,
        valorExtenso: numeroParaExtenso(itemFin.valor),
        referenteA: `Quitação: ${itemFin.descricao}`,
        formaPagamento: 'PIX',
        cidadeUf: 'São Paulo - SP'
      };
    }
    return rec;
  };

  // Filtragem
  const listaFiltrada = financeiro.filter(item => {
    if (filtroTipo === 'receita') return item.tipo === 'receita';
    if (filtroTipo === 'despesa') return item.tipo === 'despesa';
    if (filtroTipo === 'vencidos') return item.status === 'vencido';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="card card-blue" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--blue-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DollarSign size={24} /> Financeiro - Contas a Pagar e Receber
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Dê baixa nas suas contas para <strong>gerar recibos profissionais automaticamente</strong> e enviar ao cliente no WhatsApp!
          </p>
        </div>

        <button className="btn btn-orange" onClick={abrirModalNovo}>
          <Plus size={18} /> Novo Lançamento
        </button>
      </div>

      {/* POPUP EM DESTAQUE AO DAR BAIXA (GEROU RECIBO) */}
      {reciboAlertPopup && (
        <div style={{
          background: 'var(--blue-gradient)',
          color: '#ffffff',
          padding: '16px 20px',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          border: '2px solid #ffffff',
          animation: 'slideIn 0.3s ease'
        }}>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} /> ✨ RECIBO OFICIAL GERADO COM SUCESSO!
            </div>
            <div style={{ fontSize: '0.88rem', marginTop: '2px', opacity: 0.9 }}>
              Recibo <strong>{reciboAlertPopup.recibo.numero}</strong> emitido para <strong>{reciboAlertPopup.recibo.clienteNome}</strong> no valor de <strong>R$ {Number(reciboAlertPopup.recibo.valor).toFixed(2)}</strong> ({reciboAlertPopup.recibo.valorExtenso}).
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-sm btn-orange"
              onClick={() => {
                setDocVisualizar(reciboAlertPopup.recibo);
                setReciboAlertPopup(null);
              }}
            >
              <Eye size={16} /> Ver Recibo / Foto / PDF
            </button>

            <button
              className="btn btn-sm btn-whatsapp"
              onClick={() => {
                abrirWhatsapp(reciboAlertPopup.recibo.clienteTelefone || empresa.whatsapp, msgWhatsapp.recibo(reciboAlertPopup.recibo, empresa));
                setReciboAlertPopup(null);
              }}
            >
              <Send size={16} /> Enviar Recibo no WhatsApp
            </button>

            <button className="action-btn-circle" style={{ width: '32px', height: '32px' }} onClick={() => setReciboAlertPopup(null)}>✕</button>
          </div>
        </div>
      )}

      {/* Filtros rápidos */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button className={`btn btn-sm ${filtroTipo === 'todos' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltroTipo('todos')}>
          Todos ({financeiro.length})
        </button>
        <button className={`btn btn-sm ${filtroTipo === 'receita' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltroTipo('receita')}>
          Contas a Receber ({financeiro.filter(f => f.tipo === 'receita').length})
        </button>
        <button className={`btn btn-sm ${filtroTipo === 'despesa' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltroTipo('despesa')}>
          Contas a Pagar ({financeiro.filter(f => f.tipo === 'despesa').length})
        </button>
        <button className={`btn btn-sm ${filtroTipo === 'vencidos' ? 'btn-orange' : 'btn-secondary'}`} onClick={() => setFiltroTipo('vencidos')}>
          Vencidos 🔥 ({financeiro.filter(f => f.status === 'vencido').length})
        </button>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Descrição / Pessoa</th>
              <th>Categoria</th>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  Nenhum lançamento financeiro encontrado.
                </td>
              </tr>
            ) : (
              listaFiltrada.map(f => {
                const recAssociado = f.status === 'pago' ? getReciboDaConta(f) : null;

                return (
                  <tr key={f.id} style={{ background: f.status === 'pago' ? 'var(--success-bg)' : 'transparent' }}>
                    <td>
                      {f.tipo === 'receita' ? (
                        <span className="badge badge-success" style={{ gap: '4px' }}>
                          <ArrowUpCircle size={14} /> Receita
                        </span>
                      ) : (
                        <span className="badge badge-danger" style={{ gap: '4px' }}>
                          <ArrowDownCircle size={14} /> Despesa
                        </span>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-main)' }}>{f.descricao}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.clienteNome}</div>
                    </td>
                    <td>{f.categoria}</td>
                    <td>{safeFormatDate(f.dataVencimento)}</td>
                    <td style={{ fontWeight: 800, color: f.tipo === 'receita' ? '#047857' : '#b91c1c' }}>
                      R$ {Number(f.valor).toFixed(2)}
                    </td>
                    <td>
                      {f.status === 'pago' && <span className="badge badge-success">Pago</span>}
                      {f.status === 'pendente' && <span className="badge badge-warning">Pendente</span>}
                      {f.status === 'vencido' && <span className="badge badge-danger">Vencido</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {/* Botão Dar Baixa */}
                        <button
                          className={`btn btn-sm ${f.status === 'pago' ? 'btn-secondary' : 'btn-orange'}`}
                          onClick={() => toggleStatusPago(f)}
                          title={f.status === 'pago' ? "Desfazer baixa" : "Dar Baixa (Gera Recibo Oficial)"}
                        >
                          <CheckCircle size={14} /> {f.status === 'pago' ? 'Pago ✅' : 'Dar Baixa'}
                        </button>

                        {/* Botões do Recibo Gerado quando Pago */}
                        {f.status === 'pago' && recAssociado && (
                          <>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => setDocVisualizar(recAssociado)}
                              title="Visualizar Recibo (PDF/Foto)"
                            >
                              <Receipt size={14} /> Recibo
                            </button>

                            <button
                              className="btn btn-sm btn-whatsapp"
                              onClick={() => abrirWhatsapp(recAssociado.clienteTelefone || empresa.whatsapp, msgWhatsapp.recibo(recAssociado, empresa))}
                              title="Enviar Recibo no WhatsApp do Cliente"
                            >
                              <Send size={14} /> WhatsApp
                            </button>
                          </>
                        )}

                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => abrirModalEditar(f)}
                          title="Editar Conta"
                        >
                          <Edit size={14} />
                        </button>

                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => onDeleteFinanceiro(f.id)}
                          title="Excluir lançamento"
                        >
                          <Trash2 size={14} style={{ color: '#ef4444' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Criar / Editar Lançamento */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editId ? 'Editar Conta Financeira' : 'Novo Lançamento Financeiro'}</h3>
              <button className="action-btn-circle" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSalvar}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <button
                  type="button"
                  className={`btn ${tipo === 'receita' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setTipo('receita')}
                >
                  <ArrowUpCircle size={16} /> Receita (A Receber)
                </button>
                <button
                  type="button"
                  className={`btn ${tipo === 'despesa' ? 'btn-orange' : 'btn-secondary'}`}
                  onClick={() => setTipo('despesa')}
                >
                  <ArrowDownCircle size={16} /> Despesa (A Pagar)
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Descrição *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Pagamento de Fornecedor ou Aluguel"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pessoa / Cliente / Fornecedor</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: João da Silva ou Distribuidora X"
                  value={clienteNome}
                  onChange={(e) => setClienteNome(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="0.00"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    required
                    style={{ fontWeight: 800 }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Data de Vencimento *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Categoria</label>
                  <select className="form-select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                    <option value="Geral">Geral</option>
                    <option value="Serviços / Agenda">Serviços / Agenda</option>
                    <option value="Vendas / Produtos">Vendas / Produtos</option>
                    <option value="Aluguel / Utilidades">Aluguel / Utilidades</option>
                    <option value="Fornecedores">Fornecedores</option>
                    <option value="Impostos / Taxas">Impostos / Taxas</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                    <option value="vencido">Vencido</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-orange">{editId ? 'Salvar Alterações' : 'Salvar Lançamento'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualizar Recibo Impresso / Foto / PDF */}
      <ModalDocumento
        isOpen={!!docVisualizar}
        onClose={() => setDocVisualizar(null)}
        documento={docVisualizar}
        tipo="recibo"
        empresa={empresa}
      />
    </div>
  );
}
