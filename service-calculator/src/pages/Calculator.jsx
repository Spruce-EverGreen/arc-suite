import ServiceCalculator from '../components/ServiceCalculator';
import { DEMO_BUSINESS, DEMO_SERVICES } from '../data/mockData';

/**
 * Public-facing calculator page
 * In demo mode: uses mock data
 * With Supabase: loads real business data by businessId param (future)
 */
export default function Calculator() {
  // For now, always uses demo/mock data — Supabase integration comes after demo validation
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ServiceCalculator
        businessProfile={DEMO_BUSINESS}
        services={DEMO_SERVICES}
      />
    </div>
  );
}
