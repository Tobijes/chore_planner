import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { JobResult } from "../types";

export function generateSchedulePdf(
  result: JobResult,
  users: [string, string],
): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const generatedDate = `Genereret ${dd}-${mm}-${yyyy}`;

  // Transform result data into table rows
  const body = result.map((period) => {
    const cells = users.map((userName) => {
      const ua = period.users.find((u) => u.userName === userName);
      if (!ua || ua.tasks.length === 0) return "";
      // Prefix with spaces to leave room for the checkbox drawn in didDrawCell
      // Use double newlines between tasks for larger spacing
      return ua.tasks.map((t) => `       ${t.label} (${t.workload}m)`).join("\n\n");
    });
    return [String(period.periodNumber), ...cells];
  });

  const checkboxSize = 2.8;
  const checkboxLeftPad = 7;
  const fontSize = 9;
  const lineHeight = fontSize * 1.15 * (25.4 / 72); // pt to mm

  autoTable(doc, {
    head: [[{ content: "Uge", styles: { halign: "center" } }, users[0], users[1]]],
    body,
    startY: 20,
    showHead: "everyPage",
    theme: "grid",
    styles: {
      fontSize,
      cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
      overflow: "linebreak",
      lineColor: [200, 200, 200],
      lineWidth: 0.25,
    },
    headStyles: {
      fillColor: [24, 24, 27],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 18 },
      1: { cellPadding: { top: 3, right: 3, bottom: 3, left: 6 } },
      2: { cellPadding: { top: 3, right: 3, bottom: 3, left: 6 } },
    },
    margin: { top: 20, left: 14, right: 14, bottom: 20 },
    didDrawCell: (data) => {
      // Draw checkboxes for task cells (user columns, body rows only)
      if (data.section !== "body" || data.column.index === 0) return;
      const text = data.cell.text;
      if (!text || text.length === 0 || (text.length === 1 && text[0] === ""))
        return;

      const cellX = data.cell.x;
      const cellY = data.cell.y;
      const padding =
        typeof data.cell.styles.cellPadding === "object"
          ? (data.cell.styles.cellPadding as { top: number }).top
          : (data.cell.styles.cellPadding as number);

      for (let lineIdx = 0; lineIdx < text.length; lineIdx++) {
        if (text[lineIdx].trim() === "") continue;
        const boxX = cellX + checkboxLeftPad;
        const boxY =
          cellY + padding + lineIdx * lineHeight + (lineHeight - checkboxSize) / 2;

        doc.setDrawColor(100);
        doc.setLineWidth(0.3);
        doc.rect(boxX, boxY, checkboxSize, checkboxSize);
      }
    },
  });

  // Add headers and footers to every page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer: generated date bottom-left, page number bottom-right
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(generatedDate, 14, pageHeight - 10);
    doc.text(
      `Side ${i} af ${totalPages}`,
      pageWidth - 14,
      pageHeight - 10,
      { align: "right" },
    );
  }

  doc.save("opgaveplan.pdf");
}
