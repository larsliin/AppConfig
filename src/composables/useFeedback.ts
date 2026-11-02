import { ref } from 'vue';

export function useFeedback() {
    const showCopyFeedback = ref(false);
    const showErrorFeedback = ref(false);

    function showFeedback(variant: 'success' | 'error') {
        if (variant === 'success') {
            showCopyFeedback.value = true;
        } else {
            showErrorFeedback.value = true;
        }
    }

    function clearFeedback() {
        showCopyFeedback.value = false;
        showErrorFeedback.value = false;
    }

    return {
        showCopyFeedback,
        showErrorFeedback,
        showFeedback,
        clearFeedback,
    };
}
