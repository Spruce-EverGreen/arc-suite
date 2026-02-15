# Service Calculator - MVP Specification

## Overview
A web-based tool that allows service businesses to create custom pricing calculators for their clients. Clients can select services, see instant pricing, and receive professional quotes.

## Core Features

### 1. Admin Panel (Business Owner)
**Purpose:** Configure services and pricing

**Features:**
- User authentication (email/password)
- Service management:
  - Add/edit/delete services
  - Name, description, base price
  - Optional: price range (min-max)
  - Optional: pricing model (fixed, hourly, custom)
- Add-on management:
  - Optional extras that can be added to services
  - Additional cost per add-on
- Business profile:
  - Business name, logo upload
  - Contact information (email, phone)
  - Brand colors (for quote customization)

### 2. Client-Facing Calculator
**Purpose:** Allow clients to build custom quotes

**Features:**
- Clean, professional interface
- Service selection:
  - Browse available services
  - See descriptions and pricing
  - Select multiple services
- Add-on selection (if applicable)
- Real-time price calculation
- "Get Quote" button to generate PDF

**Embed Options:**
- Standalone URL (shareable link)
- Embed widget (iframe for websites)

### 3. Quote Generation
**Purpose:** Create professional PDF quotes

**Features:**
- Auto-generated PDF including:
  - Business logo and branding
  - Date
  - Services selected (with descriptions and prices)
  - Add-ons (if any)
  - Subtotal, tax (if configured), total
  - Business contact information
  - Optional: Terms and conditions
  - Optional: Expiration date (e.g., quote valid for 30 days)

### 4. Email Delivery
**Purpose:** Send quotes to client and business

**Features:**
- Send quote PDF via email to:
  - Client (email they provide in form)
  - Business owner (notification copy)
- Email template:
  - Subject: "Your Quote from [Business Name]"
  - Body: Professional message with PDF attached
  - Optional: Call-to-action button ("Accept Quote" for future payment integration)

## Tech Stack

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **PDF Generation:** jsPDF or react-pdf

### Backend
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **File Storage:** Supabase Storage (for logos, generated PDFs)
- **Email:** Resend or SendGrid API

### Hosting
- **Platform:** Vercel
- **Domain:** TBD (subdomain of rodneyramirez.com or standalone)

## Database Schema

### Users Table
```sql
- id (uuid, primary key)
- email (text, unique)
- created_at (timestamp)
```

### Business_Profiles Table
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to users)
- business_name (text)
- logo_url (text, nullable)
- contact_email (text)
- contact_phone (text, nullable)
- brand_color (text, default #007da5)
- created_at (timestamp)
```

### Services Table
```sql
- id (uuid, primary key)
- business_id (uuid, foreign key to business_profiles)
- name (text)
- description (text)
- base_price (decimal)
- price_max (decimal, nullable)
- pricing_model (enum: fixed, hourly, range, custom)
- is_active (boolean, default true)
- created_at (timestamp)
```

### Add_Ons Table
```sql
- id (uuid, primary key)
- service_id (uuid, foreign key to services)
- name (text)
- description (text, nullable)
- price (decimal)
- is_active (boolean, default true)
- created_at (timestamp)
```

### Quotes Table (for tracking)
```sql
- id (uuid, primary key)
- business_id (uuid, foreign key to business_profiles)
- client_email (text)
- client_name (text, nullable)
- services_selected (jsonb)
- total_amount (decimal)
- pdf_url (text, nullable)
- created_at (timestamp)
```

## MVP Constraints (What We're NOT Building Yet)

- ❌ Payment processing (add in Phase 2)
- ❌ Quote acceptance/rejection tracking
- ❌ Client portal (separate app)
- ❌ Advanced analytics/reporting
- ❌ Multi-user accounts (only 1 business owner per account)
- ❌ Custom quote templates (one default template for MVP)
- ❌ Integration with other ARC apps (comes later)

## Success Criteria

**Functional:**
- Business owner can sign up, create services, and configure pricing
- Client can access calculator, select services, and generate quote
- Quote PDF is professional and includes all selected services
- Email delivery works reliably

**Non-Functional:**
- Load time < 2 seconds
- Mobile-responsive
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)

## Timeline

**Week 1 (7 days):**
- Day 1-2: Supabase setup, database schema, auth
- Day 3-4: Admin panel (service management)
- Day 5-6: Client calculator + PDF generation
- Day 7: Email delivery + testing

**Delivery:** Functional MVP by end of Week 1
