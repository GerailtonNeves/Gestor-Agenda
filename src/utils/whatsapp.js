// Utilitário de Integração com WhatsApp

export const formatPhoneForWhatsapp = (phone) => {
  if (!phone) return '';
  // Remove todos os caracteres não numéricos
  const clean = phone.replace(/\D/g, '');
  if (!clean) return '';
  // Se não começar com código do país (55), adiciona 55 se tiver 10 ou 11 dígitos
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

// Formatadores de Mensagens Pré-definidas
export const msgWhatsapp = {
  // Lembrete de Agenda
  agendamento: (ag, empresa) => {
    return `📌 *LEMBRETE DE AGENDAMENTO* - ${empresa.nomeFantasia}\n\n` +
      `Olá, *${ag.clienteNome}*!\n` +
      `Passando para lembrar do seu compromisso agendado:\n\n` +
      `🗓 *Data:* ${new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR')}\n` +
      `⏰ *Horário:* ${ag.horario}\n` +
      `📝 *Assunto:* ${ag.titulo}\n` +
      (ag.descricao ? `ℹ️ *Detalhes:* ${ag.descricao}\n` : '') +
      `\nQualquer dúvida ou alteração, estamos à disposição!\n` +
      `📞 ${empresa.telefone}`;
  },

  // Envio de Orçamento
  orcamento: (orc, empresa) => {
    const itensTexto = orc.itens.map(i => `• ${i.qtd}x ${i.descricao} - R$ ${(i.qtd * i.valorUnitario).toFixed(2)}`).join('\n');
    return `📄 *ORÇAMENTO DE SERVIÇOS/PRODUTOS* - ${empresa.nomeFantasia}\n\n` +
      `Olá, *${orc.clienteNome}*!\n` +
      `Conforme solicitado, segue o detalhamento do seu orçamento *Nº ${orc.numero}*:\n\n` +
      `🛒 *Itens:*\n${itensTexto}\n\n` +
      (orc.desconto > 0 ? `🎟 *Desconto:* R$ ${Number(orc.desconto).toFixed(2)}\n` : '') +
      `💰 *VALOR TOTAL:* R$ ${Number(orc.total).toFixed(2)}\n` +
      `📅 *Validade:* ${new Date(orc.dataValidade + 'T00:00:00').toLocaleDateString('pt-BR')}\n` +
      (orc.observacoes ? `\n💬 *Observações:* ${orc.observacoes}\n` : '') +
      (empresa.chavePix ? `\n🔑 *Chave PIX para pagamento:* ${empresa.chavePix}\n` : '') +
      `\nAguardamos sua aprovação!`;
  },

  // Envio de Recibo
  recibo: (rec, empresa) => {
    return `🧾 *RECIBO DE PAGAMENTO* - ${empresa.nomeFantasia}\n\n` +
      `Recebemos de *${rec.clienteNome}* a quantia de *R$ ${Number(rec.valor).toFixed(2)}*.\n\n` +
      `📋 *Nº do Recibo:* ${rec.numero}\n` +
      `🗓 *Data:* ${new Date(rec.dataEmissao + 'T00:00:00').toLocaleDateString('pt-BR')}\n` +
      `💳 *Forma de Pagamento:* ${rec.formaPagamento}\n` +
      `📝 *Referente a:* ${rec.referenteA}\n\n` +
      `Obrigado pela preferência! 🙏\n` +
      `*${empresa.nomeFantasia}*`;
  }
};
