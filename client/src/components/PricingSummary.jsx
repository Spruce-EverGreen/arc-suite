import React from 'react';

const PricingSummary = ({ selectedServices, selectedAddOns, allServices }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateTotal = () => {
    let total = 0;
    
    // Add service base prices
    selectedServices.forEach((serviceId) => {
      const service = allServices.find((s) => s.id === serviceId);
      if (service) {
        total += service.basePrice;
      }
    });
    
    // Add add-on prices
    selectedAddOns.forEach((addOnId) => {
      allServices.forEach((service) => {
        const addOn = service.addOns?.find((a) => a.id === addOnId);
        if (addOn) {
          total += addOn.price;
        }
      });
    });
    
    return total;
  };

  const total = calculateTotal();

  if (selectedServices.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Price Summary</h3>
      
      <div className="space-y-3">
        {selectedServices.map((serviceId) => {
          const service = allServices.find((s) => s.id === serviceId);
          if (!service) return null;
          
          return (
            <div key={serviceId}>
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-700 font-medium">{service.name}</span>
                <span className="text-sm font-semibold text-gray-900">
                  {service.pricingModel === 'range' ? 'Starting at ' : ''}
                  {formatPrice(service.basePrice)}
                  {service.pricingModel === 'hourly' ? '/hr' : ''}
                </span>
              </div>
              
              {/* Show selected add-ons for this service */}
              {service.addOns?.filter((a) => selectedAddOns.includes(a.id)).map((addOn) => (
                <div key={addOn.id} className="flex justify-between items-start ml-4 mt-1">
                  <span className="text-xs text-gray-600">+ {addOn.name}</span>
                  <span className="text-xs font-semibold text-gray-700">
                    {formatPrice(addOn.price)}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-200 mt-4 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">Estimated Total</span>
          <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          * Final price may vary based on project scope and requirements
        </p>
      </div>
    </div>
  );
};

export default PricingSummary;
