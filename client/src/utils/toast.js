import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

export const showToast = (message, type = "success") => {
  if (!message) return;
  const isSuccess = type === "success";
  Toastify({
    text: message,
    duration: 2500,
    gravity: "top",
    position: "right",
    close: true,
    style: {
      background: isSuccess
        ? "linear-gradient(135deg, #16a34a, #22c55e)"
        : "linear-gradient(135deg, #dc2626, #f43f5e)",
      boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
      borderRadius: "12px",
      fontWeight: 600,
    },
  }).showToast();
};
