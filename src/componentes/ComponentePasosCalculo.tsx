interface PasoCalculo {
  nombre: string;
  formula: string;
  resultado: number;
  explicacion: string;
}

interface ComponentePasosProps {
  pasos: PasoCalculo[];
}

export default function ComponentePasosCalculo({ pasos }: ComponentePasosProps) {
  return (
    <div className="mt-6 space-y-4">
      {pasos.map((paso, index) => (
        <div key={index} className="bg-white rounded-lg p-4 border-l-4 border-[#9D4EDD]">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#9D4EDD] text-white font-bold">
                {index + 1}
              </div>
            </div>
            <div className="grow">
              <h4 className="text-lg font-bold text-[#9D4EDD]">{paso.nombre}</h4>
              <p className="text-sm text-gray-700 mt-1 bg-white rounded p-2 font-mono">
                {paso.formula}
              </p>
              <p className="text-sm text-gray-600 mt-2">{paso.explicacion}</p>
              <div className="mt-3 bg-white rounded p-2">
                <span className="font-bold text-[#3A86FF] text-lg">{paso.resultado.toFixed(6)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
