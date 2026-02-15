import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Upload, Save } from 'lucide-react';

export default function BusinessProfile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    business_name: '',
    contact_email: '',
    contact_phone: '',
    brand_color: '#007da5',
    logo_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploading, setUploading] = useState(false);
  const [profileId, setProfileId] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setFetchLoading(true);
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfileId(data.id);
        setFormData({
          business_name: data.business_name || '',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          brand_color: data.brand_color || '#007da5',
          logo_url: data.logo_url || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e) => {
    try {
      setUploading(true);
      setMessage({ type: '', text: '' });

      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please upload an image file' });
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image must be less than 2MB' });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('business-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('business-assets')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, logo_url: publicUrl }));
      setMessage({ type: 'success', text: 'Logo uploaded successfully' });
    } catch (error) {
      console.error('Error uploading logo:', error);
      setMessage({ type: 'error', text: 'Failed to upload logo' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const dataToSave = {
        ...formData,
        user_id: user.id,
      };

      if (profileId) {
        // Update existing profile
        const { error } = await supabase
          .from('business_profiles')
          .update(dataToSave)
          .eq('id', profileId);

        if (error) throw error;
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('business_profiles')
          .insert([dataToSave])
          .select()
          .single();

        if (error) throw error;
        setProfileId(data.id);
      }

      setMessage({ type: 'success', text: 'Profile saved successfully!' });
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Building2 size={32} className="text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Profile</h1>
          <p className="text-gray-600 mt-1">Configure your business information and branding</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            id="business_name"
            name="business_name"
            type="text"
            value={formData.business_name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Your Business Name"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email *
            </label>
            <input
              id="contact_email"
              name="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="contact@business.com"
            />
          </div>

          <div>
            <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-2">
              Contact Phone
            </label>
            <input
              id="contact_phone"
              name="contact_phone"
              type="tel"
              value={formData.contact_phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        <div>
          <label htmlFor="brand_color" className="block text-sm font-medium text-gray-700 mb-2">
            Brand Color
          </label>
          <div className="flex items-center gap-4">
            <input
              id="brand_color"
              name="brand_color"
              type="color"
              value={formData.brand_color}
              onChange={handleChange}
              className="h-12 w-24 border border-gray-300 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={formData.brand_color}
              onChange={handleChange}
              name="brand_color"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
              placeholder="#007da5"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            This color will be used for quotes and branding
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Logo
          </label>
          
          {formData.logo_url && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <img
                src={formData.logo_url}
                alt="Business logo"
                className="h-24 object-contain"
              />
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="flex-1">
              <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer">
                <Upload size={20} className="text-gray-600" />
                <span className="text-gray-700 font-medium">
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            PNG, JPG or GIF (max 2MB)
          </p>
        </div>

        {message.text && (
          <div className={`px-4 py-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
