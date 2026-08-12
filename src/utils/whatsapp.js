// Utilitário de Integração e Automação de Mensagens WhatsApp Empresarial (Locução & Estúdio)

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

// Formatadores de Mensagens Automáticas de Locução e Serviços Profissionais
export const msgWhatsapp = {
  // 1. Confirmação Instantânea de Agendamento de Locução (Enviada direto para o WhatsApp do Cliente)
  confirmacaoNovoAgendamento: (ag, empresa) => {
    const nomeEmpresa = empresa.razaoSocial || empresa.nomeFantasia || 'Estúdio de Locução';
    const dataFmt = ag.data ? new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR') : '';
    const horarioStr = ag.diaInteiro ? '☀️ Dia Inteiro' : ag.horario;
    
    return `🎙️ *CONFIRMAÇÃO DE AGENDAMENTO DE LOCUÇÃO!* - *${nomeEmpresa}*\n\n` +
      `Olá, *${ag.clienteNome}*!\n` +
      `Sua gravação/locução foi agendada no nosso sistema com sucesso! 🎧🎉\n\n` +
      `📌 *Serviço/Trabalho:* ${ag.titulo}\n` +
      `📅 *Data:* ${dataFmt}\n` +
      `⏰ *Horário:* ${horarioStr}\n` +
      (ag.valor > 0 ? `💰 *Valor:* R$ ${Number(ag.valor).toFixed(2)}\n` : '') +
      (ag.descricao ? `ℹ️ *Detalhes:* ${ag.descricao}\n` : '') +
      `\nConte conosco para uma gravação de alta qualidade profissional!\n` +
      `Caso precise alterar algo, fale conosco por aqui.\n\n` +
      `*Equipe: Gerailton Neves*`;
  },

  // 2. Confirmação de Agendamento Múltiplo (Várias Datas Selecionadas)
  confirmacaoAgendamentoMultiplo: (clienteNome, titulo, horario, datasArray, empresa) => {
    const nomeEmpresa = empresa.razaoSocial || empresa.nomeFantasia || 'Estúdio de Locução';
    const datasFormatadas = datasArray.map(d => {
      const parts = d.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return d;
    }).join('\n• ');

    return `✨ *AGENDAMENTO MÚLTIPLO CONFIRMADO COM SUCESSO!* - *${nomeEmpresa}*\n\n` +
      `Olá, *${clienteNome}*!\n` +
      `Seus agendamentos foram realizados no nosso sistema com sucesso! 🎉\n\n` +
      `📌 *Serviço/Trabalho:* ${titulo}\n` +
      `⏰ *Horário:* ${horario}\n` +
      `🗓️ *Datas Agendadas:*\n• ${datasFormatadas}\n\n` +
      `Se estiver tudo certo, por favor dê um *OK* ou responda com um *JOINHA* 👍 para confirmar que esta tudo certo!\n` +
      `Obrigado Pela Preferência!\n\n` +
      `*Equipe: Gerailton Neves*`;
  },

  // 3. Lembrete de Locução 1 Dia Antes (Com OK e JOINHA em Negrito e Rodapé Personalizado)
  lembretePreVencimentoAmanha: (ag, empresa) => {
    const nomeEmpresa = empresa.razaoSocial || empresa.nomeFantasia || 'Estúdio de Locução';
    const dataFmt = ag.data ? new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR') : 'Amanhã';
    const horarioStr = ag.diaInteiro ? '☀️ Dia Inteiro' : ag.horario;

    return `👋 *OLÁ, ${ag.clienteNome.toUpperCase()}! LEMBRETE DE LOCUÇÃO / AGENDAMENTO* - *${nomeEmpresa}*\n\n` +
      `Passando para avisar e lembrar sobre a sua locução/serviço de *${ag.titulo}* agendada para *AMANHÃ*, dia *${dataFmt}* às ⏰ *${horarioStr}*.\n\n` +
      `Se estiver tudo certo, por favor dê um *OK* ou responda com um *JOINHA* 👍 para confirmar que esta tudo certo!\n` +
      `Obrigado Pela Preferência!\n\n` +
      `*Equipe: Gerailton Neves*`;
  },

  // 4. Notificação de Gravação / Locução Concluída e Pronta
  locucaoPronta: (ag, empresa) => {
    const nomeEmpresa = empresa.razaoSocial || empresa.nomeFantasia || 'Estúdio de Locução';
    return `🎙️ *SUA LOCUÇÃO / GRAVAÇÃO ESTÁ PRONTA!* - *${nomeEmpresa}*\n\n` +
      `Olá, *${ag.clienteNome}*!\n` +
      `Sua gravação de *${ag.titulo}* foi concluída com sucesso no nosso estúdio! 🎧✨\n\n` +
      `Obrigado pela preferência e parceria!\n\n` +
      `*Equipe: Gerailton Neves*`;
  },

  // 5. Lembrete Geral de Agendamento
  agendamento: (ag, empresa) => {
    const nomeEmpresa = empresa.razaoSocial || empresa.nomeFantasia || 'Estúdio de Locução';
    const dataFmt = ag.data ? new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR') : '';
    return `📌 *LEMBRETE DE LOCUÇÃO* - *${nomeEmpresa}*\n\n` +
      `Olá, *${ag.clienteNome}*!\n` +
      `Passando para lembrar do seu agendamento de locução:\n\n` +
      `🗓 *Data:* ${dataFmt}\n` +
      `⏰ *Horário:* ${ag.horario}\n` +
      `📝 *Serviço:* ${ag.titulo}\n` +
      (ag.descricao ? `ℹ️ *Detalhes:* ${ag.descricao}\n` : '') +
      `\n*Equipe: Gerailton Neves*`;
  },

  // 6. Envio de Orçamento de Locução
  orcamento: (orc, empresa) => {
    const nomeEmpresa = empresa.razaoSocial || empresa.nomeFantasia || 'Estúdio de Locução';
    const itensTexto = orc.itens ? orc.itens.map(i => `• ${i.qtd}x ${i.descricao} - R$ ${(i.qtd * i.valorUnitario).toFixed(2)}`).join('\n') : '';
    return `📄 *ORÇAMENTO DE LOCUÇÃO / GRAVAÇÃO* - *${nomeEmpresa}*\n\n` +
      `Olá, *${orc.clienteNome}*!\n` +
      `Conforme solicitado, segue o detalhamento do seu orçamento *Nº ${orc.numero}*:\n\n` +
      `🛒 *Itens:*\n${itensTexto}\n\n` +
      (orc.desconto > 0 ? `🎟 *Desconto:* R$ ${Number(orc.desconto).toFixed(2)}\n` : '') +
      `💰 *VALOR TOTAL:* R$ ${Number(orc.total).toFixed(2)}\n` +
      `📅 *Validade:* ${new Date(orc.dataValidade + 'T00:00:00').toLocaleDateString('pt-BR')}\n` +
      (orc.observacoes ? `\n💬 *Observações:* ${orc.observacoes}\n` : '') +
      (empresa.chavePix ? `\n🔑 *Chave PIX para pagamento:* ${empresa.chavePix}\n` : '') +
      `\n*Equipe: Gerailton Neves*`;
  },

  // 7. Envio de Recibo Oficial de Pagamento (Puxando Razão Social da Empresa, Nome do Cliente e Serviço)
  recibo: (rec, empresa) => {
    const nomeEmpresa = empresa.razaoSocial || empresa.nomeFantasia || 'Estúdio de Locução';
    const dataFmt = rec.dataEmissao ? new Date(rec.dataEmissao + 'T00:00:00').toLocaleDateString('pt-BR') : '';
    const extensoStr = rec.valorExtenso ? ` (${rec.valorExtenso})` : '';

    return `🧾 *RECIBO OFICIAL DE PAGAMENTO* - *${nomeEmpresa}*\n\n` +
      `Declaro(amos) que recebemos de *${rec.clienteNome}*, por intermédio da empresa *${nomeEmpresa}*, a quantia de *R$ ${Number(rec.valor).toFixed(2)}*${extensoStr}.\n\n` +
      `📝 *Referente a:* ${rec.referenteA}\n` +
      `💳 *Forma de Pagamento:* ${rec.formaPagamento}\n` +
      `📋 *Nº do Recibo:* ${rec.numero}\n` +
      `🗓 *Data de Emissão:* ${dataFmt}\n\n` +
      `Damos a devida e plena quitação do valor recebido. Obrigado pela preferência e parceria!\n\n` +
      `*Equipe: Gerailton Neves*`;
  }
};
