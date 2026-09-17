import {
  useCallback,
  useState,
} from "react";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";


function useStoryExport({
  slides,
  storyName,
  slideWidth = 1280,
  slideHeight = 720,
}) {
  const [
    isExporting,
    setIsExporting,
  ] = useState(false);


  // =========================
  // WAIT FOR EXPORT SLIDE
  // =========================

  const waitForExportSlide =
    useCallback(
      async (
        attempts = 20
      ) => {
        for (
          let attempt = 0;
          attempt < attempts;
          attempt++
        ) {
          const exportSlide =
            document.querySelector(
              ".export-slide"
            );

          if (exportSlide) {
            return exportSlide;
          }

          await new Promise(
            (resolve) => {
              setTimeout(
                resolve,
                50
              );
            }
          );
        }

        return null;
      },
      []
    );


  // =========================
  // WAIT FOR IMAGES
  // =========================

  const waitForImages =
    useCallback(
      async (
        rootElement
      ) => {
        if (!rootElement) {
          return;
        }

        const images =
          Array.from(
            rootElement.querySelectorAll(
              "img"
            )
          );

        await Promise.all(
          images.map(
            (image) => {
              if (
                image.complete
              ) {
                return Promise.resolve();
              }

              return new Promise(
                (resolve) => {
                  image.onload =
                    resolve;

                  image.onerror =
                    resolve;
                }
              );
            }
          )
        );
      },
      []
    );


  // =========================
  // WAIT FOR BROWSER PAINT
  // =========================

  const waitForPaint =
    useCallback(
      async () => {
        await new Promise(
          (resolve) => {
            requestAnimationFrame(
              () => {
                requestAnimationFrame(
                  resolve
                );
              }
            );
          }
        );
      },
      []
    );


  // =========================
  // STORY PREVIEW
  // =========================

  const makeStoryPreview =
    useCallback(
      async () => {
        try {
          /*
           * StoryExportSlides is rendered
           * only while isExporting = true.
           */
          setIsExporting(true);

          const firstSlide =
            await waitForExportSlide();

          if (!firstSlide) {
            throw new Error(
              "First export slide was not rendered"
            );
          }

          await waitForImages(
            firstSlide
          );

          /*
           * Give React/browser an extra
           * moment to finish layout.
           */
          await waitForPaint();

          const canvas =
            await html2canvas(
              firstSlide,
              {
                scale: 0.7,

                useCORS:
                  true,

                allowTaint:
                  false,

                backgroundColor:
                  "#ffffff",

                logging:
                  false,
              }
            );

          return canvas.toDataURL(
            "image/jpeg",
            0.8
          );

        } catch (error) {
          console.error(
            "Story preview generation failed:",
            error
          );

          return null;

        } finally {
          setIsExporting(false);
        }
      },
      [
        waitForExportSlide,
        waitForImages,
        waitForPaint,
      ]
    );


  // =========================
  // EXPORT STORY PDF
  // =========================
const exportStoryPDF =
  useCallback(
    async () => {
      try {
        // Render hidden export slides
        setIsExporting(true);

        let slideElements = [];

        // =========================
        // WAIT FOR ALL SLIDES
        // =========================

        for (
          let attempt = 0;
          attempt < 40;
          attempt++
        ) {
          slideElements =
            Array.from(
              document.querySelectorAll(
                ".export-slide"
              )
            );

          if (
            slideElements.length ===
            slides.length
          ) {
            break;
          }

          await new Promise(
            (resolve) => {
              setTimeout(
                resolve,
                50
              );
            }
          );
        }

        if (
          slideElements.length !==
          slides.length
        ) {
          throw new Error(
            "Not all export slides were rendered"
          );
        }


        // =========================
        // WAIT FOR IMAGES
        // =========================

        await Promise.all(
          slideElements.map(
            (element) =>
              waitForImages(
                element
              )
          )
        );


        // =========================
        // WAIT FOR CHARTS
        // =========================

        /*
         * StoryChart loads data
         * asynchronously.
         *
         * Give every hidden chart
         * time to finish rendering.
         */
        await new Promise(
          (resolve) => {
            setTimeout(
              resolve,
              1000
            );
          }
        );

        await waitForPaint();


        // =========================
        // CREATE FIXED PDF
        // =========================

        const pdf =
          new jsPDF({
            orientation:
              "landscape",

            unit: "pt",

            format: [
              slideWidth,
              slideHeight,
            ],
          });


        // =========================
        // CAPTURE EACH SLIDE
        // =========================

        for (
          let index = 0;
          index <
          slideElements.length;
          index++
        ) {
          const slideElement =
            slideElements[
              index
            ];


          /*
           * Important:
           *
           * Every page is ALWAYS
           * slideWidth × slideHeight.
           *
           * We do not use
           * getBoundingClientRect()
           * for PDF dimensions.
           */

          const canvas =
            await html2canvas(
              slideElement,
              {
                scale: 2,

                useCORS: true,

                allowTaint:
                  false,

                backgroundColor:
                  "#ffffff",

                logging: false,

                width:
                  slideWidth,

                height:
                  slideHeight,

                windowWidth:
                  slideWidth,

                windowHeight:
                  slideHeight,

                onclone: (
                  clonedDocument
                ) => {
                  const clonedSlides =
                    clonedDocument
                      .querySelectorAll(
                        ".export-slide"
                      );

                  const clonedSlide =
                    clonedSlides[
                      index
                    ];

                  if (
                    clonedSlide
                  ) {
                    clonedSlide
                      .querySelectorAll(
                        "svg"
                      )
                      .forEach(
                        (svg) => {
                          svg.style.overflow =
                            "visible";
                        }
                      );
                  }
                },
              }
            );


          const imageData =
            canvas.toDataURL(
              "image/png"
            );


          if (index > 0) {
            pdf.addPage(
              [
                slideWidth,
                slideHeight,
              ],
              "landscape"
            );
          }


          pdf.addImage(
            imageData,
            "PNG",

            0,
            0,

            slideWidth,
            slideHeight
          );
        }


        // =========================
        // SAVE
        // =========================

        pdf.save(
          `${
            storyName ||
            "story"
          }.pdf`
        );

      } catch (error) {
        console.error(
          "PDF export failed:",
          error
        );

      } finally {
        setIsExporting(false);
      }
    },
    [
      slideHeight,
      slides,
      slideWidth,
      storyName,
      waitForImages,
      waitForPaint,
    ]
  );

  return {
    isExporting,

    exportStoryPDF,

    makeStoryPreview,
  };
}


export default useStoryExport;