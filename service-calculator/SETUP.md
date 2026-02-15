# Service Calculator Admin Panel - Setup Guide

## 🎯 Overview

The admin panel allows business owners to:
- ✅ Add, edit, and delete services
- ✅ Configure pricing (fixed, hourly, range, custom)
- ✅ Upload business logo
- ✅ Manage business profile and branding
- ✅ View dashboard with statistics

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Basic familiarity with React and Vite

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd /Users/aiuser/.openclaw/workspace/projects/ARC_Suite/service-calculator
npm install
```

### 2. Set Up Supabase

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details and wait for setup to complete

#### Run Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the contents of `supabase-schema.sql` and paste it
4. Click "Run" to create all tables and policies

#### Create Storage Bucket
1. Go to **Storage** in your Supabase dashboard
2. Click "Create a new bucket"
3. Name it: `business-assets`
4. Set it to **Public**
5. Click "Create bucket"

#### Get Your Credentials
1. Go to **Settings** > **API**
2. Copy your:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the Development Server

```bash
npm run dev
```

The app should now be running at `http://localhost:5173`

## 📖 Usage Guide

### First-Time Setup

1. **Sign Up**
   - Navigate to the app
   - Click "Don't have an account? Sign up"
   - Enter your email and password
   - Check your email for the confirmation link
   - Click the link to verify your account

2. **Sign In**
   - Return to the app and sign in with your credentials

3. **Set Up Business Profile**
   - You'll see a prompt to complete your business profile
   - Fill in:
     - Business name
     - Contact email
     - Contact phone (optional)
     - Brand color (for quotes and branding)
   - Upload your business logo (optional, max 2MB)
   - Click "Save Profile"

4. **Add Services**
   - Navigate to "Services" in the sidebar
   - Click "Add Service"
   - Fill in:
     - Service name (e.g., "Website Design")
     - Description
     - Pricing model (Fixed, Hourly, Range, or Custom)
     - Price(s)
     - Active status (toggle on to make visible to clients)
   - Click "Add Service"

5. **Manage Services**
   - View all services in a card grid
   - Click the edit icon to modify a service
   - Click the trash icon to delete a service
   - Services marked "Active" will be visible to clients

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ProtectedRoute.jsx    # Auth guard for protected routes
│   └── ServiceModal.jsx       # Modal for add/edit services
├── contexts/
│   └── AuthContext.jsx        # Authentication state management
├── lib/
│   └── supabase.js           # Supabase client configuration
├── pages/
│   ├── AdminDashboard.jsx    # Main admin layout with sidebar
│   ├── BusinessProfile.jsx   # Business profile management
│   ├── Dashboard.jsx         # Overview dashboard
│   ├── Login.jsx             # Authentication page
│   └── Services.jsx          # Services management
├── App.jsx                   # Main app with routing
├── index.css                 # Tailwind CSS imports
└── main.jsx                  # App entry point
```

## 🎨 Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Routing**: React Router v6

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🗄️ Database Tables

### `business_profiles`
- Stores business information, logo, contact details
- One profile per user

### `services`
- Stores service offerings with pricing
- Links to business profile
- Supports multiple pricing models

### `add_ons` (future use)
- Optional extras for services
- Not yet implemented in UI

### `quotes` (future use)
- Tracks generated quotes
- Not yet implemented in UI

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Users can only see/edit their own data
- Active services are publicly readable (for client calculator)
- Authentication required for admin panel

## 🚧 What's Next?

This is the **admin panel only**. Still to be built:
- [ ] Client-facing calculator
- [ ] PDF quote generation
- [ ] Email delivery
- [ ] Add-ons management UI
- [ ] Quote history and tracking

## 🐛 Troubleshooting

### "Failed to load profile"
- Check that your Supabase credentials in `.env` are correct
- Verify that you ran the database schema SQL
- Check browser console for specific errors

### Logo upload fails
- Ensure you created the `business-assets` storage bucket
- Set the bucket to **Public**
- Check file size (must be < 2MB)

### Services not loading
- Make sure you've created a business profile first
- Check browser console for errors
- Verify RLS policies are set up correctly

### Authentication issues
- Check that email confirmation is enabled in Supabase
- Go to **Authentication** > **Settings** > **Email Auth**
- Enable "Confirm email" if needed
- Or disable it for testing

## 📝 Notes

- All prices are stored in decimal format (2 decimal places)
- Timestamps are stored in UTC
- File uploads go to Supabase Storage
- Environment variables must start with `VITE_` for Vite to expose them

## 🆘 Support

For issues or questions, check:
- Supabase documentation: https://supabase.com/docs
- React Router: https://reactrouter.com
- Tailwind CSS: https://tailwindcss.com/docs
