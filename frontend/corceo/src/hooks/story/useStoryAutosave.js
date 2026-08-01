import { useCallback } from "react";
import {
  arrangeCharts,
  createChartItem,
} from "../../utils/story/storyLayout";

export default function useStoryCharts({
  activeSlideIndex,
  setSlides,
  setSelectedChartId,
  setSelectedAnnoId,
}) {
  const addChartToSlide =
    useCallback(
      (
        chartId,
        name,
        imageUrl,
      ) => {
        let newItemId = null;

        setSlides((previous) =>
          previous.map(
            (slide, index) => {
              if (
                index !==
                activeSlideIndex
              ) {
                return slide;
              }

              const content =
                slide.content || [];

              const newItem =
                createChartItem(
                  chartId,
                  name,
                  imageUrl,
                  content.length,
                );

              newItemId =
                newItem.id;

              return {
                ...slide,
                content:
                  arrangeCharts([
                    ...content,
                    newItem,
                  ]),
              };
            },
          ),
        );

        setSelectedChartId(
          newItemId,
        );

        setSelectedAnnoId(null);
      },
      [
        activeSlideIndex,
        setSlides,
        setSelectedChartId,
        setSelectedAnnoId,
      ],
    );

  const updateChartItem =
    useCallback(
      (
        itemId,
        updates,
        options,
      ) => {
        setSlides(
          (previous) =>
            previous.map(
              (
                slide,
                index,
              ) =>
                index ===
                activeSlideIndex
                  ? {
                      ...slide,
                      content: (
                        slide.content ||
                        []
                      ).map(
                        (item) =>
                          item.id ===
                          itemId
                            ? {
                                ...item,
                                ...updates,
                              }
                            : item,
                      ),
                    }
                  : slide,
            ),
          options,
        );
      },
      [
        activeSlideIndex,
        setSlides,
      ],
    );

  const deleteChartItem =
    useCallback(
      (itemId) => {
        setSlides((previous) =>
          previous.map(
            (slide, index) => {
              if (
                index !==
                activeSlideIndex
              ) {
                return slide;
              }

              const remaining = (
                slide.content ||
                []
              ).filter(
                (item) =>
                  item.id !==
                  itemId,
              );

              return {
                ...slide,
                content:
                  arrangeCharts(
                    remaining,
                  ),
              };
            },
          ),
        );

        setSelectedChartId(
          (current) =>
            current === itemId
              ? null
              : current,
        );
      },
      [
        activeSlideIndex,
        setSlides,
        setSelectedChartId,
      ],
    );

  const duplicateChartItem =
    useCallback(
      (itemId) => {
        let duplicatedId = null;

        setSlides((previous) =>
          previous.map(
            (slide, index) => {
              if (
                index !==
                activeSlideIndex
              ) {
                return slide;
              }

              const content =
                slide.content || [];

              const source =
                content.find(
                  (item) =>
                    item.id ===
                    itemId,
                );

              if (!source) {
                return slide;
              }

              duplicatedId =
                `chart-${crypto.randomUUID()}`;

              const duplicate = {
                ...source,
                id: duplicatedId,
                name: `${
                  source.name ||
                  "Chart"
                } copy`,
              };

              return {
                ...slide,
                content:
                  arrangeCharts([
                    ...content,
                    duplicate,
                  ]),
              };
            },
          ),
        );

        setSelectedChartId(
          duplicatedId,
        );

        setSelectedAnnoId(null);
      },
      [
        activeSlideIndex,
        setSlides,
        setSelectedChartId,
        setSelectedAnnoId,
      ],
    );

  return {
    addChartToSlide,
    updateChartItem,
    deleteChartItem,
    duplicateChartItem,
  };
}
