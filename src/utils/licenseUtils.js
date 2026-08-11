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

  // VERIFICAÇÃO INSTANTÂNEA SE O SISTEMA ESTÁ BLOQUEADO
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

    // Verifica se os dias de validade expiraram
    const diasRestantes = licenseApi.getDaysRemaining();
    if (diasRestantes <= 0 && lic.diasValidade < 9000) {
      return true;
    }

    return false;
  },

  // Gerador de Chaves Únicas e Formatadas
  generateKey: (dias = 30) => {
    const randomHex1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomHex2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const prefix = dias >= 9000 ? 'VIT' : dias >= 365 ? 'ANU' : dias >= 90 ? 'TRI' : 'MEN';
    const key = `EB-${prefix}-${dias}D-${randomHex1}-${randomHex2}`;
    return key;
  },

  // VALIDAÇÃO RÍGIDA E ESTRITA DA CHAVE DE LICENÇA (DIFERENCIA CARACTERES INCORRETOS)
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

    // 4. Se encontrou e está Ativa, realiza a ativação
    let tipoStr = licEncontrada.tipo || 'Mensal (30 dias)';
    let dias = licEncontrada.diasValidade || 30;

    const novaLicensa = {
      chave: keyUpper,
      tipo: tipoStr,
      diasValidade: dias,
      dataAtivacao: new Date().toISOString(),
      status: 'Ativo',
      clienteNome: licEncontrada.clienteNome || 'Cliente'
    };

    licenseApi.setLicense(novaLicensa);
    return {
      success: true,
      message: `✅ Licença do cliente "${licEncontrada.clienteNome}" (${tipoStr}) ativada com sucesso!`,
      license: novaLicensa
    };
  },

  // Calcula Dias Restantes do Sistema
  getDaysRemaining: () => {
    const lic = licenseApi.getLicense();
    if (!lic || lic.diasValidade >= 9000) return 9999; // Vitalício

    const dataAtiv = new Date(lic.dataAtivacao);
    const dataExpira = new Date(dataAtiv);
    dataExpira.setDate(dataExpira.getDate() + lic.diasValidade);

    const hoje = new Date();
    const diffTime = dataExpira - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
};
