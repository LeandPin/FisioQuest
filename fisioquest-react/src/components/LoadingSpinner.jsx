import React from "react";

const spinnerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
};

const dotStyle = {
  width: "12px",
  height: "12px",
  margin: "0 4px",
  borderRadius: "50%",
  backgroundColor: "#4f46e5",
  animation: "bounce 1.4s infinite ease-in-out both",
};

function LoadingSpinner() {
  return (
    <div style={spinnerStyle} role="status" aria-label="Carregando">
      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
          .dot-1 { animation-delay: -0.32s; }
          .dot-2 { animation-delay: -0.16s; }
          .dot-3 { animation-delay: 0s; }
        `}
      </style>
      <div style={dotStyle} className="dot-1" />
      <div style={dotStyle} className="dot-2" />
      <div style={dotStyle} className="dot-3" />
    </div>
  );
}

export default LoadingSpinner;
