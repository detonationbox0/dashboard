import Button from "./Button.jsx";

function MessageContent({
  open = false,
  message,
  selectedActionIndex = 0,
  onClose,
}) {
  // Placeholder actions; the third action is wired to close the panel.
  const actions = ["Reply To", "Reply All", "Close"];
  const handleActionClick = (index) => {
    if (index === 2 && onClose) onClose();
  };

  return (
    <aside
      className={`message-content ${open ? "is-open" : ""}`}
      aria-hidden={!open}
      onClick={(event) => {
        if (event.target === event.currentTarget && onClose) onClose();
      }}
    >
      <div className="message-content__panel" onClick={(event) => event.stopPropagation()}>
        <header className="message-content__header">
          <p className="message-content__label">From</p>
          <p className="message-content__value">{message?.from || "Unknown sender"}</p>
          <p className="message-content__label">To</p>
          <p className="message-content__value">{message?.to || "Unknown recipient"}</p>
          <p className="message-content__label">Subject</p>
          <p className="message-content__value">{message?.subject || "No subject"}</p>
        </header>
        <section className="message-content__body">
          {message?.body || message?.snippet || "No message body available."}
        </section>
        <footer className="message-content__actions">
          {actions.map((label, index) => (
            <Button
              key={label}
              onClick={() => handleActionClick(index)}
              state={selectedActionIndex === index ? "active" : undefined}
            >
              {label}
            </Button>
          ))}
        </footer>
      </div>
    </aside>
  );
}

export default MessageContent;
