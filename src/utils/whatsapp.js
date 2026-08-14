// Utilitário de Integração e Automação de Mensagens WhatsApp Empresarial (Locução & Estúdio)
import { safeFormatDate } from './storage';

export const formatPhoneForWhatsapp = (phone) => {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (!clean) return '';
  if (clean.length === 10 || clean.length === 11) {
    return `55${clean}`;
  }
  return clean;
};

export const generateWhatsappLink = (phone, text) => {
  const cleanPhone = formatPhoneForWhatsapp(phone);
  const encodedText = encodeURIComponent(text);
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
};

export const abrirWhatsapp = (phone, text) => {
  const url = generateWhatsappLink(phone, text);
  window.open(url, '_blank');
};

// Helper interno para formatar o Bloco de Dados do Funcionário e Empresa
const getBlocoFuncionarioEmpresa = (empresa = {}) => {
  const nomeFunc = empresa.nomeFuncionario ? `👤 *Atendente:* ${empresa.nomeFuncionario}` + (empresa.cargoFuncionario ? ` (${empresa.cargoFuncionario})` : '') : '';
  const nomeEmpresa = empresa.razaoSocial || empresa.nomeFantasia || 'Estúdio de Locução';
  const gerenteStr = empresa.nomeGerente ? `👨‍💼 *Gerente / Responsável:* ${empresa.nomeGerente}\n` : '';
  const cidadeStr = (empresa.cidadeUf || empresa.cidade) ? `📍 *Cidade:* ${empresa.cidadeUf || empresa.cidade}\n` : '';

  let text = '';
  if (nomeFunc) text += `${nomeFunc}\n`;
  text += `🏢 *Empresa:* ${nomeEmpresa}\n`;
  if (gerenteStr) text += gerenteStr;
  if (cidadeStr) text += cidadeStr;

  return text;
};

// Formatadores de Mensagens Automáticas com Estrutura Profissional (Funcionário, Gerente, Empresa e Serviço)
export const msgWhatsapp = {
  // 1. Confirmação Instantânea de Agendamento
  confirmacaoNovoAgendamento: (ag, empresa) => {
    const dataFmt = ag.data ? safeFormatDate(ag.data) : '';
    const horarioStr = ag.diaInteiro ? '☀️ Dia Inteiro' : ag.horario;
    const bloco = getBlocoFuncionarioEmpresa(empresa);

    return `✨ *CONFIRMAÇÃO DE AGENDAMENTO DE LOCUÇÃO / SERVIÇO*\n\n` +
      bloco + `\n` +
      `📌 *DETALHES DO SERVIÇO PRESTADO:*\n` +
      `• *Cliente:* ${ag.clienteNome}\n` +
      `• *Serviço:* ${ag.titulo}\n` +
      `• *Data:* ${dataFmt}\n` +
      `• *Horário:* ${horarioStr}\n` +
      (ag.valor > 0 ? `• *Valor do Serviço:* R$ ${Number(ag.valor).toFixed(2)}\n` : '') +
      (ag.descricao ? `• *Detalhes:* ${ag.descricao}\n` : '') +
      `\nSe estiver tudo certo, por favor dê um *OK* ou responda com um *JOINHA* 👍 para confirmar que esta tudo certo!\n` +
      `Obrigado Pela Preferência!\n\n` +
      `*Equipe: Gerailton Neves*`;
  },

  // 2. Confirmação de Agendamento Múltiplo (Várias Datas)
  confirmacaoAgendamentoMultiplo: (clienteNome, titulo, horario, datasArray, empresa) => {
    const bloco = getBlocoFuncionarioEmpresa(empresa);
    const datasFormatadas = datasArray.map(d => safeFormatDate(d)).join('\n• ');

    return `✨ *CONFIRMAÇÃO DE AGENDAMENTO MÚLTIPLO (VÁRIAS DATAS)*\n\n` +
      bloco + `\n` +
      `📌 *DETALHES DO PACOTE DE SERVIÇOS:*\n` +
      `• *Cliente:* ${clienteNome}\n` +
      `• *Serviço:* ${titulo}\n` +
      `• *Horário Padrão:* ${horario}\n` +
      `• *Datas Agendadas:*\n• ${datasFormatadas}\n\n` +
      `Se estiver tudo certo, por favor dê um *OK* ou responda com um *JOINHA* 👍 para confirmar que esta tudo certo!\n` +
      `Obrigado Pela Preferência!\n\n` +
      `*Equipe: Gerailton Neves*`;
  },

  // 3. Lembrete de Locução 1 Dia Antes (Com OK e JOINHA em Negrito e Rodapé Personalizado)
  lembretePreVencimentoAmanha: (ag, empresa) => {
    const dataFmt = ag.data ? safeFormatDate(ag.data) : 'Amanhã';
    const horarioStr = ag.diaInteiro ? '☀️ Dia Inteiro' : ag.horario;
    const bloco = getBlocoFuncionarioEmpresa(empresa);

    return `👋 *LEMBRETE DE LOCUÇÃO / AGENDAMENTO - AMANHÃ*\n\n` +
      bloco + `\n` +
      `📌 *DETALHES DO AGENDAMENTO:*\n` +
      `• *Cliente:* ${ag.clienteNome}\n` +
      `• *Serviço:* ${ag.titulo}\n` +
      `• *Data:* AMANHÃ, dia ${dataFmt}\n` +
      `• *Horário:* ⏰ ${horarioStr}\n` +
      (ag.valor > 0 ? `• *Valor do Serviço:* R$ ${Number(ag.valor).toFixed(2)}\n` : '') +
      `\nSe estiver tudo certo, por favor dê um *OK* ou responda com um *JOINHA* 👍 para confirmar que esta tudo certo!\n` +
      `Obrigado Pela Preferência!\n\n` +
      `*Equipe: Gerailton Neves*`;
  },

  // 4. Lembrete Geral de Agendamento
  agendamento: (ag, empresa) => {
    const bloco = getBlocoFuncionarioEmpresa(empresa);
    const dataFmt = ag.data ? safeFormatDate(ag.data) : '';

    return `📌 *LEMBRETE DE LOCUÇÃO / SERVIÇO*\n\n` +
      bloco + `\n` +
      `📌 *DETALHES DO COMPROMISSO:*\n` +
      `• *Cliente:* ${ag.clienteNome}\n` +
      `• *Serviço:* ${ag.titulo}\n` +
      `• *Data:* ${dataFmt}\n` +
      `• *Horário:* ${ag.horario}\n` +
      (ag.descricao ? `• *Detalhes:* ${ag.descricao}\n` : '') +
      `\n*Equipe: Gerailton Neves*`;
  },

  // 5. Envio de Orçamento
  orcamento: (orc, empresa) => {
    const bloco = getBlocoFuncionarioEmpresa(empresa);
    const itensTexto = orc.itens ? orc.itens.map(i => `• ${i.qtd}x ${i.descricao} - R$ ${(i.qtd * i.valorUnitario).toFixed(2)}`).join('\n') : '';

    return `📄 *ORÇAMENTO OFICIAL DE SERVIÇOS - Nº ${orc.numero}*\n\n` +
      bloco + `\n` +
      `📌 *DETALHES DO ORÇAMENTO:*\n` +
      `• *Cliente:* ${orc.clienteNome}\n` +
      `• *Itens / Serviços:*\n${itensTexto}\n\n` +
      (orc.desconto > 0 ? `• *Desconto:* R$ ${Number(orc.desconto).toFixed(2)}\n` : '') +
      `• *VALOR TOTAL:* R$ ${Number(orc.total).toFixed(2)}\n` +
      (orc.dataValidade ? `• *Validade:* ${safeFormatDate(orc.dataValidade)}\n` : '') +
      (empresa.chavePix ? `\n🔑 *Chave PIX:* ${empresa.chavePix}\n` : '') +
      `\nObrigado Pela Preferência!\n\n` +
      `*Equipe: Gerailton Neves*`;
  },

  // 6. Envio de Recibo Oficial de Pagamento
  recibo: (rec, empresa) => {
    const bloco = getBlocoFuncionarioEmpresa(empresa);
    const dataFmt = rec.dataEmissao ? safeFormatDate(rec.dataEmissao) : '';
    const extensoStr = rec.valorExtenso ? ` (${rec.valorExtenso})` : '';
    const nomeMinhaEmpresa = empresa.razaoSocial || empresa.nomeFantasia || 'Gerailton Neves Locutor';
    const nomeEmpresaCli = rec.clienteEmpresa || rec.estabelecimento || rec.empresa || '';

    const textoEmpresaCli = nomeEmpresaCli ? ` para a empresa *${nomeEmpresaCli.toUpperCase()}*` : '';

    return `🧾 *RECIBO OFICIAL DE PAGAMENTO - Nº ${rec.numero}*\n\n` +
      bloco + `\n` +
      `📜 *DECLARAÇÃO DE QUITAÇÃO:*\n` +
      `Declaro(amos) para os devidos fins de direito que a empresa *${nomeMinhaEmpresa}* recebeu com plena quitação a quantia de *R$ ${Number(rec.valor).toFixed(2)}*${extensoStr}, pago por *${rec.clienteNome}*, referente à prestação do serviço de *${rec.referenteA}*${textoEmpresaCli}.\n\n` +
      `📌 *DETALHES DA QUITAÇÃO:*\n` +
      `• *Prestador:* ${nomeMinhaEmpresa}\n` +
      `• *Cliente:* ${rec.clienteNome}\n` +
      (nomeEmpresaCli ? `• *Empresa do Cliente:* ${nomeEmpresaCli}\n` : '') +
      `• *Serviço:* ${rec.referenteA}\n` +
      `• *Forma de Pagamento:* ${rec.formaPagamento || 'PIX'}\n` +
      `• *Data de Emissão:* ${dataFmt}\n\n` +
      `Por ser verdade e para dar a devida e geral quitação pelo serviço concluído, firmamos o presente recibo comercial.\n\n` +
      `*Equipe: Gerailton Neves*`;
  }
};
