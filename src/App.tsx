import { useState } from 'react'
import ComponenteFormulario from './componentes/ComponenteFormulario'
import ComponenteModuloDatos from './componentes/ComponenteModuloDatos'
import ComponentePoisson from './componentes/ComponentePoisson'
import ComponenteModuloColaas from './componentes/ComponenteModuloColaas'
import ComponenteColasBD from './componentes/ComponenteColasBD'

function App() {
  const [vistaActual, setVistaActual] = useState<'calculador' | 'datos' | 'poisson' | 'colas' | 'colaDatos'>('calculador')

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
              Cargar Datos Distribuciones
            </button>
            <button
              onClick={() => setVistaActual('colaDatos')}
              className="block w-full bg-[#9D4EDD] text-white font-bold py-3 px-6 rounded-lg shadow-2xl hover:shadow-xl transform hover:scale-105 transition"
              title="Cargar datos desde archivos Excel o CSV"
            >
              Cargar Datos Teoría de Colas
            </button>
            <button
              onClick={() => setVistaActual('poisson')}
              className="block w-full bg-[#3A86FF] text-white font-bold py-3 px-6 rounded-lg shadow-2xl hover:shadow-xl transform hover:scale-105 transition"
              title="Calcular distribución de Poisson"
            >
              Distribución de Poisson
            </button>
            <button
              onClick={() => setVistaActual('colas')}
              className="block w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg shadow-2xl hover:shadow-xl transform hover:scale-105 transition"
              title="Teoría de Colas M/M/1"
            >
              Teoría de Colas
            </button>
          </div>
        </div>
      ) : vistaActual === 'colaDatos' ? (
        <ComponenteColasBD onVolverAlCalculador={() => setVistaActual('calculador')} />
      ) : vistaActual === 'datos' ? (
        <ComponenteModuloDatos onVolverAlCalculador={() => setVistaActual('calculador')} />
      ) : vistaActual === 'poisson' ? (
        <ComponentePoisson onVolverAlCalculador={() => setVistaActual('calculador')} />
      ) : (
        <ComponenteModuloColaas onVolverAlCalculador={() => setVistaActual('calculador')} />
      )}
    </main>
  )
}

export default App
