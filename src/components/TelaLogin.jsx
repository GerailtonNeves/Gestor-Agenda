import React, { useState } from 'react';
import { Lock, Mail, User, KeyRound, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, AlertCircle, Building } from 'lucide-react';

const STORAGE_AUTH_KEY = 'eb_user_auth_v1';
const STORAGE_SESSION_KEY = 'eb_user_session_v1';

export const authApi = {
  // Obter Usuário Cadastrado
  getRegisteredUser() {
    try {
      const data = localStorage.getItem(STORAGE_AUTH_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Erro ao ler usuário cadastrado:', e);
    }
    return null;
  },

  // Verificar se o Usuário Está Logado
  isAuthenticated() {
    try {
      const session = localStorage.getItem(STORAGE_SESSION_KEY);
      if (session) {
        const parsed = JSON.parse(session);
        return parsed && parsed.active === true;
      }
    } catch (e) {
      console.error('Erro ao ler sessão:', e);
    }
    return false;
  },

  // Cadastrar Novo Usuário
  register(nome, email, senha) {
    try {
      const userData = {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha: senha.trim(),
        criadoEm: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(userData));
      
      // Auto-Login
      this.setSession(userData);
      return { ok: true, msg: 'Conta criada com sucesso! Seja bem-vindo(a).' };
    } catch (e) {
      return { ok: false, msg: 'Erro ao criar conta no dispositivo.' };
    }
  },

  // Realizar Login
  login(email, senha) {
    const user = this.getRegisteredUser();
    if (!user) {
      return { ok: false, msg: 'Nenhuma conta cadastrada neste dispositivo. Por favor, clique em "Criar Conta".' };
    }

    if (user.email.toLowerCase() === email.trim().toLowerCase() && user.senha === senha.trim()) {
      this.setSession(user);
      return { ok: true, msg: `Bem-vindo de volta, ${user.nome.split(' ')[0]}!` };
    }

    return { ok: false, msg: 'E-mail ou Senha incorretos. Tente novamente.' };
  },

  // Redefinir Senha (Esqueceu a Senha)
  resetPassword(email, novaSenha) {
    const user = this.getRegisteredUser();
    if (!user) {
      return { ok: false, msg: 'Nenhuma conta encontrada com este e-mail.' };
    }

    if (user.email.toLowerCase() !== email.trim().toLowerCase()) {
      return { ok: false, msg: 'E-mail não corresponde ao cadastro.' };
    }

    user.senha = novaSenha.trim();
    localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(user));
    return { ok: true, msg: 'Senha redefinida com sucesso! Você já pode entrar com a nova senha.' };
  },

  // Salvar Sessão Ativa
  setSession(user) {
    const sessionData = {
      active: true,
      email: user.email,
      nome: user.nome,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionData));
  },

  // Encerrar Sessão (Logout)
  logout() {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  }
};

export default function TelaLogin({ onLoginSuccess }) {
  const [modo, setModo] = useState(() => authApi.getRegisteredUser() ? 'login' : 'cadastro');
  
  // Form States
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // UI Feedback
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);

  const handleSubmitLogin = (e) => {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (!email.trim() || !senha.trim()) {
      setErro('Por favor, preencha o e-mail e a senha.');
      return;
    }

    const res = authApi.login(email, senha);
    if (res.ok) {
      setSucesso(res.msg);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
      }, 700);
    } else {
      setErro(res.msg);
    }
  };

  const handleSubmitCadastro = (e) => {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (!nome.trim() || !email.trim() || !senha.trim()) {
      setErro('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (senha.length < 4) {
      setErro('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem. Digite novamente.');
      return;
    }

    const res = authApi.register(nome, email, senha);
    if (res.ok) {
      setSucesso(res.msg);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
      }, 700);
    } else {
      setErro(res.msg);
    }
  };

  const handleSubmitRecuperar = (e) => {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (!email.trim() || !senha.trim()) {
      setErro('Por favor, informe seu e-mail cadastrado e a nova senha.');
      return;
    }

    if (senha.length < 4) {
      setErro('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }

    const res = authApi.resetPassword(email, senha);
    if (res.ok) {
      setSucesso(res.msg);
      setTimeout(() => {
        setModo('login');
        setSenha('');
      }, 1500);
    } else {
      setErro(res.msg);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e3a8a 100%)',
      padding: '20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '36px 30px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        animation: 'fadeIn 0.4s ease'
      }}>

        {/* LOGO & CÓDIGO DE BOAS-VINDAS */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '68px',
            height: '68px',
            margin: '0 auto 12px auto',
            borderRadius: '20px',
            background: 'var(--blue-gradient)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(37, 99, 235, 0.35)',
            border: '2px solid rgba(255,255,255,0.4)'
          }}>
            <Lock size={32} />
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--blue-primary)', margin: 0 }}>
            Escritório de Bolso
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
            {modo === 'login' && 'Digite seu e-mail e senha para acessar o sistema.'}
            {modo === 'cadastro' && 'Crie sua conta para proteger seus dados de gestão.'}
            {modo === 'recuperar' && 'Recupere o acesso criando uma nova senha.'}
          </p>
        </div>

        {/* MENSAGENS DE ERRO E SUCESSO */}
        {erro && (
          <div style={{
            background: '#fef2f2',
            color: '#991b1b',
            border: '1.5px solid #fca5a5',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '0.86rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{erro}</span>
          </div>
        )}

        {sucesso && (
          <div style={{
            background: '#f0fdf4',
            color: '#166534',
            border: '1.5px solid #86efac',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '0.86rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{sucesso}</span>
          </div>
        )}

        {/* 1. MODO: LOGIN */}
        {modo === 'login' && (
          <form onSubmit={handleSubmitLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 800, color: '#334155' }}>Seu E-mail Cadastrado</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="exemplo@seuemail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '40px', height: '46px', fontSize: '0.94rem' }}
                  required
                />
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ fontWeight: 800, color: '#334155', margin: 0 }}>Sua Senha</label>
                <button
                  type="button"
                  onClick={() => { setErro(null); setSucesso(null); setModo('recuperar'); }}
                  style={{ background: 'none', border: 'none', color: '#ca8a04', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  Esqueceu a Senha?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  style={{ paddingLeft: '40px', height: '46px', fontSize: '0.94rem' }}
                  required
                />
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-orange"
              style={{
                height: '48px',
                fontSize: '1rem',
                fontWeight: 800,
                borderRadius: '12px',
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              Entrar no Sistema <ArrowRight size={20} />
            </button>
          </form>
        )}

        {/* 2. MODO: CADASTRO */}
        {modo === 'cadastro' && (
          <form onSubmit={handleSubmitCadastro} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 800, color: '#334155' }}>Nome Completo / Empresa *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Gerailton Neves"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  style={{ paddingLeft: '40px', height: '46px', fontSize: '0.94rem' }}
                  required
                />
                <User size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 800, color: '#334155' }}>E-mail Comercial *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '40px', height: '46px', fontSize: '0.94rem' }}
                  required
                />
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 800, color: '#334155' }}>Criar Senha de Acesso *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Mínimo 4 caracteres"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  style={{ paddingLeft: '40px', height: '46px', fontSize: '0.94rem' }}
                  required
                />
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 800, color: '#334155' }}>Confirmar Senha *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Repita a mesma senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  style={{ paddingLeft: '40px', height: '46px', fontSize: '0.94rem' }}
                  required
                />
                <KeyRound size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-orange"
              style={{
                height: '48px',
                fontSize: '1rem',
                fontWeight: 800,
                borderRadius: '12px',
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              Criar Conta e Acessar <Sparkles size={20} />
            </button>
          </form>
        )}

        {/* 3. MODO: RECUPERAR SENHA */}
        {modo === 'recuperar' && (
          <form onSubmit={handleSubmitRecuperar} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 800, color: '#334155' }}>E-mail Cadastrado</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Informe o e-mail cadastrado"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '40px', height: '46px', fontSize: '0.94rem' }}
                  required
                />
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 800, color: '#334155' }}>Nova Senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Digite sua nova senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  style={{ paddingLeft: '40px', height: '46px', fontSize: '0.94rem' }}
                  required
                />
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#94a3b8' }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-orange"
              style={{
                height: '48px',
                fontSize: '1rem',
                fontWeight: 800,
                borderRadius: '12px',
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              Redefinir Senha <CheckCircle2 size={20} />
            </button>
          </form>
        )}

        {/* BOTTOM RODAPÉ ALTERNADOR */}
        <div style={{ textAlign: 'center', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
          {modo === 'login' ? (
            <p style={{ fontSize: '0.86rem', color: '#475569', margin: 0 }}>
              Ainda não tem conta?{' '}
              <button
                type="button"
                onClick={() => { setErro(null); setSucesso(null); setModo('cadastro'); }}
                style={{ background: 'none', border: 'none', color: 'var(--blue-primary)', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Criar Conta Grátis
              </button>
            </p>
          ) : (
            <p style={{ fontSize: '0.86rem', color: '#475569', margin: 0 }}>
              Já possui uma conta?{' '}
              <button
                type="button"
                onClick={() => { setErro(null); setSucesso(null); setModo('login'); }}
                style={{ background: 'none', border: 'none', color: 'var(--blue-primary)', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Voltar para o Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
