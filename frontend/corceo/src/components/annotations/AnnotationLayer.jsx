// src/components/annotations/AnnotationLayer.jsx

import AnnotationConnector from "./AnnotationConnector";
import AnnotationShape from "./AnnotationShape";
import AnnotationLabel from "./AnnotationLabel";

function AnnotationLayer({
  annotations = [],

  width = 0,
  height = 0,

  interactive = false,

  selectedAnnoId = null,

  onSelect,
  onDragStart,

  idPrefix = "annotation",
}) {
  const safeAnnotations =
    Array.isArray(annotations)
      ? annotations
      : [];

  return (
    <>
      {/* ========================= */}
      {/* CONNECTOR SVG LAYER */}
      {/* ========================= */}

      <svg
        className="
          pointer-events-none
          absolute
          inset-0
          z-[40]
        "
        width={width}
        height={height}
        viewBox={
          width && height
            ? `0 0 ${width} ${height}`
            : undefined
        }
        preserveAspectRatio="none"
      >
        <defs>
          {safeAnnotations.map(
            (annotation) => {
              const markerId =
                `${idPrefix}-arrow-${annotation.id}`;

              return (
                <marker
                id={markerId}
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
                >
                <path
                    d="M 0 2 L 8 5 L 0 8 z"
                    fill={
                    annotation.lineColor ||
                    "#64748b"
                    }
                />
                </marker>
              );
            },
          )}
        </defs>

        {safeAnnotations.map(
          (annotation) => (
            <AnnotationConnector
              key={`connector-${annotation.id}`}
              annotation={
                annotation
              }
              width={width}
              height={height}
              markerId={`${idPrefix}-arrow-${annotation.id}`}
            />
          ),
        )}
      </svg>

      {/* ========================= */}
      {/* DOM ANNOTATION LAYER */}
      {/* ========================= */}

      {safeAnnotations.map(
        (annotation) => {
          const selected =
            selectedAnnoId ===
            annotation.id;

          return (
            <div
              key={
                annotation.id
              }
              className="
                pointer-events-none
                absolute
                inset-0
                z-50
              "
            >
              <AnnotationShape
                annotation={
                  annotation
                }
                selected={
                  selected
                }
                interactive={
                  interactive
                }
                onSelect={
                  onSelect
                }
                onDragStart={
                  onDragStart
                }
              />

              <AnnotationLabel
                annotation={
                  annotation
                }
                selected={
                  selected
                }
                interactive={
                  interactive
                }
                onSelect={
                  onSelect
                }
                onDragStart={
                  onDragStart
                }
              />
            </div>
          );
        },
      )}
    </>
  );
}

export default AnnotationLayer;