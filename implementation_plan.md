# Ops Dashboard Architecture Refactor Plan

This plan documents the critical refactor to pivot our platform away from a multi-tenant Merchant SaaS model towards a centralized Ops-controlled infrastructure.

## Goal

Transform the system into a single-tenant Ops Admin platform where:
- Only `ops_admin` users can manage restaurants
- No merchant ownership model exists
- Public menu system remains unchanged

## User Review Required

> [!WARNING]
> This refactor will irrevocably change the fundamental ownership model of the platform. There will no longer be a concept of "Merchants logging in to manage their own stores." Any future feature scaling will assume Ops as the sole arbiter of data creation.

## Proposed Changes

### 1. Database Schema Refactor (`00002_ops_refactor.sql`)
Instead of modifying the original migration, we will apply a safe schema update:
- **[NEW]** `supabase/migrations/00002_ops_refactor.sql`
  - Drop the `merchant_id` column safely: `ALTER TABLE restaurants DROP COLUMN IF EXISTS merchant_id;`
  - Create a new non-breaking RPC function: `create_restaurant_flow_v2(p_slug text, p_name text)`

### 2. Route Changes
We will create an Ops-specific route hierarchy.
- **[NEW]** `src/app/ops/layout.tsx`: Sidebar navigation for Ops Admin, containing a server-side auth guard rejecting non-ops_admin access.
- **[NEW]** `src/app/ops/restaurants/page.tsx`: System-wide list of all restaurants. Create Restaurant button.
- **[NEW]** `src/app/ops/restaurants/[id]/page.tsx`: Restaurant overview (toggle active/inactive) and basic analytics.
- **[NEW]** `src/app/ops/restaurants/[id]/menu/page.tsx`: Centralized menu editor controlled by Ops.

### 3. Centralized Ops Server Actions
- **[NEW]** `src/app/actions/ops.ts`
  - `createRestaurant(formData)`: Calls `create_restaurant_flow_v2`
  - `createCategory(restaurantId, formData)`
  - `createMenuItem(categoryId, formData)`
  - `updateRestaurant(restaurantId, formData)`
  - `softDeleteRestaurant(restaurantId)`: Soft deletes.

### 4. Role Model Simplification
- Introduce `ops_admin` role.
- All `/ops` routes will have a server-side protection check:
  ```typescript
  if (!session.user || session.user.role !== "ops_admin") {
    redirect("/unauthorized")
  }
  ```

## Open Questions

- We do not currently have a full authentication setup in this repository (e.g., Supabase Auth or NextAuth implementation). Which auth library are we currently using, and are we hooking this into `supabase.auth.getUser()` with user metadata for roles? (We need to ensure `session.user.role` is successfully populated).

## Verification Plan

### Automated Tests
- N/A

### Manual Verification
1. Access `http://localhost:3000/ops/restaurants`.
2. Produce a new restaurant without a merchant login.
3. Observe the direct creation of the tenant, completely owned by the centralized Ops system.
4. Verify the it appears in the public `/[slug]` route.
5. Ensure `/ops` is blocked for non-ops users.
