function Button({ children, onClick, type = "button", disabled = false, state, className }) {
  const classes = ["app-button", className].filter(Boolean).join(" ");
  // Optional data-state is used by CSS to style focus/active states.
  const dataState = state ? { "data-state": state } : {};

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...dataState}
    >
      {children}
    </button>
  );
}

export default Button;
