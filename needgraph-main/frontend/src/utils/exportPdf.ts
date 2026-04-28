import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const FILENAME = 'NeedGraph_Report_Jan2026_Apr2026.pdf';
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MARGIN_MM = 10;

/**
 * Captures the element with the given ID as a high-fidelity PDF.
 * Long content is automatically paginated across A4 pages.
 * Throws on error so the caller can surface a toast notification.
 */
export async function exportReportPdf(elementId: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element #${elementId} not found`);

  const canvas = await html2canvas(element, {
    scale: 2,                    // 2x for retina-quality
    useCORS: true,
    backgroundColor: '#0A0A0F', // match dark theme background
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageContentWidth = A4_WIDTH_MM - MARGIN_MM * 2;
  const imgWidthPx = canvas.width;
  const imgHeightPx = canvas.height;

  // Scale the canvas to fit the PDF page width
  const scaledHeightMm = (imgHeightPx / imgWidthPx) * pageContentWidth;

  const pageContentHeight = A4_HEIGHT_MM - MARGIN_MM * 2;
  const totalPages = Math.ceil(scaledHeightMm / pageContentHeight);

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) pdf.addPage();

    // Offset in mm for this page
    const yOffsetMm = page * pageContentHeight;

    pdf.addImage(
      imgData,
      'PNG',
      MARGIN_MM,
      MARGIN_MM - yOffsetMm,
      pageContentWidth,
      scaledHeightMm,
    );
  }

  pdf.save(FILENAME);
}
