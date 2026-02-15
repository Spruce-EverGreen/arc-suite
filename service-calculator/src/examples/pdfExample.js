/**
 * PDF Generation Examples
 * 
 * This file demonstrates various ways to use the PDF generation utility.
 * Import these functions in your components as needed.
 */

import { generateQuotePDF, downloadPDF, getPDFBlob, getPDFDataURL } from '../utils/pdfGenerator';

/**
 * Example 1: Simple Quote Generation
 */
export function simpleQuoteExample() {
  const quoteData = {
    businessProfile: {
      business_name: 'ARC Services',
      brand_color: '#007da5',
      contact_email: 'hello@arcservices.com',
      contact_phone: '(555) 123-4567',
    },
    selectedServices: [
      {
        id: '1',
        name: 'Website Design',
        description: 'Custom responsive website',
        base_price: 2500.00,
        addOns: [],
      },
    ],
    clientInfo: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '(555) 987-6543',
    },
    totals: {
      subtotal: 2500.00,
      tax: 0,
      taxRate: 0,
      total: 2500.00,
    },
  };

  const pdf = generateQuotePDF(quoteData);
  downloadPDF(pdf, 'simple-quote.pdf');
}

/**
 * Example 2: Quote with Add-ons and Tax
 */
export function complexQuoteExample() {
  const quoteData = {
    businessProfile: {
      business_name: 'Digital Solutions Inc',
      brand_color: '#6366f1',
      contact_email: 'sales@digitalsolutions.com',
      contact_phone: '(800) 555-0199',
      tax_rate: 8.5,
    },
    selectedServices: [
      {
        id: '1',
        name: 'Website Development',
        description: 'Full-stack web application with admin panel',
        base_price: 5000.00,
        addOns: [
          {
            id: 'a1',
            name: 'E-commerce Integration',
            price: 1500.00,
          },
          {
            id: 'a2',
            name: 'Payment Gateway Setup',
            price: 800.00,
          },
        ],
      },
      {
        id: '2',
        name: 'SEO Optimization',
        description: 'Complete SEO audit and optimization',
        base_price: 1200.00,
        addOns: [
          {
            id: 'a3',
            name: 'Monthly Reporting',
            price: 200.00,
          },
        ],
      },
    ],
    clientInfo: {
      name: 'Acme Corporation',
      email: 'procurement@acme.com',
      phone: '(555) 777-8888',
    },
    totals: {
      subtotal: 8700.00,
      tax: 739.50,
      taxRate: 8.5,
      total: 9439.50,
    },
  };

  const pdf = generateQuotePDF(quoteData);
  downloadPDF(pdf, 'complex-quote.pdf');
}

/**
 * Example 3: Get PDF as Blob for Upload
 */
export async function uploadQuoteExample(supabase, quoteData) {
  const pdf = generateQuotePDF(quoteData);
  const blob = getPDFBlob(pdf);
  
  const filename = `quote-${Date.now()}.pdf`;
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('quotes')
    .upload(filename, blob, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('quotes')
    .getPublicUrl(filename);

  return publicUrl;
}

/**
 * Example 4: Preview PDF in Modal
 */
export function previewQuoteExample(quoteData) {
  const pdf = generateQuotePDF(quoteData);
  const dataUrl = getPDFDataURL(pdf);

  // Create modal with iframe
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;

  const iframe = document.createElement('iframe');
  iframe.src = dataUrl;
  iframe.style.cssText = `
    width: 90%;
    height: 90%;
    border: none;
    background: white;
  `;

  modal.appendChild(iframe);
  
  // Close on click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });

  document.body.appendChild(modal);
}

/**
 * Example 5: Save Quote Record to Database
 */
export async function saveQuoteExample(supabase, quoteData, pdfUrl) {
  const { data, error } = await supabase
    .from('quotes')
    .insert({
      business_id: quoteData.businessProfile.id,
      client_email: quoteData.clientInfo.email,
      client_name: quoteData.clientInfo.name,
      services_selected: quoteData.selectedServices,
      total_amount: quoteData.totals.total,
      pdf_url: pdfUrl,
    })
    .select()
    .single();

  if (error) {
    console.error('Database error:', error);
    return null;
  }

  return data;
}

/**
 * Example 6: Email Quote (Conceptual - requires email API setup)
 */
export async function emailQuoteExample(quoteData) {
  const pdf = generateQuotePDF(quoteData);
  const blob = getPDFBlob(pdf);

  // Convert blob to base64
  const base64 = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(blob);
  });

  // Send via email API (example with Resend)
  const response = await fetch('/api/send-quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: quoteData.clientInfo.email,
      subject: `Your Quote from ${quoteData.businessProfile.business_name}`,
      html: `
        <h2>Thank you for your interest!</h2>
        <p>Please find your custom quote attached.</p>
        <p>This quote is valid for 30 days.</p>
        <p>If you have any questions, please contact us at ${quoteData.businessProfile.contact_email}</p>
      `,
      attachments: [
        {
          filename: 'quote.pdf',
          content: base64,
          contentType: 'application/pdf',
        },
      ],
    }),
  });

  return response.ok;
}

/**
 * Example 7: Complete Workflow
 * Generate -> Upload -> Save to DB -> Download
 */
export async function completeWorkflowExample(supabase, quoteData) {
  try {
    // 1. Generate PDF
    const pdf = generateQuotePDF(quoteData);

    // 2. Upload to storage
    const blob = getPDFBlob(pdf);
    const filename = `quote-${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('quotes')
      .upload(filename, blob, {
        contentType: 'application/pdf',
      });

    if (uploadError) throw uploadError;

    // 3. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('quotes')
      .getPublicUrl(filename);

    // 4. Save to database
    const { data: quoteRecord, error: dbError } = await supabase
      .from('quotes')
      .insert({
        business_id: quoteData.businessProfile.id,
        client_email: quoteData.clientInfo.email,
        client_name: quoteData.clientInfo.name,
        services_selected: quoteData.selectedServices,
        total_amount: quoteData.totals.total,
        pdf_url: publicUrl,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // 5. Download for client
    downloadPDF(pdf, `quote-${quoteRecord.id}.pdf`);

    return {
      success: true,
      quoteId: quoteRecord.id,
      pdfUrl: publicUrl,
    };
  } catch (error) {
    console.error('Workflow error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Example 8: Generate Multiple Quotes (Batch)
 */
export function batchQuoteExample(quotesArray) {
  quotesArray.forEach((quoteData, index) => {
    const pdf = generateQuotePDF(quoteData);
    const filename = `quote-${index + 1}-${quoteData.clientInfo.name.replace(/\s+/g, '-')}.pdf`;
    downloadPDF(pdf, filename);
  });
}

// Export all examples as a collection
export const pdfExamples = {
  simple: simpleQuoteExample,
  complex: complexQuoteExample,
  upload: uploadQuoteExample,
  preview: previewQuoteExample,
  saveToDb: saveQuoteExample,
  email: emailQuoteExample,
  completeWorkflow: completeWorkflowExample,
  batch: batchQuoteExample,
};
