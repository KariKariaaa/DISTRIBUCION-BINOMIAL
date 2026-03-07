import { useState } from 'react'
import ComponenteFormulario from './componentes/ComponenteFormulario'
import ComponenteModuloDatos from './componentes/ComponenteModuloDatos'
import ComponentePoisson from './componentes/ComponentePoisson'

function App() {
  const [vistaActual, setVistaActual] = useState<'calculador' | 'datos' | 'poisson'>('calculador')

  return (
    <main>
      {vistaActual === 'calculador' ? (
        <div className="relative">
          <ComponenteFormulario />
          <div className="fixed bottom-8 right-8 space-y-3 z-50">
            <button
              onClick={() => setVistaActual('datos')}
              className="block w-full bg-[#9D4EDD] text-white font-bold py-3 px-6 rounded-lg shadow-2xl hover:shadow-xl transform hover:scale-105 transition"
              title="Cargar datos desde archivos Excel o CSV"
            >
              Cargar Datos
            </button>
            <button
              onClick={() => setVistaActual('poisson')}
              className="block w-full bg-[#3A86FF] text-white font-bold py-3 px-6 rounded-lg shadow-2xl hover:shadow-xl transform hover:scale-105 transition"
              title="Calcular distribución de Poisson"
            >
              Distribución de Poisson
            </button>
          </div>
        </div>
      ) : vistaActual === 'datos' ? (
        <ComponenteModuloDatos onVolverAlCalculador={() => setVistaActual('calculador')} />
      ) : (
        <ComponentePoisson onVolverAlCalculador={() => setVistaActual('calculador')} />
      )}
    </main>
  )
}

export default App
