import Papa from "papaparse";
import * as XLSX from "xlsx";

const CSV_EXTENSIONS = [".csv"];
const EXCEL_EXTENSIONS = [".xlsx", ".xls"];

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function getFileExtension(filename = "") {
  const lastDot = filename.lastIndexOf(".");

  if (lastDot === -1) {
    return "";
  }

  return filename.slice(lastDot).toLowerCase();
}


function isEmptyValue(value) {
  return (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  );
}

function isEmptyRow(row) {
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    return true;
  }

  return Object.values(row).every(isEmptyValue);
}


function normalizeValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  return value;
}


export function createUniqueHeaders(headers = []) {
  const headerCounts = new Map();

  return headers.map((header, index) => {
    const cleanedHeader = String(header ?? "").trim();
    const baseHeader = cleanedHeader || `Column ${index + 1}`;

    const currentCount = headerCounts.get(baseHeader) ?? 0;
    const nextCount = currentCount + 1;

    headerCounts.set(baseHeader, nextCount);

    if (nextCount === 1) {
      return baseHeader;
    }

    return `${baseHeader}_${nextCount}`;
  });
}

export function normalizeRows(rows, suppliedHeaders = null) {
  if (!Array.isArray(rows)) {
    return {
      rows: [],
      columns: [],
    };
  }

  const nonEmptyRows = rows.filter(
    (row) =>
      row &&
      typeof row === "object" &&
      !Array.isArray(row) &&
      !isEmptyRow(row)
  );

  if (nonEmptyRows.length === 0) {
    return {
      rows: [],
      columns: [],
    };
  }

  const originalHeaders =
    Array.isArray(suppliedHeaders) && suppliedHeaders.length > 0
      ? suppliedHeaders
      : Array.from(
          new Set(
            nonEmptyRows.flatMap((row) => Object.keys(row))
          )
        );

  const columns = createUniqueHeaders(originalHeaders);

  const headerMapping = originalHeaders.map((originalHeader, index) => ({
    originalHeader,
    normalizedHeader: columns[index],
  }));

  const normalizedRows = nonEmptyRows.map((row) => {
    const normalizedRow = {};

    headerMapping.forEach(
      ({ originalHeader, normalizedHeader }) => {
        normalizedRow[normalizedHeader] = normalizeValue(
          row[originalHeader]
        );
      }
    );

    return normalizedRow;
  });

  return {
    rows: normalizedRows,
    columns,
  };
}

/**
 * Validates the selected file before parsing.
 */
export function validateDataFile(file) {
  if (!file) {
    throw new Error("No file selected.");
  }

  if (!file.name) {
    throw new Error("The selected file has no filename.");
  }

  if (file.size === 0) {
    throw new Error("The selected file is empty.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `The selected file is too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`
    );
  }

  const extension = getFileExtension(file.name);

  const isCSV = CSV_EXTENSIONS.includes(extension);
  const isExcel = EXCEL_EXTENSIONS.includes(extension);

  if (!isCSV && !isExcel) {
    throw new Error(
      "Unsupported file type. Select a CSV, XLS, or XLSX file."
    );
  }

  return {
    extension,
    fileType: isCSV ? "csv" : "excel",
  };
}


export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",

      transformHeader: (header) => {
        return String(header ?? "").trim();
      },

      complete: (result) => {
        const errors = result.errors ?? [];

        const seriousErrors = errors.filter(
          (error) => error.type !== "FieldMismatch"
        );

        if (seriousErrors.length > 0) {
          const errorMessage = seriousErrors
            .map((error) => {
              const rowText =
                typeof error.row === "number"
                  ? ` at row ${error.row + 1}`
                  : "";

              return `${error.message}${rowText}`;
            })
            .join("; ");

          reject(
            new Error(`CSV parsing failed: ${errorMessage}`)
          );

          return;
        }

        const originalHeaders = result.meta?.fields ?? [];

        const normalized = normalizeRows(
          result.data,
          originalHeaders
        );

        resolve({
          ...normalized,
          warnings: errors,
        });
      },

      error: (error) => {
        reject(
          new Error(
            `Could not read the CSV file: ${
              error?.message ?? "Unknown parsing error."
            }`
          )
        );
      },
    });
  });
}


export async function readExcelWorkbook(file) {
  try {
    const buffer = await file.arrayBuffer();

    const workbook = XLSX.read(buffer, {
      type: "array",
      cellDates: true,
    });

    if (!workbook.SheetNames?.length) {
      throw new Error(
        "The Excel workbook contains no worksheets."
      );
    }

    return {
      workbook,
      sheetNames: workbook.SheetNames,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "The Excel workbook contains no worksheets."
    ) {
      throw error;
    }

    throw new Error(
      `Could not read the Excel file: ${
        error?.message ?? "Invalid Excel workbook."
      }`
    );
  }
}


export function parseExcelSheet(workbook, sheetName) {
  if (!workbook) {
    throw new Error("The Excel workbook is not loaded.");
  }

  if (!sheetName) {
    throw new Error("No Excel worksheet selected.");
  }

  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(
      `The worksheet "${sheetName}" could not be found.`
    );
  }


  const matrix = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
    raw: false,
    blankrows: false,
  });

  if (!Array.isArray(matrix) || matrix.length === 0) {
    throw new Error(
      `The worksheet "${sheetName}" is empty.`
    );
  }

  const [rawHeaderRow, ...dataRows] = matrix;

  if (!Array.isArray(rawHeaderRow)) {
    throw new Error(
      `The worksheet "${sheetName}" has no valid header row.`
    );
  }

  const columns = createUniqueHeaders(rawHeaderRow);

  const objectRows = dataRows.map((row) => {
    const objectRow = {};

    columns.forEach((column, index) => {
      objectRow[column] = normalizeValue(row?.[index]);
    });

    return objectRow;
  });

  const normalized = normalizeRows(objectRows, columns);

  if (normalized.rows.length === 0) {
    throw new Error(
      `The worksheet "${sheetName}" contains no data rows.`
    );
  }

  return {
    ...normalized,
    sheetName,
  };
}

export async function parseDataFile(file) {
  const { extension, fileType } = validateDataFile(file);

  if (fileType === "csv") {
    const parsedCSV = await parseCSV(file);

    if (parsedCSV.rows.length === 0) {
      throw new Error(
        "The CSV file does not contain any data rows."
      );
    }

    return {
      fileName: file.name,
      fileType: "csv",
      extension,

      rows: parsedCSV.rows,
      columns: parsedCSV.columns,

      rowCount: parsedCSV.rows.length,
      columnCount: parsedCSV.columns.length,

      sheetName: null,
      sheetNames: [],
      workbook: null,

      requiresSheetSelection: false,
      warnings: parsedCSV.warnings ?? [],
    };
  }

  const { workbook, sheetNames } =
    await readExcelWorkbook(file);

  if (sheetNames.length === 1) {
    const sheetName = sheetNames[0];

    const parsedSheet = parseExcelSheet(
      workbook,
      sheetName
    );

    return {
      fileName: file.name,
      fileType: "excel",
      extension,

      rows: parsedSheet.rows,
      columns: parsedSheet.columns,

      rowCount: parsedSheet.rows.length,
      columnCount: parsedSheet.columns.length,

      sheetName,
      sheetNames,
      workbook: null,

      requiresSheetSelection: false,
      warnings: [],
    };
  }



  return {
    fileName: file.name,
    fileType: "excel",
    extension,

    rows: [],
    columns: [],

    rowCount: 0,
    columnCount: 0,

    sheetName: null,
    sheetNames,
    workbook,

    requiresSheetSelection: true,
    warnings: [],
  };
}