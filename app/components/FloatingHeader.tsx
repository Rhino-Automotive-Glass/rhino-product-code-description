'use client';

interface FloatingHeaderProps {
  onSave: () => void;
  onCleanAll: () => void;
}

export default function FloatingHeader({ onSave, onCleanAll }: FloatingHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
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
      </div>
    </header>
  );
}
