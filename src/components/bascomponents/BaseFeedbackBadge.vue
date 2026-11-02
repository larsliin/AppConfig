<script setup lang="ts">
    defineProps<{
        variant?: 'success' | 'error'
        show: boolean
    }>();
</script>

<template>
    <div
        v-if="show || show === false"
        class="feedback-badge"
        :class="{ 'fade-out': !show, [variant || 'success']: true }"
    >
        <svg v-if="variant !== 'error'" width="90" height="90" fill="currentColor" viewBox="0 0 16 16">
            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
        </svg>
        <svg v-else width="90" height="90" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
    </div>
</template>

<style scoped>
.feedback-badge {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    z-index: 1000;
    opacity: 1;
    pointer-events: none;
}

.feedback-badge.success {
    background: #10b981;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.feedback-badge.error {
    background: #ef4444;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.feedback-badge.fade-out {
    opacity: 0;
    transition: opacity 1.5s ease-out;
}
</style>
