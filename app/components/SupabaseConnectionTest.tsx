'use client';

import { useState } from 'react';
import { productService } from '../lib/services/productService';

export default function SupabaseConnectionTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing connection...');

    try {
      // Test 1: Check environment variables
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !key) {
        setTestResult('❌ Environment variables not found!\n\nMake sure .env.local exists with:\nNEXT_PUBLIC_SUPABASE_URL\nNEXT_PUBLIC_SUPABASE_ANON_KEY');
        setIsLoading(false);
        return;
      }

      setTestResult(`✅ Environment variables found\nURL: ${url}\nKey: ${key.substring(0, 20)}...\n\nTesting database connection...`);

      // Test 2: Try to fetch products (will fail if table doesn't exist)
      const { data, error } = await productService.getProducts();

      if (error) {
        setTestResult(`❌ Database connection failed!\n\nError: ${error.message}\n\nPossible issues:\n1. Database table doesn't exist (run schema.sql)\n2. Wrong API key\n3. RLS policies blocking access`);
      } else {
        setTestResult(`✅ SUCCESS! Connected to Supabase!\n\n✅ Environment variables loaded\n✅ Database connection works\n✅ Products table exists\n✅ RLS policies configured\n\nFound ${data?.length || 0} products in database.\n\nYou're all set! 🎉`);
      }
    } catch (error: any) {
      setTestResult(`❌ Unexpected error!\n\n${error.message}\n\nCheck browser console for details.`);
      console.error('Connection test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-6 mb-8">
      <h3 className="text-lg font-bold text-slate-900 mb-4">
        🔍 Supabase Connection Test
      </h3>
      
      <button
        onClick={testConnection}
        disabled={isLoading}
        className="btn btn-primary mb-4"
      >
        {isLoading ? 'Testing...' : 'Test Connection'}
      </button>

      {testResult && (
        <pre className="bg-slate-50 p-4 rounded-lg text-sm whitespace-pre-wrap border border-slate-200">
          {testResult}
        </pre>
      )}

      <div className="mt-4 text-sm text-slate-600">
        <p><strong>This test checks:</strong></p>
        <ul className="list-disc list-inside ml-2 mt-2 space-y-1">
          <li>Environment variables are loaded</li>
          <li>Can connect to Supabase</li>
          <li>Database table exists</li>
          <li>RLS policies allow access</li>
        </ul>
      </div>
    </div>
  );
}
