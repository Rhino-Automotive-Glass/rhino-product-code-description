'use client';

export default function ProductDescription() {
  return (
    <div className="bg-white rounded-xl shadow-xl p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Product Description
        </h2>
        <p className="text-gray-600">
          Coming soon...
        </p>
      </div>
      
      <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <p className="text-gray-400 text-lg">
          Section under development
        </p>
      </div>
    </div>
  );
}
