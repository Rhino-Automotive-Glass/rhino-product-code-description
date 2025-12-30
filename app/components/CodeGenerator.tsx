'use client';

import { useState } from 'react';

interface CodeGeneratorProps {
  parte: string;
  setParte: (value: string) => void;
}

export default function CodeGenerator({ parte, setParte }: CodeGeneratorProps) {
  const [clasificacion, setClasificacion] = useState('');
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
    <div className="card p-6 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
          Product Code
        </h1>
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
          </label>
          <input
            type="text"
            value={numero}
            onChange={handleNumeroChange}
            placeholder="00000"
            maxLength={5}
            className="block w-full px-4 py-2.5 text-base bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition-all duration-200"
          />
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
              <span className="ml-2 text-sm text-slate-700">Y</span>
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
              <span className="ml-2 text-sm text-slate-700">N</span>
            </label>
          </div>
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

      {/* Generated Code Display */}
      <div className="mt-6 lg:mt-8 p-6 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
        <p className="text-sm text-slate-600 mb-2 text-center font-medium">
          Generated Rhino Code
        </p>
        <p className="text-3xl lg:text-4xl font-mono font-bold text-center text-slate-900 tracking-wider">
          {generateCode()}
        </p>
      </div>
    </div>
  );
}
