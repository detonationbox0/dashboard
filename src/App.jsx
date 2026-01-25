import { useState, useEffect, useRef } from 'react'

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
  const [inboxJson, setInboxJson] = useState("");

  const prevButtons = useRef([]);
  const prevAxes = useRef([]);

  const goFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
  };



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

        gp.buttons.forEach((btn, index) => {
          const wasPressed = prevButtons.current[index];
          const isPressed = btn.pressed;

          if (!wasPressed && isPressed) {
            setCommand(`Button ${index}`);
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
    try {
      const response = await fetch("/api/inbox");
      const text = await response.text();
      setInboxJson(text);
    } catch (error) {
      console.error("Error fetching inbox:", error);
    }
  }

  return (
    <>
      <h1>Dashboard Proof of Concept</h1>

      <a href="/auth/google">Connect Gmail</a>
      <button onClick={loadInbox}>Load Inbox</button>
      <pre>{inboxJson}</pre>

      <button onClick={goFullscreen}>
        Full Screen
      </button>

      <p>The controller is: <b>{isConnected ? "Connected" : "Not Connected"}</b></p>
      <p>Current action: <b>{command ? command : "None"}</b></p>
      <p>Current Device: <b>{deviceInfo}</b></p>
    </>
  )
}

export default App
