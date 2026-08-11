import React, { useState } from 'react';
import { History, ShoppingBag, Eye, Send, Trash2, Calendar, Search, Filter, Printer, DollarSign, ArrowUpCircle } from 'lucide-react';
import ModalCupomFiscal from './ModalCupomFiscal';
import { abrirWhatsapp, msgWhatsapp } from '../utils/whatsapp';
import { safeFormatDate } from '../utils/storage';

export default function HistoricoVendas({ vendas = [], empresa = {}, onDeleteVenda }) {
  const [busca, setBusca] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [filtroPagamento, setFiltroPagamento] = useState('todos');
  const [cupomModalOpen, setCupomModalOpen] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);

  const visualizarCupom = (venda) => {
    setVendaSelecionada(venda);
    setCupomModalOpen(true);
  };

  // Filtragem da lista
  let vendasFiltradas = vendas.filter(v => {
    const termo = busca.toLowerCase();
    const idMatch = (v.id || '').toLowerCase().includes(termo);
    const cliMatch = (v.clienteNome || '').toLowerCase().includes(termo);
    const pagMatch = (v.formaPagamento || '').toLowerCase().includes(termo);
    return idMatch || cliMatch || pagMatch;
  });

  if (filtroData) {
    vendasFiltradas = vendasFiltradas.filter(v => v.data === filtroData);
  }

  if (filtroPagamento !== 'todos') {
    vendasFiltradas = vendasFiltradas.filter(v => (v.formaPagamento || '').toLowerCase() === filtroPagamento.toLowerCase());
  }

  // Estatísticas do Histórico
  const totalVendasPeriodo = vendasFiltradas.reduce((acc, v) => acc + (Number(v.total) || 0), 0);
  const qtdVendas = vendasFiltradas.length;
  const totalPix = vendasFiltradas.filter(v => (v.formaPagamento || '').toLowerCase() === 'pix').reduce((a, b) => a + Number(b.total || 0), 0);
  const totalDinheiro = vendasFiltradas.filter(v => (v.formaPagamento || '').toLowerCase() === 'dinheiro').reduce((a, b) => a + Number(b.total || 0), 0);
  const totalCartao = vendasFiltradas.filter(v => (v.formaPagamento || '').toLowerCase() === 'cartão' || (v.formaPagamento || '').toLowerCase() === 'cartao').reduce((a, b) => a + Number(b.total || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div className="card card-blue" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--blue-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={24} /> Histórico de Vendas & Compras Realizadas
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Consulte todas as compras finalizadas no PDV, reemita cupons fiscais e acompanhe seu faturamento.
          </p>
        </div>

        {/* Display Total Faturado */}
        <div style={{ background: 'var(--blue-light-bg)', border: '1.5px solid var(--blue-border)', padding: '10px 18px', borderRadius: '12px', textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--blue-primary)', textTransform: 'uppercase' }}>FATURAMENTO EXIBIDO</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#047857' }}>R$ {totalVendasPeriodo.toFixed(2)}</div>
        </div>
      </div>

      {/* KPI Cards de Estatísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--blue-primary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Total de Vendas</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--blue-primary)' }}>{qtdVendas} realizadas</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #047857' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Vendas em Dinheiro</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#047857' }}>R$ {totalDinheiro.toFixed(2)}</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--orange-primary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Vendas em PIX</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--orange-primary)' }}>R$ {totalPix.toFixed(2)}</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #6366f1' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>Vendas em Cartão</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6366f1' }}>R$ {totalCartao.toFixed(2)}</div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por cliente, Nº da venda ou forma de pagamento..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button className={`btn btn-sm ${filtroPagamento === 'todos' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltroPagamento('todos')}>Todos</button>
          <button className={`btn btn-sm ${filtroPagamento === 'dinheiro' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltroPagamento('dinheiro')}>Dinheiro</button>
          <button className={`btn btn-sm ${filtroPagamento === 'pix' ? 'btn-orange' : 'btn-secondary'}`} onClick={() => setFiltroPagamento('pix')}>PIX</button>
          <button className={`btn btn-sm ${filtroPagamento === 'cartão' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltroPagamento('cartão')}>Cartão</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="date"
            className="form-input"
            style={{ width: 'auto', padding: '6px 10px', fontSize: '0.85rem' }}
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
          />
          {filtroData && (
            <button className="btn btn-sm btn-secondary" onClick={() => setFiltroData('')}>Limpar Data</button>
          )}
        </div>
      </div>

      {/* Tabela de Vendas Realizadas */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Cód Venda</th>
              <th>Data</th>
              <th>Cliente / Comprador</th>
              <th>Itens Comprados</th>
              <th>Forma Pagto</th>
              <th>Total da Venda</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {vendasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Nenhuma venda realizada encontrada no histórico.
                </td>
              </tr>
            ) : (
              vendasFiltradas.map(v => (
                <tr key={v.id}>
                  <td><strong style={{ color: 'var(--blue-primary)' }}>{v.id}</strong></td>
                  <td>{safeFormatDate(v.data)}</td>
                  <td>
                    <strong>{v.clienteNome || 'Consumidor Balcão'}</strong>
                    {v.clienteTelefone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.clienteTelefone}</div>}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem' }}>
                      {v.itens && v.itens.map((it, idx) => (
                        <div key={idx} style={{ color: 'var(--text-muted)' }}>
                          • {it.qtd}x {it.nome} (R$ {Number(it.precoVenda || it.preco || 0).toFixed(2)})
                        </div>
                      ))}
                    </div>
                  </td>
                  <td><span className="badge badge-blue">{v.formaPagamento || 'Dinheiro'}</span></td>
                  <td style={{ fontWeight: 800, color: '#047857', fontSize: '1.05rem' }}>
                    R$ {Number(v.total).toFixed(2)}
                    {v.troco > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                        Troco: R$ {Number(v.troco).toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button className="btn btn-sm btn-primary" onClick={() => visualizarCupom(v)} title="Reemitir Cupom Fiscal">
                        <Printer size={14} /> Cupom
                      </button>
                      <button className="btn btn-sm btn-whatsapp" onClick={() => abrirWhatsapp(v.clienteTelefone || empresa.whatsapp, msgWhatsapp.recibo(v, empresa))} title="Enviar para WhatsApp">
                        <Send size={14} /> WA
                      </button>
                      {onDeleteVenda && (
                        <button className="btn btn-sm btn-secondary" onClick={() => onDeleteVenda(v.id)} title="Cancelar / Excluir Venda">
                          <Trash2 size={14} style={{ color: '#ef4444' }} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Reemissão do Cupom Fiscal */}
      <ModalCupomFiscal
        isOpen={cupomModalOpen}
        onClose={() => setCupomModalOpen(false)}
        venda={vendaSelecionada}
        empresa={empresa}
      />
    </div>
  );
}
