import React from 'react';
import AddOnCheckbox from './AddOnCheckbox';

const ServiceCard = ({ service, isSelected, onToggle, selectedAddOns, onAddOnToggle }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPriceDisplay = () => {
    if (service.pricingModel === 'fixed') {
      return formatPrice(service.basePrice);
    } else if (service.pricingModel === 'hourly') {
      return `${formatPrice(service.basePrice)}/hour`;
    } else if (service.pricingModel === 'range') {
      return `${formatPrice(service.basePrice)} - ${formatPrice(service.priceMax)}`;
    }
    return 'Custom pricing';
  };

  return (
    <div
      className={`border rounded-lg p-6 transition-all cursor-pointer ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={() => onToggle(service.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-primary border-primary'
                  : 'border-gray-300'
              }`}
            >
              {isSelected && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
          </div>
          <p className="text-gray-600 mt-2 ml-8">{service.description}</p>
        </div>
        <div className="text-right ml-4">
          <p className="text-xl font-bold text-primary">{getPriceDisplay()}</p>
        </div>
      </div>

      {/* Add-ons section */}
      {isSelected && service.addOns && service.addOns.length > 0 && (
        <div className="mt-4 ml-8 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Available Add-ons:</h4>
          <div className="space-y-2">
            {service.addOns.map((addOn) => (
              <AddOnCheckbox
                key={addOn.id}
                addOn={addOn}
                isSelected={selectedAddOns.includes(addOn.id)}
                onToggle={onAddOnToggle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCard;
