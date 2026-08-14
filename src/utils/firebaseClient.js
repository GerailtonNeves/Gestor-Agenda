/**
 * Módulo de Sincronização em Nuvem Google Firebase Realtime Database para Escritório de Bolso
 * Sincroniza Agendamentos, Clientes, Produtos, Vendas, Financeiro e Empresa
 * em tempo real entre Computador, Celular e Tablet.
 */

const STORAGE_KEY_FIREBASE = 'EB_FIREBASE_CONFIG_V1';

export const firebaseApi = {
  // Retorna configurações do Firebase salvas no LocalStorage ou Empresa
  getConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FIREBASE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.databaseUrl) return parsed;
      }

      // Fallback: verificar se a URL está salva nos dados da Empresa
      const empresaStr = localStorage.getItem('eb_empresa_config_v1');
      if (empresaStr) {
        const emp = JSON.parse(empresaStr);
        if (emp && emp.firebaseUrl) {
          return {
            databaseUrl: emp.firebaseUrl,
            authSecret: emp.firebaseAuth || '',
            ativo: true,
            ultimaSincronizacao: new Date().toISOString()
          };
        }
      }
    } catch (e) {
      console.error('Erro ao ler config do Firebase:', e);
    }
    return {
      databaseUrl: '',
      authSecret: '',
      ativo: false,
      ultimaSincronizacao: null
    };
  },

  // Salva configurações do Firebase
  saveConfig(config) {
    try {
      let url = (config.databaseUrl || '').trim().replace(/\/$/, '');
      if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }

      const payload = {
        databaseUrl: url,
        authSecret: (config.authSecret || '').trim(),
        ativo: Boolean(url),
        ultimaSincronizacao: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY_FIREBASE, JSON.stringify(payload));
      return payload;
    } catch (e) {
      console.error('Erro ao salvar config do Firebase:', e);
      return null;
    }
  },

  // Monta a URL de endpoint REST do Firebase
  buildUrl(endpoint) {
    const cfg = this.getConfig();
    if (!cfg.databaseUrl) return null;

    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    let finalUrl = `${cfg.databaseUrl}${path}.json`;
    if (cfg.authSecret) {
      finalUrl += `?auth=${encodeURIComponent(cfg.authSecret)}`;
    }
    return finalUrl;
  },

  // Testa a Conexão com o Firebase
  async testConnection(customConfig = null) {
    const cfg = customConfig || this.getConfig();
    let url = (cfg.databaseUrl || '').trim().replace(/\/$/, '');
    if (!url) {
      return { ok: false, msg: 'Por favor, informe a URL do seu Banco Firebase (ex: https://seu-projeto-default-rtdb.firebaseio.com).' };
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    try {
      let testUrl = `${url}/eb_empresa.json`;
      if (cfg.authSecret) {
        testUrl += `?auth=${encodeURIComponent(cfg.authSecret)}`;
      }

      const res = await fetch(testUrl, { method: 'GET' });

      if (res.ok) {
        return { ok: true, msg: '⚡ Conexão com o Google Firebase estabelecida com sucesso! Sincronização pronta.' };
      } else {
        const errText = await res.text();
        if (res.status === 401 || res.status === 403) {
          return { 
            ok: false, 
            msg: '⚠️ Regras de Segurança do Firebase bloqueando acesso. No console do Firebase (Realtime Database -> Regras), defina ".read": true e ".write": true.' 
          };
        }
        return { ok: false, msg: `⚠️ Resposta do Firebase (${res.status}): ${errText}` };
      }
    } catch (err) {
      return { ok: false, msg: `⚠️ Erro ao conectar ao Firebase: ${err.message}. Verifique a URL digitada.` };
    }
  },

  // Buscar todos os registros de uma pasta/tabela do Firebase
  async fetchTable(tableName) {
    const cfg = this.getConfig();
    if (!cfg.ativo) return null;

    const url = this.buildUrl(tableName);
    if (!url) return null;

    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (!data) return [];
        if (Array.isArray(data)) return data.filter(Boolean);
        if (typeof data === 'object') return Object.values(data).filter(Boolean);
      }
      return null;
    } catch (err) {
      console.warn(`[Firebase] Erro ao buscar ${tableName}:`, err);
      return null;
    }
  },

  // Salvar/Sincronizar Lista Completa de Registros no Firebase (Bulk Sync)
  async syncFullList(tableName, list) {
    const cfg = this.getConfig();
    if (!cfg.ativo) return false;

    const url = this.buildUrl(tableName);
    if (!url) return false;

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(list)
      });

      return res.ok;
    } catch (err) {
      console.warn(`[Firebase] Erro ao salvar ${tableName}:`, err);
      return false;
    }
  }
};
