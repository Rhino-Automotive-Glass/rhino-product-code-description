'use client';

import { useState, useEffect } from 'react';
import { SavedProduct, Compatibility } from '../page';
import { carBrandsWithSubModels } from '../../carBrands';

interface EditProductModalProps {
  isOpen: boolean;
  product: SavedProduct | null;
  onClose: () => void;
  onUpdate: (product: SavedProduct) => void;
  isUpdating: boolean;
}

interface SubModel {
  name: string;
  versions: string[];
}

export default function EditProductModal({
  isOpen,
  product,
  onClose,
  onUpdate,
  isUpdating,
}: EditProductModalProps) {
  // Product Details form state
  const [clasificacion, setClasificacion] = useState('');
  const [parte, setParte] = useState('');
  const [numero, setNumero] = useState('');
  const [color, setColor] = useState('');
  const [aditamento, setAditamento] = useState('');
  const [posicion, setPosicion] = useState('');
  const [lado, setLado] = useState('');

  // Compatibility form state
  const [compatibilities, setCompatibilities] = useState<Compatibility[]>([]);
  const [marca, setMarca] = useState('');
  const [subModelo, setSubModelo] = useState('');
  const [version, setVersion] = useState('');
  const [modelo, setModelo] = useState('');
  const [customMarca, setCustomMarca] = useState('');

  // Load product data when modal opens
  useEffect(() => {
    if (product && isOpen) {
      setClasificacion(product.productCode.clasificacion || '');
      setParte(product.productCode.parte || '');
      setNumero(product.productCode.numero || '');
      setColor(product.productCode.color || '');
      setAditamento(product.productCode.aditamento || '');
      setPosicion(product.description.posicion || '');
      setLado(product.description.lado || '');
      setCompatibilities(product.compatibility.items || []);
      // Reset compatibility form
      setMarca('');
      setSubModelo('');
      setVersion('');
      setModelo('');
      setCustomMarca('');
    }
  }, [product, isOpen]);

  const isOtroSelected = marca === 'Otro';

  const getSubModelos = (): SubModel[] => {
    if (isOtroSelected) return [];
    const selectedBrand = carBrandsWithSubModels.find(brand => brand.name === marca);
    if (!selectedBrand) return [];
    return selectedBrand.subModels;
  };

  const getVersions = (): string[] => {
    if (isOtroSelected || !subModelo) return [];
    const subModels = getSubModelos();
    const selectedSubModel = subModels.find(sm => sm.name === subModelo);
    if (!selectedSubModel) return [];
    return selectedSubModel.versions;
  };

  const hasVersions = (): boolean => {
    return getVersions().length > 0;
  };

  // Reset dependent fields when parent changes
  useEffect(() => {
    setSubModelo('');
    setVersion('');
    setCustomMarca('');
  }, [marca]);

  useEffect(() => {
    setVersion('');
  }, [subModelo]);

  const handleNumeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 5) {
      setNumero(value);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2000 + 1 },
    (_, i) => 2000 + i
  ).reverse();

  const isDuplicate = (newCompatibility: Compatibility): boolean => {
    return compatibilities.some(
      comp =>
        comp.marca === newCompatibility.marca &&
        comp.subModelo === newCompatibility.subModelo &&
        comp.version === newCompatibility.version &&
        comp.modelo === newCompatibility.modelo
    );
  };

  const handleAddCompatibility = () => {
    if (isOtroSelected) {
      if (!customMarca.trim() || !modelo) {
        alert('Por favor ingresa la marca/modelo personalizado y el año');
        return;
      }
    } else {
      if (!marca || !subModelo || !modelo) {
        alert('Por favor selecciona todos los campos requeridos antes de añadir la compatibilidad');
        return;
      }
    }

    const newCompatibility: Compatibility = isOtroSelected
      ? {
          marca: customMarca.trim(),
          subModelo: '',
          version: '',
          modelo,
        }
      : {
          marca,
          subModelo,
          version,
          modelo,
        };

    if (isDuplicate(newCompatibility)) {
      alert('Esta compatibilidad ya existe');
      return;
    }

    setCompatibilities([...compatibilities, newCompatibility]);

    if (isOtroSelected) {
      setCustomMarca('');
      setModelo('');
    }
  };

  const handleRemoveCompatibility = (index: number) => {
    setCompatibilities(compatibilities.filter((_, i) => i !== index));
  };

  const formatCompatibilityDisplay = (comp: Compatibility): string => {
    if (!comp.subModelo) {
      return `${comp.marca} ${comp.modelo}`;
    }
    if (comp.version) {
      return `${comp.marca} ${comp.subModelo}-${comp.version} ${comp.modelo}`;
    }
    return `${comp.marca} ${comp.subModelo} ${comp.modelo}`;
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

  const generateCompatibilityString = (): string => {
    if (compatibilities.length === 0) return '---';

    return compatibilities
      .map(comp => formatCompatibilityDisplay(comp))
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

  const handleSubmit = () => {
    if (!product) return;

    const updatedProduct: SavedProduct = {
      ...product,
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
      updated_at: new Date().toISOString(),
    };

    onUpdate(updatedProduct);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-6xl bg-white rounded-xl shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-slate-900">Editar Producto</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Details */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Product Details</h3>

                <div className="space-y-5">
                  {/* Clasificación Comercial */}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Clasificación Comercial
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {[
                        { value: 'D', label: 'D - Doméstico' },
                        { value: 'F', label: 'F - Foránea' },
                        { value: 'R', label: 'R - Rhino Automotive' },
                      ].map(option => (
                        <label key={option.value} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="edit-clasificacion"
                            value={option.value}
                            checked={clasificacion === option.value}
                            onChange={(e) => setClasificacion(e.target.value)}
                            className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 border-slate-300"
                          />
                          <span className="ml-2 text-sm text-slate-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Parte */}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Parte
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {[
                        { value: 's', label: 'S - Side' },
                        { value: 'b', label: 'B - Back' },
                        { value: 'd', label: 'D - Door' },
                        { value: 'q', label: 'Q - Quarter' },
                        { value: 'v', label: 'V - Vent' },
                      ].map(option => (
                        <label key={option.value} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="edit-parte"
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
                      {[
                        { value: 'Y', label: 'Y - Yes' },
                        { value: 'N', label: 'N - No' },
                        { value: 'F', label: 'F - Fixed' },
                      ].map(option => (
                        <label key={option.value} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="edit-aditamento"
                            value={option.value}
                            checked={aditamento === option.value}
                            onChange={(e) => setAditamento(e.target.value)}
                            className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 border-slate-300"
                          />
                          <span className="ml-2 text-sm text-slate-700">{option.label}</span>
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
                      {[
                        { value: 'Front', label: 'Front' },
                        { value: 'Rear', label: 'Rear' },
                      ].map(option => (
                        <label key={option.value} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="edit-posicion"
                            value={option.value}
                            checked={posicion === option.value}
                            onChange={(e) => setPosicion(e.target.value)}
                            className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 border-slate-300"
                          />
                          <span className="ml-2 text-sm text-slate-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Lado */}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Lado
                    </label>
                    <div className="flex gap-6">
                      {[
                        { value: 'Left', label: 'Left' },
                        { value: 'Right', label: 'Right' },
                      ].map(option => (
                        <label key={option.value} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="edit-lado"
                            value={option.value}
                            checked={lado === option.value}
                            onChange={(e) => setLado(e.target.value)}
                            className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 border-slate-300"
                          />
                          <span className="ml-2 text-sm text-slate-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Compatibility */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Product Compatibility</h3>

                <div className="space-y-5">
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
                      <option value="">Seleccionar...</option>
                      {carBrandsWithSubModels.map((brand) => (
                        <option key={brand.abbr} value={brand.name}>
                          {brand.name}
                        </option>
                      ))}
                      <option disabled>──────────</option>
                      <option value="Otro">Otro (Personalizado)</option>
                    </select>
                  </div>

                  {isOtroSelected ? (
                    <div className="w-full">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Marca y Modelo Personalizado
                      </label>
                      <input
                        type="text"
                        value={customMarca}
                        onChange={(e) => setCustomMarca(e.target.value)}
                        placeholder="Ej: Honda Civic, Toyota Corolla..."
                        className="block w-full px-4 py-2.5 text-base bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition-all duration-200"
                      />
                    </div>
                  ) : (
                    <>
                      {/* Sub-Modelo */}
                      <div className="w-full">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Sub-Modelo
                        </label>
                        <select
                          value={subModelo}
                          onChange={(e) => setSubModelo(e.target.value)}
                          disabled={!marca}
                          className="block w-full px-4 py-2.5 text-base bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition-all duration-200 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {marca ? 'Seleccionar...' : 'Selecciona una Marca primero...'}
                          </option>
                          {getSubModelos().map((subModel) => (
                            <option key={subModel.name} value={subModel.name}>
                              {subModel.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Version */}
                      <div className="w-full">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Versión
                          <span className="ml-1 text-xs text-slate-400 font-normal">(opcional)</span>
                        </label>
                        <select
                          value={version}
                          onChange={(e) => setVersion(e.target.value)}
                          disabled={!subModelo || !hasVersions()}
                          className="block w-full px-4 py-2.5 text-base bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition-all duration-200 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {!subModelo
                              ? 'Selecciona un Sub-Modelo primero...'
                              : !hasVersions()
                              ? 'No hay versiones disponibles'
                              : 'Seleccionar... (opcional)'
                            }
                          </option>
                          {getVersions().map((ver) => (
                            <option key={ver} value={ver}>
                              {ver}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {/* Modelo (Year) */}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Modelo (Año)
                    </label>
                    <select
                      value={modelo}
                      onChange={(e) => setModelo(e.target.value)}
                      className="block w-full px-4 py-2.5 text-base bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400 transition-all duration-200"
                    >
                      <option value="">Seleccionar...</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Add Compatibility Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleAddCompatibility}
                      className="btn btn-md w-full !border-2 !border-[#2563eb] text-blue-600 hover:bg-blue-50 bg-white"
                    >
                      Agregar Compatibilidad
                    </button>
                  </div>

                  {/* Compatibility List */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">
                      Compatibilidades Añadidas ({compatibilities.length})
                    </h4>

                    {compatibilities.length === 0 ? (
                      <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                        <p className="text-sm text-slate-500 text-center">
                          No se han añadido compatibilidades
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {compatibilities.map((comp, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                          >
                            <span className="text-sm font-medium text-slate-900">
                              {formatCompatibilityDisplay(comp)}
                              {!comp.subModelo && (
                                <span className="ml-2 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                  Personalizado
                                </span>
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCompatibility(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="mt-6 p-6 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1.5 uppercase tracking-wide font-medium">
                    Código Rhino
                  </p>
                  <p className="text-xl font-mono font-bold text-slate-900 tracking-wider">
                    {generateProductCode()}
                  </p>
                </div>
                <div className="hidden lg:block w-px h-12 bg-slate-300"></div>
                <div className="flex-[2]">
                  <p className="text-xs text-slate-500 mb-1.5 uppercase tracking-wide font-medium">
                    Descripción del Producto
                  </p>
                  <p className="text-lg font-mono font-bold text-slate-900 leading-relaxed">
                    {generateProductDescription()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="btn btn-secondary btn-md"
              disabled={isUpdating}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUpdating}
              className="btn btn-primary btn-md flex items-center gap-2"
            >
              {isUpdating ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Actualizando...</span>
                </>
              ) : (
                <span>Actualizar</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
