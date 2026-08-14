/**
 * Módulo de Sincronização em Nuvem Supabase para Escritório de Bolso
 * Sincroniza Agendamentos, Clientes, Produtos, Vendas, Financeiro e Empresa
 * em tempo real entre Computador, Celular e Tablet.
 */

const STORAGE_KEY_SUPABASE = 'EB_SUPABASE_CONFIG_V1';

export const supabaseApi = {
  // Retorna configurações do Supabase salvas no LocalStorage ou Padrão
  getConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUPABASE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Erro ao ler config do Supabase:', e);
    }
    return {
      url: '',
      key: '',
      ativo: false,
      ultimaSincronizacao: null
    };
  },

  // Salva configurações do Supabase
  saveConfig(config) {
    try {
      const payload = {
        url: (config.url || '').trim().replace(/\/$/, ''),
        key: (config.key || '').trim(),
        ativo: Boolean(config.url && config.key),
        ultimaSincronizacao: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY_SUPABASE, JSON.stringify(payload));
      return payload;
    } catch (e) {
      console.error('Erro ao salvar config do Supabase:', e);
      return null;
    }
  },

  // Testa a Conexão com o Supabase
  async testConnection(customConfig = null) {
    const cfg = customConfig || this.getConfig();
    if (!cfg.url || !cfg.key) {
      return { ok: false, msg: 'Por favor, informe a URL do Projeto e a Chave Anon (API Key) do Supabase.' };
    }

    try {
      const res = await fetch(`${cfg.url}/rest/v1/eb_empresa?select=count`, {
        method: 'GET',
        headers: {
          'apikey': cfg.key,
          'Authorization': `Bearer ${cfg.key}`,
          'Range': '0-0'
        }
      });

      if (res.ok || res.status === 206 || res.status === 416) {
        return { ok: true, msg: '⚡ Conexão com a Nuvem Supabase estabelecida com sucesso!' };
      } else {
        const errorText = await res.text();
        if (res.status === 404 || errorText.includes('relation') || errorText.includes('does not exist')) {
          return { ok: true, msg: '⚡ Conectado ao Supabase! Lembre-se de rodar o Script SQL para criar as tabelas.' };
        }
        return { ok: false, msg: `⚠️ Erro de Resposta Supabase (${res.status}): ${errorText}` };
      }
    } catch (err) {
      return { ok: false, msg: `⚠️ Erro ao conectar à URL do Supabase: ${err.message}` };
    }
  },

  // Buscar todos os registros de uma tabela
  async fetchTable(tableName) {
    const cfg = this.getConfig();
    if (!cfg.ativo || !cfg.url || !cfg.key) return null;

    try {
      const res = await fetch(`${cfg.url}/rest/v1/${tableName}?select=*`, {
        method: 'GET',
        headers: {
          'apikey': cfg.key,
          'Authorization': `Bearer ${cfg.key}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        // Mapear campo payload json se existir
        return data.map(item => item.payload ? (typeof item.payload === 'string' ? JSON.parse(item.payload) : item.payload) : item);
      }
      return null;
    } catch (err) {
      console.warn(`[Supabase] Erro ao buscar tabela ${tableName}:`, err);
      return null;
    }
  },

  // Inserir ou Atualizar Registro (Upsert)
  async upsertRecord(tableName, record) {
    const cfg = this.getConfig();
    if (!cfg.ativo || !cfg.url || !cfg.key || !record) return false;

    try {
      const idStr = String(record.id || Date.now());
      const bodyPayload = [{
        id: idStr,
        payload: record,
        updated_at: new Date().toISOString()
      }];

      const res = await fetch(`${cfg.url}/rest/v1/${tableName}`, {
        method: 'POST',
        headers: {
          'apikey': cfg.key,
          'Authorization': `Bearer ${cfg.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(bodyPayload)
      });

      return res.ok || res.status === 201 || res.status === 204;
    } catch (err) {
      console.warn(`[Supabase] Erro ao sincronizar item em ${tableName}:`, err);
      return false;
    }
  },

  // Salvar Lista Completa de Registros na Nuvem (Bulk Sync)
  async syncFullList(tableName, list) {
    const cfg = this.getConfig();
    if (!cfg.ativo || !cfg.url || !cfg.key || !Array.isArray(list)) return false;

    try {
      const bodyPayload = list.map(item => ({
        id: String(item.id || Date.now()),
        payload: item,
        updated_at: new Date().toISOString()
      }));

      if (bodyPayload.length === 0) return true;

      const res = await fetch(`${cfg.url}/rest/v1/${tableName}`, {
        method: 'POST',
        headers: {
          'apikey': cfg.key,
          'Authorization': `Bearer ${cfg.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(bodyPayload)
      });

      return res.ok || res.status === 201 || res.status === 204;
    } catch (err) {
      console.warn(`[Supabase] Erro ao realizar bulk sync na tabela ${tableName}:`, err);
      return false;
    }
  },

  // Excluir Registro por ID
  async deleteRecord(tableName, recordId) {
    const cfg = this.getConfig();
    if (!cfg.ativo || !cfg.url || !cfg.key || !recordId) return false;

    try {
      const res = await fetch(`${cfg.url}/rest/v1/${tableName}?id=eq.${encodeURIComponent(String(recordId))}`, {
        method: 'DELETE',
        headers: {
          'apikey': cfg.key,
          'Authorization': `Bearer ${cfg.key}`
        }
      });

      return res.ok || res.status === 204;
    } catch (err) {
      console.warn(`[Supabase] Erro ao excluir registro de ${tableName}:`, err);
      return false;
    }
  },

  // Retorna Script SQL de Inicialização Pronta para Criar no Supabase SQL Editor
  getSqlSetupScript() {
    return `-- ==========================================================================
-- SCRIPT SQL DE INICIALIZAÇÃO DAS TABELAS DO ESCRITÓRIO DE BOLSO NO SUPABASE
-- Execute este script no menu SQL Editor do seu projeto no Supabase (https://supabase.com)
-- ==========================================================================

-- 1. Tabela de Agenda e Compromissos
CREATE TABLE IF NOT EXISTS public.eb_agenda (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Clientes
CREATE TABLE IF NOT EXISTS public.eb_clientes (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Produtos e Serviços
CREATE TABLE IF NOT EXISTS public.eb_produtos (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Registro de Vendas
CREATE TABLE IF NOT EXISTS public.eb_vendas (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela Financeiro (Pagar/Receber)
CREATE TABLE IF NOT EXISTS public.eb_financeiro (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Orçamentos
CREATE TABLE IF NOT EXISTS public.eb_orcamentos (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabela de Recibos
CREATE TABLE IF NOT EXISTS public.eb_recibos (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabela de Tarefas
CREATE TABLE IF NOT EXISTS public.eb_tarefas (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabela de Configurações da Empresa
CREATE TABLE IF NOT EXISTS public.eb_empresa (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DESABILITAR ROW LEVEL SECURITY (RLS) PARA ACESSO ANÔNIMO DIRETO
ALTER TABLE public.eb_agenda DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.eb_clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.eb_produtos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.eb_vendas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.eb_financeiro DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.eb_orcamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.eb_recibos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.eb_tarefas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.eb_empresa DISABLE ROW LEVEL SECURITY;
`;
  }
};
