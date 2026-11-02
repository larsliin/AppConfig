<script setup lang="ts">
    defineProps<{
        variant?: 'error' | 'warning' | 'info'
        show: boolean
        message: string
    }>();
</script>

<template>
    <div v-if="show && message" class="alert" :class="[variant || 'error']">
        <svg
            v-if="variant === 'warning'"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
        >
            <!-- Warning icon -->
            <path
                d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0l-5.708 9.7a1.13 1.13 0 0 0 .98 1.734h11.396a1.13 1.13 0 0 0 .98-1.734L8.982 1.566ZM8 5c.535 0 .954.462.756 1.047l-.94 2.969h.994a.75.75 0 0 1 .75.75v.007a.75.75 0 0 1-.75.75h.992a.75.75 0 0 1 .75.75v.007a.75.75 0 0 1-.75.75H7.956a.75.75 0 0 1-.75-.75v-.008a.75.75 0 0 1 .75-.75h.994l-.94-2.969C7.046 5.462 7.465 5 8 5Zm.995 12a1 1 0 1 1-1.99 0 1 1 0 0 1 1.99 0Z"
            />
        </svg>
        <svg v-if="variant === 'info'" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <!-- Info icon -->
            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
        </svg>
        <div class="message">{{ message }}</div>
    </div>
</template>

<style scoped>
.alert {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 12px;
    border-radius: var(--radius-button);
    font-size: 12px;
    word-break: break-word;
    line-height: 1.4;
}

.alert svg {
    flex-shrink: 0;
    margin-top: 2px;
}

.message {
    flex: 1;
}

.alert.error {
    background: rgba(220, 38, 38, 0.15);
    border: 1px solid rgba(220, 38, 38, 0.3);
    color: #ef4444;
}

.alert.warning {
    background: rgba(217, 119, 6, 0.15);
    border: 1px solid rgba(217, 119, 6, 0.3);
    color: #d97706;
}

.alert.info {
    background: rgba(37, 99, 235, 0.15);
    border: 1px solid rgba(37, 99, 235, 0.3);
    color: #2563eb;
}
</style>
