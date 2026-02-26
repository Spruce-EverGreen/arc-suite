import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getServices, createService, updateService, deleteService } from '../lib/supabase';
import { DEMO_SERVICES } from '../data/mockData';

export default function Services() {
  const { business, isDemo } = useAuth();
  
  // Check if business profile exists (not needed in demo mode)
  const hasBusinessProfile = isDemo || !!business;
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    price_unit: 'job', // e.g., "hour", "sqft", "tv install", "job"
    is_active: true
  });

  // Load services
  useEffect(() => {
    const loadServices = async () => {
      if (isDemo) {
        setServices(DEMO_SERVICES);
        setLoading(false);
        return;
      }

      if (business?.id) {
        const { data, error } = await getServices(business.id);
        if (!error && data) {
          setServices(data);
        }
      }
      setLoading(false);
    };

    loadServices();
  }, [business, isDemo]);

  const toggleActive = async (service) => {
    if (isDemo) {
      setServices(services.map(s => 
        s.id === service.id ? { ...s, is_active: !s.is_active } : s
      ));
      return;
    }

    const { data, error } = await updateService(service.id, { is_active: !service.is_active });
    if (!error && data) {
      setServices(services.map(s => s.id === service.id ? data : s));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const serviceData = {
      name: formData.name,
      description: formData.description || '',
      base_price: parseFloat(formData.base_price),
      price_unit: formData.price_unit.toLowerCase().trim(),
      is_active: formData.is_active
    };

    if (isDemo) {
      if (editingService) {
        setServices(services.map(s => 
          s.id === editingService.id ? { ...s, ...serviceData, add_ons: s.add_ons } : s
        ));
      } else {
        setServices([...services, { 
          id: Date.now(), 
          ...serviceData,
          add_ons: [] 
        }]);
      }
      closeModal();
      setSaving(false);
      return;
    }

    try {
      if (editingService) {
        const { data, error } = await updateService(editingService.id, serviceData);
        if (error) throw error;
        setServices(services.map(s => s.id === editingService.id ? { ...data, add_ons: s.add_ons } : s));
      } else {
        if (!business?.id) {
          throw new Error('Business profile required. Please set up your profile first.');
        }
        const { data, error } = await createService({
          ...serviceData,
          business_id: business.id
        });
        if (error) throw error;
        setServices([...services, { ...data, add_ons: [] }]);
      }
      closeModal();
    } catch (err) {
      alert('Error saving service: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (service) => {
    if (!confirm('Delete this service?')) return;

    if (isDemo) {
      setServices(services.filter(s => s.id !== service.id));
      return;
    }

    const { error } = await deleteService(service.id);
    if (!error) {
      setServices(services.filter(s => s.id !== service.id));
    }
  };

  const openEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      base_price: service.base_price.toString(),
      price_unit: service.price_unit || 'job',
      is_active: service.is_active
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      base_price: '',
      price_unit: 'job',
      is_active: true
    });
  };

  const formatPrice = (service) => {
    const price = service.base_price;
    const unit = service.price_unit || 'job';
    if (unit === 'job') return `$${price}`;
    return `$${price} / ${unit}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted">Loading services...</div>
        </div>
      </Layout>
    );
  }

  // Show setup prompt if no business profile (and not in demo mode)
  if (!hasBusinessProfile) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold heading-glow">Services</h1>
            <p className="text-muted">Manage your service offerings</p>
          </div>
          <div className="glass-static p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-muted mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">Business Profile Required</h2>
            <p className="text-muted mb-6">Please set up your business profile first to manage services.</p>
            <Link to="/profile" className="btn-arc inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Set Up Profile
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold heading-glow">Services</h1>
            <p className="text-muted">
              {isDemo && <span className="text-amber-400">[Demo Mode] </span>}
              Manage your service offerings
            </p>
          </div>
          <button className="btn-arc flex items-center gap-2" onClick={() => setShowModal(true)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Service
          </button>
        </div>

        {/* Services Table */}
        <div className="glass-static overflow-hidden">
          {services.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted mb-4">No services yet</p>
              <button className="btn-arc" onClick={() => setShowModal(true)}>
                Add Your First Service
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--glass-bg)]">
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted">Service</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted">Pricing</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id} className="border-t border-[var(--glass-border)] hover:bg-[var(--glass-hover)] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium">{service.name}</p>
                      {service.description && <p className="text-sm text-subtle">{service.description}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-arc">{formatPrice(service)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(service)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          service.is_active 
                            ? 'bg-[var(--success-bg)] text-[var(--success)]' 
                            : 'bg-[var(--glass)] text-subtle'
                        }`}
                      >
                        {service.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          className="btn-ghost text-sm"
                          onClick={() => openEdit(service)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-ghost text-sm text-red-400 hover:text-red-300"
                          onClick={() => handleDelete(service)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Service Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="stat-card">
            <span className="stat-label">Active Services</span>
            <span className="stat-value text-arc">{services.filter(s => s.is_active).length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Services</span>
            <span className="stat-value">{services.length}</span>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-static p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">
              {editingService ? 'Edit Service' : 'Add Service'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm mb-2 text-muted">Service Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-glass"
                  placeholder="e.g., TV Mounting, Floor Cleaning"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2 text-muted">Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-glass min-h-[60px]"
                  placeholder="What's included..."
                />
              </div>
              
              {/* Price × Unit */}
              <div>
                <label className="block text-sm mb-2 text-muted">Pricing</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.base_price}
                      onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                      className="input-glass"
                      style={{ paddingLeft: '28px' }}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <span className="text-muted text-lg">×</span>
                  <input
                    type="text"
                    value={formData.price_unit}
                    onChange={(e) => setFormData({ ...formData, price_unit: e.target.value })}
                    className="input-glass flex-1"
                    placeholder="hour, sqft, unit"
                    required
                  />
                </div>
                <p className="text-xs text-subtle mt-2">
                  Examples: $15 × hour, $1 × sqft, $100 × tv install, $250 × job
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="is_active" className="text-sm text-muted">Service is active</label>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeModal} className="btn-glass flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-arc flex-1" disabled={saving}>
                  {saving ? 'Saving...' : (editingService ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
