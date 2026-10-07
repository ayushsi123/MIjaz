import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoImg from "../imports/logo.png";

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });
};

interface InvoiceData {
  invoiceNo: string;
  date: string;
  dueDate: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  items: Array<{ name: string; desc: string; qty: number; price: number; amount: number }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentDetails: string;
  message: string;
  jobDesc: string;
}

export const generateInvoicePDF = async (data: InvoiceData) => {
  const doc = new jsPDF();
  
  // Custom styling matching the template
  const PRIMARY_COLOR = [128, 0, 0]; // Mijaz Maroon
  const TEXT_COLOR = [60, 60, 60];
  const LIGHT_TEXT = [150, 150, 150];

  try {
    const img = await loadImage(logoImg);
    // Draw the logo at x=15, y=15 with a width/height that preserves ratio or just 20x20
    doc.addImage(img, 'PNG', 15, 15, 20, 20);
  } catch (error) {
    console.error("Failed to load logo", error);
    // Fallback LOGO Box
    doc.setFillColor(80, 90, 110); 
    doc.roundedRect(15, 15, 20, 20, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("M", 25, 30, { align: "center" });
  }

  // Company Header
  doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
  doc.setFontSize(10);
  doc.text("Mijaz", 45, 20);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(LIGHT_TEXT[0], LIGHT_TEXT[1], LIGHT_TEXT[2]);
  doc.setFontSize(9);
  doc.text("Luxury Perfumery, India", 45, 25);
  doc.text("contact@mijaz.com", 45, 30);

  // Invoice # and Date (Top Right)
  doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
  doc.setFontSize(9);
  doc.text(`Invoice#    ${data.invoiceNo}`, 195, 20, { align: "right" });
  doc.text(`Issue date    ${data.date}`, 195, 25, { align: "right" });

  // Title / Message
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  const firstName = data.customerName ? data.customerName.split(' ')[0] : "Customer";
  doc.text(firstName, 15, 55);
  
  doc.setFontSize(10);
  doc.setTextColor(LIGHT_TEXT[0], LIGHT_TEXT[1], LIGHT_TEXT[2]);
  doc.text(data.message, 15, 62);

  // Grid Headers: BILL TO, DETAILS, PAYMENT
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
  doc.text("BILL TO", 15, 80);
  doc.text("DETAILS", 80, 80);
  doc.text("PAYMENT", 145, 80);

  // Grid Content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(LIGHT_TEXT[0], LIGHT_TEXT[1], LIGHT_TEXT[2]);
  
  // Bill To
  doc.text(data.customerName, 15, 88);
  doc.text(data.email, 15, 93);
  if (data.phone) doc.text(data.phone, 15, 98);
  const addressLines = doc.splitTextToSize(data.address, 55);
  doc.text(addressLines, 15, 103);

  // Details
  const jobDescLines = doc.splitTextToSize(data.jobDesc, 55);
  doc.text(jobDescLines, 80, 88);

  // Payment info
  doc.text(`Due date: ${data.dueDate}`, 145, 88);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(`Rs. ${data.total.toLocaleString()}`, 145, 93);

  // Table
  autoTable(doc, {
    startY: 120,
    head: [[
      { content: 'ITEM', styles: { halign: 'left' } },
      { content: 'QTY', styles: { halign: 'center' } },
      { content: 'PRICE', styles: { halign: 'right' } },
      { content: 'AMOUNT', styles: { halign: 'right' } }
    ]],
    body: data.items.map(item => [
      `${item.name}\n${item.desc}`,
      item.qty.toString(),
      `Rs. ${item.price.toLocaleString()}`,
      `Rs. ${item.amount.toLocaleString()}`
    ]),
    theme: 'plain',
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: { top: 5, bottom: 5 }
    },
    bodyStyles: {
      textColor: [100, 100, 100],
      fontSize: 9,
      cellPadding: { top: 6, bottom: 6 }
    },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right', fontStyle: 'bold', textColor: [0,0,0] }
    },
    didDrawCell: (data: any) => {
      // Draw bottom border for table head
      if (data.section === 'head' && data.row.index === 0) {
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.5);
        doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
      }
      // Draw top border for table head
      if (data.section === 'head' && data.row.index === 0) {
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.5);
        doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
      }
    }
  });

  // Totals Section
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFontSize(9);
  doc.setTextColor(LIGHT_TEXT[0], LIGHT_TEXT[1], LIGHT_TEXT[2]);
  
  // Subtotal
  doc.text("Subtotal", 145, finalY);
  doc.setTextColor(0, 0, 0);
  doc.text(`Rs. ${data.subtotal.toLocaleString()}`, 195, finalY, { align: "right" });

  // Tax
  doc.setTextColor(LIGHT_TEXT[0], LIGHT_TEXT[1], LIGHT_TEXT[2]);
  doc.text(`Tax (${data.tax}%)`, 145, finalY + 8);
  doc.setTextColor(0, 0, 0);
  const taxAmt = Math.round((data.subtotal * data.tax) / 100);
  doc.text(`Rs. ${taxAmt.toLocaleString()}`, 195, finalY + 8, { align: "right" });

  // Total
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Total due", 15, finalY + 20);
  doc.text(`Rs. ${data.total.toLocaleString()}`, 195, finalY + 20, { align: "right" });

  // Bottom Border above Total
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.line(15, finalY + 14, 195, finalY + 14);

  // Bottom Border below Total
  doc.line(15, finalY + 26, 195, finalY + 26);

  // Footer / Payment details
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Payment details", 15, finalY + 40);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(LIGHT_TEXT[0], LIGHT_TEXT[1], LIGHT_TEXT[2]);
  doc.text(data.paymentDetails, 15, finalY + 45);

  // Page 1 indicator
  doc.text("Page 1", 195, 285, { align: "right" });

  // Save the PDF
  doc.save(`Invoice_${data.invoiceNo}.pdf`);
};
