import React, { useState } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, CheckCircle, Search, DollarSign, CreditCard, QrCode, Receipt, RefreshCw, AlertTriangle, PlusCircle, Calculator, Coins, Tag, Printer, Percent, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import ModalCupomFiscal from './ModalCupomFiscal';

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

const getItemPrice = (item) => {
  if (!item) return 0;
  return parseVal(item.precoVenda ?? item.preco ?? item.valorUnitario ?? item.valor ?? 0);
};

export default function PDV({ produtos = [], clientes = [], empresa = {}, onFinalizarVendaPDV }) {
  const [carrinho, setCarrinho] = useState([]);
  const [busca, setBusca] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [clienteNomeManual, setClienteNomeManual] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('Dinheiro');
  const [valorPagoCliente, setValorPagoCliente] = useState('');
  const [desconto, setDesconto] = useState('');
  const [notificacaoSoma, setNotificacaoSoma] = useState(null);
  const [fotoZoom, setFotoZoom] = useState(null);

  // Modais
  const [cupomModalOpen, setCupomModalOpen] = useState(false);
  const [vendaEmitidaParaCupom, setVendaEmitidaParaCupom] = useState(null);

  // Form de Adição Manual de Item
  const [itemManualNome, setItemManualNome] = useState('');
  const [itemManualValor, setItemManualValor] = useState('');
  const [itemManualQtd, setItemManualQtd] = useState('1');

  const mostrarNotificacao = (msg) => {
    setNotificacaoSoma(msg);
    setTimeout(() => setNotificacaoSoma(null), 3000);
  };

  // Adicionar produto do catálogo ao carrinho
  const adicionarAoCarrinho = (produto) => {
    const preco = getItemPrice(produto);
    const prodId = produto.id || ('prod_' + Date.now());
    const prodNome = produto.nome || 'Produto sem nome';

    setCarrinho(prevCarrinho => {
      const index = prevCarrinho.findIndex(item => item.id === prodId);
      if (index >= 0) {
        const novo = [...prevCarrinho];
        const novaQtd = (parseInt(novo[index].qtd, 10) || 1) + 1;
        novo[index] = {
          ...novo[index],
          qtd: novaQtd,
          precoVenda: preco
        };
        mostrarNotificacao(`➕ Somado +1 "${prodNome}" ao pedido!`);
        return novo;
      } else {
        mostrarNotificacao(`➕ "${prodNome}" (R$ ${preco.toFixed(2)}) somado ao pedido!`);
        return [...prevCarrinho, { ...produto, id: prodId, nome: prodNome, precoVenda: preco, qtd: 1 }];
      }
    });
  };

  // Adicionar Item Manualmente
  const adicionarItemManual = (e) => {
    e.preventDefault();
    if (!itemManualNome.trim() || !itemManualValor) return;

    const preco = parseVal(itemManualValor);
    const qtd = parseInt(itemManualQtd, 10) || 1;
    const nome = itemManualNome.trim();

    const novoItem = {
      id: 'custom_' + Date.now(),
      nome: nome,
      precoVenda: preco,
      qtd: qtd,
      estoque: 999
    };

    setCarrinho(prev => [...prev, novoItem]);
    mostrarNotificacao(`➕ Item "${nome}" (R$ ${(preco * qtd).toFixed(2)}) somado à compra!`);

    setItemManualNome('');
    setItemManualValor('');
    setItemManualQtd('1');
  };

  const alterarQtd = (id, delta) => {
    setCarrinho(prevCarrinho => {
      return prevCarrinho.map(item => {
        if (item.id === id) {
          const novaQtd = (parseInt(item.qtd, 10) || 1) + delta;
          if (novaQtd <= 0) return null;
          return { ...item, qtd: novaQtd };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removerDoCarrinho = (id) => {
    setCarrinho(prev => prev.filter(item => item.id !== id));
  };

  // 1. SOMA BRUTA DOS ITENS
  const subtotalCarrinho = carrinho.reduce((acc, item) => {
    const precoUnitario = getItemPrice(item);
    const quantidade = parseInt(item.qtd, 10) || 1;
    return acc + (precoUnitario * quantidade);
  }, 0);

  // 2. CÁLCULO DE DESCONTO E TOTAL FINAL
  const descontoNum = parseVal(desconto);
  const totalComDesconto = Math.max(0, subtotalCarrinho - descontoNum);

  // 3. CÁLCULO DE TROCO E SALDO PENDENTE
  const valorPagoNum = parseVal(valorPagoCliente);
  const trocoCalculado = valorPagoNum > totalComDesconto ? (valorPagoNum - totalComDesconto).toFixed(2) : '0.00';
  const faltaPagar = valorPagoNum > 0 && valorPagoNum < totalComDesconto ? (totalComDesconto - valorPagoNum).toFixed(2) : '0.00';

  const concluirVenda = () => {
    if (carrinho.length === 0) {
      alert("⚠️ Adicione produtos ou digite o valor de um item para somar no pedido antes de concluir.");
      return;
    }

    let nomeClienteFinal = clienteNomeManual;
    let telClienteFinal = '';
    if (clienteSelecionado) {
      const cli = clientes.find(c => c.id === clienteSelecionado);
      if (cli) {
        nomeClienteFinal = cli.nome;
        telClienteFinal = cli.whatsapp || cli.telefone || '';
      }
    }

    if (!nomeClienteFinal) {
      nomeClienteFinal = 'CONSUMIDOR BALCÃO';
    }

    const novaVenda = {
      id: 'VD-' + String(Date.now()).slice(-6),
      data: new Date().toLocaleDateString('pt-BR'),
      itens: carrinho,
      subtotal: subtotalCarrinho,
      desconto: descontoNum,
      total: totalComDesconto,
      clienteNome: nomeClienteFinal,
      clienteTelefone: telClienteFinal,
      formaPagamento,
      valorPago: valorPagoNum,
      troco: parseFloat(trocoCalculado)
    };

    onFinalizarVendaPDV(novaVenda);

    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (e) {
      // Confetti
    }

    setVendaEmitidaParaCupom(novaVenda);
    setCupomModalOpen(true);

    setCarrinho([]);
    setClienteSelecionado('');
    setClienteNomeManual('');
    setValorPagoCliente('');
    setDesconto('');
  };

  const produtosFiltrados = produtos.filter(p =>
    (p.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
    (p.codigo || '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Banner de Confirmação de Soma */}
      {notificacaoSoma && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          background: 'var(--orange-gradient)',
          color: '#fff',
          padding: '14px 22px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(249, 115, 22, 0.4)',
          fontWeight: 800,
          fontSize: '1rem',
          zIndex: 2500,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'slideIn 0.3s ease'
        }}>
          <CheckCircle size={20} /> <span>{notificacaoSoma}</span>
        </div>
      )}

      {/* Top Banner com Soma Geral */}
      <div className="card card-blue" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--blue-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={24} /> <span>Ponto de Venda (PDV de Vendas)</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>Clique nos produtos ou digite os valores para somar a compra do cliente em tempo real.</span>
          </p>
        </div>

        {/* Display GIGANTE do Total Final */}
        <div style={{ background: 'var(--orange-gradient)', padding: '14px 28px', borderRadius: '14px', color: '#fff', textAlign: 'right', boxShadow: 'var(--shadow-orange-btn)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}><span>VALOR FINAL DA COMPRA</span></div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800 }}><span>R$ {totalComDesconto.toFixed(2)}</span></div>
        </div>
      </div>

      {/* Grid Principal */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Catálogo de Produtos com Fotos Inteiras */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card-header">
            <span className="card-title"><span>Catálogo de Produtos</span></span>
            <span className="badge badge-blue"><span>Clique para Somar ao Pedido</span></span>
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Buscar produto por nome ou código..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', maxHeight: '550px', overflowY: 'auto' }}>
            {produtosFiltrados.map(p => {
              const precoItem = getItemPrice(p);
              return (
                <div
                  key={p.id}
                  onClick={() => adicionarAoCarrinho(p)}
                  style={{
                    background: 'var(--blue-light-bg)',
                    border: '1.5px solid var(--blue-border)',
                    borderRadius: '12px',
                    padding: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between'
                  }}
                  className="pdv-item-card"
                >
                  {/* Container da foto sem corte (object-fit: contain) */}
                  <div
                    style={{ height: '95px', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', padding: '4px', position: 'relative' }}
                    onClick={(e) => {
                      if (p.foto) {
                        e.stopPropagation();
                        setFotoZoom({ foto: p.foto, nome: p.nome });
                      }
                    }}
                    title={p.foto ? "Clique para ampliar foto inteira" : ""}
                  >
                    {p.foto ? (
                      <img src={p.foto} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                        <ShoppingBag size={24} />
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-main)' }}>
                    <span>{p.nome}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}><span>Estoque: {p.estoque} un</span></div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--orange-primary)', marginTop: '4px' }}>
                    <span>R$ {precoItem.toFixed(2)}</span>
                  </div>

                  <button
                    className="btn btn-sm btn-orange"
                    onClick={(e) => {
                      e.stopPropagation();
                      adicionarAoCarrinho(p);
                    }}
                    style={{ width: '100%', marginTop: '6px', padding: '6px 8px', fontSize: '0.8rem', fontWeight: 800 }}
                  >
                    + Somar ao Pedido
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fita de Caixa Registradora & Soma da Compra */}
        <div className="card card-orange" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card-header">
            <span className="card-title" style={{ color: 'var(--orange-primary)' }}><span>Soma Geral dos Produtos Comprados</span></span>
            <span className="badge badge-orange"><span>{carrinho.reduce((a, b) => a + (parseInt(b.qtd, 10) || 1), 0)} itens somados</span></span>
          </div>

          {/* Form de Adição Manual de Valor / Serviço */}
          <form onSubmit={adicionarItemManual} style={{ background: 'var(--blue-light-bg)', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--blue-border)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--blue-primary)', marginBottom: '6px' }}>
              <span>➕ Digitar Produto / Valor Manualmente (Ex: PLANO DE CANAIS R$ 35,00)</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 40px', gap: '6px', alignItems: 'center' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: PLANO DE CANAIS ou LOCUÇÃO"
                value={itemManualNome}
                onChange={(e) => setItemManualNome(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '0.85rem' }}
              />
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="Preço R$"
                value={itemManualValor}
                onChange={(e) => setItemManualValor(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '0.85rem', fontWeight: 700 }}
              />
              <input
                type="number"
                min="1"
                className="form-input"
                placeholder="Qtd"
                value={itemManualQtd}
                onChange={(e) => setItemManualQtd(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-orange" style={{ padding: '6px 10px', width: '100%', justifyContent: 'center' }} title="Somar valor">
                <Plus size={16} />
              </button>
            </div>
          </form>

          {/* Seleção do Cliente */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label"><span>Cliente da Compra</span></label>
            <select
              className="form-select"
              value={clienteSelecionado}
              onChange={(e) => setClienteSelecionado(e.target.value)}
            >
              <option value="">-- Consumidor Balcão (Avulso) --</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          {!clienteSelecionado && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Nome do cliente (opcional)"
                value={clienteNomeManual}
                onChange={(e) => setClienteNomeManual(e.target.value)}
              />
            </div>
          )}

          {/* Lista de Itens no Carrinho com Soma Visível */}
          <div style={{ flex: 1, minHeight: '150px', maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {carrinho.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px 10px', background: '#fff', borderRadius: '8px', border: '1.5px dashed var(--orange-border)' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--orange-primary)' }}>🛒 Nenhum produto somado no pedido ainda.</span>
                <p style={{ fontSize: '0.82rem', marginTop: '6px' }}>
                  Clique no botão <strong>"+ Somar ao Pedido"</strong> dos produtos ou digite o valor manual acima.
                </p>
              </div>
            ) : (
              carrinho.map(item => {
                const precoUnit = getItemPrice(item);
                const qtd = parseInt(item.qtd, 10) || 1;
                const subtotalItem = precoUnit * qtd;
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1' }}>
                    <div style={{ flex: 1, paddingRight: '8px' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}><span>{item.nome}</span></div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>{qtd} x R$ {precoUnit.toFixed(2)} = </span>
                        <strong style={{ color: 'var(--orange-primary)' }}><span>R$ {subtotalItem.toFixed(2)}</span></strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button className="btn btn-sm btn-secondary" style={{ padding: '2px 8px' }} onClick={() => alterarQtd(item.id, -1)}>-</button>
                      <span style={{ fontWeight: 800, padding: '0 4px', fontSize: '0.95rem', color: 'var(--blue-primary)' }}>{qtd}</span>
                      <button className="btn btn-sm btn-secondary" style={{ padding: '2px 8px' }} onClick={() => alterarQtd(item.id, 1)}>+</button>
                      <button className="btn btn-sm btn-secondary" style={{ padding: '4px', marginLeft: '4px' }} onClick={() => removerDoCarrinho(item.id)}>
                        <Trash2 size={14} style={{ color: '#ef4444' }} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* PAINEL DE DESCONTO PARA O CLIENTE */}
          <div style={{ background: '#fff7ed', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #fed7aa' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ color: '#c2410c', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Tag size={14} /> <span>Desconto para o Cliente (R$)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={desconto}
                  onChange={(e) => setDesconto(e.target.value)}
                  style={{ fontWeight: 800, fontSize: '1.1rem', borderColor: '#f97316', color: '#c2410c', background: '#fff' }}
                />
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}><span>SUBTOTAL DOS ITENS</span></div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}><span>R$ {subtotalCarrinho.toFixed(2)}</span></div>
                {descontoNum > 0 && (
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#b91c1c' }}>
                    <span>- R$ {descontoNum.toFixed(2)} (Desconto)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label"><span>Forma de Pagamento</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {['Dinheiro', 'PIX', 'Cartão', 'Outro'].map(metodo => (
                <button
                  key={metodo}
                  type="button"
                  className={`btn btn-sm ${formaPagamento === metodo ? 'btn-orange' : 'btn-secondary'}`}
                  onClick={() => setFormaPagamento(metodo)}
                >
                  <span>{metodo}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CAMPO DE VALOR PAGO E CAMPO DIRETO DE TROCO */}
          <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '14px', border: '2px solid #10b981' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#047857', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Coins size={18} /> <span>CÁLCULO DE TROCO (SUPERMERCADO)</span>
            </div>

            {/* Atalhos Rápidos */}
            {totalComDesconto > 0 && (
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-sm btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 8px' }} onClick={() => setValorPagoCliente(String(totalComDesconto.toFixed(2)))}>
                  Exato (R$ {totalComDesconto.toFixed(2)})
                </button>
                <button type="button" className="btn btn-sm btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 8px' }} onClick={() => setValorPagoCliente(String((Math.ceil(totalComDesconto / 10) * 10).toFixed(2)))}>
                  R$ {(Math.ceil(totalComDesconto / 10) * 10).toFixed(2)}
                </button>
                <button type="button" className="btn btn-sm btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 8px' }} onClick={() => setValorPagoCliente(String((Math.ceil(totalComDesconto / 50) * 50 || (totalComDesconto + 50)).toFixed(2)))}>
                  R$ {(Math.ceil(totalComDesconto / 50) * 50 || (totalComDesconto + 50)).toFixed(2)}
                </button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center' }}>
              {/* CAMPO 1: VALOR ENTREGUE */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ color: '#047857', fontWeight: 800 }}><span>Valor Entregue (R$)</span></label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={valorPagoCliente}
                  onChange={(e) => setValorPagoCliente(e.target.value)}
                  style={{ fontWeight: 800, fontSize: '1.2rem', borderColor: '#10b981', color: '#0f172a', background: '#fff' }}
                />
              </div>

              {/* CAMPO 2: TROCO A DEVOLVER */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ color: valorPagoNum < totalComDesconto && valorPagoNum > 0 ? '#b91c1c' : '#047857', fontWeight: 800 }}>
                  <span>{valorPagoNum < totalComDesconto && valorPagoNum > 0 ? 'Falta Pagar (R$)' : 'Troco a Devolver (R$)'}</span>
                </label>
                <input
                  type="text"
                  readOnly
                  className="form-input"
                  value={`R$ ${valorPagoNum < totalComDesconto && valorPagoNum > 0 ? faltaPagar : trocoCalculado}`}
                  style={{
                    fontWeight: 800,
                    fontSize: '1.3rem',
                    borderColor: valorPagoNum < totalComDesconto && valorPagoNum > 0 ? '#ef4444' : '#10b981',
                    color: valorPagoNum < totalComDesconto && valorPagoNum > 0 ? '#b91c1c' : '#047857',
                    background: '#ffffff',
                    textAlign: 'center'
                  }}
                />
              </div>
            </div>
          </div>

          {/* SOMA GERAL FINAL DOS PRODUTOS & BOTÃO DE CONCLUSÃO DE CAIXA */}
          <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', background: 'var(--blue-light-bg)', padding: '14px 18px', borderRadius: '12px', border: '2px solid var(--blue-border)' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--blue-primary)', textTransform: 'uppercase' }}><span>VALOR FINAL DA COMPRA</span></div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}><span>{carrinho.reduce((a, b) => a + (parseInt(b.qtd, 10) || 1), 0)} itens somados</span></div>
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--orange-primary)' }}>
                <span>R$ {totalComDesconto.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="btn btn-orange"
              style={{ width: '100%', padding: '16px', fontSize: '1.1rem', fontWeight: 800, gap: '8px' }}
              disabled={carrinho.length === 0}
              onClick={concluirVenda}
            >
              <Printer size={22} /> <span>Concluir Venda & Emitir Cupom Fiscal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Cupom Fiscal Impresso de Supermercado */}
      <ModalCupomFiscal
        isOpen={cupomModalOpen}
        onClose={() => setCupomModalOpen(false)}
        venda={vendaEmitidaParaCupom}
        empresa={empresa}
      />

      {/* Modal Zoom da Foto Inteira em Tamanho Grande */}
      {fotoZoom && (
        <div className="modal-overlay" onClick={() => setFotoZoom(null)} style={{ zIndex: 3500 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', padding: '20px', textAlign: 'center' }}>
            <div className="modal-header" style={{ marginBottom: '12px' }}>
              <h3 className="modal-title">{fotoZoom.nome}</h3>
              <button className="action-btn-circle" onClick={() => setFotoZoom(null)}>✕</button>
            </div>
            <div style={{ background: '#0f172a', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', maxHeight: '75vh', overflow: 'hidden' }}>
              <img src={fotoZoom.foto} alt="" style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
