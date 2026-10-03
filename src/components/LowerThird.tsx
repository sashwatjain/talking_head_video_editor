type Props = {
  headline: string;
  body: string;
  theme: {
    surface: string;
    primary: string;
    text: string;
    mutedText: string;
    fontFamily: string;
    displayFontFamily: string;
  };
};

export const LowerThird: React.FC<Props> = ({headline, body, theme}) => (
  <div
    style={{
      maxWidth: 600,
      padding: "18px 24px",
      borderLeft: `4px solid ${theme.primary}`,
      borderRadius: "0 12px 12px 0",
      backgroundColor: theme.surface,
      boxShadow: "0 12px 32px rgba(9,16,31,0.25)",
      fontFamily: theme.fontFamily,
    }}
  >
    <div style={{color: theme.text, fontFamily: theme.displayFontFamily, fontSize: 31, lineHeight: 1.15}}>
      {headline}
    </div>
    {body && <div style={{color: theme.mutedText, fontSize: 19, lineHeight: 1.35, marginTop: 6}}>{body}</div>}
  </div>
);
