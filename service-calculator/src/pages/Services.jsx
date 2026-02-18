import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, DollarSign, Briefcase } from 'lucide-react';
import ServiceModal from '../components/ServiceModal';
import { DEMO_BUSINESS, DEMO_SERVICES } from '../data/mockData';

export default function Services() {
  const { user, isDemoMode } = useAuth();
  const [services, setServices] = useState(isDemoMode ? DEMO_SERVICES : []);
  const [loading, setLoading] = useState(!isDemoMode);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [businessProfile, setBusinessProfile] = useState(isDemoMode ? DEMO_BUSINESS : null);

  useEffect(() => {
    if (isDemoMode || !isSupabaseConfigured || !supabase) {
      setBusinessProfile(DEMO_BUSINESS);
      setServices(DEMO_SERVICES);
      setLoading(false);
      return;
    }
    fetchBusinessProfile();
  }, [user, isDemoMode]);

  useEffect(() => {
    if (!isDemoMode && businessProfile && isSupabaseConfigured && supabase) {
      fetchServices();
    }
  }, [businessProfile, isDemoMode]);

  const fetchBusinessProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setBusinessProfile(data);
    } catch (error) {
      console.error('Error fetching business profile:', error);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (isDemoMode) {
      alert('Demo mode: changes are not saved.');
      return;
    }
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  const handleEdit = (service) => {
    if (isDemoMode) {
      alert('Demo mode: editing is disabled. Connect Supabase to enable full functionality.');
      return;
    }
    setEditingService(service);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    if (isDemoMode) {
      alert('Demo mode: adding services is disabled. Connect Supabase to enable full functionality.');
      return;
    }
    setEditingService(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingService(null);
    fetchServices();
  };

  if (!businessProfile && !isDemoMode) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-semibold text-yellow-900 mb-2">Setup Required</h3>
        <p className="text-yellow-700 mb-4">
          Please complete your business profile before adding services.
        </p>
        <a
          href="/admin/profile"
          className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition"
        >
          Go to Business Profile
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600 mt-1">Manage your service offerings and pricing</p>
          {isDemoMode && (
            <span className="inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
              ⚡ Demo Mode — read only
            </span>
          )}
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
        >
          <Plus size={20} />
          Add Service
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No services yet</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first service</p>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
          >
            <Plus size={20} />
            Add Your First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {service.name}
                  </h3>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                    service.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {service.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {service.description}
              </p>

              <div className="flex items-center gap-2 text-gray-900">
                <DollarSign size={20} className="text-green-600" />
                <span className="font-semibold text-lg">
                  {service.pricing_model === 'hourly'
                    ? `$${service.base_price}/hr`
                    : `$${service.base_price}`}
                </span>
                <span className="text-sm text-gray-500 capitalize">
                  ({service.pricing_model})
                </span>
              </div>

              {service.addOns && service.addOns.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 font-medium mb-1">
                    {service.addOns.length} add-on{service.addOns.length > 1 ? 's' : ''} available
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modalOpen && !isDemoMode && (
        <ServiceModal
          service={editingService}
          businessId={businessProfile?.id}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
