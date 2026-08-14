// src/components/annotations/AnnotationShape.jsx

function AnnotationShape({
  annotation,
  selected = false,
  interactive = false,
  onSelect,
  onDragStart,
}) {
  const markerType =
    annotation.markerType ??
    "dot";

  if (markerType === "none") {
    return null;
  }

  const handleMouseDown = (
    event,
  ) => {
    if (!interactive) {
      return;
    }

    onDragStart?.(
      event,
      "target",
      annotation.id,
      annotation,
    );
  };

  const handleClick = (
    event,
  ) => {
    if (!interactive) {
      return;
    }

    event.stopPropagation();

    onSelect?.(
      annotation.id,
    );
  };

  const sizeStyle = {
    left:
      `${annotation.x ?? 0}%`,

    top:
      `${annotation.y ?? 0}%`,

    width:
      markerType === "dot"
        ? `${
            (Number(
              annotation.radius,
            ) || 6) * 2.5
          }px`
        : `${
            Number(
              annotation.width,
            ) || 15
          }%`,

    height:
      markerType === "dot"
        ? `${
            (Number(
              annotation.radius,
            ) || 6) * 2.5
          }px`
        : markerType ===
            "circle"
          ? "auto"
          : `${
              Number(
                annotation.height,
              ) || 15
            }%`,

    aspectRatio:
      markerType === "circle"
        ? "1 / 1"
        : "auto",

    transform:
      markerType === "dot"
        ? "translate(-50%, -50%)"
        : "none",
  };

  const fillColor =
    annotation.fillColor ||
    "#3b82f6";

  return (
    <div
      className={`
        absolute
        ${
          interactive
            ? "pointer-events-auto"
            : "pointer-events-none"
        }
        ${
          selected
            ? "z-40"
            : "z-30"
        }
      `}
      style={sizeStyle}
    >
      {/* =================== */}
      {/* DOT */}
      {/* =================== */}

      {markerType === "dot" && (
        <div
          onMouseDown={
            handleMouseDown
          }
          onClick={handleClick}
          className={`
            h-full
            w-full
            rounded-full
            border
            border-white
            shadow-md
            ${
              interactive
                ? "cursor-move"
                : ""
            }
            ${
              selected
                ? "ring-4 ring-blue-500/20"
                : ""
            }
          `}
          style={{
            backgroundColor:
              fillColor,
          }}
        />
      )}

      {/* =================== */}
      {/* CIRCLE */}
      {/* =================== */}

      {markerType ===
        "circle" && (
        <div
          onMouseDown={
            handleMouseDown
          }
          onClick={handleClick}
          className={`
            relative
            h-full
            w-full
            rounded-full
            border-2
            border-dashed
            ${
              interactive
                ? "cursor-move"
                : ""
            }
            ${
              selected
                ? "border-solid shadow-sm"
                : ""
            }
          `}
          style={{
            borderColor:
              fillColor,

            backgroundColor:
              `${fillColor}08`,
          }}
        />
      )}

      {/* =================== */}
      {/* SQUARE */}
      {/* =================== */}

      {markerType ===
        "square" && (
        <div
          onMouseDown={
            handleMouseDown
          }
          onClick={handleClick}
          className={`
            relative
            h-full
            w-full
            rounded-lg
            border-2
            border-dashed
            ${
              interactive
                ? "cursor-move"
                : ""
            }
            ${
              selected
                ? "border-solid shadow-sm"
                : ""
            }
          `}
          style={{
            borderColor:
              fillColor,

            backgroundColor:
              `${fillColor}05`,
          }}
        />
      )}

      {/* =================== */}
      {/* RESIZE HANDLE */}
      {/* =================== */}

      {interactive &&
        selected &&
        markerType !==
          "dot" && (
          <button
            type="button"
            aria-label="Resize annotation"
            title="Resize annotation"
            onMouseDown={(
              event,
            ) =>
              onDragStart?.(
                event,
                "resize",
                annotation.id,
                annotation,
              )
            }
            className="
              absolute
              bottom-0
              right-0
              z-50
              h-3.5
              w-3.5
              translate-x-1/2
              translate-y-1/2
              cursor-se-resize
              rounded-full
              border-2
              border-[rgb(var(--color-surface))]
              bg-[rgb(var(--color-primary))]
              shadow-md
            "
          />
        )}
    </div>
  );
}

export default AnnotationShape;