import { jsPDF } from "jspdf";
import type { InvoiceData } from "./yourInvoiceTypes";

type ExtendedInvoiceData = InvoiceData & {
  taxRate?: number;
  hsnSac?: string;
  rounding?: number;
};

export const generateInvoicePDF = async (data: InvoiceData) => {
  const invoice = data as ExtendedInvoiceData;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const X = 6;
  const W = 198;
  const R = X + W;

  const BLACK: [number, number, number] = [0, 0, 0];
  const GRAY: [number, number, number] = [225, 225, 225];

  const seller = {
    name: "SHIVARTH INTERNATIONAL-2026-27",
    address1: "668/7A, 1ST FLOOR, SRI NAGAR EXTN.,",
    address2: "STREET NO 2, RANI BAGH, DELHI-110034",
    gstin: "07BQFPA0747J1Z1",
    state: "Delhi",
    stateCode: "07",
    email: "SHIVARTHINTERNATIONAL@GMAIL.COM",
  };

  const taxRate = Number(invoice.taxRate ?? 18);
  const halfTaxRate = taxRate / 2;
  const hsn = invoice.hsnSac ?? "3303";

  const round2 = (n: number) =>
    Math.round((n + Number.EPSILON) * 100) / 100;

  const money = (n: number) =>
    Number(n || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const date = new Date().toLocaleDateString("en-GB");

  const line = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    doc.setDrawColor(...BLACK);
    doc.setLineWidth(0.18);
    doc.line(x1, y1, x2, y2);
  };

  const box = (
    x: number,
    y: number,
    w: number,
    h: number,
    shaded = false
  ) => {
    doc.setDrawColor(...BLACK);
    doc.setLineWidth(0.18);

    if (shaded) {
      doc.setFillColor(...GRAY);
      doc.rect(x, y, w, h, "FD");
    } else {
      doc.rect(x, y, w, h);
    }
  };

  const txt = (
    value: string | number,
    x: number,
    y: number,
    size = 6.5,
    bold = false,
    align: "left" | "center" | "right" = "left",
    maxWidth?: number
  ) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(0, 0, 0);

    doc.text(String(value ?? ""), x, y, {
      align,
      ...(maxWidth ? { maxWidth } : {}),
    });
  };

  // Convert amounts into Indian currency words.
  const numberWords = (value: number): string => {
    const ones = [
      "Zero", "One", "Two", "Three", "Four", "Five",
      "Six", "Seven", "Eight", "Nine", "Ten", "Eleven",
      "Twelve", "Thirteen", "Fourteen", "Fifteen",
      "Sixteen", "Seventeen", "Eighteen", "Nineteen",
    ];

    const tens = [
      "", "", "Twenty", "Thirty", "Forty", "Fifty",
      "Sixty", "Seventy", "Eighty", "Ninety",
    ];

    const underThousand = (n: number): string => {
      if (n < 20) return ones[n];

      if (n < 100) {
        return (
          tens[Math.floor(n / 10)] +
          (n % 10 ? " " + ones[n % 10] : "")
        );
      }

      return (
        ones[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + underThousand(n % 100) : "")
      );
    };

    const convert = (n: number): string => {
      if (n === 0) return "Zero";

      const groups = [
        [10000000, "Crore"],
        [100000, "Lakh"],
        [1000, "Thousand"],
        [1, ""],
      ] as const;

      const parts: string[] = [];
      let remaining = n;

      for (const [divisor, label] of groups) {
        const amount = Math.floor(remaining / divisor);

        if (amount > 0) {
          parts.push(
            underThousand(amount) +
              (label ? " " + label : "")
          );
          remaining %= divisor;
        }
      }

      return parts.join(" ");
    };

    const absolute = Math.abs(round2(value));
    const whole = Math.floor(absolute);
    const paise = Math.round((absolute - whole) * 100);

    return (
      `${convert(whole)} Rupees` +
      (paise ? ` and ${convert(paise)} Paise` : "") +
      " Only"
    );
  };

  // --------------------------------------------------
  // GST-INCLUSIVE ITEM CALCULATIONS
  // The entered item prices already include 18% GST.
  // Extract the taxable amount without increasing the
  // customer's final payable amount.
  // --------------------------------------------------

  const grossItems = data.items.map((item) => {
    const grossAmount = round2(
      Number(
        item.amount ??
          Number(item.quantity || item.qty) * Number(item.price)
      )
    );

    const taxableAmount = round2(
      grossAmount / (1 + taxRate / 100)
    );

    const taxAmount = round2(grossAmount - taxableAmount);

    return {
      ...item,
      grossAmount,
      taxableAmount,
      taxAmount,
      taxableRate: round2(
        Number(item.price || 0) / (1 + taxRate / 100)
      ),
    };
  });

  const calculatedGrossTotal = round2(
    grossItems.reduce(
      (sum, item) => sum + item.grossAmount,
      0
    )
  );

  const grossTotal = round2(
    Number(data.total ?? calculatedGrossTotal)
  );

  const taxableTotal = round2(
    grossItems.reduce(
      (sum, item) => sum + item.taxableAmount,
      0
    )
  );

  // Total tax is calculated only once.
  const taxTotal = round2(grossTotal - taxableTotal);

  // Equivalent tax breakdown:
  // IGST 18% = CGST 9% + SGST 9%.
  // These displayed amounts are alternatives, not additive.
  const igst = taxTotal;
  const cgst = round2(taxTotal / 2);
  const sgst = round2(taxTotal - cgst);

  const rounding = Number(invoice.rounding ?? 0);

  const totalQty = data.items.reduce(
    (sum, item) => sum + Number(item.quantity || item.qty || 0),
    0
  );

  // --------------------------------------------------
  // TITLE AND OUTER BORDER
  // --------------------------------------------------

  txt(
    "Tax Invoice / Retail Invoice",
    105,
    7,
    9,
    true,
    "center"
  );

  box(X, 10, W, 277);

  // --------------------------------------------------
  // SELLER DETAILS AND INVOICE METADATA
  // --------------------------------------------------

  const splitX = 105;
  const leftW = splitX - X;
  const rightW = R - splitX;
  const rightHalf = rightW / 2;

  doc.setDrawColor(...BLACK);
doc.setLineWidth(0.18);
doc.line(X, 10, X, 36); // left border
doc.line(X, 10, splitX, 10); // top border
doc.line(splitX, 10, splitX, 36); // divider

  txt(seller.name, X + 2, 15, 7, true);
  txt(seller.address1, X + 2, 19, 6.5);
  txt(seller.address2, X + 2, 23, 6.5);
  txt(`GSTIN/UIN: ${seller.gstin}`, X + 2, 27, 6.5);

  txt(
    `State Name : ${seller.state}, Code : ${seller.stateCode}`,
    X + 2,
    31,
    6.3
  );

  txt(`E-Mail : ${seller.email}`, X + 2, 34.5, 5.8);

  const metaRows = [
    ["Invoice No.", data.invoiceNo, "Dated", date],
    [
      "Delivery Note",
      "",
      "Mode/Terms of Payment",
      data.paymentDetails || "",
    ],
    ["Reference No. & Date.", "", "Other References", ""],
    ["Buyer's Order No.", "", "Dated", ""],
    ["Dispatch Doc No.", "", "Delivery Note Date", ""],
    ["Dispatched through", "", "Destination", ""],
  ];

  const metaY = 10;
  const metaH = 12.5;

  metaRows.forEach((row, i) => {
    const y = metaY + i * metaH;

    box(splitX, y, rightHalf, metaH);
    box(splitX + rightHalf, y, rightHalf, metaH);

    txt(row[0], splitX + 1.5, y + 4, 6);

    if (row[1]) {
      txt(row[1], splitX + 1.5, y + 8.5, 6.5, true);
    }

    txt(
      row[2],
      splitX + rightHalf + 1.5,
      y + 4,
      6
    );

    if (row[3]) {
      txt(
        row[3],
        splitX + rightHalf + 1.5,
        y + 8.5,
        6.5,
        true
      );
    }
  });

  // --------------------------------------------------
  // CONSIGNEE AND BUYER
  // --------------------------------------------------

  const consigneeY = 36;
  const partyH = 31;
  const buyerY = consigneeY + partyH;
  const buyerH = 31;
  const headerEndY = buyerY + buyerH;

  const addressLines = doc.splitTextToSize(
    data.address || "",
    94
  );

box(X, consigneeY, leftW, partyH);

  txt("Consignee (Ship to)", X + 2, consigneeY + 4, 6.5);
  txt(data.customerName, X + 2, consigneeY + 8.5, 6.7, true);

  addressLines.slice(0, 2).forEach((s: string, i: number) => {
    txt(s, X + 2, consigneeY + 12 + i * 3.2, 6);
  });

  txt(`State Name      : ${data.state || "Delhi"}`, X + 2, consigneeY + 20, 6);
  txt(`Code                : ${data.pincode || ""}`, X + 2, consigneeY + 24, 6);

  box(X, buyerY, leftW, buyerH);

  txt("Buyer (Bill to)", X + 2, buyerY + 4, 6.5);
  txt(data.customerName, X + 2, buyerY + 8.5, 6.7, true);

  addressLines.slice(0, 2).forEach((s: string, i: number) => {
    txt(s, X + 2, buyerY + 12 + i * 3.2, 6);
  });

  txt(`State Name      : ${data.state || "Delhi"}`, X + 2, buyerY + 20, 6);
  txt(`Code                : ${data.pincode || ""}`, X + 2, buyerY + 24, 6);

  // Terms of Delivery box
  const termsY = 85;
  const termsH = headerEndY - termsY;
  box(splitX, termsY, rightW, termsH);
  
  txt(
    "Terms of Delivery",
    splitX + 1.5,
    termsY + 4,
    6
  );

  // --------------------------------------------------
  // GOODS TABLE
  // --------------------------------------------------

  const tableY = headerEndY;
  const headerH = 8;

  const cols = [78, 20, 25, 26, 12, 37];

  const headers = [
    "Description of Goods",
    "HSN/SAC",
    "Quantity",
    "Rate",
    "per",
    "Amount",
  ];

  const starts: number[] = [];
  let currentX = X;

  cols.forEach((width) => {
    starts.push(currentX);
    currentX += width;
  });

  headers.forEach((header, i) => {
    box(starts[i], tableY, cols[i], headerH, true);

    txt(
      header,
      starts[i] + cols[i] / 2,
      tableY + 5,
      6.1,
      false,
      "center"
    );
  });

  // Fixed-height item area.
  const itemRowCount = Math.max(4, data.items.length);
  const itemAreaH = 28;
  const itemRowH = itemAreaH / itemRowCount;

  for (let i = 0; i < itemRowCount; i++) {
    const y = tableY + headerH + i * itemRowH;

    cols.forEach((width, j) => {
      box(starts[j], y, width, itemRowH);
    });

    const item = grossItems[i];

    if (!item) continue;

    const baseline = y + itemRowH / 2 + 1.1;

    txt(
      item.name,
      starts[0] + 2,
      baseline,
      6.3,
      false,
      "left",
      cols[0] - 4
    );

    txt(
      hsn,
      starts[1] + cols[1] / 2,
      baseline,
      6,
      false,
      "center"
    );

    txt(
      item.quantity || item.qty,
      starts[2] + cols[2] / 2,
      baseline,
      6,
      false,
      "center"
    );

    txt(
      money(item.taxableRate),
      starts[3] + cols[3] - 1.5,
      baseline,
      6,
      false,
      "right"
    );

    txt(
      "Nos",
      starts[4] + cols[4] / 2,
      baseline,
      6,
      false,
      "center"
    );

    txt(
      money(item.taxableAmount),
      R - 1.5,
      baseline,
      6,
      false,
      "right"
    );
  }

  // --------------------------------------------------
  // TAX ROWS
  // --------------------------------------------------

  const taxY = tableY + headerH + itemAreaH;
  const taxRowH = 7.2;

  // IGST is 18%. CGST and SGST show the equivalent
  // 9% + 9% split. These are NOT added together.
  const taxRows: [string, number][] = [
    [`IGST@ ${taxRate}%`, igst],
    [`CGST@ ${halfTaxRate}%`, cgst],
    [`SGST@ ${halfTaxRate}%`, sgst],
    ["Rounding Off Difference", rounding],
  ];

  taxRows.forEach(([label, amount], i) => {
    const y = taxY + i * taxRowH;

    cols.forEach((width, j) => {
      box(starts[j], y, width, taxRowH);
    });

    txt(
      label,
      starts[0] + cols[0] - 2,
      y + 4.8,
      6.3,
      true,
      "right"
    );

    txt(
      money(amount),
      R - 1.5,
      y + 4.8,
      6.3,
      false,
      "right"
    );
  });

  // --------------------------------------------------
  // TOTAL
  // --------------------------------------------------

  const totalY = taxY + taxRows.length * taxRowH;

  cols.forEach((width, j) => {
    box(starts[j], totalY, width, 8);
  });

  txt(
    "Total",
    starts[0] + cols[0] - 2,
    totalY + 5.2,
    6.3,
    true,
    "right"
  );

  txt(
    totalQty,
    starts[2] + cols[2] / 2,
    totalY + 5.2,
    6.2,
    true,
    "center"
  );

  // Keep the final price GST-inclusive.
  txt(
    money(grossTotal),
    R - 1.5,
    totalY + 5.2,
    6.3,
    true,
    "right"
  );

  // --------------------------------------------------
  // AMOUNT CHARGEABLE IN WORDS
  // --------------------------------------------------

  const wordsY = totalY + 8;

  box(X, wordsY, W, 11);

  txt(
    "Amount Chargeable (in words)",
    X + 1.5,
    wordsY + 4,
    6.2
  );

  txt(
    `INR ${numberWords(grossTotal)}`,
    X + 1.5,
    wordsY + 8.5,
    6.5,
    true,
    "left",
    W - 3
  );

  // --------------------------------------------------
  // TAX SUMMARY
  // --------------------------------------------------

  const taxTableY = wordsY + 11;

  const taxCols = [22, 22, 31, 31, 31, 31, 30];

  const taxHeaders = [
    "HSN/SAC",
    "TAX RATE",
    "TAXABLE AMT",
    "IGST AMT",
    "CGST AMT",
    "SGST AMT",
    "TOTAL TAX",
  ];

  const taxStarts: number[] = [];
  let taxX = X;

  taxCols.forEach((width) => {
    taxStarts.push(taxX);
    taxX += width;
  });

  taxHeaders.forEach((header, i) => {
    box(taxStarts[i], taxTableY, taxCols[i], 8, true);

    txt(
      header,
      taxStarts[i] + taxCols[i] / 2,
      taxTableY + 5,
      5.5,
      true,
      "center"
    );
  });

  // HSN detail row.
  taxCols.forEach((width, i) => {
    box(taxStarts[i], taxTableY + 8, width, 7);
  });

  txt(
    hsn,
    taxStarts[0] + taxCols[0] / 2,
    taxTableY + 12.5,
    6,
    false,
    "center"
  );

  txt(
    `${taxRate}%`,
    taxStarts[1] + taxCols[1] / 2,
    taxTableY + 12.5,
    6,
    false,
    "center"
  );

  txt(
    money(taxableTotal),
    taxStarts[2] + taxCols[2] - 1,
    taxTableY + 12.5,
    5.8,
    false,
    "right"
  );

  txt(
    money(igst),
    taxStarts[3] + taxCols[3] - 1,
    taxTableY + 12.5,
    5.8,
    false,
    "right"
  );

  txt(
    money(cgst),
    taxStarts[4] + taxCols[4] - 1,
    taxTableY + 12.5,
    5.8,
    false,
    "right"
  );

  txt(
    money(sgst),
    taxStarts[5] + taxCols[5] - 1,
    taxTableY + 12.5,
    5.8,
    false,
    "right"
  );

  txt(
    money(taxTotal),
    R - 1.5,
    taxTableY + 12.5,
    5.8,
    false,
    "right"
  );

  // Two blank rows.
  for (let row = 0; row < 2; row++) {
    taxCols.forEach((width, i) => {
      box(
        taxStarts[i],
        taxTableY + 15 + row * 7,
        width,
        7
      );
    });
  }

  // Tax summary total.
  const summaryY = taxTableY + 29;

  taxCols.forEach((width, i) => {
    box(taxStarts[i], summaryY, width, 7);
  });

  txt(
    "Total:",
    taxStarts[0] + taxCols[0] - 1,
    summaryY + 4.7,
    6,
    true,
    "right"
  );

  txt(
    money(taxableTotal),
    taxStarts[2] + taxCols[2] - 1,
    summaryY + 4.7,
    5.8,
    true,
    "right"
  );

  txt(
    money(igst),
    taxStarts[3] + taxCols[3] - 1,
    summaryY + 4.7,
    5.8,
    true,
    "right"
  );

  txt(
    money(cgst),
    taxStarts[4] + taxCols[4] - 1,
    summaryY + 4.7,
    5.8,
    true,
    "right"
  );

  txt(
    money(sgst),
    taxStarts[5] + taxCols[5] - 1,
    summaryY + 4.7,
    5.8,
    true,
    "right"
  );

  txt(
    money(taxTotal),
    R - 1.5,
    summaryY + 4.7,
    5.8,
    true,
    "right"
  );

  // --------------------------------------------------
  // TAX AMOUNT IN WORDS
  // --------------------------------------------------

  const taxWordsY = summaryY + 7;

  box(X, taxWordsY, W, 8);

  txt(
    "Tax Amount (in words) : INR",
    X + 1.5,
    taxWordsY + 5,
    6.1
  );

  txt(
    numberWords(taxTotal),
    X + 44,
    taxWordsY + 5,
    6.1,
    true,
    "left",
    W - 46
  );

  // --------------------------------------------------
  // DECLARATION AND SIGNATURE
  // --------------------------------------------------

  const footerY = taxWordsY + 8;
  const footerH = 29;

  box(X, footerY, W, footerH);

  line(121, footerY, 121, footerY + footerH);

  txt(
    "Declaration",
    X + 1.5,
    footerY + 4.5,
    6.4
  );

  txt(
    "We declare that this invoice shows the actual price of the goods",
    X + 1.5,
    footerY + 9,
    5.8,
    false,
    "left",
    111
  );

  txt(
    "described and that all particulars are true and correct.",
    X + 1.5,
    footerY + 13,
    5.8,
    false,
    "left",
    111
  );

  txt(
    "for SHIVARTH INTERNATIONAL-2026-27",
    163,
    footerY + 5,
    6,
    false,
    "center"
  );

  txt(
    "Authorised Signatory",
    R - 2,
    footerY + footerH - 4,
    6.2,
    false,
    "right"
  );

  txt(
    "This is a Computer Generated Invoice",
    105,
    291,
    6.3,
    false,
    "center"
  );

  doc.save(`Invoice-${data.invoiceNo || "draft"}.pdf`);
};