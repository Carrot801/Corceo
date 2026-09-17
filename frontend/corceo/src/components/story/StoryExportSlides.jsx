import React from "react";

import StorySlideContent
  from "./StorySlideContent";


function StoryExportSlides({
  isExporting,
  slides = [],
  SLIDE_WIDTH = 1280,
  SLIDE_HEIGHT = 720,
}) {
  if (!isExporting) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",

        left: "-10000px",
        top: 0,

        width:
          `${SLIDE_WIDTH}px`,

        pointerEvents: "none",

        visibility: "visible",
      }}
    >
      {slides.map(
        (
          slide,
          slideIndex
        ) => (
          <div
            key={
              `export-${
                slide.id ||
                slideIndex
              }`
            }
            className="export-slide"
            style={{
              width:
                `${SLIDE_WIDTH}px`,

              height:
                `${SLIDE_HEIGHT}px`,

              boxSizing:
                "border-box",

              padding:
                "36px 48px",

              display:
                "flex",

              flexDirection:
                "column",

              gap: "18px",

              overflow:
                "hidden",

              backgroundColor:
                "#ffffff",

              color:
                "#0f172a",
            }}
          >
            {/* ===================== */}
            {/* TITLE */}
            {/* ===================== */}

            <div
              style={{
                height: "48px",

                flexShrink: 0,

                display:
                  "flex",

                alignItems:
                  "center",

                fontFamily:
                  "Arial, sans-serif",

                fontSize:
                  "30px",

                fontWeight:
                  700,

                lineHeight:
                  1.2,

                color:
                  "#0f172a",

                overflow:
                  "hidden",

                whiteSpace:
                  "nowrap",

                textOverflow:
                  "ellipsis",
              }}
            >
              {slide.description ||
                `Slide ${
                  slideIndex + 1
                }`}
            </div>


            {/* ===================== */}
            {/* CANVAS */}
            {/* ===================== */}

            <div
              style={{
                position:
                  "relative",

                width: "100%",

                flex: 1,

                minHeight: 0,

                overflow:
                  "hidden",
              }}
            >
              <StorySlideContent
                slide={slide}
                slideIndex={slideIndex}
                interactive={false}
                exportMode={true}
              />
            </div>
          </div>
        )
      )}
    </div>
  );
}


export default StoryExportSlides;