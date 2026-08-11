import React, { useState } from 'react';
import { Search, X, Users, Package, Calendar, DollarSign, FileText, Receipt, ArrowRight } from 'lucide-react';

export default function GlobalSearch({ 
  isOpen, 
  onClose, 
  clientes = [], 
  produtos = [], 
  agenda = [], 
  financeiro = [], 
  orcamentos = [], 
  recibos = [], 
  onNavigate 
}) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const queryLower = query.toLowerCase().trim();

  const safeArray = (arr) => Array.isArray(arr) ? arr : [];

  // Filtragem Global Segura
  const listClientes = safeArray(clientes);
  const listProdutos = safeArray(produtos);
  const listAgenda = safeArray(agenda);
  const listFinanceiro = safeArray(financeiro);
  const listOrcamentos = safeArray(orcamentos);
  const listRecibos = safeArray(recibos);

  const matchClientes = queryLower ? listClientes.filter(c => (c.nome && c.nome.toLowerCase().includes(queryLower)) || (c.telefone && c.telefone.includes(queryLower))) : [];
  const matchProdutos = queryLower ? listProdutos.filter(p => (p.nome && p.nome.toLowerCase().includes(queryLower)) || (p.codigo && p.codigo.toLowerCase().includes(queryLower))) : [];
  const matchAgenda = queryLower ? listAgenda.filter(a => (a.titulo && a.titulo.toLowerCase().includes(queryLower)) || (a.clienteNome && a.clienteNome.toLowerCase().includes(queryLower))) : [];
  const matchFinanceiro = queryLower ? listFinanceiro.filter(f => (f.descricao && f.descricao.toLowerCase().includes(queryLower)) || (f.clienteNome && f.clienteNome.toLowerCase().includes(queryLower))) : [];
  const matchOrcamentos = queryLower ? listOrcamentos.filter(o => (o.numero && o.numero.toLowerCase().includes(queryLower)) || (o.clienteNome && o.clienteNome.toLowerCase().includes(queryLower))) : [];
  const matchRecibos = queryLower ? listRecibos.filter(r => (r.numero && r.numero.toLowerCase().includes(queryLower)) || (r.clienteNome && r.clienteNome.toLowerCase().includes(queryLower))) : [];

  const totalResultados = matchClientes.length + matchProdutos.length + matchAgenda.length + matchFinanceiro.length + matchOrcamentos.length + matchRecibos.length;

  const handleSelect = (tab) => {
    onNavigate(tab);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 3500 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        <div className="modal-header" style={{ marginBottom: '12px' }}>
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={22} style={{ color: 'var(--orange-primary)' }} />
            <span>Pesquisa Global no Sistema</span>
          </div>
          <button className="action-btn-circle" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Digite para buscar cliente, produto, conta, compromisso, orçamento..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{ paddingLeft: '40px', fontSize: '1.05rem', borderColor: 'var(--orange-primary)' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--orange-primary)' }} />
        </div>

        {queryLower === '' ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
            <p>Digite qualquer termo para buscar instantaneamente em todo o sistema.</p>
          </div>
        ) : totalResultados === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
            <p>Nenhum resultado encontrado para "<strong>{query}</strong>".</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '450px', overflowY: 'auto' }}>
            {/* Clientes */}
            {matchClientes.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--blue-primary)', fontWeight: 800, fontSize: '0.85rem', marginBottom: '8px' }}>
                  <Users size={16} /> CLIENTES ({matchClientes.length})
                </div>
                {matchClientes.map(c => (
                  <div key={c.id} className="card" style={{ padding: '10px 14px', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <strong style={{ color: 'var(--text-main)' }}>{c.nome}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.telefone} • {c.email}</div>
                    </div>
                    <button className="btn btn-sm btn-secondary" onClick={() => handleSelect('clientes')}>
                      Ver <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Produtos (Foto Inteira Sem Cortes) */}
            {matchProdutos.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--orange-primary)', fontWeight: 800, fontSize: '0.85rem', marginBottom: '8px' }}>
                  <Package size={16} /> PRODUTOS & ESTOQUE ({matchProdutos.length})
                </div>
                {matchProdutos.map(p => (
                  <div key={p.id} className="card" style={{ padding: '10px 14px', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {p.foto && (
                        <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', overflow: 'hidden' }}>
                          <img src={p.foto} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </div>
                      )}
                      <div>
                        <strong style={{ color: 'var(--text-main)' }}>{p.nome} ({p.codigo})</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>R$ {Number(p.precoVenda || 0).toFixed(2)} | Estoque: {p.estoque} un</div>
                      </div>
                    </div>
                    <button className="btn btn-sm btn-secondary" onClick={() => handleSelect('produtos')}>
                      Ver <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Agenda */}
            {matchAgenda.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--orange-primary)', fontWeight: 800, fontSize: '0.85rem', marginBottom: '8px' }}>
                  <Calendar size={16} /> AGENDA & COMPROMISSOS ({matchAgenda.length})
                </div>
                {matchAgenda.map(a => (
                  <div key={a.id} className="card" style={{ padding: '10px 14px', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <strong style={{ color: 'var(--text-main)' }}>{a.titulo}</strong> ({a.clienteNome})
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📅 {a.data} às {a.horario}</div>
                    </div>
                    <button className="btn btn-sm btn-secondary" onClick={() => handleSelect('agenda')}>
                      Ver <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Financeiro */}
            {matchFinanceiro.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--blue-primary)', fontWeight: 800, fontSize: '0.85rem', marginBottom: '8px' }}>
                  <DollarSign size={16} /> FINANCEIRO ({matchFinanceiro.length})
                </div>
                {matchFinanceiro.map(f => (
                  <div key={f.id} className="card" style={{ padding: '10px 14px', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <strong style={{ color: 'var(--text-main)' }}>{f.descricao}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>R$ {Number(f.valor).toFixed(2)} • {f.status}</div>
                    </div>
                    <button className="btn btn-sm btn-secondary" onClick={() => handleSelect('financeiro')}>
                      Ver <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Orçamentos */}
            {matchOrcamentos.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--orange-primary)', fontWeight: 800, fontSize: '0.85rem', marginBottom: '8px' }}>
                  <FileText size={16} /> ORÇAMENTOS ({matchOrcamentos.length})
                </div>
                {matchOrcamentos.map(o => (
                  <div key={o.id} className="card" style={{ padding: '10px 14px', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <strong style={{ color: 'var(--text-main)' }}>{o.numero} - {o.clienteNome}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total: R$ {Number(o.total).toFixed(2)}</div>
                    </div>
                    <button className="btn btn-sm btn-secondary" onClick={() => handleSelect('orcamentos')}>
                      Ver <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Recibos */}
            {matchRecibos.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--blue-primary)', fontWeight: 800, fontSize: '0.85rem', marginBottom: '8px' }}>
                  <Receipt size={16} /> RECIBOS ({matchRecibos.length})
                </div>
                {matchRecibos.map(r => (
                  <div key={r.id} className="card" style={{ padding: '10px 14px', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <strong style={{ color: 'var(--text-main)' }}>{r.numero} - {r.clienteNome}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Valor: R$ {Number(r.valor).toFixed(2)}</div>
                    </div>
                    <button className="btn btn-sm btn-secondary" onClick={() => handleSelect('recibos')}>
                      Ver <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
