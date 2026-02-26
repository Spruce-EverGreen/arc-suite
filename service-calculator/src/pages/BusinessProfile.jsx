import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { updateBusinessProfile, createBusinessProfile } from '../lib/supabase';

export default function BusinessProfile() {
  const { user, business, isDemo, setBusiness } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    business_name: '',
    contact_email: '',
    contact_phone: '',
    primary_color: '#7eb8d8',
    secondary_color: '#0a0a0a',
    logo_url: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // Load business data into form when available
  useEffect(() => {
    if (business) {
      setForm({
        business_name: business.business_name || '',
        contact_email: business.contact_email || '',
        contact_phone: business.contact_phone || '',
        primary_color: business.primary_color || business.brand_color || '#7eb8d8',
        secondary_color: business.secondary_color || '#0a0a0a',
        logo_url: business.logo_url || ''
      });
    } else if (isDemo) {
      setForm({
        business_name: 'Demo Auto Shop',
        contact_email: 'demo@example.com',
        contact_phone: '(555) 123-4567',
        primary_color: '#7eb8d8',
        secondary_color: '#0a0a0a',
        logo_url: ''
      });
    }
  }, [business, isDemo]);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo must be under 2MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, logo_url: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isDemo) {
      setError('Saving is disabled in demo mode. Sign up to save your profile!');
      return;
    }

    if (!user) {
      setError('You must be logged in to save a profile');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const profileData = {
        business_name: form.business_name,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone || null,
        primary_color: form.primary_color,
        secondary_color: form.secondary_color,
        logo_url: form.logo_url || null
      };

      if (business) {
        const { data, error: updateError } = await updateBusinessProfile(business.id, profileData);
        if (updateError) throw updateError;
        setBusiness(data);
      } else {
        const { data, error: createError } = await createBusinessProfile({
          user_id: user.id,
          ...profileData
        });
        if (createError) throw createError;
        setBusiness(data);
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const isNewProfile = !business && !isDemo;

  return (
    <Layout>
      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">
            {isNewProfile ? 'Set Up Your Profile' : 'Settings'}
          </h1>
          <p className="text-muted">
            {isNewProfile 
              ? 'Create your business profile to get started'
              : 'Manage your business and branding'}
          </p>
          {isDemo && (
            <div className="mt-3 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
              Demo mode — changes won't be saved
            </div>
          )}
        </div>

        {/* Tabs */}
        {!isNewProfile && (
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('info')}
              className={`btn-pill ${activeTab === 'info' ? 'active' : ''}`}
            >
              Business Info
            </button>
            <button
              onClick={() => setActiveTab('branding')}
              className={`btn-pill ${activeTab === 'branding' ? 'active' : ''}`}
            >
              Branding
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Business Info Tab */}
        {(activeTab === 'info' || isNewProfile) && (
          <form onSubmit={handleSubmit} className="glass-panel space-y-6">
            <div>
              <label className="block text-sm mb-2 text-muted">Business Name</label>
              <input
                type="text"
                value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                className="input-glass"
                placeholder="Your Business Name"
                disabled={isDemo}
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-muted">Contact Email</label>
              <input
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                className="input-glass"
                placeholder="contact@yourbusiness.com"
                disabled={isDemo}
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-muted">Phone</label>
              <input
                type="tel"
                value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                className="input-glass"
                placeholder="(555) 123-4567"
                disabled={isDemo}
              />
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button type="submit" className="btn-arc" disabled={isDemo || saving}>
                {saving ? 'Saving...' : isNewProfile ? 'Create Profile' : 'Save Changes'}
              </button>
              {saved && (
                <span className="text-[var(--success)] flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved!
                </span>
              )}
            </div>
          </form>
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && !isNewProfile && (
          <form onSubmit={handleSubmit} className="glass-panel space-y-8">
            
            {/* Logo Upload */}
            <div>
              <label className="block text-sm mb-3 text-muted">Logo</label>
              <div className="flex items-center gap-6">
                <div 
                  className="w-24 h-24 rounded-xl glass flex items-center justify-center overflow-hidden cursor-pointer hover:border-[var(--arc)] transition-colors"
                  onClick={() => !isDemo && fileInputRef.current?.click()}
                >
                  {form.logo_url ? (
                    <img src={form.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <svg className="w-10 h-10 text-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={isDemo}
                />
                <div>
                  <button 
                    type="button"
                    onClick={() => !isDemo && fileInputRef.current?.click()}
                    className="btn-glass text-sm"
                    disabled={isDemo}
                  >
                    {form.logo_url ? 'Change Logo' : 'Upload Logo'}
                  </button>
                  {form.logo_url && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, logo_url: '' })}
                      className="btn-ghost text-sm text-red-400 ml-2"
                      disabled={isDemo}
                    >
                      Remove
                    </button>
                  )}
                  <p className="text-xs mt-2 text-subtle">PNG or JPG, max 2MB. Shows on invoices.</p>
                </div>
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm mb-3 text-muted">Brand Colors</label>
              <div className="grid grid-cols-2 gap-6">
                {/* Primary Color */}
                <div>
                  <label className="block text-xs mb-2 text-subtle">Primary</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.primary_color}
                      onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border border-white/10"
                      disabled={isDemo}
                    />
                    <input
                      type="text"
                      value={form.primary_color}
                      onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                      className="input-glass flex-1 text-sm"
                      placeholder="#7eb8d8"
                      disabled={isDemo}
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div>
                  <label className="block text-xs mb-2 text-subtle">Secondary</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.secondary_color}
                      onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
                      className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border border-white/10"
                      disabled={isDemo}
                    />
                    <input
                      type="text"
                      value={form.secondary_color}
                      onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
                      className="input-glass flex-1 text-sm"
                      placeholder="#0a0a0a"
                      disabled={isDemo}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm mb-3 text-muted">Invoice Preview</label>
              <div 
                className="rounded-xl p-6 border"
                style={{ 
                  backgroundColor: form.secondary_color,
                  borderColor: form.primary_color + '40'
                }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: form.primary_color }}>
                      {form.business_name || 'Your Business'}
                    </h3>
                    <p className="text-sm opacity-60" style={{ color: '#fff' }}>SERVICE QUOTE</p>
                  </div>
                  {form.logo_url && (
                    <img src={form.logo_url} alt="Logo" className="w-12 h-12 object-contain" />
                  )}
                </div>
                <div className="h-px mb-4" style={{ backgroundColor: form.primary_color + '30' }} />
                <div className="flex justify-between text-sm" style={{ color: '#fff' }}>
                  <span className="opacity-60">Sample Service</span>
                  <span style={{ color: form.primary_color }}>$100.00</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button type="submit" className="btn-arc" disabled={isDemo || saving}>
                {saving ? 'Saving...' : 'Save Branding'}
              </button>
              {saved && (
                <span className="text-[var(--success)] flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Saved!
                </span>
              )}
            </div>
          </form>
        )}

        {/* Danger Zone - Only show for non-demo users */}
        {!isDemo && !isNewProfile && (
          <div className="glass-static p-8 border-red-500/20">
            <h2 className="text-xl font-semibold mb-2 text-red-400 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Danger Zone
            </h2>
            <p className="mb-4 text-muted">
              Permanently delete your account and all data
            </p>
            <button className="px-4 py-2 rounded-xl text-sm bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors">
              Delete Account
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
