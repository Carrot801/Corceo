// src/components/annotations/AnnotationConnector.jsx

function getConnectorEnd(
  annotation,
  width,
  height,
  startX,
  startY,
) {
  let endX =
    (Number(annotation.x ?? 0) / 100) *
    width;

  let endY =
    (Number(annotation.y ?? 0) / 100) *
    height;

  const markerType =
    annotation.markerType ?? "dot";

  // =========================
  // CIRCLE / SQUARE
  // =========================
  if (
    markerType === "circle" ||
    markerType === "square"
  ) {
    const boxWidth =
      ((Number(annotation.width) || 15) /
        100) *
      width;

    const boxHeight =
      markerType === "circle"
        ? boxWidth
        : ((Number(annotation.height) ||
            15) /
            100) *
          height;

    const centerX =
      endX + boxWidth / 2;

    const centerY =
      endY + boxHeight / 2;

    const dx =
      centerX - startX;

    const dy =
      centerY - startY;

    const distance =
      Math.hypot(dx, dy) || 1;

    let edgeOffset =
      boxWidth / 2;

    if (
      markerType === "square"
    ) {
      const absCos =
        Math.abs(
          dx / distance,
        );

      const absSin =
        Math.abs(
          dy / distance,
        );

      if (
        boxWidth * absSin <=
        boxHeight * absCos
      ) {
        edgeOffset =
          (boxWidth / 2) /
          (absCos || 1);
      } else {
        edgeOffset =
          (boxHeight / 2) /
          (absSin || 1);
      }
    }

    endX =
      centerX -
      (dx / distance) *
        edgeOffset;

    endY =
      centerY -
      (dy / distance) *
        edgeOffset;
  }

  // =========================
  // DOT
  // =========================
  if (markerType === "dot") {
    const radiusPx =
      (Number(annotation.radius) ||
        6) *
      1.25;

    const dx =
      endX - startX;

    const dy =
      endY - startY;

    const distance =
      Math.hypot(dx, dy) || 1;

    endX -=
      (dx / distance) *
      (radiusPx + 3);

    endY -=
      (dy / distance) *
      (radiusPx + 3);
  }

  return {
    endX,
    endY,
  };
}

function AnnotationConnector({
  annotation,
  width,
  height,
  markerId,
}) {
  if (
    !width ||
    !height ||
    annotation.connectorType ===
      "none"
  ) {
    return null;
  }

  const startX =
    (Number(
      annotation.textX ?? 0,
    ) /
      100) *
    width;

  const startY =
    (Number(
      annotation.textY ?? 0,
    ) /
      100) *
    height;

  const {
    endX,
    endY,
  } = getConnectorEnd(
    annotation,
    width,
    height,
    startX,
    startY,
  );

  const stroke =
    annotation.lineColor ||
    "#64748b";

  const strokeWidth =
    Number(
      annotation.lineWidth,
    ) || 1.5;

  const markerEnd =
    `url(#${markerId})`;

  // =========================
  // STRAIGHT
  // =========================
  if (
    annotation.connectorType ===
    "straight"
  ) {
    return (
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke={stroke}
        strokeWidth={strokeWidth}
        markerEnd={markerEnd}
      />
    );
  }

  // =========================
  // CURVED
  // =========================
  if (
    annotation.connectorType ===
    "curved"
  ) {
    const dx =
      endX - startX;

    const dy =
      endY - startY;

    const distance =
      Math.hypot(dx, dy) || 1;

    const bendFactor = 0.2;

    const controlX =
      (startX + endX) / 2 -
      (dy / distance) *
        (distance *
          bendFactor);

    const controlY =
      (startY + endY) / 2 +
      (dx / distance) *
        (distance *
          bendFactor);

    return (
      <path
        d={`
          M ${startX} ${startY}
          Q ${controlX} ${controlY}
            ${endX} ${endY}
        `}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        markerEnd={markerEnd}
      />
    );
  }

  // =========================
  // ANGLED
  // =========================
  if (
    annotation.connectorType ===
    "angled"
  ) {
    return (
      <path
        d={`
          M ${startX} ${startY}
          L ${endX} ${startY}
          L ${endX} ${endY}
        `}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        markerEnd={markerEnd}
      />
    );
  }

  return null;
}

export default AnnotationConnector;