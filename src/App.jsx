import React, { useState } from 'react';
import InputPanel from './components/InputPanel';
import ScheduleTable from './components/ScheduleTable';
import { generarCronograma } from './utils/scheduleGenerator';
import './App.css';

function App() {
  const [scheduleData, setScheduleData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parameters, setParameters] = useState(null);
  
  const handleGenerateSchedule = (trabajoDias, descansoDias, induccionDias, totalDiasPerforacion) => {
    setIsLoading(true);
    
    // Usar setTimeout para simular procesamiento asíncrono
    setTimeout(() => {
      try {
        const result = generarCronograma(
          trabajoDias,
          descansoDias,
          induccionDias,
          totalDiasPerforacion
        );
        
        setScheduleData(result);
        setParameters({
          trabajoDias,
          descansoDias,
          induccionDias,
          totalDiasPerforacion
        });
      } catch (error) {
        alert(`Error al generar cronograma: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }, 100);
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>Cronograma de Supervisores Mineros</h1>
        <p className="subtitle">
          Sistema de planificación de turnos para supervisores de perforación
        </p>
      </header>
      
      <main className="App-main">
        <div className="container">
          <div className="left-panel">
            <InputPanel 
              onGenerateSchedule={handleGenerateSchedule}
              isLoading={isLoading}
            />
          </div>
          
          <div className="right-panel">
            <ScheduleTable 
              scheduleData={scheduleData}
              parameters={parameters}
            />
          </div>
        </div>
      </main>
      
      <footer className="App-footer">
        <div className="footer-content">
          <p>
            <strong>Algoritmo de Cronograma de Supervisores</strong>
            
          </p>
          
        </div>
      </footer>
    </div>
  );
}

export default App;