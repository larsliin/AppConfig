// Background Service Worker for Config Copier Extension

let currentTabId = null;

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getConfig') {
        currentTabId = sender.tab?.id;

        if (!currentTabId) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length > 0) {
                    currentTabId = tabs[0].id;
                    handleGetConfig(currentTabId, sendResponse);
                } else {
                    sendResponse({
                        success: false,
                        error: 'No active tab found. Make sure the popup is open from a browser tab.',
                    });
                }
            });
        } else {
            handleGetConfig(currentTabId, sendResponse);
        }
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
        if (tabId) {
            try {
                const response = await chrome.tabs.sendMessage(tabId, {
                    action: 'getAppConfig',
                });

                if (response && response.success && response.data) {
                    sendResponse({
                        success: true,
                        data: response.data,
                    });
                    return;
                } else {
                    sendResponse({
                        success: false,
                        error: response?.error || 'appConfig.json not found. Make sure the file exists and is downloadable from this page.',
                    });
                    return;
                }
            } catch {
                sendResponse({
                    success: false,
                    error: 'Unable to reach content script on this tab. The page may not be fully loaded or may not have appConfig.json available.',
                });
                return;
            }
        } else {
            sendResponse({
                success: false,
                error: 'Unable to determine current tab.',
            });
            return;
        }
    } catch (error) {
        sendResponse({
            success: false,
            error: error.message,
        });
    }
}

/**
 * Clear stored configuration
 */
function handleClearConfig(sendResponse) {
    try {
        chrome.storage.local.remove('config', () => {
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
    // Extension installed/updated
});

