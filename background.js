// Background service worker for the YouTube extension

chrome.runtime.onInstalled.addListener(async () => {
  // Set default state
  await chrome.storage.sync.set({
    stylesEnabled: false
  });
});

// Listen for tab updates to ensure styles persist
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only act when page is completely loaded and it's a YouTube page
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com')) {
    // Get current preference
    const result = await chrome.storage.sync.get(['stylesEnabled']);
    const stylesEnabled = result.stylesEnabled !== false;
    
    // Send message to content script to apply styles
    try {
      await chrome.tabs.sendMessage(tabId, {
        action: 'toggleStyles',
        enabled: stylesEnabled
      });
    } catch (error) {
      // Content script might not be ready yet, that's okay
      console.log('Could not send message to content script:', error);
    }
  }
});

// Handle storage changes (if user changes settings in another tab)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.stylesEnabled) {
    console.log('Styles preference changed:', changes.stylesEnabled.newValue);
  }
});
