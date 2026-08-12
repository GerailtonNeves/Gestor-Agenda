import React, { useState, useRef, useEffect } from 'react';
import { Building, Save, Upload, CheckCircle, RefreshCw, Trash2, PenTool, Eraser } from 'lucide-react';
import { storageApi } from '../utils/storage';

export default function EmpresaConfig({ empresa = {}, onSaveEmpresa }) {
  const [formData, setFormData] = useState({
    nomeFantasia: empresa.nomeFantasia || '',
    razaoSocial: empresa.razaoSocial || '',
    cnpj: empresa.cnpj || '',
    telefone: empresa.telefone || '',
    whatsapp: empresa.whatsapp || '',
    email: empresa.email || '',
    cidadeUf: empresa.cidadeUf || empresa.cidade || 'São Paulo - SP',
    endereco: empresa.endereco || '',
    chavePix: empresa.chavePix || '',
    logo: empresa.logo || '',
    assinatura: empresa.assinatura || ''
  });

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
      endereco: empresa.endereco || '',
      chavePix: empresa.chavePix || '',
      logo: empresa.logo || '',
      assinatura: empresa.assinatura || ''
    });
  }, [empresa]);

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAssinaturaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, assinatura: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // LÓGICA DO CANVAS DE ASSINATURA DIGITAL (DESENHO COM DEDO OU MOUSE)
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setFormData(prev => ({ ...prev, assinatura: dataUrl }));
    }
  };

  const limparCanvasAssinatura = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setFormData(prev => ({ ...prev, assinatura: '' }));
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    onSaveEmpresa(formData);
    setNotificacao('✨ Dados da empresa e assinatura salvos com sucesso!');
    setTimeout(() => setNotificacao(null), 3000);
  };

  const handleZerarSistema = () => {
    if (window.confirm('⚠️ ATENÇÃO: Deseja realmente ZERAR todos os dados do sistema Escritório de Bolso?\n\nEsta ação apagará todos os clientes, vendas, recibos, orçamentos e agendamentos.')) {
      storageApi.clearAll();
      alert('Sistemas limpos com sucesso. Recarregando...');
      window.location.reload();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Alert */}
      {notificacao && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
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
          gap: '10px'
        }}>
          <CheckCircle size={20} /> <span>{notificacao}</span>
        </div>
      )}

      {/* Banner Superior */}
      <div className="card card-blue" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--blue-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building size={24} /> Minha Empresa & Assinatura Digital
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Cadastre a sua logo, dados e <strong>desenhe a sua assinatura digital</strong> para sair em todos os recibos e orçamentos!
          </p>
        </div>
      </div>

      <form onSubmit={handleSalvar} className="card card-blue" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

        {/* CAMPO DE ASSINATURA DIGITAL (DESENHE SUA ASSINATURA) */}
        <div className="form-group" style={{ background: '#fff7ed', padding: '20px', borderRadius: '12px', border: '2px solid var(--orange-primary)' }}>
          <label className="form-label" style={{ fontSize: '1.05rem', color: 'var(--orange-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PenTool size={20} /> Desenhe ou envie a sua Assinatura Digital
          </label>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Escreva/desenhe a sua assinatura abaixo com o <strong>dedo na tela do celular</strong> ou com o mouse no computador!
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#ffffff', border: '2px dashed var(--orange-secondary)', borderRadius: '10px', padding: '6px', position: 'relative' }}>
              <canvas
                ref={canvasRef}
                width={400}
                height={130}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{ touchAction: 'none', cursor: 'crosshair', background: '#fff', borderRadius: '6px' }}
              />
              <div style={{ position: 'absolute', bottom: '10px', right: '12px', fontSize: '0.72rem', color: '#94a3b8', pointerEvents: 'none' }}>
                ✍️ Área para desenhar
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button type="button" className="btn btn-sm btn-secondary" onClick={limparCanvasAssinatura}>
                <Eraser size={14} /> Limpar Desenho
              </button>
              <label className="btn btn-sm btn-orange" style={{ cursor: 'pointer' }}>
                <Upload size={14} /> Enviar Foto da Assinatura
                <input type="file" accept="image/*" onChange={handleAssinaturaUpload} style={{ display: 'none' }} />
              </label>
            </div>

            {formData.assinatura && (
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--orange-primary)', marginBottom: '4px' }}>
                  PRÉVIA DA SUA ASSINATURA REGISTRADA:
                </div>
                <div style={{ background: '#fff', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'inline-block' }}>
                  <img src={formData.assinatura} alt="Assinatura Registrada" style={{ maxHeight: '60px', maxWidth: '240px', objectFit: 'contain' }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Campos Cadastrais */}
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
            <label className="form-label">Cidade - Estado (para Recibos)</label>
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
