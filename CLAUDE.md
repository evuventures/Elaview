# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Elaview is a B2B marketplace connecting landlords with physical advertising spaces to businesses seeking rental ad space. It's a monorepo using pnpm workspaces with:
- React/TypeScript frontend (Vite)
- Express.js/TypeScript backend
- Flutter mobile app
- Supabase for database and authentication

## Essential Commands

### Frontend (from `frontend/` directory)
```bash
pnpm dev          # Start dev server on port 3000
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm preview      # Preview production build
```

### Backend (from `backend/` directory)
```bash
pnpm dev          # Start with nodemon
pnpm build        # Compile TypeScript
pnpm start        # Production server
pnpm dev:prod     # Dev server with production env
```

### Root Commands
```bash
pnpm install      # Install all workspace dependencies
```

## High-Level Architecture

### Authentication Flow
- All auth handled through Supabase Auth with JWT tokens
- Frontend: `frontend/src/context/AuthContext.tsx` manages auth state
- Backend: `backend/src/middleware/auth.ts` validates tokens
- Role-based access: landlord, renter, admin roles defined in `backend/src/types/auth.ts`
- Protected routes use `requireAuth` and `requireRole` middleware

### Key Frontend Patterns
- **Routing**: All routes defined in `frontend/src/App.tsx` using React Router v7
- **Protected Routes**: `ProtectedRoute` component checks auth and role requirements
- **API Calls**: Use `authFetch` from AuthContext for authenticated requests
- **State Management**: React Context for auth, local state for components
- **Error Handling**: Toast notifications via custom toast system

### Key Backend Patterns
- **Middleware Stack**: auth → role checking → rate limiting → route handler
- **Supabase Client**: Admin client in `backend/src/config/supabase.ts`
- **Error Responses**: Consistent format via error handling middleware
- **Database Queries**: Direct Supabase queries, no ORM
- **File Structure**: Routes in `/routes`, business logic in route handlers

### Database Schema (Supabase)
Key tables and their relationships:
- `profiles`: User details linked to auth.users
- `rental_listings`: Ad spaces with pricing, location, dimensions
- `bookings`: Rental transactions
- `messages/conversations`: Communication system
- `inquiries`: Questions about listings
- Row Level Security (RLS) policies enforce data access

### API Structure
Base URL: `http://localhost:4000/api`
- `/auth/*` - Authentication endpoints
- `/users/*` - User management
- `/listings/*` - Rental listing CRUD
- `/bookings/*` - Booking management
- `/messages/*` - Messaging system
- `/inquiries/*` - Listing inquiries

### Development Tips
- Frontend proxies API calls to backend (configured in `frontend/vite.config.ts`)
- Check browser console for auth token issues
- Use Supabase dashboard for debugging database queries
- Backend logs SQL queries in development mode
- TypeScript types are shared between frontend/backend where applicable

### Common Issues & Solutions
- **Supabase 400 errors**: Check for null/undefined values in query parameters (e.g., `.neq('id', '')` causes malformed queries)
- **Role switching**: Use global state management in `useUserStore` for proper cache invalidation
- **Admin panel errors**: Ensure `currentUser.id` exists before making queries that reference it

### Testing Approach
Currently no automated tests. When implementing:
- Frontend: Use Vitest (already configured)
- Backend: Add Jest configuration
- Test auth flows, API endpoints, and critical business logic

### Deployment Considerations
- Set environment variables for Supabase URL and keys
- Frontend builds to `frontend/dist`
- Backend compiles to `backend/dist`
- Ensure CORS configuration matches production domains
- Configure rate limiting based on expected traffic