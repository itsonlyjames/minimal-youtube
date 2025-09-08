// Content script for YouTube style modifications
let stylesEnabled = true;
let styleElement = null;

// Initialize when page loads
initialize();

async function initialize() {
  // Get stored preference
  const result = await chrome.storage.sync.get(["stylesEnabled"]);
  stylesEnabled = result.stylesEnabled !== false; // Default to true

  // Apply or remove styles based on preference
  if (stylesEnabled) {
    applyStyles();
  } else {
    removeStyles();
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggleStyles") {
    stylesEnabled = message.enabled;

    if (stylesEnabled) {
      applyStyles();
    } else {
      removeStyles();
    }

    sendResponse({ success: true });
  }
});

function applyStyles() {
  // Remove existing style element if it exists
  removeStyles();

  // Create new style element
  styleElement = document.createElement("style");
  styleElement.id = "youtube-custom-styles";

  // Add your custom CSS here - example styles below
  styleElement.textContent = `
ytd-app #masthead-container.ytd-app {
  transform: translateY(calc(var(--ytd-toolbar-height) * -1));
  display: none;
}
ytd-page-manager#page-manager.ytd-app {
  margin-top: 0 !important;
}
ytd-watch-flexy[full-bleed-player] #full-bleed-container.ytd-watch-flexy {
  height: 100vh !important;
  max-height: 100vh !important;
  min-height: auto !important;
}
  `;

  // Append to head
  document.head.appendChild(styleElement);

  triggerResize();
}

function removeStyles() {
  if (styleElement) {
    styleElement.remove();
    styleElement = null;
  }

  // Also remove any existing style elements with our ID
  const existingStyles = document.getElementById("youtube-custom-styles");
  if (existingStyles) {
    existingStyles.remove();
  }

  triggerResize();
}

function triggerResize() {
  requestAnimationFrame(() => {
    window.dispatchEvent(new Event("resize"));
  });
}

// Handle page navigation (YouTube is a SPA)
let currentUrl = location.href;
new MutationObserver(() => {
  if (location.href !== currentUrl) {
    currentUrl = location.href;
    // Re-apply styles after navigation if enabled
    if (stylesEnabled) {
      setTimeout(applyStyles, 1000);
    }
  }
}).observe(document, { subtree: true, childList: true });
