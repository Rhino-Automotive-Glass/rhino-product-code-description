'use client';

import { useState, useEffect } from 'react';
import { carBrandsWithSubModels } from '../../carBrands';
import { Compatibility } from '../page';

interface ProductCompatibilityProps {
  compatibilities: Compatibility[];
  setCompatibilities: (compatibilities: Compatibility[]) => void;
}

export default function ProductCompatibility({ 
  compatibilities, 
  setCompatibilities 
}: ProductCompatibilityProps) {
  const [marca, setMarca] = useState('');
  const [subModelo, setSubModelo] = useState('');
  const [modelo, setModelo] = useState('');

  // Get subModels for the selected marca
  const getSubModelos = (): string[] => {
    const selectedBrand = carBrandsWithSubModels.find(brand => brand.name === marca);
    if (!selectedBrand) return [];
    return selectedBrand.subModels;
  };

  // Reset subModelo when marca changes
  useEffect(() => {
    setSubModelo('');
  }, [marca]);

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
        comp.modelo === newCompatibility.modelo
    );
  };

  // Add compatibility to list
  const handleAddCompatibility = () => {
    if (!marca || !subModelo || !modelo) {
      alert('Please select all fields before adding compatibility');
      return;
    }

    const newCompatibility: Compatibility = {
      marca,
      subModelo,
      modelo
    };

    if (isDuplicate(newCompatibility)) {
      alert('This compatibility already exists');
      return;
    }

    setCompatibilities([...compatibilities, newCompatibility]);
  };

  // Remove compatibility from list
  const handleRemoveCompatibility = (index: number) => {
    const updatedCompatibilities = compatibilities.filter((_, i) => i !== index);
    setCompatibilities(updatedCompatibilities);
  };

  // Generate compatibility string (comma-separated)
  const generateCompatibilityString = (): string => {
    if (compatibilities.length === 0) return '---';
    
    return compatibilities
      .map(comp => `${comp.marca} ${comp.subModelo} ${comp.modelo}`)
      .join(', ')
      .toUpperCase();
  };

  return (
    <div className="card p-6 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
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
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            className="block w-full px-4 py-2.5 text-base bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition-all duration-200"
          >
            <option value="">Select...</option>
            {carBrandsWithSubModels.map((brand) => (
              <option key={brand.abbr} value={brand.name}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sub-Modelo */}
        <div className="w-full">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Sub-Modelo
          </label>
          <select
            value={subModelo}
            onChange={(e) => setSubModelo(e.target.value)}
            disabled={!marca}
            className="block w-full px-4 py-2.5 text-base bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition-all duration-200 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            <option value="">
              {marca ? 'Select...' : 'Select a Marca first...'}
            </option>
            {getSubModelos().map((subModel) => (
              <option key={subModel} value={subModel}>
                {subModel}
              </option>
            ))}
          </select>
        </div>

        {/* Modelo (Year) */}
        <div className="w-full">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Modelo (Year)
          </label>
          <select
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            className="block w-full px-4 py-2.5 text-base bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition-all duration-200"
          >
            <option value="">Select...</option>
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
          Compatibilities Added ({compatibilities.length})
        </h3>
        
        {compatibilities.length === 0 ? (
          <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
            <p className="text-sm text-slate-500 text-center">
              No compatibilities added yet
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {compatibilities.map((comp, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
              >
                <span className="text-sm font-medium text-slate-900">
                  {comp.marca} {comp.subModelo} {comp.modelo}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveCompatibility(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                  title="Remove compatibility"
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

      {/* Generated Compatibility String Display */}
      <div className="mt-6 lg:mt-8 p-6 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
        <p className="text-sm text-slate-600 mb-2 text-center font-medium">
          Generated Compatibility
        </p>
        <p className="text-2xl lg:text-3xl font-mono font-bold text-center text-slate-900 leading-relaxed break-words">
          {generateCompatibilityString()}
        </p>
      </div>
    </div>
  );
}
