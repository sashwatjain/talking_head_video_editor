import {AbsoluteFill} from "remotion";

type Caption = {
  startMs: number;
  endMs: number;
  text: string;
};

type Props = {
  captions: Caption[];
  theme: {
    surface: string;
    primary: string;
    text: string;
    fontFamily: string;
  };
  fps: number;
  frame: number;
};

export const CaptionTrack: React.FC<Props> = ({captions, theme, fps, frame}) => {
  const timeMs = (frame / fps) * 1000;
  const active = captions.find((caption) => timeMs >= caption.startMs && timeMs < caption.endMs);

  if (!active) {
    return null;
  }

  return (
    <AbsoluteFill style={{justifyContent: "flex-end", alignItems: "center", padding: "0 9% 8%"}}>
      <div
        style={{
          maxWidth: "82%",
          padding: "16px 28px",
          borderRadius: 14,
          backgroundColor: theme.surface,
          color: theme.text,
          borderBottom: `4px solid ${theme.primary}`,
          fontFamily: theme.fontFamily,
          fontSize: 36,
          fontWeight: 700,
          lineHeight: 1.25,
          textAlign: "center",
          textShadow: "0 2px 10px rgba(0,0,0,0.45)",
        }}
      >
        {active.text}
      </div>
    </AbsoluteFill>
  );
};
