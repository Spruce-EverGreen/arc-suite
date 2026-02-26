import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DEMO_SERVICES, DEMO_BUSINESS } from '../data/mockData';
import { supabase, createQuote } from '../lib/supabase';
import { jsPDF } from 'jspdf';

export default function Calculator() {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get('b') || searchParams.get('business');
  
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  
  const [selectedService, setSelectedService] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Load business and services
  useEffect(() => {
    const loadData = async () => {
      if (!businessId) {
        setIsDemo(true);
        setBusiness(DEMO_BUSINESS);
        setServices(DEMO_SERVICES.filter(s => s.is_active));
        setLoading(false);
        return;
      }

      try {
        const { data: bizData, error: bizError } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('id', businessId)
          .single();

        if (bizError || !bizData) {
          setIsDemo(true);
          setBusiness(DEMO_BUSINESS);
          setServices(DEMO_SERVICES.filter(s => s.is_active));
          setLoading(false);
          return;
        }

        setBusiness(bizData);

        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*, add_ons(*)')
          .eq('business_id', businessId)
          .eq('is_active', true)
          .order('name');

        if (servicesError) {
          console.error('Error loading services:', servicesError);
        }

        setServices(servicesData || []);
      } catch (err) {
        console.error('Error:', err);
        setIsDemo(true);
        setBusiness(DEMO_BUSINESS);
        setServices(DEMO_SERVICES.filter(s => s.is_active));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [businessId]);

  // Check if service needs quantity input (not a flat "job" price)
  const needsQuantity = (service) => {
    const unit = service?.price_unit || 'job';
    return unit !== 'job';
  };

  const calculateTotal = () => {
    if (!selectedService) return 0;
    
    const price = parseFloat(selectedService.base_price) || 0;
    const qty = needsQuantity(selectedService) ? (parseFloat(quantity) || 0) : 1;
    const base = price * qty;
    const addonsTotal = selectedAddons.reduce((sum, ao) => sum + (parseFloat(ao.price) || 0), 0);
    
    return base + addonsTotal;
  };

  const toggleAddon = (addon) => {
    if (selectedAddons.find(a => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const formatPrice = (service) => {
    const price = parseFloat(service.base_price);
    const unit = service.price_unit || 'job';
    if (unit === 'job') return `$${price}`;
    return `$${price} / ${unit}`;
  };

  // Helper to convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 126, g: 184, b: 216 };
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const doc = new jsPDF();
    const total = calculateTotal();
    const unit = selectedService?.price_unit || 'job';
    const qty = needsQuantity(selectedService) ? (parseFloat(quantity) || 0) : 1;
    
    // Generate invoice number
    const invoiceNum = `${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    
    // Get branding colors
    const primaryColor = hexToRgb(business?.primary_color || '#7eb8d8');
    const secondaryColor = hexToRgb(business?.secondary_color || '#0a1628');
    
    // Header with secondary color background
    doc.setFillColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
    doc.rect(0, 0, 210, 50, 'F');
    
    // Add logo if exists (top right)
    if (business?.logo_url && business.logo_url.startsWith('data:')) {
      try {
        doc.addImage(business.logo_url, 'PNG', 165, 10, 30, 30);
      } catch (e) {
        console.log('Could not add logo to PDF');
      }
    }
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(business?.business_name || business?.name || 'Business', 20, 28);
    
    doc.setFontSize(11);
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.text('SERVICE QUOTE', 20, 38);
    
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(9);
    doc.text(`Invoice #${invoiceNum}`, 20, 46);
    doc.text(new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    }), 80, 46);
    
    // Client info
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('PREPARED FOR:', 20, 75);
    doc.setFont('helvetica', 'bold');
    doc.text(clientName || 'Valued Customer', 20, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(clientEmail || '', 20, 93);
    
    // Divider
    doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setLineWidth(0.5);
    doc.line(20, 60, 190, 60);
    
    // Service details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Service Details', 20, 110);
    
    let yPos = 125;
    
    // Main service
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(selectedService?.name || '', 20, yPos);
    
    const servicePrice = parseFloat(selectedService.base_price) * qty;
    doc.text(`$${servicePrice.toFixed(2)}`, 170, yPos, { align: 'right' });
    
    if (needsQuantity(selectedService) && quantity) {
      yPos += 8;
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.text(`${quantity} ${unit} @ $${selectedService.base_price}/${unit}`, 25, yPos);
    }
    
    // Add-ons
    if (selectedAddons.length > 0) {
      yPos += 20;
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text('Add-ons:', 20, yPos);
      
      selectedAddons.forEach((ao) => {
        yPos += 10;
        doc.text(`• ${ao.name}`, 25, yPos);
        doc.text(`$${parseFloat(ao.price).toFixed(2)}`, 170, yPos, { align: 'right' });
      });
    }
    
    // Total
    yPos += 30;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, 190, yPos);
    
    yPos += 15;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('TOTAL', 20, yPos);
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.text(`$${total.toFixed(2)}`, 170, yPos, { align: 'right' });
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text('This quote is valid for 30 days from the date of issue.', 20, 260);
    doc.text(`Contact: ${business?.contact_email || ''} | ${business?.contact_phone || ''}`, 20, 268);
    
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.text('Powered by ARC Labs', 170, 280, { align: 'right' });
    
    const safeName = clientName?.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'Customer';
    doc.save(`${safeName}-${invoiceNum}.pdf`);
    
    // Save quote to database (if not demo)
    if (businessId && !isDemo) {
      try {
        await createQuote({
          business_id: businessId,
          invoice_number: invoiceNum,
          client_name: clientName || 'Customer',
          client_email: clientEmail || null,
          service_name: selectedService?.name,
          total: total,
          status: 'pending',
          items: JSON.stringify({
            service: selectedService?.name,
            quantity: qty,
            unit: unit,
            addons: selectedAddons.map(a => ({ name: a.name, price: a.price }))
          })
        });
      } catch (err) {
        console.log('Could not save quote:', err);
      }
    }
    
    setIsGenerating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="arc-bg" />
        <div className="content-wrapper min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-[var(--arc)] flex items-center justify-center"
                 style={{ boxShadow: '0 0 30px var(--arc-glow)' }}>
              <div className="w-6 h-6 rounded-full bg-[var(--arc)] animate-pulse" />
            </div>
            <p className="text-muted">Loading calculator...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="arc-bg" />
      
      <div className="content-wrapper min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <header className="text-center mb-12">
            {isDemo && (
              <div className="mb-4 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm inline-block">
                Demo Mode — Sample services
              </div>
            )}
            <div className="inline-flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Logo" className="w-10 h-10" />
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {business?.business_name || business?.name || 'Service Calculator'}
              </h1>
            </div>
            <p className="text-muted text-lg">
              Get an instant quote for our services
            </p>
          </header>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-5 gap-8">
            
            {/* Left Column - Service Selection */}
            <div className="lg:col-span-3 space-y-8">
              
              {/* Step 1: Choose Service */}
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-8 h-8 rounded-full glass flex items-center justify-center text-sm font-semibold text-arc">
                    1
                  </span>
                  <h2 className="text-lg font-semibold">Choose a Service</h2>
                </div>
                
                {services.length === 0 ? (
                  <div className="glass-panel text-center py-8">
                    <p className="text-muted">No services available yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {services.map(service => (
                      <button
                        key={service.id}
                        onClick={() => {
                          setSelectedService(service);
                          setSelectedAddons([]);
                          setQuantity('1');
                        }}
                        className={`service-card ${selectedService?.id === service.id ? 'selected' : ''}`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold mb-1">{service.name}</p>
                            {service.description && (
                              <p className="text-sm text-muted leading-relaxed">{service.description}</p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-arc font-semibold text-lg">
                              {formatPrice(service)}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* Step 2: Quantity Input (for non-flat pricing) */}
              {selectedService && needsQuantity(selectedService) && (
                <section>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="w-8 h-8 rounded-full glass flex items-center justify-center text-sm font-semibold text-arc">
                      2
                    </span>
                    <h2 className="text-lg font-semibold">How many {selectedService.price_unit}?</h2>
                  </div>
                  
                  <div className="glass-panel">
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="input-glass flex-1 text-2xl font-semibold text-center"
                        placeholder="0"
                        min="0"
                      />
                      <span className="text-muted font-medium">{selectedService.price_unit}</span>
                    </div>
                    <p className="text-sm text-subtle mt-3 text-center">
                      ${selectedService.base_price} × {quantity || 0} = ${(parseFloat(selectedService.base_price) * (parseFloat(quantity) || 0)).toFixed(2)}
                    </p>
                  </div>
                </section>
              )}

              {/* Step 3: Add-ons */}
              {selectedService && selectedService.add_ons && selectedService.add_ons.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="w-8 h-8 rounded-full glass flex items-center justify-center text-sm font-semibold text-arc">
                      {needsQuantity(selectedService) ? 3 : 2}
                    </span>
                    <h2 className="text-lg font-semibold">Add-ons</h2>
                    <span className="text-subtle text-sm">(optional)</span>
                  </div>
                  
                  <div className="space-y-2">
                    {selectedService.add_ons.map(addon => (
                      <button
                        key={addon.id}
                        onClick={() => toggleAddon(addon)}
                        className={`addon-toggle ${selectedAddons.find(a => a.id === addon.id) ? 'active' : ''}`}
                      >
                        <span className="font-medium">{addon.name}</span>
                        <span className={`addon-price font-semibold ${selectedAddons.find(a => a.id === addon.id) ? '' : 'text-muted'}`}>
                          +${parseFloat(addon.price).toFixed(0)}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column - Quote Summary */}
            <div className="lg:col-span-2">
              <div className="quote-card">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-arc" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Your Quote
                </h2>

                {selectedService ? (
                  <>
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 pr-4">
                          <span className="text-muted text-sm">{selectedService.name}</span>
                          {needsQuantity(selectedService) && quantity && (
                            <p className="text-subtle text-xs mt-1">
                              {quantity} {selectedService.price_unit}
                            </p>
                          )}
                        </div>
                        <span className="font-medium">
                          ${(parseFloat(selectedService.base_price) * (needsQuantity(selectedService) ? (parseFloat(quantity) || 0) : 1)).toFixed(2)}
                        </span>
                      </div>
                      
                      {selectedAddons.map(ao => (
                        <div key={ao.id} className="flex justify-between">
                          <span className="text-muted text-sm">{ao.name}</span>
                          <span className="font-medium">${parseFloat(ao.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="divider" />

                    <div className="flex justify-between items-center mb-8">
                      <span className="text-muted font-medium">Total</span>
                      <span className="quote-total">
                        ${calculateTotal().toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-4 mb-6">
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="input-glass"
                        placeholder="Your Name"
                      />
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="input-glass"
                        placeholder="Your Email"
                      />
                    </div>

                    <button 
                      onClick={generatePDF} 
                      disabled={isGenerating || calculateTotal() === 0}
                      className="btn-arc w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download Quote
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full glass flex items-center justify-center">
                      <svg className="w-8 h-8 text-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-muted">Select a service to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center mt-16 pt-8">
            <div className="divider mb-8" />
            <p className="text-subtle text-sm">
              Powered by <span className="text-arc font-medium">ARC Labs</span>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
