'use client';

import { useState } from 'react';
import { vehicleBrandAbbreviations } from '../../carBrands';

export default function ProductDescription() {
  const [parte, setParte] = useState('');
  const [posicion, setPosicion] = useState('');
  const [lado, setLado] = useState('');
  const [marca, setMarca] = useState('');
  const [subMarca, setSubMarca] = useState('');
  const [modelo, setModelo] = useState('');

  // Parte options with full names
  const parteOptions = [
    { value: 's', label: 'Side' },
    { value: 'b', label: 'Back' },
    { value: 'd', label: 'Door' },
    { value: 'q', label: 'Quarter' },
    { value: 'v', label: 'Vent' },
  ];

  // Generate years from 2000 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2000 + 1 },
    (_, i) => 2000 + i
  ).reverse(); // Most recent years first

  // Generate product description
  const generateDescription = (): string => {
    const parteLabel = parteOptions.find(p => p.value === parte)?.label || '-';
    const posicionText = posicion || '-';
    const ladoText = lado || '-';
    const marcaText = marca || '-';
    const subMarcaText = subMarca || '-';
    const modeloText = modelo || '-';

    return `${parteLabel} ${posicionText} ${ladoText} ${marcaText} ${subMarcaText} ${modeloText}`;
  };

  const handleClean = () => {
    setParte('');
    setPosicion('');
    setLado('');
    setMarca('');
    setSubMarca('');
    setModelo('');
  };

  return (
    <div className="card p-6 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
          Product Description
        </h2>
      </div>

      <form className="space-y-6">
        {/* Parte */}
        <div className="w-full">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Parte
          </label>
          <div className="flex flex-wrap gap-4">
            {parteOptions.map((option) => (
              <label key={option.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="parte"
                  value={option.value}
                  checked={parte === option.value}
                  onChange={(e) => setParte(e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 border-slate-300"
                />
                <span className="ml-2 text-sm text-slate-700">
                  {option.value} - {option.label}
                </span>
              </label>
            ))}
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
            {vehicleBrandAbbreviations.cars.map((brand) => (
              <option key={brand.abbr} value={brand.name}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sub-Marca */}
        <div className="w-full">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Sub-Marca
          </label>
          <input
            type="text"
            value={subMarca}
            onChange={(e) => setSubMarca(e.target.value)}
            placeholder="e.g., Sprinter, Corolla, Civic"
            className="block w-full px-4 py-2.5 text-base bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition-all duration-200"
          />
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

        {/* Clean Button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleClean}
            className="btn btn-primary btn-md w-full"
          >
            Clean
          </button>
        </div>
      </form>

      {/* Generated Product Description Display */}
      <div className="mt-6 lg:mt-8 p-6 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
        <p className="text-sm text-slate-600 mb-2 text-center font-medium">
          Generated Product Description
        </p>
        <p className="text-2xl lg:text-3xl font-semibold text-center text-slate-900 leading-relaxed">
          {generateDescription()}
        </p>
      </div>
    </div>
  );
}
