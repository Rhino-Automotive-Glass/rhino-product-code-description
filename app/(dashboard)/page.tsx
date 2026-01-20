'use client';

import { useState, useEffect } from 'react';
import CodeGenerator from '../components/CodeGenerator';
import ProductCompatibility from '../components/ProductCompatibility';
import Header from '../components/Header';
import SavedProductsTable from '../components/SavedProductsTable';
import EditProductModal from '../components/EditProductModal';
import Pagination from '../components/Pagination';
import { productService } from '../lib/services/productService';

export interface Compatibility {
  marca: string;
  subModelo: string;
  version: string;
  additional: string;
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

  // Pagination state for BD Códigos tab
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 30;

  // Search state for BD Códigos tab
  const [searchTerm, setSearchTerm] = useState('');

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SavedProduct | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load DB products when switching to DB tab
  useEffect(() => {
    if (activeTab === 'db') {
      setCurrentPage(1);
      setSearchTerm('');
      loadDbProducts(1, '');
    }
  }, [activeTab]);

  const loadDbProducts = async (page: number = 1, search: string = searchTerm) => {
    setIsLoadingDb(true);
    try {
      const response = await productService.getProducts(
        'active',
        {
          page,
          pageSize: PAGE_SIZE,
          status: 'active',
        },
        search
      );

      if (response.error) {
        console.error('Error loading DB products:', response.error);
        alert('Error al cargar productos de la base de datos');
        setDbProducts([]);
        setTotalPages(0);
        setTotalCount(0);
      } else if (response.data) {
        setDbProducts(response.data);
        setCurrentPage(response.currentPage);
        setTotalPages(response.totalPages);
        setTotalCount(response.totalCount);
      }
    } catch (error) {
      console.error('Unexpected error loading DB products:', error);
      setDbProducts([]);
      setTotalPages(0);
      setTotalCount(0);
    } finally {
      setIsLoadingDb(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      loadDbProducts(nextPage);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      loadDbProducts(prevPage);
    }
  };

  const handleGoToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadDbProducts(page);
    }
  };

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1);
    loadDbProducts(1, search);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    loadDbProducts(1, '');
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

    let modelPart = comp.subModelo;
    if (comp.version) {
      modelPart += ` ${comp.version}`;
    }
    if (comp.additional) {
      modelPart += ` ${comp.additional}`;
    }

    return `${comp.marca} ${modelPart} ${comp.modelo}`;
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
      // Step 1: Group by marca+subModelo+year to collect version-additional pairs
      const pairsByGroup = new Map<string, Set<string>>();

      compatibilities.forEach(comp => {
        const key = `${comp.marca}|${comp.subModelo}|${comp.modelo}`;
        if (!pairsByGroup.has(key)) {
          pairsByGroup.set(key, new Set());
        }

        // Build version-additional pair
        let pair = '';
        if (comp.version) {
          pair = comp.version;
          if (comp.additional) {
            pair += ` ${comp.additional}`;
          }
        } else if (comp.additional) {
          pair = ` ${comp.additional}`;
        }

        if (pair) {
          pairsByGroup.get(key)!.add(pair);
        }
      });

      // Step 2: Build display strings with combined pairs, then group by years
      const finalGrouped = new Map<string, string[]>();

      pairsByGroup.forEach((pairs, key) => {
        const [marca, subModelo, modelo] = key.split('|');

        let displayKey: string;
        if (!subModelo) {
          // Custom entry (no subModel)
          displayKey = marca;
        } else {
          let modelPart = subModelo;
          if (pairs.size > 0) {
            // Group pairs by version prefix to combine additionals
            const sortedPairs = Array.from(pairs).sort();

            // Group by version (part before first space)
            const versionGroups = new Map<string, string[]>();
            sortedPairs.forEach(pair => {
              const spaceIndex = pair.indexOf(' ');
              if (spaceIndex > 0) {
                const version = pair.substring(0, spaceIndex);
                const additional = pair.substring(spaceIndex + 1);
                if (!versionGroups.has(version)) {
                  versionGroups.set(version, []);
                }
                versionGroups.get(version)!.push(additional);
              } else {
                // No additional, just version
                if (!versionGroups.has(pair.trim())) {
                  versionGroups.set(pair.trim(), []);
                }
              }
            });

            // Build combined version strings (e.g., 314 140,144 instead of 314 140, 314 144)
            const combinedPairs: string[] = [];
            versionGroups.forEach((additionals, version) => {
              if (additionals.length === 0) {
                combinedPairs.push(version);
              } else {
                combinedPairs.push(`${version} ${additionals.join(',')}`);
              }
            });

            modelPart += ` ${combinedPairs.join(', ')}`;
          }
          displayKey = `${marca} ${modelPart}`;
        }

        if (!finalGrouped.has(displayKey)) {
          finalGrouped.set(displayKey, []);
        }
        finalGrouped.get(displayKey)!.push(modelo);
      });

      const parts: string[] = [];
      finalGrouped.forEach((years, displayKey) => {
        const uniqueYears = [...new Set(years)];
        const sortedYears = uniqueYears.sort((a, b) => parseInt(a) - parseInt(b));
        // Show year range (min-max) instead of listing all years
        const yearDisplay = sortedYears.length === 1
          ? sortedYears[0]
          : `${sortedYears[0]}-${sortedYears[sortedYears.length - 1]}`;
        parts.push(`${displayKey} ${yearDisplay}`);
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

      // After successful deletion, calculate new page count
      const newTotalCount = totalCount - 1;
      const newTotalPages = Math.ceil(newTotalCount / PAGE_SIZE);

      // If current page is now beyond total pages, go to last page
      if (currentPage > newTotalPages && newTotalPages > 0) {
        loadDbProducts(newTotalPages);
      } else {
        // Reload current page
        loadDbProducts(currentPage);
      }

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
      // Update via API route to avoid CORS issues with direct Supabase calls
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verified: newVerifiedStatus }),
      });

      console.log('Update result:', response.ok ? 'SUCCESS' : 'ERROR');

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error updating verified status:', errorData);
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-0">
        <div className="bg-white rounded-t-xl shadow-sm border border-slate-200 border-b-0">
          <div className="flex w-full">
            <button
              onClick={() => setActiveTab('agregar')}
              className={`flex-1 py-4 px-6 font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2.5 relative ${
                activeTab === 'agregar'
                  ? 'text-orange-600 bg-gradient-to-b from-orange-50 to-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              <span>Agregar Códigos</span>
              {activeTab === 'agregar' && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-t-sm"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('db')}
              className={`flex-1 py-4 px-6 font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2.5 relative ${
                activeTab === 'db'
                  ? 'text-orange-600 bg-gradient-to-b from-orange-50 to-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
              </svg>
              <span>BD Códigos</span>
              {activeTab === 'db' && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-t-sm"></span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-b-xl shadow-sm border border-slate-200 border-t-0 p-6 lg:p-8">
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

            <div className="card p-6 lg:p-8 mt-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Código Generado</h2>
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide font-semibold">
                    Código Rhino
                  </p>
                  <p className="text-xl lg:text-2xl font-mono font-bold text-slate-900 tracking-wide">
                    {generateProductCode()}
                  </p>
                </div>
                <div className="hidden lg:block w-px h-16 bg-slate-200"></div>
                <div className="flex-[2]">
                  <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide font-semibold">
                    Descripción del Producto
                  </p>
                  <p className="text-base lg:text-lg font-mono font-semibold text-slate-900 leading-relaxed">
                    {generateProductDescription()}
                  </p>
                </div>
                <div className="hidden lg:block w-px h-16 bg-slate-200"></div>
                <div className="flex gap-3 w-full lg:w-auto">
                  <button
                    onClick={handleSave}
                    className="btn btn-primary btn-md flex-1 lg:flex-none gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    <span>Agregar</span>
                  </button>
                  <button
                    onClick={handleGlobalClean}
                    className="btn btn-secondary btn-md flex-1 lg:flex-none gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Limpiar</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <SavedProductsTable
                products={savedProducts}
                onDelete={handleDeleteProduct}
                onToggleVerified={handleToggleVerified}
              />
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={handleGuardarTodos}
                disabled={savedProducts.length === 0 || isSavingAll}
                className="btn btn-accent btn-lg w-full lg:w-auto lg:min-w-[400px] gap-3"
              >
                {isSavingAll ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <button
                onClick={() => loadDbProducts(currentPage)}
                disabled={isLoadingDb}
                className="btn btn-secondary btn-md flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span>Actualizar</span>
              </button>

              <div className="flex-1 relative">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Buscar por código o descripción..."
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  {searchTerm && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Clear search"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="relative min-h-[600px] mt-6">
              {dbProducts.length === 0 && !isLoadingDb ? (
                <div className="card p-8 text-center">
                  {searchTerm ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-slate-600 text-lg mb-2">No se encontraron resultados</p>
                      <p className="text-slate-400 text-sm">Intenta con otro término de búsqueda</p>
                    </>
                  ) : (
                    <p className="text-slate-600">No hay productos en la base de datos</p>
                  )}
                </div>
              ) : (
                <>
                  <div className={`mb-6 transition-opacity duration-200 ${isLoadingDb ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <SavedProductsTable
                      products={dbProducts}
                      onDelete={handleDeleteDbProduct}
                      onToggleVerified={handleToggleDbVerified}
                      onEdit={handleEditDbProduct}
                    />
                  </div>

                  {totalPages > 0 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={totalCount}
                      itemsPerPage={PAGE_SIZE}
                      onPageChange={handleGoToPage}
                      onNextPage={handleNextPage}
                      onPreviousPage={handlePreviousPage}
                      isLoading={isLoadingDb}
                    />
                  )}

                  {isLoadingDb && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                      <div className="bg-white rounded-lg shadow-lg p-6 flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <p className="text-slate-700 font-medium">Cargando productos...</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
        </div>
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
