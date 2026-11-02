import { ref } from 'vue';

export function useFeedback() {
    const showCopyFeedback = ref(false);
    const showErrorFeedback = ref(false);
    const feedbackKey = ref(0);

    function showFeedback(variant: 'success' | 'error') {
        feedbackKey.value += 1;
        showCopyFeedback.value = variant === 'success';
        showErrorFeedback.value = variant === 'error';
    }

    function clearFeedback() {
        showCopyFeedback.value = false;
        showErrorFeedback.value = false;
    }

    return {
        showCopyFeedback,
        showErrorFeedback,
        feedbackKey,
        showFeedback,
        clearFeedback,
    };
}
