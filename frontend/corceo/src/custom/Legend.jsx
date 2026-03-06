// VirtualLegend.jsx
import { useState, useMemo } from "react";
import { FixedSizeList as List } from "react-window";

function VirtualLegend({ chartData, setChartData, height = 400, width = 300, rowHeight = 30 }) {
  const [openGroups, setOpenGroups] = useState({});

  const groups = useMemo(() => {
    const g = {};
    chartData.datasets.forEach((ds, index) => {
      if (!g[ds.group]) g[ds.group] = [];
      g[ds.group].push({ ...ds, index });
    });
    return g;
  }, [chartData.datasets]);

  const flatItems = useMemo(() => {
    const items = [];
    Object.keys(groups).forEach(group => {
      const groupItems = groups[group];
      const hasSubsections = groupItems.length > 1;
      const isGroupHidden = groupItems.every(ds => ds.hidden);

      items.push({
        type: "group",
        group,
        hasSubsections,
        isGroupHidden,
        items: groupItems
      });

      if (hasSubsections && openGroups[group]) {
        groupItems.forEach(ds => {
          items.push({
            type: "dataset",
            ds
          });
        });
      }
    });
    return items;
  }, [groups, openGroups]);

  const Row = ({ index, style }) => {
    const item = flatItems[index];

    if (item.type === "group") {
      const { group, hasSubsections, isGroupHidden } = item;

      return (
        <div
          style={{
            ...style,
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer"
          }}
        >
          {hasSubsections && (
            <span
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
                background: item.items[0].backgroundColor,
                opacity: item.items[0].hidden ? 0.5 : 1
              }}
            />
          )}

          {/* Group label */}
          <span
            style={{
              fontWeight: "bold",
              textDecoration: isGroupHidden ? "line-through" : "none",
              opacity: isGroupHidden ? 0.5 : 1,
              flexGrow: 1
            }}
            onClick={() => {
              const groupItems = item.items;
              const shouldHide = groupItems.some(ds => !ds.hidden);
              setChartData(prev => ({
                ...prev,
                datasets: prev.datasets.map(ds =>
                  ds.group === group ? { ...ds, hidden: shouldHide } : ds
                )
              }));
            }}
          >
            {group}
          </span>
        </div>
      );
    }

    if (item.type === "dataset") {
      const { ds } = item;
      return (
        <div
          style={{
            ...style,
            marginLeft: 20,
            display: "flex",
            alignItems: "center",
            gap: 6,
            textDecoration: ds.hidden ? "line-through" : "none",
            opacity: ds.hidden ? 0.5 : 1
          }}
          onClick={() => {
            setChartData(prev => ({
              ...prev,
              datasets: prev.datasets.map((d, i) =>
                i === ds.index ? { ...d, hidden: !d.hidden } : d
              )
            }));
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
      );
    }

    return null;
  };

  return (
    <List
      height={height} 
      itemCount={flatItems.length}
      itemSize={rowHeight} 
      width={width} 
    >
      {Row}
    </List>
  );
}

export default VirtualLegend;