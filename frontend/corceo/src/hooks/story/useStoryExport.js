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
          setIsExporting(true);

          let slideElements =
            [];

          /*
           * Wait until every hidden
           * export slide is rendered.
           */
          for (
            let attempt = 0;
            attempt < 30;
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
            !slideElements.length
          ) {
            throw new Error(
              "Export slides were not rendered"
            );
          }

          /*
           * Wait for images in every
           * export slide.
           */
          await Promise.all(
            slideElements.map(
              (slide) =>
                waitForImages(
                  slide
                )
            )
          );

          await waitForPaint();

          const pdf =
            new jsPDF(
              "landscape",
              "pt",
              [
                slideWidth,
                slideHeight,
              ]
            );

          for (
            let index = 0;
            index <
            slideElements.length;
            index++
          ) {
            const canvas =
              await html2canvas(
                slideElements[
                  index
                ],
                {
                  scale: 2,

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

            const imageData =
              canvas.toDataURL(
                "image/png"
              );

            if (
              index > 0
            ) {
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