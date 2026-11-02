import { ref, computed } from 'vue';
import { buildLocalhostObject } from '../utils/domain';

export function useLocalhostInjection() {
    const injectLocalhost = ref(false);
    const injectLocalhostDisabled = ref(false);
    const LOCALHOST_OBJECT = ref<any>(null);

    const isCheckboxDisabled = computed(() => {
        return injectLocalhostDisabled.value;
    });

    function setLocalhostObject(tabUrl: string): { success: boolean; error?: string } {
        try {
            const localhostObj = buildLocalhostObject(tabUrl);
            if (!localhostObj) {
                return {
                    success: false,
                    error: 'Could not extract domain information from this page.',
                };
            }
            LOCALHOST_OBJECT.value = localhostObj;
            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: 'Could not set up localhost configuration for this page.',
            };
        }
    }

    return {
        injectLocalhost,
        injectLocalhostDisabled,
        LOCALHOST_OBJECT,
        isCheckboxDisabled,
        setLocalhostObject,
    };
}
