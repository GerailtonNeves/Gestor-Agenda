import React, { useState } from 'react';
import { Package, Plus, Search, Edit, Trash2, AlertTriangle, Upload, Eye, Image as ImageIcon, X } from 'lucide-react';
import { safeFormatDate } from '../utils/storage';

export default function Produtos({ produtos = [], onSaveProdutos, onDeleteProduto }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [busca, setBusca] = useState('');
  const [fotoZoom, setFotoZoom] = useState(null);

  // Form State
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('Geral');
  const [precoCusto, setPrecoCusto] = useState('');
  const [precoVenda, setPrecoVenda] = useState('');
  const [estoque, setEstoque] = useState('');
  const [estoqueMinimo, setEstoqueMinimo] = useState('5');
  const [foto, setFoto] = useState('');

  const abrirModalNovo = () => {
    setEditId(null);
    setCodigo('P' + String(produtos.length + 1).padStart(3, '0'));
    setNome('');
    setCategoria('Geral');
    setPrecoCusto('');
    setPrecoVenda('');
    setEstoque('');
    setEstoqueMinimo('5');
    setFoto('');
    setModalOpen(true);
  };

  const abrirModalEditar = (prod) => {
    setEditId(prod.id);
    setCodigo(prod.codigo || '');
    setNome(prod.nome || '');
    setCategoria(prod.categoria || 'Geral');
    setPrecoCusto(String(prod.precoCusto || ''));
    setPrecoVenda(String(prod.precoVenda || ''));
    setEstoque(String(prod.estoque || ''));
    setEstoqueMinimo(String(prod.estoqueMinimo || '5'));
    setFoto(prod.foto || '');
    setModalOpen(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    if (!nome.trim() || !precoVenda) return;

    const prodData = {
      codigo,
      nome,
      categoria,
      precoCusto: parseFloat(precoCusto) || 0,
      precoVenda: parseFloat(precoVenda) || 0,
      estoque: parseInt(estoque, 10) || 0,
      estoqueMinimo: parseInt(estoqueMinimo, 10) || 0,
      foto
    };

    if (editId) {
      const atualizados = produtos.map(p => p.id === editId ? { ...p, ...prodData } : p);
      onSaveProdutos(atualizados);
    } else {
      const novoProd = {
        id: 'prod_' + Date.now(),
        ...prodData
      };
      onSaveProdutos([...produtos, novoProd]);
    }

    setModalOpen(false);
  };

  const produtosFiltrados = produtos.filter(p =>
    (p.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
    (p.codigo || '').toLowerCase().includes(busca.toLowerCase()) ||
    (p.categoria || '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="card card-blue" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--blue-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package size={24} /> Gestão de Produtos & Estoque
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Cadastre produtos com fotos completas sem cortes, controle o estoque e configure alertas.
          </p>
        </div>

        <button className="btn btn-orange" onClick={abrirModalNovo}>
          <Plus size={18} /> Cadastrar Novo Produto
        </button>
      </div>

      {/* Barra de Pesquisa */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Pesquisar produto por nome, código ou categoria..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ paddingLeft: '38px' }}
        />
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
      </div>

      {/* Grid de Produtos com Fotos Inteiras */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {produtosFiltrados.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Package size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p>Nenhum produto cadastrado no sistema.</p>
          </div>
        ) : (
          produtosFiltrados.map(prod => {
            const baixoEstoque = Number(prod.estoque) <= Number(prod.estoqueMinimo);
            return (
              <div key={prod.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '14px' }}>
                <div>
                  {/* Container da Foto sem cortes (object-fit: contain) */}
                  <div
                    onClick={() => prod.foto && setFotoZoom({ foto: prod.foto, nome: prod.nome })}
                    style={{
                      height: '160px',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      border: '1px solid #e2e8f0',
                      cursor: prod.foto ? 'pointer' : 'default',
                      position: 'relative'
                    }}
                    title={prod.foto ? "Clique para ver a foto inteira em tamanho grande" : ""}
                  >
                    {prod.foto ? (
                      <>
                        <img
                          src={prod.foto}
                          alt={prod.nome}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            padding: '4px'
                          }}
                        />
                        <div style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '3px 6px', borderRadius: '6px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Eye size={12} /> Ver foto
                        </div>
                      </>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)', gap: '4px' }}>
                        <ImageIcon size={32} style={{ opacity: 0.4 }} />
                        <span style={{ fontSize: '0.75rem' }}>Sem Foto</span>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--blue-primary)', textTransform: 'uppercase' }}>
                    {prod.codigo} • {prod.categoria}
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px', marginBottom: '8px' }}>
                    {prod.nome}
                  </h3>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Preço de Venda</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--orange-primary)' }}>
                        R$ {Number(prod.precoVenda).toFixed(2)}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Estoque</div>
                      <span className={`badge ${baixoEstoque ? 'badge-orange' : 'badge-blue'}`}>
                        {prod.estoque} un {baixoEstoque && '⚠️'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                  <button className="btn btn-sm btn-primary" style={{ flex: 1 }} onClick={() => abrirModalEditar(prod)}>
                    <Edit size={14} /> Editar
                  </button>
                  <button className="btn btn-sm btn-secondary" onClick={() => onDeleteProduto(prod.id)}>
                    <Trash2 size={14} style={{ color: '#ef4444' }} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Criar / Editar Produto */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editId ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button className="action-btn-circle" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSalvar}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Código *</label>
                  <input type="text" className="form-input" value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Nome do Produto *</label>
                  <input type="text" className="form-input" placeholder="Ex: Caderno Executivo" value={nome} onChange={(e) => setNome(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Categoria</label>
                  <select className="form-select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                    <option value="Geral">Geral</option>
                    <option value="Serviços">Serviços</option>
                    <option value="Produtos">Produtos</option>
                    <option value="Papelaria">Papelaria</option>
                    <option value="Equipamentos">Equipamentos</option>
                    <option value="Serviços Digital">Serviços Digital</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Preço de Venda (R$) *</label>
                  <input type="number" step="0.01" className="form-input" placeholder="0.00" value={precoVenda} onChange={(e) => setPrecoVenda(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Preço Custo (R$)</label>
                  <input type="number" step="0.01" className="form-input" placeholder="0.00" value={precoCusto} onChange={(e) => setPrecoCusto(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Qtd Estoque</label>
                  <input type="number" className="form-input" placeholder="0" value={estoque} onChange={(e) => setEstoque(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Estoque Mínimo</label>
                  <input type="number" className="form-input" placeholder="5" value={estoqueMinimo} onChange={(e) => setEstoqueMinimo(e.target.value)} />
                </div>
              </div>

              {/* Upload de Foto do Produto */}
              <div className="form-group">
                <label className="form-label">Foto do Produto (Arquivo ou Link da Imagem)</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="form-input" style={{ padding: '6px' }} />
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ou cole a URL da foto (https://...)"
                  value={foto}
                  onChange={(e) => setFoto(e.target.value)}
                />
              </div>

              {/* Preview da Foto sem cortes */}
              {foto && (
                <div style={{ height: '140px', background: '#f8fafc', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #cbd5e1', marginBottom: '12px', padding: '6px' }}>
                  <img src={foto} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-orange">{editId ? 'Salvar Alterações' : 'Cadastrar Produto'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
