<script setup lang="ts">
    import { BaseIconButton } from 'chrome-extension-component-library';

    defineProps<{
        isRefreshDisabled: boolean;
    }>();

    defineEmits<{
        refresh: [];
    }>();
</script>

<template>
    <div class="config-header">
        <h1>Catalyst AppConfig Copier</h1>
        <BaseIconButton
            label="Refresh config"
            @click="$emit('refresh')"
            :disabled="isRefreshDisabled"
        >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
            </svg>
        </BaseIconButton>
    </div>
</template>

<style scoped>
    .config-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    .config-header h1 {
        margin: 0;
        color: #e0e0e0;
        letter-spacing: -.02em;
        font-size: 18px;
        font-weight: 650;
        line-height: 1.25;
    }
</style>
