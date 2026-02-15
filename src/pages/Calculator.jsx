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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              ARC Suite - Service Calculator
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Build your custom quote in 3 easy steps
            </p>
            <div className="flex justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold">1</span>
                <span className="text-gray-700">Select Services</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold">2</span>
                <span className="text-gray-700">Choose Add-ons</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold">3</span>
                <span className="text-gray-700">Get Your Quote</span>
              </div>
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
            <div className="mb-6 bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">📋 Available Services</h2>
              <p className="text-gray-700 font-medium">
                Click the <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">+</span> button on any service to add it to your quote. 
                You can select multiple services and customize them with add-ons.
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
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-5 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  📄 Get Your Quote
                </button>
                <p className="text-center text-sm text-gray-600 mt-2">
                  Free estimate • No commitment required
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">👈</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Start Building Your Quote
                </h3>
                <p className="text-gray-700 mb-4 text-lg">
                  Select services from the list on the left to see pricing and add to your quote.
                </p>
                <div className="bg-white rounded-lg p-4 inline-block shadow-sm">
                  <p className="text-sm text-gray-600 font-medium">
                    💡 Tip: Click the <span className="bg-blue-600 text-white px-2 py-0.5 rounded">+</span> button to add a service
                  </p>
                </div>
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
