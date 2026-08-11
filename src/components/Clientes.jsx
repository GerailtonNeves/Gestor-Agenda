import React, { useState } from 'react';
import { Users, Plus, Phone, MapPin, Send, Trash2, Edit, Building2, Globe } from 'lucide-react';
import { abrirWhatsapp } from '../utils/whatsapp';

export default function Clientes({ clientes = [], empresa = {}, onSaveClientes, onDeleteCliente }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [editId, setEditId] = useState(null);

  // Form State
  const [nome, setNome] = useState('');
  const [estabelecimento, setEstabelecimento] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cidadeUf, setCidadeUf] = useState('');
  const [endereco, setEndereco] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const abrirModalNovo = () => {
    setEditId(null);
    setNome('');
    setEstabelecimento('');
    setWhatsapp('');
    setCidadeUf('');
    setEndereco('');
    setObservacoes('');
    setModalOpen(true);
  };

  const abrirModalEditar = (cli) => {
    setEditId(cli.id);
    setNome(cli.nome || '');
    setEstabelecimento(cli.estabelecimento || '');
    setWhatsapp(cli.whatsapp || cli.telefone || '');
    setCidadeUf(cli.cidadeUf || '');
    setEndereco(cli.endereco || '');
    setObservacoes(cli.observacoes || '');
    setModalOpen(true);
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const clienteData = {
      nome: nome.trim(),
      estabelecimento: estabelecimento.trim(),
      whatsapp: whatsapp.trim(),
      cidadeUf: cidadeUf.trim(),
      endereco: endereco.trim(),
      observacoes: observacoes.trim()
    };

    if (editId) {
      const atualizados = clientes.map(c => c.id === editId ? { ...c, ...clienteData } : c);
      onSaveClientes(atualizados);
    } else {
      const novoCliente = {
        id: 'cli_' + Date.now(),
        ...clienteData
      };
      onSaveClientes([...clientes, novoCliente]);
    }

    setModalOpen(false);
  };

  const clientesFiltrados = clientes.filter(c => 
    (c.nome && c.nome.toLowerCase().includes(busca.toLowerCase())) || 
    (c.estabelecimento && c.estabelecimento.toLowerCase().includes(busca.toLowerCase())) ||
    (c.cidadeUf && c.cidadeUf.toLowerCase().includes(busca.toLowerCase())) ||
    (c.whatsapp && c.whatsapp.includes(busca))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div className="card card-blue" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--blue-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={24} /> Cadastro de Clientes
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Cadastre seus clientes com <strong>Nome, Estabelecimento, WhatsApp e Cidade-Estado</strong>.
          </p>
        </div>

        <button className="btn btn-orange" onClick={abrirModalNovo}>
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      {/* Busca de Clientes */}
      <div className="form-group" style={{ maxWidth: '450px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Buscar cliente por nome, estabelecimento, whatsapp ou cidade-estado..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Grid de Clientes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {clientesFiltrados.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Users size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p>Nenhum cliente cadastrado ou encontrado na pesquisa.</p>
          </div>
        ) : (
          clientesFiltrados.map(cli => (
            <div key={cli.id} className="card card-blue" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{cli.nome}</strong>
                  <span className="badge badge-blue">Cliente</span>
                </div>

                <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  {cli.estabelecimento && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--blue-primary)' }}>
                      <Building2 size={16} /> {cli.estabelecimento}
                    </div>
                  )}

                  {cli.whatsapp && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={15} style={{ color: '#16a34a' }} /> <strong>WhatsApp:</strong> {cli.whatsapp}
                    </div>
                  )}

                  {cli.cidadeUf && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Globe size={15} style={{ color: 'var(--orange-primary)' }} /> <strong>Cidade - Estado:</strong> {cli.cidadeUf}
                    </div>
                  )}

                  {cli.endereco && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={15} /> <strong>Endereço:</strong> {cli.endereco}
                    </div>
                  )}

                  {cli.observacoes && (
                    <div style={{ fontSize: '0.8rem', fontStyle: 'italic', marginTop: '4px', color: 'var(--text-muted)' }}>
                      "{cli.observacoes}"
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <button
                  className="btn btn-sm btn-whatsapp"
                  style={{ flex: 1 }}
                  onClick={() => abrirWhatsapp(cli.whatsapp, `Olá ${cli.nome}, tudo bem? Entro em contato através da ${empresa.razaoSocial || empresa.nomeFantasia || 'nossa empresa'}.`)}
                >
                  <Send size={14} /> WhatsApp
                </button>

                <button className="btn btn-sm btn-primary" onClick={() => abrirModalEditar(cli)} title="Editar Cliente">
                  <Edit size={14} />
                </button>

                <button className="btn btn-sm btn-secondary" onClick={() => onDeleteCliente(cli.id)} title="Excluir Cliente">
                  <Trash2 size={14} style={{ color: '#ef4444' }} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Cadastro / Edição */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editId ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button className="action-btn-circle" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSalvar}>
              <div className="form-group">
                <label className="form-label">Nome Completo do Cliente *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: João da Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nome do Estabelecimento / Empresa</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Mercearia do João ou Studio Hair"
                  value={estabelecimento}
                  onChange={(e) => setEstabelecimento(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">WhatsApp do Cliente *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="(00) 00000-0000"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cidade - Estado</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: São Paulo - SP"
                    value={cidadeUf}
                    onChange={(e) => setCidadeUf(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Endereço Completo</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Rua, número, bairro..."
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Observações</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Anotações internas sobre o cliente..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-orange">{editId ? 'Salvar Alterações' : 'Cadastrar Cliente'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
