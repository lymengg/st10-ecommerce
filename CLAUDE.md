# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Nuxt.js 4** e-commerce application for a watch store. It's a modern frontend application with TypeScript support that uses **Nuxt UI** for the component library and styling system.

### Technology Stack
- **Framework**: Nuxt.js 4 (Vue 3)
- **UI Library**: Nuxt UI (provides pre-built components and design system)
- **Language**: TypeScript
- **Validation**: Yup
- **State Management**: Vue 3 Composition API with composables
- **API Communication**: $fetch with custom composables

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Generate static site
npm run generate
```

## Architecture Overview

### Directory Structure
```
app/
├── components/        # Vue components (auto-imported)
├── composables/      # Vue composables for shared logic
├── data/            # Static data files
├── layouts/         # Nuxt layouts
├── middleware/      # Route middleware
├── pages/           # File-based routing
└── assets/          # CSS, images, fonts

nuxt.config.ts       # Nuxt configuration
package.json         # Dependencies and scripts
```

### Key Composables

1. **useApi.ts** - Centralized API client with:
   - Automatic JWT token handling
   - Request/response interceptors
   - Error handling and retry logic
   - Base URL configuration

2. **useAuth.ts** - Authentication system with:
   - Login/register/logout functionality
   - Token storage in localStorage
   - User profile management
   - Password change capabilities

3. **useCheckout.ts** - E-commerce checkout with:
   - Cart operations
   - Payment processing
   - Order creation
   - Invoice generation
   - TypeScript interfaces for all data structures

4. **useOrders.ts** - Order management with:
   - User order history
   - Admin order management
   - Order status updates
   - Invoice retrieval

### Route Structure

- **/** - Product catalog with filtering and search
- **/product/[id]** - Individual product details
- **/cart** - Shopping cart
- **/checkout** - Checkout process
- **/orders** - User order history
- **/orders/[id]** - Order details
- **/login**, **/register** - Authentication
- **/profile** - User profile management
- **/admin** - Admin dashboard (protected route)
- **/admin/products** - Product management
- **/admin/orders** - Order management

### Middleware Protection

- **auth.ts** - Protects routes requiring authentication
- **admin.ts** - Protects admin routes, requires admin role

### Key Features

1. **Product Catalog** with advanced filtering:
   - Search by name, brand, description
   - Brand filtering
   - Price range filtering
   - Multiple sorting options

2. **Authentication System**:
   - JWT-based authentication
   - Automatic token refresh
   - Role-based access control (user/admin)

3. **E-commerce Functionality**:
   - Shopping cart management
   - Multi-step checkout process
   - Order tracking
   - Invoice generation

4. **Admin Panel**:
   - Product CRUD operations
   - Order management
   - User role verification

## Configuration

### Environment Variables
- `NUXT_PUBLIC_API_BASE` - Backend API base URL (defaults to `http://localhost:8000`)

### Nuxt UI Configuration
- Color mode disabled (fixed to light mode)
- Primary theme color set to blue
- Custom app title and meta tags

## Development Notes

### Auto-imports
Nuxt automatically imports:
- Vue composables from `composables/`
- Components from `components/`
- Utility functions from `utils/`

### TypeScript
- Strict TypeScript configuration
- Type-safe API interfaces
- Comprehensive type definitions in composables

### API Integration
The app is designed to work with a backend API (likely Django/Node.js) but includes fallback data for development. All API calls go through the `useApi` composable for consistent error handling and authentication.

### Image Handling
Images are stored in `/public/imgs/` directory with fallback handling for missing images using data URIs.

## Working with This Codebase

When making changes:
1. Use existing composables for API calls and authentication
2. Follow the established component patterns using Nuxt UI
3. Maintain TypeScript types for new data structures
4. Use the existing middleware for route protection
5. Follow the file-based routing conventions
6. Keep styling consistent with Nuxt UI design system