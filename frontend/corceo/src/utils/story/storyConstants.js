export function createChartItem(
  chartId,
  name,
  imageUrl,
  index = 0,
) {
  return {
    id: `chart-${crypto.randomUUID()}`,
    type: "chart",
    chartId,
    name,
    imageUrl: imageUrl || null,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    zIndex: index + 1,
  };
}

export const SLIDE_WIDTH = 1280;
export const SLIDE_HEIGHT = 720;

export function arrangeCharts(items = []) {
  const count = items.length;
  const gap = 1.5;

  if (count === 0) return [];

  if (count === 1) {
    return items.map((item, index) => ({
      ...item,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      zIndex: index + 1,
    }));
  }

  if (count === 2) {
    const width = (100 - gap) / 2;

    return items.map((item, index) => ({
      ...item,
      x: index * (width + gap),
      y: 0,
      width,
      height: 100,
      zIndex: index + 1,
    }));
  }

  if (count === 3) {
    const leftWidth = 58;
    const rightWidth =
      100 - leftWidth - gap;
    const rightHeight =
      (100 - gap) / 2;

    return items.map((item, index) =>
      index === 0
        ? {
            ...item,
            x: 0,
            y: 0,
            width: leftWidth,
            height: 100,
            zIndex: 1,
          }
        : {
            ...item,
            x: leftWidth + gap,
            y:
              (index - 1) *
              (rightHeight + gap),
            width: rightWidth,
            height: rightHeight,
            zIndex: index + 1,
          },
    );
  }

  const columns =
    count === 4
      ? 2
      : count <= 6
        ? 3
        : Math.ceil(Math.sqrt(count));

  const rows = Math.ceil(
    count / columns,
  );

  const width =
    (100 - gap * (columns - 1)) /
    columns;

  const height =
    (100 - gap * (rows - 1)) /
    rows;

  return items.map((item, index) => ({
    ...item,
    x:
      (index % columns) *
      (width + gap),
    y:
      Math.floor(index / columns) *
      (height + gap),
    width,
    height,
    zIndex: index + 1,
  }));
}

export function clampPercent(value) {
  return Math.max(
    0,
    Math.min(100, value),
  );
}

export function clampChartPosition(
  value,
  size,
) {
  return Math.max(
    0,
    Math.min(100 - size, value),
  );
}
