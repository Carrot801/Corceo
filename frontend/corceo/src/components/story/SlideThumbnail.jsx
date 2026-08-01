import React from "react";

function SlideThumbnail({
  slide,
  slideNumber,
}) {
  return (
    <div
      className="
        relative
        h-full
        w-full
        overflow-hidden
        bg-white
      "
    >
      {/* Slide title */}
      {slide.description && (
        <div
          className="
            absolute
            left-[4%]
            right-[4%]
            top-[4%]
            z-40
            truncate
            text-[7px]
            font-bold
            text-slate-800
          "
        >
          {slide.description}
        </div>
      )}

      {/* Chart image layout */}
      <div
        className="
          absolute
          bottom-[4%]
          left-[4%]
          right-[4%]
          top-[18%]
          overflow-hidden
          rounded-sm
          bg-slate-50
        "
      >
        {(slide.content || []).map(
          (item, index) => (
            <div
              key={item.id || `${item.chartId}-${index}`}
              className="
                absolute
                overflow-hidden
                bg-white
              "
              style={{
                left: `${item.x ?? 0}%`,
                top: `${item.y ?? 0}%`,
                width: `${item.width ?? 100}%`,
                height: `${item.height ?? 100}%`,
                zIndex: item.zIndex ?? index + 1,
              }}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="
                    h-full
                    w-full
                    object-contain
                  "
                  draggable={false}
                />
              ) : (
                <div
                  className="
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                    bg-slate-100
                    text-[8px]
                    text-slate-400
                  "
                >
                  Chart
                </div>
              )}
            </div>
          ),
        )}

        {/* Basic annotation connectors */}
        <svg
          className="
            pointer-events-none
            absolute
            inset-0
            z-20
            h-full
            w-full
          "
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {(slide.annotations || []).map(
            (annotation) => {
              if (
                annotation.connectorType === "none"
              ) {
                return null;
              }

              const x1 =
                annotation.textX ?? 55;
              const y1 =
                annotation.textY ?? 55;
              const x2 =
                annotation.x ?? 50;
              const y2 =
                annotation.y ?? 40;

              return (
                <line
                  key={`line-${annotation.id}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={
                    annotation.lineColor ||
                    "#64748b"
                  }
                  strokeWidth="0.5"
                />
              );
            },
          )}
        </svg>

        {/* Annotation markers and labels */}
        {(slide.annotations || []).map(
          (annotation) => (
            <React.Fragment
              key={annotation.id}
            >
              {annotation.markerType ===
                "dot" && (
                <div
                  className="
                    absolute
                    z-30
                    rounded-full
                    border
                    border-white
                  "
                  style={{
                    left: `${
                      annotation.x ?? 50
                    }%`,
                    top: `${
                      annotation.y ?? 40
                    }%`,

                    width: "5px",
                    height: "5px",

                    transform:
                      "translate(-50%, -50%)",

                    backgroundColor:
                      annotation.fillColor ||
                      "#3b82f6",
                  }}
                />
              )}

              {annotation.markerType ===
                "circle" && (
                <div
                  className="
                    absolute
                    z-30
                    rounded-full
                    border
                  "
                  style={{
                    left: `${
                      annotation.x ?? 50
                    }%`,
                    top: `${
                      annotation.y ?? 40
                    }%`,

                    width: `${
                      annotation.width ?? 15
                    }%`,

                    aspectRatio: "1 / 1",

                    borderColor:
                      annotation.fillColor ||
                      "#3b82f6",
                  }}
                />
              )}

              {annotation.markerType ===
                "square" && (
                <div
                  className="
                    absolute
                    z-30
                    rounded-sm
                    border
                  "
                  style={{
                    left: `${
                      annotation.x ?? 50
                    }%`,
                    top: `${
                      annotation.y ?? 40
                    }%`,

                    width: `${
                      annotation.width ?? 15
                    }%`,

                    height: `${
                      annotation.height ?? 15
                    }%`,

                    borderColor:
                      annotation.fillColor ||
                      "#3b82f6",
                  }}
                />
              )}

              <div
                className="
                  absolute
                  z-40
                  max-w-[45%]
                  truncate
                  rounded-sm
                  px-1
                  py-0.5
                  text-[5px]
                  leading-tight
                "
                style={{
                  left: `${
                    annotation.textX ?? 55
                  }%`,

                  top: `${
                    annotation.textY ?? 55
                  }%`,

                  transform:
                    "translate(-50%, -50%)",

                  color:
                    annotation.textColor ||
                    "#1e293b",

                  backgroundColor:
                    annotation.textBg ===
                    "transparent"
                      ? "transparent"
                      : annotation.textBg ||
                        "#ffffff",
                }}
              >
                {annotation.text ||
                  "Annotation"}
              </div>
            </React.Fragment>
          ),
        )}
      </div>

      {(slide.content || []).length === 0 && (
        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            text-[9px]
            text-slate-400
          "
        >
          Slide {slideNumber}
        </div>
      )}
    </div>
  );
}


export default SlideThumbnail;
