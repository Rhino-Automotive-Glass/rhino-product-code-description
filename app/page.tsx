import CodeGenerator from './components/CodeGenerator';
import ProductDescription from './components/ProductDescription';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
