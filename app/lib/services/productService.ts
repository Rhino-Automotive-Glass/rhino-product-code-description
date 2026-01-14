import { createClient } from '../supabase/client';
import type { Database } from '../database.types';

// Type helpers
type ProductRow = Database['public']['Tables']['product_codes']['Row'];
type ProductInsert = Database['public']['Tables']['product_codes']['Insert'];

// Application types
export interface Compatibility {
  marca: string;
  subModelo: string;
  version: string;
  additional: string;
  modelo: string;
}

export interface ProductData {
  productCode: {
    clasificacion: string;
    parte: string;
    numero: string;
    color: string;
    aditamento: string;
    generated: string;
  };
  compatibility: {
    items: Compatibility[];
    generated: string;
  };
  description: {
    parte: string;
    posicion: string;
    lado: string;
    generated: string;
  };
  verified: boolean;
}

export interface SavedProduct extends ProductData {
  id: string;
  created_at: string;
  updated_at: string;
  status?: string;
  notes?: string;
}

export class ProductService {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  private transformProduct(row: ProductRow): SavedProduct {
    return {
      id: row.id,
      productCode: row.product_code_data as unknown as ProductData['productCode'],
      compatibility: row.compatibility_data as unknown as ProductData['compatibility'],
      description: row.description_data as unknown as ProductData['description'],
      verified: (row.verified as boolean) ?? false,
      created_at: row.created_at,
      updated_at: row.updated_at,
      status: row.status || undefined,
      notes: row.notes || undefined,
    };
  }

  private transformToInsert(productData: ProductData): ProductInsert {
    return {
      product_code_data: productData.productCode as any,
      compatibility_data: productData.compatibility as any,
      description_data: productData.description as any,
      verified: productData.verified,
      status: 'active',
    };
  }

  async saveProduct(productData: ProductData): Promise<{ 
    data: SavedProduct | null; 
    error: Error | null 
  }> {
    try {
      const insertData = this.transformToInsert(productData);
      
      const { data, error } = await this.supabase
        .from('product_codes')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      const savedProduct = this.transformProduct(data);
      return { data: savedProduct, error: null };
    } catch (error) {
      console.error('Error saving product:', error);
      return { data: null, error: error as Error };
    }
  }

  async getProducts(status: string = 'active'): Promise<{ 
    data: SavedProduct[] | null; 
    error: Error | null 
  }> {
    try {
      let query = this.supabase
        .from('product_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;

      const products = data.map(item => this.transformProduct(item));
      return { data: products, error: null };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { data: null, error: error as Error };
    }
  }

  async getProductById(id: string): Promise<{ 
    data: SavedProduct | null; 
    error: Error | null 
  }> {
    try {
      const { data, error } = await this.supabase
        .from('product_codes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const product = this.transformProduct(data);
      return { data: product, error: null };
    } catch (error) {
      console.error('Error fetching product:', error);
      return { data: null, error: error as Error };
    }
  }

  async updateProduct(
    id: string, 
    productData: Partial<ProductData>
  ): Promise<{ 
    data: SavedProduct | null; 
    error: Error | null 
  }> {
    try {
      const updateData: any = {};

      if (productData.productCode) {
        updateData.product_code_data = productData.productCode;
      }
      if (productData.compatibility) {
        updateData.compatibility_data = productData.compatibility;
      }
      if (productData.description) {
        updateData.description_data = productData.description;
      }
      if (productData.verified !== undefined) {
        updateData.verified = productData.verified;
      }

      const { data, error } = await this.supabase
        .from('product_codes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const product = this.transformProduct(data);
      return { data: product, error: null };
    } catch (error) {
      console.error('Error updating product:', error);
      return { data: null, error: error as Error };
    }
  }

  async deleteProduct(
    id: string, 
    hardDelete: boolean = false
  ): Promise<{ error: Error | null }> {
    try {
      if (hardDelete) {
        const { error } = await this.supabase
          .from('product_codes')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await this.supabase
          .from('product_codes')
          .update({ status: 'archived' })
          .eq('id', id);

        if (error) throw error;
      }

      return { error: null };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { error: error as Error };
    }
  }

  async searchByCode(searchTerm: string): Promise<{ 
    data: SavedProduct[] | null; 
    error: Error | null 
  }> {
    try {
      const { data, error } = await this.supabase
        .rpc('search_products_by_code', { search_term: searchTerm });

      if (error) throw error;

      const products = data.map((item: any) => ({
        id: item.id,
        productCode: item.product_code_data,
        compatibility: item.compatibility_data,
        description: item.description_data,
        verified: item.verified ?? false,
        created_at: item.created_at,
        updated_at: item.updated_at || item.created_at,
      }));

      return { data: products, error: null };
    } catch (error) {
      console.error('Error searching products:', error);
      return { data: null, error: error as Error };
    }
  }

  async productCodeExists(code: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('product_codes')
        .select('id')
        .eq('product_code_data->>generated', code)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('Error checking product code:', error);
        return false;
      }

      return data !== null;
    } catch (error) {
      console.error('Error checking product code:', error);
      return false;
    }
  }

  async getProductsCount(status?: string): Promise<{ 
    count: number; 
    error: Error | null 
  }> {
    try {
      let query = this.supabase
        .from('product_codes')
        .select('*', { count: 'exact', head: true });

      if (status) {
        query = query.eq('status', status);
      }

      const { count, error } = await query;

      if (error) throw error;

      return { count: count || 0, error: null };
    } catch (error) {
      console.error('Error getting products count:', error);
      return { count: 0, error: error as Error };
    }
  }
}

export const productService = new ProductService();
