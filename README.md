# Optics Shop Billing & Management System (Optics POS)

A production-grade, modular monolith POS architecture for managing inventory, customers, prescriptions, and billing for modern optics shops.

## Project Structure

- `frontend/` - React frontend with Vite, Tailwind CSS, TypeScript, and TanStack query.
- `backend/` - Node.js/Express backend with Drizzle ORM, PostgreSQL, and TypeScript.
- `shared/` - Shared TypeScript schemas, types, and constants.
- `docs/` - System architecture and user documentation.
- `docker/` - Docker deployment configurations.
- `scripts/` - Maintenance and installation scripts.

## Installation & Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in both `frontend/.env` and `backend/.env`.
4. Run development environments:
   - Backend: `npm run dev:backend`
   - Frontend: `npm run dev:frontend`
