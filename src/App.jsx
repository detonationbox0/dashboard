import { useState, useEffect, useRef } from 'react'
import LoginScreen from './LoginScreen.jsx'
import Button from './components/Button.jsx'
import MessageBox from './MessageBox.jsx'
import MessageContent from './components/MessageContent.jsx'
import { applyTheme, defaultThemeName, themes } from './theme/theme.js'

function App() {

  const [authStatus, setAuthStatus] = useState("loading");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [inboxError, setInboxError] = useState("");
  const [isInboxLoading, setIsInboxLoading] = useState(false);
  // Index of the currently highlighted message in the list.
  const [selectedBoxIndex, setSelectedBoxIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenConfirmOpen, setFullscreenConfirmOpen] = useState(false);
  const [fullscreenAction, setFullscreenAction] = useState("enter");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastInputMethod, setLastInputMethod] = useState("gamepad");
  const [colorMode, setColorMode] = useState(defaultThemeName === "light" ? "light" : "dark");
  const [accentMode, setAccentMode] = useState("green");
  // When true, the message details panel is open.
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  // Which action button is selected in the message panel.
  const [selectedActionIndex, setSelectedActionIndex] = useState(0);
  // Which settings button is currently highlighted in the drawer.
  const [selectedSettingsIndex, setSelectedSettingsIndex] = useState(0);
  // Which area is currently focused for controller navigation (header or list).
  const [focusZone, setFocusZone] = useState("list");
  // Refs keep the latest values accessible inside the gamepad polling loop.
  const messagesCountRef = useRef(0);
  const isMessageOpenRef = useRef(false);
  const selectedActionIndexRef = useRef(0);
  const focusZoneRef = useRef("list");
  const selectedSettingsIndexRef = useRef(0);
  const selectedBoxIndexRef = useRef(0);
  const messageListRef = useRef(null);
  const primaryPaneRef = useRef(null);
  const secondaryPaneRef = useRef(null);
  const tertiaryPaneRef = useRef(null);
  const fullscreenConfirmOpenRef = useRef(false);
  const fullscreenPendingRef = useRef(false);
  const fullscreenConfirmArmedRef = useRef(false);
  const authStatusRef = useRef(authStatus);
  const isSettingsOpenRef = useRef(false);
  const logoutButtonRef = useRef(null);
  const loadInboxButtonRef = useRef(null);
  const fullscreenButtonRef = useRef(null);
  const fullscreenCancelButtonRef = useRef(null);
  const connectButtonRef = useRef(null);
  const hasAutoLoadedInboxRef = useRef(false);
  const lightModeButtonRef = useRef(null);
  const changeColorButtonRef = useRef(null);
  const repeatTimersRef = useRef({
    up: { startedAt: 0, last: 0 },
    down: { startedAt: 0, last: 0 },
  });

  const toggleFullscreen = async () => {
    if (fullscreenPendingRef.current) return;
    const action = document.fullscreenElement ? "exit" : "enter";
    setFullscreenAction(action);
    if (navigator.userActivation && !navigator.userActivation.isActive) {
      setFullscreenConfirmOpen(true);
      return;
    }
    fullscreenPendingRef.current = true;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen?.();
      } else {
        await document.documentElement.requestFullscreen?.();
      }
    } catch (error) {
      console.error("Fullscreen toggle failed:", error);
    } finally {
      fullscreenPendingRef.current = false;
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
  };

  const toggleSettings = () => {
    setIsSettingsOpen((prev) => {
      const next = !prev;
      setFocusZone(next ? "settings" : "list");
      return next;
    });
  };

  const getPaneRef = (zone) => {
    if (zone === "secondary") return secondaryPaneRef.current;
    if (zone === "tertiary") return tertiaryPaneRef.current;
    return primaryPaneRef.current;
  };

  const isCompactLayout = () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 900px)").matches;
  };

  const cyclePaneFocus = (direction = 1) => {
    setFocusZone((prev) => {
      const order = ["list", "secondary", "tertiary"];
      const currentIndex = Math.max(order.indexOf(prev), 0);
      const nextIndex = (currentIndex + direction + order.length) % order.length;
      const nextZone = order[nextIndex];
      if (isCompactLayout()) {
        const node = getPaneRef(nextZone);
        node?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return nextZone;
    });
  };

  // Stored gamepad state to detect changes between frames.
  const prevButtons = useRef([]);

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

  const applyAccent = (mode, themeName) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const baseVars = themes[themeName]?.vars || {};
    const baseButtonHover = baseVars["--button-hover-border"];
    const basePanelSelected = baseVars["--panel-selected-border"];
    if (mode === "red") {
      const crimson = "#dc143c";
      root.style.setProperty("--button-hover-border", crimson);
      root.style.setProperty("--panel-selected-border", crimson);
      return;
    }
    if (baseButtonHover) {
      root.style.setProperty("--button-hover-border", baseButtonHover);
    }
    if (basePanelSelected) {
      root.style.setProperty("--panel-selected-border", basePanelSelected);
    }
  };

  useEffect(() => {
    const activeTheme = applyTheme(colorMode);
    applyAccent(accentMode, activeTheme);
  }, [colorMode, accentMode]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    handleFullscreenChange();
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (!fullscreenConfirmOpen) return;
    const handleKey = (event) => {
      if (event.key === "Enter") {
        toggleFullscreen();
        setFullscreenConfirmOpen(false);
      }
      if (event.key === "Escape") {
        setFullscreenConfirmOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [fullscreenConfirmOpen]);

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
    if (authStatus !== "authenticated") {
      hasAutoLoadedInboxRef.current = false;
      return;
    }
    if (!hasAutoLoadedInboxRef.current) {
      hasAutoLoadedInboxRef.current = true;
      loadInbox();
    }
  }, [authStatus]);

  useEffect(() => {
    // Keep the selected index valid as the message list changes.
    messagesCountRef.current = messages.length;
    setSelectedBoxIndex((prev) => Math.min(prev, Math.max(messages.length - 1, 0)));
  }, [messages.length]);

  useEffect(() => {
    // Sync state into refs so the gamepad loop can read current values.
    isMessageOpenRef.current = isMessageOpen;
    selectedActionIndexRef.current = selectedActionIndex;
    selectedSettingsIndexRef.current = selectedSettingsIndex;
    focusZoneRef.current = focusZone;
    authStatusRef.current = authStatus;
    fullscreenConfirmOpenRef.current = fullscreenConfirmOpen;
    isSettingsOpenRef.current = isSettingsOpen;
  }, [isMessageOpen, selectedActionIndex, selectedSettingsIndex, focusZone, authStatus, fullscreenConfirmOpen, isSettingsOpen]);

  useEffect(() => {
    if (fullscreenConfirmOpen) {
      // Require a release-then-press to dismiss so the same button press
      // that opened the modal doesn't immediately close it.
      fullscreenConfirmArmedRef.current = false;
    }
  }, [fullscreenConfirmOpen]);

  useEffect(() => {
    // Keep fullscreen modal ref updated even if other state sync changes later.
    fullscreenConfirmOpenRef.current = fullscreenConfirmOpen;
  }, [fullscreenConfirmOpen]);

  useEffect(() => {
    // Keep selected list index in a ref for the polling loop.
    selectedBoxIndexRef.current = selectedBoxIndex;
  }, [selectedBoxIndex]);

  useEffect(() => {
    if (focusZone !== "list" || !messageListRef.current) return;
    const selected = messageListRef.current.querySelector('[data-selected="true"]');
    if (selected) {
      selected.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [selectedBoxIndex, focusZone, messages.length]);

  useEffect(() => {
    const poll = () => {
      // Poll gamepad state and translate buttons/axes into UI actions.
      const pads = navigator.getGamepads();
      const gp = pads && pads[0];


      if (gp) {
        let hasGamepadInput = gp.buttons.some((btn) => btn.pressed);
        if (prevButtons.current.length === 0) {
          prevButtons.current = gp.buttons.map(b => b.pressed);
        }

        if (fullscreenConfirmOpenRef.current) {
          const aPressed = gp.buttons[0]?.pressed;
          const bPressed = gp.buttons[1]?.pressed;
          if (!aPressed && !bPressed) {
            fullscreenConfirmArmedRef.current = true;
          }
          if (fullscreenConfirmArmedRef.current && (aPressed || bPressed)) {
            setFullscreenConfirmOpen(false);
          }
          prevButtons.current = gp.buttons.map(b => b.pressed);
          requestAnimationFrame(poll);
          return;
        }

        gp.buttons.forEach((btn, index) => {
          const wasPressed = prevButtons.current[index];
          const isPressed = btn.pressed;

          if (!wasPressed && isPressed) {
            // Map button presses to UI navigation/actions.
            if (fullscreenConfirmOpenRef.current) {
              setFullscreenConfirmOpen(false);
              return;
            }
            if (index === 0) {
              // Primary action (e.g. "A" on Xbox) to activate selection.
              if (authStatusRef.current === "unauthenticated") {
                connectButtonRef.current?.click();
              } else if (fullscreenConfirmOpenRef.current) {
                setFullscreenConfirmOpen(false);
                fullscreenCancelButtonRef.current?.click();
              } else if (isMessageOpenRef.current) {
                if (selectedActionIndexRef.current === 2) {
                  setIsMessageOpen(false);
                }
              } else if (isSettingsOpenRef.current) {
                if (selectedSettingsIndexRef.current === 0) {
                  logoutButtonRef.current?.click();
                }
                if (selectedSettingsIndexRef.current === 1) {
                  loadInboxButtonRef.current?.click();
                }
                if (selectedSettingsIndexRef.current === 2) {
                  fullscreenButtonRef.current?.click();
                }
                if (selectedSettingsIndexRef.current === 3) {
                  lightModeButtonRef.current?.click();
                }
                if (selectedSettingsIndexRef.current === 4) {
                  changeColorButtonRef.current?.click();
                }
              } else if (messagesCountRef.current > 0) {
                setSelectedActionIndex(0);
                setIsMessageOpen(true);
              }
            }
            if (index === 1) {
              // Secondary action (e.g. "B" on Xbox) to go back/close.
              if (fullscreenConfirmOpenRef.current) {
                setFullscreenConfirmOpen(false);
                fullscreenCancelButtonRef.current?.click();
              } else if (isMessageOpenRef.current) {
                setIsMessageOpen(false);
              } else if (isSettingsOpenRef.current) {
                toggleSettings();
              }
            }
            if (index === 9) {
              // Start button toggles the settings drawer.
              toggleSettings();
            }
            if (index === 5) {
              // Right bumper cycles apps forward.
              if (!isSettingsOpenRef.current && !isMessageOpenRef.current) {
                cyclePaneFocus(1);
              }
            }
            if (index === 4) {
              // Left bumper cycles apps backward.
              if (!isSettingsOpenRef.current && !isMessageOpenRef.current) {
                cyclePaneFocus(-1);
              }
            }
            if (fullscreenConfirmOpenRef.current) {
              return;
            }
            if (index === 15) {
              // Right on d-pad or stick: move selection forward.
              if (isMessageOpenRef.current) {
                setSelectedActionIndex((prev) => Math.min(prev + 1, 2));
              } else if (isSettingsOpenRef.current) {
                setSelectedSettingsIndex((prev) => Math.min(prev + 1, 4));
              } else if (focusZoneRef.current === "list") {
                setFocusZone("secondary");
              }
            }
            if (index === 14) {
              // Left on d-pad or stick: move selection backward.
              if (isMessageOpenRef.current) {
                setSelectedActionIndex((prev) => Math.max(prev - 1, 0));
              } else if (isSettingsOpenRef.current) {
                setSelectedSettingsIndex((prev) => Math.max(prev - 1, 0));
              } else if (focusZoneRef.current === "secondary" || focusZoneRef.current === "tertiary") {
                setFocusZone("list");
              }
            }
            if (index === 13 && !isMessageOpenRef.current) {
              // Down: move focus from header to list or step through list.
              if (isSettingsOpenRef.current) {
                return;
              }
              if (focusZoneRef.current === "secondary") {
                setFocusZone("tertiary");
                return;
              }
              if (focusZoneRef.current === "tertiary") {
                return;
              }
              const maxIndex = Math.max(messagesCountRef.current - 1, 0);
              setSelectedBoxIndex((prev) => Math.min(prev + 1, maxIndex));
            }
            if (index === 12 && !isMessageOpenRef.current) {
              // Up: move focus back to header or step up in list.
              if (isSettingsOpenRef.current) {
                return;
              }
              if (focusZoneRef.current === "tertiary") {
                setFocusZone("secondary");
                return;
              }
              if (focusZoneRef.current === "secondary") {
                return;
              }
              setSelectedBoxIndex((prev) => Math.max(prev - 1, 0));
            }
          }

          prevButtons.current[index] = isPressed;
        });

        if (hasGamepadInput) {
          setLastInputMethod("gamepad");
        }

        if (fullscreenConfirmOpenRef.current) {
          return;
        }
        if (isSettingsOpenRef.current) {
          const now = performance.now();
          const repeatDelay = 250;
          const repeatInterval = 120;
          const downPressed = gp.buttons[13]?.pressed;
          const upPressed = gp.buttons[12]?.pressed;

          const handleRepeat = (direction, pressed, onStep) => {
            const timer = repeatTimersRef.current[direction];
            if (!pressed) {
              timer.startedAt = 0;
              timer.last = 0;
              return;
            }
            if (!timer.startedAt) {
              timer.startedAt = now;
              timer.last = now;
              onStep();
              return;
            }
            const heldFor = now - timer.startedAt;
            if (heldFor >= repeatDelay && now - timer.last >= repeatInterval) {
              timer.last = now;
              onStep();
            }
          };

          handleRepeat("down", downPressed, () => {
            setSelectedSettingsIndex((prev) => Math.min(prev + 1, 4));
          });
          handleRepeat("up", upPressed, () => {
            setSelectedSettingsIndex((prev) => Math.max(prev - 1, 0));
          });

          requestAnimationFrame(poll);
          return;
        }
        if (!isMessageOpenRef.current && focusZoneRef.current === "list") {
          const now = performance.now();
          const repeatDelay = 250;
          const repeatInterval = 120;
          const downPressed = gp.buttons[13]?.pressed;
          const upPressed = gp.buttons[12]?.pressed;

          const handleRepeat = (direction, pressed, onStep) => {
            const timer = repeatTimersRef.current[direction];
            if (!pressed) {
              timer.startedAt = 0;
              timer.last = 0;
              return;
            }
            if (!timer.startedAt) {
              timer.startedAt = now;
              timer.last = now;
              return;
            }
            const heldFor = now - timer.startedAt;
            if (heldFor >= repeatDelay && now - timer.last >= repeatInterval) {
              timer.last = now;
              onStep();
            }
          };

          handleRepeat("down", downPressed, () => {
            const maxIndex = Math.max(messagesCountRef.current - 1, 0);
            setSelectedBoxIndex((prev) => Math.min(prev + 1, maxIndex));
          });
          handleRepeat("up", upPressed, () => {
            setSelectedBoxIndex((prev) => Math.max(prev - 1, 0));
          });
        }
      }

      requestAnimationFrame(poll);
    };

    poll();

    return () => {};
  }, []);

  useEffect(() => {
    let mouseTimer;
    const handleMouseMove = () => {
      setLastInputMethod("mouse");
      if (mouseTimer) clearTimeout(mouseTimer);
      mouseTimer = setTimeout(() => setLastInputMethod("gamepad"), 1500);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (mouseTimer) clearTimeout(mouseTimer);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (authStatus !== "authenticated") return;
    const target = secondaryPaneRef.current;
    if (!target) return;
    const updateWidth = () => {
      const width = target.getBoundingClientRect().width;
      if (width) {
        document.documentElement.style.setProperty("--aux-pane-width", `${Math.round(width)}px`);
      }
    };
    updateWidth();
    let observer;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(updateWidth);
      observer.observe(target);
    } else {
      window.addEventListener("resize", updateWidth);
    }
    return () => {
      if (observer) {
        observer.disconnect();
      } else {
        window.removeEventListener("resize", updateWidth);
      }
    };
  }, [authStatus]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Tab") return;
      if (isSettingsOpenRef.current || isMessageOpenRef.current) return;
      event.preventDefault();
      cyclePaneFocus(1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
      <div className="auth-shell">
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <div className="auth-shell">
        <LoginScreen
          message={authMessage}
          error={authError}
          onConnect={() => window.location.assign("/auth/google")}
          isActive
          buttonRef={connectButtonRef}
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header" />
      <aside
        className={`settings-drawer ${isSettingsOpen ? "is-open" : ""}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            toggleSettings();
          }
        }}
      >
        <div
          className="settings-drawer__panel"
          onClick={(event) => event.stopPropagation()}
        >
          <header className="settings-drawer__header">
            <p className="settings-drawer__title">Settings</p>
          </header>
          <div className="settings-drawer__actions">
            <Button
              ref={logoutButtonRef}
              onClick={logout}
              state={focusZone === "settings" && selectedSettingsIndex === 0 ? "active" : undefined}
              onMouseEnter={() => {
                setFocusZone("settings");
                setSelectedSettingsIndex(0);
              }}
            >
              Sign out
            </Button>
            <Button
              ref={loadInboxButtonRef}
              onClick={loadInbox}
              state={focusZone === "settings" && selectedSettingsIndex === 1 ? "active" : undefined}
              onMouseEnter={() => {
                setFocusZone("settings");
                setSelectedSettingsIndex(1);
              }}
            >
              Load Inbox
            </Button>
            <Button
              ref={fullscreenButtonRef}
              onClick={toggleFullscreen}
              state={focusZone === "settings" && selectedSettingsIndex === 2 ? "active" : undefined}
              onMouseEnter={() => {
                setFocusZone("settings");
                setSelectedSettingsIndex(2);
              }}
            >
              {isFullscreen ? "Exit Full Screen" : "Full Screen"}
            </Button>
            <Button
              ref={lightModeButtonRef}
              onClick={() => setColorMode((prev) => (prev === "dark" ? "light" : "dark"))}
              state={focusZone === "settings" && selectedSettingsIndex === 3 ? "active" : undefined}
              onMouseEnter={() => {
                setFocusZone("settings");
                setSelectedSettingsIndex(3);
              }}
            >
              {colorMode === "dark" ? "Light Mode" : "Dark Mode"}
            </Button>
            <Button
              ref={changeColorButtonRef}
              onClick={() => setAccentMode((prev) => (prev === "green" ? "red" : "green"))}
              state={focusZone === "settings" && selectedSettingsIndex === 4 ? "active" : undefined}
              onMouseEnter={() => {
                setFocusZone("settings");
                setSelectedSettingsIndex(4);
              }}
            >
              Change Color
            </Button>
          </div>
        </div>
      </aside>
      <section className="dashboard-layout">
        <section
          className={`app-primary app-pane ${focusZone === "list" ? "is-focused" : ""}`}
          ref={primaryPaneRef}
        >
          <header className="app-pane__header">
            <p className="app-pane__title">Email</p>
          </header>
          <main className="app-main">
            {isInboxLoading ? <p>Loading inbox...</p> : null}
            {inboxError ? <p>Error: {inboxError}</p> : null}
            <section className="message-list" ref={messageListRef}>
              {/* Message list with keyboard/gamepad-highlighted selection. */}
              {messages.length === 0 ? (
                <p>No messages loaded yet.</p>
              ) : (
                  messages.map((message) => (
                    <MessageBox
                      key={message.id}
                      from={message.from}
                      subject={message.subject}
                      selected={message.id === messages[selectedBoxIndex]?.id && (focusZone === "list" || isSettingsOpen)}
                      onMouseEnter={() => {
                        setFocusZone("list");
                        setSelectedBoxIndex(messages.findIndex((item) => item.id === message.id));
                      }}
                      onClick={() => {
                        setFocusZone("list");
                        setSelectedBoxIndex(messages.findIndex((item) => item.id === message.id));
                        setSelectedActionIndex(0);
                        setIsMessageOpen(true);
                      }}
                    />
                  ))
              )}
            </section>
          </main>
        </section>
        <section
          className={`app-secondary app-pane ${focusZone === "secondary" ? "is-focused" : ""}`}
          ref={secondaryPaneRef}
        >
          <header className="app-pane__header">
            <p className="app-pane__title">Coming soon</p>
          </header>
          <p>App coming soon</p>
        </section>
        <section
          className={`app-tertiary app-pane ${focusZone === "tertiary" ? "is-focused" : ""}`}
          ref={tertiaryPaneRef}
        >
          <header className="app-pane__header">
            <p className="app-pane__title">Coming soon</p>
          </header>
          <p>App coming soon</p>
        </section>
      </section>
      <MessageContent
        open={isMessageOpen}
        message={messages[selectedBoxIndex]}
        selectedActionIndex={selectedActionIndex}
        onClose={() => setIsMessageOpen(false)}
      />
      {lastInputMethod === "mouse" ? (
        <button className="floating-settings" type="button" onClick={toggleSettings}>
          <span className="floating-settings__icon" aria-hidden="true">⚙️</span>
          <span className="floating-settings__label">Settings</span>
        </button>
      ) : null}
      {fullscreenConfirmOpen ? (
        <div className="fullscreen-confirm">
          <div className="fullscreen-confirm__panel">
            <p>
              {fullscreenAction === "exit"
                ? "To Exit full screen, the browser requires you to press Enter."
                : "To Enter full screen, the browser requires you to press Enter."}
            </p>
            <div className="fullscreen-confirm__actions">
              <Button
                ref={fullscreenCancelButtonRef}
                onClick={() => setFullscreenConfirmOpen(false)}
                state="active"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
