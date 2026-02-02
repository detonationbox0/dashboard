function MessageBox({ from, subject, selected = false, onClick, onMouseEnter }) {
  return (
    <div
      className="message-box"
      aria-selected={selected}
      data-selected={selected}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      role="button"
      tabIndex={0}
    >
      {/* Fallback labels keep empty fields readable. */}
      <p className="message-box__meta"><strong>From:</strong> {from || "Unknown sender"}</p>
      <p className="message-box__snippet"><strong>Subject:</strong> {subject || "No subject"}</p>
    </div>
  );
}

export default MessageBox;
