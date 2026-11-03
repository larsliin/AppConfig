// Background Service Worker for Config Copier Extension

chrome.action.disable();

chrome.runtime.onInstalled.addListener(async () => {
    const imageData = Object.fromEntries(await Promise.all([16, 48, 128].map(async (size) => {
        const response = await fetch(chrome.runtime.getURL(`icons/icon-${size}.png`));
        const bitmap = await createImageBitmap(await response.blob());
        const canvas = new OffscreenCanvas(size, size);
        const context = canvas.getContext('2d');
        context.drawImage(bitmap, 0, 0);
        bitmap.close();
        return [size, context.getImageData(0, 0, size, size)];
    })));

    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                { hostContains: 'wppes-map-dev.com' },
                { hostContains: 'wppes-map-stage.com' },
                { hostContains: 'catalyst.online' },
                { hostEquals: 'localhost' },
            ].map((pageUrl) => new chrome.declarativeContent.PageStateMatcher({
                pageUrl,
            })),
            actions: [
                new chrome.declarativeContent.SetIcon({ imageData }),
                new chrome.declarativeContent.ShowAction(),
            ],
        }]);
    });
});

const USER_FRIENDLY_ERRORS = {
    'Could not establish connection. Receiving end does not exist.':
        'Failed to read appConfig.json. Try reloading the page.',
    'The tab was closed.':
        'The page was closed. Please try again.',
    'Tabs cannot be accessed in this context.':
        'Failed to read appConfig.json. Try reloading the page.',
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getConfig') {
        handleGetConfig(sendResponse);
    }
    return true;
});

function getUserFriendlyError(techError) {
    // Check for known Chrome errors and map to friendly messages
    for (const [techMsg, friendlyMsg] of Object.entries(USER_FRIENDLY_ERRORS)) {
        if (techError?.includes(techMsg)) {
            return friendlyMsg;
        }
    }
    // Default to standard message
    return 'Failed to read appConfig.json. Try reloading the page.';
}

async function handleGetConfig(sendResponse) {
    try {
        // Query for the active tab since message comes from popup, not content script
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tabs || tabs.length === 0 || !tabs[0]?.id) {
            sendResponse({
                success: false,
                error: 'Please make sure a webpage is open in this window.',
            });
            return;
        }

        const tabId = tabs[0].id;

        try {
            const response = await chrome.tabs.sendMessage(tabId, {
                action: 'getAppConfig',
            });

            if (response?.success && response.data) {
                sendResponse({
                    success: true,
                    data: response.data,
                });
            } else {
                sendResponse({
                    success: false,
                    error: response?.error || 'Failed to read appConfig.json. Try reloading the page.',
                });
            }
        } catch (error) {
            const friendlyError = getUserFriendlyError(error.message);
            sendResponse({
                success: false,
                error: friendlyError,
            });
        }
    } catch (error) {
        sendResponse({
            success: false,
            error: 'Could not access the page. Try reloading the page.',
        });
    }
}

