import Button from "./components/Button.jsx";

function LoginScreen({ error, onConnect }) {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "12px",
        padding: "24px 0",
      }}
    >
      <p>Please connect your Google account to continue.</p>
      {error ? <p>Error: {error}</p> : null}
      <Button type="button" onClick={onConnect}>
        Connect with Google
      </Button>
    </section>
  );
}

export default LoginScreen;
