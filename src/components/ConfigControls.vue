<script setup lang="ts">
    import BaseCheckbox from './bascomponents/BaseCheckbox.vue';
    import BaseButton from './bascomponents/BaseButton.vue';

    defineProps<{
        injectLocalhost: boolean;
        isCheckboxDisabled: boolean;
        isCopyDisabled: boolean;
    }>();

    defineEmits<{
        'update:injectLocalhost': [value: boolean];
        copy: [];
    }>();
</script>

<template>
    <div class="config-controls">
        <div class="checkbox-row">
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

        <BaseButton
            variant="primary"
            class="copy-button"
            @click="$emit('copy')"
            :disabled="isCopyDisabled"
        >
            Copy to Clipboard
        </BaseButton>
    </div>
</template>

<style scoped>
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
