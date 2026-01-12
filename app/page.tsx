'use client';

import { useState } from 'react';
import CodeGenerator from './components/CodeGenerator';
import ProductCompatibility from './components/ProductCompatibility';
import Header from './components/Header';
import SavedProductsTable from './components/SavedProductsTable';

export interface Compatibility {
  marca: string;
  subModelo: string;
  version: string;
  modelo: string;
}

export interface ProductData {
  productCode: {
    clasificacion: string;
    parte: string;
    numero: string;
    color: string;
    aditamento: string;
    generated: string;
  };
  compatibility: {
    items: Compatibility[];
    generated: string;
  };
  description: {
    parte: string;
    posicion: string;
    lado: string;
    generated: string;
  };
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

  // Saved Products state
  const [savedProducts, setSavedProducts] = useState<ProductData[]>([]);

  // ========================================
  // HELPER FUNCTIONS - Generate formatted strings
  // ========================================

  /**
   * Generate product code string
   * If aditamento is 'F' (Fixed), the code ends at color without adding aditamento
   */
  const generateProductCode = (): string => {
    const clasificacionCode = clasificacion || '-';
    const parteCode = parte || '-';
    const numeroCode = numero ? numero.padStart(5, '0') : '-----';
    const colorCode = color || '-';
    
    // If aditamento is 'F' (Fixed), don't add it to the code
    if (aditamento === 'F') {
      return `${clasificacionCode}${parteCode}${numeroCode}${colorCode}`.toUpperCase();
    }
    
    // Otherwise, include aditamento in the code
    const aditamentoCode = aditamento || '-';
    return `${clasificacionCode}${parteCode}${numeroCode}${colorCode}${aditamentoCode}`.toUpperCase();
  };

  /**
   * Format a single compatibility entry for display
   * Format: MARCA SUBMODELO-VERSION YEAR or MARCA SUBMODELO YEAR (if no version)
   */
  const formatCompatibilityEntry = (comp: Compatibility): string => {
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

  /**
   * Generate compatibility string (mirrors ProductCompatibility logic)
   */
  const generateCompatibilityString = (): string => {
    if (compatibilities.length === 0) return '---';
    
    return compatibilities
      .map(comp => formatCompatibilityEntry(comp))
      .join(', ')
      .toUpperCase();
  };

  /**
   * Generate product description (mirrors ProductDescription logic)
   */
  const generateProductDescription = (): string => {
    // Parte options mapping
    const parteOptions = [
      { value: 's', label: 'Side' },
      { value: 'b', label: 'Back' },
      { value: 'd', label: 'Door' },
      { value: 'q', label: 'Quarter' },
      { value: 'v', label: 'Vent' },
    ];

    const parteLabel = parteOptions.find(p => p.value === parte)?.label || '-';
    const posicionText = posicion || '-';
    const ladoText = lado || '-';
    
    // Base description
    let description = `${parteLabel} ${posicionText} ${ladoText}`;
    
    // Add grouped compatibilities if any exist
    if (compatibilities.length > 0) {
      // Group by marca + subModelo + version
      const grouped = new Map<string, string[]>();
      
      compatibilities.forEach(comp => {
        // Create key based on marca, subModelo, and version
        let key: string;
        if (!comp.subModelo) {
          // Custom entry
          key = comp.marca;
        } else if (comp.version) {
          key = `${comp.marca} ${comp.subModelo}-${comp.version}`;
        } else {
          key = `${comp.marca} ${comp.subModelo}`;
        }
        
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)!.push(comp.modelo);
      });

      // Build compatibility text
      const parts: string[] = [];
      grouped.forEach((years, key) => {
        const sortedYears = years.sort((a, b) => parseInt(a) - parseInt(b));
        parts.push(`${key} ${sortedYears.join(', ')}`);
      });

      description += ` ${parts.join(' ')}`;
    }

    return description.toUpperCase();
  };

  // ========================================
  // VALIDATION
  // ========================================

  /**
   * Check if any data exists across all three sections
   */
  const hasAnyData = (): boolean => {
    // Check CodeGenerator fields
    const hasCodeData = !!(clasificacion || parte || numero || color || aditamento);
    
    // Check ProductCompatibility
    const hasCompatibilityData = compatibilities.length > 0;
    
    // Check ProductDescription fields
    const hasDescriptionData = !!(posicion || lado);

    return hasCodeData || hasCompatibilityData || hasDescriptionData;
  };

  // ========================================
  // HANDLERS
  // ========================================

  /**
   * Add handler - collects all data, adds to table, and logs to console
   */
  const handleSave = () => {
    // Validate that at least some data exists
    if (!hasAnyData()) {
      console.warn('No data to save - all fields are empty');
      return;
    }

    // Build the ProductData object
    const productData: ProductData = {
      productCode: {
        clasificacion,
        parte,
        numero,
        color,
        aditamento,
        generated: generateProductCode(),
      },
      compatibility: {
        items: compatibilities,
        generated: generateCompatibilityString(),
      },
      description: {
        parte, // Shared with productCode
        posicion,
        lado,
        generated: generateProductDescription(),
      },
    };

    // Check if product code already exists in saved products
    const isDuplicate = savedProducts.some(
      product => product.productCode.generated === productData.productCode.generated
    );

    if (isDuplicate) {
      alert(`Product code "${productData.productCode.generated}" already exists in the table.`);
      return;
    }

    // Add to saved products table
    setSavedProducts(prev => [...prev, productData]);

    // Log to console
    console.log('Product Data:', productData);
  };

  /**
   * Delete handler - removes a product from the saved products table
   */
  const handleDeleteProduct = (index: number) => {
    setSavedProducts(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Global clean handler - clears everything
   */
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
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-8 ">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 text-gray-500">Agregar Nuevos Códigos</h1>
        <hr className="w-full border-t border-gray-300 my-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Code Generator Section - merged with Product Description */}
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
              posicion={posicion}
              setPosicion={setPosicion}
              lado={lado}
              setLado={setLado}
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
        </div>

        {/* Generated Output Display with Action Buttons - Single Row Design */}
        <div className="card p-6 lg:p-8 mb-8 mt-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
            {/* Generated Rhino Code */}
            <div className="flex-1">
              <p className="text-xs text-slate-500 mb-1.5 uppercase tracking-wide font-medium">
                Código Rhino
              </p>
              <p className="text-2xl lg:text-3xl font-mono font-bold text-slate-900 tracking-wider">
                {generateProductCode()}
              </p>
            </div>

            {/* Vertical Divider - Hidden on mobile */}
            <div className="hidden lg:block w-px h-16 bg-slate-200"></div>

            {/* Generated Product Description */}
            <div className="flex-[2]">
              <p className="text-xs text-slate-500 mb-1.5 uppercase tracking-wide font-medium">
                Descripción del Producto
              </p>
              <p className="text-lg lg:text-xl font-mono font-bold text-slate-900 leading-relaxed">
                {generateProductDescription()}
              </p>
            </div>

            {/* Vertical Divider - Hidden on mobile */}
            <div className="hidden lg:block w-px h-16 bg-slate-200"></div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full lg:w-auto">
              <button
                onClick={handleSave}
                className="btn btn-primary btn-md flex-1 lg:flex-none flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" />
                </svg>
                <span className="font-semibold">Agregar</span>
              </button>
              <button
                onClick={handleGlobalClean}
                className="btn btn-secondary btn-md flex-1 lg:flex-none flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold">Limpiar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Saved Products Table */}
        <div className="mb-6 lg:mb-8">
          <SavedProductsTable 
            products={savedProducts}
            onDelete={handleDeleteProduct}
          />
        </div>        
      </div>
    </main>
  );
}
