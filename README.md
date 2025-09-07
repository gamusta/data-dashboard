# Dashboard Data - Full-Stack Orders Management System

A modern, production-ready dashboard for managing orders with advanced filtering, sorting, and export capabilities.

## 🚀 Features

### Core Functionality
- **Orders Management**: Complete CRUD operations for orders
- **Advanced Filtering**: Multi-criteria filtering with URL persistence
- **Real-time Search**: Debounced search across orders and customers
- **Data Export**: CSV export with applied filters and sorting
- **Role-based Access**: Admin/Viewer permissions

### User Experience
- **Responsive Design**: Mobile-first with desktop optimization
- **Modern UI**: Clean interface with shadcn/ui components
- **Real-time Updates**: Instant feedback and loading states
- **Accessibility**: ARIA compliant with keyboard navigation

### Technical Features
- **Server-side Pagination**: Efficient data loading
- **Multi-column Sorting**: Complex sorting with visual indicators
- **URL State Management**: Shareable filtered views
- **Type Safety**: Full TypeScript implementation

## 🛠️ Tech Stack

- **Frontend**: Next.js 13+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth (Email + Google OAuth)
- **UI Components**: shadcn/ui + Radix UI
- **Data Tables**: TanStack Table
- **Styling**: Tailwind CSS with CSS Variables

## 📋 Prerequisites

Before running this project, you need:

1. **Supabase Project**: [Create a new project](https://supabase.com/dashboard)
2. **Database**: PostgreSQL database (provided by Supabase)
3. **Environment Variables**: Supabase credentials

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

### 2. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with sample data
npm run db:seed
```

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🔐 Authentication

### Demo Credentials
- **Admin**: `admin@example.com` / `password`
- **Viewer**: `viewer@example.com` / `password`

### OAuth Setup
1. Enable Google OAuth in your Supabase project
2. Configure OAuth redirect URLs
3. Add your Google OAuth credentials

## 📊 Data Model

### Core Entities
- **Users**: Authentication and role management
- **Customers**: Customer information and company details
- **Orders**: Order data with status tracking
- **Tags**: Flexible tagging system for orders

### Relationships
```
User (1) → (∞) Sessions
Customer (1) → (∞) Orders
Order (∞) → (∞) Tags (through OrderTag)
```

## 🎯 Key Features Explained

### Advanced Filtering
- **Text Search**: Full-text search across order numbers, customer names, and companies
- **Status Filtering**: Multi-select status filtering
- **Date Range**: Flexible date range selection
- **Amount Range**: Min/max amount filtering
- **Customer Selection**: Autocomplete customer picker

### URL State Management
All filter states are reflected in the URL for:
- **Deep Linking**: Share exact views with others
- **Browser History**: Back/forward navigation works
- **Bookmark Support**: Save filtered views

### Export Functionality
- **Filtered Exports**: CSV exports respect all active filters
- **Proper Formatting**: Formatted dates and currency values
- **UTF-8 Encoding**: Proper handling of international characters

### Role-based Permissions
- **Admin Users**: Full CRUD access to all resources
- **Viewer Users**: Read-only access to data
- **Secure API**: All endpoints validate user permissions

## 🔄 API Endpoints

### Orders
- `GET /api/orders` - List orders with filtering/pagination
- `GET /api/orders/[id]` - Get single order
- `POST /api/orders` - Create order (Admin only)
- `PATCH /api/orders/[id]` - Update order (Admin only)
- `DELETE /api/orders/[id]` - Delete order (Admin only)
- `GET /api/orders/export` - Export orders as CSV

### Customers
- `GET /api/customers` - List customers with search

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile**: Optimized touch interfaces and collapsible filters
- **Tablet**: Balanced layout with accessible controls
- **Desktop**: Full-featured interface with advanced interactions

## 🧪 Development

### Database Operations
```bash
# Reset database
npx prisma migrate reset

# View database in Prisma Studio
npm run db:studio

# Generate new migration
npx prisma migrate dev --name migration_name
```

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with Next.js rules
- **Prettier**: Consistent code formatting

## 📈 Performance Optimizations

- **Server-side Pagination**: Efficient data loading
- **Debounced Search**: Reduced API calls
- **Lazy Loading**: Components loaded as needed
- **Optimistic Updates**: Immediate UI feedback
- **Caching**: Strategic use of React Server Components

## 🔒 Security

- **Authentication**: Secure Supabase Auth integration
- **Authorization**: Role-based access control
- **Input Validation**: Zod schemas on client and server
- **SQL Injection**: Prisma ORM protection
- **CSRF**: Built-in Next.js protection

## 📚 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── dashboard/         # Dashboard pages
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   └── orders/           # Order-specific components
├── lib/                   # Utilities and configurations
│   ├── supabase/         # Supabase client setup
│   └── validations/      # Zod schemas
├── prisma/               # Database schema and migrations
└── scripts/              # Database seeding scripts
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ using Next.js, Supabase, and Prisma**