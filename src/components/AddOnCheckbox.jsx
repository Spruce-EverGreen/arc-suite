import React from 'react';

const AddOnCheckbox = ({ addOn, isSelected, onToggle }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      className="flex items-start gap-2 p-3 rounded bg-white border border-gray-100 hover:border-gray-200 cursor-pointer transition-all"
      onClick={(e) => {
        e.stopPropagation();
        onToggle(addOn.id);
      }}
    >
      <div
        className={`w-4 h-4 mt-0.5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
          isSelected ? 'bg-primary border-primary' : 'border-gray-300'
        }`}
      >
        {isSelected && (
          <svg
            className="w-2.5 h-2.5 text-white"
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
      <div className="flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-gray-900">{addOn.name}</span>
          <span className="text-sm font-semibold text-primary whitespace-nowrap">
            +{formatPrice(addOn.price)}
          </span>
        </div>
        {addOn.description && (
          <p className="text-xs text-gray-500 mt-0.5">{addOn.description}</p>
        )}
      </div>
    </div>
  );
};

export default AddOnCheckbox;
