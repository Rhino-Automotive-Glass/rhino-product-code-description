'use client';

import { useState, useEffect } from 'react';
import { carBrandsWithSubModels } from '../../carBrands';
import { Compatibility } from '../page';

interface ProductCompatibilityProps {
  compatibilities: Compatibility[];
  setCompatibilities: (compatibilities: Compatibility[]) => void;
  resetTrigger?: number; // Increment this to trigger form reset
}

// Type for the new subModels structure
interface SubModel {
  name: string;
  versions: string[];
}

export default function ProductCompatibility({ 
  compatibilities, 
  setCompatibilities,
  resetTrigger = 0
}: ProductCompatibilityProps) {
  const [marca, setMarca] = useState('');
  const [subModelo, setSubModelo] = useState('');
  const [version, setVersion] = useState('');
  const [modelo, setModelo] = useState('');
  const [customMarca, setCustomMarca] = useState(''); // Custom brand/model input

  // Check if "Otro" is selected
  const isOtroSelected = marca === 'Otro';

  // Get subModels for the selected marca
  const getSubModelos = (): SubModel[] => {
    if (isOtroSelected) return [];
    const selectedBrand = carBrandsWithSubModels.find(brand => brand.name === marca);
    if (!selectedBrand) return [];
    return selectedBrand.subModels;
  };

  // Get versions for the selected subModelo
  const getVersions = (): string[] => {
    if (isOtroSelected || !subModelo) return [];
    const subModels = getSubModelos();
    const selectedSubModel = subModels.find(sm => sm.name === subModelo);
    if (!selectedSubModel) return [];
    return selectedSubModel.versions;
  };

  // Check if current subModelo has versions available
  const hasVersions = (): boolean => {
    return getVersions().length > 0;
  };

  // Reset subModelo, version, and customMarca when marca changes
  useEffect(() => {
    setSubModelo('');
    setVersion('');
    setCustomMarca('');
  }, [marca]);

  // Reset version when subModelo changes
  useEffect(() => {
    setVersion('');
  }, [subModelo]);

  // Reset form fields when resetTrigger changes
  useEffect(() => {
    if (resetTrigger > 0) {
      setMarca('');
      setSubModelo('');
      setVersion('');
      setModelo('');
      setCustomMarca('');
    }
  }, [resetTrigger]);

  // Generate years from 2000 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2000 + 1 },
    (_, i) => 2000 + i
  ).reverse(); // Most recent years first

  // Check if compatibility already exists
  const isDuplicate = (newCompatibility: Compatibility): boolean => {
    return compatibilities.some(
      comp => 
        comp.marca === newCompatibility.marca && 
        comp.subModelo === newCompatibility.subModelo && 
        comp.version === newCompatibility.version &&
        comp.modelo === newCompatibility.modelo
    );
  };

  // Add compatibility to list
  const handleAddCompatibility = () => {
    // Validation based on whether "Otro" is selected
    if (isOtroSelected) {
      if (!customMarca.trim() || !modelo) {
        alert('Por favor ingresa la marca/modelo personalizado y el año');
        return;
      }
    } else {
      if (!marca || !subModelo || !modelo) {
        alert('Por favor selecciona todos los campos requeridos antes de añadir la compatibilidad');
        return;
      }
      // Note: version is optional, no validation needed
    }

    const newCompatibility: Compatibility = isOtroSelected
      ? {
          marca: customMarca.trim(),
          subModelo: '', // Empty for custom entries
          version: '', // Empty for custom entries
          modelo
        }
      : {
          marca,
          subModelo,
          version, // Can be empty string if not selected
          modelo
        };

    if (isDuplicate(newCompatibility)) {
      alert('Esta compatibilidad ya existe');
      return;
    }

    setCompatibilities([...compatibilities, newCompatibility]);
    
    // Clear the custom input after adding (keep marca as "Otro" for convenience)
    if (isOtroSelected) {
      setCustomMarca('');
      setModelo('');
    }
  };

  // Remove compatibility from list
  const handleRemoveCompatibility = (index: number) => {
    const updatedCompatibilities = compatibilities.filter((_, i) => i !== index);
    setCompatibilities(updatedCompatibilities);
  };

  // Format a single compatibility entry for display
  const formatCompatibilityDisplay = (comp: Compatibility): string => {
    // Handle custom entries (no subModelo)
    if (!comp.subModelo) {
      return `${comp.marca} ${comp.modelo}`;
    }
    
    // If version exists, format as SUBMODELO-VERSION
    if (comp.version) {
      return `${comp.marca} ${comp.subModelo}-${comp.version} ${comp.modelo}`;
    }
    
    // No version, standard format
    return `${comp.marca} ${comp.subModelo} ${comp.modelo}`;
  };

  // Generate compatibility string (comma-separated)
  const generateCompatibilityString = (): string => {
    if (compatibilities.length === 0) return '---';
    
    return compatibilities
      .map(comp => formatCompatibilityDisplay(comp))
      .join(', ')
      .toUpperCase();
  };

  return (
    <div className="card p-6 lg:p-8 min-h-[750px]">
      <div className="mb-6 lg:mb-8">
        <h2 className="text-2xl lg:text-2xl font-bold text-slate-900 mb-2">
          Product Compatibility
        </h2>
        <p className="text-base text-slate-600">
          Add vehicle compatibility information
        </p>
      </div>

      <form className="space-y-6">
        {/* Marca */}
        <div className="w-full">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Marca
          </label>
          <select
            data-testid="marca-select"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            className="block w-full px-4 py-2.5 text-base bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition-all duration-200"
          >
            <option value="">Seleccionar...</option>
            {carBrandsWithSubModels.map((brand) => (
              <option key={brand.abbr} value={brand.name}>
                {brand.name}
              </option>
            ))}
            {/* Separator and "Otro" option */}
            <option disabled>──────────</option>
            <option value="Otro">Otro (Personalizado)</option>
          </select>
        </div>

        {/* Conditional rendering based on "Otro" selection */}
        {isOtroSelected ? (
          /* Custom Marca/Modelo Input */
          <div className="w-full" data-testid="custom-marca-container">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Marca y Modelo Personalizado
            </label>
            <input
              type="text"
              data-testid="custom-marca-input"
              value={customMarca}
              onChange={(e) => setCustomMarca(e.target.value)}
              placeholder="Ej: Honda Civic, Toyota Corolla..."
              className="block w-full px-4 py-2.5 text-base bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition-all duration-200"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Ingresa la marca y modelo que no se encuentra en la lista
            </p>
          </div>
        ) : (
          /* Sub-Modelo and Version fields - Only shown when a regular brand is selected */
          <>
            {/* Sub-Modelo */}
            <div className="w-full" data-testid="sub-modelo-container">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sub-Modelo
              </label>
              <select
                data-testid="sub-modelo-select"
                value={subModelo}
                onChange={(e) => setSubModelo(e.target.value)}
                disabled={!marca}
                className="block w-full px-4 py-2.5 text-base bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition-all duration-200 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
              >
                <option value="">
                  {marca ? 'Seleccionar...' : 'Selecciona una Marca primero...'}
                </option>
                {getSubModelos().map((subModel) => (
                  <option key={subModel.name} value={subModel.name}>
                    {subModel.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Version */}
            <div className="w-full" data-testid="version-container">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Versión
                <span className="ml-1 text-xs text-slate-400 font-normal">(opcional)</span>
              </label>
              <select
                data-testid="version-select"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                disabled={!subModelo || !hasVersions()}
                className="block w-full px-4 py-2.5 text-base bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition-all duration-200 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!subModelo 
                    ? 'Selecciona un Sub-Modelo primero...' 
                    : !hasVersions() 
                      ? 'No hay versiones disponibles' 
                      : 'Seleccionar... (opcional)'
                  }
                </option>
                {getVersions().map((ver) => (
                  <option key={ver} value={ver}>
                    {ver}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Modelo (Year) */}
        <div className="w-full">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Modelo (Año)
          </label>
          <select
            data-testid="modelo-select"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            className="block w-full px-4 py-2.5 text-base bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition-all duration-200"
          >
            <option value="">Seleccionar...</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Add Compatibility Button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleAddCompatibility}
            className="btn btn-primary btn-md w-full"
          >
            Añadir Compatibilidad
          </button>
        </div>
      </form>

      {/* Compatibility List */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-slate-700 mb-3">
          Compatibilidades Añadidas ({compatibilities.length})
        </h3>
        
        {compatibilities.length === 0 ? (
          <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
            <p className="text-sm text-slate-500 text-center">
              No se han añadido compatibilidades
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-20 overflow-y-auto">
            {compatibilities.map((comp, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
              >
                <span className="text-sm font-medium text-slate-900">
                  {formatCompatibilityDisplay(comp)}
                  {!comp.subModelo && (
                    <span className="ml-2 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      Personalizado
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveCompatibility(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                  title="Eliminar compatibilidad"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
}
