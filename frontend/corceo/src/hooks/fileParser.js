import Papa from "papaparse";
import * as XLSX from "xlsx";

const CSV_EXTENSIONS = [".csv"];
const EXCEL_EXTENSIONS = [".xlsx", ".xls"];

function getFileExtension(filename = "") {
  const lastDot = filename.lastIndexOf(".");

  if (lastDot === -1) {
    return "";
  }

  return filename.slice(lastDot).toLowerCase();
}

function normalizeRows(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows
    .filter((row) => {
      if (!row || typeof row !== "object") {
        return false;
      }

      return Object.values(row).some(
        (value) => String(value ?? "").trim() !== ""
      );
    })
    .map((row) => {
      const normalizedRow = {};

      Object.entries(row).forEach(([key, value]) => {
        const normalizedKey = String(key).trim();

        if (!normalizedKey) {
          return;
        }

        normalizedRow[normalizedKey] = value ?? "";
      });

      return normalizedRow;
    });
}

function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) => header.trim(),

      complete: (result) => {
        if (result.errors?.length) {
          const seriousErrors = result.errors.filter(
            (error) => error.type !== "FieldMismatch"
          );

          if (seriousErrors.length) {
            reject(
              new Error(
                seriousErrors
                  .map((error) => error.message)
                  .join(", ")
              )
            );
            return;
          }
        }

        resolve(normalizeRows(result.data));
      },

      error: (error) => {
        reject(error);
      },
    });
  });
}

async function parseExcel(file) {
  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: true,
  });

  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("The Excel workbook contains no sheets.");
  }

  const worksheet = workbook.Sheets[firstSheetName];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    defval: "",
    raw: false,
  });

  return normalizeRows(rows);
}

export async function parseDataFile(file) {
  if (!file) {
    throw new Error("No file selected.");
  }

  const extension = getFileExtension(file.name);

  if (CSV_EXTENSIONS.includes(extension)) {
    return {
      rows: await parseCSV(file),
      fileType: "csv",
      sheetName: null,
    };
  }

  if (EXCEL_EXTENSIONS.includes(extension)) {
    const rows = await parseExcel(file);

    return {
      rows,
      fileType: "excel",
      sheetName: null,
    };
  }

  throw new Error(
    "Unsupported file type. Select a CSV, XLS, or XLSX file."
  );
}