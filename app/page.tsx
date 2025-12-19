'use client';

import { useState } from 'react';
import CodeGenerator from './components/CodeGenerator';
import ProductDescription from './components/ProductDescription';

export default function Home() {
  const [parte, setParte] = useState('');

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Code Generator Section */}
          <div>
            <CodeGenerator parte={parte} setParte={setParte} />
          </div>

          {/* Product Description Section */}
          <div>
            <ProductDescription parte={parte} />
          </div>
        </div>
      </div>
    </main>
  );
}
