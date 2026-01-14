'use client';

import { useState, useEffect } from 'react';
import CodeGenerator from './components/CodeGenerator';
import ProductCompatibility from './components/ProductCompatibility';
import Header from './components/Header';
import SavedProductsTable from './components/SavedProductsTable';
import EditProductModal from './components/EditProductModal';
import { productService } from './lib/services/productService';

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
  verified: boolean;
}

export interface SavedProduct extends ProductData {
  id: string;
  created_at: string;
  updated_at: string;
  status?: string;
}

export default function Home() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'agregar' | 'db'>('agregar');

  // Form state
  const [clasificacion, setClasificacion] = useState('');
  const [parte, setParte] = useState('');
  const [numero, setNumero] = useState('');
  const [color, setColor] = useState('');
  const [aditamento, setAditamento] = useState('');
  const [posicion, setPosicion] = useState('');
  const [lado, setLado] = useState('');
  const [compatibilities, setCompatibilities] = useState<Compatibility[]>([]);
  const [compatibilityResetTrigger, setCompatibilityResetTrigger] = useState(0);

  // Local products (Agregar tab)
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const [isSavingAll, setIsSavingAll] = useState(false);

  // DB products (DB Codigos tab)
  const [dbProducts, setDbProducts] = useState<SavedProduct[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SavedProduct | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load DB products when switching to DB tab
  useEffect(() => {
    if (activeTab === 'db') {
      loadDbProducts();
    }
  }, [activeTab]);

  const loadDbProducts = async () => {
    setIsLoadingDb(true);
    try {
      const { data, error } = await productService.getProducts();
      if (error) {
        console.error('Error loading DB products:', error);
        alert('Error al cargar productos de la base de datos');
        setDbProducts([]);
      } else if (data) {
        setDbProducts(data);
      }
    } catch (error) {
      console.error('Unexpected error loading DB products:', error);
      setDbProducts([]);
    } finally {
      setIsLoadingDb(false);
    }
  };

  const generateProductCode = (): string => {
    const clasificacionCode = clasificacion || '-';
    const parteCode = parte || '-';
    const numeroCode = numero ? numero.padStart(5, '0') : '-----';
    const colorCode = color || '--';
    
    if (aditamento === 'F') {
      return `${clasificacionCode}${parteCode}${numeroCode}${colorCode}`.toUpperCase();
    }
    
    const aditamentoCode = aditamento || '-';
    return `${clasificacionCode}${parteCode}${numeroCode}${colorCode}${aditamentoCode}`.toUpperCase();
  };

  const formatCompatibilityEntry = (comp: Compatibility): string => {
    if (!comp.subModelo) {
      return `${comp.marca} ${comp.modelo}`;
    }
    
    if (comp.version) {
      return `${comp.marca} ${comp.subModelo}-${comp.version} ${comp.modelo}`;
    }
    
    return `${comp.marca} ${comp.subModelo} ${comp.modelo}`;
  };

  const generateCompatibilityString = (): string => {
    if (compatibilities.length === 0) return '---';
    
    return compatibilities
      .map(comp => formatCompatibilityEntry(comp))
      .join(', ')
      .toUpperCase();
  };

  const generateProductDescription = (): string => {
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
    
    let description = `${parteLabel} ${posicionText} ${ladoText}`;
    
    if (compatibilities.length > 0) {
      const grouped = new Map<string, string[]>();
      
      compatibilities.forEach(comp => {
        let key: string;
        if (!comp.subModelo) {
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

      const parts: string[] = [];
      grouped.forEach((years, key) => {
        const sortedYears = years.sort((a, b) => parseInt(a) - parseInt(b));
        parts.push(`${key} ${sortedYears.join(', ')}`);
      });

      description += ` ${parts.join(' ')}`;
    }

    return description.toUpperCase();
  };

  const hasAnyData = (): boolean => {
    const hasCodeData = !!(clasificacion || parte || numero || color || aditamento);
    const hasCompatibilityData = compatibilities.length > 0;
    const hasDescriptionData = !!(posicion || lado);
    return hasCodeData || hasCompatibilityData || hasDescriptionData;
  };

  const handleSave = () => {
    if (!hasAnyData()) {
      console.warn('No data to save - all fields are empty');
      return;
    }

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
        parte,
        posicion,
        lado,
        generated: generateProductDescription(),
      },
      verified: false,
    };

    const generatedCode = productData.productCode.generated;
    const isDuplicate = savedProducts.some(
      product => product.productCode.generated === generatedCode
    );

    if (isDuplicate) {
      alert(`El código "${generatedCode}" ya existe en la tabla`);
      return;
    }

    const localProduct: SavedProduct = {
      ...productData,
      id: `local-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'active',
    };

    setSavedProducts(prev => [localProduct, ...prev]);
    console.log('Product Data:', localProduct);
  };

  const handleDeleteProduct = (index: number) => {
    const product = savedProducts[index];
    const confirmed = confirm(`¿Eliminar el producto "${product.productCode.generated}"?`);
    if (!confirmed) return;
    setSavedProducts(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteDbProduct = async (index: number) => {
    const product = dbProducts[index];
    const confirmed = confirm(`¿Eliminar el producto "${product.productCode.generated}" de la base de datos?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/products/${product.id}?hard=true`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error deleting from database:', errorData);
        alert('Error al eliminar producto');
        return;
      }

      setDbProducts(prev => prev.filter((_, i) => i !== index));
      alert('Producto eliminado exitosamente');
    } catch (error) {
      console.error('Unexpected error deleting:', error);
      alert('Error inesperado al eliminar');
    }
  };

  const handleToggleVerified = (index: number) => {
    setSavedProducts(prev =>
      prev.map((product, i) =>
        i === index ? { ...product, verified: !product.verified } : product
      )
    );
  };

  const handleToggleDbVerified = async (index: number) => {
    const product = dbProducts[index];
    const newVerifiedStatus = !product.verified;

    console.log('Toggling verified for product:', product.id, 'to:', newVerifiedStatus);

    // Optimistically update UI
    setDbProducts(prev =>
      prev.map((p, i) =>
        i === index ? { ...p, verified: newVerifiedStatus } : p
      )
    );

    try {
      // Update in database - only send the verified field
      console.log('Calling updateProduct...');
      const { error } = await productService.updateProduct(product.id, {
        verified: newVerifiedStatus,
      });
      console.log('Update result:', error ? 'ERROR' : 'SUCCESS');

      if (error) {
        console.error('Error updating verified status:', error);
        // Revert on error
        setDbProducts(prev =>
          prev.map((p, i) =>
            i === index ? { ...p, verified: !newVerifiedStatus } : p
          )
        );
        alert('Error al actualizar el estado de verificación');
      }
    } catch (error) {
      console.error('Unexpected error updating verified status:', error);
      // Revert on error
      setDbProducts(prev =>
        prev.map((p, i) =>
          i === index ? { ...p, verified: !newVerifiedStatus } : p
        )
      );
    }
  };

  const handleEditDbProduct = (index: number) => {
    const product = dbProducts[index];
    setEditingProduct(product);
    setEditModalOpen(true);
  };

  const handleUpdateDbProduct = async (updatedProduct: SavedProduct) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productCode: updatedProduct.productCode,
          compatibility: updatedProduct.compatibility,
          description: updatedProduct.description,
          verified: updatedProduct.verified,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error updating product:', errorData);
        alert('Error al actualizar el producto');
        return;
      }

      // Update local state
      setDbProducts(prev =>
        prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
      );

      setEditModalOpen(false);
      setEditingProduct(null);
      alert('Producto actualizado exitosamente');
    } catch (error) {
      console.error('Unexpected error updating product:', error);
      alert('Error inesperado al actualizar');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGlobalClean = () => {
    setClasificacion('');
    setParte('');
    setNumero('');
    setColor('');
    setAditamento('');
    setPosicion('');
    setLado('');
    setCompatibilities([]);
    setCompatibilityResetTrigger(prev => prev + 1);
  };

  const handleGuardarTodos = async () => {
    if (savedProducts.length === 0) {
      alert('No hay productos para guardar');
      return;
    }
    
    const confirmed = confirm(`¿Guardar ${savedProducts.length} producto(s) a la base de datos?`);
    if (!confirmed) return;

    setIsSavingAll(true);
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const product of savedProducts) {
      try {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productCode: product.productCode,
            compatibility: product.compatibility,
            description: product.description,
            verified: product.verified,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          errorCount++;
          errors.push(`${product.productCode.generated}: ${errorData.error}`);
          console.error('Error saving product:', product.productCode.generated, errorData);
        } else {
          successCount++;
          console.log('Saved:', product.productCode.generated);
        }
      } catch (error) {
        errorCount++;
        errors.push(`${product.productCode.generated}: Error inesperado`);
        console.error('Unexpected error saving product:', error);
      }
    }

    setIsSavingAll(false);

    if (errorCount === 0) {
      alert(`✅ Todos los productos guardados exitosamente (${successCount})`);
      setSavedProducts([]);
    } else if (successCount === 0) {
      alert(`❌ Error al guardar todos los productos\n\n${errors.join('\n')}`);
    } else {
      alert(`⚠️ Guardados: ${successCount}\nErrores: ${errorCount}\n\n${errors.join('\n')}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <Header />

      {/* Tabs Navigation */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-8">
        <div className="flex w-full">
          <button
            onClick={() => setActiveTab('agregar')}
            className={`flex-1 py-4 font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'agregar'
                ? 'border-b-4 !border-[#f97316] text-orange-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Agregar Códigos
          </button>
          <button
            onClick={() => setActiveTab('db')}
            className={`flex-1 py-4 font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'db'
                ? 'border-b-4 !border-[#f97316] text-orange-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
              <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
              <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
            </svg>
            BD Códigos
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-8">
        {activeTab === 'agregar' ? (
          // AGREGAR TAB
          <>            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
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
              <div>
                <ProductCompatibility 
                  compatibilities={compatibilities}
                  setCompatibilities={setCompatibilities}
                  resetTrigger={compatibilityResetTrigger}
                />
              </div>
            </div>

            <div className="card p-6 lg:p-8 mb-8 mt-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1.5 uppercase tracking-wide font-medium">
                    Código Rhino
                  </p>
                  <p className="text-2xl lg:text-3xl font-mono font-bold text-slate-900 tracking-wider">
                    {generateProductCode()}
                  </p>
                </div>
                <div className="hidden lg:block w-px h-16 bg-slate-200"></div>
                <div className="flex-[2]">
                  <p className="text-xs text-slate-500 mb-1.5 uppercase tracking-wide font-medium">
                    Descripción del Producto
                  </p>
                  <p className="text-lg lg:text-xl font-mono font-bold text-slate-900 leading-relaxed">
                    {generateProductDescription()}
                  </p>
                </div>
                <div className="hidden lg:block w-px h-16 bg-slate-200"></div>
                <div className="flex gap-3 w-full lg:w-auto">
                  <button
                    onClick={handleSave}
                    className="btn btn-md flex-1 lg:flex-none flex items-center justify-center gap-2 !border-2 !border-[#2563eb] text-blue-600 hover:bg-blue-50 bg-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Agregar</span>
                  </button>
                  <button
                    onClick={handleGlobalClean}
                    className="btn btn-secondary btn-md flex-1 lg:flex-none flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Limpiar</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-6 lg:mb-8">
              <SavedProductsTable
                products={savedProducts}
                onDelete={handleDeleteProduct}
                onToggleVerified={handleToggleVerified}
              />
            </div>

            <div className="flex justify-center mb-8 w-full px-4 lg:px-0">
              <button
                onClick={handleGuardarTodos}
                disabled={savedProducts.length === 0 || isSavingAll}
                className="btn btn-primary btn-xl w-full lg:w-auto lg:min-w-[500px] py-5 text-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {isSavingAll ? (
                  <>
                    <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>Guardar todo en Base de Datos</span>
                )}
              </button>
            </div>
          </>
        ) : (
          // DB CÓDIGOS TAB
          <>
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={loadDbProducts}
                disabled={isLoadingDb}
                className="btn btn-secondary btn-md flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span>Actualizar</span>
              </button>
            </div>
            <hr className="w-full border-t border-gray-300 my-6" />

            {isLoadingDb ? (
              <div className="card p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-slate-600">Cargando productos...</p>
              </div>
            ) : (
              <SavedProductsTable
                products={dbProducts}
                onDelete={handleDeleteDbProduct}
                onToggleVerified={handleToggleDbVerified}
                onEdit={handleEditDbProduct}
              />
            )}
          </>
        )}
      </div>

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={editModalOpen}
        product={editingProduct}
        onClose={() => {
          setEditModalOpen(false);
          setEditingProduct(null);
        }}
        onUpdate={handleUpdateDbProduct}
        isUpdating={isUpdating}
      />
    </main>
  );
}
