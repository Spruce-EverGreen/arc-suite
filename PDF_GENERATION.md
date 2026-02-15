# PDF Quote Generation - Documentation

## Overview

The Service Calculator includes professional PDF quote generation powered by jsPDF. This allows clients to download beautifully formatted quotes with business branding, service details, pricing breakdowns, and contact information.

## Features

✅ **Professional Layout**
- Business branding (name, logo space, brand colors)
- Quote number generation
- Date and expiration date
- Client information section

✅ **Service Details**
- Service names and descriptions
- Base pricing
- Add-on support with individual pricing
- Alternating row colors for readability

✅ **Pricing Breakdown**
- Itemized service and add-on pricing
- Subtotal calculation
- Tax calculation (configurable rate)
- Grand total

✅ **Business Information**
- Contact email and phone in footer
- Terms and conditions
- Professional formatting

## Files

### Core Files
- **`src/utils/pdfGenerator.js`** - PDF generation utility with all helper functions
- **`src/components/ServiceCalculator.jsx`** - Calculator component with quote generation UI
- **`src/App.jsx`** - Demo implementation with sample data

## Usage

### Basic Usage

```javascript
import { generateQuotePDF, downloadPDF } from './utils/pdfGenerator';

const quoteData = {
  businessProfile: {
    business_name: 'Your Business',
    brand_color: '#007da5',
    contact_email: 'contact@business.com',
    contact_phone: '(555) 123-4567',
    tax_rate: 8.5, // Optional: tax percentage
  },
  selectedServices: [
    {
      id: '1',
      name: 'Service Name',
      description: 'Service description',
      base_price: 100.00,
      addOns: [
        {
          id: 'a1',
          name: 'Add-on Name',
          price: 25.00,
        }
      ],
    }
  ],
  clientInfo: {
    name: 'Client Name',
    email: 'client@email.com',
    phone: '(555) 987-6543', // Optional
  },
  totals: {
    subtotal: 125.00,
    tax: 10.63,
    taxRate: 8.5,
    total: 135.63,
  },
};

// Generate PDF
const pdf = generateQuotePDF(quoteData);

// Download to user's device
downloadPDF(pdf, 'my-quote.pdf');
```

### Advanced Usage

#### Get PDF as Blob (for uploads/emails)
```javascript
import { generateQuotePDF, getPDFBlob } from './utils/pdfGenerator';

const pdf = generateQuotePDF(quoteData);
const blob = getPDFBlob(pdf);

// Upload to Supabase Storage
const { data, error } = await supabase.storage
  .from('quotes')
  .upload(`quote-${Date.now()}.pdf`, blob);
```

#### Get PDF as Data URL (for preview)
```javascript
import { generateQuotePDF, getPDFDataURL } from './utils/pdfGenerator';

const pdf = generateQuotePDF(quoteData);
const dataUrl = getPDFDataURL(pdf);

// Display in iframe
document.querySelector('iframe').src = dataUrl;
```

## Component Integration

### ServiceCalculator Component

The `ServiceCalculator` component provides a complete UI for:
- Selecting services
- Choosing add-ons
- Entering client information
- Generating and downloading quotes

**Props:**
```javascript
<ServiceCalculator
  businessProfile={{
    business_name: string,
    brand_color: string,      // Hex color code
    contact_email: string,
    contact_phone: string,     // Optional
    tax_rate: number,          // Optional, percentage
  }}
  services={[
    {
      id: string,
      name: string,
      description: string,     // Optional
      base_price: number,
      pricing_model: string,   // 'fixed', 'hourly', 'range', 'custom'
      addOns: [                // Optional
        {
          id: string,
          name: string,
          description: string, // Optional
          price: number,
        }
      ],
    }
  ]}
/>
```

## PDF Structure

### Header
- Business name (large, branded color)
- "QUOTE" title
- Quote date
- Quote number (auto-generated: `Q[YY][MM]-[XXXX]`)
- Expiration date (30 days default)

### Client Section
- "Prepared For:" heading
- Client name
- Client email
- Client phone (if provided)

### Services Table
- Header row (branded color background)
- Service name and description
- Base price (right-aligned)
- Add-ons indented with individual pricing
- Alternating row backgrounds for readability

### Totals Section
- Subtotal
- Tax (if tax_rate > 0)
- Total (bold, larger font)

### Footer
- Horizontal line separator
- Contact information (email | phone)
- Terms text:
  - "This quote is valid for 30 days from the date of issue."
  - "Please contact us to accept this quote or if you have any questions."

## Customization

### Brand Colors
The PDF uses the business's brand color (`brand_color` field) for:
- Business name
- Table headers
- Total amount
- Selection highlights

Default color: `#007da5` (teal blue)

### Quote Number Format
Auto-generated format: `Q[YY][MM]-[XXXX]`
- YY = Last 2 digits of year
- MM = Month (01-12)
- XXXX = Random 4-digit number

Example: `Q2602-7854` (February 2026, random 7854)

### Expiration Date
Default: 30 days from generation date
Modify in `getExpirationDate()` helper function

### Tax Rate
Set in business profile:
```javascript
businessProfile: {
  tax_rate: 8.5, // 8.5% tax
}
```

If not provided or 0, tax line is hidden.

## Helper Functions

All available in `src/utils/pdfGenerator.js`:

### `generateQuotePDF(quoteData)`
Main function to generate PDF document.
Returns jsPDF instance.

### `downloadPDF(doc, filename)`
Download PDF to user's device.

### `getPDFBlob(doc)`
Get PDF as Blob (for uploads, emails).

### `getPDFDataURL(doc)`
Get PDF as Data URL (for preview iframes).

### `hexToRGB(hex)`
Convert hex color to RGB object (internal).

### `generateQuoteNumber()`
Generate unique quote number (internal).

### `getExpirationDate(days)`
Get formatted expiration date string (internal).

## Testing

Run the development server to see the demo:

```bash
npm run dev
```

Visit `http://localhost:5173` to:
1. See the calculator with sample services
2. Select services and add-ons
3. Generate a sample PDF quote
4. Download and review the PDF

## Integration with Supabase

### Storing Generated PDFs

```javascript
import { generateQuotePDF, getPDFBlob } from './utils/pdfGenerator';

// Generate PDF
const pdf = generateQuotePDF(quoteData);
const blob = getPDFBlob(pdf);

// Upload to Supabase Storage
const filename = `quote-${Date.now()}.pdf`;
const { data, error } = await supabase.storage
  .from('quotes')
  .upload(filename, blob, {
    contentType: 'application/pdf',
  });

if (!error) {
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('quotes')
    .getPublicUrl(filename);

  // Save quote record to database
  await supabase.from('quotes').insert({
    business_id: businessProfile.id,
    client_email: clientInfo.email,
    client_name: clientInfo.name,
    services_selected: selectedServices,
    total_amount: totals.total,
    pdf_url: publicUrl,
  });
}
```

### Email Integration (Future)

```javascript
// Example with Resend or SendGrid
const pdf = generateQuotePDF(quoteData);
const pdfBlob = getPDFBlob(pdf);

// Convert blob to base64 for email attachment
const reader = new FileReader();
reader.readAsDataURL(pdfBlob);
reader.onloadend = async () => {
  const base64data = reader.result.split(',')[1];
  
  // Send via email API
  await fetch('/api/send-quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: clientInfo.email,
      subject: `Your Quote from ${businessProfile.business_name}`,
      attachment: {
        filename: 'quote.pdf',
        content: base64data,
      },
    }),
  });
};
```

## Browser Compatibility

jsPDF works in all modern browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- PDF generation: ~100-200ms for typical quote
- File size: ~50-100KB for standard quote
- No server-side processing required

## Troubleshooting

### "jsPDF is not defined"
Ensure jsPDF is installed:
```bash
npm install jspdf
```

### Colors not showing
Check hex color format: must be `#RRGGBB` (6 digits with #).

### Text overflow
Long descriptions are automatically wrapped using `splitTextToSize()`.

### Page overflow
Automatic page breaks added when content exceeds page height.

## Future Enhancements

Potential improvements for Phase 2:
- [ ] Logo image support (from businessProfile.logo_url)
- [ ] Custom template selection
- [ ] Multiple currency support
- [ ] Discount codes
- [ ] Payment terms section
- [ ] Digital signature field
- [ ] QR code for quote acceptance link
- [ ] Multi-language support

## License

Part of ARC Suite - Service Calculator MVP
