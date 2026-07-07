import { useEffect, useRef } from "react";
import { mountGradientCurveWidget } from "./gradient-curve-widget.js";

const STORAGE_KEY = "soundemote.gradientCurveWidget.site.v1";

const defaults = {
  angle: 120,
  invert: false,
  autoOrder: false,
  autoBright: false,
  hueMode: "chroma",
  lightnessMode: "bokeh",
  archDtShift: 14,
  archFreqHz: 8,
  archDitherBits: 7,
  archTableSize: 256,
  archFps: 12,
  previewMode: "dot",
  radialCenter: "end",
  falloff: { leftEdge: 18, leftMid: 42, rightMid: 68, rightEdge: 100 },
  previewZoom: 1,
  previewPanX: 0,
  previewPanY: 0,
  addInsertIndex: 2,
  addColor: "#8A4B22",
  sampleCount: 40,
  stops: [
    { id: "black", color: "#000000" },
    { id: "red", color: "#FF1F2D" },
  ],
  savedStops: [
    { id: "black", color: "#000000" },
    { id: "white", color: "#FFFFFF" },
    { id: "red", color: "#FF0000" },
    { id: "green", color: "#00FF00" },
    { id: "blue", color: "#0000FF" },
    { id: "cyan", color: "#00FFFF" },
    { id: "magenta", color: "#FF00FF" },
    { id: "yellow", color: "#FFFF00" },
  ],
};

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved || typeof saved !== "object") return defaults;
    return { ...defaults, ...saved };
  } catch {
    return defaults;
  }
}

const GradientCurveWidget = () => {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const controller = mountGradientCurveWidget(host, {
      ...loadSettings(),
      onChange(packet: any) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            angle: packet.angle,
            invert: packet.invert,
            autoOrder: packet.autoOrder,
            autoBright: packet.autoBright,
            hueMode: packet.hueMode,
            lightnessMode: packet.lightnessMode,
            archDtShift: packet.archDtShift,
            archFreqHz: packet.archFreqHz,
            archDitherBits: packet.archDitherBits,
            archTableSize: packet.archTableSize,
            archFps: packet.archFps,
            previewMode: packet.previewMode,
            radialCenter: packet.radialCenter,
            gridMode: packet.gridMode,
            falloff: packet.falloff,
            previewZoom: packet.previewZoom,
            previewPanX: packet.previewPan.x,
            previewPanY: packet.previewPan.y,
            addInsertIndex: packet.addInsertIndex,
            addColor: packet.addColor,
            sampleCount: packet.sampleCount,
            stops: packet.stops
              .filter((stop: any) => !stop.id.startsWith("__auto-"))
              .map((stop: any) => ({ id: stop.id, color: stop.color })),
            savedStops: packet.savedStops.map((stop: any) => ({ id: stop.id, color: stop.color })),
          }),
        );
      },
    });

    return () => {
      controller?.destroy?.();
      host.replaceChildren();
    };
  }, []);

  return <div ref={hostRef} className="h-full w-full" />;
};

export default GradientCurveWidget;
