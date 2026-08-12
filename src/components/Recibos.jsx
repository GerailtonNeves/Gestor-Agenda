import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Eye, 
  Send, 
  Trash2, 
  Edit, 
  CheckCircle, 
  Package, 
  LayoutGrid, 
  List, 
  DollarSign, 
  Calendar, 
  User, 
  Smartphone,
  Sparkles
} from 'lucide-react';
import ModalDocumento from './ModalDocumento';
import { abrirWhatsapp, msgWhatsapp } from '../utils/whatsapp';
import { safeFormatDate } from '../utils/storage';

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
  const [modoVisao, setModoVisao] = useState('cards'); // 'cards' ou 'tabela'
  const [modalNovoOpen, setModalNovoOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [docVisualizar, setDocVisualizar] = useState(null);

  const cidadeDefault = empresa.cidadeUf || empresa.cidade || 'São Paulo - SP';

  // Form State para Recibo Elaborado
  const [clienteId, setClienteId] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [valor, setValor] = useState('');
  const [valorExtenso, setValorExtenso] = useState('');
  const [referenteA, setReferenteA] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [cidadeUf, setCidadeUf] = useState(cidadeDefault);
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
    setCidadeUf(empresa.cidadeUf || empresa.cidade || 'São Paulo - SP');
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
    setCidadeUf(rec.cidadeUf || empresa.cidadeUf || empresa.cidade || 'São Paulo - SP');
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
      cidadeUf: cidadeUf || empresa.cidadeUf || empresa.cidade || 'São Paulo - SP',
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
            <Receipt size={26} /> Emissor de Recibos Profissionais Executivos
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Emita recibos comerciais com <strong>valor por extenso automático</strong>, visualização em cards verticais, impressão em PDF e envio no WhatsApp.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: '#ffffff', padding: '4px', borderRadius: '10px', border: '1.5px solid var(--blue-border)' }}>
            <button
              className={`btn btn-sm ${modoVisao === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setModoVisao('cards')}
              style={{ border: 'none', padding: '6px 12px' }}
            >
              <LayoutGrid size={15} /> Cards Verticais
            </button>
            <button
              className={`btn btn-sm ${modoVisao === 'tabela' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setModoVisao('tabela')}
              style={{ border: 'none', padding: '6px 12px' }}
            >
              <List size={15} /> Tabela
            </button>
          </div>

          <button className="btn btn-orange" onClick={abrirModalNovo}>
            <Plus size={18} /> Emitir Novo Recibo
          </button>
        </div>
      </div>

      {/* VISÃO 1: CARDS VERTICAIS DESIGN MODERNO PROFISSIONAL */}
      {modoVisao === 'cards' && (
        <>
          {recibos.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <Receipt size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p>Nenhum recibo emitido ainda. Clique em "Emitir Novo Recibo" para começar.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
              {recibos.map(rec => (
                <div
                  key={rec.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    padding: '20px',
                    borderRadius: '16px',
                    border: '2px solid var(--blue-border)',
                    background: '#ffffff',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  {/* TOPO DO CARD VERTICAL */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--blue-primary)', background: 'var(--blue-ice-bg)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--blue-border)' }}>
                        {rec.numero}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} /> {safeFormatDate(rec.dataEmissao)}
                      </span>
                    </div>

                    {/* VALOR DO RECIBO EM DESTAQUE */}
                    <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #6ee7b7', marginBottom: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        VALOR RECEBIDO • PAGO ✅
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#065f46', marginTop: '2px' }}>
                        R$ {Number(rec.valor).toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700, marginTop: '2px' }}>
                        Forma: {rec.formaPagamento || 'PIX'}
                      </div>
                    </div>

                    {/* DADOS DO CLIENTE E SERVIÇO */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--blue-primary)', fontWeight: 800, textTransform: 'uppercase' }}>
                          PAGADOR / CLIENTE:
                        </div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {rec.clienteNome}
                        </div>
                        {rec.clienteTelefone && (
                          <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Smartphone size={13} /> {rec.clienteTelefone}
                          </div>
                        )}
                      </div>

                      <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--orange-primary)', fontWeight: 800, textTransform: 'uppercase' }}>
                          REFERENTE A:
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px', lineHeight: '1.3' }}>
                          "{rec.referenteA}"
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AÇÕES NO RODAPÉ DO CARD VERTICAL */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                    <button 
                      className="btn btn-sm btn-primary" 
                      onClick={() => setDocVisualizar(rec)} 
                      style={{ flex: 1, fontWeight: 800 }}
                    >
                      <Eye size={14} /> Imprimir / PDF
                    </button>

                    <button 
                      className="btn btn-sm btn-whatsapp" 
                      onClick={() => abrirWhatsapp(rec.clienteTelefone || empresa.whatsapp, msgWhatsapp.recibo(rec, empresa))}
                      title="Enviar recibo para o WhatsApp do cliente"
                    >
                      <Send size={14} />
                    </button>

                    <button 
                      className="btn btn-sm btn-secondary" 
                      onClick={() => abrirModalEditar(rec)}
                      title="Editar recibo"
                    >
                      <Edit size={14} />
                    </button>

                    <button 
                      className="btn btn-sm btn-secondary" 
                      onClick={() => onDeleteRecibo(rec.id)}
                      title="Excluir recibo"
                      style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* VISÃO 2: TABELA TRADICIONAL */}
      {modoVisao === 'tabela' && (
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
                    <td>{safeFormatDate(rec.dataEmissao)}</td>
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
      )}

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
                  <label className="form-label">WhatsApp / Telefone</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="(00) 00000-0000"
                    value={clienteTelefone}
                    onChange={(e) => setClienteTelefone(e.target.value)}
                  />
                </div>
              </div>

              {/* SELECIONAR SERVIÇO/PRODUTO CADASTRADO */}
              <div className="form-group" style={{ background: 'var(--blue-ice-bg)', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--blue-border)', marginBottom: 0 }}>
                <label className="form-label" style={{ color: 'var(--orange-primary)', fontSize: '0.85rem' }}>
                  Puxar de um Serviço / Produto Cadastrado (Opcional):
                </label>
                <select className="form-select" onChange={selecionarServicoCadastrado}>
                  <option value="">-- Selecionar Serviço ou Produto Cadastrado --</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} (R$ {parseVal(p.precoVenda ?? p.preco ?? 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Referente a (Descrição do Serviço/Produto) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Serviços de Locução Comercial 30s ou Edição de Áudio"
                  value={referenteA}
                  onChange={(e) => setReferenteA(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: 'var(--orange-primary)', fontWeight: 800 }}>
                    Valor (R$) * <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>(Editável)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="0.00"
                    value={valor}
                    onChange={(e) => handleValorChange(e.target.value)}
                    style={{ fontWeight: 800, borderColor: 'var(--orange-bright)' }}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Forma de Pagamento *</label>
                  <select
                    className="form-select"
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value)}
                  >
                    <option value="PIX">PIX</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Boleto">Boleto Bancário</option>
                    <option value="Transferência">Transferência / TED</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Cidade - Estado</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="São Paulo - SP"
                    value={cidadeUf}
                    onChange={(e) => setCidadeUf(e.target.value)}
                  />
                </div>
              </div>

              {/* Valor por Extenso Automático */}
              {valorExtenso && (
                <div style={{ background: '#ecfdf5', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #6ee7b7', fontSize: '0.88rem', color: '#047857' }}>
                  <strong>Valor por Extenso Automático:</strong>
                  <div style={{ fontWeight: 800, marginTop: '2px' }}>"{valorExtenso}"</div>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Observações Adicionais (Opcional)</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="Informações complementares..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalNovoOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-orange" style={{ fontWeight: 800 }}>
                  <CheckCircle size={18} /> {editId ? 'Salvar Alterações' : 'Emitir Recibo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualizar Recibo para Impressão ou Foto */}
      {docVisualizar && (
        <ModalDocumento
          isOpen={!!docVisualizar}
          onClose={() => setDocVisualizar(null)}
          documento={docVisualizar}
          tipo="recibo"
          empresa={empresa}
        />
      )}
    </div>
  );
}
