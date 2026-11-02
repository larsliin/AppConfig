<script setup lang="ts">
    import { ref, onMounted, computed } from 'vue';
    import BaseCheckbox from './components/bascomponents/BaseCheckbox.vue';
    import BaseButton from './components/bascomponents/BaseButton.vue';
    import { useTheme } from './composables/useTheme';

    const appConfig = ref('');
    const configData = ref<any>(null);
    const injectLocalhost = ref(false);
    const injectLocalhostDisabled = ref(false);
    const showCopyFeedback = ref(false);
    const showErrorFeedback = ref(false);
    const error = ref('');
    const loading = ref(false);
    const LOCALHOST_OBJECT = ref<any>(null);
    let feedbackTimeout: number | null = null;

    // Compute whether the checkbox should be disabled
    const isCheckboxDisabled = computed(() => {
        return injectLocalhostDisabled.value || !!error.value;
    });

    // Compute whether the refresh button should be disabled
    const isRefreshDisabled = computed(() => {
        return loading.value || !!error.value;
    });
    
    useTheme();

    /**
     * Extract domain from URL
     * Removes protocol and www. but keeps domain extension
     * Example: "https://www.mydomain.com" -> "mydomain.com"
     */
    function extractDomain(url: string): string {
        try {
            const urlObj = new URL(url);
            let domain = urlObj.hostname;
            // Remove www. if present
            if (domain.startsWith('www.')) {
                domain = domain.substring(4);
            }
            return domain;
        } catch {
            return '';
        }
    }

    /**
     * Extract tenantHost by removing string between first and second dot
     * Example: "dev7.brief.wppes-map-dev.com" -> "dev7.wppes-map-dev.com"
     */
    function extractTenantHost(domain: string): string {
        const parts = domain.split('.');
        if (parts.length <= 2) {
            return domain;
        }
        // Remove the second part (index 1)
        parts.splice(1, 1);
        return parts.join('.');
    }

    /**
     * Build localhost object from current tab URL
     */
    function buildLocalhostObject(tabUrl: string): any {
        const domain = extractDomain(tabUrl);
        if (!domain) {
            return null;
        }

        return {
            tenantHost: extractTenantHost(domain),
            applicationHost: domain,
        };
    }

    // Compute the displayed config based on injection toggle
    const displayedConfig = computed(() => {
        if (!configData.value) return '';

        if (injectLocalhost.value && !configData.value.localhost) {
            const configWithLocalhost = {
                localhost: LOCALHOST_OBJECT.value,
                ...configData.value,
            };
            return JSON.stringify(configWithLocalhost, null, 2);
        }

        return JSON.stringify(configData.value, null, 2);
    });

    async function handleRefresh() {
        loading.value = true;
        error.value = '';
        appConfig.value = '';
        configData.value = null;
        
        // Store the current state of injectLocalhost to restore it after refresh
        const wasInjectLocalhostEnabled = injectLocalhost.value;

        chrome.runtime.sendMessage(
            { action: 'getConfig' },
            (response: any) => {
                loading.value = false;
                if (response && response.success && response.data) {
                    configData.value = response.data;
                    appConfig.value = JSON.stringify(response.data, null, 2);

                    // Check if localhost already exists
                    if (configData.value.localhost) {
                        injectLocalhost.value = true;
                        injectLocalhostDisabled.value = true;
                    } else {
                        // Restore the previous injectLocalhost state
                        injectLocalhost.value = wasInjectLocalhostEnabled;
                        injectLocalhostDisabled.value = false;
                        
                        // If the toggle was enabled, refresh the localhost object from current tab URL
                        if (wasInjectLocalhostEnabled) {
                            chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
                                if (tabs.length > 0) {
                                    const tabUrl = tabs[0].url;
                                    if (tabUrl) {
                                        LOCALHOST_OBJECT.value = buildLocalhostObject(tabUrl);
                                        console.log('[Popup] Refreshed LOCALHOST_OBJECT from URL:', LOCALHOST_OBJECT.value);
                                    }
                                }
                            });
                        }
                    }
                } else {
                    error.value = response?.error || 'Failed to load config';
                    appConfig.value = '';
                    // Restore the previous injectLocalhost state even on error
                    injectLocalhost.value = wasInjectLocalhostEnabled;
                }
            },
        );
    }

    function handleTextareaInput(event: Event) {
        if (event.target instanceof HTMLTextAreaElement) {
            appConfig.value = event.target.value;
        }
    }

    async function handleCopyToClipboard() {
        try {
            await navigator.clipboard.writeText(displayedConfig.value);
            
            // Clear any existing timeout
            if (feedbackTimeout) {
                clearTimeout(feedbackTimeout);
            }
            
            showCopyFeedback.value = true;
            
            // Start fade-out immediately
            feedbackTimeout = setTimeout(() => {
                showCopyFeedback.value = false;
                feedbackTimeout = null;
            }, 50);
        } catch (err) {
            console.error('Failed to copy:', err);
            
            // Clear any existing timeout
            if (feedbackTimeout) {
                clearTimeout(feedbackTimeout);
            }
            
            showErrorFeedback.value = true;
            
            // Start fade-out immediately
            feedbackTimeout = setTimeout(() => {
                showErrorFeedback.value = false;
                feedbackTimeout = null;
            }, 50);
        }
    }

    // Initialize dark mode based on OS preference
    onMounted(() => {
        // Theme is initialized by the useTheme composable
        
        // Get current tab URL and build localhost object
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
            if (tabs.length > 0) {
                const tabUrl = tabs[0].url;
                if (tabUrl) {
                    LOCALHOST_OBJECT.value = buildLocalhostObject(tabUrl);
                    console.log('[Popup] Built LOCALHOST_OBJECT from URL:', LOCALHOST_OBJECT.value);
                }
            }
        });

        // Load config on mount
        handleRefresh();
    });
</script>

<template>
    <div id="app">
        <div class="config-container">
                <div v-if="showCopyFeedback || showCopyFeedback === false" class="copy-feedback-badge" :class="{ 'fade-out': !showCopyFeedback }">
                    <svg width="90" height="90" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                    </svg>
                </div>
                <div v-if="showErrorFeedback || showErrorFeedback === false" class="error-feedback-badge" :class="{ 'fade-out': !showErrorFeedback }">
                    <svg width="90" height="90" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                </div>
            <div class="config-header">
                <h1>AppConfig Copier</h1>
                <BaseButton
                    variant="tool"
                    @click="handleRefresh"
                    title="Refresh config"
                    aria-label="Refresh"
                    :disabled="isRefreshDisabled"
                >
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                        <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                    </svg>
                </BaseButton>
            </div>

            <div v-if="error" class="error-message">
                {{ error }}
            </div>

            <textarea
                :value="displayedConfig"
                class="config-textarea"
                @input="handleTextareaInput"
                :placeholder="loading ? 'Loading config...' : 'No config loaded'"
            ></textarea>

            <div class="config-controls">
                <div class="checkbox-row">
                    <BaseCheckbox
                        id="inject-localhost-checkbox"
                        v-model="injectLocalhost"
                        :disabled="isCheckboxDisabled"
                    />
                    <label for="inject-localhost-checkbox" :class="{ disabled: isCheckboxDisabled }">Inject Localhost</label>
                </div>

                <BaseButton
                    variant="primary"
                    class="copy-button"
                    @click="handleCopyToClipboard"
                    :disabled="!displayedConfig"
                >
                    Copy to Clipboard
                </BaseButton>
            </div>
        </div>
    </div>
</template>

<style scoped>
#app {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.config-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 12px;
    gap: 12px;
    overflow: hidden;
}

.config-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.config-header h1 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text);
}

.error-message {
    padding: 8px 12px;
    background: rgba(220, 38, 38, 0.15);
    border: 1px solid rgba(220, 38, 38, 0.3);
    border-radius: var(--radius-button);
    color: #ef4444;
    font-size: 12px;
    word-break: break-word;
}

.config-textarea {
    flex: 1;
    padding: 8px;
    background: var(--color-panel);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-button);
    color: var(--color-text);
    font-family: ui-monospace, Menlo, Consolas, monospace;
    font-size: 12px;
    line-height: 1.4;
    resize: none;
    overflow-y: auto;
}

.config-textarea:focus {
    outline: none;
    border-color: var(--color-accent);
}

.config-controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.checkbox-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
}

.checkbox-row label {
    font-size: 13px;
    color: var(--color-text);
    font-weight: 500;
    white-space: nowrap;
}

.checkbox-row label.disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.copy-button {
    align-self: flex-end;
}

.copy-feedback-badge {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: #10b981;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    z-index: 1000;
    opacity: 1;
    pointer-events: none;
}

.copy-feedback-badge.fade-out {
    opacity: 0;
    transition: opacity 1.5s ease-out;
}

.error-feedback-badge {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: #ef4444;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
    z-index: 1000;
    opacity: 1;
    pointer-events: none;
}

.error-feedback-badge.fade-out {
    opacity: 0;
    transition: opacity 1.5s ease-out;
}
</style>
