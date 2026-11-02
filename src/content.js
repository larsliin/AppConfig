// Content script for Config Copier Extension
// Runs in the context of web pages

console.log('[CS] Content script starting...');

/**
 * Store found config for background script to retrieve
 */
let foundConfig = null;

/**
 * Listen for messages from the background script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[CS] Message received:', request.action);

    if (request.action === 'getAppConfig') {
        console.log('[CS] Processing getAppConfig request');
        // Try to find and return config
        findAppConfigFile().then((config) => {
            console.log('[CS] findAppConfigFile returned:', !!config);
            const response = {
                success: !!config,
                data: config,
                error: config ? null : 'appConfig.json not found on this page',
            };
            console.log('[CS] Sending response:', response.success);
            sendResponse(response);
        }).catch((error) => {
            console.error('[CS] Error in findAppConfigFile:', error);
            sendResponse({
                success: false,
                error: error.message,
            });
        });
        return true; // Will respond asynchronously
    }
});

/**
 * Search for appConfig.json file on the page
 */
async function findAppConfigFile() {
    console.log('[CS] === findAppConfigFile START ===');

    const filesToTry = [
        '/appConfig.json',
        './appConfig.json',
        '../appConfig.json',
        'appConfig.json',
    ];

    for (const url of filesToTry) {
        try {
            console.log('[CS] Trying to fetch:', url);

            const response = await fetch(url, {
                method: 'GET',
                credentials: 'same-origin',
            });

            console.log('[CS] Fetch response status for', url + ':', response.status, response.ok);

            if (response.ok) {
                const contentType = response.headers.get('content-type');
                console.log('[CS] Content-Type:', contentType);

                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    console.log('[CS] Successfully parsed JSON from:', url, 'size:', JSON.stringify(data).length);
                    console.log('[CS] === findAppConfigFile END (success) ===');
                    return data;
                } else {
                    console.log('[CS] Content-Type is not JSON:', contentType);
                }
            }
        } catch (error) {
            console.log('[CS] Fetch failed for', url + ':', error.message);
            continue;
        }
    }

    console.log('[CS] === findAppConfigFile END (not found) ===');
    return null;
}

/**
 * On page load, try to detect appConfig.json automatically
 */
window.addEventListener('load', async () => {
    console.log('[CS] Page load event fired');
    try {
        foundConfig = await findAppConfigFile();
        if (foundConfig) {
            console.log('[CS] Config found on page load, notifying background');
            // Notify background script that config was found
            chrome.runtime.sendMessage({
                action: 'configFound',
                data: foundConfig,
            }).catch(() => {
                console.log('[CS] Background script not ready yet');
            });
        } else {
            console.log('[CS] No config found on page load');
        }
    } catch (error) {
        console.error('[CS] Error during auto-detection:', error);
    }
});

console.log('[CS] Content script loaded');
