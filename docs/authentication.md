# Authentication Documentation

## Overview

Rhino Code Generator uses Supabase for authentication with support for:
- Email/password login
- Cookie-based sessions (browser)
- Bearer token authentication (cross-origin API calls)
- Role-based access control (Admin, QA, Viewer)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Clients                                  │
├──────────────────────────┬──────────────────────────────────────┤
│   Browser (Cookies)      │    External Apps (Bearer Token)      │
│   - Session cookies      │    - Authorization header            │
│   - Auto-refresh         │    - JWT validation                  │
└──────────────────────────┴──────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Middleware (proxy.ts)                         │
│  1. Check for Bearer token in Authorization header              │
│  2. If valid Bearer → allow request                             │
│  3. Else check cookie session                                   │
│  4. If valid session → allow request                            │
│  5. Else redirect to /login                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase Auth                               │
│  - Validates JWT tokens                                          │
│  - Manages sessions                                              │
│  - User management                                               │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
app/
├── lib/
│   ├── supabase/
│   │   ├── client.ts      # Browser-side Supabase client
│   │   ├── server.ts      # Server-side Supabase client
│   │   ├── admin.ts       # Admin client (service role)
│   │   └── middleware.ts  # Session refresh logic
│   ├── auth/
│   │   ├── actions.ts     # Server actions (signIn, signUp, signOut)
│   │   └── constants.ts   # Auth route constants
│   └── rbac/
│       ├── types.ts       # Role types
│       ├── permissions.ts # Permission matrix
│       └── apiMiddleware.ts # API route protection
├── api/
│   └── auth/
│       └── callback/
│           └── route.ts   # OAuth callback handler
├── (auth)/
│   ├── login/
│   │   └── page.tsx       # Login page
│   └── signup/
│       └── page.tsx       # Signup page
└── contexts/
    └── RoleContext.tsx    # Role state management

proxy.ts                   # Root middleware for route protection
```

## Configuration

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key  # For admin operations
```

### Supabase Dashboard

Add redirect URLs in Authentication → URL Configuration:
- `http://localhost:3000/api/auth/callback` (development)
- `https://rhino-product-code-description.vercel.app/api/auth/callback` (production)

## Authentication Methods

### 1. Cookie-Based (Browser)

Default method for browser-based access. Sessions are stored in HTTP-only cookies.

```typescript
// User logs in via form
const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
})
// Session cookie is set automatically
```

### 2. Bearer Token (Cross-Origin APIs)

For external applications calling this API. The calling app sends the user's access token.

**Calling App:**
```typescript
const { data: { session } } = await supabase.auth.getSession()

const response = await fetch(
  'https://rhino-product-code-description.vercel.app/api/products/search?q=FW',
  {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
  }
)
```

**This App's Middleware (`proxy.ts`):**
```typescript
// Check for Bearer token
const authHeader = request.headers.get('Authorization')

if (authHeader?.startsWith('Bearer ')) {
  const token = authHeader.substring(7)
  const { data, error } = await supabase.auth.getUser(token)
  if (!error && data.user) {
    user = data.user  // Valid Bearer token
  }
}

// If no Bearer token, try cookie session
if (!user) {
  const { data } = await supabase.auth.getUser()
  user = data.user
}

// Allow API routes with valid authentication
if (pathname.startsWith('/api/') && user) {
  return supabaseResponse
}
```

## Middleware Configuration

The middleware (`proxy.ts`) handles all authentication:

```typescript
export default async function proxy(request: NextRequest) {
  const supabaseResponse = await updateSession(request)

  // Create Supabase client
  const supabase = createServerClient(...)

  const { pathname } = request.nextUrl
  let user = null

  // 1. Check Bearer token (for cross-origin API calls)
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const { data, error } = await supabase.auth.getUser(token)
    if (!error && data.user) {
      user = data.user
    }
  }

  // 2. Fallback to cookie session
  if (!user) {
    const { data } = await supabase.auth.getUser()
    user = data.user
  }

  // 3. Allow authenticated API requests
  if (pathname.startsWith('/api/') && user) {
    return supabaseResponse
  }

  // 4. Redirect logic for pages
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (!user && pathname !== '/login' && pathname !== '/signup') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Role-Based Access Control (RBAC)

### Roles

| Role   | Permissions                                    |
|--------|------------------------------------------------|
| Admin  | Full access - create, edit, delete, manage users |
| QA     | Can toggle verified status only                |
| Viewer | Read-only access (default for new users)       |

### Database Table

```sql
CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  role VARCHAR NOT NULL DEFAULT 'viewer',
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to assign default role on signup
CREATE OR REPLACE FUNCTION assign_default_viewer_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Checking Permissions

**In API Routes:**
```typescript
import { requireAuth, requireRole } from '@/app/lib/rbac/apiMiddleware'

export async function POST(request: Request) {
  // Require authentication
  const authResult = await requireAuth()
  if (authResult) return authResult  // Returns 401 if not authenticated

  // Require specific role
  const roleResult = await requireRole(['admin'])
  if (roleResult) return roleResult  // Returns 403 if not authorized

  // Proceed with action...
}
```

**In Components:**
```typescript
import { useRole } from '@/app/contexts/RoleContext'

function AdminButton() {
  const { role, hasPermission } = useRole()

  if (!hasPermission('manage_products')) {
    return null
  }

  return <button>Admin Action</button>
}
```

## API Security Summary

| Endpoint | Auth Required | Method |
|----------|---------------|--------|
| `/api/products/search` | Yes (Cookie or Bearer) | GET |
| `/api/products` | Yes (Admin only) | POST |
| `/api/products/[id]` | Yes (Admin/QA) | PATCH |
| `/api/products/[id]` | Yes (Admin only) | DELETE |
| `/api/admin/*` | Yes (Admin only) | ALL |

## Integrating with External Apps

Other applications in the Rhino ecosystem can call this API using Bearer tokens:

### Step 1: Get User's Access Token
```typescript
const { data: { session } } = await supabase.auth.getSession()
const accessToken = session?.access_token
```

### Step 2: Call API with Bearer Token
```typescript
const response = await fetch(
  'https://rhino-product-code-description.vercel.app/api/products/search?q=FW',
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  }
)
```

### Step 3: Handle Response
```typescript
if (response.ok) {
  const data = await response.json()
  // Use data
} else {
  // Handle error (401 = unauthorized, 403 = forbidden)
}
```

## Troubleshooting

### "Unauthorized" (401)
- No valid session or token provided
- Token expired (access tokens expire after 1 hour)
- Check `.env.local` credentials

### "Forbidden" (403)
- User authenticated but lacks required role
- Check user's role in `user_roles` table

### Cross-origin API not working
- Verify Bearer token is being sent in Authorization header
- Check that middleware is configured to accept Bearer tokens
- Verify token is valid (not expired)

### New user can't access anything
- Default role is "viewer" (read-only)
- Admin must upgrade role via admin panel
