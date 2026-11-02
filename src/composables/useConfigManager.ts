import { ref, computed } from 'vue';
import { useLocalhostInjection } from './useLocalhostInjection';

const CONFIG_NOT_FOUND_ERROR = 'Failed to read appConfig.json. Try reloading the page.';

export function useConfigManager() {
    const configData = ref<any>(null);
    const appConfig = ref('');
    const error = ref('');
    const loading = ref(false);

    const { injectLocalhost, injectLocalhostDisabled, LOCALHOST_OBJECT, isCheckboxDisabled, setLocalhostObject } =
        useLocalhostInjection();

    const isRefreshDisabled = computed(() => loading.value || !!error.value);
    const isEditorDisabled = computed(() => !!error.value);
    const isCheckboxLocalhostDisabled = computed(() => isCheckboxDisabled.value || isEditorDisabled.value);

    const displayedConfig = computed(() => {
        if (!configData.value) return '';

        try {
            if (injectLocalhost.value && !configData.value.localhost && LOCALHOST_OBJECT.value) {
                return JSON.stringify(
                    { localhost: LOCALHOST_OBJECT.value, ...configData.value },
                    null,
                    2
                );
            }
            return JSON.stringify(configData.value, null, 2);
        } catch (err) {
            setError('The appConfig.json file is not in a valid format. Please check the file.');
            return '';
        }
    });

    function setError(message: string) {
        error.value = message;
    }

    function clearError() {
        error.value = '';
    }

    function updateEditorContent(newContent: string) {
        appConfig.value = newContent;
    }

    function checkChromeError(operation: string): boolean {
        if (!chrome.runtime.lastError) return false;
        console.warn(`${operation}:`, chrome.runtime.lastError.message);
        return true;
    }

    function queryAndValidateTabUrl(callback: (url: string | null) => void) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
            if (checkChromeError('Failed to query active tab')) return;
            if (!tabs || tabs.length === 0) {
                console.warn('No active tab found');
                return callback(null);
            }

            const tabUrl = tabs[0]?.url;
            if (!tabUrl || typeof tabUrl !== 'string') {
                console.warn('Active tab has no valid URL (may be a special page)');
                return callback(null);
            }

            callback(tabUrl);
        });
    }

    function handleRefresh() {
        loading.value = true;
        error.value = '';
        appConfig.value = '';
        configData.value = null;

        const wasInjectLocalhostEnabled = injectLocalhost.value;

        chrome.runtime.sendMessage({ action: 'getConfig' }, (response: any) => {
            loading.value = false;

            if (checkChromeError('Communication error')) {
                setError('Something went wrong. Please close and reopen the extension popup.');
                updateEditorContent('');
                return;
            }

            if (!response) {
                setError(CONFIG_NOT_FOUND_ERROR);
                updateEditorContent('');
                return;
            }

            if (!response.success) {
                setError(response?.error || CONFIG_NOT_FOUND_ERROR);
                updateEditorContent('');
                injectLocalhost.value = wasInjectLocalhostEnabled;
                return;
            }

            if (!response.data || typeof response.data !== 'object') {
                setError('The appConfig.json file appears to be corrupted. Try reloading the page.');
                updateEditorContent('');
                injectLocalhost.value = wasInjectLocalhostEnabled;
                return;
            }

            try {
                configData.value = response.data;

                if (configData.value.localhost) {
                    injectLocalhost.value = true;
                    injectLocalhostDisabled.value = true;
                } else {
                    injectLocalhost.value = wasInjectLocalhostEnabled;
                    injectLocalhostDisabled.value = false;

                    if (wasInjectLocalhostEnabled) {
                        queryAndValidateTabUrl((tabUrl) => {
                            if (!tabUrl) return;
                            const result = setLocalhostObject(tabUrl);
                            if (!result.success) {
                                console.warn('Localhost injection unavailable:', result.error);
                            }
                        });
                    }
                }

                updateEditorContent(displayedConfig.value);
            } catch (err) {
                setError('Could not process the appConfig.json file. Try reloading the page.');
                updateEditorContent('');
                injectLocalhost.value = wasInjectLocalhostEnabled;
            }
        });
    }

    function initializeLocalhost() {
        queryAndValidateTabUrl((tabUrl) => {
            if (!tabUrl) return;
            const result = setLocalhostObject(tabUrl);
            if (!result.success) {
                console.warn('Initial localhost setup failed:', result.error);
            }
        });
    }

    function cleanupTimeouts() {
        // No timeouts to clean up - errors persist until manually cleared
    }

    return {
        configData,
        appConfig,
        error,
        loading,
        injectLocalhost,
        injectLocalhostDisabled,
        isCheckboxDisabled,
        isRefreshDisabled,
        isEditorDisabled,
        isCheckboxLocalhostDisabled,
        displayedConfig,
        setError,
        clearError,
        handleRefresh,
        updateEditorContent,
        initializeLocalhost,
        cleanupTimeouts,
    };
}
