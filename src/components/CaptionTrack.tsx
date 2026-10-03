import {AbsoluteFill, interpolate} from "remotion";
import type {Caption} from "@remotion/captions";
import type {RootShape} from "../Root.types";

type SplitPresentation = RootShape["scenes"][number]["presentation"];

type Props = {
  captions: Caption[];
  theme: {
    text: string;
    fontFamily: string;
  };
  fps: number;
  frame: number;
  splitPresentation: SplitPresentation;
  splitProgress: number;
};

export const CaptionTrack: React.FC<Props> = ({
  captions,
  theme,
  fps,
  frame,
  splitPresentation,
  splitProgress,
}) => {
  const timeMs = (frame / fps) * 1000;
  const active = captions.find((caption) => timeMs >= caption.startMs && timeMs < caption.endMs);

  if (!active) {
    return null;
  }

  const targetLeft = splitPresentation === "split-video-left" ? 38 : 7;
  const captionWidth = interpolate(splitProgress, [0, 1], [76, 55]);
  const captionLeft = interpolate(splitProgress, [0, 1], [12, targetLeft]);

  return (
    <AbsoluteFill>
      <div
        style={{
          maxWidth: `${captionWidth}%`,
          width: `${captionWidth}%`,
          position: "absolute",
          left: `${captionLeft}%`,
          bottom: "8%",
          color: theme.text,
          fontFamily: theme.fontFamily,
          fontSize: 28,
          fontWeight: 600,
          lineHeight: 1.3,
          textAlign: "center",
          textShadow: "0 2px 5px rgba(0,0,0,0.95), 0 0 12px rgba(0,0,0,0.7)",
          boxSizing: "border-box",
        }}
      >
        {active.text}
      </div>
    </AbsoluteFill>
  );
};
