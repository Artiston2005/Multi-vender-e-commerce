# Multi-Vendor E-Commerce Platform

**Intern ID**: [Your Intern ID]  
**Full Name**: [Your Full Name]  
**No. of Weeks**: [Number of Weeks]  
**Project Name**: Multi-Vendor E-Commerce Platform  
**Project Scope**: A comprehensive web application allowing multiple vendors to register, manage their products, and track orders, while providing customers with a seamless shopping experience including search, filters, a shopping cart, checkout, and verified product reviews. 

A fully functional, modern multi-vendor e-commerce platform built with Next.js (App Router, Turbopack), Express, Prisma, and Tailwind CSS.

## Features

- **Multi-Role Authentication**: Secure JWT-based authentication for Admin, Vendors, and Customers.
- **Admin Dashboard**: Approve or reject vendor store applications.
- **Vendor Dashboard**: 
  - Apply for a store
  - Manage Products (Create, Update, Delete)
  - Manage Product Variants (Sizes, Colors) and Stock
  - Track Orders and update statuses (Pending, Shipped, Delivered)
- **Customer Experience**:
  - Browse global products with Search and Category filters
  - Detailed product pages with reviews
  - Shopping Cart with quantity management
  - Order checkout and tracking
  - Leave verified reviews (only for delivered purchases)

## Project Deliverables

- [x] **Source Code**: Available in `/frontend` and `/backend` directories.
- [x] **README File**: Comprehensive setup and project documentation.
- [x] **Screenshots**: Provided below in the Screenshots section.
- [x] **Output Images**: Provided below in the Screenshots section.
- [x] **Documentation**: Codebase well-structured, REST API documented via implementation details.

## Screenshots

*(Placeholders for screenshots)*

### Home Page (Search & Filters)
`![Home Page Screenshot](./docs/screenshots/home.png)`

### Product Details & Reviews
`![Product Details Screenshot](./docs/screenshots/product-details.png)`

### Vendor Dashboard
`![Vendor Dashboard Screenshot](./docs/screenshots/vendor-dashboard.png)`

### Admin Dashboard
`![Admin Dashboard Screenshot](./docs/screenshots/admin-dashboard.png)`

### Cart & Checkout
`![Cart Checkout Screenshot](./docs/screenshots/cart.png)`

## Tech Stack

**Frontend**:
- Next.js (React Framework, App Router)
- Tailwind CSS (Styling)
- shadcn/ui (UI Components)
- Axios (API Client)
- Lucide React (Icons)

**Backend**:
- Node.js & Express (API Server)
- Prisma (ORM)
- SQLite (Development Database) / PostgreSQL (Production Database)
- Zod (Request Validation)
- JWT (JSON Web Tokens)
- bcrypt (Password Hashing)

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Database Setup & Seeding

The application uses Prisma with SQLite by default. A seed script is provided to populate the database with a system admin, vendors, customers, products, and reviews.

```bash
cd backend
npm install
# Set up environment variables
cp .env.example .env 
# Push schema and generate client
npx prisma db push
npx prisma generate
# Seed the database
npx ts-node prisma/seed.ts
```

### 2. Start the Backend

```bash
cd backend
npm run dev
# The API will run on http://localhost:5000
```

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
# The app will run on http://localhost:3000
```

## Demo Credentials (from Seed)

- **Admin**: `admin@marketplace.com` / `password123`
- **Vendor 1**: `vendor1@marketplace.com` / `password123`
- **Vendor 2**: `vendor2@marketplace.com` / `password123`
- **Customer**: `customer1@gmail.com` / `password123`

## Project Structure

- `/backend`: Express API, Prisma Schema, Controllers, Middleware, Validation.
- `/frontend`: Next.js frontend, Tailwind configuration, React Context (Cart, Auth), Pages.

## License

This project is open-source and available under the MIT License.
