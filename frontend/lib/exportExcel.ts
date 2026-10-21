/**
 * Tiện ích xuất dữ liệu ra file Microsoft Excel (.xls) có cấu trúc cột rõ ràng,
 * có màu sắc, kẻ bảng, phân tách dữ liệu chuẩn xác không bị dính cột trên Windows/Mac Excel.
 */

export interface ExcelColumn {
  header: string;
  key?: string;
  width?: number; // Độ rộng tương đối tính theo pixel
  align?: "left" | "center" | "right";
}

export interface ExportExcelOptions {
  filename: string;
  sheetName?: string;
  title?: string;
  metadata?: Array<{ label: string; value: string | number }>;
  columns: ExcelColumn[];
  data: Array<Record<string, any> | (string | number | boolean | null | undefined)[]>;
}

/**
 * Escape HTML để an toàn cho dữ liệu trong file Excel
 */
function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\n/g, "<br style='mso-data-placement:same-cell;' />");
}

/**
 * Xuất dữ liệu ra file Excel (.xls) tương thích 100% với Microsoft Excel, Google Sheets, LibreOffice.
 */
export function exportToExcel(options: ExportExcelOptions): void {
  const {
    filename,
    sheetName = "Dữ liệu",
    title,
    metadata,
    columns,
    data,
  } = options;

  const sanitizedSheetName = sheetName.replace(/[:\\/?*[\]]/g, "").slice(0, 31) || "Sheet1";
  const finalFilename = filename.toLowerCase().endsWith(".xls") ? filename : `${filename}.xls`;

  let html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>${sanitizedSheetName}</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
            <x:Selected/>
            <x:DoNotDisplayGridlines>False</x:DoNotDisplayGridlines>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      font-size: 11pt;
      color: #1E293B;
      background-color: #FFFFFF;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    .title-cell {
      font-size: 16pt;
      font-weight: bold;
      color: #1E3A8A;
      text-align: left;
      padding: 12px 6px;
      height: 40px;
    }
    .meta-label {
      font-size: 10pt;
      font-weight: bold;
      color: #475569;
      background-color: #F1F5F9;
      padding: 4px 8px;
      border: 1px solid #E2E8F0;
    }
    .meta-val {
      font-size: 10pt;
      color: #0F172A;
      padding: 4px 8px;
      border: 1px solid #E2E8F0;
    }
    th.col-header {
      background-color: #2563EB;
      color: #FFFFFF;
      font-size: 11pt;
      font-weight: bold;
      text-align: center;
      vertical-align: middle;
      border: 1px solid #1D4ED8;
      padding: 10px 8px;
      height: 32px;
      white-space: nowrap;
    }
    td.data-cell {
      border: 1px solid #CBD5E1;
      padding: 6px 8px;
      font-size: 10pt;
      vertical-align: middle;
      mso-number-format: "\\@";
    }
    .row-even {
      background-color: #FFFFFF;
    }
    .row-odd {
      background-color: #F8FAFC;
    }
    .text-left {
      text-align: left;
    }
    .text-center {
      text-align: center;
    }
    .text-right {
      text-align: right;
    }
    .badge-published {
      background-color: #DCFCE7;
      color: #166534;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 4px;
      text-align: center;
    }
    .badge-draft {
      background-color: #FEF3C7;
      color: #92400E;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 4px;
      text-align: center;
    }
  </style>
</head>
<body>
  <table>
`;

  // Render Title
  if (title) {
    html += `
    <tr>
      <td colspan="${columns.length}" class="title-cell">${escapeHtml(title)}</td>
    </tr>
`;
  }

  // Render Metadata
  if (metadata && metadata.length > 0) {
    metadata.forEach((m) => {
      html += `
    <tr>
      <td class="meta-label">${escapeHtml(m.label)}</td>
      <td colspan="${columns.length - 1}" class="meta-val">${escapeHtml(m.value)}</td>
    </tr>
`;
    });
    // Dòng trống cách ly
    html += `<tr><td colspan="${columns.length}" style="height: 12px;"></td></tr>\n`;
  }

  // Render Table Header
  html += `    <thead><tr>\n`;
  columns.forEach((col) => {
    const widthStyle = col.width ? ` style="width: ${col.width}px;"` : "";
    html += `      <th class="col-header"${widthStyle}>${escapeHtml(col.header)}</th>\n`;
  });
  html += `    </tr></thead>\n    <tbody>\n`;

  // Render Data Rows
  if (data.length === 0) {
    html += `      <tr><td colspan="${columns.length}" class="data-cell text-center" style="padding: 20px; color: #94A3B8;">(Không có dữ liệu)</td></tr>\n`;
  } else {
    data.forEach((row, rowIndex) => {
      const rowClass = rowIndex % 2 === 0 ? "row-even" : "row-odd";
      html += `      <tr class="${rowClass}">\n`;

      columns.forEach((col) => {
        let val: any = "";
        if (Array.isArray(row)) {
          // Row là array
          const colIndex = columns.indexOf(col);
          val = row[colIndex];
        } else if (typeof row === "object" && row !== null) {
          // Row là object
          if (col.key) {
            val = row[col.key];
          }
        }

        const alignClass = col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left";
        let cellContent = escapeHtml(val);

        // Hiển thị badge cho trạng thái
        if (val === "PUBLISHED" || val === "Đã xuất bản" || val === "Hoạt động") {
          cellContent = `<span class="badge-published">${escapeHtml(val)}</span>`;
        } else if (val === "DRAFT" || val === "Bản nháp" || val === "Chưa xuất bản") {
          cellContent = `<span class="badge-draft">${escapeHtml(val)}</span>`;
        }

        html += `        <td class="data-cell ${alignClass}">${cellContent}</td>\n`;
      });

      html += `      </tr>\n`;
    });
  }

  html += `
    </tbody>
  </table>
</body>
</html>
`;

  // Tạo Blob với UTF-8 BOM
  const blob = new Blob(["\uFEFF" + html], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
