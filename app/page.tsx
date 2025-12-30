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
  const [parte, setParte] = useState('');
  const [compatibilities, setCompatibilities] = useState<Compatibility[]>([]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Code Generator Section */}
          <div>
            <CodeGenerator parte={parte} setParte={setParte} />
          </div>
          {/* Product Compatibility Section */}
          <div className="md:col-span-2 lg:col-span-1">
            <ProductCompatibility 
              compatibilities={compatibilities}
              setCompatibilities={setCompatibilities}
            />
          </div>
          {/* Product Description Section */}
          <div>
            <ProductDescription parte={parte} compatibilities={compatibilities} />
          </div>
        </div>
      </div>
    </main>
  );
}
