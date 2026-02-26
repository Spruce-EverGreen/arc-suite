// Demo user and business data
export const DEMO_USER = {
  id: 'demo-user-1',
  email: 'demo@arclabs.io',
  name: 'Demo User'
};

export const DEMO_BUSINESS = {
  id: 'demo-biz-1',
  name: 'Pro Cleaning Services',
  email: 'contact@procleaning.demo',
  phone: '(555) 123-4567',
  address: '123 Main St, Miami, FL 33101',
  logo_url: null
};

export const DEMO_SERVICES = [
  {
    id: 'svc-1',
    name: 'Standard Cleaning',
    description: 'Basic cleaning for homes and apartments',
    base_price: 120,
    price_unit: 'job',
    is_active: true,
    add_ons: [
      { id: 'ao-1', name: 'Inside Fridge', price: 25 },
      { id: 'ao-2', name: 'Inside Oven', price: 30 },
      { id: 'ao-3', name: 'Window Cleaning', price: 8 }
    ]
  },
  {
    id: 'svc-2',
    name: 'Deep Cleaning',
    description: 'Thorough cleaning including baseboards, vents, and detailed work',
    base_price: 0.15,
    price_unit: 'sqft',
    is_active: true,
    add_ons: [
      { id: 'ao-4', name: 'Carpet Shampooing', price: 75 },
      { id: 'ao-5', name: 'Tile & Grout Scrub', price: 60 }
    ]
  },
  {
    id: 'svc-3',
    name: 'Move-In/Move-Out',
    description: 'Complete cleaning for property transitions',
    base_price: 250,
    price_unit: 'job',
    is_active: true,
    add_ons: [
      { id: 'ao-6', name: 'Garage Cleaning', price: 50 },
      { id: 'ao-7', name: 'Exterior Windows', price: 100 }
    ]
  },
  {
    id: 'svc-4',
    name: 'Hourly Labor',
    description: 'General labor at hourly rate',
    base_price: 45,
    price_unit: 'hour',
    is_active: true,
    add_ons: []
  },
  {
    id: 'svc-5',
    name: 'TV Mounting',
    description: 'Professional TV installation',
    base_price: 100,
    price_unit: 'tv',
    is_active: true,
    add_ons: [
      { id: 'ao-10', name: 'Cord Concealment', price: 50 },
      { id: 'ao-11', name: 'Sound Bar Install', price: 35 }
    ]
  }
];
