// Camada de Armazenamento LocalStorage (storage.js)
// Sistema Escritório de Bolso - 100% Livre de Dados Fictícios de Terceiros

export const STORAGE_KEYS = {
  EMPRESA: 'eb_empresa_config_v1',
  CLIENTES: 'eb_clientes_v1',
  PRODUTOS: 'eb_produtos_v1',
  AGENDA: 'eb_agenda_v1',
  FINANCEIRO: 'eb_financeiro_v1',
  ORCAMENTOS: 'eb_orcamentos_v1',
  RECIBOS: 'eb_recibos_v1',
  VENDAS: 'eb_vendas_v1'
};

export const safeFormatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const parts = String(dateStr).split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
};

// Dados Padrão NULOS / VAZIOS (NENHUM Dado Fictício ou de Terceiros)
const DEFAULT_EMPRESA = {
  nomeFantasia: '',
  razaoSocial: '',
  cnpj: '',
  telefone: '',
  whatsapp: '',
  email: '',
  endereco: '',
  chavePix: '',
  logo: '',
  assinatura: ''
};

const DEFAULT_CLIENTES = [];
const DEFAULT_PRODUTOS = [];
const DEFAULT_AGENDA = [];
const DEFAULT_FINANCEIRO = [];
const DEFAULT_ORCAMENTOS = [];
const DEFAULT_RECIBOS = [];
const DEFAULT_VENDAS = [];

// Função Utilitária Interna para obter do LocalStorage com fallback limpo
const getStorageData = (key, defaultVal) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultVal;
    return JSON.parse(item);
  } catch (e) {
    console.error(`Erro ao carregar chave ${key} do localStorage:`, e);
    return defaultVal;
  }
};

// Função Utilitária Interna para salvar no LocalStorage
const setStorageData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Erro ao salvar chave ${key} no localStorage:`, e);
  }
};

export const storageApi = {
  // Empresa
  getEmpresa: () => getStorageData(STORAGE_KEYS.EMPRESA, DEFAULT_EMPRESA),
  saveEmpresa: (dados) => setStorageData(STORAGE_KEYS.EMPRESA, dados),
  setEmpresa: (dados) => setStorageData(STORAGE_KEYS.EMPRESA, dados),

  // Clientes
  getClientes: () => getStorageData(STORAGE_KEYS.CLIENTES, DEFAULT_CLIENTES),
  saveClientes: (lista) => setStorageData(STORAGE_KEYS.CLIENTES, lista),
  setClientes: (lista) => setStorageData(STORAGE_KEYS.CLIENTES, lista),

  // Produtos
  getProdutos: () => getStorageData(STORAGE_KEYS.PRODUTOS, DEFAULT_PRODUTOS),
  saveProdutos: (lista) => setStorageData(STORAGE_KEYS.PRODUTOS, lista),
  setProdutos: (lista) => setStorageData(STORAGE_KEYS.PRODUTOS, lista),

  // Agenda
  getAgenda: () => getStorageData(STORAGE_KEYS.AGENDA, DEFAULT_AGENDA),
  saveAgenda: (lista) => setStorageData(STORAGE_KEYS.AGENDA, lista),
  setAgenda: (lista) => setStorageData(STORAGE_KEYS.AGENDA, lista),

  // Financeiro
  getFinanceiro: () => getStorageData(STORAGE_KEYS.FINANCEIRO, DEFAULT_FINANCEIRO),
  saveFinanceiro: (lista) => setStorageData(STORAGE_KEYS.FINANCEIRO, lista),
  setFinanceiro: (lista) => setStorageData(STORAGE_KEYS.FINANCEIRO, lista),

  // Orçamentos
  getOrcamentos: () => getStorageData(STORAGE_KEYS.ORCAMENTOS, DEFAULT_ORCAMENTOS),
  saveOrcamentos: (lista) => setStorageData(STORAGE_KEYS.ORCAMENTOS, lista),
  setOrcamentos: (lista) => setStorageData(STORAGE_KEYS.ORCAMENTOS, lista),

  // Recibos
  getRecibos: () => getStorageData(STORAGE_KEYS.RECIBOS, DEFAULT_RECIBOS),
  saveRecibos: (lista) => setStorageData(STORAGE_KEYS.RECIBOS, lista),
  setRecibos: (lista) => setStorageData(STORAGE_KEYS.RECIBOS, lista),

  // Vendas (Histórico de Vendas)
  getVendas: () => getStorageData(STORAGE_KEYS.VENDAS, DEFAULT_VENDAS),
  saveVendas: (lista) => setStorageData(STORAGE_KEYS.VENDAS, lista),
  setVendas: (lista) => setStorageData(STORAGE_KEYS.VENDAS, lista),

  // Limpar Todos os Dados Fictícios de Terceiros e Manter o Sistema 100% Limpo
  clearAllData: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
      window.location.reload();
    } catch (e) {
      console.error("Erro ao limpar os dados:", e);
    }
  }
};
