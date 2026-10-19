import { useEffect, useRef, useState } from "react";

const EMPTY_RESULT = {
  rows: [],
  visibleYKeys: [],
};

export default function useWorkerChartData(request, enabled) {
  const controllerRef = useRef(null);
  const [reply, setReply] = useState(null);
  const [fatalError, setFatalError] = useState(null);

  useEffect(() => {
    if (!enabled) return;

    let worker;
    let stopped = false;
    let active = null;
    let pending = null;
    let lastData = null;
    let datasetSent = false;
    let nextId = 0;

    setReply(null);
    setFatalError(null);

    const fail = (message) => {
      stopped = true;
      pending = null;
      active = null;
      worker?.terminate();
      setFatalError(message);
    };
const pump = () => {
      if (stopped || active || !pending) return;

      const currentRequest = pending;
      pending = null;

      const id = ++nextId;
      active = { id, request: currentRequest };

      const replaceData =
        !datasetSent || lastData !== currentRequest.data;

      try {
        worker.postMessage({
          id,
          replaceData,
          data: replaceData ? currentRequest.data : undefined,
          chartConfig: currentRequest.chartConfig,
          settings: currentRequest.settings,
        });

        lastData = currentRequest.data;
        datasetSent = true;
      } catch (error) {
        fail(error.message || "Could not send data to the worker.");
      }
    };

    try {
      worker = new Worker(
        new URL("../workers/chartData.worker.js", import.meta.url),
        { type: "module" }
      );
    } catch (error) {
      fail(error.message || "Could not start the chart worker.");
      return;
    }

    worker.onmessage = ({ data: message }) => {
      if (stopped || !active || message.id !== active.id) {
        return;
      }

      const completedRequest = active.request;
      active = null;

      setReply({
        request: completedRequest,
        processed: message.processed ?? EMPTY_RESULT,
        error: message.error ?? null,
      });

      pump();
    };

    worker.onerror = (event) => {
      event.preventDefault();
      fail(event.message || "Chart worker failed.");
    };

    worker.onmessageerror = () => {
      fail("Could not read the chart worker response.");
    };

    const controller = {
      submit(nextRequest) {
        if (stopped) return;

        pending = nextRequest;
        pump();
      },
    };

    controllerRef.current = controller;

    return () => {
      stopped = true;
      active = null;
      pending = null;
      lastData = null;
      worker.terminate();

      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
    };
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      controllerRef.current?.submit(request);
    }
  }, [enabled, request]);

  const matchesCurrentRequest = reply?.request === request;

  const error = enabled
    ? fatalError || (matchesCurrentRequest ? reply.error : null)
    : null;

  return {
    processed:
      enabled && matchesCurrentRequest && !error
        ? reply.processed
        : EMPTY_RESULT,

    isProcessing:
      enabled && !error && !matchesCurrentRequest,

    processingError: error,
  };
}