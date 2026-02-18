import { useState } from 'react'
import ComponenteFormulario from './componentes/ComponenteFormulario'
import ComponenteModuloDatos from './componentes/ComponenteModuloDatos'

function App() {
  const [vistaActual, setVistaActual] = useState<'calculador' | 'datos'>('calculador')

  return (
    <main>
      {vistaActual === 'calculador' ? (
        <div className="relative">
          <ComponenteFormulario />
          <button
            onClick={() => setVistaActual('datos')}
            className="fixed bottom-8 right-8 bg-[#9D4EDD] text-white font-bold py-4 px-6 rounded-lg shadow-2xl hover:shadow-xl transform hover:scale-110 transition z-50"
            title="Cargar datos desde archivos Excel o CSV"
          >
            Cargar Datos
          </button>
        </div>
      ) : (
        <ComponenteModuloDatos onVolverAlCalculador={() => setVistaActual('calculador')} />
      )}
    </main>
  )
}

export default App
