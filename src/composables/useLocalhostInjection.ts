import { ref, computed } from 'vue';
import { buildLocalhostObject } from '../utils/domain';

export function useLocalhostInjection() {
    const injectLocalhost = ref(false);
    const injectLocalhostDisabled = ref(false);
    const LOCALHOST_OBJECT = ref<any>(null);

    const isCheckboxDisabled = computed(() => {
        return injectLocalhostDisabled.value;
    });

    function setLocalhostObject(tabUrl: string): void {
        LOCALHOST_OBJECT.value = buildLocalhostObject(tabUrl);
    }

    return {
        injectLocalhost,
        injectLocalhostDisabled,
        LOCALHOST_OBJECT,
        isCheckboxDisabled,
        setLocalhostObject,
    };
}
