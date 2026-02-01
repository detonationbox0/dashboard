import Button from "./components/Button.jsx";

function LoginScreen({
  message,
  error,
  onConnect,
  isActive = false,
  buttonRef,
}) {
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
    </section>
  );
}

export default LoginScreen;
