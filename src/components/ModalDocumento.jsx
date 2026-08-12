import React, { useState } from 'react';
import { X, Printer, Send, Briefcase, Camera, Image, CheckCircle, Award, Check } from 'lucide-react';
import { toPng } from 'html-to-image';
import { abrirWhatsapp, msgWhatsapp } from '../utils/whatsapp';
import { safeFormatDate } from '../utils/storage';

export default function ModalDocumento({ isOpen, onClose, documento, tipo, empresa }) {
  const [gerandoImagem, setGerandoImagem] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  if (!isOpen || !documento) return null;

  const isOrcamento = tipo === 'orcamento';
  const dataEmissaoFormatada = safeFormatDate(documento.dataEmissao || new Date().toISOString().split('T')[0]);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // GERADOR DA FOTO / IMAGEM PNG DO ORÇAMENTO E RECIBO
  const handleGerarFotoPng = async () => {
    const node = document.getElementById('documento-impressao');
    if (!node) return;

    try {
      setGerandoImagem(true);
      triggerToast('📸 Gerando foto do recibo em alta resolução...');

      const dataUrl = await toPng(node, {
        quality: 0.98,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#ffffff'
      });

      const nomeArquivo = `${isOrcamento ? 'Orcamento' : 'Recibo'}_${documento.numero || 'Doc'}.png`;

      // 1. Download do arquivo PNG no computador/celular
      const link = document.createElement('a');
      link.download = nomeArquivo;
      link.href = dataUrl;
      link.click();

      triggerToast('✅ Foto gerada e salva com sucesso! Pronta para enviar no WhatsApp.');

      // 2. Tentar Compartilhamento Nativo se suportado (Mobile / Tablets)
      if (navigator.canShare && navigator.share) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], nomeArquivo, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `${isOrcamento ? 'Orçamento' : 'Recibo'} ${documento.numero}`,
              text: `Segue a foto do ${isOrcamento ? 'Orçamento' : 'Recibo'} ${documento.numero} de ${documento.clienteNome}`
            });
          }
        } catch (errShare) {
          // Ignorar fechamento da gaveta
        }
      }
    } catch (error) {
      console.error('Erro ao gerar foto do documento:', error);
      alert('⚠️ Ocorreu um problema ao criar a foto do documento.');
    } finally {
      setGerandoImagem(false);
    }
  };

  // IMPRESSÃO E PDF
  const handleImprimir = () => {
    const el = document.getElementById('documento-impressao');
    if (!el) {
      window.print();
      return;
    }

    const printWin = window.open('', '_blank', 'width=980,height=1100');
    if (!printWin) {
      alert('⚠️ Por favor, permita popups neste site para gerar o PDF/Impressão.');
      window.print();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>${isOrcamento ? 'Orçamento' : 'Recibo Oficial'} - ${documento.numero}</title>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body {
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-container {
            width: 100%;
            max-width: 900px;
            margin: 0 auto;
            padding: 16px;
            box-sizing: border-box;
          }
          @media print {
            .no-print-btn { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div style="text-align: right; padding: 10px 20px;" class="no-print-btn">
          <button onclick="window.print()" style="background:#0284c7;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:bold;cursor:pointer;font-size:1rem;">
            🖨️ Confirmar Impressão / Salvar como PDF
          </button>
        </div>
        <div class="print-container">
          ${el.innerHTML}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  const handleWhatsapp = () => {
    if (isOrcamento) {
      abrirWhatsapp(documento.clienteTelefone || empresa.whatsapp, msgWhatsapp.orcamento(documento, empresa));
    } else {
      abrirWhatsapp(documento.clienteTelefone || empresa.whatsapp, msgWhatsapp.recibo(documento, empresa));
    }
  };

  const nomeRazaoEmpresa = empresa.razaoSocial || empresa.nomeFantasia || 'Estúdio de Locução';

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 3000 }}>
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '30px',
          right: '20px',
          background: 'var(--orange-gradient)',
          color: '#fff',
          padding: '14px 20px',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-orange-btn)',
          zIndex: 4000,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={20} /> <span>{toastMsg}</span>
        </div>
      )}

      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: isOrcamento ? '860px' : '920px', 
          background: '#fff', 
          color: '#0f172a', 
          padding: '24px', 
          borderRadius: '20px', 
          border: '2.5px solid var(--blue-border)',
          boxShadow: '0 25px 60px rgba(2, 132, 199, 0.25)'
        }}
      >
        {/* Controles de Ação Visual (Não aparecem na impressão) */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '2px solid var(--blue-border)', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontWeight: 800, color: 'var(--blue-primary)', fontSize: '1.15rem' }}>
            {isOrcamento ? `Orçamento Nº ${documento.numero}` : `Recibo Oficial de Pagamento ${documento.numero}`}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* BOTÃO 1: GERAR FOTO DA IMAGEM DO DOCUMENTO */}
            <button
              className="btn btn-sm btn-orange"
              onClick={handleGerarFotoPng}
              disabled={gerandoImagem}
              title="Gerar Foto PNG do recibo em formato compacto para enviar no WhatsApp"
              style={{ fontWeight: 800 }}
            >
              <Camera size={16} /> {gerandoImagem ? 'Gerando Foto...' : '📸 Gerar Foto p/ WhatsApp'}
            </button>

            {/* BOTÃO 2: WHATSAPP MENSAGEM */}
            <button className="btn btn-sm btn-whatsapp" onClick={handleWhatsapp}>
              <Send size={14} /> WhatsApp (Texto)
            </button>

            {/* BOTÃO 3: IMPRIMIR / PDF */}
            <button className="btn btn-sm btn-primary" onClick={handleImprimir} style={{ fontWeight: 800 }}>
              <Printer size={16} /> PDF / Imprimir
            </button>

            <button className="action-btn-circle" onClick={onClose} style={{ width: '34px', height: '34px' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ÁREA DO RECIBO COM DESIGN MODERNO, COMPACTO E MAIS LARGO */}
        <div 
          id="documento-impressao" 
          className="print-document" 
          style={{ 
            padding: '24px 28px', 
            fontFamily: 'Inter, system-ui, Arial, sans-serif', 
            color: '#0f172a', 
            background: '#ffffff', 
            border: '2.5px solid #0284c7', 
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(2, 132, 199, 0.08)'
          }}
        >
          {/* TOPO: BARRA DE DESTAQUE ELEGANTE DA EMPRESA */}
          <div style={{ 
            display: 'flex', 
            justify: 'space-between', 
            alignItems: 'center', 
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
            color: '#ffffff', 
            padding: '16px 22px', 
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {empresa.logo ? (
                <div style={{ width: '65px', height: '65px', borderRadius: '10px', overflow: 'hidden', background: '#ffffff', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={empresa.logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              ) : (
                <div style={{ width: '55px', height: '55px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={28} />
                </div>
              )}
              <div>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#ffffff', lineHeight: '1.2' }}>
                  {nomeRazaoEmpresa}
                </h1>
                <div style={{ fontSize: '0.82rem', opacity: 0.95, marginTop: '2px' }}>
                  {empresa.cnpj ? `CNPJ/CPF: ${empresa.cnpj}` : ''} {empresa.whatsapp || empresa.telefone ? `• Tel: ${empresa.whatsapp || empresa.telefone}` : ''}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: '#ffedd5' }}>
                {isOrcamento ? 'ORÇAMENTO' : 'RECIBO DE PAGAMENTO'}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', opacity: 0.9 }}>
                Nº {documento.numero}
              </div>
            </div>
          </div>

          {/* TEMPLATE DE ORÇAMENTO */}
          {isOrcamento ? (
            <div>
              {/* Dados do Cliente */}
              <div style={{ background: '#f8fafc', padding: '12px 18px', borderRadius: '10px', border: '1.5px solid #cbd5e1', marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: documento.clienteTelefone ? '2fr 1fr' : '1fr', gap: '14px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 800, textTransform: 'uppercase' }}>CLIENTE / SOLICITANTE</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{documento.clienteNome || 'Cliente Não Informado'}</div>
                  </div>
                  {documento.clienteTelefone && (
                    <div style={{ borderLeft: '2px solid #e2e8f0', paddingLeft: '14px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 800, textTransform: 'uppercase' }}>WHATSAPP</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800 }}>{documento.clienteTelefone}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabela de Itens */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#0284c7', color: '#fff', textTransform: 'uppercase', fontSize: '0.78rem' }}>
                    <th style={{ padding: '9px 12px', textAlign: 'left' }}>Item / Descrição do Serviço</th>
                    <th style={{ padding: '9px 12px', textAlign: 'center', width: '70px' }}>Qtd</th>
                    <th style={{ padding: '9px 12px', textAlign: 'right', width: '120px' }}>Valor Unit.</th>
                    <th style={{ padding: '9px 12px', textAlign: 'right', width: '120px' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {documento.itens && documento.itens.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '9px 12px' }}>{item.descricao}</td>
                      <td style={{ padding: '9px 12px', textAlign: 'center' }}>{item.qtd}</td>
                      <td style={{ padding: '9px 12px', textAlign: 'right' }}>R$ {Number(item.valorUnitario).toFixed(2)}</td>
                      <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 'bold' }}>
                        R$ {(item.qtd * item.valorUnitario).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totais */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <div style={{ width: '260px', background: '#f0f9ff', padding: '12px', borderRadius: '8px', border: '1.5px solid #bae6fd' }}>
                  {documento.desconto > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#475569', marginBottom: '4px' }}>
                      <span>Desconto:</span>
                      <span>- R$ {Number(documento.desconto).toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>
                    <span>TOTAL:</span>
                    <span>R$ {Number(documento.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {documento.observacoes && (
                <div style={{ background: '#fff7ed', borderLeft: '4px solid #ea580c', padding: '10px 14px', borderRadius: '6px', fontSize: '0.85rem', color: '#7c2d12', marginBottom: '16px' }}>
                  <strong>Observações:</strong> {documento.observacoes}
                </div>
              )}
            </div>
          ) : (
            /* LAYOUT DE RECIBO EXECUTIVO: COMPACTO NA ALTURA E MAIS LARGO NA LARGURA */
            <div>
              {/* ESTRUTURA EM 2 COLUNAS HORIZONTAIS COMPACTAS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '16px', marginBottom: '16px' }}>
                {/* COLUNA ESQUERDA: DADOS DO PAGADOR E HISTÓRICO */}
                <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '12px', border: '1.5px solid #cbd5e1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      RECEBEMOS DE (PAGADOR):
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                      {documento.clienteNome || 'Cliente Não Informado'}
                    </div>
                    {documento.clienteTelefone && (
                      <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                        📱 WhatsApp: {documento.clienteTelefone}
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase' }}>
                      REFERENTE A (SERVIÇO / PRODUTO):
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px', lineHeight: '1.3' }}>
                      "{documento.referenteA}"
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', fontSize: '0.88rem', color: '#334155' }}>
                    <strong>Valor por Extenso:</strong> ({documento.valorExtenso || 'valor indicado ao lado'})
                  </div>
                </div>

                {/* COLUNA DIREITA: CARTÃO DE DESTAQUE DO VALOR E FORMA DE PAGAMENTO */}
                <div style={{ background: '#f0f9ff', padding: '16px 20px', borderRadius: '12px', border: '2px solid #0284c7', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                      VALOR RECEBIDO
                    </div>
                    <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                      R$ {Number(documento.valor).toFixed(2)}
                    </div>
                    <span style={{ background: '#059669', color: '#ffffff', padding: '4px 14px', borderRadius: '20px', fontWeight: 800, fontSize: '0.82rem', display: 'inline-block', marginTop: '2px' }}>
                      PAGO ✅
                    </span>
                  </div>

                  <div style={{ width: '100%', borderTop: '1px solid #bae6fd', paddingTop: '8px', marginTop: '10px', fontSize: '0.82rem', color: '#475569' }}>
                    <div>Forma de Pagamento: <strong>{documento.formaPagamento || 'PIX'}</strong></div>
                    {empresa.chavePix && (
                      <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700, marginTop: '3px' }}>
                        🔑 PIX: {empresa.chavePix}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {documento.observacoes && (
                <div style={{ fontSize: '0.82rem', color: '#475569', background: '#fff7ed', borderLeft: '4px solid #f97316', padding: '8px 12px', borderRadius: '6px', marginBottom: '14px' }}>
                  <strong>Observações:</strong> {documento.observacoes}
                </div>
              )}
            </div>
          )}

          {/* RODAPÉ COMPACTO COM CIDADE/DATA E ASSINATURA DIGITAL */}
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '12px', borderTop: '1.5px solid #cbd5e1' }}>
            <div style={{ fontSize: '0.82rem', color: '#475569' }}>
              <div>📍 <strong>{documento.cidadeUf || 'São Paulo - SP'}</strong>, {dataEmissaoFormatada}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Quitação dada com a emissão deste comprovante.</div>
            </div>

            <div style={{ textAlign: 'center', minWidth: '240px' }}>
              {empresa.assinatura && (
                <div style={{ marginBottom: '-6px', minHeight: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={empresa.assinatura} alt="Assinatura" style={{ maxHeight: '55px', maxWidth: '200px', objectFit: 'contain' }} />
                </div>
              )}
              <div style={{ borderTop: '2px solid #0f172a', paddingTop: '4px' }}>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{nomeRazaoEmpresa}</strong>
                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 800 }}>ATT: GERAILTON NEVES LOCUTOR</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
