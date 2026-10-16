import DropUpload from "./DropUpload";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState } from
"react";
import { apiRequest } from "../../api/client";


function EditableCell({
  value,
  rowIndex,
  columnIndex,
  columnName,
  onCommit,
  onCellFocus,
  onCellKeyDown,
}) {
  const [draft, setDraft] = useState(value ?? "");
  const draftRef = useRef(value ?? "");

  useEffect(() => {
    const next = value ?? "";
    draftRef.current = next;
    setDraft(next);
  }, [value]);

  const commit = () => {
    const next = draftRef.current;

    // Keep the original value and type when nothing changed.
    if (String(next) !== String(value ?? "")) {
      onCommit(rowIndex, columnName, next);
    }
  };

  return (
    <input
      data-row={rowIndex}
      data-column={columnIndex}
      aria-label={`${columnName}, row ${rowIndex + 1}`}
      value={draft}
      onFocus={() => onCellFocus(rowIndex, columnIndex)}
      onChange={(event) => {
        const next = event.target.value;
        draftRef.current = next;
        setDraft(next);
      }}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();

          const original = value ?? "";
          draftRef.current = original;
          setDraft(original);
          event.currentTarget.blur();
          return;
        }

        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
          return;
        }

        onCellKeyDown(event, rowIndex, columnIndex);
      }}
      className="app-text w-full bg-transparent outline-none"
    />
  );
}

function DataTable({
  data,
  setData,
  columns,
  setColumns,
  datasetId,
  handleDataFile,
  isUploadingFile = false
}) {

  // Measure the existing row styling instead of imposing a new row height.
  const [rowHeight, setRowHeight] = useState(29);
  const ROW_HEIGHT = rowHeight;
  const bodyRef = useRef(null);
  const OVERSCAN = 8;
  const scrollRef = useRef(null);
  const pendingFocus = useRef(null);
  const [viewport, setViewport] = useState({ top: 0, height: 600 });
  const [focusedRow, setFocusedRow] = useState(null);
  const rowCount = data?.length ?? 0;
  const hasData = rowCount > 0 && columns?.length > 0;

  const tableRef = useRef(null);
const [focusedColumn, setFocusedColumn] = useState(null);
const [columnLayout, setColumnLayout] = useState(null);
const [columnRange, setColumnRange] = useState({
  start: 0,
  end: 0,
});

const widthsReady = columnLayout?.columns === columns;

useLayoutEffect(() => {
  if (!hasData || !tableRef.current) return;

  const widths = Array.from(
    tableRef.current.tHead.rows[0].cells,
    (cell) => cell.getBoundingClientRect().width
  );

  if (
    widths.length === columns.length &&
    widths.every((width) => width > 0)
  ) {
    setColumnLayout({ columns, widths });
  }
}, [columns, hasData]);

useLayoutEffect(() => {
  if (!widthsReady || !tableRef.current) return;

  const table = tableRef.current;
  let frame = 0;

  const measure = () => {
    let left = 0;
    let right = window.innerWidth;

    for (
      let parent = table.parentElement;
      parent;
      parent = parent.parentElement
    ) {
      if (
        /(auto|scroll|hidden|clip)/.test(
          getComputedStyle(parent).overflowX
        )
      ) {
        const rect = parent.getBoundingClientRect();

        left = Math.max(left, rect.left + parent.clientLeft);
        right = Math.min(
          right,
          rect.left + parent.clientLeft + parent.clientWidth
        );
      }
    }

    const visible = Array.from(table.tHead.rows[0].cells)
      .map((cell, index) => ({
        index,
        rect: cell.getBoundingClientRect(),
      }))
      .filter(({ rect }) => rect.right > left && rect.left < right);

    const next = visible.length
      ? {
          start: Math.max(0, visible[0].index - 2),
          end: Math.min(
            columns.length,
            visible[visible.length - 1].index + 3
          ),
        }
      : {
          start: 0,
          end: Math.min(columns.length, 1),
        };

    setColumnRange((previous) =>
      previous.start === next.start && previous.end === next.end
        ? previous
        : next
    );
  };

  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(measure);
  };

  measure();

  const observer = new ResizeObserver(schedule);
  observer.observe(table);

  if (table.parentElement) {
    observer.observe(table.parentElement);
  }

  window.addEventListener("scroll", schedule, true);
  window.addEventListener("resize", schedule);

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    window.removeEventListener("scroll", schedule, true);
    window.removeEventListener("resize", schedule);
  };
}, [widthsReady, columns]);

const visibleColumns = widthsReady
  ? Array.from(
      {
        length: Math.max(
          0,
          Math.min(columns.length, columnRange.end) -
            columnRange.start
        ),
      },
      (_, index) => columnRange.start + index
    )
  : columns.map((_, index) => index);

if (
  focusedColumn !== null &&
  focusedColumn < columns.length &&
  !visibleColumns.includes(focusedColumn)
) {
  visibleColumns.push(focusedColumn);
  visibleColumns.sort((a, b) => a - b);
}
  useLayoutEffect(() => {
    const element = scrollRef.current;
    const body = bodyRef.current;
    if (!element || !body) return;
    let frame = 0;
    const measure = () => {
      const row = body.querySelector("tr[data-table-row]");
      const measuredHeight = row?.getBoundingClientRect().height;
      if (measuredHeight > 0) setRowHeight(measuredHeight);
      // Use the existing scrolling ancestor (or page), without adding a new viewport.
      let top = 0;
      let bottom = window.innerHeight;
      for (let parent = body.parentElement; parent; parent = parent.parentElement) {
        const style = getComputedStyle(parent);
        if (/(auto|scroll|hidden|clip)/.test(style.overflowY)) {
          const rect = parent.getBoundingClientRect();
          top = Math.max(top, rect.top + parent.clientTop);
          bottom = Math.min(bottom, rect.top + parent.clientTop + parent.clientHeight);
        }
      }
      const bodyTop = body.getBoundingClientRect().top;
      const next = { top: Math.max(0, top - bodyTop),
        height: Math.max(0, bottom - Math.max(top, bodyTop)) };
      setViewport(previous => previous.top === next.top && previous.height === next.height
        ? previous : next);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    const row = body.querySelector("tr[data-table-row]");
    if (row) observer.observe(row);
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
    };
  }, [hasData, columns, rowCount]);

  const start = Math.min(
    Math.max(0, rowCount - 1),
    Math.max(0, Math.floor(viewport.top / ROW_HEIGHT) - OVERSCAN)
  );
  const end = Math.min(rowCount,
    start + Math.ceil(viewport.height / ROW_HEIGHT) + OVERSCAN * 2
  );
const visibleIndices = Array.from(
  {
    length: widthsReady
      ? end - start
      : Math.min(1, end - start),
  },
  (_, index) => start + index
);
if (
  focusedRow !== null &&
  focusedRow < rowCount &&
  !visibleIndices.includes(focusedRow)
) {
  visibleIndices.push(focusedRow);
  visibleIndices.sort((a, b) => a - b);
}
  useLayoutEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    const input = scrollRef.current?.querySelector(
      `[data-row="${target.row}"][data-column="${target.column}"]`
    );
    if (input) {
      input.scrollIntoView({ block: "nearest", inline: "nearest" });
      input.focus({ preventScroll: true });
      pendingFocus.current = null;
    }
  });

  const handleCellKeyDown = (event, row, column) => {
    if (event.key !== "Tab") return;
    const next = row * columns.length + column + (event.shiftKey ? -1 : 1);
    if (next < 0 || next >= rowCount * columns.length) return;
    event.preventDefault();
    const targetRow = Math.floor(next / columns.length);
    pendingFocus.current = { row: targetRow, column: next % columns.length };
    setFocusedRow(targetRow);
    setFocusedColumn(next % columns.length);
  };
  const [editingColumn, setEditingColumn] = useState(null);
  const [newColumnName, setNewColumnName] = useState("");
  const [columnError, setColumnError] = useState("");
  const [newColumnCreated, setNewColumnCreated] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [contextMenu, setContextMenu] =
  useState({
    visible: false,
    x: 0,
    y: 0,
    column: null
  });
  const addColumn = () => {
    const tempName = `__new_${Date.now()}__`;

    setData((prev) =>
    prev.map((row) => ({
      ...row,
      [tempName]: ""
    }))
    );

    setColumns((prev) => [...prev, tempName]);

    setEditingColumn(tempName);
    setNewColumnName("");

    setNewColumnCreated(true);
  };


  const createColumn = async (columnName) => {
    return apiRequest("/data/columns/add", {
      method: "POST",
      body: JSON.stringify({
        dataset_id: datasetId,
        columnName,
        defaultValue: ""
      })
    });
  };


  const renameColumn = async (oldName, newName) => {
    newName = newName.trim();
    if (oldName === newName) {
      setColumnError("");
      setEditingColumn(null);
      return;
    }
    if (!newName) {
      setColumnError("Column name is required");
      return;
    }

    if (
    columns.includes(newName) &&
    oldName !== newName)
    {
      setColumnError("Column already exists");
      return;
    }

    try {
      if (newColumnCreated) {
        await createColumn(newName);

        const updated = data.map((row) => {
          const newRow = { ...row };

          newRow[newName] = newRow[oldName];
          delete newRow[oldName];

          return newRow;
        });

        setData(updated);

        setColumns((prev) =>
        prev.map((col) =>
        col === oldName ? newName : col
        )
        );

        setNewColumnCreated(false);
      } else {
        await apiRequest(
          "/data/columns/rename",
          {
            method: "PUT",
            body: JSON.stringify({
              dataset_id: datasetId,
              oldName,
              newName
            })
          }
        );

        const updated = data.map((row) => {
          const newRow = { ...row };

          newRow[newName] =
          newRow[oldName];

          delete newRow[oldName];

          return newRow;
        });

        setData(updated);

        setColumns((prev) =>
        prev.map((col) =>
        col === oldName ?
        newName :
        col
        )
        );
      }

      setColumnError("");
      setEditingColumn(null);

    } catch (err) {
      console.error(err);
      setColumnError(err.message);
    }
  };

  const deleteColumn = useCallback(
    async (columnName) => {
      try {
        await apiRequest(
          "/data/columns/delete",
          {
            method: "DELETE",

            body: JSON.stringify({
              dataset_id:
              datasetId,

              columnName
            })
          }
        );

        setData((previous) =>
        previous.map((row) => {
          const nextRow = {
            ...row
          };

          delete nextRow[
          columnName];


          return nextRow;
        })
        );

        setColumns((previous) =>
        previous.filter(
          (column) =>
          column !==
          columnName
        )
        );

        setSelectedColumn(null);

      } catch (err) {
        console.error(
          "Failed to delete column:",
          err
        );
      }
    },
    [
    datasetId,
    setData,
    setColumns]

  );

const handleCellChange = useCallback(
  (rowIndex, columnName, value) => {
    setData((previous) => {
      const currentRow = previous[rowIndex];

      if (!currentRow || currentRow[columnName] === value) {
        return previous;
      }

      const next = [...previous];

      next[rowIndex] = {
        ...currentRow,
        [columnName]: value,
      };

      return next;
    });
  },
  [setData]
);

const handleCellFocus = useCallback((rowIndex, columnIndex) => {
  setFocusedRow(rowIndex);
  setFocusedColumn(columnIndex);
}, []);

  const handleDragStart = (e, col) => {
    e.dataTransfer.setData("col", col);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDrop = async (event) => {
    event.preventDefault();

    if (isUploadingFile) {
      return;
    }

    const file =
    event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    if (typeof handleDataFile !== "function") {
      console.error(
        "DataTable requires handleDataFile."
      );
      return;
    }

    try {
      await handleDataFile(file);
    } catch (error) {
      console.error(
        "File upload failed:",
        error
      );
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target instanceof HTMLElement &&
          (e.target.closest("input, textarea, select") || e.target.isContentEditable)) {
        return;
      }

      if (
      e.key === "Delete" &&
      selectedColumn)
      {
        deleteColumn(selectedColumn);
      }

      if (
      e.ctrlKey &&
      e.key.toLowerCase() === "x" &&
      selectedColumn)
      {
        e.preventDefault();

        deleteColumn(selectedColumn);
      }
      if (
      e.key === "F2" &&
      selectedColumn)
      {
        setEditingColumn(selectedColumn);
        setNewColumnName(selectedColumn);
      }

    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
    window.removeEventListener(
      "keydown",
      handleKeyDown
    );

  }, [
  selectedColumn,
  deleteColumn]
  );

  useEffect(() => {
    const closeMenu = () =>
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      column: null
    });
    window.addEventListener(
      "click",
      closeMenu
    );

    return () =>
    window.removeEventListener(
      "click",
      closeMenu
    );

  }, []);

  if (!data || data.length === 0 || !columns?.length) {
    return (
      <DropUpload
        handleDataFile={handleDataFile}
        isUploadingFile={isUploadingFile} />);


  }
  return (
    <div
      ref={scrollRef}
      onBlurCapture={(event) => {
        if (
          !event.currentTarget.contains(event.relatedTarget) ||
          !event.relatedTarget?.hasAttribute("data-row")
        ) {
          setFocusedRow(null);
          setFocusedColumn(null);
        }
      }}
      className="
      app-surface
      app-text
      w-full
      overflow-auto
      p-4
    "






      onDrop={handleDrop}
      onDragOver={handleDragOver}>
      
<table
  ref={tableRef}
  className="app-border w-full border text-sm"
  aria-rowcount={rowCount + 1}
  style={
    widthsReady
      ? {
          tableLayout: "fixed",
          width: columnLayout.widths.reduce(
            (sum, width) => sum + width,
            0
          ),
        }
      : undefined
  }
>
  {widthsReady && (
    <colgroup>
      {columns.map((col, index) => (
        <col
          key={col}
          style={{ width: columnLayout.widths[index] }}
        />
      ))}
    </colgroup>
  )}

  <thead>
    <tr>
      {columns.map((col) => (
        <th
          key={col}
          draggable
          onClick={() => setSelectedColumn(col)}
          onDoubleClick={() => {
            setEditingColumn(col);
            setNewColumnName(col);
          }}
          onDragStart={(event) => handleDragStart(event, col)}
          onContextMenu={(event) => {
            event.preventDefault();
            setSelectedColumn(col);

            setContextMenu({
              visible: true,
              x: event.clientX,
              y: event.clientY,
              column: col,
            });
          }}
          className={`
            app-border
            cursor-pointer
            border
            px-2
            py-1
            transition-colors
            ${
              selectedColumn === col
                ? "bg-blue-600 text-white"
                : "app-surface app-text hover:bg-black/5 dark:hover:bg-white/10"
            }
          `}
        >
          {editingColumn === col ? (
            <input
              autoFocus
              placeholder="Column name"
              value={newColumnName}
              onChange={(event) =>
                setNewColumnName(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  renameColumn(col, newColumnName);
                }

                if (event.key === "Escape") {
                  if (newColumnCreated) {
                    setData((previous) =>
                      previous.map((row) => {
                        const copy = { ...row };
                        delete copy[col];
                        return copy;
                      })
                    );

                    setColumns((previous) =>
                      previous.filter((column) => column !== col)
                    );

                    setNewColumnCreated(false);
                  }

                  setEditingColumn(null);
                  setColumnError("");
                }
              }}
              className="app-input app-text w-full px-1"
            />
          ) : col.startsWith("__new_") ? (
            ""
          ) : (
            col
          )}
        </th>
      ))}
    </tr>
  </thead>

  <tbody ref={bodyRef}>
    {visibleIndices.flatMap((rowIndex, position) => {
      const previousIndex =
        position === 0 ? -1 : visibleIndices[position - 1];

      const rowGap = rowIndex - previousIndex - 1;
      const row = data[rowIndex];

      return [
        rowGap > 0 && (
          <tr key={`row-gap-${rowIndex}`} aria-hidden="true">
            <td
              colSpan={columns.length}
              style={{
                height: rowGap * ROW_HEIGHT,
                padding: 0,
                border: 0,
              }}
            />
          </tr>
        ),

        <tr
          key={rowIndex}
          data-table-row
          aria-rowindex={rowIndex + 2}
        >
          {visibleColumns.flatMap((columnIndex, columnPosition) => {
            const col = columns[columnIndex];

            const previousColumn =
              columnPosition === 0
                ? -1
                : visibleColumns[columnPosition - 1];

            const columnGap = columnIndex - previousColumn - 1;

            return [
              columnGap > 0 && (
                <td
                  key={`column-gap-${columnIndex}`}
                  colSpan={columnGap}
                  aria-hidden="true"
                  style={{ padding: 0, border: 0 }}
                />
              ),

              <td
                key={col}
                className="app-border border px-2 py-1"
              >
                <EditableCell
                  value={row[col]}
                  rowIndex={rowIndex}
                  columnIndex={columnIndex}
                  columnName={col}
                  onCommit={handleCellChange}
                  onCellFocus={handleCellFocus}
                  onCellKeyDown={handleCellKeyDown}
                />
              </td>,
            ];
          })}

          {(visibleColumns[visibleColumns.length - 1] ?? -1) <
            columns.length - 1 && (
            <td
              colSpan={
                columns.length -
                1 -
                (visibleColumns[visibleColumns.length - 1] ?? -1)
              }
              aria-hidden="true"
              style={{ padding: 0, border: 0 }}
            />
          )}
        </tr>,
      ];
    })}

    {visibleIndices[visibleIndices.length - 1] < rowCount - 1 && (
      <tr aria-hidden="true">
        <td
          colSpan={columns.length}
          style={{
            height:
              (rowCount -
                1 -
                visibleIndices[visibleIndices.length - 1]) *
              ROW_HEIGHT,
            padding: 0,
            border: 0,
          }}
        />
      </tr>
    )}
  </tbody>
</table>
      {columnError &&
      <div className="text-red-500 text-sm mt-2">
          {columnError}
        </div>
      }
      {contextMenu.visible &&
      <div
        className="
          app-surface
          app-border
          app-text
          fixed
          z-50
          rounded
          border
          shadow-lg
        "









        style={{
          left: contextMenu.x,
          top: contextMenu.y
        }}>
        
        <button
          className="
            block
            w-full
            px-4
            py-2
            text-left
            hover:bg-red-500/10
          "







          onClick={() => {
            deleteColumn(contextMenu.column);

            setContextMenu({
              visible: false
            });
          }}>
          
          Delete Column
        </button>

        <button
          className="
            block
            w-full
            px-4
            py-2
            text-left
            hover:bg-black/5
            dark:hover:bg-white/10
          "








          onClick={() => {
            setEditingColumn(contextMenu.column);
            setNewColumnName(contextMenu.column);

            setContextMenu({
              visible: false
            });
          }}>
          
          Rename Column
        </button>
        <button
          className="
          block
          w-full
          px-4
          py-2
          text-left
          hover:bg-green-500/10
        "







          onClick={() => {
            addColumn();
            setContextMenu({
              visible: false,
              x: 0,
              y: 0,
              column: null
            });
          }}>
          
          Add Column
        </button>
      </div>
      }
    </div>);

}

export default DataTable;