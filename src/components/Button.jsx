import { forwardRef } from "react";

const Button = forwardRef(function Button(
  { children, onClick, type = "button", disabled = false, state, className },
  ref
) {
  const classes = ["app-button", className].filter(Boolean).join(" ");
  // Optional data-state is used by CSS to style focus/active states.
  const dataState = state ? { "data-state": state } : {};

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...dataState}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
