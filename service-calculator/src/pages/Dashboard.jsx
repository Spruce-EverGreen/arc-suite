import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building2, FileText, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    servicesCount: 0,
    activeServicesCount: 0,
    quotesCount: 0,
    hasProfile: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Get business profile
      const { data: profile } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        setStats({ servicesCount: 0, activeServicesCount: 0, quotesCount: 0, hasProfile: false });
        return;
      }

      // Get services count
      const { count: servicesCount } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', profile.id);

      // Get active services count
      const { count: activeServicesCount } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', profile.id)
        .eq('is_active', true);

      // Get quotes count
      const { count: quotesCount } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', profile.id);

      setStats({
        servicesCount: servicesCount || 0,
        activeServicesCount: activeServicesCount || 0,
        quotesCount: quotesCount || 0,
        hasProfile: true,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: Briefcase,
      label: 'Total Services',
      value: stats.servicesCount,
      color: 'blue',
      action: () => navigate('/admin/services'),
    },
    {
      icon: TrendingUp,
      label: 'Active Services',
      value: stats.activeServicesCount,
      color: 'green',
      action: () => navigate('/admin/services'),
    },
    {
      icon: FileText,
      label: 'Quotes Generated',
      value: stats.quotesCount,
      color: 'purple',
    },
    {
      icon: Building2,
      label: 'Business Profile',
      value: stats.hasProfile ? '✓' : '✗',
      color: stats.hasProfile ? 'green' : 'red',
      action: () => navigate('/admin/profile'),
    },
  ];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's an overview of your service calculator.</p>
      </div>

      {!stats.hasProfile && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">🚀 Get Started</h3>
          <p className="text-yellow-700 mb-4">
            Complete your business profile to start using the service calculator.
          </p>
          <button
            onClick={() => navigate('/admin/profile')}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition font-medium"
          >
            Set Up Business Profile
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            onClick={card.action}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${
              card.action ? 'cursor-pointer hover:shadow-md transition' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${card.color}-100`}>
                <card.icon className={`text-${card.color}-600`} size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{card.label}</h3>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/admin/services')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition text-left font-medium"
            >
              <Briefcase size={20} />
              Manage Services
            </button>
            <button
              onClick={() => navigate('/admin/profile')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition text-left font-medium"
            >
              <Building2 size={20} />
              Edit Business Profile
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                stats.hasProfile ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                1
              </span>
              <span>Set up your business profile</span>
            </li>
            <li className="flex items-start gap-3">
              <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                stats.servicesCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                2
              </span>
              <span>Add your services and pricing</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-semibold">
                3
              </span>
              <span>Share your calculator with clients</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
