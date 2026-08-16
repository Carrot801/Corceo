import React, { useState } from "react";

function FieldsPanel({
  columns = [],
  setColumns,
  data = [],
  setData,
  onDragStart,
  types = {},
  isUsed,
  setChartConfig,
}) {
  const [searchField, setSearchField] = useState("");
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    col: null,
  });

  const filteredColumns = columns.filter((col) =>
    col.toLowerCase().includes(searchField.toLowerCase())
  );

  const selectedCol = contextMenu.col;
  const selectedType = types[selectedCol];

  const closeMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, col: null });
  };

  const addDerivedField = (fieldName, valueGetter) => {
    if (!fieldName || columns.includes(fieldName)) return fieldName;

    setColumns((prev) => [...prev, fieldName]);

    setData((prev) =>
      prev.map((row) => ({
        ...row,
        [fieldName]: valueGetter(row),
      }))
    );

    return fieldName;
  };
const createDateHierarchy = (field) => {
  const newFields = [
    `${field}_Year`,
    `${field}_Quarter`,
    `${field}_Month`,
  ];

  setColumns((prev) => [...new Set([...prev, ...newFields])]);

  setData((prevData) =>
    prevData.map((row) => {
      const date = new Date(row[field]);
      if (isNaN(date)) return row;

      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const quarter = `Q${Math.floor((month - 1) / 3) + 1}`;

      return {
        ...row,
        [`${field}_Year`]: String(year),
        [`${field}_Quarter`]: `${year} ${quarter}`,
        [`${field}_Month`]: `${year}-${String(month).padStart(2, "0")}`,
      };
    })
  );

  setChartConfig((prev) => ({
    ...prev,
    x: `${field}_Month`,
    xHierarchy: newFields,
    dateHierarchySource: field,
    sort: "asc",
    sortBy: `${field}_Month`,
    timeGroupBy: "hierarchy",
  }));

  closeMenu();
};

const applyField = (fieldName, configUpdates) => {
  setChartConfig((prev) => ({
    ...prev,
    ...configUpdates(fieldName),
  }));

  closeMenu();
};

  const createDateField = (mode) => {
    const name = `${selectedCol}_${mode}`;

    const fieldName = addDerivedField(name, (row) => {
      const date = new Date(row[selectedCol]);
      if (isNaN(date)) return "";

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      const start5 = Math.floor(year / 5) * 5;

      if (mode === "Month") return `${year}-${month}`;
      if (mode === "Quarter") return `${year} Q${quarter}`;
      if (mode === "Year") return `${year}`;
      if (mode === "5Y") return `${start5}-${start5 + 4}`;
      if (mode === "Time") return `${year}-${month}`;

      return row[selectedCol];
    });

    applyField(fieldName, (f) => ({
      x: f,
      dateHierarchySource: selectedCol,
      xHierarchy: [
        `${selectedCol}_Year`,
        `${selectedCol}_Quarter`,
        `${selectedCol}_Month`,
      ],
      timeGroupBy: "hierarchy",
      sortBy: f,
      sort: "asc",
    }));
  };
const createNumberField = (mode) => {
  if (mode === "Sum" || mode === "Average") {
    setChartConfig((prev) => ({
      ...prev,
      y: [selectedCol],
      aggregation: mode === "Sum" ? "sum" : "avg",
    }));

    closeMenu();
    return;
  }

  if (mode === "Count") {
    const fieldName = addDerivedField("Count_Rows", () => 1);

    setChartConfig((prev) => ({
      ...prev,
      y: [fieldName],
      aggregation: "sum",
    }));

    closeMenu();
  }
};

  const createTextField = (mode) => {
    const name = `${selectedCol}_${mode}`;

    let topValues = [];

    if (mode === "GroupedOther") {
      const counts = {};
      data.forEach((row) => {
        const value = row[selectedCol];
        if (!value) return;
        counts[value] = (counts[value] || 0) + 1;
      });

      topValues = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([value]) => value);
    }

    const fieldName = addDerivedField(name, (row) => {
      const value = row[selectedCol];

      if (mode === "GroupedOther") {
        return topValues.includes(value) ? value : "Other";
      }

      return value;
    });

    applyField(fieldName, (f) => ({
      x: f,
      limit:
        mode === "Top10"
          ? 10
          : mode === "Top20"
            ? 20
            : null,
      groupSmallCategories:
        mode === "GroupedOther",
      filterField:
        mode === "Filter"
          ? f
          : null,
    }));
  };

  const getIcon = (col) => {
    if (types[col] === "number") return "123";
    if (types[col] === "date") return "📅";
    return "abc";
  };

  const handleContextMenu = (e, col) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      col,
    });
  };

  return (
    <div className="app-surface app-text w-full h-full flex flex-col">
      <div className="app-surface app-border p-3 border-b">
        <h3 className="app-text-muted text-xs font-bold uppercase tracking-wider">
          Fields
        </h3>
      </div>

      <div className="app-surface app-border p-3 border-b">
        <input
          className="app-input w-full px-2 py-1 rounded text-sm"
          placeholder="Find a field..."
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
        />
      </div>

      <div className="p-2 space-y-2 overflow-y-auto">
        {filteredColumns.map((col) => (
          <div
            key={col}
            draggable
            onDoubleClick={() => {
              if (!setChartConfig) return;

              const type = types[col];

              setChartConfig((prev) => {
                if (type === "number") {
                  return {
                    ...prev,
                    y: prev.y.includes(col) ? prev.y : [...prev.y, col],
                  };
                }

                return {
                  ...prev,
                  x: col,
                  sortBy: col,
                  sort: col.includes("_Year") ||
                        col.includes("_Quarter") ||
                        col.includes("_Month")
                    ? "asc"
                    : prev.sort,
                };
              });
            }}
            onContextMenu={(e) => handleContextMenu(e, col)}
            onDragStart={(e) => {
              e.dataTransfer.setData("col", col);
              onDragStart?.(e, col);
            }}
            className={`
              px-3 py-2 text-sm rounded-md border flex items-center justify-between
              cursor-grab hover:bg-[rgb(var(--color-surface-hover))]
              ${
                isUsed?.(col)
                  ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary-soft))] text-[rgb(var(--color-primary))]"
                  : "app-border app-text-secondary app-surface"
              }
            `}
          >
            <span>{col}</span>
            <span className="app-text-muted font-mono text-xs">
              {getIcon(col)}
            </span>
          </div>
        ))}
      </div>

      {contextMenu.visible && selectedCol && (
        <div
          className="app-menu app-card fixed border shadow-md rounded-md z-50 p-1 w-64"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={closeMenu}
        >
          <div className="app-border app-text-muted px-2 py-1 text-xs font-bold border-b mb-1">
            {selectedCol}
          </div>

          {selectedType === "date" && (
            <>
              <MenuButton
                onClick={() =>
                  applyField(
                    selectedCol,
                    (f) => ({ x: f })
                  )
                }
              >
                Add to X Axis
              </MenuButton>
              <MenuButton onClick={() => createDateHierarchy(selectedCol)}>
                Create Date Hierarchy
              </MenuButton>
              <MenuButton onClick={() => createDateField("Month")}>Group by Month</MenuButton>
              <MenuButton onClick={() => createDateField("Quarter")}>Group by Quarter</MenuButton>
              <MenuButton onClick={() => createDateField("Year")}>Group by Year</MenuButton>
              <MenuButton onClick={() => createDateField("5Y")}>Group by 5 Years</MenuButton>
              <MenuButton onClick={() => createDateField("Time")}>Create Time Series</MenuButton>
            </>
          )}

          {selectedType === "number" && (
            <>
              <MenuSection title="Use field">
                <MenuButton
                  onClick={() =>
                    applyField(
                      selectedCol,
                      (f) => ({ x: f })
                    )
                  }
                >
                  Add to X Axis
              </MenuButton>
              </MenuSection>

              <MenuSection title="Aggregation">
                <MenuButton onClick={() => createNumberField("Sum")}>
                  Sum
                </MenuButton>

                <MenuButton onClick={() => createNumberField("Average")}>
                  Average
                </MenuButton>

                <MenuButton onClick={() => createNumberField("Count")}>
                  Count rows
                </MenuButton>
              </MenuSection>
            </>
          )}

          {selectedType !== "number" && selectedType !== "date" && (
            <>
              <MenuButton
                onClick={() =>
                  applyField(
                    selectedCol,
                    (field) => ({
                      y: [field],
                    })
                  )
                }
              >
                Add to Y Axis
              </MenuButton>
              <MenuButton onClick={() => createTextField("GroupedOther")}>
                Group Small Categories into "Other"
              </MenuButton>
              <MenuButton onClick={() => createTextField("Filter")}>Filter Values</MenuButton>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MenuButton({ children, onClick }) {
  return (
    <button
      className="app-menu-item app-text-secondary block w-full text-left px-2 py-1.5 text-sm rounded"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function MenuSection({ title, children }) {
  return (
    <div className="py-1">
      <div className="app-text-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
        {title}
      </div>

      <div className="space-y-0.5">
        {children}
      </div>
    </div>
  );
}

export default FieldsPanel;