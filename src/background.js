// Background Service Worker for Config Copier Extension

// Note: We don't cache configs per-tab to avoid cross-tab contamination
// Always fetch fresh from the content script
let currentTabId = null;

console.log('[BG] Service worker script loading...');

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[BG] Message received:', request.action, 'from tab:', sender.tab?.id, 'sender.url:', sender.url);

    if (request.action === 'getConfig') {
        currentTabId = sender.tab?.id;
        console.log('[BG] Processing getConfig request from tab:', currentTabId);

        // If no tab ID from sender, try to get active tab
        if (!currentTabId) {
            console.log('[BG] No tab ID from sender, querying active tab...');
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length > 0) {
                    currentTabId = tabs[0].id;
                    console.log('[BG] Got active tab ID:', currentTabId);
                    handleGetConfig(currentTabId, sendResponse);
                } else {
                    console.log('[BG] No active tab found');
                    sendResponse({
                        success: false,
                        error: 'No active tab found. Make sure the popup is open from a browser tab.',
                    });
                }
            });
        } else {
            handleGetConfig(currentTabId, sendResponse);
        }
    } else if (request.action === 'configFound') {
        console.log('[BG] configFound message received from tab:', sender.tab?.id);
        // Don't cache - just log
        console.log('[BG] Config detected from auto-detection for tab:', sender.tab?.id);
    } else if (request.action === 'clearConfig') {
        handleClearConfig(sendResponse);
    }

    return true;
});

/**
 * Get configuration from various sources
 */
async function handleGetConfig(tabId, sendResponse) {
    try {
        console.log('[BG] === handleGetConfig START ===');
        console.log('[BG] Requesting config from tab:', tabId);

        // Always fetch fresh from the current tab - this is the source of truth
        if (tabId) {
            try {
                console.log('[BG] Sending getAppConfig message to content script on tab', tabId);
                const response = await chrome.tabs.sendMessage(tabId, {
                    action: 'getAppConfig',
                });

                console.log('[BG] Content script response:', response);

                if (response && response.success && response.data) {
                    const configSize = JSON.stringify(response.data).length;
                    console.log('[BG] Config found by content script, size:', configSize);
                    console.log('[BG] Config keys:', Object.keys(response.data));
                    console.log('[BG] Sending config to popup...');
                    sendResponse({
                        success: true,
                        data: response.data,
                    });
                    console.log('[BG] === handleGetConfig END (from content script) ===');
                    return;
                } else {
                    console.log('[BG] Content script response not successful:', response);
                    // If content script failed, don't fall back to storage - content script is authoritative
                    console.log('[BG] Content script is authoritative, not falling back to storage');
                    sendResponse({
                        success: false,
                        error: response?.error || 'appConfig.json not found. Make sure the file exists and is downloadable from this page.',
                    });
                    console.log('[BG] === handleGetConfig END (content script failed) ===');
                    return;
                }
            } catch (error) {
                console.error('[BG] Failed to message content script:', error.message);
                // Content script is not responding - don't use stale storage data
                console.log('[BG] Content script not responding, not using stale storage data');
                sendResponse({
                    success: false,
                    error: 'Unable to reach content script on this tab. The page may not be fully loaded or may not have appConfig.json available.',
                });
                console.log('[BG] === handleGetConfig END (content script error) ===');
                return;
            }
        } else {
            // No tab ID available
            console.log('[BG] No tab ID available');
            sendResponse({
                success: false,
                error: 'Unable to determine current tab.',
            });
            console.log('[BG] === handleGetConfig END (no tab ID) ===');
            return;
        }
    } catch (error) {
        console.error('[BG] Error in getConfig:', error);
        sendResponse({
            success: false,
            error: error.message,
        });
        console.log('[BG] === handleGetConfig END (exception) ===');
    }
}

/**
 * Clear stored configuration
 */
function handleClearConfig(sendResponse) {
    try {
        chrome.storage.local.remove('config', () => {
            console.log('[BG] Config cleared from storage');
            sendResponse({
                success: true,
                message: 'Configuration cleared',
            });
        });
    } catch (error) {
        sendResponse({
            success: false,
            error: error.message,
        });
    }
}

// Initialize on extension load
chrome.runtime.onInstalled.addListener(() => {
    console.log('[BG] Extension installed/updated');
    // Don't cache on startup - will fetch per-tab on demand
});

console.log('[BG] Background service worker initialized');

