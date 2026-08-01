export const SLIDE_WIDTH = 1280;
export const SLIDE_HEIGHT = 720;

export const DEFAULT_ANNOTATION = {
  text: "Annotation",
  markerType: "dot",
  connectorType: "curved",
  x: 50,
  y: 40,
  textX: 55,
  textY: 55,
  width: 15,
  height: 15,
  fillColor: "#3b82f6",
  radius: 6,
  labelWidth: 12,
  textSize: 0.85,
  textColor: "#1e293b",
  textBg: "white",
  fontWeight: "normal",
  textAlign: "left",
  lineWidth: 1.5,
  lineColor: "#64748b",
};

export const EMPTY_SLIDE = () => ({
  id: `temp-${crypto.randomUUID()}`,
  content: [],
  description: "",
  annotations: [],
});
