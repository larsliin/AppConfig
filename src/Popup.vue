<script setup lang="ts">
    import { ref, onMounted, onUnmounted, watch } from 'vue';
    import { json } from '@codemirror/lang-json';
    import { BaseCodeEditor } from 'chrome-extension-component-library/code-editor';
    import BaseFeedbackBadge from './components/bascomponents/BaseFeedbackBadge.vue';
    import BaseAlert from './components/bascomponents/BaseAlert.vue';
    import PopupHeader from './components/PopupHeader.vue';
    import ConfigControls from './components/ConfigControls.vue';
    import { useTheme } from './composables/useTheme';
    import { useConfigManager } from './composables/useConfigManager';
    import { useFeedback } from './composables/useFeedback';

    const isDarkMode = ref(true);
    const jsonLanguage = json();
    let themeObserver: MutationObserver | null = null;

    const { showCopyFeedback, showErrorFeedback, feedbackKey, showFeedback, clearFeedback } = useFeedback();

    const {
        configData,
        appConfig,
        error,
        warningError,
        loading,
        injectLocalhost,
        isRefreshDisabled,
        isEditorDisabled,
        isCheckboxLocalhostDisabled,
        displayedConfig,
        handleRefresh,
        updateEditorContent,
        initializeLocalhost,
        cleanupTimeouts,
    } = useConfigManager();

    useTheme();

    watch(injectLocalhost, () => {
        if (configData.value) {
            updateEditorContent(displayedConfig.value);
        }
    });

    watch(isDarkMode, () => {
        if (appConfig.value) {
            updateEditorContent(appConfig.value);
        }
    });

    function handleCopyError(message: string) {
        console.error('Failed to copy:', message);
        showFeedback('error');
    }

    function handleCopySuccess() {
        showFeedback('success');
    }

    function updateThemeDetection() {
        const root = document.documentElement;
        const hasLightThemeAttr = root.hasAttribute('data-theme');
        isDarkMode.value = !hasLightThemeAttr;
    }

    onMounted(() => {
        try {
            updateThemeDetection();

            themeObserver = new MutationObserver(() => {
                updateThemeDetection();
            });

            themeObserver.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['data-theme'],
            });

            initializeLocalhost();
            handleRefresh();
        } catch (err) {
            console.error('Error during component mount:', err);
        }
    });

    onUnmounted(() => {
        themeObserver?.disconnect();
        clearFeedback();
        cleanupTimeouts();
    });
</script>

<template>
    <div id="app">
        <div class="config-container">
            <BaseFeedbackBadge
                :key="`success-${feedbackKey}`"
                variant="success"
                :show="showCopyFeedback"
                @finished="clearFeedback"
            />
            <BaseFeedbackBadge
                :key="`error-${feedbackKey}`"
                variant="error"
                :show="showErrorFeedback"
                @finished="clearFeedback"
            />

            <PopupHeader :is-refresh-disabled="isRefreshDisabled" @refresh="handleRefresh" />

            <BaseAlert :show="!!error" :message="error" variant="error" />
            <BaseAlert :show="!!warningError" :message="warningError" variant="warning" />

            <BaseCodeEditor
                :model-value="appConfig"
                :language="jsonLanguage"
                :theme="isDarkMode ? 'dark' : 'light'"
                :readonly="isEditorDisabled"
                :loading="loading"
                label="AppConfig JSON editor"
                class="config-editor"
                @update:model-value="updateEditorContent"
            />

            <ConfigControls
                :inject-localhost="injectLocalhost"
                :is-checkbox-disabled="isCheckboxLocalhostDisabled"
                :is-copy-disabled="!appConfig"
                :copy-value="appConfig"
                @update:inject-localhost="(val) => (injectLocalhost = val)"
                @copied="handleCopySuccess"
                @copy-error="handleCopyError"
            />
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

    .config-editor {
        flex: 1;
        min-height: 0;
    }

    .config-editor :deep(.cm-line) {
        white-space: pre !important;
    }
</style>
