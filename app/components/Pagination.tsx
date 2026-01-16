'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  isLoading?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onNextPage,
  onPreviousPage,
  isLoading = false,
}: PaginationProps) {
  // Calculate display range
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display (show max 7 page buttons)
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];

    if (currentPage <= 3) {
      // Near start: 1 2 3 4 5 ... last
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Near end: 1 ... last-4 last-3 last-2 last-1 last
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      // Middle: 1 ... current-1 current current+1 ... last
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Don't render if no pages
  if (totalPages === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Items info */}
        <div className="text-sm text-slate-600">
          Mostrando <span className="font-semibold text-slate-900">{startItem}</span> a{' '}
          <span className="font-semibold text-slate-900">{endItem}</span> de{' '}
          <span className="font-semibold text-slate-900">{totalItems}</span> productos
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-2">
          {/* Previous button */}
          <button
            onClick={onPreviousPage}
            disabled={currentPage === 1 || isLoading}
            className="btn btn-secondary btn-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="hidden sm:inline">Anterior</span>
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((pageNum, index) => {
              if (pageNum === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-3 py-2 text-slate-600"
                  >
                    ...
                  </span>
                );
              }

              const page = pageNum as number;
              const isActive = page === currentPage;

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  disabled={isLoading}
                  className={`
                    px-3 py-2 min-w-[40px] rounded-md font-medium text-sm
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                    }
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  aria-label={`Go to page ${page}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <button
            onClick={onNextPage}
            disabled={currentPage === totalPages || isLoading}
            className="btn btn-secondary btn-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
