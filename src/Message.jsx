import MessageDetails from "./MessageDetails.jsx";

function Message({ id, threadId }) {
  return (
    <article>
      <h3>Message {id}</h3>
      <p><strong>ID:</strong> {id}</p>
      <p><strong>Thread:</strong> {threadId}</p>
      <MessageDetails threadId={threadId} />
    </article>
  );
}

export default Message;
