import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { DEMO_SERVICES } from '../data/mockData';

const DEMO_QUOTES = [
  { id: 'q-1', invoice_number: '20260219-A1B2', client_name: 'John Smith', service_name: 'Deep Cleaning', total: 450, status: 'pending', created_at: new Date().toISOString() },
  { id: 'q-2', invoice_number: '20260218-C3D4', client_name: 'Sarah Johnson', service_name: 'Standard Cleaning', total: 350, status: 'paid', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'q-3', invoice_number: '20260217-E5F6', client_name: 'Mike Wilson', service_name: 'Move-Out Clean', total: 275, status: 'pending', created_at: new Date(Date.now() - 172800000).toISOString() },
];

export default function Dashboard() {
  const { business, isDemo, loading: authLoading } = useAuth();
  const [services, setServices] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (isDemo) {
        setServices(DEMO_SERVICES);
        setQuotes(DEMO_QUOTES);
        setLoading(false);
        return;
      }

      if (!business?.id) {
        setServices([]);
        setQuotes([]);
        setLoading(false);
        return;
      }

      try {
        const [servicesRes, quotesRes] = await Promise.all([
          supabase.from('services').select('*').eq('business_id', business.id),
          supabase.from('quotes').select('*').eq('business_id', business.id)
        ]);

        setServices(servicesRes.data || []);
        setQuotes(quotesRes.data || []);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) fetchData();
  }, [business?.id, isDemo, authLoading]);

  const activeServices = services.filter(s => s.is_active).length;
  const pendingQuotes = quotes.filter(q => q.status === 'pending' || !q.status);
  const paidQuotes = quotes.filter(q => q.status === 'paid');
  const pendingTotal = pendingQuotes.reduce((sum, q) => sum + (parseFloat(q.total) || 0), 0);
  const paidTotal = paidQuotes.reduce((sum, q) => sum + (parseFloat(q.total) || 0), 0);

  const markAsPaid = async (quoteId) => {
    if (isDemo) {
      setQuotes(quotes.map(q => q.id === quoteId ? { ...q, status: 'paid' } : q));
      return;
    }
    try {
      await supabase.from('quotes').update({ status: 'paid' }).eq('id', quoteId);
      setQuotes(quotes.map(q => q.id === quoteId ? { ...q, status: 'paid' } : q));
    } catch (err) {
      console.error('Error updating quote:', err);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="glass-pill px-8 py-4">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!business && !isDemo) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <div className="title-pill">Welcome to ARC Labs</div>
          <p className="text-muted">Set up your business to get started</p>
          <a href="/profile" className="btn-arc">Setup Business</a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 max-w-4xl">
        {/* Page Title */}
        <div className="title-pill">DASHBOARD</div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <span className="stat-label">Active Services</span>
            <span className="stat-value">{activeServices}</span>
          </div>
          
          <div className="stat-card">
            <span className="stat-label">Pending</span>
            <span className="stat-value text-amber-400">${pendingTotal.toLocaleString()}</span>
          </div>
          
          <div className="stat-card">
            <span className="stat-label">Collected</span>
            <span className="stat-value text-[var(--success)]">${paidTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* Pending Invoices Section */}
        <div className="glass-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Pending Invoices
            </h2>
            <span className="text-sm text-muted">{pendingQuotes.length} pending</span>
          </div>
          
          {pendingQuotes.length === 0 ? (
            <p className="text-muted text-center py-6">No pending invoices 🎉</p>
          ) : (
            <div className="space-y-3">
              {pendingQuotes.map((quote) => (
                <div 
                  key={quote.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-[var(--glass)] border border-[var(--glass-border)]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{quote.client_name || 'Customer'}</span>
                      <span className="text-xs text-subtle">#{quote.invoice_number}</span>
                    </div>
                    <p className="text-sm text-muted mt-1">{quote.service_name || 'Service'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-lg">${parseFloat(quote.total || 0).toLocaleString()}</span>
                    <button 
                      onClick={() => markAsPaid(quote.id)}
                      className="btn-ghost text-sm text-[var(--success)]"
                    >
                      Mark Paid
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Paid */}
        {paidQuotes.length > 0 && (
          <div className="glass-section">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--success)]"></span>
                Recently Paid
              </h2>
              <span className="text-sm text-muted">{paidQuotes.length} paid</span>
            </div>
            
            <div className="space-y-2">
              {paidQuotes.slice(0, 3).map((quote) => (
                <div 
                  key={quote.id} 
                  className="flex items-center justify-between py-2 border-b border-[var(--glass-border)] last:border-0"
                >
                  <div>
                    <span className="text-muted">{quote.client_name || 'Customer'}</span>
                    <span className="text-xs text-subtle ml-2">#{quote.invoice_number}</span>
                  </div>
                  <span className="font-medium text-[var(--success)]">${parseFloat(quote.total || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share Calculator Section */}
        {business?.id && !isDemo && (
          <div className="glass-section">
            <h2 className="font-semibold text-lg mb-4">Share Your Calculator</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                readOnly 
                value={`${window.location.origin}/calculator?b=${business.id}`}
                className="input-glass flex-1 text-sm"
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/calculator?b=${business.id}`);
                }}
                className="btn-pill whitespace-nowrap"
              >
                Copy Link
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a 
            href={business?.id ? `/calculator?b=${business.id}` : '/calculator'} 
            className="btn-arc"
          >
            Open Calculator
          </a>
          <a href="/services" className="btn-pill">
            Manage Services
          </a>
        </div>
      </div>
    </Layout>
  );
}
