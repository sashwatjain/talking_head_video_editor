import {
  AbsoluteFill,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type {RootShape} from "./Root.types";
import {CaptionTrack} from "./components/CaptionTrack";
import {SceneOverlay} from "./components/SceneOverlay";

type TalkingHeadProps = RootShape;

export const TalkingHead: React.FC<TalkingHeadProps> = ({
  sourceVideo,
  showCaptions,
  captions,
  scenes,
  theme,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill style={{backgroundColor: theme.background, color: theme.text}}>
      {sourceVideo ? (
        <OffthreadVideo
          src={staticFile(sourceVideo)}
          style={{width: "100%", height: "100%", objectFit: "cover"}}
        />
      ) : (
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            padding: 100,
            textAlign: "center",
            fontFamily: theme.fontFamily,
          }}
        >
          <div style={{color: theme.primary, fontSize: 34, fontWeight: 700, letterSpacing: 4}}>
            TALKING-HEAD EDIT
          </div>
          <div style={{fontSize: 68, fontWeight: 700, marginTop: 24}}>
            Add your source video
          </div>
          <div style={{color: theme.mutedText, fontSize: 30, marginTop: 20}}>
            Copy media into public/ and set the sourceVideo prop in src/Root.tsx.
          </div>
        </AbsoluteFill>
      )}
      {scenes.map((scene) => (
        <SceneOverlay key={scene.id} scene={scene} theme={theme} fps={fps} frame={frame} />
      ))}
      {showCaptions && <CaptionTrack captions={captions} theme={theme} fps={fps} frame={frame} />}
    </AbsoluteFill>
  );
};
