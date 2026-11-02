// Popup initialization - logging and error handling
// This must be a regular script (not module) to run early

console.log('[HTML] Popup.html loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('[HTML] DOMContentLoaded event fired');
});

// Catch any global errors
window.addEventListener('error', (event) => {
    console.error('[HTML] Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('[HTML] Unhandled rejection:', event.reason);
});
