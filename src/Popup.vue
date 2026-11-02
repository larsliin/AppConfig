<script setup lang="ts">
    import { ref, onMounted, computed, watch, nextTick } from 'vue';
    import { EditorView } from 'codemirror';
    import { EditorState } from '@codemirror/state';
    import { json } from '@codemirror/lang-json';
    import { lineNumbers } from '@codemirror/view';
    import { oneDark } from '@codemirror/theme-one-dark';
    import BaseCheckbox from './components/bascomponents/BaseCheckbox.vue';
    import BaseButton from './components/bascomponents/BaseButton.vue';
    import BaseFeedbackBadge from './components/bascomponents/BaseFeedbackBadge.vue';
    import { useTheme } from './composables/useTheme';
    import { useLocalhostInjection } from './composables/useLocalhostInjection';

    const appConfig = ref('');
    const configData = ref<any>(null);
    const showCopyFeedback = ref(false);
    const showErrorFeedback = ref(false);
    const error = ref('');
    const loading = ref(false);
    const editorContainer = ref<HTMLDivElement>();
    const isDarkMode = ref(true);
    let editorView: EditorView | null = null;
    let feedbackTimeout: number | null = null;

    const { injectLocalhost, injectLocalhostDisabled, LOCALHOST_OBJECT, isCheckboxDisabled, setLocalhostObject } = useLocalhostInjection();

    const isRefreshDisabled = computed(() => {
        return loading.value || !!error.value;
    });

    useTheme();

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

        const wasInjectLocalhostEnabled = injectLocalhost.value;

        chrome.runtime.sendMessage(
            { action: 'getConfig' },
            (response: any) => {
                loading.value = false;
                if (response && response.success && response.data) {
                    configData.value = response.data;

                    if (configData.value.localhost) {
                        injectLocalhost.value = true;
                        injectLocalhostDisabled.value = true;
                    } else {
                        injectLocalhost.value = wasInjectLocalhostEnabled;
                        injectLocalhostDisabled.value = false;

                        if (wasInjectLocalhostEnabled) {
                            chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
                                if (tabs.length > 0) {
                                    const tabUrl = tabs[0].url;
                                    if (tabUrl) {
                                        setLocalhostObject(tabUrl);
                                    }
                                }
                            });
                        }
                    }

                    // Update editor after determining localhost injection state
                    updateEditorContent(displayedConfig.value);
                } else {
                    error.value = response?.error || 'Failed to load config';
                    updateEditorContent('');
                    injectLocalhost.value = wasInjectLocalhostEnabled;
                }
            },
        );
    }

    async function handleCopyToClipboard() {
        try {
            const textToCopy = editorView?.state.doc.toString() || appConfig.value;
            await navigator.clipboard.writeText(textToCopy);

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

    // Watch for localhost injection toggle changes
    watch(injectLocalhost, () => {
        if (configData.value) {
            updateEditorContent(displayedConfig.value);
        }
    });

    // Watch for theme changes and update editor
    watch(isDarkMode, () => {
        if (editorView && appConfig.value) {
            updateEditorContent(appConfig.value);
        }
    });

    function getEditorExtensions() {
        return [
            json(),
            lineNumbers(),
            isDarkMode.value ? oneDark : [],
        ];
    }

    function updateThemeDetection() {
        const root = document.documentElement;
        const hasLightThemeAttr = root.hasAttribute('data-theme');
        isDarkMode.value = !hasLightThemeAttr;
    }

    function initializeEditor() {
        if (!editorContainer.value || editorView) return;

        const state = EditorState.create({
            doc: appConfig.value,
            extensions: getEditorExtensions(),
        });

        editorView = new EditorView({
            state,
            parent: editorContainer.value,
        });
    }

    function updateEditorContent(newContent: string) {
        appConfig.value = newContent;
        if (editorView) {
            editorView.setState(
                EditorState.create({
                    doc: newContent,
                    extensions: getEditorExtensions(),
                }),
            );
        }
    }

    // Initialize dark mode based on extension theme setting
    onMounted(() => {
        // Detect initial theme
        updateThemeDetection();

        // Watch for theme changes
        const observer = new MutationObserver(() => {
            updateThemeDetection();
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
            if (tabs.length > 0) {
                const tabUrl = tabs[0].url;
                if (tabUrl) {
                    setLocalhostObject(tabUrl);
                }
            }
        });

        handleRefresh();
        nextTick(() => {
            initializeEditor();
        });

        return () => {
            observer.disconnect();
        };
    });
</script>

<template>
    <div id="app">
        <div class="config-container">
            <BaseFeedbackBadge variant="success" :show="showCopyFeedback" />
            <BaseFeedbackBadge variant="error" :show="showErrorFeedback" />
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

            <div ref="editorContainer" class="code-editor-container"></div>

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

.code-editor-container {
    flex: 1;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-button);
    background: var(--color-panel);
    overflow: hidden;
}

.code-editor-container :deep(.cm-editor) {
    font-family: ui-monospace, Menlo, Consolas, monospace;
    font-size: 12px;
    line-height: 1.4;
    height: 100%;
}

.code-editor-container :deep(.cm-content) {
    padding: 8px;
    color: var(--color-text);
}

.code-editor-container :deep(.cm-line) {
    white-space: pre !important;
}

.code-editor-container :deep(.cm-scroller) {
    overflow: auto;
}

.code-editor-container :deep(.cm-gutters) {
    background-color: transparent;
    border-right: 1px solid var(--color-border);
    padding-right: 4px;
}

.code-editor-container :deep(.cm-linenumber) {
    color: var(--color-text-secondary, #999);
    text-align: right;
    padding-right: 8px;
    min-width: 2.5em;
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
</style>
