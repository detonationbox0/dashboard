import { useState, useEffect, useMemo, useRef } from 'react'
import MessageBox from './MessageBox.jsx'
import { applyTheme, defaultThemeName, themeNames, themes } from './theme/theme.js'

function getDeviceInfo() {
  const ua = navigator.userAgent;
  const platform = navigator.platform;

  // Browser detection
  let browser = "Unknown Browser";
  if (ua.includes("Edg")) browser = "Microsoft Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari")) browser = "Safari";

  // OS detection
  let os = "Unknown OS";
  if (platform.startsWith("Win")) os = "Windows";
  else if (platform.startsWith("Mac")) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(platform)) os = "Linux";

  // Device type
  let deviceType = "Desktop";
  if (/Mobi|Android/i.test(ua)) deviceType = "Mobile";
  if (/iPad|Tablet/i.test(ua)) deviceType = "Tablet";

  return `${browser} on ${os} (${deviceType})`;
}

function App() {

  const [isConnected, setIsConnected] = useState(false);
  const [command, setCommand] = useState(null);
  const [deviceInfo] = useState(() => getDeviceInfo());
  const [messages, setMessages] = useState([]);
  const [inboxError, setInboxError] = useState("");
  const [isInboxLoading, setIsInboxLoading] = useState(false);
  const [selectedBoxIndex, setSelectedBoxIndex] = useState(0);
  const [diagnostics, setDiagnostics] = useState(null);
  const [themeName, setThemeName] = useState(defaultThemeName);
  const messagesCountRef = useRef(0);
  const lastDiagUpdateRef = useRef(0);

  const prevButtons = useRef([]);
  const prevAxes = useRef([]);
  const themeLabel = themes[themeName]?.name || themeName;
  const themeOptions = useMemo(() => themeNames.length ? themeNames : [defaultThemeName], []);

  const goFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
  };

  const toggleTheme = () => {
    if (!themeOptions.length) return;
    const currentIndex = themeOptions.indexOf(themeName);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % themeOptions.length : 0;
    setThemeName(themeOptions[nextIndex]);
  };

  useEffect(() => {
    applyTheme(themeName);
  }, [themeName]);


  useEffect(() => {
    messagesCountRef.current = messages.length;
    setSelectedBoxIndex((prev) => Math.min(prev, Math.max(messages.length - 1, 0)));
  }, [messages.length]);

  useEffect(() => {

    const handleConnect = (e) => {
      console.log("Gamepad connected:", e.gamepad);
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log("Gamepad disconnected");
      setIsConnected(false);
    };

    window.addEventListener("gamepadconnected", handleConnect);
    window.addEventListener("gamepaddisconnected", handleDisconnect);

    const poll = () => {
      const pads = navigator.getGamepads();
      const gp = pads && pads[0];

      setIsConnected(Boolean(gp));

      if (gp) {
        if (prevButtons.current.length === 0) {
          prevButtons.current = gp.buttons.map(b => b.pressed);
        }
        if (prevAxes.current.length === 0) {
          prevAxes.current = [...gp.axes];
        }

        const now = performance.now();
        if (now - lastDiagUpdateRef.current > 200) {
          setDiagnostics({
            id: gp.id,
            mapping: gp.mapping || "unknown",
            buttons: gp.buttons.map(b => b.value ?? (b.pressed ? 1 : 0)),
            axes: [...gp.axes],
          });
          lastDiagUpdateRef.current = now;
        }

        gp.buttons.forEach((btn, index) => {
          const wasPressed = prevButtons.current[index];
          const isPressed = btn.pressed;

          if (!wasPressed && isPressed) {
            console.log(`Gamepad button pressed: ${index}`);
            setCommand(`Button ${index}`);
            if (index === 15) {
              const maxIndex = Math.max(messagesCountRef.current - 1, 0);
              setSelectedBoxIndex((prev) => Math.min(prev + 1, maxIndex));
            }
            if (index === 14) {
              setSelectedBoxIndex((prev) => Math.max(prev - 1, 0));
            }
          }

          prevButtons.current[index] = isPressed;
        });

        gp.axes.forEach((value, index) => {
          const prevValue = prevAxes.current[index];

          if (Math.abs(value - prevValue) > 0.2) {
            setCommand(`Axis ${index}: ${value.toFixed(2)}`);
            prevAxes.current[index] = value;
          }
        });
      }

      requestAnimationFrame(poll);
    };

    poll();

    return () => {
      window.removeEventListener("gamepadconnected", handleConnect);
      window.removeEventListener("gamepaddisconnected", handleDisconnect);
    };
  }, []);


  const loadInbox = async () => {
    setIsInboxLoading(true);
    setInboxError("");
    try {
      const response = await fetch("/api/inbox");
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Inbox request failed: ${response.status}`);
      }
      const data = await response.json();
      const nextMessages = data.messages || data.data?.messages || [];
      setMessages(nextMessages);
    } catch (error) {
      console.error("Error fetching inbox:", error);
      setInboxError(error.message || "Failed to load inbox");
      setMessages([]);
    } finally {
      setIsInboxLoading(false);
    }
  }

  return (
    <>
      <h1>Dashboard Proof of Concept</h1>

      <a href="/auth/google">Connect Gmail</a>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <p>Theme: <b>{themeLabel}</b></p>
      <button onClick={loadInbox}>Load Inbox</button>
      {isInboxLoading ? <p>Loading inbox...</p> : null}
      {inboxError ? <p>Error: {inboxError}</p> : null}
      <details>
        <summary>Messages</summary>
        <section>
          {messages.length === 0 ? (
            <p>No messages loaded yet.</p>
          ) : (
            messages.map((message) => (
              <MessageBox
                key={message.id}
                id={message.id}
                threadId={message.threadId}
                selected={message.id === messages[selectedBoxIndex]?.id}
              />
            ))
          )}
        </section>
      </details>

      <button onClick={goFullscreen}>
        Full Screen
      </button>

      <p>The controller is: <b>{isConnected ? "Connected" : "Not Connected"}</b></p>
      <p>Current action: <b>{command ? command : "None"}</b></p>
      <p>Current Device: <b>{deviceInfo}</b></p>
      <details>
        <summary>Gamepad Diagnostics</summary>
        {diagnostics ? (
          <section>
            <p>Mapping: <b>{diagnostics.mapping}</b></p>
            <p>ID: <b>{diagnostics.id}</b></p>
            <p>Buttons: <b>[{diagnostics.buttons.map(v => v.toFixed(2)).join(", ")}]</b></p>
            <p>Axes: <b>[{diagnostics.axes.map(v => v.toFixed(2)).join(", ")}]</b></p>
          </section>
        ) : (
          <p>No gamepad data yet.</p>
        )}
      </details>
    </>
  )
}

export default App
