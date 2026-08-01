function SheetSelectionDialog({
  isOpen,
  fileName,
  sheetNames,
  selectedSheet,
  onSheetChange,
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-dialog-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2
          id="sheet-dialog-title"
          className="text-lg font-semibold text-gray-900"
        >
          Select a worksheet
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          The Excel file contains multiple worksheets.
          Select the worksheet you want to import.
        </p>

        {fileName && (
          <p className="mt-3 truncate rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
            File: {fileName}
          </p>
        )}

        <label
          htmlFor="excel-sheet-select"
          className="mt-5 block text-sm font-medium text-gray-700"
        >
          Worksheet
        </label>

        <select
          id="excel-sheet-select"
          value={selectedSheet}
          onChange={(event) =>
            onSheetChange(event.target.value)
          }
          disabled={isLoading}
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
        >
          {sheetNames.map((sheetName) => (
            <option
              key={sheetName}
              value={sheetName}
            >
              {sheetName}
            </option>
          ))}
        </select>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={!selectedSheet || isLoading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Importing..." : "Import sheet"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SheetSelectionDialog;