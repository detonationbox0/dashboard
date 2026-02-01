import Button from "./components/Button.jsx";

function LoginScreen({
  message,
  error,
  onConnect,
  isActive = false,
  buttonRef,
  authUrl = "",
}) {
  const handleCopy = async () => {
    if (!authUrl) return;
    try {
      await navigator.clipboard.writeText(authUrl);
    } catch (err) {
      console.error("Failed to copy auth URL:", err);
    }
  };

  return (
    <section
      style={{
        // Keep the sign-in CTA visually grouped and left-aligned.
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "12px",
        padding: "24px 0",
      }}
    >
      <p>Please connect your Google account to continue.</p>
      {message ? <p>{message}</p> : null}
      {error ? <p>Error: {error}</p> : null}
      <Button
        ref={buttonRef}
        type="button"
        onClick={onConnect}
        state={isActive ? "active" : undefined}
      >
        Connect with Google
      </Button>
      {authUrl ? (
        <section
          style={{
            marginTop: "12px",
            display: "grid",
            gap: "12px",
            alignItems: "start",
          }}
        >
          <p>Use a phone if you can’t navigate the consent screen here.</p>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(authUrl)}`}
              alt="QR code to open Google sign-in"
              width="180"
              height="180"
              style={{ borderRadius: "12px", border: "1px solid var(--panel-border)" }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <a href={authUrl} target="_blank" rel="noreferrer">
                Open Google sign-in link
              </a>
              <Button type="button" onClick={handleCopy}>
                Copy sign-in link
              </Button>
            </div>
          </div>
        </section>
      ) : null}
    </section>
  );
}

export default LoginScreen;
