function showToast(message, type = "info", duration = 4000) {
  let className = "toast-info";

  if (type === "success") className = "toast-success";
  else if (type === "error") className = "toast-error";
  else if (type === "warning") className = "toast-warning";

  Toastify({
    text: message,
    duration: duration,
    close: true,
    gravity: "top",
    position: "right",
    className: className,  // 👈 use custom class
  }).showToast();
}

window.toastSuccess = (msg) => showToast(msg, "success");
window.toastError = (msg) => showToast(msg, "error");
window.toastInfo = (msg) => showToast(msg, "info");
window.toastWarning = (msg) => showToast(msg, "warning");
