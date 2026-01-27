function MessageBox({ from, subject, selected = false }) {
  return (
    <div className="message-box" aria-selected={selected} data-selected={selected}>
      <p className="message-box__meta"><strong>From:</strong> {from || "Unknown sender"}</p>
      <p className="message-box__snippet"><strong>Subject:</strong> {subject || "No subject"}</p>
    </div>
  );
}

export default MessageBox;
