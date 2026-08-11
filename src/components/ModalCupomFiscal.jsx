import React from 'react';
import { Printer, Send, X, CheckCircle } from 'lucide-react';
import { abrirWhatsapp, msgWhatsapp } from '../utils/whatsapp';

export default function ModalCupomFiscal({ isOpen, onClose, venda, empresa = {} }) {
  if (!isOpen || !venda) return null;

  const handleImprimir = () => {
    window.print();
  };

  const subtotal = venda.subtotal || venda.total || 0;
  const desconto = venda.desconto || 0;
  const totalFinal = Math.max(0, subtotal - desconto);
  const valorPago = venda.valorPago || 0;
  const troco = venda.troco || 0;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 3000 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', padding: '16px', background: '#f8fafc' }}>
        {/* Botão Fechar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--blue-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={18} style={{ color: 'var(--success)' }} /> CUPOM FISCAL DE VENDA (SUPERMERCADO)
          </span>
          <button className="action-btn-circle" onClick={onClose}>✕</button>
        </div>

        {/* CUPOM ESTILO TÉRMICO DE SUPERMERCADO (80mm) */}
        <div id="cupom-impressao" className="cupom-fiscal-paper" style={{
          background: '#ffffff',
          padding: '20px 16px',
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: '12px',
          lineHeight: '1.4',
          color: '#000000',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderRadius: '4px',
          border: '1px solid #e2e8f0',
          margin: '0 auto 16px auto',
          maxWidth: '350px'
        }}>
          {/* LOGO E CABEÇALHO */}
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            {empresa.logo && (
              <img src={empresa.logo} alt="" style={{ maxHeight: '45px', maxWidth: '140px', objectFit: 'contain', marginBottom: '6px' }} />
            )}
            <div style={{ fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
              {empresa.nomeFantasia || empresa.razaoSocial || 'ESCRITÓRIO DE BOLSO'}
            </div>
            {empresa.cnpj && <div>CNPJ: {empresa.cnpj}</div>}
            {empresa.endereco && <div style={{ fontSize: '10px' }}>{empresa.endereco}</div>}
            {empresa.telefone && <div style={{ fontSize: '10px' }}>TEL: {empresa.telefone}</div>}
          </div>

          <div style={{ textAlign: 'center', margin: '6px 0' }}>
            ----------------------------------------
          </div>
          <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
            CUPOM NÃO FISCAL / COMPROVANTE DE VENDA
          </div>
          <div style={{ textAlign: 'center', fontSize: '11px' }}>
            Nº VENDA: {venda.id || 'VD-' + Date.now()} | DATA: {venda.data || new Date().toLocaleDateString('pt-BR')}
          </div>
          <div style={{ textAlign: 'center', margin: '6px 0' }}>
            ----------------------------------------
          </div>

          {/* DADOS DO CLIENTE */}
          <div style={{ marginBottom: '6px' }}>
            <strong>CLIENTE:</strong> {venda.clienteNome || 'CONSUMIDOR BALCÃO'}
          </div>

          <div style={{ textAlign: 'center', margin: '6px 0' }}>
            ----------------------------------------
          </div>

          {/* CABEÇALHO DA TABELA DE ITENS */}
          <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr 60px 70px', fontWeight: 'bold', borderBottom: '1px dashed #000', paddingBottom: '4px', marginBottom: '6px' }}>
            <span>#</span>
            <span>DESCRIÇÃO</span>
            <span style={{ textAlign: 'center' }}>QTDxUN</span>
            <span style={{ textAlign: 'right' }}>TOTAL</span>
          </div>

          {/* LISTA DE ITENS DO CUPOM */}
          {venda.itens && venda.itens.map((item, idx) => {
            const precoUnit = item.precoVenda || item.preco || 0;
            const sub = precoUnit * (item.qtd || 1);
            return (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '20px 1fr 60px 70px', marginBottom: '4px' }}>
                <span>{idx + 1}</span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nome}</span>
                <span style={{ textAlign: 'center' }}>{item.qtd}x{precoUnit.toFixed(2)}</span>
                <span style={{ textAlign: 'right', fontWeight: 'bold' }}>{sub.toFixed(2)}</span>
              </div>
            );
          })}

          <div style={{ textAlign: 'center', margin: '6px 0' }}>
            ----------------------------------------
          </div>

          {/* TOTAIS E DESCONTO */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>SUBTOTAL DOS ITENS:</span>
            <strong>R$ {subtotal.toFixed(2)}</strong>
          </div>

          {desconto > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b91c1c', marginBottom: '2px' }}>
              <span>DESCONTO CONCEDIDO:</span>
              <strong>- R$ {desconto.toFixed(2)}</strong>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold', borderTop: '1px dashed #000', paddingTop: '4px', marginTop: '4px' }}>
            <span>TOTAL A PAGAR:</span>
            <span>R$ {totalFinal.toFixed(2)}</span>
          </div>

          <div style={{ textAlign: 'center', margin: '6px 0' }}>
            ----------------------------------------
          </div>

          {/* FORMA DE PAGAMENTO E TROCO */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>FORMA DE PAGAMENTO:</span>
            <strong>{venda.formaPagamento || 'DINHEIRO'}</strong>
          </div>

          {valorPago > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>VALOR ENTREGUE:</span>
              <span>R$ {valorPago.toFixed(2)}</span>
            </div>
          )}

          {troco > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#047857', marginTop: '2px' }}>
              <span>TROCO A DEVOLVER:</span>
              <span>R$ {troco.toFixed(2)}</span>
            </div>
          )}

          <div style={{ textAlign: 'center', margin: '10px 0 6px 0' }}>
            ========================================
          </div>
          <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 'bold' }}>
            OBRIGADO PELA PREFERÊNCIA!
          </div>
          <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '2px' }}>
            SISTEMA ESCRITÓRIO DE BOLSO
          </div>
          <div style={{ textAlign: 'center', margin: '6px 0' }}>
            ========================================
          </div>
        </div>

        {/* BOTOES DE AÇÃO */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={handleImprimir} style={{ padding: '10px 16px', fontWeight: 800 }}>
            <Printer size={16} /> Imprimir Cupom (80mm)
          </button>
          <button className="btn btn-whatsapp" onClick={() => abrirWhatsapp(venda.clienteTelefone || empresa.whatsapp, msgWhatsapp.recibo(venda, empresa))} style={{ padding: '10px 16px', fontWeight: 800 }}>
            <Send size={16} /> Enviar WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
