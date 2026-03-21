import { useState, useMemo } from "react";

function Legend({ chartData, setChartData }) {
  const [openGroups, setOpenGroups] = useState({});

  const isPieOrDoughnut = chartData.datasets.length === 1 && Array.isArray(chartData.datasets[0].data) && chartData.labels;

  // Flatten items differently for Bar vs Doughnut
  const items = useMemo(() => {
    if (isPieOrDoughnut) {
      const ds = chartData.datasets[0];
      return chartData.labels.map((label, index) => ({
        type: "slice",
        label,
        color: ds.backgroundColor[index],
        index,
        hidden: ds.hiddenSlices?.[index] || false
      }));
    } else {
      const groups = {};
      chartData.datasets.forEach((ds, index) => {
        if (!groups[ds.group]) groups[ds.group] = [];
        groups[ds.group].push({ ...ds, index });
      });
      return Object.keys(groups).map(group => ({
        type: "group",
        group,
        items: groups[group],
        hasSubsections: groups[group].length > 1
      }));
    }
  }, [chartData, isPieOrDoughnut]);

  // Toggle functions
  const toggleSlice = (index) => {
    setChartData(prev => {
      const ds = prev.datasets[0];
      const hiddenSlices = ds.hiddenSlices ? [...ds.hiddenSlices] : ds.data.map(() => false);
      hiddenSlices[index] = !hiddenSlices[index];
      return {
        ...prev,
        datasets: [
          {
            ...ds,
            hiddenSlices
          }
        ]
      };
    });
  };

  const toggleDataset = (index) => {
    setChartData(prev => {
      const newDatasets = prev.datasets.map((ds, i) =>
        i === index ? { ...ds, hidden: !ds.hidden } : ds
      );
      return { ...prev, datasets: newDatasets };
    });
  };

  const toggleGroup = (groupName) => {
    setChartData(prev => {
      const groupDatasets = prev.datasets.filter(ds => ds.group === groupName);
      const shouldHide = groupDatasets.some(ds => !ds.hidden);

      const newDatasets = prev.datasets.map(ds =>
        ds.group === groupName ? { ...ds, hidden: shouldHide } : ds
      );

      return { ...prev, datasets: newDatasets };
    });
  };

  return (
    <div>
      {isPieOrDoughnut
        ? // Doughnut/Pie slices
        items.map(item => (
            <div
              key={item.label}
              onClick={() => toggleSlice(item.index)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                textDecoration: item.hidden ? "line-through" : "none",
                opacity: item.hidden ? 0.5 : 1
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: item.color,
                  opacity: item.hidden ? 0.5 : 1
                }}
              />
              {item.label}
            </div>
          ))
        : // Bar/Line grouped datasets
        items.map(groupItem => {
            const { group, items: datasets, hasSubsections } = groupItem;
            const isGroupHidden = datasets.every(ds => ds.hidden);
            return (
              <div key={group}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {hasSubsections && (
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }))
                      }
                    >
                      {openGroups[group] ? "▼" : "▶"}
                    </span>
                  )}

                  {!hasSubsections && (
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: datasets[0].backgroundColor,
                        opacity: datasets[0].hidden ? 0.5 : 1
                      }}
                    />
                  )}

                  <span
                    style={{
                      fontWeight: "bold",
                      cursor: "pointer",
                      textDecoration: isGroupHidden ? "line-through" : "none",
                      opacity: isGroupHidden ? 0.5 : 1
                    }}
                    onClick={() => toggleGroup(group)}
                  >
                    {group}
                  </span>
                </div>

                {hasSubsections &&
                  openGroups[group] &&
                  datasets.map(ds => (
                    <div
                      key={ds.label}
                      onClick={() => toggleDataset(ds.index)}
                      style={{
                        marginLeft: 20,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        cursor: "pointer",
                        textDecoration: ds.hidden ? "line-through" : "none",
                        opacity: ds.hidden ? 0.5 : 1
                      }}
                    >
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: ds.backgroundColor,
                          opacity: ds.hidden ? 0.5 : 1
                        }}
                      />
                      {ds.label}
                    </div>
                  ))}
              </div>
            );
          })}
    </div>
  );
}

export default Legend;