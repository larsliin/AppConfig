<script setup lang="ts">
    import { BaseSwitch, BaseCopyButton } from 'chrome-extension-component-library';

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
        <BaseSwitch
            :model-value="injectLocalhost"
            @update:model-value="$emit('update:injectLocalhost', $event)"
            :disabled="isCheckboxDisabled"
            label="Include Localhost config (tenantHost, applicationHost)"
        />

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

    .copy-button {
        align-self: flex-end;
    }
</style>
