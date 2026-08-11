import React, { useState } from 'react';
import { X, Printer, Send, Briefcase, Camera, Image, CheckCircle } from 'lucide-react';
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
      triggerToast('📸 Gerando foto do documento em alta resolução...');

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
          // Ignorar se o usuário apenas fechou a gaveta de compartilhamento
        }
      }
    } catch (error) {
      console.error('Erro ao gerar foto do documento:', error);
      alert('⚠️ Ocorreu um problema ao criar a foto do documento.');
    } finally {
      setGerandoImagem(false);
    }
  };

  // SISTEMA BULLETPROOF DE GERAÇÃO DE PDF E IMPRESSÃO COM ASSINATURA DIGITAL
  const handleImprimir = () => {
    const el = document.getElementById('documento-impressao');
    if (!el) {
      window.print();
      return;
    }

    const printWin = window.open('', '_blank', 'width=900,height=1100');
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
        <title>${isOrcamento ? 'Orçamento' : 'Recibo'} - ${documento.numero}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            box-sizing: border-box;
          }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border-bottom: 1px solid #cbd5e1; padding: 10px 12px; }
          th { background-color: #0284c7 !important; color: #ffffff !important; font-weight: bold; text-transform: uppercase; font-size: 0.8rem; }
          .badge-pago { background-color: #059669 !important; color: #ffffff !important; padding: 6px 14px; border-radius: 20px; font-weight: bold; }
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

      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px', background: '#fff', color: '#0f172a', padding: '24px', borderRadius: '16px', border: '2px solid var(--blue-border)' }}>
        {/* Controles de Ação Visual (Não aparecem na impressão) */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid var(--blue-border)', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontWeight: 800, color: 'var(--blue-primary)', fontSize: '1.15rem' }}>
            {isOrcamento ? `Proposta de Orçamento ${documento.numero}` : `Recibo Oficial de Pagamento ${documento.numero}`}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* BOTÃO 1: GERAR FOTO DA IMAGEM DO DOCUMENTO */}
            <button
              className="btn btn-sm btn-orange"
              onClick={handleGerarFotoPng}
              disabled={gerandoImagem}
              title="Gerar Foto PNG do documento para enviar aos clientes via WhatsApp"
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

        {/* ÁREA DE IMPRESSÃO (DESIGN DE DOCUMENTO OFICIAL ELABORADO COM ID) */}
        <div id="documento-impressao" className="print-document" style={{ padding: '24px', fontFamily: 'Arial, sans-serif', color: '#0f172a', background: '#ffffff', border: '2px solid #0284c7', borderRadius: '12px' }}>
          {/* Cabeçalho da Empresa com Logo */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #0284c7', paddingBottom: '18px', marginBottom: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {empresa.logo ? (
                <div style={{ width: '75px', height: '75px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1', padding: '4px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={empresa.logo} alt="Logo Empresa" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              ) : (
                <div style={{ width: '65px', height: '65px', borderRadius: '10px', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase size={34} />
                </div>
              )}
              <div>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 'bold', color: '#0284c7', margin: 0 }}>
                  {empresa.nomeFantasia || 'Escritório de Bolso'}
                </h1>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px', lineHeight: '1.4' }}>
                  {empresa.razaoSocial && <div><strong>{empresa.razaoSocial}</strong> • CNPJ/CPF: {empresa.cnpj || 'N/A'}</div>}
                  <div>{empresa.endereco || 'Endereço Comercial Não Informado'}</div>
                  <div>Tel/WhatsApp: {empresa.telefone || empresa.whatsapp || 'N/A'} • {empresa.email || ''}</div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', background: '#f0f9ff', padding: '10px 16px', borderRadius: '10px', border: '1.5px solid #bae6fd' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ea580c', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {isOrcamento ? 'ORÇAMENTO' : 'RECIBO OFICIAL'}
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#0284c7', marginTop: '2px' }}>
                {documento.numero}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>
                Data: <strong>{dataEmissaoFormatada}</strong>
              </div>
            </div>
          </div>

          {/* DADOS DO CLIENTE / DESTINATÁRIO */}
          <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '10px', border: '1.5px solid #cbd5e1', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: documento.clienteTelefone ? '2fr 1fr' : '1fr', gap: '14px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  NOME DO CLIENTE / DESTINATÁRIO
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#0f172a', marginTop: '2px' }}>
                  {documento.clienteNome || 'Cliente Não Informado'}
                </div>
              </div>

              {documento.clienteTelefone && (
                <div style={{ borderLeft: '2px solid #e2e8f0', paddingLeft: '14px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#ea580c', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    TELEFONE / WHATSAPP
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#0f172a', marginTop: '2px' }}>
                    {documento.clienteTelefone}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* TEMPLATE DE ORÇAMENTO */}
          {isOrcamento ? (
            <div>
              {/* Tabela de Itens */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#0284c7', color: '#fff', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Item / Descrição do Serviço</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', width: '80px' }}>Qtd</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', width: '130px' }}>Valor Unit.</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', width: '130px' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {documento.itens && documento.itens.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '10px 14px' }}>{item.descricao}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>{item.qtd}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>R$ {Number(item.valorUnitario).toFixed(2)}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 'bold' }}>
                        R$ {(item.qtd * item.valorUnitario).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totais */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <div style={{ width: '280px', background: '#f0f9ff', padding: '14px', borderRadius: '8px', border: '1.5px solid #bae6fd' }}>
                  {documento.desconto > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>
                      <span>Desconto:</span>
                      <span>- R$ {Number(documento.desconto).toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 'bold', color: '#0284c7', borderTop: '2px solid #bae6fd', paddingTop: '6px' }}>
                    <span>TOTAL:</span>
                    <span>R$ {Number(documento.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {documento.observacoes && (
                <div style={{ background: '#fff7ed', borderLeft: '4px solid #ea580c', padding: '12px 16px', borderRadius: '6px', fontSize: '0.88rem', color: '#7c2d12', marginBottom: '20px' }}>
                  <strong>Observações & Condições de Pagamento:</strong>
                  <div style={{ marginTop: '2px' }}>{documento.observacoes}</div>
                </div>
              )}
            </div>
          ) : (
            /* TEMPLATE DE RECIBO ELABORADO PROFISSIONAL */
            <div>
              {/* QUADRO DO VALOR EM DESTAQUE */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0f9ff', padding: '16px 20px', borderRadius: '10px', border: '2px solid #0284c7', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#0284c7', textTransform: 'uppercase' }}>VALOR DO RECIBO</div>
                  <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a' }}>
                    R$ {Number(documento.valor).toFixed(2)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge-pago" style={{ background: '#059669', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    PAGO ✅
                  </span>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '6px' }}>Forma: <strong>{documento.formaPagamento || 'PIX'}</strong></div>
                </div>
              </div>

              {/* CORPO DO RECIBO EXECUTIVO */}
              <div style={{ border: '2px solid #cbd5e1', padding: '22px', borderRadius: '12px', background: '#ffffff', marginBottom: '20px', fontSize: '1.05rem', lineHeight: '2' }}>
                Recebi(emos) de <strong>{documento.clienteNome}</strong>, a quantia de{' '}
                <strong style={{ color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px' }}>
                  R$ {Number(documento.valor).toFixed(2)}
                </strong>{' '}
                ({documento.valorExtenso || 'valor indicado acima'}), correspondente ao pagamento de:{' '}
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '10px 0', fontWeight: 'bold', color: '#0f172a', lineHeight: '1.5' }}>
                  "{documento.referenteA}"
                </div>
                para a qual dou(damos) a devida e plena quitação.
              </div>

              {documento.observacoes && (
                <div style={{ fontSize: '0.85rem', color: '#475569', background: '#fff7ed', borderLeft: '4px solid #f97316', padding: '10px 14px', borderRadius: '6px', marginBottom: '20px' }}>
                  <strong>Observações:</strong> {documento.observacoes}
                </div>
              )}

              {/* DADOS PIX SE HOUVER */}
              {empresa.chavePix && (
                <div style={{ fontSize: '0.85rem', color: '#0284c7', background: '#f0f9ff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #bae6fd', marginBottom: '24px' }}>
                  🔑 <strong>Chave PIX da Empresa:</strong> {empresa.chavePix}
                </div>
              )}
            </div>
          )}

          {/* RODAPÉ COM LOCAL, DATA E ASSINATURA DIGITAL REGISTRADA */}
          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
              <div>{documento.cidadeUf || 'São Paulo - SP'}, {dataEmissaoFormatada}</div>
              <div style={{ fontSize: '0.72rem', marginTop: '4px' }}>Documento emitido por Escritório de Bolso</div>
            </div>

            <div style={{ textAlign: 'center', width: '250px' }}>
              {empresa.assinatura && (
                <div style={{ marginBottom: '-6px', minHeight: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={empresa.assinatura} alt="Assinatura Autorizada" style={{ maxHeight: '65px', maxWidth: '220px', objectFit: 'contain' }} />
                </div>
              )}
              <div style={{ borderTop: '2px solid #0f172a', paddingTop: '6px' }}>
                <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{empresa.nomeFantasia || 'Emitente'}</strong>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>CNPJ/CPF: {empresa.cnpj || 'Assinatura Autorizada'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
