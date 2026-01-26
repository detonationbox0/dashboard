import MessageDetails from "./MessageDetails.jsx";

function MessageBox({ id, threadId, selected = false }) {
  const styles = {
    padding: "10px",
    backgroundColor: "#e6e6e6",
    boxShadow: selected ? "0 0 0 3px #333" : "none",
    boxSizing: "border-box",
    marginBottom: "10px",
  };

  return (
    <div style={styles} aria-selected={selected}>
      <p><strong>ID:</strong> {id}</p>
      <p><strong>Thread:</strong> {threadId}</p>
      <MessageDetails threadId={threadId} />
    </div>
  );
}

export default MessageBox;
