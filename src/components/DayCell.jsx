import React from 'react';
import { obtenerColorEstado, obtenerNombreEstado } from '../utils/scheduleGenerator';
//import './DayCell.css';

const DayCell = ({ estado, dia, tieneError }) => {
  const color = obtenerColorEstado(estado);
  const nombreEstado = obtenerNombreEstado(estado);

  const isColorLight = (hex) => {
    if (!hex) return false;
    const c = hex.replace('#','');
    const full = c.length === 3 ? c.split('').map(ch => ch+ch).join('') : c;
    const bigint = parseInt(full, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 180;
  };

  return (
    <div
      className={`day-cell ${tieneError ? 'cell-error' : ''}`}
      style={{ backgroundColor: color }}
      title={`Día ${dia}: ${nombreEstado}`}
      role="button"
      tabIndex="0"
      aria-label={`Día ${dia}: ${nombreEstado}`}
    >
      {estado}
      {tieneError && <div className="error-indicator">⚠️</div>}
    </div>
  );
};

export default DayCell;