import {
  useCallback,
  useState,
} from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  SLIDE_HEIGHT,
  SLIDE_WIDTH,
} from "../../utils/story/storyConstants";

function wait(milliseconds) {
  return new Promise((resolve) =>
    setTimeout(resolve, milliseconds),
  );
}

async function waitForImages(
  rootElements,
) {
  const images = rootElements.flatMap(
    (root) =>
      Array.from(
        root.querySelectorAll("img"),
      ),
  );

  await Promise.all(
    images.map(
      (image) =>
        new Promise((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }

          image.onload = resolve;
          image.onerror = resolve;
        }),
    ),
  );
}

export default function useStoryExport({
  slides,
  storyName,
}) {
  const [
    isExporting,
    setIsExporting,
  ] = useState(false);

  const waitForExportSlides =
    useCallback(
      async (
        expectedCount,
        attempts = 30,
      ) => {
        for (
          let attempt = 0;
          attempt < attempts;
          attempt++
        ) {
          const elements =
            Array.from(
              document.querySelectorAll(
                ".export-slide",
              ),
            );

          if (
            elements.length ===
            expectedCount
          ) {
            return elements;
          }

          await wait(50);
        }

        return [];
      },
      [],
    );

  const exportStoryPDF =
    useCallback(async () => {
      try {
        setIsExporting(true);

        const slideElements =
          await waitForExportSlides(
            slides.length,
          );

        if (
          !slideElements.length
        ) {
          throw new Error(
            "Export slides were not rendered",
          );
        }

        await waitForImages(
          slideElements,
        );

        if (
          document.fonts?.ready
        ) {
          await document.fonts.ready;
        }

        const pdf = new jsPDF(
          "landscape",
          "pt",
          [
            SLIDE_WIDTH,
            SLIDE_HEIGHT,
          ],
        );

        for (
          let index = 0;
          index <
          slideElements.length;
          index++
        ) {
          const canvas =
            await html2canvas(
              slideElements[index],
              {
                scale: 2,
                useCORS: true,
                allowTaint: false,
                backgroundColor:
                  "#ffffff",
                logging: false,
                width:
                  SLIDE_WIDTH,
                height:
                  SLIDE_HEIGHT,
              },
            );

          const imageData =
            canvas.toDataURL(
              "image/png",
            );

          if (index > 0) {
            pdf.addPage(
              [
                SLIDE_WIDTH,
                SLIDE_HEIGHT,
              ],
              "landscape",
            );
          }

          pdf.addImage(
            imageData,
            "PNG",
            0,
            0,
            SLIDE_WIDTH,
            SLIDE_HEIGHT,
          );
        }

        pdf.save(
          `${
            storyName ||
            "story"
          }.pdf`,
        );
      } finally {
        setIsExporting(false);
      }
    }, [
      slides.length,
      storyName,
      waitForExportSlides,
    ]);

  const makeStoryPreview =
    useCallback(async () => {
      try {
        setIsExporting(true);

        const elements =
          await waitForExportSlides(
            slides.length,
          );

        const firstSlide =
          elements[0];

        if (!firstSlide) {
          throw new Error(
            "First export slide was not rendered",
          );
        }

        await waitForImages([
          firstSlide,
        ]);

        if (
          document.fonts?.ready
        ) {
          await document.fonts.ready;
        }

        await new Promise(
          (resolve) => {
            requestAnimationFrame(
              () =>
                requestAnimationFrame(
                  resolve,
                ),
            );
          },
        );

        const canvas =
          await html2canvas(
            firstSlide,
            {
              scale: 0.7,
              useCORS: true,
              allowTaint: false,
              backgroundColor:
                "#ffffff",
              logging: false,
            },
          );

        return canvas.toDataURL(
          "image/jpeg",
          0.82,
        );
      } catch (error) {
        console.error(
          "Story preview generation failed:",
          error,
        );

        return null;
      } finally {
        setIsExporting(false);
      }
    }, [
      slides.length,
      waitForExportSlides,
    ]);

  return {
    isExporting,
    exportStoryPDF,
    makeStoryPreview,
  };
}
