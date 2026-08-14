import React, { useState } from 'react';
import { DollarSign, Plus, ArrowUpCircle, ArrowDownCircle, CheckCircle, Trash2, Edit, Receipt, Send, Eye, Sparkles, Repeat, Calendar, ShieldCheck } from 'lucide-react';
import { safeFormatDate, formatMoney } from '../utils/storage';
import { numeroParaExtenso } from './Recibos';
import ModalDocumento from './ModalDocumento';
import { abrirWhatsapp, msgWhatsapp } from '../utils/whatsapp';

export default function Financeiro({ 
  financeiro = [], 
  recibos = [], 
  clientes = [], 
  empresa = {}, 
  onSaveFinanceiro, 
  onSaveRecibos, 
  onDeleteFinanceiro,
  esconderValores = false
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const anoAtualStr = String(new Date().getFullYear());
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos', 'receita', 'despesa', 'vencidos', 'mensais'
  const [filtroMes, setFiltroMes] = useState('todos'); // 'todos', '01'..'12'
  const [filtroAno, setFiltroAno] = useState(anoAtualStr); // 'todos', '2025', '2026', '2027'...
  
  // Modal de Recibo Gerado na Baixa
  const [docVisualizar, setDocVisualizar] = useState(null);
  const [reciboAlertPopup, setReciboAlertPopup] = useState(null);

  // Form State
  const [tipo, setTipo] = useState('despesa'); // 'receita' ou 'despesa'
  const [descricao, setDescricao] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [valor, setValor] = useState('');
  const [dataVencimento, setDataVencimento] = useState(new Date().toISOString().split('T')[0]);
  const [categoria, setCategoria] = useState('Geral');
  const [status, setStatus] = useState('pendente');
  
  // Recorrência Mensal Simples (1 Única Opção)
  const [isMensal, setIsMensal] = useState(false);

  const abrirModalNovo = () => {
    setEditId(null);
    setTipo('despesa');
    setDescricao('');
    setClienteNome('');
    setValor('');
    setDataVencimento(new Date().toISOString().split('T')[0]);
    setCategoria('Geral');
    setStatus('pendente');
    setIsMensal(false);
    setModalOpen(true);
  };

  const abrirModalEditar = (item) => {
    setEditId(item.id);
    setTipo(item.tipo || 'despesa');
    setDescricao(item.descricao || '');
    setClienteNome(item.clienteNome || '');
    setValor(String(item.valor || ''));
    setDataVencimento(item.dataVencimento || new Date().toISOString().split('T')[0]);
    setCategoria(item.categoria || 'Geral');
    setStatus(item.status || 'pendente');
    setIsMensal(Boolean(item.isMensal));
    setModalOpen(true);
  };

  // Função para calcular a data exata do mês seguinte (mantendo o mesmo dia do mês)
  const calculateFutureDate = (baseDateStr, monthOffset = 1) => {
    if (!baseDateStr) return new Date().toISOString().split('T')[0];
    try {
      const parts = baseDateStr.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1; // 0-indexado
      const d = parseInt(parts[2], 10);

      const targetDate = new Date(y, m + monthOffset, d);
      if (targetDate.getDate() !== d) {
        targetDate.setDate(0);
      }

      const yyyy = targetDate.getFullYear();
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dd = String(targetDate.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    } catch (e) {
      return baseDateStr;
    }
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    if (!descricao.trim() || !valor) return;

    const valorNum = parseFloat(valor);

    if (editId) {
      // Edição de um lançamento existente
      const atualizados = financeiro.map(f => {
        if (f.id === editId) {
          return {
            ...f,
            tipo,
            descricao,
            clienteNome: clienteNome || 'Não informado',
            valor: valorNum,
            dataVencimento,
            categoria,
            status,
            isMensal
          };
        }
        return f;
      });
      onSaveFinanceiro(atualizados);
    } else {
      // Criação de 1 ÚNICO lançamento simples (se for mensal, renova mês a mês ao dar baixa)
      const novoLancamento = {
        id: 'fin_' + Date.now(),
        tipo,
        descricao: descricao.trim(),
        clienteNome: clienteNome || 'Não informado',
        valor: valorNum,
        dataVencimento,
        categoria,
        status,
        isMensal
      };
      onSaveFinanceiro([novoLancamento, ...financeiro]);
    }

    setModalOpen(false);
  };

  // DAR BAIXA AUTOMÁTICA E CRIAR RECIBO PROFISSIONAL NO SISTEMA
  const toggleStatusPago = (itemTarget) => {
    const novoStatus = itemTarget.status === 'pago' ? 'pendente' : 'pago';
    
    let atualizado = financeiro.map(item => {
      if (item.id === itemTarget.id) {
        return { ...item, status: novoStatus };
      }
      return item;
    });

    // Se a conta for MENSAL RECORRENTE (isMensal) e acabou de ser PAGA:
    // Gera a conta do MÊS SEGUINTE automaticamente para aparecer no mês seguinte!
    if (novoStatus === 'pago' && itemTarget.isMensal) {
      const proximaData = calculateFutureDate(itemTarget.dataVencimento, 1);
      
      const jaExisteProximo = financeiro.some(f => 
        f.descricao === itemTarget.descricao && 
        f.dataVencimento === proximaData
      );

      if (!jaExisteProximo) {
        const proximoLancamento = {
          id: 'fin_rec_' + Date.now(),
          tipo: itemTarget.tipo,
          descricao: itemTarget.descricao,
          clienteNome: itemTarget.clienteNome,
          valor: itemTarget.valor,
          dataVencimento: proximaData,
          categoria: itemTarget.categoria,
          status: 'pendente',
          isMensal: true
        };
        atualizado = [proximoLancamento, ...atualizado];
      }
    }

    onSaveFinanceiro(atualizado);

    // Se a ação for "DAR BAIXA" (Marcar como Pago/Recebido):
    if (novoStatus === 'pago') {
      const valorNum = parseFloat(itemTarget.valor || 0);

      let idCliente = '';
      let telCliente = '';

      let nomeEmpresaCliente = '';

      if (clientes && clientes.length > 0) {
        const cliFound = clientes.find(c => 
          (itemTarget.clienteId && String(c.id) === String(itemTarget.clienteId)) ||
          (c.nome && c.nome.toLowerCase() === (itemTarget.clienteNome || '').toLowerCase()) ||
          (c.estabelecimento && c.estabelecimento.toLowerCase() === (itemTarget.clienteNome || '').toLowerCase()) ||
          (c.empresa && c.empresa.toLowerCase() === (itemTarget.clienteNome || '').toLowerCase())
        );

        if (cliFound) {
          idCliente = cliFound.id;
          telCliente = cliFound.whatsapp || cliFound.telefone || '';
          nomeEmpresaCliente = (cliFound.estabelecimento || cliFound.empresa || cliFound.nomeEmpresa || cliFound.razaoSocial || '').trim();
        }
      }

      // Prepara o texto oficial de quitação referente ao serviço no formato exato solicitado
      const referenteATexto = nomeEmpresaCliente 
        ? `Quitação: Serviço Concluído: Locução Comercial PARA EMPRESA ${nomeEmpresaCliente.toUpperCase()}`
        : `Quitação: Serviço Concluído: Locução Comercial`;

      // Cria o Recibo Oficial no Banco de Recibos
      const novoRecibo = {
        id: 'rec_fin_' + Date.now(),
        financeiroRefId: itemTarget.id,
        numero: 'REC-2026-' + String(recibos.length + 1).padStart(3, '0'),
        dataEmissao: new Date().toISOString().split('T')[0],
        clienteId: idCliente,
        clienteNome: itemTarget.clienteNome || 'Cliente',
        clienteTelefone: telCliente,
        valor: valorNum,
        valorExtenso: numeroParaExtenso(valorNum),
        referenteA: referenteATexto,
        formaPagamento: 'PIX',
        cidadeUf: empresa.cidadeUf || empresa.cidade || 'São Paulo - SP',
        observacoes: 'Recibo emitido automaticamente via Baixa no Módulo Financeiro.'
      };

      if (onSaveRecibos) {
        onSaveRecibos([novoRecibo, ...recibos]);
      }

      // Abre popup/banner em destaque para o usuário com botões de Ver PDF e Enviar WhatsApp!
      setReciboAlertPopup({
        recibo: novoRecibo,
        financeiroItem: itemTarget
      });
    }
  };

  // Encontrar ou gerar recibo correspondente a uma conta paga
  const getReciboDaConta = (itemFin) => {
    let rec = recibos.find(r => r.financeiroRefId === itemFin.id);

    let idCliente = itemFin.clienteId || '';
    let telCliente = '';
    let nomeEmpresaCliente = '';

    if (clientes && clientes.length > 0) {
      const cliFound = clientes.find(c => 
        (itemFin.clienteId && String(c.id) === String(itemFin.clienteId)) ||
        (c.nome && c.nome.toLowerCase() === (itemFin.clienteNome || '').toLowerCase()) ||
        (c.estabelecimento && c.estabelecimento.toLowerCase() === (itemFin.clienteNome || '').toLowerCase()) ||
        (c.empresa && c.empresa.toLowerCase() === (itemFin.clienteNome || '').toLowerCase())
      );

      if (cliFound) {
        idCliente = cliFound.id;
        telCliente = cliFound.whatsapp || cliFound.telefone || '';
        nomeEmpresaCliente = (cliFound.estabelecimento || cliFound.empresa || cliFound.nomeEmpresa || cliFound.razaoSocial || '').trim();
      }
    }

    const textoQuitacaoOficial = nomeEmpresaCliente 
      ? `Quitação: Serviço Concluído: Locução Comercial PARA EMPRESA ${nomeEmpresaCliente.toUpperCase()}`
      : `Quitação: Serviço Concluído: Locução Comercial`;

    if (!rec) {
      rec = {
        id: 'rec_fin_view_' + itemFin.id,
        numero: 'REC-2026-FIN',
        dataEmissao: itemFin.dataVencimento || new Date().toISOString().split('T')[0],
        clienteId: idCliente,
        clienteNome: itemFin.clienteNome || 'Cliente',
        clienteTelefone: telCliente,
        valor: itemFin.valor,
        valorExtenso: numeroParaExtenso(itemFin.valor),
        referenteA: textoQuitacaoOficial,
        formaPagamento: 'PIX',
        cidadeUf: empresa.cidadeUf || empresa.cidade || 'São Paulo - SP'
      };
    } else {
      rec = {
        ...rec,
        clienteId: idCliente || rec.clienteId,
        referenteA: textoQuitacaoOficial
      };
    }
    return rec;
  };

  // Nomes dos Meses para Exibição
  const NOMES_MESES = {
    '01': 'Janeiro',
    '02': 'Fevereiro',
    '03': 'Março',
    '04': 'Abril',
    '05': 'Maio',
    '06': 'Junho',
    '07': 'Julho',
    '08': 'Agosto',
    '09': 'Setembro',
    '10': 'Outubro',
    '11': 'Novembro',
    '12': 'Dezembro'
  };

  // Filtragem Por Mês, Ano e Tipo
  const listaFiltrada = financeiro.filter(item => {
    if (filtroTipo === 'receita' && item.tipo !== 'receita') return false;
    if (filtroTipo === 'despesa' && item.tipo !== 'despesa') return false;
    if (filtroTipo === 'vencidos' && item.status !== 'vencido') return false;
    if (filtroTipo === 'mensais' && !item.isMensal) return false;

    if (item.dataVencimento) {
      const parts = String(item.dataVencimento).split('T')[0].split('-');
      if (parts.length === 3) {
        const anoItem = parts[0];
        const mesItem = parts[1];

        if (filtroMes !== 'todos' && mesItem !== filtroMes) return false;
        if (filtroAno !== 'todos' && anoItem !== filtroAno) return false;
      }
    }

    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div className="card card-blue" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--blue-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DollarSign size={24} /> Financeiro - Contas a Pagar e Receber
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Dê baixa nas suas contas para <strong>gerar recibos profissionais automaticamente</strong> ou marque contas como <strong>mensais</strong>!
          </p>
        </div>

        <button className="btn btn-orange" onClick={abrirModalNovo}>
          <Plus size={18} /> Novo Lançamento
        </button>
      </div>

      {/* POPUP EM DESTAQUE AO DAR BAIXA (GEROU RECIBO) */}
      {reciboAlertPopup && (
        <div style={{
          background: 'var(--blue-gradient)',
          color: '#ffffff',
          padding: '16px 20px',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          border: '2px solid #ffffff',
          animation: 'slideIn 0.3s ease'
        }}>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} /> ✨ RECIBO OFICIAL GERADO COM SUCESSO!
            </div>
            <div style={{ fontSize: '0.88rem', marginTop: '2px', opacity: 0.9 }}>
              Recibo <strong>{reciboAlertPopup.recibo.numero}</strong> emitido para <strong>{reciboAlertPopup.recibo.clienteNome}</strong> no valor de <strong>R$ {Number(reciboAlertPopup.recibo.valor).toFixed(2)}</strong> ({reciboAlertPopup.recibo.valorExtenso}).
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-sm btn-orange"
              onClick={() => {
                setDocVisualizar(reciboAlertPopup.recibo);
                setReciboAlertPopup(null);
              }}
            >
              <Eye size={16} /> Ver Recibo / Foto / PDF
            </button>

            <button
              className="btn btn-sm btn-whatsapp"
              onClick={() => {
                abrirWhatsapp(reciboAlertPopup.recibo.clienteTelefone || empresa.whatsapp, msgWhatsapp.recibo(reciboAlertPopup.recibo, empresa));
                setReciboAlertPopup(null);
              }}
            >
              <Send size={16} /> Enviar Recibo no WhatsApp
            </button>

            <button className="action-btn-circle" style={{ width: '32px', height: '32px' }} onClick={() => setReciboAlertPopup(null)}>✕</button>
          </div>
        </div>
      )}

      {/* PAINEL DE SELEÇÃO DE MÊS E ANO + FILTROS DE CONTAS */}
      <div style={{
        background: '#ffffff',
        padding: '16px 20px',
        borderRadius: '16px',
        border: '2px solid var(--blue-border)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, color: 'var(--blue-primary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={18} /> Filtrar Contas por Mês / Ano:
            </span>

            {/* SELETOR DE MÊS */}
            <select
              className="form-select"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              style={{ width: 'auto', padding: '6px 14px', fontWeight: 800, color: '#0f172a', borderColor: 'var(--orange-primary)' }}
            >
              <option value="todos">🗓️ Todos os Meses</option>
              <option value="01">01 - Janeiro</option>
              <option value="02">02 - Fevereiro</option>
              <option value="03">03 - Março</option>
              <option value="04">04 - Abril</option>
              <option value="05">05 - Maio</option>
              <option value="06">06 - Junho</option>
              <option value="07">07 - Julho</option>
              <option value="08">08 - Agosto</option>
              <option value="09">09 - Setembro</option>
              <option value="10">10 - Outubro</option>
              <option value="11">11 - Novembro</option>
              <option value="12">12 - Dezembro</option>
            </select>

            {/* SELETOR DE ANO */}
            <select
              className="form-select"
              value={filtroAno}
              onChange={(e) => setFiltroAno(e.target.value)}
              style={{ width: 'auto', padding: '6px 14px', fontWeight: 800, color: '#0f172a' }}
            >
              <option value="todos">🌐 Todos os Anos</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            Lançamentos no Período: <span style={{ color: 'var(--blue-primary)', fontWeight: 900 }}>{listaFiltrada.length}</span>
          </div>
        </div>

        {/* Botoes de tipo */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px dashed #e2e8f0', paddingTop: '10px' }}>
          <button className={`btn btn-sm ${filtroTipo === 'todos' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltroTipo('todos')}>
            Todos os Lançamentos ({financeiro.length})
          </button>
          <button className={`btn btn-sm ${filtroTipo === 'receita' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltroTipo('receita')}>
            Contas a Receber ({financeiro.filter(f => f.tipo === 'receita').length})
          </button>
          <button className={`btn btn-sm ${filtroTipo === 'despesa' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltroTipo('despesa')}>
            Contas a Pagar ({financeiro.filter(f => f.tipo === 'despesa').length})
          </button>
          <button className={`btn btn-sm ${filtroTipo === 'mensais' ? 'btn-orange' : 'btn-secondary'}`} onClick={() => setFiltroTipo('mensais')}>
            🔁 Contas Mensais ({financeiro.filter(f => f.isMensal).length})
          </button>
          <button className={`btn btn-sm ${filtroTipo === 'vencidos' ? 'btn-orange' : 'btn-secondary'}`} onClick={() => setFiltroTipo('vencidos')}>
            Vencidos 🔥 ({financeiro.filter(f => f.status === 'vencido').length})
          </button>
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Descrição / Pessoa</th>
              <th>Categoria</th>
              <th>Vencimento</th>
              <th>Valor</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  Nenhum lançamento financeiro encontrado.
                </td>
              </tr>
            ) : (
              listaFiltrada.map(f => {
                const recAssociado = f.status === 'pago' ? getReciboDaConta(f) : null;

                return (
                  <tr key={f.id} style={{ background: f.status === 'pago' ? 'var(--success-bg)' : 'transparent' }}>
                    <td>
                      {f.tipo === 'receita' ? (
                        <span className="badge badge-success" style={{ gap: '4px' }}>
                          <ArrowUpCircle size={14} /> Receita
                        </span>
                      ) : (
                        <span className="badge badge-danger" style={{ gap: '4px' }}>
                          <ArrowDownCircle size={14} /> Despesa
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <strong style={{ color: 'var(--text-main)' }}>{f.descricao}</strong>
                        {f.isMensal && (
                          <span className="badge badge-orange" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                            <Repeat size={12} style={{ marginRight: '3px' }} /> Mensal
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.clienteNome}</div>
                    </td>
                    <td>{f.categoria}</td>
                    <td>{safeFormatDate(f.dataVencimento)}</td>
                    <td style={{ fontWeight: 800, color: f.tipo === 'receita' ? '#047857' : '#b91c1c' }}>
                      {formatMoney(f.valor, esconderValores)}
                    </td>
                    <td>
                      {f.status === 'pago' && <span className="badge badge-success">Pago</span>}
                      {f.status === 'pendente' && <span className="badge badge-warning">Pendente</span>}
                      {f.status === 'vencido' && <span className="badge badge-danger">Vencido</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {/* Botão Dar Baixa */}
                        <button
                          className={`btn btn-sm ${f.status === 'pago' ? 'btn-secondary' : 'btn-orange'}`}
                          onClick={() => toggleStatusPago(f)}
                          title={f.status === 'pago' ? "Desfazer baixa" : "Dar Baixa (Gera Recibo e Renova no Próximo Mês)"}
                        >
                          <CheckCircle size={14} /> {f.status === 'pago' ? 'Pago ✅' : 'Dar Baixa'}
                        </button>

                        {/* Botões do Recibo Gerado quando Pago */}
                        {f.status === 'pago' && recAssociado && (
                          <>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => setDocVisualizar(recAssociado)}
                              title="Visualizar Recibo (PDF/Foto)"
                            >
                              <Receipt size={14} /> Recibo
                            </button>

                            <button
                              className="btn btn-sm btn-whatsapp"
                              onClick={() => abrirWhatsapp(recAssociado.clienteTelefone || empresa.whatsapp, msgWhatsapp.recibo(recAssociado, empresa))}
                              title="Enviar Recibo no WhatsApp do Cliente"
                            >
                              <Send size={14} /> WhatsApp
                            </button>
                          </>
                        )}

                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => abrirModalEditar(f)}
                          title="Editar Conta"
                        >
                          <Edit size={14} />
                        </button>

                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => onDeleteFinanceiro(f.id)}
                          title="Excluir Lançamento"
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL NOVO / EDITAR LANÇAMENTO COM OPÇÃO DE CONTA MENSAL SIMPLES */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editId ? 'Editar Conta / Lançamento' : 'Novo Lançamento Financeiro'}
              </h3>
              <button className="action-btn-circle" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSalvar} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  className={`btn ${tipo === 'receita' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setTipo('receita')}
                >
                  <ArrowUpCircle size={16} /> Receita (A Receber)
                </button>
                <button
                  type="button"
                  className={`btn ${tipo === 'despesa' ? 'btn-orange' : 'btn-secondary'}`}
                  onClick={() => setTipo('despesa')}
                >
                  <ArrowDownCircle size={16} /> Despesa (A Pagar)
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Descrição *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Aluguel do Estúdio, Internet ou Conta de Luz"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pessoa / Cliente / Fornecedor</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: João da Silva ou Imobiliária X"
                  value={clienteNome}
                  onChange={(e) => setClienteNome(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="0.00"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    required
                    style={{ fontWeight: 800 }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Data de Vencimento *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Categoria</label>
                  <select className="form-select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                    <option value="Geral">Geral</option>
                    <option value="Serviços / Agenda">Serviços / Agenda</option>
                    <option value="Vendas / Produtos">Vendas / Produtos</option>
                    <option value="Aluguel / Utilidades">Aluguel / Utilidades</option>
                    <option value="Fornecedores">Fornecedores</option>
                    <option value="Impostos / Taxas">Impostos / Taxas</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                    <option value="vencido">Vencido</option>
                  </select>
                </div>
              </div>

              {/* OPÇÃO DE CONTA MENSAL SIMPLES (ÚNICO CHECKBOX SEM POLUIÇÃO DE 12 PARCELAS) */}
              <div style={{ background: '#fefce8', padding: '14px 16px', borderRadius: '12px', border: '2px solid var(--orange-border)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 800, color: '#ca8a04', fontSize: '0.95rem' }}>
                  <input
                    type="checkbox"
                    checked={isMensal}
                    onChange={(e) => setIsMensal(e.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: 'var(--orange-primary)', cursor: 'pointer' }}
                  />
                  <Repeat size={18} />
                  <span>🔁 Esta conta é mensal recorrente (Repetir todo mês)</span>
                </label>

                {isMensal && (
                  <div style={{ fontSize: '0.78rem', color: '#854d0e', lineHeight: '1.4', marginTop: '8px', fontStyle: 'italic' }}>
                    💡 Ao dar baixa no pagamento deste mês, o sistema gerará a conta do mês seguinte automaticamente!
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-orange">
                  {editId ? 'Salvar Alterações' : 'Salvar Lançamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualizar Recibo Impresso / Foto / PDF */}
      <ModalDocumento
        isOpen={!!docVisualizar}
        onClose={() => setDocVisualizar(null)}
        documento={docVisualizar}
        tipo="recibo"
        empresa={empresa}
        clientes={clientes}
      />
    </div>
  );
}
