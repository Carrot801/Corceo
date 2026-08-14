AnnotationLabel.jsx// src/components/annotations/AnnotationLabel.jsx

function AnnotationLabel({
  annotation,
  selected = false,
  interactive = false,
  onSelect,
  onDragStart,
}) {
  const handleMouseDown = (
    event,
  ) => {
    if (!interactive) {
      return;
    }

    onDragStart?.(
      event,
      "label",
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

  return (
    <div
      onMouseDown={
        handleMouseDown
      }
      onClick={handleClick}
      className={`
        absolute
        rounded
        ${
          interactive
            ? "pointer-events-auto cursor-move"
            : "pointer-events-none"
        }
        ${
          selected
            ? "z-50 ring-2 ring-blue-500 shadow-lg"
            : "z-40"
        }
      `}
      style={{
        left:
          `${
            annotation.textX ??
            0
          }%`,

        top:
          `${
            annotation.textY ??
            0
          }%`,

        transform:
          "translate(-50%, -50%)",

        maxWidth:
          `${
            annotation.labelWidth ||
            12
          }rem`,

        padding:
          "6px 9px",

        fontSize:
          `${
            annotation.textSize ||
            0.85
          }rem`,

        color:
          annotation.textColor ||
          "#1e293b",

        fontWeight:
          annotation.fontWeight ||
          "normal",

        textAlign:
          annotation.textAlign ||
          "left",

        backgroundColor:
          annotation.textBg ===
          "transparent"
            ? "transparent"
            : annotation.textBg ||
              "#ffffff",

        border:
          annotation.textBg ===
          "outline"
            ? `1px solid ${
                annotation.textColor ||
                "#1e293b"
              }40`
            : selected &&
                interactive
              ? "1px solid #3b82f6"
              : "none",
      }}
    >
      <div className="break-words leading-snug">
        {annotation.text ||
          "Comment text..."}
      </div>
    </div>
  );
}

export default AnnotationLabel;