// src/App.jsx

import React from 'react';
import TramiteDashboard from './components/TramiteDashboard'; // <-- Importamos el nuevo componente
import './App.css'; // Mantenemos tus estilos base

function App() {
  // Ahora App.jsx simplemente actúa como un contenedor de la aplicación
  return (
    <div className="App">
      <TramiteDashboard /> 
    </div>
  );
}

export default App;