import React, { useState } from 'react';
//import './InputPanel.css';

const InputPanel = ({ onGenerateSchedule, isLoading }) => {
  const [regimen, setRegimen] = useState('14x7');
  const [induccionDias, setInduccionDias] = useState(5);
  const [totalDiasPerforacion, setTotalDiasPerforacion] = useState(30);
  const [customRegimen, setCustomRegimen] = useState('');
  
  // Regímenes predefinidos según la prueba
  const regimenesPredefinidos = [
    { label: '14x7 (Ejemplo 1)', value: '14x7' },
    { label: '21x7 (Ejemplo 2)', value: '21x7' },
    { label: '10x5 (Ejemplo 3)', value: '10x5' },
    { label: '14x6 (Ejemplo 4)', value: '14x6' },
    { label: '7x7 (Ejemplo 5)', value: '7x7' },
    { label: 'Personalizado', value: 'custom' }
  ];
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    let trabajoDias, descansoDias;
    
    if (regimen === 'custom') {
      // Parsear régimen personalizado (ej: "14x7")
      const [trabajo, descanso] = customRegimen.split('x').map(Number);
      if (!trabajo || !descanso || trabajo < 3 || descanso < 3) {
        alert('Formato inválido. Use "NxM" donde N y M son números (ej: 14x7)');
        return;
      }
      trabajoDias = trabajo;
      descansoDias = descanso;
    } else {
      // Parsear régimen predefinido
      const [trabajo, descanso] = regimen.split('x').map(Number);
      trabajoDias = trabajo;
      descansoDias = descanso;
    }
    
    // Validar días de inducción
    if (induccionDias < 1 || induccionDias > 5) {
      alert('Los días de inducción deben estar entre 1 y 5');
      return;
    }
    
    // Validar que días de trabajo sean suficientes
    if (trabajoDias < induccionDias + 2) {
      alert(`Los días de trabajo (${trabajoDias}) deben ser mayores que los días de inducción (${induccionDias}) + 2`);
      return;
    }
    
    onGenerateSchedule(trabajoDias, descansoDias, induccionDias, totalDiasPerforacion);
  };
  
  const handlePreset = (presetName) => {
    switch (presetName) {
      case 'caso1':
        setRegimen('14x7');
        setInduccionDias(5);
        setTotalDiasPerforacion(90);
        break;
      case 'caso2':
        setRegimen('21x7');
        setInduccionDias(3);
        setTotalDiasPerforacion(90);
        break;
      case 'caso3':
        setRegimen('10x5');
        setInduccionDias(2);
        setTotalDiasPerforacion(90);
        break;
      case 'caso4':
        setRegimen('14x6');
        setInduccionDias(4);
        setTotalDiasPerforacion(95);
        break;
      default:
        break;
    }
  };
  
  return (
    <div className="input-panel">
      <h2>Configuración del Cronograma</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="regimen">Régimen de Trabajo (NxM):</label>
          <select 
            id="regimen"
            value={regimen}
            onChange={(e) => setRegimen(e.target.value)}
            className="form-control"
          >
            {regimenesPredefinidos.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          
          {regimen === 'custom' && (
            <div className="custom-regimen">
              <input
                type="text"
                placeholder="Ej: 14x7"
                value={customRegimen}
                onChange={(e) => setCustomRegimen(e.target.value)}
                className="form-control"
              />
              <small className="text-muted">Formato: NxM (ej: 14x7 = 14 días trabajo, 7 días descanso)</small>
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="induccion">
            Días de Inducción: <span className="induccion-value">{induccionDias}</span>
          </label>
          <input
            id="induccion"
            type="range"
            min="1"
            max="5"
            value={induccionDias}
            onChange={(e) => setInduccionDias(parseInt(e.target.value))}
            className="form-control-range"
          />
          <div className="range-labels">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="totalDias">Total Días de Perforación:</label>
          <input
            id="totalDias"
            type="number"
            min="30"
            max="365"
            value={totalDiasPerforacion}
            onChange={(e) => setTotalDiasPerforacion(parseInt(e.target.value))}
            className="form-control"
          />
          <small className="text-muted">Mínimo 30 días, máximo 365 días</small>
        </div>
        
        <div className="presets">
          <h4>Casos de Prueba:</h4>
          <div className="preset-buttons">
            <button 
              type="button" 
              className="preset-btn"
              onClick={() => handlePreset('caso1')}
            >
              Caso 1: 14x7, 5 inducción, 90 días
            </button>
            <button 
              type="button" 
              className="preset-btn"
              onClick={() => handlePreset('caso2')}
            >
              Caso 2: 21x7, 3 inducción, 90 días
            </button>
            <button 
              type="button" 
              className="preset-btn"
              onClick={() => handlePreset('caso3')}
            >
              Caso 3: 10x5, 2 inducción, 90 días
            </button>
            <button 
              type="button" 
              className="preset-btn"
              onClick={() => handlePreset('caso4')}
            >
              Caso 4: 14x6, 4 inducción, 95 días
            </button>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="generate-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Generando...' : 'Generar Cronograma'}
        </button>
      </form>
      
      <div className="info-box">
        <h4>Notas importantes:</h4>
        <ul>
          <li><strong>S1:</strong> Siempre cumple el régimen completo sin modificaciones</li>
          <li><strong>S2 y S3:</strong> Se ajustan automáticamente para cumplir las reglas</li>
          <li><strong>Regla principal:</strong> Siempre deben haber EXACTAMENTE 2 supervisores perforando</li>
        </ul>
      </div>
    </div>
  );
};

export default InputPanel;