import {Composition, type CalculateMetadataFunction} from "remotion";
import {TalkingHead} from "./TalkingHead";
import {Root, type RootShape} from "./Root.types";

type TalkingHeadProps = RootShape;

const defaultProps: TalkingHeadProps = {
  sourceVideo: "",
  durationSeconds: 60,
  showCaptions: false,
  scenes: [],
  captions: [],
  theme: {
    background: "#101820",
    surface: "#1B2833",
    primary: "#65D6C4",
    secondary: "#F3B562",
    text: "#F5F7FA",
    mutedText: "#B8C1CC",
    fontFamily: "Arial, sans-serif",
    displayFontFamily: "Georgia, 'Times New Roman', serif",
  },
};

const calculateMetadata: CalculateMetadataFunction<TalkingHeadProps> = async ({props}) => ({
  durationInFrames: Math.ceil(props.durationSeconds * 30),
  fps: 30,
  width: 1920,
  height: 1080,
});

export const RemotionRoot: React.FC = () => (
  <Composition
    id="TalkingHead"
    component={TalkingHead}
    schema={Root}
    defaultProps={defaultProps}
    calculateMetadata={calculateMetadata}
    durationInFrames={1800}
    fps={30}
    width={1920}
    height={1080}
  />
);
