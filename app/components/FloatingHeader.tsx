'use client';

interface FloatingHeaderProps {
  onSave: () => void;
  onCleanAll: () => void;
}

export default function FloatingHeader({ onSave, onCleanAll }: FloatingHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Desktop/Tablet Layout: Single row with buttons on the right */}
        <div className="hidden sm:flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
              Rhino Code Generator
            </h1>
            <p className="text-sm text-slate-600">
              Automotive Glass Production Catalog
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onSave}
              className="btn btn-primary btn-md"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={onCleanAll}
              className="btn btn-secondary btn-md"
            >
              Clean All
            </button>
          </div>
        </div>

        {/* Mobile Layout: Header on top, buttons below in separate row */}
        <div className="sm:hidden">
          {/* Header */}
          <div className="mb-3">
            <h1 className="text-xl font-bold text-slate-900">
              Rhino Code Generator
            </h1>
            <p className="text-sm text-slate-600">
              Automotive Glass Production Catalog
            </p>
          </div>
          
          {/* Buttons Row - Full width, 50% each */}
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={onSave}
              className="btn btn-primary btn-md flex-1"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={onCleanAll}
              className="btn btn-secondary btn-md flex-1"
            >
              Clean All
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
