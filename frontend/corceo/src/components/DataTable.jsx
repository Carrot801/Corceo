import { useState } from "react";

function DataTable({
  data,
  setData,
  columns,
  setColumns,
  uploadCSV,
  compactMode = false,
  enableDrag = false,
  setChartConfig,
}) {
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // -----------------------------------
  // CSV DROP
  // -----------------------------------
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDraggingFile(false);

    const file = e.dataTransfer.files[0];

    if (!file || file.type !== "text/csv") {
      alert("Please drop a valid CSV file");
      return;
    }

    if (uploadCSV) {
      await uploadCSV(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  // -----------------------------------
  // COLUMN RENAME
  // -----------------------------------
  const handleColumnRename = (index, value) => {
    const oldColumn = columns[index];

    if (!value || value === oldColumn) return;

    // update columns
    const updatedColumns = [...columns];
    updatedColumns[index] = value;

    // update data rows
    const updatedData = data.map((row) => {
      const newRow = { ...row };

      newRow[value] = newRow[oldColumn];

      delete newRow[oldColumn];

      return newRow;
    });

    setColumns(updatedColumns);
    setData(updatedData);

    // update chart config if needed
    if (setChartConfig) {
      setChartConfig((prev) => ({
        ...prev,
        x: prev.x === oldColumn ? value : prev.x,
        y: prev.y === oldColumn ? value : prev.y,
      }));
    }
  };

  // -----------------------------------
  // CELL EDITING
  // -----------------------------------
  const handleCellChange = (rowIndex, column, value) => {
    const updated = [...data];

    updated[rowIndex] = {
      ...updated[rowIndex],
      [column]: value,
    };

    setData(updated);
  };

  // -----------------------------------
  // ADD ROW
  // -----------------------------------
  const handleAddRow = () => {
    const emptyRow = {};

    columns.forEach((col) => {
      emptyRow[col] = "";
    });

    setData([...data, emptyRow]);
  };

  // -----------------------------------
  // DELETE ROW
  // -----------------------------------
  const handleDeleteRow = (rowIndex) => {
    const updated = data.filter((_, index) => index !== rowIndex);

    setData(updated);
  };

  // -----------------------------------
  // ADD COLUMN
  // -----------------------------------
  const handleAddColumn = () => {
    const newColumnName = `Column ${columns.length + 1}`;

    const updatedColumns = [...columns, newColumnName];

    const updatedData = data.map((row) => ({
      ...row,
      [newColumnName]: "",
    }));

    setColumns(updatedColumns);
    setData(updatedData);
  };

  // -----------------------------------
  // DELETE COLUMN
  // -----------------------------------
  const handleDeleteColumn = (columnToDelete) => {
    const updatedColumns = columns.filter(
      (col) => col !== columnToDelete
    );

    const updatedData = data.map((row) => {
      const newRow = { ...row };

      delete newRow[columnToDelete];

      return newRow;
    });

    setColumns(updatedColumns);
    setData(updatedData);

    // remove from chart config
    if (setChartConfig) {
      setChartConfig((prev) => ({
        ...prev,
        x: prev.x === columnToDelete ? null : prev.x,
        y: prev.y === columnToDelete ? null : prev.y,
      }));
    }
  };

  // -----------------------------------
  // COLUMN DRAG
  // -----------------------------------
  const handleDragStart = (e, col) => {
    if (!enableDrag) return;

    e.dataTransfer.setData("col", col);
  };

  // -----------------------------------
  // QUICK COLUMN SELECT
  // -----------------------------------
  const handleColumnClick = (col) => {
    if (!setChartConfig) return;

    setChartConfig((prev) => ({
      ...prev,
      x: prev.x || col,
      y: prev.x && !prev.y ? col : prev.y,
    }));
  };

  // -----------------------------------
  // EMPTY STATE
  // -----------------------------------
  if (!data || !Array.isArray(data) || data.length === 0) {
      return (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            flex-1
            flex
            flex-col
            items-center
            justify-center
            border-2
            border-dashed
            m-4
            rounded-lg
            text-slate-400
            min-h-[300px]
            ${isDraggingFile ? "bg-slate-100" : ""}
          `}
        >
          <p>Drop CSV file here</p>
          {!Array.isArray(data) && data && (
            <p className="text-xs text-red-500 mt-2">
              Failed to load data correctly from server.
            </p>
          )}
        </div>
      );
    }

  return (
    <div
      className={`
        w-full
        h-full
        overflow-auto
        ${compactMode ? "text-xs" : "text-sm"}
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* TOP ACTION BAR */}
      <div className="flex items-center gap-2 p-3 border-b bg-white sticky top-0 z-20">

        <button
          onClick={handleAddRow}
          className="
            px-3 py-1.5
            bg-blue-500
            text-white
            rounded-md
            text-xs
            font-medium
          "
        >
          Add Row
        </button>

        <button
          onClick={handleAddColumn}
          className="
            px-3 py-1.5
            bg-green-500
            text-white
            rounded-md
            text-xs
            font-medium
          "
        >
          Add Column
        </button>

      </div>

      {/* TABLE */}
      <table className="w-full border-collapse">

        {/* HEADER */}
        <thead className="sticky top-[52px] bg-slate-900 text-white z-10">
          <tr>

            {/* ROW NUMBER */}
            <th className="px-3 py-2 border w-14">
              #
            </th>

            {columns.map((col, index) => (
              <th
                key={col}
                draggable={enableDrag}
                onDragStart={(e) => handleDragStart(e, col)}
                className="
                  px-3
                  py-2
                  border
                  text-left
                  min-w-[180px]
                "
              >
                <div className="flex items-center gap-2">

                  {/* COLUMN NAME */}
                  <input
                    value={col}
                    onClick={() => handleColumnClick(col)}
                    onChange={(e) =>
                      handleColumnRename(index, e.target.value)
                    }
                    className="
                      bg-transparent
                      outline-none
                      font-semibold
                      w-full
                      cursor-pointer
                    "
                  />

                  {/* DELETE COLUMN */}
                  <button
                    onClick={() =>
                      handleDeleteColumn(col)
                    }
                    className="
                      text-red-300
                      hover:text-red-500
                      text-xs
                    "
                  >
                    ✕
                  </button>

                </div>
              </th>
            ))}

          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b hover:bg-slate-50"
            >

              {/* ROW ACTIONS */}
              <td className="px-2 py-1 border text-center">

                <button
                  onClick={() =>
                    handleDeleteRow(rowIndex)
                  }
                  className="
                    text-red-500
                    hover:text-red-700
                    text-xs
                  "
                >
                  Delete
                </button>

              </td>

              {/* CELLS */}
              {columns.map((col) => (
                <td
                  key={col}
                  className="px-2 py-1 border"
                >
                  <input
                    value={row[col] ?? ""}
                    onChange={(e) =>
                      handleCellChange(
                        rowIndex,
                        col,
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      outline-none
                      bg-transparent
                      px-1
                    "
                  />
                </td>
              ))}

            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}

export default DataTable;