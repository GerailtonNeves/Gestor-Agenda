import React, { useState } from 'react';
import { Calculator as CalcIcon, X, Copy, RotateCcw, Percent, Check, ArrowRight, DollarSign, History } from 'lucide-react';

export default function Calculator({ isOpen, onClose }) {
  const [modo, setModo] = useState('padrao'); // 'padrao', 'troco', 'margem'
  
  // MODO PADRÃO
  const [display, setDisplay] = useState('0');
  const [equacao, setEquacao] = useState('');
  const [historico, setHistorico] = useState([]);
  const [copiado, setCopiado] = useState(false);

  // MODO TROCO
  const [trocoCobrar, setTrocoCobrar] = useState('');
  const [trocoRecebido, setTrocoRecebido] = useState('');

  // MODO MARGEM DE LUCRO
  const [custo, setCusto] = useState('');
  const [venda, setVenda] = useState('');

  if (!isOpen) return null;

  // CÁLCULOS MODO PADRÃO
  const handleNumero = (num) => {
    if (display === '0' || display === 'Erro') {
      setDisplay(String(num));
    } else {
      setDisplay(display + num);
    }
  };

  const handlePonto = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperador = (op) => {
    setEquacao(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleLimpar = () => {
    setDisplay('0');
    setEquacao('');
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handlePorcentagem = () => {
    try {
      const val = parseFloat(display) || 0;
      const pct = val / 100;
      setDisplay(String(pct));
    } catch (e) {
      setDisplay('Erro');
    }
  };

  const handleCalcular = () => {
    try {
      if (!equacao) return;
      const expressaoCompleta = equacao + display;
      const expressaoSanitizada = expressaoCompleta
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/,/g, '.');

      const resultado = Function('"use strict";return (' + expressaoSanitizada + ')')();
      const resultadoFormatado = Number.isInteger(resultado) ? String(resultado) : resultado.toFixed(2);

      const itemHistorico = `${expressaoCompleta} = ${resultadoFormatado}`;
      setHistorico(prev => [itemHistorico, ...prev.slice(0, 9)]);

      setDisplay(String(resultadoFormatado));
      setEquacao('');
    } catch (e) {
      setDisplay('Erro');
    }
  };

  const copiarResultado = (texto) => {
    navigator.clipboard.writeText(texto || display);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // CÁLCULOS MODO TROCO
  const cobrarNum = parseFloat(trocoCobrar.replace(',', '.')) || 0;
  const recebidoNum = parseFloat(trocoRecebido.replace(',', '.')) || 0;
  const trocoResultado = recebidoNum > cobrarNum ? (recebidoNum - cobrarNum).toFixed(2) : '0.00';
  const faltaPagarResultado = recebidoNum > 0 && recebidoNum < cobrarNum ? (cobrarNum - recebidoNum).toFixed(2) : '0.00';

  // CÁLCULOS MODO MARGEM
  const custoNum = parseFloat(custo.replace(',', '.')) || 0;
  const vendaNum = parseFloat(venda.replace(',', '.')) || 0;
  const lucroBruto = vendaNum - custoNum;
  const margemPorcentagem = vendaNum > 0 ? ((lucroBruto / vendaNum) * 100).toFixed(2) : '0.00';

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 3000 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '440px', 
          padding: '0', 
          borderRadius: '20px',
          overflow: 'hidden',
          background: '#ffffff',
          color: 'var(--text-main)',
          boxShadow: '0 20px 40px rgba(2, 132, 199, 0.15)',
          border: '2px solid var(--blue-border)'
        }}
      >
        {/* CABEÇALHO DA CALCULADORA - AZUL CLARO */}
        <div style={{ padding: '16px 20px', background: 'var(--blue-light-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid var(--blue-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'var(--orange-gradient)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-orange-btn)' }}>
              <CalcIcon size={20} style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--blue-primary)', margin: 0 }}>Calculadora Comercial</h3>
              <span style={{ fontSize: '0.72rem', color: 'var(--orange-primary)', fontWeight: 700 }}>Escritório de Bolso</span>
            </div>
          </div>
          <button className="action-btn-circle" onClick={onClose}>✕</button>
        </div>

        {/* NAVEGAÇÃO DE MODOS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', padding: '10px 16px', gap: '6px', background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
          <button 
            className={`btn btn-sm ${modo === 'padrao' ? 'btn-orange' : 'btn-secondary'}`}
            onClick={() => setModo('padrao')}
            style={{ fontSize: '0.78rem', padding: '6px', justifyContent: 'center' }}
          >
            🧮 Padrão %
          </button>
          <button 
            className={`btn btn-sm ${modo === 'troco' ? 'btn-orange' : 'btn-secondary'}`}
            onClick={() => setModo('troco')}
            style={{ fontSize: '0.78rem', padding: '6px', justifyContent: 'center' }}
          >
            💵 Troco
          </button>
          <button 
            className={`btn btn-sm ${modo === 'margem' ? 'btn-orange' : 'btn-secondary'}`}
            onClick={() => setModo('margem')}
            style={{ fontSize: '0.78rem', padding: '6px', justifyContent: 'center' }}
          >
            📈 Lucro %
          </button>
        </div>

        {/* MODO 1: CALCULADORA PADRÃO / FINANCEIRA (COR CLARA) */}
        {modo === 'padrao' && (
          <div style={{ padding: '20px' }}>
            {/* DISPLAY DIGITAL AZUL CLARO */}
            <div style={{ 
              background: 'var(--blue-light-bg)', 
              borderRadius: '14px', 
              padding: '16px', 
              textAlign: 'right', 
              marginBottom: '16px',
              border: '2px solid var(--blue-border)',
              boxShadow: 'inset 0 2px 6px rgba(2, 132, 199, 0.05)'
            }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--blue-primary)', minHeight: '20px', fontWeight: 700, fontFamily: 'monospace' }}>
                {equacao || '\u00A0'}
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '1px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                {display}
              </div>
            </div>

            {/* BOTÕES DE CÓPIA E APAGAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', gap: '8px' }}>
              <button 
                onClick={() => copiarResultado()} 
                className="btn btn-sm btn-secondary" 
                style={{ flex: 1, fontSize: '0.78rem', fontWeight: 700 }}
              >
                {copiado ? <Check size={14} /> : <Copy size={14} />} {copiado ? 'Copiado!' : 'Copiar Resultado'}
              </button>
              <button 
                onClick={handleBackspace} 
                className="btn btn-sm btn-secondary" 
                style={{ fontSize: '0.78rem', fontWeight: 700 }}
              >
                ⌫ Apagar
              </button>
            </div>

            {/* TECLADO DA CALCULADORA CLARA */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              <button onClick={handleLimpar} style={btnCalcLightStyle('#fee2e2', '#b91c1c', '1px solid #fca5a5')}>C</button>
              <button onClick={handlePorcentagem} style={btnCalcLightStyle('#e0f2fe', '#0284c7', '1px solid #bae6fd')}>%</button>
              <button onClick={() => handleOperador('÷')} style={btnCalcLightStyle('#e0f2fe', '#0284c7', '1px solid #bae6fd')}>÷</button>
              <button onClick={() => handleOperador('×')} style={btnCalcLightStyle('#ffedd5', '#ea580c', '1px solid #fed7aa')}>×</button>

              <button onClick={() => handleNumero(7)} style={btnCalcLightStyle('#ffffff', '#0f172a', '1px solid #e2e8f0')}>7</button>
              <button onClick={() => handleNumero(8)} style={btnCalcLightStyle('#ffffff', '#0f172a', '1px solid #e2e8f0')}>8</button>
              <button onClick={() => handleNumero(9)} style={btnCalcLightStyle('#ffffff', '#0f172a', '1px solid #e2e8f0')}>9</button>
              <button onClick={() => handleOperador('-')} style={btnCalcLightStyle('#ffedd5', '#ea580c', '1px solid #fed7aa')}>-</button>

              <button onClick={() => handleNumero(4)} style={btnCalcLightStyle('#ffffff', '#0f172a', '1px solid #e2e8f0')}>4</button>
              <button onClick={() => handleNumero(5)} style={btnCalcLightStyle('#ffffff', '#0f172a', '1px solid #e2e8f0')}>5</button>
              <button onClick={() => handleNumero(6)} style={btnCalcLightStyle('#ffffff', '#0f172a', '1px solid #e2e8f0')}>6</button>
              <button onClick={() => handleOperador('+')} style={btnCalcLightStyle('#ffedd5', '#ea580c', '1px solid #fed7aa')}>+</button>

              <button onClick={() => handleNumero(1)} style={btnCalcLightStyle('#ffffff', '#0f172a', '1px solid #e2e8f0')}>1</button>
              <button onClick={() => handleNumero(2)} style={btnCalcLightStyle('#ffffff', '#0f172a', '1px solid #e2e8f0')}>2</button>
              <button onClick={() => handleNumero(3)} style={btnCalcLightStyle('#ffffff', '#0f172a', '1px solid #e2e8f0')}>3</button>
              <button onClick={handleCalcular} style={{ ...btnCalcLightStyle('var(--orange-gradient)', '#ffffff', 'none'), gridRow: 'span 2', boxShadow: 'var(--shadow-orange-btn)' }}>=</button>

              <button onClick={() => handleNumero(0)} style={{ ...btnCalcLightStyle('#ffffff', '#0f172a', '1px solid #e2e8f0'), gridColumn: 'span 2' }}>0</button>
              <button onClick={handlePonto} style={btnCalcLightStyle('#ffffff', '#0f172a', '1px solid #e2e8f0')}>,</button>
            </div>

            {/* FITA DE HISTÓRICO EM COR CLARA */}
            {historico.length > 0 && (
              <div style={{ marginTop: '16px', background: 'var(--blue-light-bg)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--blue-border)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--blue-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <History size={12} /> Fita de Histórico de Cálculos
                </div>
                <div style={{ maxHeight: '70px', overflowY: 'auto', fontSize: '0.8rem', color: 'var(--text-main)', fontFamily: 'monospace' }}>
                  {historico.map((h, i) => (
                    <div key={i} style={{ padding: '2px 0', borderBottom: '1px dashed var(--blue-border)' }}>{h}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODO 2: CALCULADORA DE TROCO RÁPIDO (COR CLARA) */}
        {modo === 'troco' && (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Valor a Cobrar (R$)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="Ex: 320.00"
                value={trocoCobrar}
                onChange={(e) => setTrocoCobrar(e.target.value)}
                style={{ fontSize: '1.2rem', fontWeight: 800 }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Valor Entregue pelo Cliente (R$)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="Ex: 350.00"
                value={trocoRecebido}
                onChange={(e) => setTrocoRecebido(e.target.value)}
                style={{ fontSize: '1.2rem', fontWeight: 800, borderColor: 'var(--orange-bright)' }}
              />
            </div>

            {/* PAINEL DE RESULTADO DO TROCO EM CLARO */}
            <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '12px', border: '2px solid #10b981', textAlign: 'center', marginTop: '6px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: recebidoNum < cobrarNum && recebidoNum > 0 ? '#b91c1c' : '#047857', textTransform: 'uppercase' }}>
                {recebidoNum < cobrarNum && recebidoNum > 0 ? '⚠️ FALTA RECEBER' : '💵 TROCO A DEVOLVER'}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: recebidoNum < cobrarNum && recebidoNum > 0 ? '#b91c1c' : '#047857', marginTop: '4px' }}>
                R$ {recebidoNum < cobrarNum && recebidoNum > 0 ? faltaPagarResultado : trocoResultado}
              </div>
            </div>
          </div>
        )}

        {/* MODO 3: CALCULADORA DE MARGEM DE LUCRO (COR CLARA) */}
        {modo === 'margem' && (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Preço Custo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={custo}
                  onChange={(e) => setCusto(e.target.value)}
                  style={{ fontWeight: 700 }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Preço Venda (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={venda}
                  onChange={(e) => setVenda(e.target.value)}
                  style={{ fontWeight: 700, borderColor: 'var(--orange-bright)' }}
                />
              </div>
            </div>

            {/* PAINEL DE RESULTADO DE MARGEM EM CLARO */}
            <div style={{ background: 'var(--blue-light-bg)', padding: '16px', borderRadius: '12px', border: '2px solid var(--blue-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>Lucro Bruto R$</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: lucroBruto >= 0 ? '#047857' : '#b91c1c' }}>
                  R$ {lucroBruto.toFixed(2)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>Margem de Lucro %</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--blue-primary)' }}>
                  {margemPorcentagem}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const btnCalcLightStyle = (bg, color, border) => ({
  background: bg,
  color: color,
  border: border || '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '14px',
  fontSize: '1.1rem',
  fontWeight: 800,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
});
