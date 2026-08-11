import React, { useState } from 'react';
import { Users, Plus, Phone, Mail, MapPin, Send, Trash2, Edit } from 'lucide-react';
import { abrirWhatsapp } from '../utils/whatsapp';

export default function Clientes({ clientes, empresa, onSaveClientes, onDeleteCliente }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [editId, setEditId] = useState(null);

  // Form State
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const abrirModalNovo = () => {
    setEditId(null);
    setNome('');
    setTelefone('');
    setWhatsapp('');
    setEmail('');
    setEndereco('');
    setObservacoes('');
    setModalOpen(true);
  };

  const abrirModalEditar = (cli) => {
    setEditId(cli.id);
    setNome(cli.nome);
    setTelefone(cli.telefone || '');
    setWhatsapp(cli.whatsapp || cli.telefone || '');
    setEmail(cli.email || '');
    setEndereco(cli.endereco || '');
    setObservacoes(cli.observacoes || '');
    setModalOpen(true);
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    if (!nome.trim()) return;

    if (editId) {
      const atualizados = clientes.map(c => {
        if (c.id === editId) {
          return { ...c, nome, telefone, whatsapp: whatsapp || telefone, email, endereco, observacoes };
        }
        return c;
      });
      onSaveClientes(atualizados);
    } else {
      const novoCliente = {
        id: 'cli_' + Date.now(),
        nome,
        telefone,
        whatsapp: whatsapp || telefone,
        email,
        endereco,
        observacoes
      };
      onSaveClientes([...clientes, novoCliente]);
    }

    setModalOpen(false);
  };

  const clientesFiltrados = clientes.filter(c => 
    c.nome.toLowerCase().includes(busca.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(busca.toLowerCase())) ||
    (c.telefone && c.telefone.includes(busca))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div className="card card-blue" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--blue-bright)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={24} /> Cadastro de Clientes
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Cadastro simplificado de clientes (sem necessidade de CPF).
          </p>
        </div>

        <button className="btn btn-orange" onClick={abrirModalNovo}>
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      {/* Busca de Clientes */}
      <div className="form-group" style={{ maxWidth: '400px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Buscar cliente por nome, telefone ou e-mail..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Grid de Clientes */}
      <div className="grid-cards">
        {clientesFiltrados.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Nenhum cliente cadastrado ou encontrado na pesquisa.
          </div>
        ) : (
          clientesFiltrados.map(cli => (
            <div key={cli.id} className="card card-blue">
              <div className="card-header">
                <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{cli.nome}</strong>
                <span className="badge badge-blue">Cliente</span>
              </div>

              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {cli.telefone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={14} style={{ color: 'var(--orange-bright)' }} /> {cli.telefone}
                  </div>
                )}
                {cli.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} style={{ color: 'var(--blue-bright)' }} /> {cli.email}
                  </div>
                )}
                {cli.endereco && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} /> {cli.endereco}
                  </div>
                )}
                {cli.observacoes && (
                  <div style={{ fontSize: '0.8rem', fontStyle: 'italic', marginTop: '4px', color: '#94a3b8' }}>
                    "{cli.observacoes}"
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <button
                  className="btn btn-sm btn-whatsapp"
                  style={{ flex: 1 }}
                  onClick={() => abrirWhatsapp(cli.whatsapp || cli.telefone, `Olá ${cli.nome}, tudo bem? Entro em contato através do ${empresa.nomeFantasia}.`)}
                >
                  <Send size={14} /> WhatsApp
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => abrirModalEditar(cli)} title="Editar">
                  <Edit size={14} />
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => onDeleteCliente(cli.id)} title="Excluir">
                  <Trash2 size={14} style={{ color: '#f87171' }} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Cadastro / Edição */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editId ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button className="btn-icon" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSalvar}>
              <div className="form-group">
                <label className="form-label">Nome Completo / Razão Social *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nome do cliente"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Telefone de Contato</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="(00) 00000-0000"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp para Envio</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="DDDNÚMERO"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="cliente@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Endereço Completo</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Rua, número, bairro, cidade"
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
                <button type="submit" className="btn btn-orange">Salvar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
