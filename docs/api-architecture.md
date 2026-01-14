# API Architecture: Server-Side Routes vs Direct Client Calls

## Overview

This document explains the architectural change from direct Supabase client calls to server-side API routes for database operations.

---

## Previous Implementation (Direct Client Calls)

```
┌─────────────┐         ┌─────────────────┐         ┌─────────────┐
│   Browser   │ ──────► │    Supabase     │ ──────► │  Database   │
│  (Client)   │  HTTPS  │   REST API      │         │  (Postgres) │
└─────────────┘         └─────────────────┘         └─────────────┘
```

### How it worked:
1. Browser makes HTTP request directly to Supabase API
2. Supabase authenticates using the anon key
3. Supabase executes the query and returns data

### Code example (before):
```typescript
// In page.tsx - runs in the BROWSER
const { data, error } = await productService.saveProduct(productData);

// productService.ts - also runs in the BROWSER
async saveProduct(productData: ProductData) {
  const { data, error } = await this.supabase
    .from('product_codes')
    .insert(insertData)
    .select()
    .single();
  return { data, error };
}
```

### Problems:
1. **CORS Issues**: Browser security policies can block requests to external APIs
   - We encountered: `Method PATCH is not allowed by Access-Control-Allow-Methods`
2. **Exposed API Keys**: The Supabase anon key is visible in browser dev tools
3. **Limited Control**: Can't add server-side validation, logging, or rate limiting
4. **Browser Dependency**: All database logic runs in the client

---

## Current Implementation (Server-Side API Routes)

```
┌─────────────┐         ┌─────────────────┐         ┌─────────────────┐         ┌─────────────┐
│   Browser   │ ──────► │  Next.js API    │ ──────► │    Supabase     │ ──────► │  Database   │
│  (Client)   │  Fetch  │  Route (Server) │  HTTPS  │   REST API      │         │  (Postgres) │
└─────────────┘         └─────────────────┘         └─────────────────┘         └─────────────┘
```

### How it works:
1. Browser makes HTTP request to Next.js API route (same origin)
2. Next.js server receives the request and processes it
3. Server makes request to Supabase (server-to-server, no CORS)
4. Server returns response to browser

### Code example (after):
```typescript
// In page.tsx - runs in the BROWSER
const response = await fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(productData),
});

// In app/api/products/route.ts - runs on the SERVER
export async function POST(request: NextRequest) {
  const body = await request.json();
  const supabase = await createClient(); // Server-side client

  const { data, error } = await supabase
    .from('product_codes')
    .insert(insertData)
    .select()
    .single();

  return NextResponse.json({ data });
}
```

### Benefits:
1. **No CORS Issues**: Server-to-server requests bypass browser security
2. **More Secure**: Sensitive operations happen on the server
3. **Centralized Logic**: Easy to add validation, logging, error handling
4. **Consistent Pattern**: All database operations use the same approach
5. **Future-Proof**: Easy to switch databases or add caching

---

## API Routes Structure

```
app/
├── api/
│   └── products/
│       ├── route.ts          # POST /api/products (create)
│       └── [id]/
│           └── route.ts      # PATCH /api/products/:id (update)
│                             # DELETE /api/products/:id (delete)
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/products` | Create a new product |
| PATCH | `/api/products/[id]` | Update an existing product |
| DELETE | `/api/products/[id]?hard=true` | Permanently delete a product |
| DELETE | `/api/products/[id]` | Soft delete (archive) a product |

---

## When to Use Each Approach

### Use Server-Side API Routes for:
- Create, Update, Delete operations
- Operations that modify data
- Sensitive operations
- When you need server-side validation

### Direct Client Calls might be OK for:
- Read-only operations (SELECT)
- Real-time subscriptions
- Simple queries with Row Level Security (RLS)

---

## Migration Summary

| Operation | Before | After |
|-----------|--------|-------|
| Save products | `productService.saveProduct()` | `fetch('/api/products', { method: 'POST' })` |
| Update product | `productService.updateProduct()` | `fetch('/api/products/${id}', { method: 'PATCH' })` |
| Delete product | `productService.deleteProduct()` | `fetch('/api/products/${id}?hard=true', { method: 'DELETE' })` |
| Get products | `productService.getProducts()` | Still using direct client (read-only) |

---

## Files Changed

1. **Created**: `app/api/products/route.ts` - POST endpoint for creating products
2. **Created**: `app/api/products/[id]/route.ts` - PATCH and DELETE endpoints for updating/deleting products
3. **Modified**: `app/page.tsx` - Updated `handleGuardarTodos`, `handleUpdateDbProduct`, and `handleDeleteDbProduct` to use fetch

---

## Future Considerations

1. **Add GET endpoint**: If needed for more complex queries or to fully migrate reads
2. **Add validation**: Validate request body before database operations
3. **Add error handling**: Standardize error responses across all endpoints
4. **Add logging**: Track API usage and errors
5. **Add rate limiting**: Protect against abuse
