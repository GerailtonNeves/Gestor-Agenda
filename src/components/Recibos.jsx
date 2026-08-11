import React, { useState } from 'react';
import { Receipt, Plus, Eye, Send, Trash2, Edit, CheckCircle, Package } from 'lucide-react';
import ModalDocumento from './ModalDocumento';
import { abrirWhatsapp, msgWhatsapp } from '../utils/whatsapp';

export function numeroParaExtenso(valor) {
  if (!valor || isNaN(valor) || valor <= 0) return '';
  const val = parseFloat(valor);
  const reais = Math.floor(val);
  const centavos = Math.round((val - reais) * 100);

  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const dezenasTeens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  function converteGrupo(n) {
    if (n === 100) return 'cem';
    let res = '';
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (c > 0) res += centenas[c];
    if (d === 1) {
      res += (res ? ' e ' : '') + dezenasTeens[u];
    } else {
      if (d > 1) res += (res ? ' e ' : '') + dezenas[d];
      if (u > 0) res += (res ? ' e ' : '') + unidades[u];
    }
    return res;
  }

  function converterInteiro(num) {
    if (num === 0) return 'zero';
    if (num < 1000) return converteGrupo(num);
    if (num < 1000000) {
      const mil = Math.floor(num / 1000);
      const resto = num % 1000;
      let strMil = mil === 1 ? 'um mil' : converteGrupo(mil) + ' mil';
      if (resto > 0) {
        strMil += (resto < 100 || resto % 100 === 0 ? ' e ' : ' ') + converteGrupo(resto);
      }
      return strMil;
    }
    return String(num);
  }

  let extensoReais = converterInteiro(reais);
  let textoFinal = extensoReais + (reais === 1 ? ' real' : ' reais');

  if (centavos > 0) {
    let extensoCentavos = converteGrupo(centavos);
    textoFinal += ' e ' + extensoCentavos + (centavos === 1 ? ' centavo' : ' centavos');
  }

  return textoFinal.charAt(0).toUpperCase() + textoFinal.slice(1);
}

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

export default function Recibos({ recibos = [], clientes = [], produtos = [], empresa = {}, onSaveRecibos, onDeleteRecibo }) {
  const [modalNovoOpen, setModalNovoOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [docVisualizar, setDocVisualizar] = useState(null);

  // Form State para Recibo Elaborado
  const [clienteId, setClienteId] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [valor, setValor] = useState('');
  const [valorExtenso, setValorExtenso] = useState('');
  const [referenteA, setReferenteA] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [cidadeUf, setCidadeUf] = useState('São Paulo - SP');
  const [observacoes, setObservacoes] = useState('');

  const abrirModalNovo = () => {
    setEditId(null);
    setClienteId('');
    setClienteNome('');
    setClienteTelefone('');
    setValor('');
    setValorExtenso('');
    setReferenteA('');
    setFormaPagamento('PIX');
    setCidadeUf('São Paulo - SP');
    setObservacoes('');
    setModalNovoOpen(true);
  };

  const abrirModalEditar = (rec) => {
    setEditId(rec.id);
    setClienteId(rec.clienteId || '');
    setClienteNome(rec.clienteNome || '');
    setClienteTelefone(rec.clienteTelefone || '');
    setValor(String(rec.valor || ''));
    setValorExtenso(rec.valorExtenso || numeroParaExtenso(rec.valor));
    setReferenteA(rec.referenteA || '');
    setFormaPagamento(rec.formaPagamento || 'PIX');
    setCidadeUf(rec.cidadeUf || 'São Paulo - SP');
    setObservacoes(rec.observacoes || '');
    setModalNovoOpen(true);
  };

  const handleValorChange = (valStr) => {
    setValor(valStr);
    const num = parseFloat(valStr);
    if (!isNaN(num) && num > 0) {
      setValorExtenso(numeroParaExtenso(num));
    } else {
      setValorExtenso('');
    }
  };

  const selecionarClienteExistente = (e) => {
    const id = e.target.value;
    setClienteId(id);
    if (!id) return;
    const cli = clientes.find(c => String(c.id) === String(id));
    if (cli) {
      setClienteNome(cli.nome);
      setClienteTelefone(cli.whatsapp || cli.telefone || '');
    }
  };

  // QUANDO SELECIONA UM PRODUTO/SERVIÇO DA LISTA CADASTRADA
  const selecionarServicoCadastrado = (e) => {
    const prodId = e.target.value;
    if (!prodId) return;
    const prod = produtos.find(p => String(p.id) === String(prodId));
    if (prod) {
      const preco = parseVal(prod.precoVenda ?? prod.preco ?? prod.valorUnitario ?? 0);
      setReferenteA(prod.nome || '');
      if (preco > 0) {
        handleValorChange(String(preco));
      }
    }
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    if (!clienteNome.trim() || !valor || !referenteA.trim()) return;

    const valorNum = parseFloat(valor) || 0;
    const reciboData = {
      clienteId,
      clienteNome: clienteNome.trim(),
      clienteTelefone: clienteTelefone.trim(),
      valor: valorNum,
      valorExtenso: valorExtenso || numeroParaExtenso(valorNum),
      referenteA: referenteA.trim(),
      formaPagamento,
      cidadeUf,
      observacoes
    };

    if (editId) {
      const atualizados = recibos.map(r => r.id === editId ? { ...r, ...reciboData } : r);
      onSaveRecibos(atualizados);
    } else {
      const novoRecibo = {
        id: 'rec_' + Date.now(),
        numero: 'REC-2026-' + String(recibos.length + 1).padStart(3, '0'),
        dataEmissao: new Date().toISOString().split('T')[0],
        ...reciboData
      };
      onSaveRecibos([novoRecibo, ...recibos]);
    }

    setModalNovoOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="card card-blue" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--blue-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Receipt size={24} /> Emissor de Recibos Profissionais
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Emita recibos comerciais com <strong>valor por extenso automático</strong>, impressão em PDF e envio no WhatsApp.
          </p>
        </div>

        <button className="btn btn-orange" onClick={abrirModalNovo}>
          <Plus size={18} /> Emitir Novo Recibo
        </button>
      </div>

      {/* Lista de Recibos */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Nome do Pagador</th>
              <th>Telefone / WhatsApp</th>
              <th>Data Emissão</th>
              <th>Valor</th>
              <th>Forma Pagamento</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {recibos.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  Nenhum recibo emitido ainda.
                </td>
              </tr>
            ) : (
              recibos.map(rec => (
                <tr key={rec.id}>
                  <td><strong style={{ color: 'var(--blue-primary)' }}>{rec.numero}</strong></td>
                  <td><strong>{rec.clienteNome}</strong></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{rec.clienteTelefone || '—'}</td>
                  <td>{rec.dataEmissao}</td>
                  <td style={{ fontWeight: 800, color: '#047857' }}>
                    R$ {Number(rec.valor).toFixed(2)}
                  </td>
                  <td><span className="badge badge-blue">{rec.formaPagamento}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-sm btn-primary" onClick={() => setDocVisualizar(rec)} title="Visualizar / Imprimir PDF">
                        <Eye size={14} /> Imprimir PDF
                      </button>
                      <button className="btn btn-sm btn-whatsapp" onClick={() => abrirWhatsapp(rec.clienteTelefone || empresa.whatsapp, msgWhatsapp.recibo(rec, empresa))} title="Enviar para o WhatsApp">
                        <Send size={14} /> WhatsApp
                      </button>
                      <button className="btn btn-sm btn-primary" onClick={() => abrirModalEditar(rec)} title="Editar Recibo">
                        <Edit size={14} />
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={() => onDeleteRecibo(rec.id)} title="Excluir">
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

      {/* Modal Criar / Editar Recibo Elaborado */}
      {modalNovoOpen && (
        <div className="modal-overlay" onClick={() => setModalNovoOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editId ? 'Editar Recibo' : 'Emitir Novo Recibo Profissional'}</h3>
              <button className="action-btn-circle" onClick={() => setModalNovoOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSalvar} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Selecionar Cliente */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Selecione o Cliente / Pagador</label>
                <select className="form-select" value={clienteId} onChange={selecionarClienteExistente}>
                  <option value="">-- Selecionar Cliente Cadastrado --</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nome do Pagador *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nome completo do pagador"
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">WhatsApp / Telefone (Campo Separado)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="(00) 00000-0000"
                    value={clienteTelefone}
                    onChange={(e) => setClienteTelefone(e.target.value)}
                  />
                </div>
              </div>

              {/* Valor e Valor por Extenso */}
              <div style={{ background: 'var(--blue-ice-bg)', padding: '14px', borderRadius: '12px', border: '1.5px solid var(--blue-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', alignItems: 'center' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ color: 'var(--orange-primary)', fontWeight: 800 }}>Valor (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      placeholder="0.00"
                      value={valor}
                      onChange={(e) => handleValorChange(e.target.value)}
                      required
                      style={{ fontWeight: 800, fontSize: '1.2rem', borderColor: 'var(--orange-bright)' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ color: 'var(--blue-primary)', fontWeight: 800 }}>Valor por Extenso (Automático)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Um mil e quinhentos reais"
                      value={valorExtenso}
                      onChange={(e) => setValorExtenso(e.target.value)}
                      style={{ fontWeight: 700, fontStyle: 'italic', background: '#fff' }}
                    />
                  </div>
                </div>
              </div>

              {/* Puxar dos Serviços / Produtos Cadastrados */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ color: 'var(--orange-primary)' }}>Puxar de um Serviço / Produto Cadastrado (Opcional):</label>
                <select className="form-select" onChange={selecionarServicoCadastrado}>
                  <option value="">-- Selecionar da Lista de Serviços ({produtos.length} cadastrados) --</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} (R$ {parseVal(p.precoVenda ?? p.preco ?? 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Referente a */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Referente a (Descrição do Serviço / Pagamento) *</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="Ex: Pagamento referente ao serviço prestado no mês de Julho."
                  value={referenteA}
                  onChange={(e) => setReferenteA(e.target.value)}
                  required
                />
              </div>

              {/* Forma de Pagamento e Cidade/UF */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Forma de Pagamento</label>
                  <select className="form-select" value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
                    <option value="PIX">PIX</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Transferência / TED">Transferência / TED</option>
                    <option value="Boleto Bancário">Boleto Bancário</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Cidade / UF da Emissão</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cidadeUf}
                    onChange={(e) => setCidadeUf(e.target.value)}
                  />
                </div>
              </div>

              {/* Observações Adicionais */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Observações / Garantias (Opcional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Quitado em parcela única. Garantia de 90 dias."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '14px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalNovoOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-orange">
                  <CheckCircle size={18} /> {editId ? 'Salvar Recibo' : 'Emitir Recibo Oficial'}
                </button>
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
        tipo="recibo"
        empresa={empresa}
      />
    </div>
  );
}
