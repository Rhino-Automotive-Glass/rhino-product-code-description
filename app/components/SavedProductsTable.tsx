'use client';

import { ProductData } from '../(dashboard)/page';

export type SortField = 'productCode' | 'description' | null;
export type SortDirection = 'asc' | 'desc';

interface SavedProductsTableProps {
  products: ProductData[];
  onDelete?: (index: number) => void;
  onToggleVerified: (index: number) => void;
  onEdit?: (index: number) => void;
  canToggleVerified?: boolean;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField) => void;
}

export default function SavedProductsTable({
  products,
  onDelete,
  onToggleVerified,
  onEdit,
  canToggleVerified = true,
  sortField,
  sortDirection,
  onSort
}: SavedProductsTableProps) {
  const SortIcon = ({ field }: { field: SortField }) => {
    const isActive = sortField === field;
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-4 w-4 ml-1 inline-block transition-colors ${
          isActive ? 'text-blue-600' : 'text-gray-400'
        }`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        {isActive && sortDirection === 'asc' ? (
          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
        ) : isActive && sortDirection === 'desc' ? (
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        ) : (
          <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        )}
      </svg>
    );
  };

  return (
    <div className="bg-white card p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Lista de Códigos</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  onSort ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                }`}
                onClick={() => onSort?.('productCode')}
              >
                Product Code
                {onSort && <SortIcon field="productCode" />}
              </th>
              <th
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  onSort ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                }`}
                onClick={() => onSort?.('description')}
              >
                Product Description
                {onSort && <SortIcon field="description" />}
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Verified
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No Product Codes Saved Yet
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono font-semibold text-gray-900">
                      {product.productCode.generated}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-gray-900">
                      {product.description.generated}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      checked={product.verified}
                      onChange={() => onToggleVerified(index)}
                      disabled={!canToggleVerified}
                      className={`h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                        canToggleVerified ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                      }`}
                      aria-label="Mark as verified"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(index)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          aria-label="Edit product"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(index)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          aria-label="Delete product"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                      {!onEdit && !onDelete && (
                        <span className="text-gray-400 text-xs">No actions</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
