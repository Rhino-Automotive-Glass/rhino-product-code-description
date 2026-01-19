'use client';

interface CodeGeneratorProps {
  clasificacion: string;
  setClasificacion: (value: string) => void;
  parte: string;
  setParte: (value: string) => void;
  numero: string;
  setNumero: (value: string) => void;
  color: string;
  setColor: (value: string) => void;
  aditamento: string;
  setAditamento: (value: string) => void;
  posicion: string;
  setPosicion: (value: string) => void;
  lado: string;
  setLado: (value: string) => void;
  isRhinoAutoMode?: boolean;
  isLoadingRhinoNumber?: boolean;
  latestDbRhinoNumber?: string;
}

export default function CodeGenerator({
  clasificacion,
  setClasificacion,
  parte,
  setParte,
  numero,
  setNumero,
  color,
  setColor,
  aditamento,
  setAditamento,
  posicion,
  setPosicion,
  lado,
  setLado,
  isRhinoAutoMode = false,
  isLoadingRhinoNumber = false,
  latestDbRhinoNumber = ''
}: CodeGeneratorProps) {
  const handleNumeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits and max 5 characters
    if (/^\d*$/.test(value) && value.length <= 5) {
      // Store as integer (remove leading zeros) unless it's empty or just "0"
      if (value === '' || value === '0') {
        setNumero(value);
      } else {
        // Parse to integer to remove leading zeros, then convert back to string
        const intValue = parseInt(value, 10);
        setNumero(intValue.toString());
      }
    }
  };

  return (
    <div className="p-6 lg:p-8 min-h-[750px]">
      <div className="mb-6 lg:mb-8">
        <h2 className="text-2xl lg:text-2xl font-bold text-slate-900 mb-2">
          Product Details
        </h2>
      </div>

      <form className="space-y-6">
        {/* Clasificación Comercial */}
        <div className="w-full">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Clasificación Comercial
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="clasificacion"
                value="D"
                checked={clasificacion === 'D'}
                onChange={(e) => setClasificacion(e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 border-slate-300"
              />
              <span className="ml-2 text-sm text-slate-700">D - Doméstico</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="clasificacion"
                value="F"
                checked={clasificacion === 'F'}
                onChange={(e) => setClasificacion(e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 border-slate-300"
              />
              <span className="ml-2 text-sm text-slate-700">F - Foránea</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="clasificacion"
                value="R"
                checked={clasificacion === 'R'}
                onChange={(e) => setClasificacion(e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 border-slate-300"
              />
              <span className="ml-2 text-sm text-slate-700">R - Rhino Automotive</span>
            </label>
          </div>
        </div>

        {/* Parte */}
        <div className="w-full">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Parte
          </label>
          <div className="flex flex-wrap gap-4">
            {[
              { value: 's', label: 'S - Side' },
              { value: 'b', label: 'B - Back' },
              { value: 'd', label: 'D - Door' },
              { value: 'q', label: 'Q - Quarter' },
              { value: 'v', label: 'V - Vent' },
              { value: 'w', label: 'W - Windshield'},
              { value: 'r', label: 'R - Roof.'},
            ].map((option) => (
              <label key={option.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="parte"
                  value={option.value}
                  checked={parte === option.value}
                  onChange={(e) => setParte(e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 border-slate-300"
                />
                <span className="ml-2 text-sm text-slate-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Número */}
        <div className="w-full">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Número
            {isRhinoAutoMode && (
              <>
                <span className="ml-2 text-xs text-orange-600 font-semibold">
                  (Auto-generado)
                </span>
                {latestDbRhinoNumber && (
                  <span className="ml-2 text-xs text-slate-500">
                    Último número en BD: <span className="font-mono font-bold text-slate-700">{latestDbRhinoNumber}</span>
                  </span>
                )}
              </>
            )}
          </label>
          <div className="relative">
            <input
              type="text"
              value={numero}
              onChange={handleNumeroChange}
              placeholder={isLoadingRhinoNumber ? 'Obteniendo número...' : '00000'}
              maxLength={5}
              disabled={isLoadingRhinoNumber}
              className={`block w-full px-4 py-2.5 text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition-all duration-200 ${
                isLoadingRhinoNumber
                  ? 'bg-slate-100 cursor-not-allowed text-slate-600'
                  : 'bg-white'
              }`}
            />
            {isLoadingRhinoNumber && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg
                  className="animate-spin h-5 w-5 text-orange-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            )}
          </div>
          {isRhinoAutoMode && !isLoadingRhinoNumber && (
            <div className="mt-1.5">
              <p className="text-xs text-orange-600">
                Número automático sugerido. Puedes editarlo si es necesario.
              </p>
              {numero && (
                <p className="text-s text-slate-500 mt-0.5">
                  Se mostrará en el código como: <span className="font-mono font-semibold text-slate-700">{numero.padStart(5, '0')}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Color */}
        <div className="w-full">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Color
          </label>
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="block w-full px-4 py-2.5 text-base bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition-all duration-200"
          >
            <option value="">Select...</option>
            <option value="GT">GT - Green Tint</option>
            <option value="YT">YT - Gray Tint</option>
            <option value="YP">YP - Gray Tint Privacy</option>
            <option value="CL">CL - Clear</option>
          </select>
        </div>

        {/* Aditamento */}
        <div className="w-full">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Aditamento
          </label>
          <div className="flex gap-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="aditamento"
                value="Y"
                checked={aditamento === 'Y'}
                onChange={(e) => setAditamento(e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 border-slate-300"
              />
              <span className="ml-2 text-sm text-slate-700">Y - Yes</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="aditamento"
                value="N"
                checked={aditamento === 'N'}
                onChange={(e) => setAditamento(e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 border-slate-300"
              />
              <span className="ml-2 text-sm text-slate-700">N - No</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="aditamento"
                value="F"
                checked={aditamento === 'F'}
                onChange={(e) => setAditamento(e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 border-slate-300"
              />
              <span className="ml-2 text-sm text-slate-700">F - Fixed</span>
            </label>
          </div>
        </div>

        {/* Posición */}
        <div className="w-full">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Posición
          </label>
          <div className="flex gap-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="posicion"
                value="Front"
                checked={posicion === 'Front'}
                onChange={(e) => setPosicion(e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 border-slate-300"
              />
              <span className="ml-2 text-sm text-slate-700">Front</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="posicion"
                value="Rear"
                checked={posicion === 'Rear'}
                onChange={(e) => setPosicion(e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 border-slate-300"
              />
              <span className="ml-2 text-sm text-slate-700">Rear</span>
            </label>
          </div>
        </div>

        {/* Lado */}
        <div className="w-full">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Lado
          </label>
          <div className="flex gap-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="lado"
                value="Left"
                checked={lado === 'Left'}
                onChange={(e) => setLado(e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 border-slate-300"
              />
              <span className="ml-2 text-sm text-slate-700">Left</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="lado"
                value="Right"
                checked={lado === 'Right'}
                onChange={(e) => setLado(e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 border-slate-300"
              />
              <span className="ml-2 text-sm text-slate-700">Right</span>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
