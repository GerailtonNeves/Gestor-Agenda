// Gerenciador e Gerador de Licenças do Sistema Escritório de Bolso (licenseUtils.js)

const LICENSE_KEY_STORAGE = 'eb_licenca_sistema_v1';
const LICENSE_CLIENTS_STORAGE = 'eb_licencias_clientes_v1';

// Estrutura Padrão Inicial da Licença Master
const DEFAULT_LICENSE = {
  chave: 'EB-VITALICIA-2026-OFICIAL',
  tipo: 'Vitalício (Ilimitado)',
  diasValidade: 9999,
  dataAtivacao: new Date().toISOString(),
  status: 'Ativo',
  clienteNome: 'Administrador Oficial'
};

// Licenças de Clientes Iniciais Registradas no Sistema
const DEFAULT_CLIENT_LICENSES = [
  {
    id: 'lic_cli_master',
    clienteNome: 'Administrador Oficial',
    clienteTelefone: '(11) 99999-9999',
    chave: 'EB-VITALICIA-2026-OFICIAL',
    diasValidade: 9999,
    tipo: 'Vitalício (Ilimitado)',
    dataCriacao: new Date().toISOString().split('T')[0],
    status: 'Ativo'
  }
];

export const licenseApi = {
  // Obter Licença Atual do Sistema Local
  getLicense: () => {
    try {
      const stored = localStorage.getItem(LICENSE_KEY_STORAGE);
      if (!stored) {
        localStorage.setItem(LICENSE_KEY_STORAGE, JSON.stringify(DEFAULT_LICENSE));
        return DEFAULT_LICENSE;
      }
      return JSON.parse(stored);
    } catch (e) {
      return DEFAULT_LICENSE;
    }
  },

  setLicense: (lic) => {
    try {
      localStorage.setItem(LICENSE_KEY_STORAGE, JSON.stringify(lic));
    } catch (e) {
      console.error("Erro ao salvar licença:", e);
    }
  },

  // Obter Lista de Clientes com Licença
  getLicencasClientes: () => {
    try {
      const stored = localStorage.getItem(LICENSE_CLIENTS_STORAGE);
      if (!stored) {
        localStorage.setItem(LICENSE_CLIENTS_STORAGE, JSON.stringify(DEFAULT_CLIENT_LICENSES));
        return DEFAULT_CLIENT_LICENSES;
      }
      return JSON.parse(stored);
    } catch (e) {
      return DEFAULT_CLIENT_LICENSES;
    }
  },

  saveLicencasClientes: (lista) => {
    try {
      localStorage.setItem(LICENSE_CLIENTS_STORAGE, JSON.stringify(lista));
    } catch (e) {
      console.error("Erro ao salvar lista de licenças:", e);
    }
  },

  // VERIFICAÇÃO INSTANTÂNEA SE O SISTEMA ESTÁ BLOQUEADO POR EXPIRAÇÃO OU PELO ADM
  isSystemBlocked: () => {
    const lic = licenseApi.getLicense();
    if (!lic) return true;
    if (lic.status === 'Bloqueado') return true;

    // Se a licença ativa for de cliente, verifica na lista de clientes se ela foi Bloqueada
    if (lic.chave && lic.chave !== 'EB-VITALICIA-2026-OFICIAL') {
      const listaClientes = licenseApi.getLicencasClientes();
      const cliFound = listaClientes.find(l => l.chave && l.chave.trim().toUpperCase() === lic.chave.trim().toUpperCase());
      if (cliFound && cliFound.status === 'Bloqueado') {
        return true;
      }
    }

    // Licença Vitalícia nunca expira
    if (lic.diasValidade >= 9000 || lic.tipo.includes('Vitalício')) return false;

    // Se possui dataExpiracao em milissegundos/ISO
    if (lic.dataExpiracao) {
      const expTime = new Date(lic.dataExpiracao).getTime();
      if (Date.now() > expTime) {
        return true;
      }
    } else {
      // Cálculo por dias de validade a partir da dataAtivacao
      const dataAtiv = new Date(lic.dataAtivacao).getTime();
      const duracaoMs = (lic.diasValidade || 30) * 24 * 60 * 60 * 1000;
      if (Date.now() > (dataAtiv + duracaoMs)) {
        return true;
      }
    }

    return false;
  },

  // Gerador de Chaves Únicas e Formatadas com Suporte a 5 Minutos e 24 Horas
  generateKey: (opcaoValidade = '30') => {
    const randomHex1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomHex2 = Math.random().toString(36).substring(2, 6).toUpperCase();

    let prefix = 'MEN-30D';
    if (opcaoValidade === '5MIN') prefix = 'TESTE-5MIN';
    else if (opcaoValidade === '24H') prefix = 'TESTE-24H';
    else if (opcaoValidade === '90') prefix = 'TRI-90D';
    else if (opcaoValidade === '365') prefix = 'ANU-365D';
    else if (opcaoValidade === '9999') prefix = 'VIT-UNLIMITED';

    return `EB-${prefix}-${randomHex1}-${randomHex2}`;
  },

  // VALIDAÇÃO RÍGIDA E ESTRITA DA CHAVE DE LICENÇA
  activateKey: (keyInput) => {
    if (!keyInput || typeof keyInput !== 'string' || !keyInput.trim()) {
      return { success: false, message: '❌ Digite todos os caracteres da chave de licença.' };
    }

    const keyUpper = keyInput.trim().toUpperCase();

    // 1. Verifica a chave master de fábrica
    if (keyUpper === 'EB-VITALICIA-2026-OFICIAL') {
      const novaLicensa = {
        chave: keyUpper,
        tipo: 'Vitalício (Ilimitado)',
        diasValidade: 9999,
        dataAtivacao: new Date().toISOString(),
        status: 'Ativo',
        clienteNome: 'Administrador Oficial'
      };
      licenseApi.setLicense(novaLicensa);
      return { success: true, message: `✅ Licença Vitalícia Master ativada com sucesso!`, license: novaLicensa };
    }

    // 2. Busca na lista de clientes cadastrados por correspondência 100% EXATA dos caracteres
    const listaClientes = licenseApi.getLicencasClientes();
    const licEncontrada = listaClientes.find(l => l.chave && l.chave.trim().toUpperCase() === keyUpper);

    if (!licEncontrada) {
      return {
        success: false,
        message: '❌ Chave de Licença INCORRETA ou INEXISTENTE! Verifique todos os caracteres digitados (letras, números e traços) e tente novamente.'
      };
    }

    // 3. Se encontrada, verifica se está BLOQUEADA pelo administrador
    if (licEncontrada.status === 'Bloqueado') {
      return {
        success: false,
        message: '🚫 Esta Chave de Licença está BLOQUEADA pelo Administrador do Sistema. Entre em contato para liberação.'
      };
    }

    // 4. Calcular data de expiração exata em milissegundos
    let duracaoMs = (licEncontrada.diasValidade || 30) * 24 * 60 * 60 * 1000;
    if (licEncontrada.tipo.includes('5 Minutos') || licEncontrada.opcaoValidade === '5MIN') {
      duracaoMs = 5 * 60 * 1000; // 5 minutos
    } else if (licEncontrada.tipo.includes('24 Horas') || licEncontrada.opcaoValidade === '24H') {
      duracaoMs = 24 * 60 * 60 * 1000; // 24 horas
    }

    const dataAtiv = new Date();
    const dataExp = new Date(dataAtiv.getTime() + duracaoMs);

    const novaLicensa = {
      chave: keyUpper,
      tipo: licEncontrada.tipo || 'Mensal (30 dias)',
      diasValidade: licEncontrada.diasValidade || 30,
      dataAtivacao: dataAtiv.toISOString(),
      dataExpiracao: dataExp.toISOString(),
      status: 'Ativo',
      clienteNome: licEncontrada.clienteNome || 'Cliente'
    };

    licenseApi.setLicense(novaLicensa);
    return {
      success: true,
      message: `✅ Licença "${licEncontrada.tipo}" de "${licEncontrada.clienteNome}" ativada com sucesso!`,
      license: novaLicensa
    };
  },

  // Retorna texto amigável do tempo restante
  getDaysRemainingText: () => {
    const lic = licenseApi.getLicense();
    if (!lic || lic.diasValidade >= 9000 || (lic.tipo && lic.tipo.includes('Vitalício'))) return 'VITALÍCIO ⭐';

    let expTime = 0;
    if (lic.dataExpiracao) {
      expTime = new Date(lic.dataExpiracao).getTime();
    } else {
      const ativ = new Date(lic.dataAtivacao).getTime();
      expTime = ativ + (lic.diasValidade || 30) * 24 * 60 * 60 * 1000;
    }

    const diffMs = expTime - Date.now();
    if (diffMs <= 0) return 'EXPIRADO (0m)';

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 60) return `${diffMinutes} Minutos Restantes ⏱️`;

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 48) return `${diffHours} Horas Restantes ⏳`;

    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return `${diffDays} Dias Restantes`;
  },

  getDaysRemaining: () => {
    const text = licenseApi.getDaysRemainingText();
    if (text.includes('VITALÍCIO')) return 9999;
    if (text.includes('EXPIRADO')) return 0;
    return 1;
  }
};
