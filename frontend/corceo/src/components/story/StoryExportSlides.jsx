import React from "react";

function StoryExportSlides({
  isExporting,
  slides = [],
  SLIDE_WIDTH,
  SLIDE_HEIGHT,
}) {
  if (!isExporting) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        left: "-10000px",
        top: 0,
        width: `${SLIDE_WIDTH}px`,
        pointerEvents: "none",
      }}
    >
      {slides.map((slide, slideIndex) => (
        <div
          key={`export-${slide.id}`}
          className="export-slide"
          style={{
            width: `${SLIDE_WIDTH}px`,
            height: `${SLIDE_HEIGHT}px`,
            padding: "48px",
            boxSizing: "border-box",

            display: "flex",
            flexDirection: "column",

            overflow: "hidden",
            backgroundColor: "#ffffff",
            color: "#0f172a",
          }}
        >
          <h1
            style={{
              height: "56px",
              flexShrink: 0,

              margin: 0,
              marginBottom: "16px",

              padding: "6px 0",

              fontFamily: "Arial, sans-serif",
              fontSize: "34px",
              fontWeight: 700,
              lineHeight: "44px",
              color: "#0f172a",

              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",

              boxSizing: "border-box",
            }}
          >
            {slide.description || `Slide ${slideIndex + 1}`}
          </h1>

          <div
            style={{
              position: "relative",

              width: "100%",
              flex: 1,
              minHeight: 0,

              overflow: "hidden",

              border: "1px solid #e2e8f0",
              borderRadius: "18px",
              backgroundColor: "#f8fafc",
            }}
          >
            {(slide.content || []).map((item, itemIndex) => (
              <div
                key={
                  item.id ||
                  `${slide.id}-${item.chartId}-${itemIndex}`
                }
                style={{
                  position: "absolute",

                  left: `${item.x ?? 0}%`,
                  top: `${item.y ?? 0}%`,
                  width: `${item.width ?? 100}%`,
                  height: `${item.height ?? 100}%`,

                  zIndex: item.zIndex ?? itemIndex + 1,

                  overflow: "hidden",
                  backgroundColor: "#ffffff",
                }}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name || "Chart"}
                    style={{
                      display: "block",
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      backgroundColor: "#ffffff",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                      backgroundColor: "#f1f5f9",
                      fontSize: "20px",
                    }}
                  >
                    Chart preview unavailable
                  </div>
                )}
              </div>
            ))}

            {/* Annotation lines */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                zIndex: 20,
                pointerEvents: "none",
              }}
            >
              {(slide.annotations || []).map((annotation) => {
                if (
                  !annotation.connectorType ||
                  annotation.connectorType === "none"
                ) {
                  return null;
                }

                const x1 = annotation.textX ?? 55;
                const y1 = annotation.textY ?? 55;
                const x2 = annotation.x ?? 50;
                const y2 = annotation.y ?? 40;

                const stroke =
                  annotation.lineColor || "#64748b";

                const strokeWidth =
                  Number(annotation.lineWidth) || 1.5;

                if (annotation.connectorType === "curved") {
                  const middleX = (x1 + x2) / 2;
                  const middleY = (y1 + y2) / 2 - 8;

                  return (
                    <path
                      key={`export-line-${annotation.id}`}
                      d={`M ${x1} ${y1} Q ${middleX} ${middleY} ${x2} ${y2}`}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                }

                if (annotation.connectorType === "angled") {
                  return (
                    <path
                      key={`export-line-${annotation.id}`}
                      d={`M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2}`}
                      fill="none"
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                }

                return (
                  <line
                    key={`export-line-${annotation.id}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>

            {/* Annotation markers + labels */}
            {(slide.annotations || []).map((annotation) => (
              <React.Fragment
                key={`export-annotation-${annotation.id}`}
              >
                {annotation.markerType === "dot" && (
                  <div
                    style={{
                      position: "absolute",

                      left: `${annotation.x ?? 50}%`,
                      top: `${annotation.y ?? 40}%`,

                      width: `${(annotation.radius || 6) * 2}px`,
                      height: `${(annotation.radius || 6) * 2}px`,

                      transform: "translate(-50%, -50%)",
                      borderRadius: "9999px",

                      backgroundColor:
                        annotation.fillColor || "#3b82f6",

                      zIndex: 30,
                    }}
                  />
                )}

                {annotation.markerType === "circle" && (
                  <div
                    style={{
                      position: "absolute",

                      left: `${annotation.x ?? 50}%`,
                      top: `${annotation.y ?? 40}%`,

                      width: `${annotation.width ?? 15}%`,
                      aspectRatio: "1 / 1",

                      border: `3px solid ${
                        annotation.fillColor || "#3b82f6"
                      }`,

                      borderRadius: "9999px",
                      boxSizing: "border-box",

                      zIndex: 30,
                    }}
                  />
                )}

                {annotation.markerType === "square" && (
                  <div
                    style={{
                      position: "absolute",

                      left: `${annotation.x ?? 50}%`,
                      top: `${annotation.y ?? 40}%`,

                      width: `${annotation.width ?? 15}%`,
                      height: `${annotation.height ?? 15}%`,

                      border: `3px solid ${
                        annotation.fillColor || "#3b82f6"
                      }`,

                      boxSizing: "border-box",

                      zIndex: 30,
                    }}
                  />
                )}

                <div
                  style={{
                    position: "absolute",

                    left: `${annotation.textX ?? 55}%`,
                    top: `${annotation.textY ?? 55}%`,

                    transform: "translate(-50%, -50%)",

                    maxWidth: `${
                      annotation.labelWidth || 12
                    }rem`,

                    padding: "6px 9px",
                    borderRadius: "6px",

                    color:
                      annotation.textColor || "#1e293b",

                    backgroundColor:
                      annotation.textBg === "transparent"
                        ? "transparent"
                        : annotation.textBg || "#ffffff",

                    fontSize: `${
                      annotation.textSize || 0.85
                    }rem`,

                    fontWeight:
                      annotation.fontWeight || "normal",

                    textAlign:
                      annotation.textAlign || "left",

                    zIndex: 40,
                  }}
                >
                  {annotation.text || "Annotation"}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default StoryExportSlides;