<script setup lang="ts">
    const model = defineModel<boolean>({ required: true });

    const props = defineProps<{
        disabled?: boolean;
    }>();

    function updateChecked(event: Event) {
        if (event.target instanceof HTMLInputElement) model.value = event.target.checked;
    }
</script>

<template>
    <input
        type="checkbox"
        :checked="model"
        :disabled="props.disabled"
        @change="updateChecked"
        class="base-checkbox"
    />
</template>

<style scoped>
.base-checkbox {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: var(--color-accent);
    border-radius: 2px;
}

.base-checkbox:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 1px;
}

.base-checkbox:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
