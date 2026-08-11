import React from 'react';
import { 
  DollarSign, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calendar, 
  AlertTriangle, 
  Users, 
  Package, 
  FileText, 
  Receipt, 
  Clock, 
  Plus,
  Send,
  History,
  CheckCircle
} from 'lucide-react';
import { safeFormatDate } from '../utils/storage';

export default function Dashboard({ agenda = [], financeiro = [], produtos = [], clientes = [], empresa = {}, setAbaAtiva, onNavigate }) {
  const handleNav = (aba) => {
    if (onNavigate) onNavigate(aba);
    else if (setAbaAtiva) setAbaAtiva(aba);
  };

  // Cálculos Financeiros
  const totalReceitas = financeiro
    .filter(f => f.tipo === 'receita' && f.status === 'pago')
    .reduce((acc, f) => acc + (Number(f.valor) || 0), 0);

  const totalDespesas = financeiro
    .filter(f => f.tipo === 'despesa')
    .reduce((acc, f) => acc + (Number(f.valor) || 0), 0);

  const saldoAtual = totalReceitas - totalDespesas;

  const contasVencidas = financeiro.filter(f => f.status === 'vencido');
  const compromissosHoje = agenda.filter(a => a.data === new Date().toISOString().split('T')[0]);
  const compromissosPendentes = agenda.filter(a => !a.concluido);
  const produtosBaixoEstoque = produtos.filter(p => Number(p.estoque) <= Number(p.estoqueMinimo));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner de Boas-Vindas */}
      <div className="card card-blue" style={{ background: 'var(--blue-gradient)', color: '#ffffff', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '4px' }}>
              Olá, {empresa.nomeFantasia || 'Empresário(a)'}! 👋
            </h1>
            <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>
              Bem-vindo ao seu Escritório de Bolso. Aqui está o resumo atual do seu negócio.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-orange" onClick={() => handleNav('agenda')}>
              <Calendar size={18} /> Ver Agenda ({compromissosPendentes.length} pendentes)
            </button>
            <button className="btn btn-secondary" onClick={() => handleNav('recibos')}>
              <Receipt size={18} /> Novo Recibo
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Métricas Financeiras Principais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* Card Saldo Actual */}
        <div className="card" style={{ borderLeft: '5px solid var(--blue-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Saldo em Caixa</span>
            <div style={{ background: 'var(--blue-light-bg)', padding: '8px', borderRadius: '50%', color: 'var(--blue-primary)' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: saldoAtual >= 0 ? 'var(--blue-primary)' : 'var(--danger)' }}>
            R$ {saldoAtual.toFixed(2)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Receitas pagas minus despesas</span>
        </div>

        {/* Card Receitas Total */}
        <div className="card" style={{ borderLeft: '5px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Total de Receitas</span>
            <div style={{ background: 'var(--success-bg)', padding: '8px', borderRadius: '50%', color: 'var(--success)' }}>
              <ArrowUpCircle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#047857' }}>
            R$ {totalReceitas.toFixed(2)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Entradas e vendas efetuadas</span>
        </div>

        {/* Card Despesas Total */}
        <div className="card" style={{ borderLeft: '5px solid var(--orange-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Contas a Pagar</span>
            <div style={{ background: 'var(--orange-light-bg)', padding: '8px', borderRadius: '50%', color: 'var(--orange-primary)' }}>
              <ArrowDownCircle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--orange-secondary)' }}>
            R$ {totalDespesas.toFixed(2)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Saídas e despesas registradas</span>
        </div>

        {/* Card Clientes Cadastrados */}
        <div className="card" style={{ borderLeft: '5px solid #6366f1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Clientes na Base</span>
            <div style={{ background: '#e0e7ff', padding: '8px', borderRadius: '50%', color: '#4338ca' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4338ca' }}>
            {clientes.length} clientes
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cadastrados no escritório</span>
        </div>
      </div>

      {/* Grid de Seções Centrais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Compromissos de Hoje */}
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} /> Compromissos de Hoje
            </span>
            <button className="btn btn-sm btn-secondary" onClick={() => handleNav('agenda')}>Ver Todos</button>
          </div>

          {compromissosHoje.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>
              Nenhum compromisso agendado para hoje.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {compromissosHoje.map(ag => (
                <div key={ag.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--blue-light-bg)', padding: '10px 14px', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{ag.titulo}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>👤 {ag.clienteNome}</div>
                  </div>
                  <span className={`badge ${ag.concluido ? 'badge-success' : 'badge-orange'}`}>
                    {ag.concluido ? 'Concluído ✅' : ag.horario}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Central de Alertas Rápidos do Sistema (Com Compromissos Pendentes) */}
        <div className="card card-orange">
          <div className="card-header">
            <span className="card-title" style={{ color: 'var(--orange-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} /> Central de Alertas ({contasVencidas.length + compromissosPendentes.length + produtosBaixoEstoque.length})
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* ALERTA DE COMPROMISSOS PENDENTES NA AGENDA */}
            <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--orange-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--orange-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} /> <span>Compromissos Pendentes ({compromissosPendentes.length})</span>
                </div>
                <button className="btn btn-sm btn-orange" style={{ padding: '2px 8px', fontSize: '0.72rem' }} onClick={() => handleNav('agenda')}>
                  Abrir Agenda
                </button>
              </div>

              {compromissosPendentes.length === 0 ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nenhum compromisso pendente.</span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                  {compromissosPendentes.map(a => (
                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--orange-light-bg)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.82rem' }}>
                      <div>
                        <strong>{a.titulo}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🗓 {safeFormatDate(a.data)} às {a.horario} - {a.clienteNome}</div>
                      </div>
                      {a.valor > 0 && (
                        <span style={{ fontWeight: 800, color: '#047857', fontSize: '0.78rem' }}>
                          R$ {Number(a.valor).toFixed(2)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contas Vencidas */}
            <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border-color)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#b91c1c', marginBottom: '4px' }}>
                🔥 Contas Vencidas ({contasVencidas.length})
              </div>
              {contasVencidas.length === 0 ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nenhuma conta em atraso.</span>
              ) : (
                <div style={{ fontSize: '0.8rem' }}>
                  {contasVencidas.map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span>{c.descricao}</span>
                      <strong style={{ color: '#b91c1c' }}>R$ {Number(c.valor).toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Produtos em Baixo Estoque */}
            <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--blue-border)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--blue-primary)', marginBottom: '4px' }}>
                📦 Produtos com Baixo Estoque ({produtosBaixoEstoque.length})
              </div>
              {produtosBaixoEstoque.length === 0 ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estoque regularizado.</span>
              ) : (
                <div style={{ fontSize: '0.8rem' }}>
                  {produtosBaixoEstoque.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span>{p.nome}</span>
                      <strong style={{ color: 'var(--orange-primary)' }}>{p.estoque} un restante</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Ação Rápida */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card" onClick={() => handleNav('orcamentos')} style={{ cursor: 'pointer', textAlign: 'center', padding: '20px' }}>
          <FileText size={32} style={{ color: 'var(--orange-primary)', marginBottom: '8px' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Gerar Orçamento</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Criar e enviar via WhatsApp</p>
        </div>

        <div className="card" onClick={() => handleNav('recibos')} style={{ cursor: 'pointer', textAlign: 'center', padding: '20px' }}>
          <Receipt size={32} style={{ color: 'var(--blue-primary)', marginBottom: '8px' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Emitir Recibo</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Com logo e valor por extenso</p>
        </div>

        <div className="card" onClick={() => handleNav('clientes')} style={{ cursor: 'pointer', textAlign: 'center', padding: '20px' }}>
          <Users size={32} style={{ color: 'var(--success)', marginBottom: '8px' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Cadastrar Cliente</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Prático e sem obrigatoriedade de CPF</p>
        </div>

        <div className="card" onClick={() => handleNav('agenda')} style={{ cursor: 'pointer', textAlign: 'center', padding: '20px' }}>
          <Calendar size={32} style={{ color: '#a855f7', marginBottom: '8px' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Agenda & Compromissos</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Com receita automática ao concluir</p>
        </div>
      </div>
    </div>
  );
}
