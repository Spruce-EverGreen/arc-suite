import { jsPDF } from 'jspdf';

/**
 * Generate a professional quote PDF
 * @param {Object} quoteData - The quote information
 * @param {Object} quoteData.businessProfile - Business information
 * @param {Array} quoteData.selectedServices - Array of selected services
 * @param {Object} quoteData.clientInfo - Client information
 * @param {Object} quoteData.totals - Price breakdown
 * @returns {jsPDF} - The generated PDF document
 */
export function generateQuotePDF(quoteData) {
  const {
    businessProfile = {},
    selectedServices = [],
    clientInfo = {},
    totals = {},
  } = quoteData;

  // Create new PDF document (A4 size)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Brand color (default to #007da5 if not provided)
  const brandColor = hexToRGB(businessProfile.brand_color || '#007da5');

  // ============ HEADER SECTION ============
  // Business Name
  doc.setFontSize(24);
  doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
  doc.setFont('helvetica', 'bold');
  doc.text(businessProfile.business_name || 'Business Name', margin, yPos);
  yPos += 10;

  // "QUOTE" title
  doc.setFontSize(16);
  doc.setTextColor(100, 100, 100);
  doc.text('QUOTE', margin, yPos);
  yPos += 12;

  // Date and Quote Number
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  const quoteDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Date: ${quoteDate}`, margin, yPos);
  yPos += 5;
  doc.text(`Quote #: ${generateQuoteNumber()}`, margin, yPos);
  yPos += 5;
  doc.text(`Valid until: ${getExpirationDate(30)}`, margin, yPos);
  yPos += 12;

  // Horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // ============ CLIENT INFORMATION ============
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('Prepared For:', margin, yPos);
  yPos += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (clientInfo.name) {
    doc.text(clientInfo.name, margin, yPos);
    yPos += 5;
  }
  if (clientInfo.email) {
    doc.text(clientInfo.email, margin, yPos);
    yPos += 5;
  }
  if (clientInfo.phone) {
    doc.text(clientInfo.phone, margin, yPos);
    yPos += 5;
  }
  yPos += 8;

  // ============ SERVICES TABLE ============
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('Services', margin, yPos);
  yPos += 8;

  // Table header
  doc.setFillColor(brandColor.r, brandColor.g, brandColor.b);
  doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Service', margin + 2, yPos);
  doc.text('Price', pageWidth - margin - 30, yPos);
  yPos += 8;

  // Table rows - Services
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  
  selectedServices.forEach((service, index) => {
    // Check if we need a new page
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = margin;
    }

    // Alternate row background
    if (index % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 10, 'F');
    }

    // Service name and description
    doc.setFont('helvetica', 'bold');
    doc.text(service.name, margin + 2, yPos);
    yPos += 4;

    if (service.description) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const descLines = doc.splitTextToSize(service.description, pageWidth - 2 * margin - 40);
      doc.text(descLines, margin + 2, yPos);
      yPos += descLines.length * 4;
    }

    // Price (aligned right)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const priceText = `$${service.base_price.toFixed(2)}`;
    doc.text(priceText, pageWidth - margin - 2, yPos - 4, { align: 'right' });

    // Add-ons if any
    if (service.addOns && service.addOns.length > 0) {
      yPos += 2;
      service.addOns.forEach((addon) => {
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`  + ${addon.name}`, margin + 4, yPos);
        doc.text(`$${addon.price.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' });
        yPos += 4;
      });
      doc.setTextColor(60, 60, 60);
    }

    yPos += 6;
  });

  yPos += 5;

  // ============ TOTALS SECTION ============
  // Horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(pageWidth - margin - 60, yPos, pageWidth - margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Subtotal
  doc.text('Subtotal:', pageWidth - margin - 60, yPos);
  doc.text(`$${totals.subtotal.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' });
  yPos += 6;

  // Tax (if applicable)
  if (totals.tax && totals.tax > 0) {
    doc.text(`Tax (${totals.taxRate}%):`, pageWidth - margin - 60, yPos);
    doc.text(`$${totals.tax.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' });
    yPos += 6;
  }

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total:', pageWidth - margin - 60, yPos);
  doc.text(`$${totals.total.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' });
  yPos += 15;

  // ============ FOOTER SECTION ============
  // Business contact info
  yPos = Math.max(yPos, pageHeight - 50); // Position near bottom
  
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);

  if (businessProfile.contact_email || businessProfile.contact_phone) {
    let contactText = '';
    if (businessProfile.contact_email) contactText += businessProfile.contact_email;
    if (businessProfile.contact_email && businessProfile.contact_phone) contactText += '  |  ';
    if (businessProfile.contact_phone) contactText += businessProfile.contact_phone;
    
    doc.text(contactText, pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
  }

  // Terms
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('This quote is valid for 30 days from the date of issue.', pageWidth / 2, yPos, { align: 'center' });
  yPos += 4;
  doc.text('Please contact us to accept this quote or if you have any questions.', pageWidth / 2, yPos, { align: 'center' });

  return doc;
}

/**
 * Download the PDF to the user's device
 * @param {jsPDF} doc - The PDF document
 * @param {string} filename - The filename for the download
 */
export function downloadPDF(doc, filename = 'quote.pdf') {
  doc.save(filename);
}

/**
 * Get the PDF as a blob (for email attachments, etc.)
 * @param {jsPDF} doc - The PDF document
 * @returns {Blob} - PDF as a blob
 */
export function getPDFBlob(doc) {
  return doc.output('blob');
}

/**
 * Get the PDF as a data URL (for preview)
 * @param {jsPDF} doc - The PDF document
 * @returns {string} - PDF as data URL
 */
export function getPDFDataURL(doc) {
  return doc.output('dataurlstring');
}

// ============ HELPER FUNCTIONS ============

/**
 * Convert hex color to RGB
 */
function hexToRGB(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 125, b: 165 }; // Default to #007da5
}

/**
 * Generate a unique quote number
 */
function generateQuoteNumber() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `Q${year}${month}-${random}`;
}

/**
 * Get expiration date string
 */
function getExpirationDate(days = 30) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
