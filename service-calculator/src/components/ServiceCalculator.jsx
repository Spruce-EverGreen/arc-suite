import { useState, useMemo } from 'react';
import { Download, Plus, Minus, Mail } from 'lucide-react';
import { generateQuotePDF, downloadPDF } from '../utils/pdfGenerator';

/**
 * ServiceCalculator - Client-facing service calculator with quote generation
 * @param {Object} props
 * @param {Object} props.businessProfile - Business information
 * @param {Array} props.services - Available services
 */
export default function ServiceCalculator({ businessProfile, services = [] }) {
  const [selectedServices, setSelectedServices] = useState([]);
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [showClientForm, setShowClientForm] = useState(false);

  // Toggle service selection
  const toggleService = (service) => {
    setSelectedServices((prev) => {
      const isSelected = prev.some((s) => s.id === service.id);
      if (isSelected) {
        return prev.filter((s) => s.id !== service.id);
      }
      return [...prev, { ...service, addOns: [] }];
    });
  };

  // Toggle add-on for a service
  const toggleAddOn = (serviceId, addOn) => {
    setSelectedServices((prev) =>
      prev.map((service) => {
        if (service.id === serviceId) {
          const hasAddOn = service.addOns.some((a) => a.id === addOn.id);
          return {
            ...service,
            addOns: hasAddOn
              ? service.addOns.filter((a) => a.id !== addOn.id)
              : [...service.addOns, addOn],
          };
        }
        return service;
      })
    );
  };

  // Calculate totals
  const totals = useMemo(() => {
    let subtotal = 0;
    
    selectedServices.forEach((service) => {
      subtotal += service.base_price;
      service.addOns.forEach((addOn) => {
        subtotal += addOn.price;
      });
    });

    const taxRate = businessProfile.tax_rate || 0;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    return { subtotal, tax, taxRate, total };
  }, [selectedServices, businessProfile.tax_rate]);

  // Check if a service is selected
  const isServiceSelected = (serviceId) => {
    return selectedServices.some((s) => s.id === serviceId);
  };

  // Get selected service (to check add-ons)
  const getSelectedService = (serviceId) => {
    return selectedServices.find((s) => s.id === serviceId);
  };

  // Generate and download PDF
  const handleGenerateQuote = () => {
    if (selectedServices.length === 0) {
      alert('Please select at least one service.');
      return;
    }

    if (!showClientForm) {
      setShowClientForm(true);
      return;
    }

    if (!clientInfo.email) {
      alert('Please provide your email address.');
      return;
    }

    // Generate PDF
    const quoteData = {
      businessProfile,
      selectedServices,
      clientInfo,
      totals,
    };

    const pdf = generateQuotePDF(quoteData);
    const filename = `${businessProfile.business_name || 'Quote'}_${clientInfo.name || 'Customer'}_${new Date().toISOString().split('T')[0]}.pdf`;
    downloadPDF(pdf, filename);

    // Reset form
    setShowClientForm(false);
    alert('Your quote has been downloaded! Check your downloads folder.');
  };

  const brandColor = businessProfile.brand_color || '#007da5';

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2" style={{ color: brandColor }}>
          {businessProfile.business_name || 'Service Calculator'}
        </h1>
        <p className="text-gray-600">
          Select services to get an instant quote
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Services List */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Available Services</h2>
          
          {services.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
              No services available at this time.
            </div>
          )}

          {services.map((service) => {
            const selected = isServiceSelected(service.id);
            const selectedService = getSelectedService(service.id);

            return (
              <div
                key={service.id}
                className={`border rounded-lg p-4 transition-all ${
                  selected
                    ? 'border-2 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={selected ? { borderColor: brandColor } : {}}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{service.name}</h3>
                    {service.description && (
                      <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                    )}
                    <p className="text-lg font-bold" style={{ color: brandColor }}>
                      ${service.base_price.toFixed(2)}
                      {service.pricing_model === 'hourly' && '/hr'}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleService(service)}
                    className="ml-4 p-2 rounded-full transition-colors"
                    style={{
                      backgroundColor: selected ? brandColor : '#e5e7eb',
                      color: selected ? 'white' : '#6b7280',
                    }}
                  >
                    {selected ? <Minus size={20} /> : <Plus size={20} />}
                  </button>
                </div>

                {/* Add-ons */}
                {selected && service.addOns && service.addOns.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Add-ons:</p>
                    <div className="space-y-2">
                      {service.addOns.map((addOn) => {
                        const isAddOnSelected = selectedService?.addOns.some(
                          (a) => a.id === addOn.id
                        );
                        return (
                          <label
                            key={addOn.id}
                            className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
                          >
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={isAddOnSelected}
                                onChange={() => toggleAddOn(service.id, addOn)}
                                className="mr-2"
                                style={{ accentColor: brandColor }}
                              />
                              <span className="text-sm">{addOn.name}</span>
                            </div>
                            <span className="text-sm font-semibold">
                              +${addOn.price.toFixed(2)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quote Summary */}
        <div className="md:col-span-1">
          <div className="sticky top-6 border border-gray-200 rounded-lg p-6 bg-white shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Quote Summary</h2>

            {selectedServices.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">
                No services selected
              </p>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {selectedServices.map((service) => (
                    <div key={service.id} className="text-sm">
                      <div className="flex justify-between font-semibold">
                        <span>{service.name}</span>
                        <span>${service.base_price.toFixed(2)}</span>
                      </div>
                      {service.addOns.map((addOn) => (
                        <div
                          key={addOn.id}
                          className="flex justify-between text-gray-600 ml-2 mt-1"
                        >
                          <span>+ {addOn.name}</span>
                          <span>${addOn.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${totals.subtotal.toFixed(2)}</span>
                  </div>
                  {totals.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Tax ({totals.taxRate}%):</span>
                      <span>${totals.tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span style={{ color: brandColor }}>
                      ${totals.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Client Info Form */}
                {showClientForm && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="font-semibold mb-3 text-sm">Your Information</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Name"
                        value={clientInfo.name}
                        onChange={(e) =>
                          setClientInfo({ ...clientInfo, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': brandColor }}
                      />
                      <input
                        type="email"
                        placeholder="Email *"
                        value={clientInfo.email}
                        onChange={(e) =>
                          setClientInfo({ ...clientInfo, email: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': brandColor }}
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={clientInfo.phone}
                        onChange={(e) =>
                          setClientInfo({ ...clientInfo, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': brandColor }}
                      />
                    </div>
                  </div>
                )}

                {/* Get Quote Button */}
                <button
                  onClick={handleGenerateQuote}
                  className="w-full mt-6 py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                  style={{ backgroundColor: brandColor }}
                >
                  <Download size={20} />
                  {showClientForm ? 'Download Quote' : 'Get Quote'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
