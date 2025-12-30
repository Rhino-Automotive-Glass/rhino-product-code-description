'use client';

import { useState } from 'react';
import CodeGenerator from './components/CodeGenerator';
import ProductDescription from './components/ProductDescription';
import ProductCompatibility from './components/ProductCompatibility';

export interface Compatibility {
  marca: string;
  subModelo: string;
  modelo: string;
}

export default function Home() {
  // CodeGenerator state
  const [clasificacion, setClasificacion] = useState('');
  const [parte, setParte] = useState('');
  const [numero, setNumero] = useState('');
  const [color, setColor] = useState('');
  const [aditamento, setAditamento] = useState('');

  // ProductDescription state
  const [posicion, setPosicion] = useState('');
  const [lado, setLado] = useState('');

  // ProductCompatibility state
  const [compatibilities, setCompatibilities] = useState<Compatibility[]>([]);
  const [compatibilityResetTrigger, setCompatibilityResetTrigger] = useState(0);

  // Global clean handler - clears everything
  const handleGlobalClean = () => {
    // Clear CodeGenerator
    setClasificacion('');
    setParte('');
    setNumero('');
    setColor('');
    setAditamento('');
    
    // Clear ProductDescription
    setPosicion('');
    setLado('');
    
    // Clear ProductCompatibility (list and form fields)
    setCompatibilities([]);
    setCompatibilityResetTrigger(prev => prev + 1); // Trigger form reset
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Floating Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
                Rhino Code Generator
              </h1>
              <p className="text-sm text-slate-600">
                Automotive Glass Production Catalog
              </p>
            </div>
            <button
              type="button"
              onClick={handleGlobalClean}
              className="btn btn-primary btn-md"
            >
              Clean All
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Code Generator Section */}
          <div>
            <CodeGenerator 
              clasificacion={clasificacion}
              setClasificacion={setClasificacion}
              parte={parte}
              setParte={setParte}
              numero={numero}
              setNumero={setNumero}
              color={color}
              setColor={setColor}
              aditamento={aditamento}
              setAditamento={setAditamento}
            />
          </div>

          {/* Product Compatibility Section */}
          <div>
            <ProductCompatibility 
              compatibilities={compatibilities}
              setCompatibilities={setCompatibilities}
              resetTrigger={compatibilityResetTrigger}
            />
          </div>

          {/* Product Description Section */}
          <div className="md:col-span-2 lg:col-span-1">
            <ProductDescription 
              parte={parte}
              posicion={posicion}
              setPosicion={setPosicion}
              lado={lado}
              setLado={setLado}
              compatibilities={compatibilities}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
