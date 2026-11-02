// Content script for Config Copier Extension
// Runs in the context of web pages

let foundConfig = null;

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getAppConfig') {
        findAppConfigFile().then((config) => {
            const response = {
                success: !!config,
                data: config,
                error: config ? null : 'appConfig.json not found on this page',
            };
            sendResponse(response);
        }).catch((error) => {
            sendResponse({
                success: false,
                error: error.message,
            });
        });
        return true;
    }
});

/**
 * Search for appConfig.json file on the page
 */
async function findAppConfigFile() {
    const filesToTry = [
        '/appConfig.json',
        './appConfig.json',
        '../appConfig.json',
        'appConfig.json',
    ];

    for (const url of filesToTry) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'same-origin',
            });

            if (response.ok) {
                const contentType = response.headers.get('content-type');

                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    return data;
                }
            }
        } catch {
            continue;
        }
    }

    return null;
}

// On page load, try to detect appConfig.json automatically
window.addEventListener('load', async () => {
    try {
        foundConfig = await findAppConfigFile();
        if (foundConfig) {
            chrome.runtime.sendMessage({
                action: 'configFound',
                data: foundConfig,
            }).catch(() => {
                // Background script not ready yet
            });
        }
    } catch {
        // Error during auto-detection
    }
});

