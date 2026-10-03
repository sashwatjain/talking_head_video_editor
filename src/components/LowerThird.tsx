type Props = {
  headline: string;
  body: string;
  theme: {
    surface: string;
    primary: string;
    text: string;
    mutedText: string;
    fontFamily: string;
  };
};

export const LowerThird: React.FC<Props> = ({headline, body, theme}) => (
  <div
    style={{
      maxWidth: 820,
      padding: "22px 30px",
      borderLeft: `7px solid ${theme.primary}`,
      borderRadius: "0 16px 16px 0",
      backgroundColor: theme.surface,
      boxShadow: "0 12px 36px rgba(0,0,0,0.3)",
      fontFamily: theme.fontFamily,
    }}
  >
    <div style={{color: theme.text, fontSize: 34, fontWeight: 700}}>{headline}</div>
    {body && <div style={{color: theme.mutedText, fontSize: 23, marginTop: 6}}>{body}</div>}
  </div>
);
