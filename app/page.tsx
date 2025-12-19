import CodeGenerator from './components/CodeGenerator';
import ProductDescription from './components/ProductDescription';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
              Rhino Code Generator
            </h1>
            <p className="text-base text-slate-600">
              Automotive Glass Production Catalog Reference
            </p>
          </div>
        </div>        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Code Generator Section */}
          <div>
            <CodeGenerator />
          </div>

          {/* Product Description Section */}
          <div>
            <ProductDescription />
          </div>
        </div>
      </div>
    </main>
  );
}
