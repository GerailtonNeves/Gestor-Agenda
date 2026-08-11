// Utilitário de Integração e Automação de Mensagens WhatsApp Empresarial

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

// Formatadores de Mensagens Automáticas Profissionais com Razão Social e Rodapé Personalizado
export const msgWhatsapp = {
  // 1. Confirmação Instantânea de Novo Agendamento (Link Público ou Manual)
  confirmacaoNovoAgendamento: (ag, empresa) => {
    const nomeEmpresa = empresa.razaoSocial || empresa.nomeFantasia || 'Sua Empresa';
    const dataFmt = ag.data ? new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR') : '';
    return `✨ *AGENDAMENTO CONFIRMADO COM SUCESSO!* - *${nomeEmpresa}*\n\n` +
      `Olá, *${ag.clienteNome}*!\n` +
      `Seu agendamento foi registrado no nosso sistema com sucesso! 🎉\n\n` +
      `📌 *Serviço/Compromisso:* ${ag.titulo}\n` +
      `📅 *Data:* ${dataFmt}\n` +
      `⏰ *Horário:* ${ag.horario}\n` +
      (ag.valor > 0 ? `💰 *Valor:* R$ ${Number(ag.valor).toFixed(2)}\n` : '') +
      (ag.descricao ? `ℹ️ *Detalhes:* ${ag.descricao}\n` : '') +
      `\n*ATT: GERAILTON NEVES LOCUTOR*`;
  },

  // 2. Lembrete de Vencimento 1 Dia Antes
  lembretePreVencimentoAmanha: (ag, empresa) => {
    const nomeEmpresa = empresa.razaoSocial || empresa.nomeFantasia || 'Sua Empresa';
    const dataFmt = ag.data ? new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR') : 'Amanhã';
    return `👋 *OLÁ, ${ag.clienteNome.toUpperCase()}! LEMBRETE DE COMPROMISSO* - *${nomeEmpresa}*\n\n` +
      `Passando para avisar e lembrar sobre o seu compromisso de *${ag.titulo}* agendado para *AMANHÃ*, dia *${dataFmt}* às ⏰ *${ag.horario}*.\n\n` +
      `Se estiver tudo certo, por favor dê um *OK* ou responda com um *JOINHA* 👍 para confirmar que esta tudo certo!\n` +
      `Obrigado Pela Preferência!\n\n` +
      `*ATT: GERAILTON NEVES LOCUTOR*`;
  },

  // 3. Lembrete Geral de Agendamento
  agendamento: (ag, empresa) => {
    const nomeEmpresa = empresa.razaoSocial || empresa.nomeFantasia || 'Sua Empresa';
    const dataFmt = ag.data ? new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR') : '';
    return `📌 *LEMBRETE DE AGENDAMENTO* - *${nomeEmpresa}*\n\n` +
      `Olá, *${ag.clienteNome}*!\n` +
      `Passando para lembrar do seu compromisso agendado:\n\n` +
      `🗓 *Data:* ${dataFmt}\n` +
      `⏰ *Horário:* ${ag.horario}\n` +
      `📝 *Serviço:* ${ag.titulo}\n` +
      (ag.descricao ? `ℹ️ *Detalhes:* ${ag.descricao}\n` : '') +
      `\n*ATT: GERAILTON NEVES LOCUTOR*`;
  },

  // 4. Envio de Orçamento
  orcamento: (orc, empresa) => {
    const nomeEmpresa = empresa.razaoSocial || empresa.nomeFantasia || 'Sua Empresa';
    const itensTexto = orc.itens ? orc.itens.map(i => `• ${i.qtd}x ${i.descricao} - R$ ${(i.qtd * i.valorUnitario).toFixed(2)}`).join('\n') : '';
    return `📄 *ORÇAMENTO DE SERVIÇOS/PRODUTOS* - *${nomeEmpresa}*\n\n` +
      `Olá, *${orc.clienteNome}*!\n` +
      `Conforme solicitado, segue o detalhamento do seu orçamento *Nº ${orc.numero}*:\n\n` +
      `🛒 *Itens:*\n${itensTexto}\n\n` +
      (orc.desconto > 0 ? `🎟 *Desconto:* R$ ${Number(orc.desconto).toFixed(2)}\n` : '') +
      `💰 *VALOR TOTAL:* R$ ${Number(orc.total).toFixed(2)}\n` +
      `📅 *Validade:* ${new Date(orc.dataValidade + 'T00:00:00').toLocaleDateString('pt-BR')}\n` +
      (orc.observacoes ? `\n💬 *Observações:* ${orc.observacoes}\n` : '') +
      (empresa.chavePix ? `\n🔑 *Chave PIX para pagamento:* ${empresa.chavePix}\n` : '') +
      `\n*ATT: GERAILTON NEVES LOCUTOR*`;
  },

  // 5. Envio de Recibo
  recibo: (rec, empresa) => {
    const nomeEmpresa = empresa.razaoSocial || empresa.nomeFantasia || 'Sua Empresa';
    return `🧾 *RECIBO DE PAGAMENTO* - *${nomeEmpresa}*\n\n` +
      `Recebemos de *${rec.clienteNome}* a quantia de *R$ ${Number(rec.valor).toFixed(2)}*.\n\n` +
      `📋 *Nº do Recibo:* ${rec.numero}\n` +
      `🗓 *Data:* ${new Date(rec.dataEmissao + 'T00:00:00').toLocaleDateString('pt-BR')}\n` +
      `💳 *Forma de Pagamento:* ${rec.formaPagamento}\n` +
      `📝 *Referente a:* ${rec.referenteA}\n\n` +
      `Obrigado pela preferência! 🙏\n` +
      `*ATT: GERAILTON NEVES LOCUTOR*`;
  }
};
