import { onMounted, onUnmounted } from 'vue';

let mediaQueryList: MediaQueryList | null = null;

/**
 * Apply theme to DOM based on OS preference
 */
function applyTheme(isDark: boolean) {
    const root = document.documentElement;
    if (isDark) {
        root.removeAttribute('data-theme');
    } else {
        root.setAttribute('data-theme', 'light');
    }
}

/**
 * Initialize and sync theme with OS preference
 */
function initTheme() {
    if (window.matchMedia) {
        const darkPreference = window.matchMedia('(prefers-color-scheme: dark)');
        applyTheme(darkPreference.matches);

        // Listen for OS theme changes
        mediaQueryList = darkPreference;
        mediaQueryList.addEventListener('change', (e) => {
            applyTheme(e.matches);
        });
    }
}

/**
 * Composable hook for automatic OS theme syncing
 */
export function useTheme() {
    onMounted(() => {
        initTheme();
    });

    onUnmounted(() => {
        if (mediaQueryList) {
            mediaQueryList.removeEventListener('change', () => {});
        }
    });
}
