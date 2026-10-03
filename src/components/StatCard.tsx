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

export const StatCard: React.FC<Props> = ({headline, body, theme}) => (
  <div
    style={{
      maxWidth: 760,
      padding: "34px 42px",
      borderRadius: 24,
      border: `1px solid ${theme.primary}66`,
      backgroundColor: theme.surface,
      boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
      fontFamily: theme.fontFamily,
    }}
  >
    <div style={{color: theme.primary, fontSize: 40, fontWeight: 750, lineHeight: 1.12}}>
      {headline}
    </div>
    {body && (
      <div style={{color: theme.mutedText, fontSize: 26, lineHeight: 1.4, marginTop: 16}}>
        {body}
      </div>
    )}
  </div>
);
