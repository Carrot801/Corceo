import {
  useCallback,
  useState,
} from "react";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";


function useStoryExport({
  slides,
  storyName,

  activeSlideIndex,
  setActiveSlideIndex,
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
      const originalSlideIndex =
        activeSlideIndex;

      try {
        setIsExporting(true);

        /*
         * Remove selection before capture
         * by clicking nothing / changing slide.
         *
         * Give React time to update.
         */
        await waitForPaint();

        let pdf = null;

        for (
          let index = 0;
          index < slides.length;
          index++
        ) {
          // =========================
          // SHOW REAL SLIDE
          // =========================

          setActiveSlideIndex(
            index
          );

          /*
           * Wait for React to render
           * the newly selected slide.
           */
          await waitForPaint();

          /*
           * StoryChart loads data
           * asynchronously, so two frames
           * are not always enough.
           */
          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                500
              )
          );

          const slideElement =
            document.querySelector(
              ".story-pdf-slide"
            );

          if (!slideElement) {
            throw new Error(
              `Visible slide ${
                index + 1
              } was not found`
            );
          }

          await waitForImages(
            slideElement
          );

          await waitForPaint();

          // =========================
          // CAPTURE
          // =========================

          const canvas =
            await html2canvas(
              slideElement,
              {
                scale: 2,

                useCORS: true,

                allowTaint: false,

                backgroundColor:
                  "#ffffff",

                logging: false,

                onclone: (
                  clonedDocument
                ) => {
                  /*
                   * Hide editor-only controls
                   * in the captured clone.
                   *
                   * This does NOT modify
                   * the real editor.
                   */
                  clonedDocument
                    .querySelectorAll(
                      '[data-pdf-hide="true"]'
                    )
                    .forEach(
                      (element) => {
                        element.style.display =
                          "none";
                      }
                    );

                  /*
                   * Remove selection rings,
                   * hover UI etc. if needed.
                   */
                },
              }
            );

          const imageData =
            canvas.toDataURL(
              "image/png"
            );

          const pageWidth =
            slideElement
              .getBoundingClientRect()
              .width;

          const pageHeight =
            slideElement
              .getBoundingClientRect()
              .height;

          // =========================
          // CREATE PDF
          // =========================

          if (!pdf) {
            pdf =
              new jsPDF({
                orientation:
                  pageWidth >=
                  pageHeight
                    ? "landscape"
                    : "portrait",

                unit: "pt",

                format: [
                  pageWidth,
                  pageHeight,
                ],
              });
          } else {
            pdf.addPage(
              [
                pageWidth,
                pageHeight,
              ],
              pageWidth >=
                pageHeight
                ? "landscape"
                : "portrait"
            );
          }

          pdf.addImage(
            imageData,
            "PNG",
            0,
            0,
            pageWidth,
            pageHeight
          );
        }

        if (pdf) {
          pdf.save(
            `${
              storyName ||
              "story"
            }.pdf`
          );
        }

      } catch (error) {
        console.error(
          "PDF export failed:",
          error
        );

      } finally {
        /*
         * Return user to the slide
         * they were viewing before
         * export started.
         */
        setActiveSlideIndex(
          originalSlideIndex
        );

        setIsExporting(false);
      }
    },
    [
      activeSlideIndex,
      slides,
      storyName,
      setActiveSlideIndex,
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