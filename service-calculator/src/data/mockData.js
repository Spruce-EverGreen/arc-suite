// Mock data for demo mode (no Supabase required)

export const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@arcsuite.io',
  user_metadata: { full_name: 'Demo Business' },
};

export const DEMO_BUSINESS = {
  id: 'demo-biz-001',
  user_id: 'demo-user-001',
  business_name: 'Acme Services Co.',
  contact_email: 'hello@acmeservices.com',
  contact_phone: '(305) 555-0123',
  brand_color: '#007da5',
  tax_rate: 7,
  website_url: 'https://acmeservices.com',
};

export const DEMO_SERVICES = [
  {
    id: 'svc-1',
    business_id: 'demo-biz-001',
    name: 'Website Design & Development',
    description: 'Custom website built with modern tech. Fast, mobile-first, and SEO-ready.',
    base_price: 2500,
    pricing_model: 'fixed',
    is_active: true,
    addOns: [
      { id: 'ao-1', name: 'E-commerce Integration', price: 1500 },
      { id: 'ao-2', name: 'SEO Optimization Package', price: 500 },
      { id: 'ao-3', name: 'CMS Setup', price: 800 },
    ],
  },
  {
    id: 'svc-2',
    business_id: 'demo-biz-001',
    name: 'Monthly Maintenance',
    description: 'Keep your site secure, updated, and running smooth. Includes uptime monitoring.',
    base_price: 150,
    pricing_model: 'hourly',
    is_active: true,
    addOns: [
      { id: 'ao-4', name: 'Priority Support (24hr)', price: 75 },
      { id: 'ao-5', name: 'Monthly Analytics Report', price: 50 },
    ],
  },
  {
    id: 'svc-3',
    business_id: 'demo-biz-001',
    name: 'Brand Identity Package',
    description: 'Logo, color palette, typography, and brand guidelines — everything you need.',
    base_price: 1200,
    pricing_model: 'fixed',
    is_active: true,
    addOns: [
      { id: 'ao-6', name: 'Business Card Design', price: 150 },
      { id: 'ao-7', name: 'Social Media Kit', price: 300 },
    ],
  },
  {
    id: 'svc-4',
    business_id: 'demo-biz-001',
    name: 'Digital Marketing Strategy',
    description: 'Google Ads, Meta Ads, and content strategy. Built for ROI.',
    base_price: 200,
    pricing_model: 'hourly',
    is_active: true,
    addOns: [
      { id: 'ao-8', name: 'Monthly Social Media Management', price: 800 },
      { id: 'ao-9', name: 'Email Campaign (per campaign)', price: 600 },
    ],
  },
  {
    id: 'svc-5',
    business_id: 'demo-biz-001',
    name: 'IT Support & Consulting',
    description: 'Remote IT support, network setup, security audits, and tech consulting.',
    base_price: 125,
    pricing_model: 'hourly',
    is_active: true,
    addOns: [
      { id: 'ao-10', name: 'On-site Visit', price: 200 },
      { id: 'ao-11', name: 'Security Audit Report', price: 500 },
    ],
  },
];

export const DEMO_STATS = {
  servicesCount: 5,
  activeServicesCount: 5,
  quotesCount: 12,
  hasProfile: true,
};
