import React from "react";

import StorySlideContent
  from "./StorySlideContent";


function StoryExportSlides({
  isExporting,
  slides = [],
  SLIDE_WIDTH,
  SLIDE_HEIGHT,
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

              padding: "48px",

              boxSizing:
                "border-box",

              display: "flex",

              flexDirection:
                "column",

              gap: "16px",

              overflow:
                "hidden",

              backgroundColor:
                "#ffffff",

              color:
                "#0f172a",
            }}
          >
            {/* ========================= */}
            {/* SLIDE TITLE */}
            {/* ========================= */}

            <div
              style={{
                height: "56px",

                flexShrink: 0,

                padding:
                  "6px 0",

                boxSizing:
                  "border-box",

                fontFamily:
                  "Arial, sans-serif",

                fontSize:
                  "34px",

                fontWeight:
                  700,

                lineHeight:
                  "44px",

                color:
                  "#0f172a",

                whiteSpace:
                  "nowrap",

                overflow:
                  "hidden",

                textOverflow:
                  "ellipsis",
              }}
            >
              {slide.description ||
                `Slide ${
                  slideIndex + 1
                }`}
            </div>


            {/* ========================= */}
            {/* SHARED SLIDE CONTENT */}
            {/* ========================= */}

            <div
              style={{
                position:
                  "relative",

                width: "100%",

                flex: 1,

                minHeight: 0,
              }}
            >
              <StorySlideContent
                slide={slide}

                slideIndex={
                  slideIndex
                }

                interactive={
                  false
                }
              />
            </div>
          </div>
        )
      )}
    </div>
  );
}


export default StoryExportSlides;