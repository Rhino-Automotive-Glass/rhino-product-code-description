# Authentication and User Management

## Table of Contents
- [Authentication Overview](#authentication-overview)
- [User Signup](#user-signup)
- [User Login](#user-login)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [User Management (Admin)](#user-management-admin)
- [Environment Setup](#environment-setup)

---

## Authentication Overview

The Rhino Code Generator uses **Supabase Authentication** with email and password login. The system implements a three-tier Role-Based Access Control (RBAC) system with the following roles:

- **Admin** - Full access to all features
- **QA** - Can only toggle verified status on products
- **Viewer** - Read-only access to product database

### Authentication Flow

```
User Signs Up → Email/Password Created → Default "Viewer" Role Assigned → User Logged In
User Logs In → Session Created → Role Fetched → Permissions Applied
```

---

## User Signup

### How Signup Works

1. **User navigates to:** `http://localhost:3000/signup`
2. **User provides:**
   - Email address
   - Password (minimum 6 characters)
   - Password confirmation
3. **System validates:**
   - Passwords match
   - Email format is valid
   - Password meets minimum requirements
4. **Supabase creates account:**
   - User created in `auth.users` table
   - Database trigger automatically assigns "viewer" role
   - User record created in `user_roles` table
5. **User is redirected to:** Dashboard (`/`) with viewer permissions

### Default Permissions for New Users

All new signups automatically receive the **Viewer** role with these permissions:
- ✅ View "BD Códigos" tab
- ✅ Browse all products
- ❌ Cannot add new products
- ❌ Cannot edit products
- ❌ Cannot delete products
- ❌ Cannot toggle verified status
- ❌ Cannot access Admin Panel

### Technical Implementation

**Trigger Function:**
```sql
CREATE OR REPLACE FUNCTION assign_default_viewer_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Files Involved:**
- `/app/(auth)/signup/page.tsx` - Signup page
- `/app/components/auth/SignupForm.tsx` - Signup form component
- `/app/lib/auth/actions.ts` - Server action `signUp()`
- Database trigger: `on_auth_user_created`

---

## User Login

### How Login Works

1. **User navigates to:** `http://localhost:3000/login`
2. **User provides:**
   - Email address
   - Password
3. **Supabase validates credentials:**
   - Checks if email exists in `auth.users`
   - Verifies password hash
4. **If successful:**
   - Session cookie created
   - User redirected to dashboard
   - Role fetched from `user_roles` table
   - Permissions loaded based on role
5. **UI updates based on role:**
   - Admin sees: Both tabs, edit/delete buttons, Admin Panel link
   - QA sees: Only "BD Códigos" tab, verified checkbox enabled
   - Viewer sees: Only "BD Códigos" tab, no action buttons

### Session Management

- Sessions are stored in HTTP-only cookies
- Middleware (`/proxy.ts`) validates sessions on every request
- Protected routes redirect to `/login` if not authenticated
- Public routes (`/login`, `/signup`) redirect to `/` if already logged in

### Technical Implementation

**Files Involved:**
- `/app/(auth)/login/page.tsx` - Login page
- `/app/components/auth/LoginForm.tsx` - Login form component
- `/app/lib/auth/actions.ts` - Server action `signIn()`
- `/app/contexts/RoleContext.tsx` - Fetches and manages user role
- `/proxy.ts` - Session validation middleware

---

## Role-Based Access Control (RBAC)

### Role Permissions Matrix

| Permission | Admin | QA/Editor | Viewer |
|------------|-------|-----------|--------|
| View "Agregar Códigos" tab | ✅ | ❌ | ❌ |
| View "BD Códigos" tab | ✅ | ✅ | ✅ |
| Create products | ✅ | ❌ | ❌ |
| Edit products | ✅ | ❌ | ❌ |
| Delete products | ✅ | ❌ | ❌ |
| Toggle verified checkbox | ✅ | ✅ | ❌ |
| Manage user roles | ✅ | ❌ | ❌ |
| View Admin Panel | ✅ | ❌ | ❌ |

### Role Enforcement

**Frontend (UI Level):**
- Tabs conditionally rendered based on `permissions.canViewAgregarTab`
- Buttons hidden if user lacks permission
- Admin Panel link only visible to admins
- Role badge displayed in header

**Backend (API Level):**
- All API routes protected with `requireRole()` middleware
- Unauthorized requests return `403 Forbidden`
- QA users restricted to only updating `verified` field
- RLS (Row Level Security) policies enforce database-level access

### Technical Implementation

**Permission Check Example:**
```typescript
const { role, permissions } = useRole();

// Conditionally show "Agregar Códigos" tab
{permissions?.canViewAgregarTab && (
  <button onClick={() => setActiveTab('agregar')}>
    Agregar Códigos
  </button>
)}

// Conditionally show delete button
<SavedProductsTable
  onDelete={permissions?.canDeleteProducts ? handleDelete : undefined}
/>
```

**API Middleware Example:**
```typescript
export async function PATCH(request: NextRequest) {
  const authResult = await requireRole(request, ['admin', 'qa']);
  if (authResult instanceof NextResponse) return authResult;

  const { role } = authResult;

  // QA can ONLY update verified field
  if (role === 'qa') {
    if (Object.keys(body).length !== 1 || body.verified === undefined) {
      return NextResponse.json(
        { error: 'QA users can only toggle verified status' },
        { status: 403 }
      );
    }
  }
}
```

---

## User Management (Admin)

### Accessing the Admin Panel

1. **Log in as an admin user**
2. **Navigate to:** `http://localhost:3000/admin`
   - Or click "Admin Panel" in the header navigation
3. **If not an admin:** You'll be automatically redirected to the dashboard

### Viewing All Users

The Admin Panel displays a table with all registered users:

| Column | Description |
|--------|-------------|
| **Email** | User's email address |
| **Rol Actual** | Current role (Admin, QA, or Viewer) |
| **Asignado** | Date when role was assigned |
| **Cambiar Rol** | Dropdown to change user's role |

### Changing User Roles

**To promote a user:**
1. Find the user in the table
2. Click the role dropdown in the "Cambiar Rol" column
3. Select the new role:
   - **Admin** - Full access to all features
   - **QA/Editor** - Can only toggle verified status
   - **Viewer** - Read-only access
4. The change is applied immediately
5. User will see updated permissions on their next page load

**Real-time Effect:**
- Changes apply to the database instantly
- User's next request will reflect new permissions
- User may need to refresh their browser to see UI changes

### Adding New Users (Manual Process)

**Option 1: Via Signup Page**
1. Share the signup link: `http://localhost:3000/signup`
2. User creates their own account
3. They will default to "Viewer" role
4. Admin can then promote them via Admin Panel

**Option 2: Via Supabase Dashboard (Direct)**
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Invite User" or "Add User"
3. Enter email and temporary password
4. User will be created with "Viewer" role
5. Admin can then change role via Admin Panel

### Deleting Users

**Via Supabase Dashboard:**
1. Go to Supabase Dashboard → Authentication → Users
2. Find the user in the list
3. Click the three dots (⋮) menu
4. Select "Delete user"
5. Confirm deletion
6. User and their role will be removed (CASCADE delete)

**Note:** User deletion is not currently available in the Admin Panel UI. This is intentional to prevent accidental deletions.

### Technical Implementation

**Admin Panel Component:**
- `/app/components/AdminPanel.tsx` - User management UI
- `/app/(dashboard)/admin/page.tsx` - Admin page with role check
- `/app/api/admin/users/route.ts` - Lists all users (requires service role key)
- `/app/api/admin/users/[userId]/role/route.ts` - Updates user roles

**API Endpoints:**
```
GET  /api/admin/users             - List all users with roles (Admin only)
PUT  /api/admin/users/:userId/role - Update user's role (Admin only)
```

**Role Update Flow:**
```
Admin selects new role → PUT request to API →
requireRole() validates admin →
Update user_roles table →
Return success →
UI reloads user list
```

---

## Environment Setup

### Required Environment Variables

Create a `.env.local` file in the project root with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key
```

### Getting Supabase Keys

1. **Go to:** https://app.supabase.com/project/your-project/settings/api
2. **Copy the following:**
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (click "Reveal" first)

⚠️ **Security Warning:**
- The `SUPABASE_SERVICE_ROLE_KEY` has full admin access to your database
- **NEVER** commit it to version control
- **NEVER** expose it in client-side code
- Only use it in server-side API routes
- `.env.local` is already in `.gitignore`

### Database Setup (Already Completed)

The following database objects should already be created:

**Tables:**
- `user_roles` - Stores user role assignments
- `audit_logs` - Tracks all user actions (future use)

**Triggers:**
- `on_auth_user_created` - Auto-assigns "viewer" role to new signups

**Functions:**
- `assign_default_viewer_role()` - Trigger function for new users
- `is_admin()` - Helper function for RLS policies

**RLS Policies:**
- Users can read their own role
- Admins can read/manage all roles
- Service can insert viewer roles (via trigger)

### First Admin User Setup

**After initial database setup, manually create your first admin:**

```sql
-- Find your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Assign admin role
INSERT INTO user_roles (user_id, role)
VALUES ('your-user-id-here', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

After this, you can use the Admin Panel to manage other users!

---

## Common Issues and Troubleshooting

### Issue: "Database error saving new user" on signup
**Cause:** RLS policy blocking the trigger from inserting viewer role
**Solution:** Ensure the "Allow role insertion" policy permits `role = 'viewer'` without user_id check

### Issue: "This endpoint requires a valid Bearer token" in Admin Panel
**Cause:** Missing `SUPABASE_SERVICE_ROLE_KEY` in environment variables
**Solution:** Add the service role key to `.env.local` and restart dev server

### Issue: "Infinite recursion detected in policy for relation user_roles"
**Cause:** RLS policy querying user_roles within its own USING clause
**Solution:** Use `is_admin()` security definer function instead of direct query

### Issue: User shows as "Viewer" but should be "Admin"
**Cause:** Database has correct role, but frontend is cached
**Solution:** Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

---

## Security Best Practices

1. **Environment Variables:**
   - Never commit `.env.local` to git
   - Use different keys for development and production
   - Rotate service role key if ever exposed

2. **Role Validation:**
   - Always validate roles server-side (don't trust client)
   - Use RLS policies as a backup layer
   - Check permissions in both middleware and API routes

3. **Password Requirements:**
   - Minimum 6 characters (enforced by Supabase)
   - Consider adding complexity requirements in the future

4. **Session Management:**
   - Sessions auto-expire after inactivity
   - HTTP-only cookies prevent XSS attacks
   - Middleware validates every protected route

---

## File Reference

### Authentication Files
- `/app/(auth)/login/page.tsx` - Login page
- `/app/(auth)/signup/page.tsx` - Signup page
- `/app/components/auth/LoginForm.tsx` - Login form
- `/app/components/auth/SignupForm.tsx` - Signup form
- `/app/lib/auth/actions.ts` - Server actions (signIn, signUp, signOut)
- `/proxy.ts` - Session validation middleware

### RBAC Files
- `/app/lib/rbac/types.ts` - Type definitions (UserRole, RolePermissions)
- `/app/lib/rbac/permissions.ts` - Permission matrix
- `/app/lib/rbac/apiMiddleware.ts` - API route protection
- `/app/contexts/RoleContext.tsx` - Frontend role state management

### Admin Panel Files
- `/app/(dashboard)/admin/page.tsx` - Admin page
- `/app/components/AdminPanel.tsx` - User management UI
- `/app/api/admin/users/route.ts` - List users API
- `/app/api/admin/users/[userId]/role/route.ts` - Update role API

### Supabase Client Files
- `/app/lib/supabase/client.ts` - Client-side Supabase client
- `/app/lib/supabase/server.ts` - Server-side Supabase client
- `/app/lib/supabase/admin.ts` - Admin client (service role key)

---

## Quick Reference Commands

```bash
# Start development server
npm run dev

# Access points
http://localhost:3000/login         # Login page
http://localhost:3000/signup        # Signup page
http://localhost:3000               # Dashboard (requires auth)
http://localhost:3000/admin         # Admin Panel (admin only)

# Database operations (Supabase SQL Editor)
# List all users with roles
SELECT u.email, ur.role
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id;

# Make a user admin
UPDATE user_roles
SET role = 'admin'
WHERE user_id = 'user-id-here';
```

---

For additional help or questions, refer to the [Supabase Auth Documentation](https://supabase.com/docs/guides/auth).
