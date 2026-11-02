<script setup lang="ts">
    import { ref, onMounted, computed } from 'vue';
    import BaseCheckbox from './components/bascomponents/BaseCheckbox.vue';
    import BaseButton from './components/bascomponents/BaseButton.vue';

    const appConfig = ref('');
    const configData = ref<any>(null);
    const injectLocalhost = ref(false);
    const injectLocalhostDisabled = ref(false);
    const copied = ref(false);
    const error = ref('');
    const loading = ref(false);

    const LOCALHOST_OBJECT = {
        tenantHost: 'dev7.wppes-map-dev.com',
        applicationHost: 'dev7.brief.wppes-map-dev.com',
    };

    // Compute the displayed config based on injection toggle
    const displayedConfig = computed(() => {
        if (!configData.value) return '';

        if (injectLocalhost.value && !configData.value.localhost) {
            const configWithLocalhost = {
                localhost: LOCALHOST_OBJECT,
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
        injectLocalhost.value = false;
        injectLocalhostDisabled.value = false;

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
                        injectLocalhost.value = false;
                        injectLocalhostDisabled.value = false;
                    }
                } else {
                    error.value = response?.error || 'Failed to load config';
                    appConfig.value = '';
                }
            },
        );
    }

    async function handleCopyToClipboard() {
        try {
            await navigator.clipboard.writeText(displayedConfig.value);
            copied.value = true;
            setTimeout(() => {
                copied.value = false;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            error.value = 'Failed to copy to clipboard';
        }
    }

    // Initialize dark mode based on OS preference
    onMounted(() => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        // Load config on mount
        handleRefresh();
    });
</script>

<template>
    <div id="app">
        <div class="config-container">
            <div class="config-header">
                <h1>AppConfig</h1>
                <BaseButton
                    variant="tool"
                    @click="handleRefresh"
                    title="Refresh config"
                    aria-label="Refresh"
                    :disabled="loading"
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
                readonly
                :placeholder="loading ? 'Loading config...' : 'No config loaded'"
            ></textarea>

            <div class="config-controls">
                <div class="control-item">
                    <label :class="{ disabled: injectLocalhostDisabled }">Inject Localhost</label>
                    <BaseCheckbox
                        v-model="injectLocalhost"
                        :disabled="injectLocalhostDisabled"
                    />
                </div>

                <BaseButton
                    variant="primary"
                    @click="handleCopyToClipboard"
                    :disabled="!displayedConfig"
                >
                    {{ copied ? 'Copied!' : 'Copy to Clipboard' }}
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
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
}

.control-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 0;
    flex-shrink: 0;
}

.control-item label {
    font-size: 13px;
    color: var(--color-text);
    font-weight: 500;
    white-space: nowrap;
}

.control-item label.disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
