-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Business Profiles Table
CREATE TABLE IF NOT EXISTS business_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    logo_url TEXT,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    brand_color TEXT DEFAULT '#007da5',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    price_max DECIMAL(10, 2),
    pricing_model TEXT NOT NULL CHECK (pricing_model IN ('fixed', 'hourly', 'range', 'custom')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add-Ons Table
CREATE TABLE IF NOT EXISTS add_ons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Quotes Table
CREATE TABLE IF NOT EXISTS quotes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
    client_email TEXT NOT NULL,
    client_name TEXT,
    services_selected JSONB NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_business_profiles_updated_at BEFORE UPDATE ON business_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_add_ons_updated_at BEFORE UPDATE ON add_ons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Business Profiles Policies
CREATE POLICY "Users can view their own business profile"
    ON business_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business profile"
    ON business_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business profile"
    ON business_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business profile"
    ON business_profiles FOR DELETE
    USING (auth.uid() = user_id);

-- Services Policies
CREATE POLICY "Users can view their own services"
    ON services FOR SELECT
    USING (
        business_id IN (
            SELECT id FROM business_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own services"
    ON services FOR INSERT
    WITH CHECK (
        business_id IN (
            SELECT id FROM business_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own services"
    ON services FOR UPDATE
    USING (
        business_id IN (
            SELECT id FROM business_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own services"
    ON services FOR DELETE
    USING (
        business_id IN (
            SELECT id FROM business_profiles WHERE user_id = auth.uid()
        )
    );

-- Public read access for active services (for client calculator)
CREATE POLICY "Anyone can view active services"
    ON services FOR SELECT
    USING (is_active = true);

-- Add-Ons Policies
CREATE POLICY "Users can manage their own add-ons"
    ON add_ons FOR ALL
    USING (
        service_id IN (
            SELECT s.id FROM services s
            INNER JOIN business_profiles bp ON s.business_id = bp.id
            WHERE bp.user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view active add-ons"
    ON add_ons FOR SELECT
    USING (is_active = true);

-- Quotes Policies
CREATE POLICY "Users can view their own quotes"
    ON quotes FOR SELECT
    USING (
        business_id IN (
            SELECT id FROM business_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert quotes"
    ON quotes FOR INSERT
    WITH CHECK (true);

-- Storage bucket for business assets (logos, PDFs)
-- Run this in Supabase Dashboard > Storage:
-- Create a new bucket called 'business-assets' and set it to public

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_services_business_id ON services(business_id);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_add_ons_service_id ON add_ons(service_id);
CREATE INDEX IF NOT EXISTS idx_quotes_business_id ON quotes(business_id);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
