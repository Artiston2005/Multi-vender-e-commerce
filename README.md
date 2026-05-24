# Multi-Vendor E-Commerce Platform

**Intern ID**: CITS1467  
**Full Name**: Ashwin Yadav 
**No. of Weeks**: 8 weeks  
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

### Home Page (Search & Filters)
<img width="2560" height="2583" alt="Homepage Artiston2005 Multi-Vendor E-Commerce" src="https://github.com/user-attachments/assets/82c58f57-5bf3-4092-8944-661c199303ee" />

### Product Details & Reviews
<img width="2560" height="1540" alt="Item Page Artiston2005 Multi-Vendor E-Commerce" src="https://github.com/user-attachments/assets/2645b446-6339-4814-855d-832bebe6a8b8" />

### Vendor Dashboard
<img width="2560" height="1240" alt="Vendor Dashboard Artiston2005 Multi-Vendor E-Commerce" src="https://github.com/user-attachments/assets/53696f9e-b0c0-4c0e-8ddc-4e7111635643" />
<img width="2560" height="1240" alt="Vendor Products Artiston2005 Multi-Vendor E-Commerce" src="https://github.com/user-attachments/assets/c12f8ccb-e42f-4e69-96c3-6f53a4ec2fb8" />

### Admin Dashboard
<img width="2560" height="1240" alt="Admin Dashboard Artiston2005 Multi-Vendor E-Commerce" src="https://github.com/user-attachments/assets/58f912cd-a591-4a9b-aaf4-c2710e7014b7" />

### Cart & Checkout
<img width="2560" height="1240" alt="Order Page Artiston2005 Multi-Vendor E-Commerce" src="https://github.com/user-attachments/assets/73a93c72-9f3d-4cee-9f3f-b9d22f22ca28" />

<img width="676" height="1240" alt="Cart Artiston2005 Multi-Vendor E-Commerce" src="https://github.com/user-attachments/assets/1aeedfd3-f3e2-4011-bb8e-806cf7d56b06" />

### Login and Register
<img width="2560" height="1240" alt="Login Artiston2005 Multi-Vendor E-Commerce" src="https://github.com/user-attachments/assets/ca23c0e2-fdc7-4ad7-b0c1-b5dc05c85ef7" />
<img width="2560" height="1240" alt="Register Artiston2005 Multi-Vendor E-Commerce" src="https://github.com/user-attachments/assets/afe4db32-4558-4729-abec-241fa226d664" />



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
