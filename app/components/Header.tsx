'use client';

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
            Rhino Code Generator
          </h1>
          <p className="text-sm text-slate-600">
            Automotive Glass Production Catalog
          </p>
        </div>
      </div>
    </header>
  );
}
