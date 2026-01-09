'use client';

import { Compatibility } from '../page';

interface ProductDescriptionProps {
  parte: string;
  posicion: string;
  setPosicion: (value: string) => void;
  lado: string;
  setLado: (value: string) => void;
  compatibilities: Compatibility[];
}

export default function ProductDescription({ 
  parte, 
  posicion,
  setPosicion,
  lado,
  setLado,
  compatibilities 
}: ProductDescriptionProps) {
  // Parte options with full names (for mapping value to label)
  const parteOptions = [
    { value: 's', label: 'Side' },
    { value: 'b', label: 'Back' },
    { value: 'd', label: 'Door' },
    { value: 'q', label: 'Quarter' },
    { value: 'v', label: 'Vent' },
  ];

  // Group compatibilities intelligently
  const groupCompatibilities = (): string => {
    if (compatibilities.length === 0) return '';

    // Create a map to group by marca + subModelo + version
    const grouped = new Map<string, string[]>();
    
    compatibilities.forEach(comp => {
      // Create key based on marca, subModelo, and version
      let key: string;
      if (!comp.subModelo) {
        // Custom entry (no subModelo)
        key = comp.marca;
      } else if (comp.version) {
        // Has version: format as MARCA SUBMODELO-VERSION
        key = `${comp.marca} ${comp.subModelo}-${comp.version}`;
      } else {
        // No version: standard format
        key = `${comp.marca} ${comp.subModelo}`;
      }
      
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(comp.modelo);
    });

    // Build the description string
    const parts: string[] = [];
    grouped.forEach((years, key) => {
      // Sort years in ascending order
      const sortedYears = years.sort((a, b) => parseInt(a) - parseInt(b));
      parts.push(`${key} ${sortedYears.join(', ')}`);
    });

    return parts.join(' ');
  };

  // Generate product description with intelligent compatibility grouping
  const generateDescription = (): string => {
    const parteLabel = parteOptions.find(p => p.value === parte)?.label || '-';
    const posicionText = posicion || '-';
    const ladoText = lado || '-';
    
    // Base description
    let description = `${parteLabel} ${posicionText} ${ladoText}`;
    
    // Add grouped compatibilities if any exist
    const compatibilityText = groupCompatibilities();
    if (compatibilityText) {
      description += ` ${compatibilityText}`;
    }

    return description.toUpperCase();
  };

  return (
    <div className="card p-6 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
          Product Description
        </h2>
        <p className="text-base text-slate-600">
          Generate automotive glass product descriptions
        </p>
      </div>

      <form className="space-y-6">
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

      {/* Generated Product Description Display */}
      <div className="mt-6 lg:mt-8 p-6 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
        <p className="text-sm text-slate-600 mb-2 text-center font-medium">
          Generated Product Description
        </p>
        <p className="text-2xl lg:text-3xl font-mono font-bold text-center text-slate-900 leading-relaxed">
          {generateDescription()}
        </p>
      </div>
    </div>
  );
}
