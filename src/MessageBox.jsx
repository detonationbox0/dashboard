import MessageDetails from "./MessageDetails.jsx";

function MessageBox({ id, threadId, selected = false }) {
  return (
    <div className="message-box" aria-selected={selected} data-selected={selected}>
      <p className="message-box__meta"><strong>ID:</strong> {id}</p>
      <p className="message-box__meta"><strong>Thread:</strong> {threadId}</p>
      <MessageDetails threadId={threadId} />
    </div>
  );
}

export default MessageBox;
