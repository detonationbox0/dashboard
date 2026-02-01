import MessageDetails from "./MessageDetails.jsx";

function Message({ id, threadId }) {
  return (
    <article>
      {/* Simple wrapper that shows ids plus a thread preview. */}
      <h3>Message {id}</h3>
      <p><strong>ID:</strong> {id}</p>
      <p><strong>Thread:</strong> {threadId}</p>
      <MessageDetails threadId={threadId} />
    </article>
  );
}

export default Message;
