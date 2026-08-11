import React, { useState } from 'react';
import { FileText, Plus, Send, Eye, Trash2, PlusCircle, MinusCircle, Edit, Package } from 'lucide-react';
import ModalDocumento from './ModalDocumento';
import { abrirWhatsapp, msgWhatsapp } from '../utils/whatsapp';

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

export default function Orcamentos({ orcamentos = [], clientes = [], produtos = [], empresa = {}, onSaveOrcamentos, onDeleteOrcamento }) {
  const [modalNovoOpen, setModalNovoOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [docVisualizar, setDocVisualizar] = useState(null);

  // Form State para Novo / Editar Orçamento
  const [clienteId, setClienteId] = useState('');
  const [clienteNomeManual, setClienteNomeManual] = useState('');
  const [clienteTelefoneManual, setClienteTelefoneManual] = useState('');
  const [dataValidade, setDataValidade] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [itens, setItens] = useState([
    { produtoId: '', descricao: '', qtd: 1, valorUnitario: 0.00 }
  ]);
  const [desconto, setDesconto] = useState('0');
  const [observacoes, setObservacoes] = useState('Validade de 7 dias. Formas de pagamento: PIX, Boleto ou Cartão.');
  const [status, setStatus] = useState('Pendente');

  const abrirModalNovo = () => {
    setEditId(null);
    setClienteId('');
    setClienteNomeManual('');
    setClienteTelefoneManual('');
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setDataValidade(d.toISOString().split('T')[0]);
    setItens([{ produtoId: '', descricao: '', qtd: 1, valorUnitario: 0.00 }]);
    setDesconto('0');
    setObservacoes('Validade de 7 dias. Formas de pagamento: PIX, Boleto ou Cartão.');
    setStatus('Pendente');
    setModalNovoOpen(true);
  };

  const abrirModalEditar = (orc) => {
    setEditId(orc.id);
    setClienteId(orc.clienteId || '');
    setClienteNomeManual(orc.clienteNome || '');
    setClienteTelefoneManual(orc.clienteTelefone || '');
    setDataValidade(orc.dataValidade || new Date().toISOString().split('T')[0]);
    setItens(orc.itens && orc.itens.length > 0 ? orc.itens : [{ produtoId: '', descricao: '', qtd: 1, valorUnitario: 0.00 }]);
    setDesconto(String(orc.desconto || 0));
    setObservacoes(orc.observacoes || '');
    setStatus(orc.status || 'Pendente');
    setModalNovoOpen(true);
  };

  const adicionarItem = () => {
    setItens([...itens, { produtoId: '', descricao: '', qtd: 1, valorUnitario: 0.00 }]);
  };

  const removerItem = (idx) => {
    setItens(itens.filter((_, i) => i !== idx));
  };

  const atualizarItem = (idx, campo, valor) => {
    const novos = [...itens];
    novos[idx][campo] = valor;
    setItens(novos);
  };

  // QUANDO SELECIONA UM PRODUTO/SERVIÇO DA LISTA CADASTRADA (COMPARAÇÃO POR STRING FIXADA)
  const selecionarProdutoParaItem = (idx, prodId) => {
    const novos = [...itens];
    if (!prodId) {
      novos[idx].produtoId = '';
      setItens(novos);
      return;
    }
    const prodEncontrado = produtos.find(p => String(p.id) === String(prodId));
    if (prodEncontrado) {
      const preco = parseVal(prodEncontrado.precoVenda ?? prodEncontrado.preco ?? prodEncontrado.valorUnitario ?? 0);
      novos[idx] = {
        ...novos[idx],
        produtoId: prodEncontrado.id,
        descricao: prodEncontrado.nome || '',
        valorUnitario: preco
      };
      setItens(novos);
    }
  };

  const subtotal = itens.reduce((acc, item) => acc + (Number(item.qtd) * Number(item.valorUnitario)), 0);
  const total = Math.max(0, subtotal - (parseFloat(desconto) || 0));

  const handleSalvar = (e) => {
    e.preventDefault();
    if (itens.length === 0) return;

    let nomeCli = clienteNomeManual;
    let telCli = clienteTelefoneManual;
    if (clienteId) {
      const cliFound = clientes.find(c => String(c.id) === String(clienteId));
      if (cliFound) {
        nomeCli = cliFound.nome;
        telCli = cliFound.whatsapp || cliFound.telefone;
      }
    }

    const orcData = {
      clienteId,
      clienteNome: nomeCli || 'Cliente Não Informado',
      clienteTelefone: telCli,
      dataValidade,
      itens,
      desconto: parseFloat(desconto) || 0,
      total,
      observacoes,
      status
    };

    if (editId) {
      const atualizados = orcamentos.map(o => o.id === editId ? { ...o, ...orcData } : o);
      onSaveOrcamentos(atualizados);
    } else {
      const novoOrc = {
        id: 'orc_' + Date.now(),
        numero: 'ORC-2026-' + String(orcamentos.length + 1).padStart(3, '0'),
        dataEmissao: new Date().toISOString().split('T')[0],
        ...orcData
      };
      onSaveOrcamentos([novoOrc, ...orcamentos]);
    }

    setModalNovoOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="card card-orange" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--orange-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={24} /> Orçamentos & Propostas Comerciais
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Crie, edite orçamentos puxando dos Serviços cadastrados, imprima em PDF com a sua marca e envie pelo WhatsApp.
          </p>
        </div>

        <button className="btn btn-orange" onClick={abrirModalNovo}>
          <Plus size={18} /> Novo Orçamento
        </button>
      </div>

      {/* Tabela / Lista de Orçamentos */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Nome do Cliente</th>
              <th>Telefone / WhatsApp</th>
              <th>Emissão / Validade</th>
              <th>Total</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {orcamentos.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  Nenhum orçamento cadastrado ainda.
                </td>
              </tr>
            ) : (
              orcamentos.map(orc => (
                <tr key={orc.id}>
                  <td style={{ fontWeight: 800, color: 'var(--blue-primary)' }}>{orc.numero}</td>
                  <td><strong>{orc.clienteNome}</strong></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{orc.clienteTelefone || '—'}</td>
                  <td>
                    <div>{orc.dataEmissao}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Validade: {orc.dataValidade}</div>
                  </td>
                  <td style={{ fontWeight: 800, color: 'var(--orange-primary)' }}>R$ {Number(orc.total).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${orc.status === 'Aprovado' ? 'badge-success' : orc.status === 'Cancelado' ? 'badge-danger' : 'badge-orange'}`}>
                      {orc.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => setDocVisualizar(orc)} title="Visualizar / Imprimir PDF">
                        <Eye size={14} /> PDF
                      </button>

                      <button
                        className="btn btn-sm btn-whatsapp"
                        onClick={() => abrirWhatsapp(orc.clienteTelefone || empresa.whatsapp, msgWhatsapp.orcamento(orc, empresa))}
                        title="Enviar via WhatsApp"
                      >
                        <Send size={14} /> WhatsApp
                      </button>

                      <button className="btn btn-sm btn-primary" onClick={() => abrirModalEditar(orc)} title="Editar">
                        <Edit size={14} />
                      </button>

                      <button className="btn btn-sm btn-secondary" onClick={() => onDeleteOrcamento(orc.id)} title="Excluir">
                        <Trash2 size={14} style={{ color: '#ef4444' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Criar / Editar Orçamento */}
      {modalNovoOpen && (
        <div className="modal-overlay" onClick={() => setModalNovoOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editId ? 'Editar Orçamento' : 'Novo Orçamento'}</h3>
              <button className="action-btn-circle" onClick={() => setModalNovoOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSalvar}>
              <div className="form-group">
                <label className="form-label">Selecione o Cliente</label>
                <select className="form-select" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                  <option value="">-- Selecionar Cliente Cadastrado --</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              {!clienteId && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Nome do Cliente *</label>
                    <input type="text" className="form-input" placeholder="Nome do cliente" value={clienteNomeManual} onChange={(e) => setClienteNomeManual(e.target.value)} required={!clienteId} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp / Telefone</label>
                    <input type="text" className="form-input" placeholder="(00) 00000-0000" value={clienteTelefoneManual} onChange={(e) => setClienteTelefoneManual(e.target.value)} />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Validade do Orçamento</label>
                  <input type="date" className="form-input" value={dataValidade} onChange={(e) => setDataValidade(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="Pendente">Pendente</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Itens do Orçamento Puxando dos Serviços Cadastrados */}
              <div style={{ margin: '18px 0', background: 'var(--blue-ice-bg)', padding: '16px', borderRadius: '12px', border: '1.5px solid var(--blue-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label className="form-label" style={{ margin: 0, color: 'var(--blue-primary)', fontSize: '0.95rem' }}>
                    📦 Itens & Serviços do Orçamento
                  </label>
                  <button type="button" className="btn btn-sm btn-orange" onClick={adicionarItem}>
                    <PlusCircle size={14} /> + Adicionar Outro Item
                  </button>
                </div>

                {itens.map((item, idx) => (
                  <div key={idx} style={{ background: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '10px' }}>
                    <div className="form-group" style={{ marginBottom: '8px' }}>
                      <label className="form-label" style={{ fontSize: '0.78rem', color: 'var(--orange-primary)' }}>
                        Puxar de um Serviço / Produto Cadastrado:
                      </label>
                      <select
                        className="form-select"
                        style={{ padding: '6px 10px', fontSize: '0.85rem', fontWeight: 700 }}
                        value={item.produtoId || ''}
                        onChange={(e) => selecionarProdutoParaItem(idx, e.target.value)}
                      >
                        <option value="">-- Digitar Manualmente ou Selecionar da Lista ({produtos.length} cadastrados) --</option>
                        {produtos.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.nome} (R$ {parseVal(p.precoVenda ?? p.preco ?? 0).toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.5fr 40px', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Descrição do produto ou serviço"
                        value={item.descricao}
                        onChange={(e) => atualizarItem(idx, 'descricao', e.target.value)}
                        required
                        style={{ fontSize: '0.9rem' }}
                      />
                      <input
                        type="number"
                        min="1"
                        className="form-input"
                        placeholder="Qtd"
                        value={item.qtd}
                        onChange={(e) => atualizarItem(idx, 'qtd', e.target.value)}
                        required
                        style={{ fontSize: '0.9rem' }}
                      />
                      <input
                        type="number"
                        step="0.01"
                        className="form-input"
                        placeholder="Valor R$"
                        value={item.valorUnitario}
                        onChange={(e) => atualizarItem(idx, 'valorUnitario', e.target.value)}
                        required
                        style={{ fontSize: '0.9rem', fontWeight: 700 }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        style={{ padding: '6px', justifyContent: 'center' }}
                        onClick={() => removerItem(idx)}
                        title="Remover item"
                      >
                        <Trash2 size={16} style={{ color: '#ef4444' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal e Desconto */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Desconto (R$)</label>
                  <input type="number" step="0.01" className="form-input" value={desconto} onChange={(e) => setDesconto(e.target.value)} />
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SUBTOTAL: R$ {subtotal.toFixed(2)}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--orange-primary)' }}>TOTAL: R$ {total.toFixed(2)}</div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label">Observações / Condições de Pagamento</label>
                <textarea className="form-textarea" rows="2" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalNovoOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-orange">{editId ? 'Salvar Alterações' : 'Gerar Orçamento'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualizar Documento Impresso */}
      <ModalDocumento
        isOpen={!!docVisualizar}
        onClose={() => setDocVisualizar(null)}
        documento={docVisualizar}
        tipo="orcamento"
        empresa={empresa}
      />
    </div>
  );
}
