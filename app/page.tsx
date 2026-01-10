'use client';

import { useState } from 'react';
import CodeGenerator from './components/CodeGenerator';
import ProductDescription from './components/ProductDescription';
import ProductCompatibility from './components/ProductCompatibility';
import FloatingHeader from './components/FloatingHeader';
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
   * Generate product code string (mirrors CodeGenerator logic)
   */
  const generateProductCode = (): string => {
    const clasificacionCode = clasificacion || '-';
    const parteCode = parte || '-';
    const numeroCode = numero ? numero.padStart(5, '0') : '-----';
    const colorCode = color || '-';
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
   * Save handler - collects all data, adds to table, and logs to console
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
      {/* Floating Header */}
      <FloatingHeader 
        onSave={handleSave}
        onCleanAll={handleGlobalClean}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Saved Products Table */}
        <div className="mb-6 lg:mb-8">
          <SavedProductsTable 
            products={savedProducts}
            onDelete={handleDeleteProduct}
          />
        </div>
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
