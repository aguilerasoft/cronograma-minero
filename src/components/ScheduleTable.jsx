import React from 'react';
import DayCell from './DayCell';
//import './ScheduleTable.css';

const ScheduleTable = ({ scheduleData, errors, parameters }) => {
  if (!scheduleData) {
    return (
      <div className="no-schedule">
        <p>Configure los parámetros y genere un cronograma para visualizarlo aquí.</p>
      </div>
    );
  }
  
  const { schedule, errores } = scheduleData;
  
  // Configurar paginación si hay muchos días
  const diasPorPagina = 30;
  const totalPaginas = Math.ceil(schedule.dias.length / diasPorPagina);
  const [paginaActual, setPaginaActual] = React.useState(0);
  
  const inicio = paginaActual * diasPorPagina;
  const fin = Math.min(inicio + diasPorPagina, schedule.dias.length);
  
  const diasMostrados = schedule.dias.slice(inicio, fin);
  
  // Agrupar errores por día para acceso rápido
  const erroresPorDia = {};
  errores.forEach(error => {
    if (!erroresPorDia[error.dia]) {
      erroresPorDia[error.dia] = [];
    }
    erroresPorDia[error.dia].push(error);
  });
  
  // Función para manejar cambio de página
  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 0 && nuevaPagina < totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };
  
  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h2>Cronograma de Supervisores</h2>
        <div className="schedule-info">
          <div className="info-item">
            <strong>Régimen:</strong> {parameters?.trabajoDias}x{parameters?.descansoDias}
          </div>
          <div className="info-item">
            <strong>Inducción:</strong> {parameters?.induccionDias} días
          </div>
          <div className="info-item">
            <strong>Días totales:</strong> {schedule.dias.length} días
          </div>
          <div className="info-item">
            <strong>Errores:</strong> <span className={errores.length > 0 ? 'error-count' : 'success-count'}>
              {errores.length}
            </span>
          </div>
        </div>
      </div>
      
      {errores.length > 0 && (
        <div className="errors-panel">
          <h4>Errores Detectados:</h4>
          <br />
          <ul>
            {errores.slice(0, 5).map((error, index) => (
              <div key={index} className={`error-${error.tipo}`}>
                <strong>Día {error.dia}:</strong> {error.mensaje}
              </div>
            ))}
            {errores.length > 5 && (
              <div>... y {errores.length - 5} errores más</div>
            )}
          </ul>
        </div>
      )}
      
      <div className="table-container">
        <div className="schedule-table" role="table" aria-label="Cronograma">
          {/* Encabezado de días */}
          <div className="table-row header-row" role="row">
            <div className="cell supervisor-header" role="columnheader">Día</div>
            {diasMostrados.map(dia => (
              <div key={dia} className="cell day-header" role="columnheader">
                {dia}
                {erroresPorDia[dia] && <span className="error-dot"></span>}
              </div>
            ))}
          </div> 
          
          {/* Fila S1 */}
          <div className="table-row supervisor-row" role="row">
            <div className="cell supervisor-label s1-label" role="cell">S1</div>
            {diasMostrados.map(dia => (
              <DayCell 
                key={`s1-${dia}`}
                estado={schedule.s1[dia]}
                dia={dia}
                tieneError={erroresPorDia[dia]?.some(e => e.supervisor === 'S1')}
              />
            ))}
          </div>
          
          {/* Fila S2 */}
          <div className="table-row supervisor-row" role="row">
            <div className="cell supervisor-label s2-label" role="cell">S2</div>
            {diasMostrados.map(dia => (
              <DayCell 
                key={`s2-${dia}`}
                estado={schedule.s2[dia]}
                dia={dia}
                tieneError={erroresPorDia[dia]?.some(e => e.supervisor === 'S2')}
              />
            ))}
          </div>
          
          {/* Fila S3 */}
          <div className="table-row supervisor-row" role="row">
            <div className="cell supervisor-label s3-label" role="cell">S3</div>
            {diasMostrados.map(dia => (
              <DayCell 
                key={`s3-${dia}`}
                estado={schedule.s3[dia]}
                dia={dia}
                tieneError={erroresPorDia[dia]?.some(e => e.supervisor === 'S3')}
              />
            ))}
          </div>
          
          {/* Fila de conteo de perforación */}
          <div className="table-row count-row" role="row">
            <div className="cell count-label" role="cell">#P</div>
            {diasMostrados.map(dia => {
              const count = schedule.perforandoPorDia[dia];
              const tieneError = count !== 2 && dia >= scheduleData?.s3EntradaDia;
              
              return (
                <div 
                  key={`count-${dia}`} 
                  className={`cell count-cell ${tieneError ? 'count-error' : ''}`}
                  title={`${count} supervisor(es) perforando`}
                >
                  {count}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Controles de paginación */}
      {totalPaginas > 1 && (
        <div className="pagination">
          <button 
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 0}
            className="page-btn"
          >
            ← Anterior
          </button>
          
          <span className="page-info">
            Página {paginaActual + 1} de {totalPaginas}
            <br />
            <small>Días {inicio + 1} - {fin} de {schedule.dias.length}</small>
          </span>
          
          <button 
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas - 1}
            className="page-btn"
          >
            Siguiente →
          </button>
        </div>
      )}
      
      {/* Leyenda de colores */}
      <div className="legend">
        <h4>Leyenda:</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="color-box" style={{ backgroundColor: '#3B82F6' }}></div>
            <span>S - Subida (viaje al campo)</span>
          </div>
          <div className="legend-item">
            <div className="color-box" style={{ backgroundColor: '#F59E0B' }}></div>
            <span>I - Inducción (capacitación)</span>
          </div>
          <div className="legend-item">
            <div className="color-box" style={{ backgroundColor: '#10B981' }}></div>
            <span>P - Perforación (trabajo efectivo)</span>
          </div>
          <div className="legend-item">
            <div className="color-box" style={{ backgroundColor: '#EF4444' }}></div>
            <span>B - Bajada (retorno)</span>
          </div>
          <div className="legend-item">
            <div className="color-box" style={{ backgroundColor: '#9CA3AF' }}></div>
            <span>D - Descanso</span>
          </div>
          <div className="legend-item">
            <div className="color-box" style={{ backgroundColor: '#FFFFFF', border: '1px solid #ccc' }}></div>
            <span>- - Vacío/Sin actividad</span>
          </div>
        </div>
      </div>
      
      {/* Reglas importantes */}
      <div className="rules-panel">
        <h4>📋 Reglas Fundamentales:</h4>
        
          <li>Siempre debe haber <strong>EXACTAMENTE 2 supervisores</strong> perforando</li>
          <li><strong>NUNCA</strong> deben estar 3 supervisores perforando al mismo tiempo</li>
          <li><strong>NUNCA</strong> debe haber solo 1 supervisor perforando (una vez que S3 entro)</li>
          <li>El <strong>Supervisor 1 (S1)</strong> SIEMPRE cumple el régimen completo sin modificaciones</li>
          <li>Los <strong>Supervisores 2 y 3 (S2, S3)</strong> se ajustan para cumplir las reglas</li>
        
      </div>
    </div>
  );
};

export default ScheduleTable;