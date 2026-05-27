import DropUpload from "./DropUpload";

function DataTable({
  data,
  setData,
  columns,
  uploadCSV,
}) {

  const handleCellChange = (
    rowIndex,
    col,
    value
  ) => {
    const updated = [...data];

    updated[rowIndex][col] = value;

    setData(updated);
  };

  const handleDragStart = (e, col) => {
    e.dataTransfer.setData("col", col);
  };

  if (data.length === 0) {
    return (
      <DropUpload uploadCSV={uploadCSV} />
    );
  }

  return (
    <div className="w-full p-4 overflow-auto">

      <table className="w-full border text-sm">

        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col}
                draggable
                onDragStart={(e) =>
                  handleDragStart(e, col)
                }
                className="border px-2 py-1 bg-black text-white"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map(col => (
                <td
                  key={col}
                  className="border px-2 py-1"
                >
                  <input
                    value={row[col]}
                    onChange={(e) =>
                      handleCellChange(
                        i,
                        col,
                        e.target.value
                      )
                    }
                    className="w-full bg-transparent"
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