import { useState, useEffect, useRef } from 'react'
import LoginScreen from './LoginScreen.jsx'
import Button from './components/Button.jsx'
import MessageBox from './MessageBox.jsx'
import MessageContent from './components/MessageContent.jsx'
import { applyTheme, defaultThemeName } from './theme/theme.js'

function App() {

  const [isConnected, setIsConnected] = useState(false);
  // Latest gamepad action label for the UI.
  const [command, setCommand] = useState(null);
  const [authStatus, setAuthStatus] = useState("loading");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [inboxError, setInboxError] = useState("");
  const [isInboxLoading, setIsInboxLoading] = useState(false);
  // Index of the currently highlighted message in the list.
  const [selectedBoxIndex, setSelectedBoxIndex] = useState(0);
  // When true, the message details panel is open.
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  // Which action button is selected in the message panel.
  const [selectedActionIndex, setSelectedActionIndex] = useState(0);
  // Which header button is currently highlighted (logout/load).
  const [selectedHeaderIndex, setSelectedHeaderIndex] = useState(0);
  // True when navigating header actions instead of the message list.
  const [isHeaderFocused, setIsHeaderFocused] = useState(true);
  // Refs keep the latest values accessible inside the gamepad polling loop.
  const messagesCountRef = useRef(0);
  const isMessageOpenRef = useRef(false);
  const selectedActionIndexRef = useRef(0);
  const isHeaderFocusedRef = useRef(true);
  const selectedHeaderIndexRef = useRef(0);
  const selectedBoxIndexRef = useRef(0);

  // Stored gamepad state to detect changes between frames.
  const prevButtons = useRef([]);
  const prevAxes = useRef([]);

  const logout = async () => {
    // Destroy server session and reset local UI state.
    try {
      await fetch("/auth/logout", { method: "POST", credentials: "include" });
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setMessages([]);
      setInboxError("");
      setAuthMessage("I checked your current situation, and you are not authenticated.");
      setAuthStatus("unauthenticated");
    }
  };

  useEffect(() => {
    applyTheme(defaultThemeName);
  }, []);

  useEffect(() => {
    let isActive = true;

    const checkAuth = async () => {
      // Confirm session state on first load so the UI reflects auth status.
      setAuthStatus("loading");
      setAuthError("");
      setAuthMessage("");
      try {
        const response = await fetch("/auth/me", { credentials: "include" });
        const contentType = response.headers.get("content-type") || "";
        if (response.status === 401) {
          if (isActive) {
            setAuthMessage("I checked your current situation, and you are not authenticated.");
            setAuthStatus("unauthenticated");
          }
          return;
        }
        if (!contentType.includes("application/json")) {
          throw new Error("Auth check returned an unexpected response.");
        }
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Auth request failed: ${response.status}`);
        }
        if (isActive) setAuthStatus("authenticated");
      } catch (error) {
        if (!isActive) return;
        setAuthError(error.message || "Failed to check authentication");
        setAuthMessage("I checked your current situation, and you are not authenticated.");
        setAuthStatus("unauthenticated");
      }
    };

    checkAuth();

    return () => {
      isActive = false;
    };
  }, []);


  useEffect(() => {
    // Keep the selected index valid as the message list changes.
    messagesCountRef.current = messages.length;
    setSelectedBoxIndex((prev) => Math.min(prev, Math.max(messages.length - 1, 0)));
  }, [messages.length]);

  useEffect(() => {
    // Sync state into refs so the gamepad loop can read current values.
    isMessageOpenRef.current = isMessageOpen;
    selectedActionIndexRef.current = selectedActionIndex;
    isHeaderFocusedRef.current = isHeaderFocused;
    selectedHeaderIndexRef.current = selectedHeaderIndex;
  }, [isMessageOpen, selectedActionIndex, isHeaderFocused, selectedHeaderIndex]);

  useEffect(() => {
    // Keep selected list index in a ref for the polling loop.
    selectedBoxIndexRef.current = selectedBoxIndex;
  }, [selectedBoxIndex]);

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
      // Poll gamepad state and translate buttons/axes into UI actions.
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
            // Map button presses to UI navigation/actions.
            console.log(`Gamepad button pressed: ${index}`);
            setCommand(`Button ${index}`);
            if (index === 15) {
              // Right on d-pad or stick: move selection forward.
              if (isMessageOpenRef.current) {
                setSelectedActionIndex((prev) => Math.min(prev + 1, 2));
              } else if (isHeaderFocusedRef.current) {
                setSelectedHeaderIndex(1);
              }
            }
            if (index === 14) {
              // Left on d-pad or stick: move selection backward.
              if (isMessageOpenRef.current) {
                setSelectedActionIndex((prev) => Math.max(prev - 1, 0));
              } else if (isHeaderFocusedRef.current) {
                setSelectedHeaderIndex(0);
              }
            }
            if (index === 13 && !isMessageOpenRef.current) {
              // Down: move focus from header to list or step through list.
              if (isHeaderFocusedRef.current) {
                if (selectedHeaderIndexRef.current === 1 && messagesCountRef.current > 0) {
                  setIsHeaderFocused(false);
                } else {
                  setSelectedHeaderIndex(1);
                }
              } else {
                const maxIndex = Math.max(messagesCountRef.current - 1, 0);
                setSelectedBoxIndex((prev) => Math.min(prev + 1, maxIndex));
              }
            }
            if (index === 12 && !isMessageOpenRef.current) {
              // Up: move focus back to header or step up in list.
              if (isHeaderFocusedRef.current) {
                setSelectedHeaderIndex(0);
              } else if (selectedBoxIndexRef.current === 0) {
                setIsHeaderFocused(true);
              } else {
                setSelectedBoxIndex((prev) => Math.max(prev - 1, 0));
              }
            }
            if (index === 0) {
              // Primary action (e.g. "A" on Xbox) to activate selection.
              if (isMessageOpenRef.current) {
                if (selectedActionIndexRef.current === 2) {
                  setIsMessageOpen(false);
                }
              } else if (isHeaderFocusedRef.current) {
                if (selectedHeaderIndexRef.current === 0) {
                  logout();
                }
                if (selectedHeaderIndexRef.current === 1) {
                  loadInbox();
                }
              } else if (messagesCountRef.current > 0) {
                setSelectedActionIndex(0);
                setIsMessageOpen(true);
              }
            }
          }

          prevButtons.current[index] = isPressed;
        });

        gp.axes.forEach((value, index) => {
          const prevValue = prevAxes.current[index];

          if (Math.abs(value - prevValue) > 0.2) {
            // Axis motion is noisy; only update when there is a clear change.
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
    // Fetch inbox messages; if not authenticated, flip the UI to sign-in.
    setIsInboxLoading(true);
    setInboxError("");
    try {
      const response = await fetch("/api/inbox", { credentials: "include" });
      const contentType = response.headers.get("content-type") || "";
      if (response.status === 401) {
        setAuthMessage("I checked your current situation, and you are not authenticated.");
        setAuthStatus("unauthenticated");
        setMessages([]);
        return;
      }
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Inbox request failed: ${response.status}`);
      }
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Inbox response was not JSON.");
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

  if (authStatus === "loading") {
    return (
      <>
        <h1>Dashboard Proof of Concept</h1>
        <p>Checking authentication...</p>
      </>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <>
        <h1>Dashboard Proof of Concept</h1>
        <LoginScreen
          message={authMessage}
          error={authError}
          onConnect={() => window.location.assign("/auth/google")}
        />
      </>
    );
  }

  return (
    <>
      <h1>Dashboard Proof of Concept</h1>

      <Button onClick={logout} state={isHeaderFocused && selectedHeaderIndex === 0 ? "active" : undefined}>
        Sign out
      </Button>
      <Button onClick={loadInbox} state={isHeaderFocused && selectedHeaderIndex === 1 ? "active" : undefined}>
        Load Inbox
      </Button>
      {isInboxLoading ? <p>Loading inbox...</p> : null}
      {inboxError ? <p>Error: {inboxError}</p> : null}
      <section>
        {/* Message list with keyboard/gamepad-highlighted selection. */}
        {messages.length === 0 ? (
          <p>No messages loaded yet.</p>
        ) : (
            messages.map((message) => (
              <MessageBox
                key={message.id}
                from={message.from}
                subject={message.subject}
                selected={message.id === messages[selectedBoxIndex]?.id}
              />
            ))
          )}
      </section>
      <MessageContent
        open={isMessageOpen}
        message={messages[selectedBoxIndex]}
        selectedActionIndex={selectedActionIndex}
        onClose={() => setIsMessageOpen(false)}
      />

      <p>The controller is: <b>{isConnected ? "Connected" : "Not Connected"}</b></p>
      <p>Current action: <b>{command ? command : "None"}</b></p>
    </>
  )
}

export default App
