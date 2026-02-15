# Service Calculator - Admin Panel

A modern admin panel for managing service offerings, pricing, and business profile. Built with React, Vite, Tailwind CSS, and Supabase.

## Features

✅ **Service Management** - Add, edit, delete services with flexible pricing models  
✅ **Business Profile** - Configure business details, upload logo, set brand colors  
✅ **Dashboard** - Overview of services, quotes, and quick actions  
✅ **Authentication** - Secure login with Supabase Auth  
✅ **Responsive Design** - Works beautifully on desktop and mobile  

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
npm run dev
```

## 📖 Full Setup Instructions

See **[SETUP.md](./SETUP.md)** for complete setup and usage guide.

## Tech Stack

- React 19 + Vite
- Tailwind CSS v4
- Supabase (PostgreSQL + Auth + Storage)
- React Router v6
- Lucide React (icons)

## Project Structure

```
src/
├── components/      # Reusable components
├── contexts/        # React contexts (Auth)
├── lib/            # Utilities (Supabase client)
├── pages/          # Route pages
└── App.jsx         # Main app with routing
```

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## What's Included

- ✅ Admin authentication
- ✅ Business profile management
- ✅ Service CRUD operations
- ✅ Logo upload to Supabase Storage
- ✅ Dashboard with statistics
- ✅ Responsive mobile-first design

## What's Next (Not Yet Built)

- [ ] Client-facing calculator
- [ ] PDF quote generation
- [ ] Email delivery
- [ ] Add-ons management UI
- [ ] Quote history and tracking

## Database Schema

See `supabase-schema.sql` for the complete database setup.

Tables:
- `business_profiles` - Business information
- `services` - Service offerings and pricing
- `add_ons` - Optional service extras (future)
- `quotes` - Generated quotes (future)

## License

Private project - ARC Suite

---

For detailed setup instructions, troubleshooting, and usage guide, see **[SETUP.md](./SETUP.md)**.
