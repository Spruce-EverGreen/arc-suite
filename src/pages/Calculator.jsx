import React, { useState } from 'react';
import ServiceCard from '../components/ServiceCard';
import PricingSummary from '../components/PricingSummary';
import QuoteForm from '../components/QuoteForm';
import { mockServices, mockBusinessProfile } from '../data/mockServices';

function Calculator() {
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleServiceToggle = (serviceId) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        // Remove service and its add-ons
        const service = mockServices.find((s) => s.id === serviceId);
        const serviceAddOnIds = service?.addOns?.map((a) => a.id) || [];
        setSelectedAddOns((prevAddOns) =>
          prevAddOns.filter((id) => !serviceAddOnIds.includes(id))
        );
        return prev.filter((id) => id !== serviceId);
      }
      return [...prev, serviceId];
    });
  };

  const handleAddOnToggle = (addOnId) => {
    setSelectedAddOns((prev) => {
      if (prev.includes(addOnId)) {
        return prev.filter((id) => id !== addOnId);
      }
      return [...prev, addOnId];
    });
  };

  const handleQuoteSubmit = (formData) => {
    console.log('Quote submitted:', formData);
    setShowQuoteForm(false);
    setShowSuccess(true);
    
    // Reset success message after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {mockBusinessProfile.businessName}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Select services to get a custom quote
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">{mockBusinessProfile.contactEmail}</p>
              <p className="text-sm text-gray-600">{mockBusinessProfile.contactPhone}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Success Message */}
      {showSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <svg
              className="w-6 h-6 text-green-600 flex-shrink-0"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h3 className="text-sm font-medium text-green-800">Quote request sent!</h3>
              <p className="text-sm text-green-700 mt-1">
                We'll send you a detailed quote within 24 hours. Check your email!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Services List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Our Services</h2>
              <p className="text-gray-600">
                Select the services you're interested in. You can add optional extras for each service.
              </p>
            </div>

            {mockServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isSelected={selectedServices.includes(service.id)}
                onToggle={handleServiceToggle}
                selectedAddOns={selectedAddOns}
                onAddOnToggle={handleAddOnToggle}
              />
            ))}
          </div>

          {/* Pricing Summary Sidebar */}
          <div className="lg:col-span-1">
            {selectedServices.length > 0 ? (
              <div className="space-y-4">
                <PricingSummary
                  selectedServices={selectedServices}
                  selectedAddOns={selectedAddOns}
                  allServices={mockServices}
                />
                
                <button
                  onClick={() => setShowQuoteForm(true)}
                  className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-all font-semibold text-lg shadow-md hover:shadow-lg"
                >
                  Get Quote
                </button>
              </div>
            ) : (
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 text-center">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No services selected
                </h3>
                <p className="text-sm text-gray-600">
                  Choose services from the list to see your estimated total and request a quote.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Quote Form Modal */}
      {showQuoteForm && (
        <QuoteForm
          selectedServices={selectedServices}
          selectedAddOns={selectedAddOns}
          allServices={mockServices}
          onSubmit={handleQuoteSubmit}
          onClose={() => setShowQuoteForm(false)}
        />
      )}
    </div>
  );
}

export default Calculator;
