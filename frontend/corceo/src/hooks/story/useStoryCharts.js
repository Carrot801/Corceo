import {
  useCallback,
} from "react";

import {
  arrangeCharts,
  createChartItem,
} from "../../utils/story/storyLayout";


export default function useStoryCharts({
  activeSlideIndex,

  setSlides,

  setSelectedChartId,
  setSelectedAnnoId,
  setShowPicker,
}) {
  // =========================
  // ADD CHART
  // =========================

  const addChartToSlide =
    useCallback(
      (
        chartId,
        name,
        imageUrl
      ) => {
        let newItemId =
          null;

        setSlides(
          (previousSlides) =>
            previousSlides.map(
              (
                slide,
                index
              ) => {
                if (
                  index !==
                  activeSlideIndex
                ) {
                  return slide;
                }

                const content =
                  slide.content ||
                  [];

                const newItem =
                  createChartItem(
                    chartId,
                    name,
                    imageUrl,
                    content.length
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
              }
            )
        );

        if (newItemId) {
          setSelectedChartId(
            newItemId
          );
        }

        setSelectedAnnoId(
          null
        );

        setShowPicker?.(
          false
        );
      },
      [
        activeSlideIndex,
        setSelectedAnnoId,
        setSelectedChartId,
        setShowPicker,
        setSlides,
      ]
    );


  // =========================
  // UPDATE CHART
  // =========================

  const updateChartItem =
    useCallback(
      (
        itemId,
        updates,
        options
      ) => {
        setSlides(
          (previousSlides) =>
            previousSlides.map(
              (
                slide,
                index
              ) => {
                if (
                  index !==
                  activeSlideIndex
                ) {
                  return slide;
                }

                return {
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
                        : item
                  ),
                };
              }
            ),
          options
        );
      },
      [
        activeSlideIndex,
        setSlides,
      ]
    );


  // =========================
  // DELETE CHART
  // =========================

  const deleteChartItem =
    useCallback(
      (itemId) => {
        setSlides(
          (previousSlides) =>
            previousSlides.map(
              (
                slide,
                index
              ) => {
                if (
                  index !==
                  activeSlideIndex
                ) {
                  return slide;
                }

                const remaining =
                  (
                    slide.content ||
                    []
                  ).filter(
                    (item) =>
                      item.id !==
                      itemId
                  );

                return {
                  ...slide,

                  content:
                    arrangeCharts(
                      remaining
                    ),
                };
              }
            )
        );

        setSelectedChartId(
          (current) =>
            current ===
            itemId
              ? null
              : current
        );
      },
      [
        activeSlideIndex,
        setSelectedChartId,
        setSlides,
      ]
    );


  // =========================
  // DUPLICATE CHART
  // =========================

  const duplicateChartItem =
    useCallback(
      (itemId) => {
        let duplicatedId =
          null;

        setSlides(
          (previousSlides) =>
            previousSlides.map(
              (
                slide,
                index
              ) => {
                if (
                  index !==
                  activeSlideIndex
                ) {
                  return slide;
                }

                const content =
                  slide.content ||
                  [];

                const sourceItem =
                  content.find(
                    (item) =>
                      item.id ===
                      itemId
                  );

                if (!sourceItem) {
                  return slide;
                }

                duplicatedId =
                  `chart-${crypto.randomUUID()}`;

                const duplicate = {
                  ...sourceItem,

                  id:
                    duplicatedId,

                  name:
                    `${
                      sourceItem.name ||
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
              }
            )
        );

        if (duplicatedId) {
          setSelectedChartId(
            duplicatedId
          );
        }

        setSelectedAnnoId(
          null
        );
      },
      [
        activeSlideIndex,
        setSelectedAnnoId,
        setSelectedChartId,
        setSlides,
      ]
    );


  // =========================
  // BRING TO FRONT
  // =========================

  const bringChartToFront =
    useCallback(
      (
        itemId,
        options
      ) => {
        setSlides(
          (previousSlides) =>
            previousSlides.map(
              (
                slide,
                index
              ) => {
                if (
                  index !==
                  activeSlideIndex
                ) {
                  return slide;
                }

                const content =
                  slide.content ||
                  [];

                const highest =
                  Math.max(
                    0,
                    ...content.map(
                      (item) =>
                        item.zIndex ||
                        0
                    )
                  );

                return {
                  ...slide,

                  content:
                    content.map(
                      (item) =>
                        item.id ===
                        itemId
                          ? {
                              ...item,

                              zIndex:
                                highest +
                                1,
                            }
                          : item
                    ),
                };
              }
            ),
          options
        );
      },
      [
        activeSlideIndex,
        setSlides,
      ]
    );


  // =========================
  // SEND TO BACK
  // =========================

  const sendChartToBack =
    useCallback(
      (itemId) => {
        setSlides(
          (previousSlides) =>
            previousSlides.map(
              (
                slide,
                index
              ) => {
                if (
                  index !==
                  activeSlideIndex
                ) {
                  return slide;
                }

                const content =
                  slide.content ||
                  [];

                const lowest =
                  Math.min(
                    0,
                    ...content.map(
                      (item) =>
                        item.zIndex ||
                        0
                    )
                  );

                return {
                  ...slide,

                  content:
                    content.map(
                      (item) =>
                        item.id ===
                        itemId
                          ? {
                              ...item,

                              zIndex:
                                lowest -
                                1,
                            }
                          : item
                    ),
                };
              }
            )
        );
      },
      [
        activeSlideIndex,
        setSlides,
      ]
    );


  return {
    addChartToSlide,
    updateChartItem,
    deleteChartItem,
    duplicateChartItem,
    bringChartToFront,
    sendChartToBack,
  };
}3