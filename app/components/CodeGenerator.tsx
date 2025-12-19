'use client';

import { useState, useEffect } from 'react';

export default function CodeGenerator() {
  const [clasificacion, setClasificacion] = useState('');
  const [parte, setParte] = useState('');
  const [numero, setNumero] = useState('');
  const [color, setColor] = useState('');
  const [aditamento, setAditamento] = useState('');

  // Generate code in real-time
  const generateCode = (): string => {
    const clasificacionCode = clasificacion || '-';
    const parteCode = parte || '-';
    const numeroCode = numero ? numero.padStart(5, '0') : '-----';
    const colorCode = color || '-';
    const aditamentoCode = aditamento || '-';

    return `${clasificacionCode}${parteCode}${numeroCode}${colorCode}${aditamentoCode}`.toUpperCase();
  };

  const handleNumeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits and max 5 characters
    if (/^\d*$/.test(value) && value.length <= 5) {
      setNumero(value);
    }
  };

  const handleClean = () => {
    setClasificacion('');
    setParte('');
    setNumero('');
    setColor('');
    setAditamento('');
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Rhino Code Generator
        </h1>
        <p className="text-gray-600">
          Industrial Glass Production Catalog Reference
        </p>
      </div>

      <form className="space-y-6">
        {/* Clasificación Comercial */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Clasificación Comercial
          </label>
          <select
            value={clasificacion}
            onChange={(e) => setClasificacion(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="">Select...</option>
            <option value="D">D - Doméstico</option>
            <option value="F">F - Foránea</option>
            <option value="R">R - Rhino Automotive</option>
          </select>
        </div>

        {/* Parte */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parte
          </label>
          <div className="flex flex-wrap gap-4">
            {[
              { value: 's', label: 's - Side' },
              { value: 'b', label: 'b - Back' },
              { value: 'd', label: 'd - Door' },
              { value: 'q', label: 'q - Quarter' },
              { value: 'v', label: 'v - Vent' },
            ].map((option) => (
              <label key={option.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="parte"
                  value={option.value}
                  checked={parte === option.value}
                  onChange={(e) => setParte(e.target.value)}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Número */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número
          </label>
          <input
            type="text"
            value={numero}
            onChange={handleNumeroChange}
            placeholder="00000"
            maxLength={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="">Select...</option>
            <option value="GT">GT - Green Tint</option>
            <option value="YT">YT - Gray Tint</option>
            <option value="YP">YP - Gray Tint Privacy</option>
            <option value="CL">CL - Clear</option>
          </select>
        </div>

        {/* Aditamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">Y</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="aditamento"
                value="N"
                checked={aditamento === 'N'}
                onChange={(e) => setAditamento(e.target.value)}
                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">N</span>
            </label>
          </div>
        </div>

        {/* Clean Button */}
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={handleClean}
            className="px-8 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
          >
            Clean
          </button>
        </div>
      </form>

      {/* Generated Code Display */}
      <div className="mt-8 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <p className="text-sm text-gray-600 mb-2 text-center">
          Generated Rhino Code
        </p>
        <p className="text-4xl font-mono font-bold text-center text-gray-800 tracking-wider">
          {generateCode()}
        </p>
      </div>
    </div>
  );
}
