<script setup lang="ts">
    import { BaseCheckbox, BaseCopyButton } from 'chrome-extension-component-library';

    defineProps<{
        injectLocalhost: boolean;
        isCheckboxDisabled: boolean;
        isCopyDisabled: boolean;
        copyValue: string;
    }>();

    defineEmits<{
        'update:injectLocalhost': [value: boolean];
        copied: [value: string];
        copyError: [message: string];
    }>();
</script>

<template>
    <div class="config-controls">
        <div class="config-checkbox-row">
            <BaseCheckbox
                id="inject-localhost-checkbox"
                :model-value="injectLocalhost"
                @update:model-value="$emit('update:injectLocalhost', $event)"
                :disabled="isCheckboxDisabled"
            />
            <label for="inject-localhost-checkbox" :class="{ disabled: isCheckboxDisabled }">
                Include Localhost config (tenantHost, applicationHost)
            </label>
        </div>

        <BaseCopyButton
            :value="copyValue"
            variant="primary"
            label="Copy to Clipboard"
            copied-label="Copied!"
            class="copy-button"
            :disabled="isCopyDisabled"
            @copied="$emit('copied', $event)"
            @error="$emit('copyError', $event)"
        />
    </div>
</template>

<style scoped>
    .config-controls {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .config-checkbox-row {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
    }

    .config-checkbox-row label {
        font-size: 13px;
        color: var(--color-text);
        font-weight: 500;
        white-space: nowrap;
    }

    .config-checkbox-row label.disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .copy-button {
        align-self: flex-end;
    }
</style>
