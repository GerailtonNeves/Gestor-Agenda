import React, { useState, useRef, useEffect } from 'react';
import { Building, Save, Upload, CheckCircle, RefreshCw, Trash2, PenTool, Eraser, UserCheck, Flame, ShieldCheck, ExternalLink, HelpCircle } from 'lucide-react';
import { storageApi } from '../utils/storage';
import { firebaseApi } from '../utils/firebaseClient';

export default function EmpresaConfig({ empresa = {}, onSaveEmpresa }) {
  const [formData, setFormData] = useState({
    nomeFantasia: empresa.nomeFantasia || '',
    razaoSocial: empresa.razaoSocial || '',
    cnpj: empresa.cnpj || '',
    telefone: empresa.telefone || '',
    whatsapp: empresa.whatsapp || '',
    email: empresa.email || '',
    cidadeUf: empresa.cidadeUf || empresa.cidade || 'São Paulo - SP',
    nomeGerente: empresa.nomeGerente || '',
    nomeFuncionario: empresa.nomeFuncionario || '',
    cargoFuncionario: empresa.cargoFuncionario || '',
    endereco: empresa.endereco || '',
    chavePix: empresa.chavePix || '',
    logo: empresa.logo || '',
    assinatura: empresa.assinatura || ''
  });

  // Estado das configurações do Firebase na Nuvem
  const [firebaseData, setFirebaseData] = useState(() => firebaseApi.getConfig());
  const [testandoNuvem, setTestandoNuvem] = useState(false);
  const [statusNuvem, setStatusNuvem] = useState(null);

  const [notificacao, setNotificacao] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    setFormData({
      nomeFantasia: empresa.nomeFantasia || '',
      razaoSocial: empresa.razaoSocial || '',
      cnpj: empresa.cnpj || '',
      telefone: empresa.telefone || '',
      whatsapp: empresa.whatsapp || '',
      email: empresa.email || '',
      cidadeUf: empresa.cidadeUf || empresa.cidade || 'São Paulo - SP',
      nomeGerente: empresa.nomeGerente || '',
      nomeFuncionario: empresa.nomeFuncionario || '',
      cargoFuncionario: empresa.cargoFuncionario || '',
      endereco: empresa.endereco || '',
      chavePix: empresa.chavePix || '',
      logo: empresa.logo || '',
      assinatura: empresa.assinatura || ''
    });
  }, [empresa]);

  // Carregar Assinatura salva no Canvas ao abrir
  useEffect(() => {
    if (formData.assinatura && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = formData.assinatura;
    }
  }, [formData.assinatura]);

  const triggerToast = (msg) => {
    setNotificacao(msg);
    setTimeout(() => setNotificacao(null), 4000);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Upload da Logo
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('⚠️ A imagem da logo deve ter no máximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, logo: reader.result }));
      triggerToast('✅ Logo carregada com sucesso!');
    };
    reader.readAsDataURL(file);
  };

  // Upload da Foto/Imagem da Assinatura
  const handleAssinaturaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('⚠️ A imagem da assinatura deve ter no máximo 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, assinatura: reader.result }));
      triggerToast('✅ Imagem da Assinatura carregada com sucesso!');
    };
    reader.readAsDataURL(file);
  };

  // --- LÓGICA DA ASSINATURA NO CANVAS ---
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setFormData(prev => ({ ...prev, assinatura: dataUrl }));
    }
  };

  const handleLimparCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setFormData(prev => ({ ...prev, assinatura: '' }));
      triggerToast('✨ Campo de assinatura limpo!');
    }
  };

  // Salvar Empresa no LocalStorage + Firebase
  const handleSalvar = (e) => {
    e.preventDefault();
    storageApi.saveEmpresa(formData);
    if (onSaveEmpresa) onSaveEmpresa(formData);
    triggerToast('✅ Dados da Empresa e Assinatura salvos com sucesso!');
  };

  // Salvar Conexão do Firebase
  const handleSalvarFirebase = () => {
    const saved = firebaseApi.saveConfig(firebaseData);
    if (saved) {
      const novosDadosEmpresa = {
        ...formData,
        firebaseUrl: firebaseData.databaseUrl,
        firebaseAuth: firebaseData.authSecret
      };
      setFormData(novosDadosEmpresa);
      storageApi.saveEmpresa(novosDadosEmpresa);
      if (onSaveEmpresa) onSaveEmpresa(novosDadosEmpresa);

      triggerToast('🔥 Configurações do Google Firebase salvas no sistema!');
      handleTestarFirebase();
    }
  };

  // Testar Conexão Firebase
  const handleTestarFirebase = async () => {
    setTestandoNuvem(true);
    setStatusNuvem(null);
    const res = await firebaseApi.testConnection(firebaseData);
    setTestandoNuvem(false);
    setStatusNuvem(res);
  };

  const handleZerarSistema = () => {
    if (window.confirm('⚠️ ATENÇÃO: Deseja realmente ZERAR todos os dados do sistema? Esta ação não pode ser desfeita.')) {
      storageApi.clearAllData();
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Toast Alert */}
      {notificacao && (
        <div style={{
          position: 'fixed',
          top: '30px',
          right: '20px',
          background: 'var(--orange-gradient)',
          color: '#fff',
          padding: '14px 20px',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-orange-btn)',
          zIndex: 3000,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={20} /> <span>{notificacao}</span>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="card-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--blue-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={28} /> Configurações Gerais da Empresa
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Cadastre os <strong>dados da empresa, funcionários, gerente e conexão no Firebase</strong> para sincronizar tudo entre Computador e Celular!
          </p>
        </div>
      </div>

      <form onSubmit={handleSalvar} className="card card-blue" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        
        {/* BLOCO 1: SINCRONIZAÇÃO EM NUVEM GOOGLE FIREBASE (COMPUTADOR <-> CELULAR) */}
        <div style={{ background: 'linear-gradient(135deg, #fefce8 0%, #fff7ed 100%)', padding: '20px', borderRadius: '14px', border: '2px solid var(--orange-primary)', boxShadow: '0 4px 15px rgba(234, 179, 8, 0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ca8a04', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={24} style={{ color: '#ea580c' }} /> 🔥 Conexão Google Firebase em Nuvem (Sincronização Computador ↔ Celular)
            </h3>
            {firebaseData.ativo && (
              <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} /> Firebase Ativo
              </span>
            )}
          </div>

          <p style={{ fontSize: '0.84rem', color: '#1e293b', lineHeight: '1.5', marginBottom: '14px' }}>
            Conecte o seu banco 100% gratuito no <strong>Google Firebase (Realtime Database)</strong> para sincronizar agendamentos, clientes e finanças entre o <strong>computador</strong> e o <strong>celular</strong> sem precisar rodar scripts SQL!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 800, color: '#a16207' }}>URL do Banco Firebase Realtime Database *</label>
              <input 
                type="text" 
                className="form-input" 
                value={firebaseData.databaseUrl} 
                onChange={(e) => setFirebaseData(prev => ({ ...prev, databaseUrl: e.target.value }))} 
                placeholder="Ex: https://meu-projeto-default-rtdb.firebaseio.com" 
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 800, color: '#a16207' }}>Chave Secreta / Auth (Opcional)</label>
              <input 
                type="password" 
                className="form-input" 
                value={firebaseData.authSecret} 
                onChange={(e) => setFirebaseData(prev => ({ ...prev, authSecret: e.target.value }))} 
                placeholder="Deixe em branco se em modo de regras abertas" 
              />
            </div>
          </div>

          {/* Status do Teste */}
          {statusNuvem && (
            <div style={{
              background: statusNuvem.ok ? '#f0fdf4' : '#fee2e2',
              color: statusNuvem.ok ? '#15803d' : '#b91c1c',
              border: `1.5px solid ${statusNuvem.ok ? '#86efac' : '#fca5a5'}`,
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: 700,
              marginBottom: '14px'
            }}>
              {statusNuvem.msg}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button 
              type="button" 
              className="btn btn-orange btn-sm" 
              onClick={handleSalvarFirebase}
              style={{ fontWeight: 800 }}
            >
              <Save size={16} /> Salvar Conexão Firebase
            </button>

            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              onClick={handleTestarFirebase}
              disabled={testandoNuvem}
              style={{ fontWeight: 800 }}
            >
              <RefreshCw size={16} className={testandoNuvem ? 'spin' : ''} /> {testandoNuvem ? 'Testando Conexão...' : '⚡ Testar Conexão Firebase'}
            </button>

            <a 
              href="https://console.firebase.google.com/" 
              target="_blank" 
              rel="noreferrer"
              className="btn btn-sm"
              style={{ background: '#ffffff', color: '#ca8a04', border: '1.5px solid #fde047', fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <ExternalLink size={15} /> Criar Banco no Firebase Console
            </a>
          </div>

          {/* GUIA EM 3 PASSOS SIMPLES PARA CRIAR NO FIREBASE */}
          <div style={{ marginTop: '16px', background: '#ffffff', padding: '14px 16px', borderRadius: '10px', border: '1.5px solid #fde047', fontSize: '0.82rem', color: '#475569' }}>
            <div style={{ fontWeight: 800, color: '#ca8a04', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={16} /> Como Criar seu Banco de Dados no Firebase em 1 Minuto:
            </div>
            <ol style={{ margin: 0, paddingLeft: '18px', lineHeight: '1.6' }}>
              <li>Acesse <strong>console.firebase.google.com</strong> e crie um projeto gratuito com qualquer nome (ex: <em>Escritório de Bolso</em>).</li>
              <li>No menu lateral esquerdo, clique em <strong>Build ➔ Realtime Database ➔ Criar Banco de Dados</strong> (escolha qualquer região).</li>
              <li>Na aba <strong>Regras (Rules)</strong>, altere para <code>".read": true, ".write": true</code> e clique em <strong>Publicar</strong>.</li>
              <li>Copie o link gerado no topo (ex: <code>https://seu-projeto-default-rtdb.firebaseio.com</code>), cole no campo acima e clique em <strong>Salvar</strong>!</li>
            </ol>
          </div>
        </div>

        {/* BLOCO 2: DADOS DO FUNCIONÁRIO E GERENTE DA EMPRESA */}
        <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', padding: '18px 20px', borderRadius: '14px', border: '2px solid var(--blue-border)', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.05)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--blue-primary)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={22} /> Dados do Funcionário / Atendente & Gerente
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#1e293b', margin: '0 0 14px 0' }}>
            Estes dados serão estruturados com prioridade nas <strong>mensagens automáticas de WhatsApp, Recibos e Orçamentos</strong> geradas pelo sistema!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 800 }}>Nome do Funcionário / Atendente</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.nomeFuncionario} 
                onChange={(e) => handleChange('nomeFuncionario', e.target.value)} 
                placeholder="Ex: Luciana Neves" 
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 800 }}>Cargo do Funcionário</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.cargoFuncionario} 
                onChange={(e) => handleChange('cargoFuncionario', e.target.value)} 
                placeholder="Ex: Atendente Comercial / Gerente" 
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 800 }}>Nome do Gerente / Responsável</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.nomeGerente} 
                onChange={(e) => handleChange('nomeGerente', e.target.value)} 
                placeholder="Ex: Gerailton Neves" 
              />
            </div>
          </div>
        </div>

        {/* Upload de Logo */}
        <div className="form-group" style={{ background: 'var(--blue-ice-bg)', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1.5px dashed var(--blue-border)' }}>
          <label className="form-label" style={{ fontSize: '1.05rem', color: 'var(--blue-primary)' }}>Logo da Empresa</label>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Carregue a imagem da sua marca (PNG ou JPG) para ser impressa nos recibos e orçamentos.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            {formData.logo ? (
              <img src={formData.logo} alt="Logo da Empresa" style={{ maxHeight: '100px', maxWidth: '220px', objectFit: 'contain', borderRadius: '8px', border: '2px solid var(--blue-primary)', padding: '4px', background: '#fff' }} />
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--blue-light-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue-primary)', border: '2px dashed var(--blue-border)' }}>
                <Building size={36} />
              </div>
            )}

            <label className="btn btn-sm btn-primary" style={{ cursor: 'pointer' }}>
              <Upload size={14} /> Selecionar Foto da Logo
              <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* CAMPO DE ASSINATURA DIGITAL (UPLOAD DE FOTO OU DESENHO) */}
        <div className="form-group" style={{ background: '#fefce8', padding: '20px', borderRadius: '14px', border: '2px solid var(--orange-border)', boxShadow: '0 4px 15px rgba(234, 179, 8, 0.1)' }}>
          <label className="form-label" style={{ fontSize: '1.05rem', color: 'var(--orange-secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
            <PenTool size={20} /> Assinatura Digital / Carimbo do Emissor
          </label>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Faça o <strong>upload de uma foto/imagem da sua assinatura (PNG ou JPG)</strong> ou desenhe diretamente com o dedo/mouse!
          </p>

          {/* PRÉ-VISUALIZAÇÃO DA ASSINATURA REGISTRADA */}
          {formData.assinatura && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '16px', background: '#ffffff', padding: '14px', borderRadius: '12px', border: '1.5px solid #ca8a04' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ca8a04', textTransform: 'uppercase' }}>
                Assinatura Atual Registrada no Sistema:
              </div>
              <div style={{ maxHeight: '90px', maxWidth: '320px', padding: '6px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={formData.assinatura} alt="Assinatura" style={{ maxWidth: '100%', maxHeight: '80px', objectFit: 'contain' }} />
              </div>
              <button 
                type="button" 
                className="btn btn-sm btn-secondary" 
                style={{ color: '#dc2626', fontSize: '0.78rem', fontWeight: 700 }}
                onClick={() => {
                  setFormData(prev => ({ ...prev, assinatura: '' }));
                  handleLimparCanvas();
                }}
              >
                <Trash2 size={14} /> Remover Assinatura
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', alignItems: 'start' }}>
            {/* OPÇÃO 1: UPLOAD DE FOTO/ARQUIVO DA ASSINATURA */}
            <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1.5px dashed var(--orange-secondary)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                📁 1. Fazer Upload da Foto/Imagem da Assinatura
              </div>
              <label className="btn btn-primary" style={{ cursor: 'pointer', padding: '10px 18px', fontSize: '0.88rem', fontWeight: 800, background: 'var(--orange-gradient)', border: 'none' }}>
                <Upload size={16} /> Selecionar Imagem da Assinatura
                <input type="file" accept="image/*" onChange={handleAssinaturaUpload} style={{ display: 'none' }} />
              </label>
            </div>

            {/* OPÇÃO 2: DESENHAR NO CANVAS */}
            <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1.5px dashed var(--orange-secondary)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                ✍️ 2. Desenhar Assinatura na Tela
              </div>
              <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '8px', padding: '4px' }}>
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={110}
                  style={{ touchAction: 'none', cursor: 'crosshair', display: 'block', background: '#ffffff' }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <button type="button" className="btn btn-sm btn-secondary" onClick={handleLimparCanvas} style={{ color: '#ef4444', fontSize: '0.76rem' }}>
                <Eraser size={14} /> Limpar Desenho
              </button>
            </div>
          </div>
        </div>

        {/* DADOS GERAIS DA EMPRESA */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Nome Fantasia / Marca *</label>
            <input type="text" className="form-input" value={formData.nomeFantasia} onChange={(e) => handleChange('nomeFantasia', e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Razão Social</label>
            <input type="text" className="form-input" value={formData.razaoSocial} onChange={(e) => handleChange('razaoSocial', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">CNPJ / CPF</label>
            <input type="text" className="form-input" value={formData.cnpj} onChange={(e) => handleChange('cnpj', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Telefone Comercial</label>
            <input type="text" className="form-input" value={formData.telefone} onChange={(e) => handleChange('telefone', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">WhatsApp da Empresa</label>
            <input type="text" className="form-input" value={formData.whatsapp} onChange={(e) => handleChange('whatsapp', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">E-mail Comercial</label>
            <input type="email" className="form-input" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Cidade - Estado (para Recibos e Mensagens)</label>
            <input type="text" className="form-input" value={formData.cidadeUf} onChange={(e) => handleChange('cidadeUf', e.target.value)} placeholder="Ex: São Paulo - SP" />
          </div>

          <div className="form-group">
            <label className="form-label">Chave PIX da Empresa</label>
            <input type="text" className="form-input" value={formData.chavePix} onChange={(e) => handleChange('chavePix', e.target.value)} placeholder="E-mail, CPF/CNPJ, Telefone ou Chave Aleatória" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Endereço Completo</label>
          <input type="text" className="form-input" value={formData.endereco} onChange={(e) => handleChange('endereco', e.target.value)} placeholder="Rua, Número, Bairro, Cidade - UF" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={handleZerarSistema} style={{ color: '#ef4444', borderColor: '#fca5a5' }}>
            <Trash2 size={16} /> Zerar / Limpar Todos os Dados
          </button>

          <button type="submit" className="btn btn-orange">
            <Save size={18} /> Salvar Configurações e Assinatura
          </button>
        </div>
      </form>
    </div>
  );
}
