function MessageBox({ label, selected = false }) {
  const styles = {
    width: "50px",
    height: "50px",
    padding: "10px",
    backgroundColor: "#c9c9c9",
    boxShadow: selected ? "0 0 0 3px #333" : "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    marginRight: "10px",
  };

  return (
    <div style={styles} aria-selected={selected}>
      {label}
    </div>
  );
}

export default MessageBox;
